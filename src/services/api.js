// src/services/api.js
import axios from 'axios';

// O token JWT será armazenado no localStorage do navegador
const token = localStorage.getItem('authToken');

const api = axios.create({
    baseURL: 'http://localhost:8686', // A URL base do seu backend
});

// Isso adiciona o token em TODAS as requisições que forem feitas
if (token) {
    api.defaults.headers.authorization = `Bearer ${token}`;
}

// --- Funções de Serviço ---

// Exemplo: Login
export const login = (username, password) => {
    return api.post('/login', { username, password });
};

// Exemplo: Buscar todos os artistas (página pública, não precisa de token)
export const getArtists = () => {
    // No seu backend, você precisa criar um endpoint para listar artistas.
    // Ex: @GetMapping("/artists") que retorna uma lista de artistas.
    return api.get('/artists');
}

// Exemplo: Buscar um artista pelo ID
export const getArtistById = (id) => {
    return api.get(`/artists/${id}`);
}

export default api;