import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary' }) => {
    // Mapeia a variante para uma classe CSS
    const buttonClass = styles[variant] || styles.primary;

    return (
        <button className={`${styles.button} ${buttonClass}`} type={type} onClick={onClick}>
            {children}
        </button>
    );
};

export default Button;