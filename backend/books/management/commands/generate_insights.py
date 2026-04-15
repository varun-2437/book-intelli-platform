from django.core.management.base import BaseCommand
from books.models import Book
from ai.insights import generate_summary, classify_genre, analyze_sentiment

class Command(BaseCommand):
    help = 'Generates AI insights for all unprocessed books using local LM Studio'

    def handle(self, *args, **options):
        # We only want to process books that need processing
        unprocessed_books = Book.objects.filter(is_processed=False)
        total = unprocessed_books.count()
        self.stdout.write(self.style.SUCCESS(f'Found {total} books to process...'))
        
        for idx, book in enumerate(unprocessed_books, 1):
            self.stdout.write(f'Processing {idx}/{total}: {book.title}')
            try:
                if not book.ai_summary:
                    book.ai_summary = generate_summary(book)
                if not book.ai_genre:
                    book.ai_genre = classify_genre(book)
                if not book.ai_sentiment:
                    book.ai_sentiment = analyze_sentiment(book)
                
                book.is_processed = True
                book.save()
                self.stdout.write(self.style.SUCCESS(f'Successfully processed: {book.title}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Failed to process {book.title}. Error: {e}'))
                
        self.stdout.write(self.style.SUCCESS('Finished generating AI insights!'))
