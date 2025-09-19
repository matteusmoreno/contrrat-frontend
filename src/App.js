// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import ArtistDetailsPage from './pages/ArtistDetailsPage/ArtistDetailsPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ArtistsPage from './pages/ArtistsPage/ArtistsPage'; // Novo
import ProfilePage from './pages/ProfilePage/ProfilePage'; // Novo
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="main-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/artistas" element={<ArtistsPage />} /> {/* Nova Rota */}
          <Route path="/artistas/:id" element={<ArtistDetailsPage />} />
          <Route path="/perfil" element={<ProfilePage />} /> {/* Nova Rota */}
        </Routes>
      </main>
    </Router>
  );
}

export default App;