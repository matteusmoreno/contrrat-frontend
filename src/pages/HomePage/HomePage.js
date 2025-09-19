// src/pages/HomePage/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importe o Link para navegação
import styles from './HomePage.module.css';
import ArtistCard from '../../components/ArtistCard/ArtistCard';
import Button from '../../components/Button/Button';
import { getArtists } from '../../services/api'; // Agora vamos usar a função real

const HomePage = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArtists = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getArtists();
                // O backend retorna um objeto com 'content', então acessamos response.data.content
                setArtists(response.data.content || []);
            } catch (error) {
                console.error("Erro ao buscar artistas:", error);
                setError("Não foi possível carregar os artistas. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchArtists();
    }, []);

    const renderContent = () => {
        if (loading) {
            return <p className={styles.message}>Carregando artistas...</p>;
        }

        if (error) {
            return <p className={styles.messageError}>{error}</p>;
        }

        if (artists.length === 0) {
            return <p className={styles.message}>Nenhum artista encontrado.</p>;
        }

        return (
            <div className={styles.artistsGrid}>
                {artists.map(artist => (
                    <Link to={`/artistas/${artist.id}`} key={artist.id} className={styles.cardLink}>
                        <ArtistCard artist={artist} />
                    </Link>
                ))}
            </div>
        );
    };

    return (
        <div>
            <section className={styles.heroSection}>
                <h1 className={styles.heroTitle}>
                    Conectando <span>talentos</span> a grandes momentos.
                </h1>
                <p className={styles.heroSubtitle}>
                    Encontre o artista perfeito para o seu evento ou a agenda ideal para a sua arte. Simples, rápido e seguro.
                </p>
                <Button>Quero Contratar</Button>
            </section>

            <section>
                <h2>Artistas em destaque</h2>
                {renderContent()}
            </section>
        </div>
    );
};

export default HomePage;