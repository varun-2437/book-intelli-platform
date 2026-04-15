import os
from openai import OpenAI
import dotenv

dotenv.load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
base_url = os.environ.get("LM_STUDIO_URL", "http://localhost:1234/v1")
model_name = os.environ.get("LM_STUDIO_MODEL", "local-model")
api_key = os.environ.get("NVIDIA_API_KEY", "lm-studio")

client = OpenAI(base_url=base_url, api_key=api_key)

def call_lm(prompt, max_tokens=300):
    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=0.7
    )
    return response.choices[0].message.content.strip()

def generate_summary(book):
    prompt = f"You are a literary assistant. Write a 3-sentence summary of the book titled '{book.title}'. The book description is: {book.description}. Focus on the key themes and what makes it interesting."
    return call_lm(prompt)

def classify_genre(book):
    prompt = f"Based on the following book title and description, classify the genre into ONE of: Fiction, Non-Fiction, Mystery, Romance, Science Fiction, Fantasy, Thriller, Biography, Self-Help, History, Children, Horror, Adventure, Other.\nBook Title: {book.title}.\nDescription: {book.description}.\nRespond with ONLY the genre name, nothing else."
    return call_lm(prompt)

def analyze_sentiment(book):
    prompt = f"Analyze the sentiment of the following book description and respond with ONLY one word: Positive, Negative, or Neutral.\nDescription: {book.description}"
    return call_lm(prompt)

def get_recommendation_reason(book_a, book_b):
    prompt = f"In one sentence, explain why a reader who enjoyed '{book_a.title}' would also enjoy '{book_b.title}'."
    return call_lm(prompt)
