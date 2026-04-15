import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, Tag, BookOpen, ExternalLink, Loader2,
  Smile, Meh, Frown, ChevronRight, Sparkles
} from 'lucide-react';
import { fetchBookDetail, fetchRecommendations } from '../services/api';
import BookCard, { BookCardSkeleton } from '../components/BookCard';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-5 h-5 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-700 fill-gray-700'}`} />
      ))}
      <span className="ml-2 text-gray-300 font-medium">{rating?.toFixed(1)}</span>
    </div>
  );
}

function SentimentBadge({ sentiment }) {
  const map = {
    Positive: { icon: Smile, color: 'text-green-400 bg-green-400/10 border-green-400/20', label: 'Positive' },
    Negative: { icon: Frown, color: 'text-red-400 bg-red-400/10 border-red-400/20', label: 'Negative' },
    Neutral:  { icon: Meh,  color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', label: 'Neutral' },
  };
  const config = map[sentiment] || map['Neutral'];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium ${config.color}`}>
      <Icon className="w-4 h-4" /> {config.label}
    </span>
  );
}

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBookDetail(id)
      .then(res => setBook(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));

    setRecsLoading(true);
    fetchRecommendations(id)
      .then(res => setRecs(res.data?.data || []))
      .catch(() => setRecs([]))
      .finally(() => setRecsLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Library
      </button>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Left: Cover + Meta */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <div className="card overflow-hidden">
            {book.cover_image_url ? (
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="w-full object-cover"
                style={{ maxHeight: '420px', objectPosition: 'top' }}
              />
            ) : (
              <div className="h-80 flex items-center justify-center bg-gray-800">
                <BookOpen className="w-24 h-24 text-gray-600" />
              </div>
            )}
          </div>

          {/* Metadata card */}
          <div className="card p-5 flex flex-col gap-4">
            <div>
              <h1 className="text-xl font-bold text-white leading-snug">{book.title}</h1>
              <p className="text-gray-400 mt-1">{book.author}</p>
            </div>
            <StarRating rating={book.rating} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-800 rounded-xl p-3">
                <div className="text-gray-500 text-xs mb-1">Price</div>
                <div className="text-white font-semibold">{book.price || '—'}</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-3">
                <div className="text-gray-500 text-xs mb-1">Availability</div>
                <div className={`font-semibold text-xs ${book.availability?.toLowerCase().includes('in stock') ? 'text-green-400' : 'text-red-400'}`}>
                  {book.availability || '—'}
                </div>
              </div>
            </div>
            {book.book_url && (
              <a
                href={book.book_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> View on bookstoread.com
              </a>
            )}
          </div>
        </div>

        {/* Right: Description + AI Panel */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Description */}
          {book.description && (
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Description</h2>
              <p className="text-gray-300 leading-relaxed text-sm">{book.description}</p>
            </div>
          )}

          {/* AI Insights Panel */}
          <div className="card p-6 border-brand-500/20 bg-gradient-to-br from-gray-900 to-gray-900/50">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-bold text-white">AI Insights</h2>
            </div>

            {!book.is_processed ? (
              <div className="flex items-center gap-3 text-gray-400 py-4">
                <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                <span>Generating AI insights...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* Summary */}
                {book.ai_summary && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">📖 AI Summary</div>
                    <p className="text-gray-300 text-sm leading-relaxed bg-gray-800/60 rounded-xl p-4">{book.ai_summary}</p>
                  </div>
                )}

                {/* Genre + Sentiment */}
                <div className="flex flex-wrap gap-4">
                  {book.ai_genre && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">🏷️ Genre</div>
                      <span className="badge bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        <Tag className="w-3 h-3 mr-1" />{book.ai_genre}
                      </span>
                    </div>
                  )}
                  {book.ai_sentiment && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">💬 Sentiment</div>
                      <SentimentBadge sentiment={book.ai_sentiment} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-xl font-bold text-white">You Might Also Like</h2>
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </div>
        {recsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => <BookCardSkeleton key={i} />)}
          </div>
        ) : recs.length === 0 ? (
          <div className="card p-8 text-center text-gray-500">No recommendations yet — run the index_books command first.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recs.map(rec => <BookCard key={rec.id} book={rec} />)}
          </div>
        )}
      </div>
    </div>
  );
}
