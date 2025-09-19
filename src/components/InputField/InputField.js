// src/components/InputField/InputField.js
import React from 'react';
import styles from './InputField.module.css';

const InputField = ({ id, label, type = 'text', value, onChange, required = false, pattern, title }) => {
    return (
        <div className={styles.inputGroup}>
            <label htmlFor={id}>{label}</label>
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                required={required}
                pattern={pattern}
                title={title}
            />
        </div>
    );
};

export default InputField;