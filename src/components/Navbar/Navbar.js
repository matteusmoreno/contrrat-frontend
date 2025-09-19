// src/components/Navbar/Navbar.js
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import logo from '../../assets/contrrat-logo.png';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Button/Button';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

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

                {isAuthenticated ? (
                    <>
                        <NavLink
                            to="/perfil"
                            className={({ isActive }) =>
                                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                            }
                        >
                            Olá, {user?.name.split(' ')[0]}
                        </NavLink>
                        <Button onClick={handleLogout}>Sair</Button>
                    </>
                ) : (
                    // Botão único para levar à página de login
                    <Link to="/login">
                        <Button>Entrar</Button>
                    </Link>
                )}
            </div>
            <div className={styles.menuIcon}>
                &#9776;
            </div>
        </nav>
    );
};

export default Navbar;