import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import BookDetail from './pages/BookDetail';
import AIDrawer from './components/AIDrawer';

export default function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-primary-bg text-primary-text font-sans selection:bg-accent/30 selection:text-primary-text">
        <Navbar onOpenDrawer={() => setIsDrawerOpen(true)} />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/books/:id" element={<BookDetail />} />
          </Routes>
        </main>
        
        <AIDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
        />

        <Toaster
          position="top-center"
          toastOptions={{
            style: { 
              background: '#0a0a0f', 
              color: '#f5f0e8', 
              border: '1px solid #333344',
              borderRadius: '0',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}
