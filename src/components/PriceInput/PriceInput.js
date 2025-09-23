// src/components/PriceInput/PriceInput.js
import React from 'react';
import styles from './PriceInput.module.css';

const PriceInput = ({ value, onChange }) => {
    const handleValueChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        onChange(rawValue / 100);
    };

    const formatPrice = (price) => {
        if (price === null || price === undefined || isNaN(price)) {
            return '';
        }
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    return (
        <input
            type="text"
            className={styles.priceInput}
            value={formatPrice(value)}
            onChange={handleValueChange}
            placeholder="R$ 0,00"
        />
    );
};

export default PriceInput;