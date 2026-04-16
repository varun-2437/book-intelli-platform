import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, BookOpen, LayoutGrid, List } from 'lucide-react';
import BookCard, { BookCardSkeleton } from '../components/BookCard';
import { fetchBooks } from '../services/api';

const GENRES = [
  'All', 'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
  'Fantasy', 'Thriller', 'Biography', 'History',
];

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('bookIntel_view') || 'grid');

  useEffect(() => {
    localStorage.setItem('bookIntel_view', viewMode);
  }, [viewMode]);

  const debouncedSearch = useDebounce(search);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBooks(page, debouncedSearch, genre === 'All' ? '' : genre);
      const data = res.data;
      setBooks(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 20));
    } catch (e) {
      setError('Failed to load library collection.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, genre]);

  useEffect(() => { loadBooks(); }, [loadBooks]);
  useEffect(() => { setPage(1); }, [debouncedSearch, genre]);

  const featuredBook = books[0]; // Simple featured book logic

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-12">
      
      {/* Search Bar - Full Width Editorial */}
      <div className="mb-16 max-w-4xl mx-auto">
        <label htmlFor="search-input" className="sr-only">Search library</label>
        <div className="relative">
          <input
            id="search-input"
            type="text"
            placeholder="Search the collection..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-border-color focus:border-accent focus:ring-0 text-center text-3xl font-serif text-primary-text placeholder-faint-text py-6 transition-colors"
          />
        </div>
      </div>

      {/* Genre Tabs */}
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-20">
        {GENRES.map(g => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`relative pb-2 text-[10px] uppercase tracking-[0.15em] transition-colors ${
              genre === g ? 'text-accent' : 'text-secondary-text hover:text-primary-text'
            }`}
          >
            {g}
            {genre === g && (
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Featured Hero Section */}
      {!loading && !search && genre === 'All' && page === 1 && featuredBook && (
        <div className="mb-24 flex flex-col md:flex-row gap-12 items-center border border-secondary-bg p-8 md:p-12 hover:border-border-color transition-colors">
          <div className="w-full md:w-1/3 flex-shrink-0">
            {featuredBook.cover_image_url ? (
              <img 
                src={featuredBook.cover_image_url} 
                alt={featuredBook.title}
                className="w-full aspect-[2/3] object-cover shadow-2xl"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-secondary-bg flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-border-color" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-6">
            <div className="text-[10px] uppercase tracking-widest text-accent">Featured Volume</div>
            <h2 className="text-4xl md:text-5xl font-serif text-primary-text leading-tight">{featuredBook.title}</h2>
            <div className="text-lg text-secondary-text font-serif italic text-balance">
              {featuredBook.ai_summary || featuredBook.description?.slice(0, 200) + '...'}
            </div>
            <a href={`/books/${featuredBook.id}`} className="inline-block border-b border-accent text-accent text-[10px] uppercase tracking-widest pb-1 hover:text-primary-text hover:border-primary-text transition-colors mt-4">
              Explore Title
            </a>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center border border-red-900/30 p-12 mb-12">
          <p className="text-red-400 font-serif mb-4">{error}</p>
          <button onClick={loadBooks} className="text-secondary-text border-b border-[#a0a0ab] text-xs uppercase tracking-widest pb-1 hover:text-primary-text">Retry</button>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex justify-between items-end border-b border-secondary-bg pb-4 mb-8">
        <h3 className="font-serif text-2xl text-primary-text hidden sm:block">Library Collection</h3>
        <div className="flex items-center gap-2 sm:ml-auto">
          <button aria-label="Grid view" onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'text-accent' : 'text-secondary-text hover:text-primary-text'}`}>
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button aria-label="List view" onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'text-accent' : 'text-secondary-text hover:text-primary-text'}`}>
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid/List Body */}
      {loading ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-16" : "flex flex-col gap-10"}>
          {Array.from({ length: 12 }).map((_, i) => <BookCardSkeleton key={i} viewMode={viewMode} />)}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-24 border-y border-secondary-bg">
          <h3 className="font-serif text-2xl text-primary-text mb-2">No volumes found</h3>
          <p className="text-secondary-text tracking-wide text-sm">Please adjust your search or category filters.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-16" : "flex flex-col gap-10"}>
          {books.map(book => <BookCard key={book.id} book={book} viewMode={viewMode} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between border-t border-secondary-bg mt-24 pt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-[10px] uppercase tracking-[0.2em] text-secondary-text hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-3 h-3" /> Previous
          </button>
          <span className="text-[10px] uppercase tracking-widest text-faint-text">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-[10px] uppercase tracking-[0.2em] text-secondary-text hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            Next <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
