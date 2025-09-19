// src/pages/ArtistDetailsPage/ArtistDetailsPage.js
import React from 'react';
import { useParams } from 'react-router-dom';

const ArtistDetailsPage = () => {
    const { id } = useParams();

    return (
        <div>
            <h1>Detalhes do Artista</h1>
            <p>Mostrando detalhes para o artista com ID: {id}</p>
            <p>Em breve...</p>
        </div>
    );
};

export default ArtistDetailsPage;