from django.urls import path
from .views import BookListView, BookDetailView, BookRecommendView, BookUploadView, BookAskView

urlpatterns = [
    path('', BookListView.as_view(), name='book-list'),
    path('<int:pk>/', BookDetailView.as_view(), name='book-detail'),
    path('<int:pk>/recommend/', BookRecommendView.as_view(), name='book-recommend'),
    path('upload/', BookUploadView.as_view(), name='book-upload'),
    path('ask/', BookAskView.as_view(), name='book-ask'),
]
