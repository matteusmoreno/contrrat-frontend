// src/pages/ArtistDetailsPage/ArtistDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getArtistById, getAllAvailabilityByArtistId } from '../../services/api';
import styles from './ArtistDetailsPage.module.css';
import { useAuth } from '../../contexts/AuthContext';
import ArtistAvailability from '../../components/ArtistAvailability/ArtistAvailability';

const placeholderImage = "https://via.placeholder.com/300x300.png/1E1E1E/EAEAEA?text=Artista";

const ArtistDetailsPage = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const [artist, setArtist] = useState(null);
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArtistData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [artistResponse, availResponse] = await Promise.all([
                    getArtistById(id),
                    getAllAvailabilityByArtistId(id)
                ]);
                setArtist(artistResponse.data);
                setAvailabilities(availResponse.data.content || []);
            } catch (err) {
                console.error("Erro ao buscar dados do artista:", err);
                setError("Artista não encontrado.");
            } finally {
                setLoading(false);
            }
        };

        fetchArtistData();
    }, [id]);

    if (loading) {
        return <div className={styles.loader}></div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!artist) {
        return null;
    }

    // O cliente não pode contratar a si mesmo
    const isOwnProfile = isAuthenticated && user.scope === 'ARTIST' && user.artistId === id;

    return (
        <div className={styles.pageLayout}>
            <div className={styles.detailsContainer}>
                <img src={artist.profilePictureUrl || placeholderImage} alt={artist.name} className={styles.profileImage} />
                <div className={styles.infoSection}>
                    <h1 className={styles.name}>{artist.name}</h1>
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

            {/* Seção de Contratação */}
            {isAuthenticated && user.scope === 'CUSTOMER' && !isOwnProfile && (
                <ArtistAvailability artist={artist} availabilities={availabilities} />
            )}

            {!isAuthenticated && (
                <div className={styles.loginPrompt}>
                    <p>Faça login como contratante para ver a agenda e contratar este artista.</p>
                </div>
            )}
        </div>
    );
};

export default ArtistDetailsPage;