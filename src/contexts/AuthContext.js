// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { login as apiLogin, getProfile } from '../services/api';
import api from '../services/api';

const AuthContext = createContext();

const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true);

    const fetchUserAndProfile = useCallback(async (currentToken) => {
        if (!currentToken) {
            setUser(null);
            setToken(null);
            delete api.defaults.headers.authorization;
            return;
        }

        api.defaults.headers.authorization = `Bearer ${currentToken}`;
        const decodedToken = parseJwt(currentToken);

        if (decodedToken) {
            try {
                const isArtist = decodedToken.authorities === 'ROLE_ARTIST';
                const profileType = isArtist ? 'ARTIST' : 'CUSTOMER';
                const profileId = isArtist ? decodedToken.artistId : decodedToken.customerId;

                if (profileId) {
                    const profileResponse = await getProfile(profileType, profileId);
                    // Combina dados do token com dados do perfil
                    setUser({ ...decodedToken, ...profileResponse.data });
                } else {
                    // Usuário logado via OAuth que ainda não completou o perfil
                    setUser(decodedToken);
                }

                setToken(currentToken);

            } catch (error) {
                console.error("Falha ao buscar perfil do usuário, deslogando.", error);
                logout(); // Se não encontrar o perfil, força o logout
            }
        } else {
            // Token inválido
            logout();
        }
    }, []);


    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        setLoading(true);
        if (storedToken) {
            fetchUserAndProfile(storedToken);
        }
        setLoading(false);
    }, [fetchUserAndProfile]);

    const login = async (username, password) => {
        const response = await apiLogin(username, password);
        const { token: newToken } = response.data;
        localStorage.setItem('authToken', newToken);
        await fetchUserAndProfile(newToken);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        delete api.defaults.headers.authorization;
        setUser(null);
        setToken(null);
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};