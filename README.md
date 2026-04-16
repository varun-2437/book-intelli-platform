# 📚 Book Intelligence Platform

A full-stack AI-powered book intelligence platform built with **Django**, **React**, and **Tailwind CSS v4**. Features automated Selenium web scraping, agnostic LLM integration for book summarization and sentiment analysis, and an embedded **ChromaDB RAG pipeline** to chat with the book library.

---

## ✨ Features

- **Automated Web Scraping** — Selenium-powered scraper that collects book data (title, price, rating, description, cover image) from [books.toscrape.com](https://books.toscrape.com).
- **AI-Generated Insights** — Generates summaries, classifies genres, and analyzes sentiment for every book using any OpenAI-compatible LLM.
- **RAG-Powered Q&A** — Ask natural language questions about the book library. Uses ChromaDB vector embeddings + LLM to deliver accurate, cited answers.
- **Smart Recommendations** — Vector similarity search suggests books based on semantic content, not just keywords.
- **Modern React UI** — Dark-themed, responsive dashboard with search, genre filters, skeleton loaders, and smooth animations.
- **Model Agnostic** — Works with OpenAI, NVIDIA NIM, LM Studio, or any OpenAI-compatible API. Just change the `.env` file.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.12, Django 4.2, Django REST Framework |
| **Database** | MySQL |
| **Scraping** | Selenium, ChromeDriver (via webdriver-manager) |
| **AI / LLM** | OpenAI Python SDK (compatible with any OpenAI-style API) |
| **Embeddings** | Sentence Transformers (`all-MiniLM-L6-v2`) |
| **Vector Store** | ChromaDB |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 |
| **UI Libraries** | Lucide Icons, Framer Motion, React Hot Toast |

---

## 📂 Project Structure

```
book-intelligence-platform/
├── backend/
│   ├── ai/                  # LLM integration (summary, genre, sentiment)
│   ├── books/               # Django app (models, views, serializers, URLs)
│   │   └── management/
│   │       └── commands/    # CLI commands (scrape, generate_insights, index)
│   ├── config/              # Django settings & root URL config
│   ├── rag/                 # RAG pipeline (embedder, vector store, pipeline)
│   ├── scraper/             # Selenium web scraper
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (not tracked in git)
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, BookCard
│   │   ├── pages/           # Dashboard, BookDetail, QnA
│   │   └── services/        # Axios API layer
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm**
- **MySQL** (running locally)
- **Google Chrome** (for Selenium scraping)
- **OpenAI API Key** (or any OpenAI-compatible API key)

---

### 1. Clone the Repository

```bash
git clone https://github.com/varun-2437/book-intelli-platform.git
cd book-intelli-platform
```

### 2. Backend Setup

#### Create and activate a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows
```

#### Install Python dependencies

```bash
pip install -r backend/requirements.txt
```

#### Create the MySQL database

```sql
CREATE DATABASE book_intelligence;
```

#### Configure environment variables

Create a file at `backend/.env` with the following:

```env
DB_NAME=book_intelligence
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
LM_STUDIO_URL=https://api.openai.com/v1
LM_STUDIO_MODEL=gpt-4o-mini
NVIDIA_API_KEY=sk-your-openai-api-key-here
```

> **Note:** Despite the variable name `NVIDIA_API_KEY`, this accepts any OpenAI-compatible API key. You can use OpenAI (`https://api.openai.com/v1`), NVIDIA NIM (`https://integrate.api.nvidia.com/v1`), or a local LM Studio instance (`http://localhost:1234/v1`).

#### Run database migrations

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

#### Create an admin user (optional)

```bash
python manage.py createsuperuser
```

---

### 3. Populate the Database

#### Scrape books

```bash
python manage.py scrape_books --pages 2
```

#### Generate AI insights

```bash
python manage.py generate_insights
```

#### Index books into the vector store

```bash
python manage.py index_books
```

---

### 4. Frontend Setup

Open a **new terminal window**:

```bash
cd frontend
npm install
npm run dev
```

---

### 5. Start the Backend Server

In your **original terminal** (with venv activated):

```bash
cd backend
python manage.py runserver
```

---

### 6. Open the App

| Service | URL |
|---------|-----|
| **Frontend (React)** | [http://localhost:5173](http://localhost:5173) |
| **Backend API** | [http://localhost:8000/api/books/](http://localhost:8000/api/books/) |
| **Django Admin** | [http://localhost:8000/admin/](http://localhost:8000/admin/) |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/books/` | List all books (paginated, filterable) |
| `GET` | `/api/books/<id>/` | Get book details with AI insights |
| `GET` | `/api/books/<id>/recommend/` | Get similar book recommendations |
| `POST` | `/api/books/upload/` | Add a new book manually |
| `POST` | `/api/books/ask/` | Ask a question (RAG pipeline) |

### Query Parameters for `/api/books/`

| Parameter | Example | Description |
|-----------|---------|-------------|
| `search` | `?search=history` | Filter books by title |
| `genre` | `?genre=Fiction` | Filter by AI-classified genre |
| `page` | `?page=2` | Pagination |

### Ask AI Request Body

```json
{
  "question": "What are some good books about history?"
}
```

---

## 🤖 Switching LLM Providers

The platform is **model-agnostic**. To switch providers, simply update the `backend/.env` file:

#### OpenAI
```env
LM_STUDIO_URL=https://api.openai.com/v1
LM_STUDIO_MODEL=gpt-4o-mini
NVIDIA_API_KEY=sk-your-openai-key
```

#### NVIDIA NIM
```env
LM_STUDIO_URL=https://integrate.api.nvidia.com/v1
LM_STUDIO_MODEL=meta/llama-3.3-70b-instruct
NVIDIA_API_KEY=nvapi-your-nvidia-key
```

#### Local LM Studio
```env
LM_STUDIO_URL=http://localhost:1234/v1
LM_STUDIO_MODEL=local-model
NVIDIA_API_KEY=lm-studio
```

No code changes required.

---

## 📄 License

This project is for educational purposes as part of an internship assignment.
