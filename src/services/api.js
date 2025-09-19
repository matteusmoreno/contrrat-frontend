// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8686',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

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

// Adicionando a exportação que faltava
export const createCustomer = (customerData) => {
    return api.post('/customers', customerData);
};

export const getProfile = (profileType, id) => {
    const endpoint = profileType === 'ARTIST' ? `/artists/${id}` : `/customers/${id}`;
    return api.get(endpoint);
};

export default api;