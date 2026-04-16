import os
import chromadb
from .embedder import embed_text

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "chroma_db")

client = chromadb.PersistentClient(path=DB_PATH)
collection = client.get_or_create_collection("books")


def chunk_text(text, chunk_size=200, overlap=50):
    """
    Advanced chunking strategy: splits text into overlapping windows
    of ~chunk_size words with ~overlap words shared between consecutive
    chunks. This improves retrieval accuracy by preserving context at
    chunk boundaries.
    """
    words = text.split()
    if len(words) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        if end >= len(words):
            break
        start += chunk_size - overlap  # slide forward with overlap
    return chunks


def index_book(book):
    """Index a book using semantic chunking with overlapping windows."""
    full_text = f"{book.title}. {book.description or ''}. Genre: {book.ai_genre or 'Unknown'}. Sentiment: {book.ai_sentiment or 'Unknown'}."

    chunks = chunk_text(full_text, chunk_size=200, overlap=50)

    for i, chunk in enumerate(chunks):
        chunk_id = f"{book.id}_chunk_{i}"
        embedding = embed_text(chunk)
        collection.upsert(
            ids=[chunk_id],
            embeddings=[embedding],
            metadatas=[{
                "title": book.title,
                "author": book.author,
                "book_id": book.id,
                "chunk_index": i,
                "total_chunks": len(chunks)
            }],
            documents=[chunk]
        )


def search_similar(query_text, n_results=5):
    query_embedding = embed_text(query_text)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    return results
