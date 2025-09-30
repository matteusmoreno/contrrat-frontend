// src/components/ArtistCard/ArtistCard.js
import React from 'react';
import styles from './ArtistCard.module.css';

const placeholderImage = "https://via.placeholder.com/400x300.png/1E1E1E/EAEAEA?text=Artista";

const ArtistCard = ({ artist, isFeatured = false }) => {
    const truncateDescription = (text, length) => {
        if (!text) return "";
        return text.length > length ? text.substring(0, length) + "..." : text;
    };

    const cardClasses = `${styles.card} ${isFeatured ? styles.featured : ''}`;

    return (
        <div className={cardClasses}>
            <div className={styles.imageContainer}>
                <img src={artist.profilePictureUrl || placeholderImage} alt={artist.name} className={styles.cardImage} />
            </div>
            <div className={styles.cardContent}>
                <h3>{artist.name}</h3>
                {artist.artisticField && <p className={styles.artisticField}>{artist.artisticField}</p>}
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