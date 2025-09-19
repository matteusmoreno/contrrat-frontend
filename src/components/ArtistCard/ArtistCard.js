// src/components/ArtistCard/ArtistCard.js
import React from 'react';
import styles from './ArtistCard.module.css';

// Usaremos uma imagem de placeholder por enquanto
const placeholderImage = "https://via.placeholder.com/400x300.png/1E1E1E/EAEAEA?text=Artista";

const ArtistCard = ({ artist }) => {
    // Limita a descrição para não quebrar o layout
    const truncateDescription = (text, length) => {
        if (!text) return "";
        return text.length > length ? text.substring(0, length) + "..." : text;
    };

    return (
        <div className={styles.card}>
            <img src={placeholderImage} alt={artist.name} className={styles.cardImage} />
            <div className={styles.cardContent}>
                <h3>{artist.name}</h3>
                <p className={styles.description}>
                    {truncateDescription(artist.description, 100)}
                </p>
                <span className={styles.location}>
                    {artist.address.city}, {artist.address.state}
                </span>
            </div>
        </div>
    );
};

export default ArtistCard;