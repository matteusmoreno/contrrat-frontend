// src/pages/HomePage/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import ArtistCard from '../../components/ArtistCard/ArtistCard';
import Button from '../../components/Button/Button';
import SearchBar from '../../components/SearchBar/SearchBar';
import TestimonialCard from '../../components/TestimonialCard/TestimonialCard';
import { getPremiumArtists, getArtisticFields } from '../../services/api';
import { motion } from 'framer-motion';
import { FaMusic, FaCamera, FaMagic, FaPalette, FaBirthdayCake, FaBuilding, FaBullhorn } from 'react-icons/fa';

// Dados de exemplo para depoimentos (sem avatares)
const testimonials = [
    {
        quote: "Encontrei um fotógrafo incrível para o meu casamento em minutos. A plataforma é super intuitiva e segura. Recomendo demais!",
        author: "Juliana Costa",
        role: "Noiva",
    },
    {
        quote: "Como músico, o Contrrat abriu muitas portas. A gestão da agenda é fantástica e já fechei vários eventos por aqui.",
        author: "Ricardo Alves",
        role: "Músico",
    },
    {
        quote: "Organizei a festa de fim de ano da minha empresa e contratei uma banda e um mágico pelo site. Foi um sucesso absoluto!",
        author: "Mariana Ferreira",
        role: "Produtora de Eventos",
    }
];

const HomePage = () => {
    const [artists, setArtists] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [artistsResponse, categoriesResponse] = await Promise.all([
                    getPremiumArtists(),
                    getArtisticFields()
                ]);

                setArtists(artistsResponse.data.content?.slice(0, 4) || []);

                const categoryIcons = {
                    BANDA: <FaMusic />, CANTOR: <FaMusic />, DJ: <FaMusic />,
                    FOTOGRAFO: <FaCamera />, VIDEOMAKER: <FaCamera />,
                    MAGICO: <FaMagic />, ATOR: <FaMagic />,
                    PINTOR: <FaPalette />, GRAFITEIRO: <FaPalette />,
                    RECREADOR_INFANTIL: <FaBirthdayCake />,
                    CELEBRANTE_DE_CASAMENTO: <FaBuilding />,
                    MESTRE_DE_CERIMONIAS: <FaBullhorn />,
                };

                const allCategories = categoriesResponse.data.map(cat => ({
                    ...cat,
                    icon: categoryIcons[cat.name] || <FaMusic />
                }));

                setCategories(allCategories);

            } catch (error) {
                console.error("Erro ao buscar dados da home:", error);
                setError("Não foi possível carregar o conteúdo. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderArtistContent = () => {
        if (loading) return <div className={styles.loader}></div>;
        if (error) return <p className={styles.messageError}>{error}</p>;
        if (artists.length === 0) return <p className={styles.message}>Nenhum artista em destaque no momento.</p>;

        return (
            <div className={styles.artistsGrid}>
                {artists.map((artist, index) => (
                    <motion.div
                        key={artist.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Link to={`/artistas/${artist.id}`} className={styles.cardLink}>
                            <ArtistCard artist={artist} isFeatured={artist.premium} />
                        </Link>
                    </motion.div>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.homeContainer}>
            {/* --- HERO SECTION --- */}
            <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <motion.h1
                        className={styles.heroTitle}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        O palco perfeito para o seu evento
                    </motion.h1>
                    <motion.p
                        className={styles.heroSubtitle}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Encontre e contrate músicos, fotógrafos, mágicos e todos os talentos que você precisa para criar momentos inesquecíveis.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <SearchBar />
                    </motion.div>
                </div>
            </section>

            {/* --- HOW IT WORKS SECTION --- */}
            <section className={styles.howItWorksSection}>
                <h2 className={styles.sectionTitle}>Simples, Rápido e <span>Seguro</span></h2>
                <div className={styles.stepsGrid}>
                    <div className={styles.stepCard}>
                        <div className={styles.stepNumber}>1</div>
                        <h3>Descubra Talentos</h3>
                        <p>Use nossa busca inteligente e filtros para encontrar o artista perfeito para o seu evento.</p>
                    </div>
                    <div className={styles.stepCard}>
                        <div className={styles.stepNumber}>2</div>
                        <h3>Consulte a Agenda</h3>
                        <p>Veja a disponibilidade em tempo real e selecione os horários ideais para você.</p>
                    </div>
                    <div className={styles.stepCard}>
                        <div className={styles.stepNumber}>3</div>
                        <h3>Contrate Online</h3>
                        <p>Envie sua proposta e feche o contrato com segurança, tudo dentro da plataforma.</p>
                    </div>
                </div>
            </section>

            {/* --- FEATURED ARTISTS SECTION --- */}
            <section className={styles.featuredSection}>
                <h2 className={styles.sectionTitle}>Artistas em <span>Destaque</span></h2>
                {renderArtistContent()}
                <div className={styles.viewAll}>
                    <Link to="/artistas"><Button variant="primary">Ver Todos os Artistas</Button></Link>
                </div>
            </section>

            {/* --- TESTIMONIALS SECTION --- */}
            <section className={styles.testimonialsSection}>
                <h2 className={styles.sectionTitle}>Quem usa, <span>Recomenda</span></h2>
                <div className={styles.testimonialsGrid}>
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                        >
                            <TestimonialCard {...testimonial} />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* --- FINAL CTA SECTION --- */}
            <section className={styles.ctaSection}>
                <div className={styles.ctaContent}>
                    <h2>Pronto para começar?</h2>
                    <p>Junte-se à nossa comunidade e transforme seu próximo evento em um momento inesquecível.</p>
                    <div className={styles.ctaActions}>
                        <Link to="/register"><Button variant="primary" size="large">Crie sua Conta Grátis</Button></Link>
                        <Link to="/artistas"><Button variant="outline" size="large">Explorar Artistas</Button></Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;