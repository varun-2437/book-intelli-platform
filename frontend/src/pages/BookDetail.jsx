import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, ExternalLink, Loader2,
  ChevronRight, ChevronLeft, Sparkles
} from 'lucide-react';
import { fetchBookDetail, fetchRecommendations, fetchBooks } from '../services/api';
import BookCard, { BookCardSkeleton } from '../components/BookCard';

function TextRating({ rating }) {
  if (!rating) return null;
  return (
    <div className="text-xs text-secondary-text uppercase tracking-widest mt-1 pb-4 border-b border-secondary-bg">
      • {rating?.toFixed(1)} / 5 Rating
    </div>
  );
}

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(true);
  const [bookIds, setBookIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Fetch all book IDs once for prev/next navigation
  useEffect(() => {
    fetchBooks(1, '', '', 100)
      .then(res => {
        const ids = (res.data.results || []).map(b => b.id);
        setBookIds(ids);
      })
      .catch(() => {});
  }, []);

  // Update current index when bookIds or id changes
  useEffect(() => {
    if (bookIds.length > 0) {
      setCurrentIndex(bookIds.indexOf(Number(id)));
    }
  }, [bookIds, id]);

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

  const prevBookId = currentIndex > 0 ? bookIds[currentIndex - 1] : null;
  const nextBookId = currentIndex >= 0 && currentIndex < bookIds.length - 1 ? bookIds[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 flex justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-12">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between mb-12 border-b border-secondary-bg pb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-secondary-text hover:text-primary-text transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Index
        </button>

        {/* Prev / Next Buttons */}
        {bookIds.length > 0 && (
          <div className="flex items-center gap-6">
            <button
              onClick={() => prevBookId && navigate(`/books/${prevBookId}`)}
              disabled={!prevBookId}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-secondary-text hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3 h-3" /> Prev
            </button>
            <span className="text-[10px] uppercase tracking-widest text-faint-text">
              {currentIndex >= 0 ? `${currentIndex + 1} / ${bookIds.length}` : ''}
            </span>
            <button
              onClick={() => nextBookId && navigate(`/books/${nextBookId}`)}
              disabled={!nextBookId}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-secondary-text hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
        {/* Left: Cover */}
        <div className="lg:col-span-4">
          <div className="sticky top-28">
            {book.cover_image_url ? (
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="w-full object-cover shadow-2xl"
                style={{ objectPosition: 'top' }}
              />
            ) : (
              <div className="w-full aspect-[2/3] flex items-center justify-center bg-secondary-bg">
                <BookOpen className="w-16 h-16 text-border-color" />
              </div>
            )}
            
            {book.book_url && (
              <a
                href={book.book_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-accent border border-accent hover:bg-accent hover:text-[#0a0a0f] py-3 transition-colors w-full"
              >
                <ExternalLink className="w-3 h-3" /> View Retailer
              </a>
            )}
          </div>
        </div>

        {/* Right: Content */}
        <div className="lg:col-span-8 flex flex-col gap-12 pt-4">
          {/* Header */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-accent mb-4">Volume {book.id}</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-primary-text leading-[1.1] mb-6">{book.title}</h1>
            <p className="text-xl font-serif italic text-secondary-text">{book.author}</p>
            <div className="mt-8">
              <TextRating rating={book.rating} />
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-4 mt-4 text-[10px] uppercase tracking-widest text-faint-text">
              <div><span className="text-secondary-text">Price:</span> {book.price || '—'}</div>
              <div><span className="text-secondary-text">Status:</span> <span className={book.availability?.toLowerCase().includes('in stock') ? 'text-accent' : 'text-red-900'}>{book.availability || '—'}</span></div>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div className="prose prose-invert max-w-none">
              <p className="font-serif text-primary-text/80 text-lg leading-relaxed">{book.description}</p>
            </div>
          )}

          {/* AI Insights Panel */}
          <div className="mt-8 border-t border-b border-secondary-bg py-12">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-4 h-4 text-accent" />
              <h2 className="text-2xl font-serif text-primary-text">Editorial Insights</h2>
            </div>

            {!book.is_processed ? (
              <div className="flex items-center gap-3 text-secondary-text py-4 text-xs uppercase tracking-widest">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                <span>Generating insights...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Summary (Takes up 2 cols) */}
                {book.ai_summary && (
                  <div className="md:col-span-2">
                    <div className="text-[10px] uppercase tracking-widest text-faint-text mb-4">Synopsis</div>
                    <p className="font-serif italic text-secondary-text text-lg leading-relaxed text-balance">
                      "{book.ai_summary}"
                    </p>
                  </div>
                )}

                {/* Metadata (Takes up 1 col) */}
                <div className="flex flex-col gap-8 md:col-span-1">
                  {book.ai_genre && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-faint-text mb-2">Category</div>
                      <div className="text-primary-text text-sm">{book.ai_genre}</div>
                    </div>
                  )}
                  {book.ai_sentiment && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-faint-text mb-2">Tone</div>
                      <div className="text-primary-text text-sm">{book.ai_sentiment}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-32 border-t border-secondary-bg pt-12">
        <h2 className="text-2xl font-serif text-primary-text mb-12 text-center">Curated Selection</h2>
        
        {recsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12">
            {Array.from({ length: 5 }).map((_, i) => <BookCardSkeleton key={i} />)}
          </div>
        ) : recs.length === 0 ? (
          <div className="text-center text-faint-text font-serif text-lg italic">More titles arriving soon.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12">
            {recs.map(rec => <BookCard key={rec.id} book={rec} />)}
          </div>
        )}
      </div>
    </div>
  );
}
