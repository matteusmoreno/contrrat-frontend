// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin } from '../services/api';
import api from '../services/api';

// Cria o Contexto
const AuthContext = createContext();

// Função para decodificar o token JWT (de forma simples)
const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

// Componente Provedor
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            const decodedUser = parseJwt(storedToken);
            setUser(decodedUser);
            setToken(storedToken);
            api.defaults.headers.authorization = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await apiLogin(username, password);
        const { token: newToken } = response.data;

        localStorage.setItem('authToken', newToken);
        api.defaults.headers.authorization = `Bearer ${newToken}`;

        const decodedUser = parseJwt(newToken);
        setUser(decodedUser);
        setToken(newToken);
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

// Hook customizado para usar o contexto facilmente
export const useAuth = () => {
    return useContext(AuthContext);
};