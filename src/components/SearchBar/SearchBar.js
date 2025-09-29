// src/components/SearchBar/SearchBar.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.css';
import { FaSearch } from 'react-icons/fa';
import Button from '../Button/Button';

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        // Redireciona para a página de artistas com o termo de busca como parâmetro
        if (searchTerm.trim()) {
            navigate(`/artistas?q=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigate('/artistas');
        }
    };

    return (
        <form className={styles.searchContainer} onSubmit={handleSearch}>
            <div className={styles.searchInputWrapper}>
                <FaSearch className={styles.searchIcon} />
                <input
                    type="text"
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Qual talento você procura? Ex: 'DJ em São Paulo'"
                />
            </div>
            <Button type="submit" variant="primary">Buscar</Button>
        </form>
    );
};

export default SearchBar;