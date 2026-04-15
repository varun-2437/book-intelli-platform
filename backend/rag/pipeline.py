from .vector_store import search_similar
from ai.insights import call_lm

def answer_question(user_question):
    try:
        results = search_similar(user_question, n_results=5)
    except Exception as e:
        print(f"Error searching ChromaDB: {e}")
        return {"answer": "Sorry, there was an issue querying the database.", "sources": []}
    
    context_parts = []
    sources = []
    
    if results and 'documents' in results and results['documents'] and results['documents'][0]:
        for i, doc in enumerate(results['documents'][0]):
            meta = results['metadatas'][0][i]
            context_parts.append(f"Book: {meta['title']}\n{doc}")
            if meta['book_id'] not in [s['book_id'] for s in sources]:
                sources.append({"title": meta['title'], "book_id": meta['book_id']})
    
    if not context_parts:
        return {"answer": "I couldn't find any relevant books to answer your question.", "sources": []}
        
    context = "\n\n".join(context_parts)
    
    prompt = f"""You are a helpful book assistant. Using only the book information
provided below, answer the user's question accurately. Cite the book titles in your answer.

BOOK INFORMATION:
{context}

USER QUESTION: {user_question}

Answer:"""
    
    try:
        answer = call_lm(prompt, max_tokens=500)
    except Exception as e:
        print(f"Error querying LM: {e}")
        return {"answer": "AI service unavailable. Please ensure LM Studio is running.", "sources": sources}
    
    return {
        "answer": answer,
        "sources": sources
    }
