// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar'; // Criaremos em breve
import HomePage from './pages/HomePage/HomePage'; // Criaremos em breve
import LoginPage from './pages/LoginPage/LoginPage'; // Criaremos em breve
import ArtistDetailsPage from './pages/ArtistDetailsPage/ArtistDetailsPage'; // Criaremos em breve
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="main-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/artistas/:id" element={<ArtistDetailsPage />} />
          {/* Adicionar outras rotas aqui: /cadastro, /perfil, etc. */}
        </Routes>
      </main>
    </Router>
  );
}

export default App;