import { Link, useLocation } from 'react-router-dom';
import { BookOpen, MessageSquare, LayoutGrid, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { pathname } = useLocation();

  const navItems = [
    { to: '/', icon: LayoutGrid, label: 'Dashboard' },
    { to: '/ask', icon: MessageSquare, label: 'Ask AI' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-brand-600 group-hover:bg-brand-700 transition-colors">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">BookIntel</span>
              <span className="hidden sm:inline text-xs text-gray-500 block -mt-1">AI-Powered Platform</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Badge */}
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Powered by GPT OSS 120B</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
