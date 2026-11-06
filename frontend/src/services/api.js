import axios from 'axios';

// Cliente HTTP único para falar com o backend Spring Boot.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
});

// Rotas públicas: não enviam token (um token antigo/inválido não pode bloquear login ou cadastro).
const ROTAS_PUBLICAS = ['/auth/login', '/auth/registro'];

// Envia o token JWT (se existir) nas demais requisições.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !ROTAS_PUBLICAS.includes(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
