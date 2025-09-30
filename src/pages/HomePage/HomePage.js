// src/pages/HomePage/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import Button from '../../components/Button/Button';
import { getPremiumArtists } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPalette, FaMusic, FaCamera, FaMagic, FaFileSignature, FaCalendarCheck, FaStar, FaUsers, FaGuitar } from 'react-icons/fa';

const HomePage = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [featuredIndex, setFeaturedIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const artistsResponse = await getPremiumArtists();
                setArtists(artistsResponse.data.content?.slice(0, 5) || []);
            } catch (error) {
                console.error("Erro ao buscar dados da home:", error);
                setError("Não foi possível carregar o conteúdo. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Efeito para alternar o artista em destaque
    useEffect(() => {
        if (artists.length > 1) {
            const interval = setInterval(() => {
                setFeaturedIndex(prevIndex => (prevIndex + 1) % artists.length);
            }, 5000); // Muda a cada 5 segundos
            return () => clearInterval(interval);
        }
    }, [artists]);

    const heroArtists = artists.slice(0, 4);

    const renderFeaturedArtists = () => {
        if (loading) return <div className={styles.loader}></div>;
        if (error) return <p className={styles.messageError}>{error}</p>;
        if (artists.length < 1) return <p className={styles.message}>Descubra novos talentos em breve.</p>;

        const mainArtist = artists[featuredIndex];
        const otherArtists = artists.filter((_, index) => index !== featuredIndex);

        return (
            <div className={styles.featuredGrid}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mainArtist.id}
                        className={`${styles.featuredCard} ${styles.featuredMain}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link to={`/artistas/${mainArtist.id}`}>
                            <img src={mainArtist.profilePictureUrl || "https://via.placeholder.com/600x800.png/1E1E1E/EAEAEA?text=Artista"} alt={mainArtist.name} className={styles.cardImage} />
                            <div className={styles.cardOverlay}>
                                <div>
                                    <span className={styles.cardTag}>Destaque</span>
                                    <h3>{mainArtist.name}</h3>
                                    <p>{mainArtist.artisticField}</p>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </AnimatePresence>
                <div className={styles.featuredSubgrid}>
                    {otherArtists.map(artist => (
                        <Link key={artist.id} to={`/artistas/${artist.id}`} className={`${styles.featuredCard} ${styles.featuredSecondary}`}>
                            <img src={artist.profilePictureUrl || "https://via.placeholder.com/400x400.png/1E1E1E/EAEAEA?text=Artista"} alt={artist.name} className={styles.cardImage} />
                            <div className={styles.cardOverlay}>
                                <h3>{artist.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.homeContainer}>
            {/* --- HERO SECTION --- */}
            <section className={styles.heroSection}>
                <div className={styles.heroImageCollage}>
                    {heroArtists.map((artist, index) => (
                        <motion.div
                            key={artist.id}
                            className={`${styles.heroImageWrapper} ${styles[`heroImage${index + 1}`]}`}
                            initial={{ opacity: 0, y: 50, rotate: -5 }}
                            animate={{ opacity: 1, y: 0, rotate: (index % 2 === 0 ? 5 : -3) }}
                            transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
                        >
                            <img src={artist.profilePictureUrl || "https://via.placeholder.com/300"} alt={artist.name} />
                        </motion.div>
                    ))}
                </div>
                <div className={styles.heroContent}>
                    <motion.h1
                        className={styles.heroTitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        Encontre o Artista. Contrate o Show. Crie a Memória.
                    </motion.h1>
                    <motion.p
                        className={styles.heroSubtitle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                    >
                        A plataforma que conecta você aos melhores talentos para eventos inesquecíveis.
                    </motion.p>
                    <motion.div
                        className={styles.heroActions}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9 }}
                    >
                        <Link to="/artistas"><Button>Explorar Talentos</Button></Link>
                    </motion.div>
                </div>
            </section>

            {/* --- WHY US SECTION --- */}
            <section className={styles.whyUsSection}>
                <h2 className={styles.sectionTitle}>Por que <span>Contrrat</span>?</h2>
                <p className={styles.sectionSubtitle}>Nós simplificamos a conexão entre talento e evento com segurança e praticidade.</p>
                <div className={styles.benefitsGrid}>
                    <div className={styles.benefitCard}>
                        <div className={styles.benefitIcon}><FaFileSignature /></div>
                        <h3>Contratos Simplificados</h3>
                        <p>Gere e gerencie propostas e contratos digitais com validade jurídica em poucos cliques.</p>
                    </div>
                    <div className={styles.benefitCard}>
                        <div className={styles.benefitIcon}><FaCalendarCheck /></div>
                        <h3>Agenda Inteligente</h3>
                        <p>Consulte a disponibilidade real do artista e evite conflitos de agendamento.</p>
                    </div>
                    <div className={styles.benefitCard}>
                        <div className={styles.benefitIcon}><FaStar /></div>
                        <h3>Talentos Verificados</h3>
                        <p>Acesso a um catálogo curado de artistas e profissionais para todos os tipos de evento.</p>
                    </div>
                </div>
            </section>

            {/* --- FEATURED ARTISTS SECTION --- */}
            <section className={styles.featuredSection}>
                <h2 className={styles.sectionTitle}>Artistas em <span>Destaque</span></h2>
                <p className={styles.sectionSubtitle}>Descubra os artistas que estão conquistando o público na nossa plataforma.</p>
                {renderFeaturedArtists()}
                <div className={styles.viewAll}>
                    <Link to="/artistas"><Button variant="outline">Ver Todos os Artistas</Button></Link>
                </div>
            </section>

            {/* --- JOIN US SECTION --- */}
            <section className={styles.joinUsSection}>
                <h2 className={styles.sectionTitle}>Faça parte da nossa <span>comunidade</span></h2>
                <div className={styles.joinGrid}>
                    <div className={`${styles.joinCard} ${styles.joinCustomer}`}>
                        <div className={styles.joinContent}>
                            <div className={styles.joinIconWrapper}><FaUsers className={styles.joinIcon} /></div>
                            <h2>Quero Contratar</h2>
                            <p>Encontre os melhores talentos para seu evento, de forma rápida e segura.</p>
                            <Link to="/register"><Button variant="outline">Criar Conta de Contratante</Button></Link>
                        </div>
                    </div>
                    <div className={`${styles.joinCard} ${styles.joinArtist}`}>
                        <div className={styles.joinContent}>
                            <div className={styles.joinIconWrapper}><FaGuitar className={styles.joinIcon} /></div>
                            <h2>Sou um Artista</h2>
                            <p>Divulgue seu trabalho, gerencie sua agenda e feche novos contratos.</p>
                            <Link to="/register"><Button>Divulgar meu Trabalho</Button></Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;