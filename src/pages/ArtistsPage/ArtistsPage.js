// src/pages/ArtistsPage/ArtistsPage.js
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from './ArtistsPage.module.css';
import ArtistCard from '../../components/ArtistCard/ArtistCard';
import { getAllActiveArtists, getArtisticFields } from '../../services/api';
import { motion } from 'framer-motion';

const ArtistsPage = () => {
    const [artists, setArtists] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchTerm, setSearchTerm] = useState('');
    const selectedCategory = searchParams.get('categoria') || 'ALL';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [artistsResponse, categoriesResponse] = await Promise.all([
                    getAllActiveArtists(),
                    getArtisticFields()
                ]);
                // **INÍCIO DA CORREÇÃO**
                // A API retorna um objeto Page, o array de artistas está em .content
                setArtists(artistsResponse.data.content || []);
                // **FIM DA CORREÇÃO**
                setCategories([{ displayName: 'Todas as Categorias', name: 'ALL' }, ...categoriesResponse.data]);
            } catch (err) {
                console.error("Erro ao buscar dados:", err);
                setError("Não foi possível carregar os artistas.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCategoryChange = (categoryName) => {
        setSearchParams(categoryName === 'ALL' ? {} : { categoria: categoryName });
    };

    const filteredArtists = artists.filter(artist => {
        const matchesCategory = selectedCategory === 'ALL' || artist.artisticField === categories.find(c => c.name === selectedCategory)?.displayName;
        const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            artist.address.city.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Encontre o Talento Perfeito</h1>
                <p>Navegue, filtre e descubra artistas incríveis para o seu próximo evento.</p>
            </header>

            <div className={styles.filters}>
                <input
                    type="text"
                    placeholder="Buscar por nome ou cidade..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className={styles.categoryFilters}>
                    {categories.map(cat => (
                        <button
                            key={cat.name}
                            className={`${styles.categoryButton} ${selectedCategory === cat.name ? styles.active : ''}`}
                            onClick={() => handleCategoryChange(cat.name)}
                        >
                            {cat.displayName}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className={styles.loader}></div>
            ) : error ? (
                <p className={styles.messageError}>{error}</p>
            ) : (
                <motion.div
                    className={styles.artistsGrid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {filteredArtists.length > 0 ? (
                        filteredArtists.map((artist, index) => (
                            <motion.div
                                key={artist.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <Link to={`/artistas/${artist.id}`} className={styles.cardLink}>
                                    <ArtistCard artist={artist} />
                                </Link>
                            </motion.div>
                        ))
                    ) : (
                        <p className={styles.message}>Nenhum artista encontrado com os filtros selecionados.</p>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default ArtistsPage;