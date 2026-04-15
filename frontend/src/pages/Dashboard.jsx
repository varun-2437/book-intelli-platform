import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import BookCard, { BookCardSkeleton } from '../components/BookCard';
import { fetchBooks } from '../services/api';

const GENRES = [
  'All', 'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
  'Fantasy', 'Thriller', 'Biography', 'Self-Help', 'History', 'Children', 'Horror', 'Adventure',
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
  const [totalCount, setTotalCount] = useState(0);

  const debouncedSearch = useDebounce(search);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBooks(page, debouncedSearch, genre === 'All' ? '' : genre);
      const data = res.data;
      setBooks(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / 20));
    } catch (e) {
      setError('Failed to load books. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, genre]);

  useEffect(() => { loadBooks(); }, [loadBooks]);
  useEffect(() => { setPage(1); }, [debouncedSearch, genre]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Book Library</h1>
        <p className="text-gray-400 mt-1">
          {totalCount > 0 ? `${totalCount} books with AI-generated insights` : 'Discover AI-powered book insights'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            id="search-input"
            type="text"
            placeholder="Search books by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field w-full pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            id="genre-filter"
            value={genre}
            onChange={e => setGenre(e.target.value)}
            className="input-field pl-10 pr-8 appearance-none cursor-pointer min-w-40"
          >
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-6 text-center border-red-500/30 mb-6">
          <p className="text-red-400">{error}</p>
          <button onClick={loadBooks} className="btn-primary mt-3 text-sm">Retry</button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {Array.from({ length: 20 }).map((_, i) => <BookCardSkeleton key={i} />)}
        </div>
      ) : books.length === 0 ? (
        <div className="card p-16 text-center">
          <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400">No books found</h3>
          <p className="text-gray-600 mt-1">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {books.map(book => <BookCard key={book.id} book={book} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            id="prev-page"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm text-gray-400">
            Page <span className="text-white font-semibold">{page}</span> of {totalPages}
          </span>
          <button
            id="next-page"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
