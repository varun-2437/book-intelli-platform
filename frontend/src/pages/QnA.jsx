import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Loader2, Bot, User, Trash2, BookOpen, Sparkles, Copy, Check } from 'lucide-react';
import { askQuestion } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

function ChatBubble({ entry }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* User Question */}
      <div className="flex justify-end">
        <div className="flex items-start gap-2.5 max-w-[80%]">
          <div className="bg-brand-600 rounded-2xl rounded-tr-sm px-4 py-3 text-white text-sm leading-relaxed">
            {entry.question}
          </div>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center mt-0.5">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* AI Answer */}
      <div className="flex justify-start">
        <div className="flex items-start gap-2.5 max-w-[85%]">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mt-0.5">
            <Bot className="w-4 h-4 text-brand-400" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="card px-4 py-3 text-sm text-gray-200 leading-relaxed rounded-2xl rounded-tl-sm">
              {entry.answer}
            </div>

            {/* Sources */}
            {entry.sources?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-600">Sources:</span>
                {entry.sources.map(src => (
                  <Link
                    key={src.book_id}
                    to={`/books/${src.book_id}`}
                    className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-brand-300 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <BookOpen className="w-3 h-3" />
                    {src.title?.length > 30 ? src.title.slice(0, 30) + '…' : src.title}
                  </Link>
                ))}
              </div>
            )}

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors self-start"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy answer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  'Which books would a mystery lover enjoy?',
  'Recommend a book with a positive sentiment',
  'What are some highly rated fiction books?',
  'Tell me about adventure and travel books',
];

const STORAGE_KEY = 'bookIntel_chat_history';

export default function QnA() {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const handleAsk = async (q) => {
    const text = (q || question).trim();
    if (!text || loading) return;
    setQuestion('');
    setLoading(true);
    try {
      const res = await askQuestion(text);
      const result = res.data?.data || res.data;
      setHistory(prev => [...prev, { question: text, answer: result.answer, sources: result.sources || [] }]);
    } catch (err) {
      const msg = err.response?.data?.error || 'AI service unavailable. Make sure the backend is running.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Chat cleared!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' } }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-600">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Ask AI</h1>
            <p className="text-sm text-gray-500">RAG-powered book recommendations</p>
          </div>
        </div>
        {history.length > 0 && (
          <button
            id="clear-chat"
            onClick={clearHistory}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/10"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-6 mb-5 pr-1">
        {history.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-6">
            <div className="text-center">
              <Bot className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500">Ask me anything about books</h3>
              <p className="text-sm text-gray-600 mt-1">I'll search through our library using AI</p>
            </div>
            {/* Suggestion chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleAsk(s)}
                  className="text-left text-sm card px-4 py-3 text-gray-400 hover:text-white hover:border-brand-500/40 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {history.map((entry, i) => <ChatBubble key={i} entry={entry} />)}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="card px-5 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2 text-gray-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <div className="card p-3 flex items-end gap-3 border-gray-700">
          <textarea
            id="question-input"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about books, genres, recommendations..."
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm text-white placeholder-gray-600 focus:outline-none leading-relaxed max-h-40"
            style={{ minHeight: '24px' }}
            disabled={loading}
          />
          <button
            id="ask-button"
            onClick={() => handleAsk()}
            disabled={!question.trim() || loading}
            className="btn-primary flex items-center gap-2 flex-shrink-0 py-2 px-4"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Ask</span>
          </button>
        </div>
        <p className="text-xs text-gray-600 text-center mt-2">
          Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-800 rounded border border-gray-700">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 text-xs bg-gray-800 rounded border border-gray-700">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
