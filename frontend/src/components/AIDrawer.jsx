import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Loader2, Bot, User, X, BookOpen, Copy, Check } from 'lucide-react';
import { askQuestion } from '../services/api';
import toast from 'react-hot-toast';

function ChatBubble({ entry }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 pb-6 border-b border-secondary-bg last:border-0 relative group">
      {/* User Question */}
      <div className="flex justify-end pl-8">
        <div className="text-right">
          <div className="font-serif text-primary-text text-lg leading-relaxed mb-1">
            "{entry.question}"
          </div>
          <div className="text-[10px] uppercase tracking-widest text-secondary-text">You</div>
        </div>
      </div>

      {/* AI Answer */}
      <div className="flex justify-start pr-8">
        <div>
          <div className="text-secondary-text text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-accent" />
            BookIntel AI
          </div>
          <div className="text-primary-text/90 text-sm leading-loose">
            {entry.answer}
          </div>

          {/* Sources */}
          {entry.sources?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-secondary-bg">
              <span className="text-[10px] uppercase tracking-widest text-secondary-text block mb-2">Sources Referenced:</span>
              <div className="flex flex-wrap gap-2">
                {entry.sources.map(src => (
                  <Link
                    key={src.book_id}
                    to={`/books/${src.book_id}`}
                    className="flex items-center gap-1.5 text-xs text-accent hover:text-primary-text transition-colors border border-secondary-bg hover:border-border-color px-3 py-1.5"
                  >
                    <BookOpen className="w-3 h-3" />
                    {src.title?.length > 30 ? src.title.slice(0, 30) + '…' : src.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-faint-text hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
          >
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
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

export default function AIDrawer({ isOpen, onClose }) {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, loading, isOpen]);

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
      toast.error('AI service unavailable.');
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
    toast.success('Chat cleared');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-primary-bg/80 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-primary-bg border-l border-secondary-bg z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-black/50' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-secondary-bg flex-shrink-0">
          <div>
            <h2 className="font-serif text-xl tracking-wide text-primary-text">BookIntel AI</h2>
            <p className="text-[10px] uppercase tracking-widest text-secondary-text mt-1">Librarian Assistant</p>
          </div>
          <div className="flex items-center gap-4">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-[10px] uppercase tracking-widest text-faint-text hover:text-red-400 transition-colors"
              >
                Clear
              </button>
            )}
            <button onClick={onClose} className="text-secondary-text hover:text-primary-text transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-20 scrollbar-hide">
          <div className="flex flex-col gap-10">
            {history.length === 0 && !loading ? (
              <div className="flex flex-col h-full items-center justify-center pt-20">
                <Bot className="w-12 h-12 text-accent/30 mb-6" />
                <h3 className="font-serif text-2xl text-primary-text mb-2 text-center">How can I assist you?</h3>
                <p className="text-sm text-secondary-text text-center max-w-xs mb-10 leading-relaxed">
                  I can search the library, find specific genres, or recommend books based on your taste.
                </p>
                <div className="w-full space-y-3">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => handleAsk(s)}
                      className="w-full text-left text-xs bg-transparent border border-secondary-bg hover:border-border-color px-4 py-3 text-secondary-text hover:text-primary-text transition-colors leading-relaxed"
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
                    <div>
                      <div className="text-secondary-text text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-accent" />
                        Thinking
                      </div>
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>

        {/* Input */}
        <div className="px-6 py-5 border-t border-secondary-bg bg-primary-bg flex-shrink-0">
          <div className="flex items-end gap-3 border-b border-border-color focus-within:border-[#f5f0e8] transition-colors py-2">
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              rows={1}
              className="flex-1 bg-transparent resize-none text-[15px] font-serif text-primary-text placeholder-faint-text focus:outline-none leading-relaxed max-h-32"
              style={{ minHeight: '28px' }}
              disabled={loading}
            />
            <button
              onClick={() => handleAsk()}
              disabled={!question.trim() || loading}
              className="mb-1 text-accent disabled:text-faint-text disabled:cursor-not-allowed hover:text-primary-text transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
