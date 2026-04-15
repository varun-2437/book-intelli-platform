from rest_framework import serializers
from .models import Book

class BookListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'rating', 'num_reviews', 'genre', 'price',
            'availability', 'book_url', 'cover_image_url', 'ai_genre'
        ]

class BookDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'
