// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import ArtistDetailsPage from './pages/ArtistDetailsPage/ArtistDetailsPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ArtistsPage from './pages/ArtistsPage/ArtistsPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ArtistDashboardPage from './pages/ArtistDashboardPage/ArtistDashboardPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage/CustomerDashboardPage';
import MinhaAgendaPage from './pages/MinhaAgendaPage/MinhaAgendaPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage/CustomerDetailsPage';
import ContractManagementPage from './pages/ContractManagementPage/ContractManagementPage';
import './App.css';

// Importar as páginas legais
import AboutUsPage from './pages/AboutUsPage/AboutUsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage/PrivacyPolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage/TermsOfUsePage';

// --- INÍCIO DA ALTERAÇÃO ---
// 1. Importar o novo componente
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
// --- FIM DA ALTERAÇÃO ---

function App() {
  return (
    <Router>
      {/* --- INÍCIO DA ALTERAÇÃO --- */}
      {/* 2. Adicionar o componente aqui */}
      <ScrollToTop />
      {/* --- FIM DA ALTERAÇÃO --- */}
      <div className="app-wrapper">
        <Navbar />
        <main className="main-container">
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/artistas" element={<ArtistsPage />} />
            <Route path="/artistas/:id" element={<ArtistDetailsPage />} />
            <Route path="/clientes/:id" element={<CustomerDetailsPage />} />

            {/* Rotas Públicas para o Footer */}
            <Route path="/sobre-nos" element={<AboutUsPage />} />
            <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
            <Route path="/termos-de-uso" element={<TermsOfUsePage />} />

            {/* Rotas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/dashboard/artista" element={<ArtistDashboardPage />} />
              <Route path="/dashboard/cliente" element={<CustomerDashboardPage />} />
              <Route path="/minha-agenda" element={<MinhaAgendaPage />} />
              <Route path="/meus-contratos" element={<ContractManagementPage />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;