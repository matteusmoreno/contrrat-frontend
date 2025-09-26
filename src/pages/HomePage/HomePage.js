// src/pages/HomePage/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import ArtistCard from '../../components/ArtistCard/ArtistCard';
import Button from '../../components/Button/Button';
import { getPremiumArtists, getArtisticFields } from '../../services/api'; // Alterado para getPremiumArtists
import { motion } from 'framer-motion';
import { FaMusic, FaCamera, FaMagic, FaPaintBrush, FaBirthdayCake, FaBuilding } from 'react-icons/fa';

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
                // **ALTERAÇÃO AQUI:** Busca artistas premium e categorias
                const [artistsResponse, categoriesResponse] = await Promise.all([
                    getPremiumArtists(),
                    getArtisticFields()
                ]);

                setArtists(artistsResponse.data.content?.slice(0, 4) || []);

                const categoryIcons = {
                    BANDA: <FaMusic />, CANTOR: <FaMusic />, DJ: <FaMusic />,
                    FOTOGRAFO: <FaCamera />, VIDEOMAKER: <FaCamera />,
                    MAGICO: <FaMagic />, ATOR: <FaMagic />,
                    PINTOR: <FaPaintBrush />, GRAFITEIRO: <FaPaintBrush />,
                    RECREADOR_INFANTIL: <FaBirthdayCake />,
                    CELEBRANTE_DE_CASAMENTO: <FaBuilding />
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
                        animate={{ opacity: 1, y: 0 }}
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
            <section className={styles.heroSection}>
                <motion.div
                    className={styles.heroContent}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className={styles.heroTitle}>
                        Contrate <span>talentos</span>, crie <span>momentos</span>.
                    </h1>
                    <p className={styles.heroSubtitle}>
                        A plataforma que conecta você aos melhores artistas para transformar seu evento em uma experiência inesquecível.
                    </p>
                    <div className={styles.heroActions}>
                        <Link to="/artistas"><Button variant="primary">Encontrar Artistas</Button></Link>
                        <Link to="/register"><Button variant="outline">Sou um Artista</Button></Link>
                    </div>
                </motion.div>
            </section>

            <section className={styles.howItWorksSection}>
                <h2 className={styles.sectionTitle}>Tudo em um só lugar</h2>
                <div className={styles.stepsGrid}>
                    <div className={styles.stepCard}>
                        <h3>1. Descubra</h3>
                        <p>Explore perfis detalhados, veja portfólios e encontre o talento ideal para seu evento.</p>
                    </div>
                    <div className={styles.stepCard}>
                        <h3>2. Conecte-se</h3>
                        <p>Consulte a disponibilidade em tempo real e negocie diretamente com o artista.</p>
                    </div>
                    <div className={styles.stepCard}>
                        <h3>3. Contrate</h3>
                        <p>Feche o contrato com segurança e praticidade, tudo dentro da nossa plataforma.</p>
                    </div>
                </div>
            </section>

            <section className={styles.featuredSection}>
                <h2 className={styles.sectionTitle}>Artistas em Destaque</h2>
                {renderArtistContent()}
                <div className={styles.viewAll}>
                    <Link to="/artistas"><Button variant="outline">Ver Todos os Artistas</Button></Link>
                </div>
            </section>

            <section className={styles.categoriesSection}>
                <h2 className={styles.sectionTitle}>Navegue por Categorias</h2>
                <div className={styles.categoriesGrid}>
                    {categories.slice(0, 5).map(category => (
                        <Link to={`/artistas?categoria=${category.name}`} key={category.name} className={styles.categoryCard}>
                            <div className={styles.categoryIcon}>{category.icon}</div>
                            <span>{category.displayName}</span>
                        </Link>
                    ))}
                    <Link to="/artistas" className={`${styles.categoryCard} ${styles.allCategoriesCard}`}>
                        <span>Ver todas as categorias</span>
                    </Link>
                </div>
            </section>

            <section className={styles.ctaSection}>
                <h2>Pronto para começar?</h2>
                <p>Junte-se à nossa comunidade e transforme seu próximo evento em um momento inesquecível.</p>
                <Link to="/register"><Button variant="primary" size="large">Crie sua Conta Grátis</Button></Link>
            </section>
        </div>
    );
};

export default HomePage;