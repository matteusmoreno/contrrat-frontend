// src/components/InputField/InputField.js
import React from 'react';
import styles from './InputField.module.css';

const InputField = ({ id, label, type = 'text', value, onChange, required = false, pattern, title, maxLength, placeholder, error, name }) => {
    return (
        <div className={styles.inputGroup}>
            <label htmlFor={id}>{label}</label>
            <input
                type={type}
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                pattern={pattern}
                title={title}
                maxLength={maxLength}
                placeholder={placeholder}
                className={error ? styles.inputError : ''}
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
};

export default InputField;