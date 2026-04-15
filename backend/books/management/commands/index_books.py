from django.core.management.base import BaseCommand
from books.models import Book
from rag.vector_store import index_book

class Command(BaseCommand):
    help = 'Index all processed books into ChromaDB'

    def handle(self, *args, **options):
        processed_books = Book.objects.filter(is_processed=True)
        total = processed_books.count()
        self.stdout.write(self.style.SUCCESS(f'Found {total} processed books to index...'))
        
        for idx, book in enumerate(processed_books, 1):
            self.stdout.write(f'Indexing {idx}/{total}: {book.title}')
            try:
                index_book(book)
                self.stdout.write(self.style.SUCCESS(f'Successfully indexed: {book.title}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Failed to index {book.title}. Error: {e}'))
                
        self.stdout.write(self.style.SUCCESS('Finished indexing books into ChromaDB!'))
