// src/pages/ArtistDetailsPage/ArtistDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getArtistById } from '../../services/api';
import styles from './ArtistDetailsPage.module.css';

// Usaremos uma imagem de placeholder por enquanto
const placeholderImage = "https://via.placeholder.com/300x300.png/1E1E1E/EAEAEA?text=Artista";

const ArtistDetailsPage = () => {
    const { id } = useParams(); // Pega o ID da URL
    const [artist, setArtist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArtist = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getArtistById(id);
                setArtist(response.data);
            } catch (err) {
                console.error("Erro ao buscar detalhes do artista:", err);
                setError("Artista não encontrado.");
            } finally {
                setLoading(false);
            }
        };

        fetchArtist();
    }, [id]); // O `useEffect` será executado novamente se o ID na URL mudar

    if (loading) {
        return <div className={styles.loading}>Carregando...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!artist) {
        return null; // ou uma mensagem de "artista não encontrado"
    }

    return (
        <div className={styles.detailsContainer}>
            <img src={artist.profilePictureUrl || placeholderImage} alt={artist.name} className={styles.profileImage} />
            <div className={styles.infoSection}>
                <h1 className={styles.name}>{artist.name}</h1>
                {/* LINHA ADICIONADA: Mostra a área de atuação */}
                {artist.artisticField && <h2 className={styles.artisticField}>{artist.artisticField}</h2>}
                <p className={styles.location}>{artist.address.city}, {artist.address.state}</p>
                <p className={styles.description}>{artist.description}</p>
                <div className={styles.contactInfo}>
                    <h4>Contato</h4>
                    <p><strong>Email:</strong> {artist.email}</p>
                    <p><strong>Telefone:</strong> {artist.phoneNumber}</p>
                </div>
            </div>
        </div>
    );
};

export default ArtistDetailsPage;