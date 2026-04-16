import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

import django

# Setup Django if not already set up
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from books.models import Book

RATING_MAP = {
    'One': 1.0,
    'Two': 2.0,
    'Three': 3.0,
    'Four': 4.0,
    'Five': 5.0
}

def get_driver():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

def scrape(pages=5):
    driver = get_driver()
    base_url = "https://books.toscrape.com/catalogue/"
    
    for page in range(1, pages + 1):
        print(f"Scraping page {page}...")
        url = f"{base_url}page-{page}.html"
        driver.get(url)
        time.sleep(1) # Let it load
        
        books_on_page = []
        articles = driver.find_elements(By.CSS_SELECTOR, "article.product_pod")
        
        for article in articles:
            try:
                a_tag = article.find_element(By.CSS_SELECTOR, "h3 a")
                title = a_tag.get_attribute("title")
                book_rel_url = a_tag.get_attribute("href")
                
                price_text = article.find_element(By.CSS_SELECTOR, ".price_color").text
                
                rating_class = article.find_element(By.CSS_SELECTOR, "p.star-rating").get_attribute("class")
                rating_word = rating_class.split()[-1]
                rating = RATING_MAP.get(rating_word, 0.0)
                
                availability = article.find_element(By.CSS_SELECTOR, ".availability").text.strip()
                
                img_tag = article.find_element(By.CSS_SELECTOR, "img.thumbnail")
                img_url = img_tag.get_attribute("src")
                
                books_on_page.append({
                    "title": title,
                    "book_url": book_rel_url,
                    "price": price_text,
                    "rating": rating,
                    "availability": availability,
                    "cover_image_url": img_url
                })
            except Exception as e:
                print(f"Error parsing book card: {e}")
                
        # Now visit each book's page to get description and full-res image
        for b in books_on_page:
            try:
                driver.get(b["book_url"])
                try:
                    desc_element = driver.find_element(By.CSS_SELECTOR, "#product_description ~ p")
                    description = desc_element.text
                except:
                    description = ""
                
                # Get full-resolution cover image from the detail page
                try:
                    detail_img = driver.find_element(By.CSS_SELECTOR, "#product_gallery img")
                    full_img_url = detail_img.get_attribute("src")
                    if full_img_url:
                        b["cover_image_url"] = full_img_url
                except:
                    pass  # Keep the thumbnail URL as fallback
                
                num_reviews = 0 # Defaulting
                
                Book.objects.update_or_create(
                    book_url=b["book_url"],
                    defaults={
                        "title": b["title"],
                        "price": b["price"],
                        "rating": b["rating"],
                        "availability": b["availability"],
                        "cover_image_url": b["cover_image_url"],
                        "description": description,
                        "num_reviews": num_reviews,
                        "author": "Unknown" 
                    }
                )
                print(f"Saved: {b['title']}")
            except Exception as e:
                print(f"Error fetching details for {b['title']}: {e}")
                
    driver.quit()
    print("Scraping completed!")

if __name__ == "__main__":
    # Multi-page scraping pipeline: default 5 pages (100 books)
    # Usage: python scrape_books.py [num_pages]
    scrape_pages = 5
    if len(sys.argv) > 1:
        scrape_pages = int(sys.argv[1])
    print(f"🔄 Bulk scraping pipeline: {scrape_pages} pages ({scrape_pages * 20} books)")
    scrape(scrape_pages)
