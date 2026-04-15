import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import BookDetail from './pages/BookDetail';
import QnA from './pages/QnA';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/ask" element={<QnA />} />
          </Routes>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' },
          }}
        />
      </div>
    </BrowserRouter>
  );
}
