import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const fetchBooks = (page = 1, search = '', genre = '') => {
  const params = { page };
  if (search) params.search = search;
  if (genre) params.genre = genre;
  return api.get('/books/', { params });
};

export const fetchBookDetail = (id) => api.get(`/books/${id}/`);

export const fetchRecommendations = (id) => api.get(`/books/${id}/recommend/`);

export const uploadBook = (data) => api.post('/books/upload/', data);

export const askQuestion = (question) => api.post('/books/ask/', { question });

export default api;
