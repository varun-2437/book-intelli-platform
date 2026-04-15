from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=500)
    author = models.CharField(max_length=300, default='Unknown')
    rating = models.FloatField(null=True, blank=True)
    num_reviews = models.IntegerField(default=0)
    description = models.TextField(blank=True)
    genre = models.CharField(max_length=200, blank=True)
    price = models.CharField(max_length=50, blank=True)
    availability = models.CharField(max_length=100, blank=True)
    book_url = models.URLField(max_length=1000)
    cover_image_url = models.URLField(max_length=1000, blank=True)
    ai_summary = models.TextField(blank=True)
    ai_genre = models.CharField(max_length=200, blank=True)
    ai_sentiment = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False)

    def __str__(self):
        return self.title
