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

export const createCustomer = (customerData) => {
    return api.post('/customers', customerData);
};

export const getProfile = (profileType, id) => {
    const endpoint = profileType === 'ARTIST' ? `/artists/${id}` : `/customers/${id}`;
    return api.get(endpoint);
};

// NOVO MÉTODO PARA ATUALIZAR O PERFIL
export const updateArtistProfile = (profileData) => {
    return api.put('/artists/update', profileData);
};

export const getArtisticFields = () => {
    return api.get('/artists/artistic-fields');
};

export const uploadImage = async (file) => {
    const signatureResponse = await api.get('/signature');
    const { signature, timestamp, api_key, cloud_name } = signatureResponse.data;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp);
    formData.append('api_key', api_key);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;

    const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
    });

    if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(`Falha no upload da imagem: ${errorData.error.message}`);
    }

    const responseData = await uploadResponse.json();
    return responseData.secure_url;
};

export const updateProfilePicture = (profileType, imageUrl) => {
    const endpoint = profileType === 'ARTIST' ? '/artists/picture' : '/customers/picture';
    return api.patch(endpoint, { profilePictureUrl: imageUrl });
};

export const createAvailability = (availabilityData) => {
    return api.post('/availability', availabilityData);
};

export const getAllAvailabilityByArtistId = (artistId) => {
    return api.get(`/availability/get-all-by-artist/${artistId}`);
};

export const updateAvailability = (availabilityData) => {
    return api.put('/availability/update', availabilityData);
};

export const deleteAvailability = (id) => {
    return api.delete(`/availability/${id}`);
};


export default api;