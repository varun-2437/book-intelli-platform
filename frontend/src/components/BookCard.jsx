import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

function TextRating({ rating }) {
  if (!rating) return null;
  return (
    <div className="text-[10px] text-secondary-text uppercase tracking-widest mt-1">
      • {rating?.toFixed(1)} / 5
    </div>
  );
}

export function BookCardSkeleton({ viewMode = 'grid' }) {
  return (
    <div className={`card flex pt-4 ${viewMode === 'list' ? 'flex-col sm:flex-row gap-8 items-start' : 'flex-col'}`}>
      <div className={`skeleton flex-shrink-0 ${viewMode === 'list' ? 'w-32 sm:w-40 h-[192px] sm:h-[240px]' : 'h-[300px] w-full'}`} />
      <div className={`mt-6 flex flex-col gap-3 w-full ${viewMode === 'list' ? 'sm:mt-0 flex-1' : ''}`}>
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-1/3" />
      </div>
    </div>
  );
}

export default function BookCard({ book, viewMode = 'grid' }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/books/${book.id}`)}
      className={`card flex cursor-pointer group pt-4 ${viewMode === 'list' ? 'flex-col sm:flex-row gap-8 items-start' : 'flex-col'}`}
    >
      {/* Cover Image */}
      <div className={`relative overflow-hidden bg-secondary-bg flex-shrink-0 flex items-center justify-center ${viewMode === 'list' ? 'w-32 sm:w-40 aspect-[2/3]' : 'aspect-[2/3] w-full'}`}>
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-full object-cover transition-all duration-700 filter group-hover:brightness-110 group-hover:scale-[1.02]"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-border-color" />
          </div>
        )}
        
        {/* Price Badge - Subtle text, no box */}
        {book.price && (
          <div className="absolute top-0 right-0 p-3 bg-gradient-to-bl from-black/80 to-transparent">
            <span className="text-[10px] text-primary-text uppercase tracking-widest">{book.price}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={`mt-6 flex flex-col flex-1 w-full ${viewMode === 'list' ? 'sm:mt-0 h-full justify-between' : ''}`}>
        <div>
          <h3 className="font-serif text-lg text-primary-text leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {book.title}
        </h3>
        
        <p className="text-sm font-serif italic text-secondary-text mt-2 truncate">
          {book.author}
        </p>

        <TextRating rating={book.rating} />
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-secondary-bg">
          <span className="text-[10px] uppercase tracking-widest text-faint-text group-hover:text-secondary-text transition-colors">
            {book.ai_genre || book.genre || 'Unknown'}
          </span>
          <span className={`text-[10px] uppercase tracking-widest ${
            book.availability?.toLowerCase().includes('in stock') ? 'text-secondary-text' : 'text-red-900'
          }`}>
            {book.availability?.toLowerCase().includes('in stock') ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
    </div>
  );
}
