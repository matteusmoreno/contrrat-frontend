// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer'; // Importe o Footer
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import ArtistDetailsPage from './pages/ArtistDetailsPage/ArtistDetailsPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ArtistsPage from './pages/ArtistsPage/ArtistsPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ArtistDashboardPage from './pages/ArtistDashboardPage/ArtistDashboardPage';
import MinhaAgendaPage from './pages/MinhaAgendaPage/MinhaAgendaPage';
import './App.css';

function App() {
  return (
    <Router>
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

            {/* Rotas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/dashboard/artista" element={<ArtistDashboardPage />} />
              <Route path="/minha-agenda" element={<MinhaAgendaPage />} />
            </Route>
          </Routes>
        </main>
        <Footer /> {/* Adicione o Footer aqui */}
      </div>
    </Router>
  );
}

export default App;