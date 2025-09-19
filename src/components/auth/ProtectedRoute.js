// src/components/auth/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    // Enquanto o AuthContext verifica o token, mostramos uma mensagem de carregamento.
    // Isso evita um "flash" rápido da página de login antes de redirecionar.
    if (loading) {
        return <div>Verificando autenticação...</div>;
    }

    // Se não estiver autenticado, redireciona para a página de login.
    // `replace` evita que o usuário possa voltar para a página protegida pelo botão "voltar" do navegador.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Se estiver autenticado, renderiza o componente filho (a página protegida).
    return <Outlet />;
};

export default ProtectedRoute;