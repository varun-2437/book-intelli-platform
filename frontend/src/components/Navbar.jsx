import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Sparkles, MessageSquareText, Moon, Sun } from 'lucide-react';

export default function Navbar({ onOpenDrawer }) {
  const { pathname } = useLocation();
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem('bookIntel_theme') === 'light';
  });

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light');
      localStorage.setItem('bookIntel_theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('bookIntel_theme', 'dark');
    }
  }, [isLight]);

  return (
    <nav className="sticky top-0 z-40 border-b border-secondary-bg bg-primary-bg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-1.5 transition-colors">
              <BookOpen className="w-6 h-6 text-primary-text group-hover:text-accent transition-colors" strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-2xl font-serif text-primary-text tracking-wide">BookIntel</span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest text-secondary-text mt-0.5">Librarian AI</span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest text-secondary-text mr-4">
              <Sparkles className="w-3 h-3 text-accent" />
              <span>NVIDIA NIM · GPT-OSS 120B</span>
            </div>
            
            <button
              onClick={() => setIsLight(!isLight)}
              className="p-2 border border-border-color hover:border-accent text-secondary-text hover:text-accent transition-all duration-300"
              aria-label="Toggle theme"
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            
            <button
              onClick={onOpenDrawer}
              className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-border-color hover:border-accent text-primary-text text-xs uppercase tracking-widest transition-colors duration-300 group"
            >
              <MessageSquareText className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span>Ask AI</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
