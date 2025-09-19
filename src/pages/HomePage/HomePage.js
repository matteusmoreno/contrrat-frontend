// src/pages/HomePage/HomePage.js
import React, { useState, useEffect } from 'react';
import styles from './HomePage.module.css';
import ArtistCard from '../../components/ArtistCard/ArtistCard';
import Button from '../../components/Button/Button';
// import { getArtists } from '../../services/api'; // Comentado por enquanto

// --- DADOS MOCKADOS ---
// Substitua isso pela chamada à API quando o backend estiver pronto
const mockArtists = [
    { id: '1', name: 'Matteus Moreno', description: 'Músico, cantor e compositor de MPB e Bossa Nova. Trazendo um som suave e poético para o seu evento.', address: { city: 'Saquarema', state: 'RJ' } },
    { id: '2', name: 'Banda do Mar', description: 'Trio de rock alternativo com influências de surf music. Perfeito para festivais e eventos ao ar livre.', address: { city: 'Rio de Janeiro', state: 'RJ' } },
    { id: '3', name: 'DJ Solaris', description: 'DJ de música eletrônica, especialista em deep house e techno. Transforma qualquer noite em uma festa inesquecível.', address: { city: 'Niterói', state: 'RJ' } },
    { id: '4', name: 'Clara Nunes Cover', description: 'Homenagem emocionante a uma das maiores vozes do samba. Show completo com banda e repertório clássico.', address: { city: 'São Gonçalo', state: 'RJ' } },
];
// --- FIM DOS DADOS MOCKADOS ---


const HomePage = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtists = async () => {
            setLoading(true);
            try {
                // QUANDO O BACKEND ESTIVER PRONTO, DESCOMENTE AS LINHAS ABAIXO
                // E REMOVA A LINHA `setArtists(mockArtists)`
                // const response = await getArtists();
                // setArtists(response.data);

                // Usando dados mockados por enquanto
                setTimeout(() => { // Simula um delay da rede
                    setArtists(mockArtists);
                    setLoading(false);
                }, 1000);

            } catch (error) {
                console.error("Erro ao buscar artistas:", error);
                setLoading(false);
            }
        };

        fetchArtists();
    }, []);


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
                <div className={styles.artistsGrid}>
                    {loading ? (
                        <p>Carregando artistas...</p>
                    ) : (
                        artists.map(artist => (
                            <ArtistCard key={artist.id} artist={artist} />
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default HomePage;