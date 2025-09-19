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

// Função de Login
export const login = (username, password) => {
    return api.post('/login', { username, password });
};

// ** ATUALIZADO ** para buscar todos os artistas
export const getArtists = () => {
    return api.get('/artists/all'); // Usando o novo endpoint
}

// Buscar um artista pelo ID
export const getArtistById = (id) => {
    return api.get(`/artists/${id}`);
}

// **NOVO: Criar Artista**
export const createArtist = (artistData) => {
    return api.post('/artists', artistData);
}

// **NOVO: Criar Cliente**
export const createCustomer = (customerData) => {
    return api.post('/customers', customerData);
}

export default api;