// src/components/Navbar/Navbar.js
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import logo from '../../assets/contrrat-logo.png'; // Importando o logo

const Navbar = () => {
    // Futuramente, aqui você terá uma lógica para saber se o usuário está logado
    const isLoggedIn = !!localStorage.getItem('authToken');

    return (
        <nav className={styles.navbar}>
            <Link to="/" className={styles.logoContainer}>
                <img src={logo} alt="Contrrat Logo" className={styles.logo} />
                <span className={styles.logoText}>Contrrat</span>
            </Link>

            <div className={styles.navLinks}>
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                    }
                >
                    Home
                </NavLink>
                <NavLink
                    to="/artistas"
                    className={({ isActive }) =>
                        isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                    }
                >
                    Artistas
                </NavLink>
                {/* Lógica de exibição condicional */}
                {isLoggedIn ? (
                    <NavLink
                        to="/perfil"
                        className={({ isActive }) =>
                            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                        }
                    >
                        Meu Perfil
                    </NavLink>
                ) : (
                    <NavLink
                        to="/login"
                        className={({ isActive }) =>
                            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                        }
                    >
                        Login
                    </NavLink>
                )}
            </div>
            <div className={styles.menuIcon}>
                {/* Ícone de menu para mobile (pode ser um SVG ou ícone de uma biblioteca) */}
                &#9776;
            </div>
        </nav>
    );
};

export default Navbar;