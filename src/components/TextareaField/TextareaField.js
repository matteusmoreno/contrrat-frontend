// src/components/TextareaField/TextareaField.js
import React from 'react';
import styles from './TextareaField.module.css';

const TextareaField = ({ id, label, value, onChange, required = false, rows = 4, name, placeholder }) => {
    return (
        <div className={styles.textareaGroup}>
            <label htmlFor={id}>{label}</label>
            <textarea
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                rows={rows}
                placeholder={placeholder}
            />
        </div>
    );
};

export default TextareaField;