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

export const getPremiumArtists = () => {
    return api.get('/artists/premium-artists');
};

export const getArtistsByField = (artisticField) => {
    return api.get(`/artists/artists-by-field/${artisticField}`);
};

export const getAllActiveArtists = () => {
    return api.get('/artists/all-active?size=200');
};

export const getArtistById = (id) => {
    return api.get(`/artists/${id}`);
};

export const createArtist = (artistData) => {
    return api.post('/artists', artistData);
};

export const updateArtist = (artistData) => {
    return api.put('/artists/update', artistData);
}

export const createCustomer = (customerData) => {
    return api.post('/customers', customerData);
};

export const updateCustomer = (customerData) => {
    return api.put('/customers/update', customerData);
}

export const getCustomerById = (id) => {
    return api.get(`/customers/${id}`);
};

export const getProfile = (profileType, id) => {
    const endpoint = profileType === 'ARTIST' ? `/artists/${id}` : `/customers/${id}`;
    return api.get(endpoint);
};

export const upgradeToPremium = (artistId) => {
    return api.patch(`/artists/promote/${artistId}`);
};

export const getContractsForCustomer = () => {
    return api.get('/contracts/my-contracts-as-customer?size=100');
};

export const getContractsForArtist = () => {
    return api.get('/contracts/my-contracts-as-artist?size=100');
};

export const createContract = (availabilityIds) => {
    return api.post('/contracts', { availabilityIds });
};

export const confirmContract = (contractId) => {
    return api.patch(`/contracts/confirm/${contractId}`);
};

export const rejectContract = (contractId) => {
    return api.patch(`/contracts/reject/${contractId}`);
};

// --- NOVA FUNÇÃO ADICIONADA ---
export const cancelContract = (contractId) => {
    return api.patch(`/contracts/cancel/${contractId}`);
};
// --- FIM DA NOVA FUNÇÃO ---

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

export const getAvailabilityById = (id) => {
    return api.get(`/availability/${id}`);
};

export const getAllAvailabilityByArtistId = (artistId) => {
    return api.get(`/availability/get-all-by-artist/${artistId}?size=1000`);
};

export const updateAvailability = (availabilityData) => {
    return api.put('/availability/update', availabilityData);
};

export const deleteAvailability = (id) => {
    return api.delete(`/availability/${id}`);
};

export const getArtisticFields = () => {
    return api.get('/artists/artistic-fields');
};


export default api;