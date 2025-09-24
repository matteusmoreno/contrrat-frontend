// src/components/TextareaField/TextareaField.js
import React from 'react';
import styles from './TextareaField.module.css';

const TextareaField = ({ id, label, value, onChange, required = false, rows = 4 }) => {
    return (
        <div className={styles.textareaGroup}>
            <label htmlFor={id}>{label}</label>
            <textarea
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                required={required}
                rows={rows}
            />
        </div>
    );
};

export default TextareaField;