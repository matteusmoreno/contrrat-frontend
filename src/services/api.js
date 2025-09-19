// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8686',
});

// Usando um interceptor para adicionar o token dinamicamente a cada requisição
// Isso é mais robusto do que definir o header apenas uma vez.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


// --- Funções de Serviço ---

export const login = (username, password) => {
    return api.post('/login', { username, password });
};

export const getArtists = () => {
    return api.get('/artists/all');
};

export const getArtistById = (id) => {
    return api.get(`/artists/${id}`);
};

export const createArtist = (artistData) => {
    return api.post('/artists', artistData);
};

export const createCustomer = (customerData) => {
    return api.post('/customers', customerData);
};

// **NOVO: Buscar perfil do usuário logado (artista ou cliente)**
export const getProfile = (profileType, id) => {
    const endpoint = profileType === 'ARTIST' ? `/artists/${id}` : `/customers/${id}`;
    return api.get(endpoint);
};


export default api;