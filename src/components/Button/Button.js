import React from 'react';
import styles from './Button.module.css';

// { children, onClick, type = 'button' } são "props" (propriedades)
// que o componente recebe. `children` é o texto dentro do botão.
const Button = ({ children, onClick, type = 'button' }) => {
    return (
        <button className={styles.button} type={type} onClick={onClick}>
            {children}
        </button>
    );
};

export default Button;