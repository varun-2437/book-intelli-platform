from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Book
from .serializers import BookListSerializer, BookDetailSerializer
from rest_framework.pagination import PageNumberPagination
from ai.insights import generate_summary, classify_genre, analyze_sentiment
from rag.vector_store import search_similar, index_book
from rag.pipeline import answer_question

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class BookListView(generics.ListAPIView):
    queryset = Book.objects.all().order_by('-created_at')
    serializer_class = BookListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        genre = self.request.query_params.get('genre')
        search = self.request.query_params.get('search')
        
        if genre:
            queryset = queryset.filter(ai_genre__icontains=genre)
        if search:
            queryset = queryset.filter(title__icontains=search)
            
        return queryset

class BookDetailView(generics.RetrieveAPIView):
    queryset = Book.objects.all()
    serializer_class = BookDetailSerializer

    def get_object(self):
        book = super().get_object()
        # If it's not processed, process it inline
        if not book.is_processed:
            try:
                if not book.ai_summary:
                    book.ai_summary = generate_summary(book)
                if not book.ai_genre:
                    book.ai_genre = classify_genre(book)
                if not book.ai_sentiment:
                    book.ai_sentiment = analyze_sentiment(book)
                book.is_processed = True
                book.save()
                index_book(book)
            except Exception as e:
                print(f"Error processing book inline: {e}")
        return book

class BookRecommendView(APIView):
    def get(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
            # Find similar books
            results = search_similar(book.description or book.title, n_results=6)
            
            recommendations = []
            if results and 'metadatas' in results and results['metadatas']:
                for meta in results['metadatas'][0]:
                    if meta['book_id'] != book.id: # Exclude self
                        rec_book = Book.objects.filter(pk=meta['book_id']).first()
                        if rec_book:
                            recommendations.append(rec_book)
                            if len(recommendations) == 5:
                                break
                                
            serializer = BookListSerializer(recommendations, many=True)
            return Response({"success": True, "data": serializer.data})
        except Book.DoesNotExist:
            return Response({"success": False, "error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

class BookUploadView(APIView):
    def post(self, request):
        serializer = BookDetailSerializer(data=request.data)
        if serializer.is_valid():
            book = serializer.save()
            try:
                book.ai_summary = generate_summary(book)
                book.ai_genre = classify_genre(book)
                book.ai_sentiment = analyze_sentiment(book)
                book.is_processed = True
                book.save()
                index_book(book)
            except Exception as e:
                print(f"Error in async processing: {e}")
                
            return Response({"success": True, "data": BookDetailSerializer(book).data}, status=status.HTTP_201_CREATED)
        return Response({"success": False, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class BookAskView(APIView):
    def post(self, request):
        question = request.data.get('question')
        if not question:
            return Response({"success": False, "error": "Question is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        result = answer_question(question)
        if not result['sources'] and result['answer'].startswith('AI service unavailable'):
             return Response({"success": False, "error": result['answer']}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
             
        return Response({"success": True, "data": result})
