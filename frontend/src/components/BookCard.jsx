import { useNavigate } from 'react-router-dom';
import { Star, Tag, BookOpen, DollarSign } from 'lucide-react';

const GENRE_COLORS = {
  Fiction:         'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Non-Fiction':   'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Mystery:         'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Romance:         'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'Science Fiction':'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  Fantasy:         'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Thriller:        'bg-red-500/20 text-red-300 border-red-500/30',
  Biography:       'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Self-Help':     'bg-teal-500/20 text-teal-300 border-teal-500/30',
  History:         'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Children:        'bg-lime-500/20 text-lime-300 border-lime-500/30',
  Horror:          'bg-rose-500/20 text-rose-300 border-rose-500/30',
  Adventure:       'bg-sky-500/20 text-sky-300 border-sky-500/30',
};

const DEFAULT_GENRE_COLOR = 'bg-gray-500/20 text-gray-300 border-gray-500/30';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-700 fill-gray-700'}`}
        />
      ))}
      <span className="text-xs text-gray-400 ml-1">{rating?.toFixed(1)}</span>
    </div>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="skeleton h-56 w-full rounded-none" />
      <div className="p-4 flex flex-col gap-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export default function BookCard({ book }) {
  const navigate = useNavigate();
  const genreColor = GENRE_COLORS[book.ai_genre] || DEFAULT_GENRE_COLOR;

  return (
    <div
      onClick={() => navigate(`/books/${book.id}`)}
      className="card overflow-hidden flex flex-col cursor-pointer group hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Cover Image */}
      <div className="relative overflow-hidden h-56 bg-gray-800 flex-shrink-0">
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-gray-700" />
          </div>
        )}
        {/* Price Badge */}
        {book.price && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white/10">
            {book.price}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div>
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 group-hover:text-brand-300 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1 truncate">{book.author}</p>
        </div>

        <StarRating rating={book.rating} />

        <div className="flex items-center justify-between mt-auto pt-1">
          {(book.ai_genre || book.genre) && (
            <span className={`badge border ${genreColor}`}>
              <Tag className="w-2.5 h-2.5 mr-1" />
              {book.ai_genre || book.genre}
            </span>
          )}
          <span className={`text-xs font-medium ml-auto ${
            book.availability?.toLowerCase().includes('in stock') ? 'text-green-400' : 'text-red-400'
          }`}>
            {book.availability?.includes('In stock') || book.availability?.toLowerCase().includes('in stock') ? '● In Stock' : '○ Out of Stock'}
          </span>
        </div>
      </div>
    </div>
  );
}
