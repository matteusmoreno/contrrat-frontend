// src/components/AutocompleteInput/AutocompleteInput.js
import React, { useState, useEffect, useRef } from 'react';
import styles from './AutocompleteInput.module.css';

const AutocompleteInput = ({ label, options, onSelect, required, initialValue }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isListVisible, setIsListVisible] = useState(false);
    const wrapperRef = useRef(null);

    // Efeito para preencher o campo com o valor inicial quando os dados carregam
    useEffect(() => {
        if (initialValue && options.length > 0) {
            const selectedOption = options.find(option => option.name === initialValue || option.displayName === initialValue);
            if (selectedOption) {
                setInputValue(selectedOption.displayName);
            }
        }
    }, [initialValue, options]);


    // Efeito para fechar a lista ao clicar fora do componente
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsListVisible(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        if (value) {
            const filtered = options.filter(option =>
                option.displayName.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
            setIsListVisible(true);
        } else {
            setSuggestions([]);
            setIsListVisible(false);
            onSelect({ name: '', displayName: '' }); // Limpa a seleção no pai
        }
    };

    const handleSelect = (option) => {
        setInputValue(option.displayName);
        onSelect(option);
        setIsListVisible(false);
    };

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <label className={styles.label}>{label}</label>
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                onFocus={() => setIsListVisible(true)}
                className={styles.input}
                required={required}
                placeholder="Digite para buscar..."
            />
            {isListVisible && suggestions.length > 0 && (
                <ul className={styles.suggestionsList}>
                    {suggestions.map((option) => (
                        <li key={option.name} onClick={() => handleSelect(option)}>
                            {option.displayName}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteInput;