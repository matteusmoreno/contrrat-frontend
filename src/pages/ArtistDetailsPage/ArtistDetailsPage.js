// src/pages/ArtistDetailsPage/ArtistDetailsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ArtistDetailsPage.module.css';
import { getArtistById, getAllAvailabilityByArtistId } from '../../services/api';
import ArtistAvailability from '../../components/ArtistAvailability/ArtistAvailability';
import Button from '../../components/Button/Button';

const placeholderImage = "https://via.placeholder.com/300x300.png/1E1E1E/EAEAEA?text=Artista";

const ArtistDetailsPage = () => {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();

    const [artist, setArtist] = useState(null);
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchArtistData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [artistResponse, availabilitiesResponse] = await Promise.all([
                getArtistById(id),
                getAllAvailabilityByArtistId(id)
            ]);
            setArtist(artistResponse.data);
            setAvailabilities(availabilitiesResponse.data.content || []);
        } catch (err) {
            console.error("Erro ao buscar dados do artista:", err);
            setError("Não foi possível carregar os detalhes deste artista. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchArtistData();
    }, [fetchArtistData]);

    if (loading) {
        return <div className={styles.loader}></div>;
    }

    if (error) {
        return <p className={styles.error}>{error}</p>;
    }

    if (!artist) {
        return <p className={styles.error}>Artista não encontrado.</p>;
    }

    return (
        <div className={styles.pageLayout}>
            <section className={styles.detailsContainer}>
                <img src={artist.profilePictureUrl || placeholderImage} alt={artist.name} className={styles.profileImage} />
                <div className={styles.infoSection}>
                    <h1 className={styles.name}>{artist.name}</h1>
                    <p className={styles.artisticField}>{artist.artisticField}</p>
                    <p className={styles.location}>{artist.address.city}, {artist.address.state}</p>
                    <p className={styles.description}>{artist.description}</p>

                    <div className={styles.contactInfo}>
                        <h4>Contato</h4>
                        <p><strong>Email:</strong> {artist.email}</p>
                        <p><strong>Telefone:</strong> {artist.phoneNumber}</p>
                    </div>
                </div>
            </section>

            {isAuthenticated && user?.authorities === 'ROLE_CUSTOMER' ? (
                <ArtistAvailability artist={artist} availabilities={availabilities} />
            ) : (
                <div className={styles.loginPrompt}>
                    <p>Você precisa estar logado como contratante para ver a agenda e fazer uma proposta.</p>
                    {!isAuthenticated &&
                        <Link to="/login">
                            <Button>Entrar</Button>
                        </Link>
                    }
                </div>
            )}
        </div>
    );
};

export default ArtistDetailsPage;