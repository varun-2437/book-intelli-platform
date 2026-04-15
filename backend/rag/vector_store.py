import os
import chromadb
from .embedder import embed_text

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "chroma_db")

client = chromadb.PersistentClient(path=DB_PATH)
collection = client.get_or_create_collection("books")

def index_book(book):
    text = f"{book.title}. {book.description}. Genre: {book.ai_genre}"
    embedding = embed_text(text)
    collection.add(
        ids=[str(book.id)],
        embeddings=[embedding],
        metadatas=[{"title": book.title, "author": book.author, "book_id": book.id}],
        documents=[text]
    )

def search_similar(query_text, n_results=5):
    query_embedding = embed_text(query_text)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    return results
