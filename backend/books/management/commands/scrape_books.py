from django.core.management.base import BaseCommand
from scraper.scrape_books import scrape

class Command(BaseCommand):
    help = 'Scrapes books from books.toscrape.com'

    def add_arguments(self, parser):
        parser.add_argument('--pages', type=int, default=5, help='Number of pages to scrape')

    def handle(self, *args, **options):
        pages = options.get('pages', 5)
        self.stdout.write(self.style.SUCCESS(f'Starting to scrape {pages} pages...'))
        scrape(pages=pages)
        self.stdout.write(self.style.SUCCESS('Finished scraping.'))
