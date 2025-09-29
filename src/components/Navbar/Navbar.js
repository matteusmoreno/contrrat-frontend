// src/components/Navbar/Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Button/Button';
// 1. Importar o novo ícone
import { FaTachometerAlt, FaUserEdit, FaCalendarAlt, FaSignOutAlt, FaFileContract } from 'react-icons/fa';

const placeholderImage = "https://via.placeholder.com/150x150.png/1E1E1E/EAEAEA?text=Perfil";

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        setDropdownOpen(false);
        logout();
        navigate('/');
    };

    // Fecha o dropdown se clicar fora dele
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const renderUserMenu = () => (
        <div className={styles.profileContainer} ref={dropdownRef}>
            <button className={styles.profileButton} onClick={() => setDropdownOpen(!isDropdownOpen)}>
                <img
                    src={user.profilePictureUrl || placeholderImage}
                    alt="Foto de perfil"
                    className={styles.profilePicture}
                />
                <span className={styles.profileName}>
                    Olá, <span>{user.name.split(' ')[0]}</span>
                </span>
            </button>
            {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                    <Link to={user?.authorities === 'ROLE_ARTIST' ? "/dashboard/artista" : "/dashboard/cliente"} className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        <FaTachometerAlt /> Dashboard
                    </Link>
                    <Link to="/perfil" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        <FaUserEdit /> Editar Perfil
                    </Link>
                    {user?.authorities === 'ROLE_ARTIST' && (
                        <Link to="/minha-agenda" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                            <FaCalendarAlt /> Minha Agenda
                        </Link>
                    )}
                    {/* 2. Adicionar o novo link para a página de contratos */}
                    <Link to="/meus-contratos" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        <FaFileContract /> Meus Contratos
                    </Link>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        <FaSignOutAlt /> Sair
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <nav className={styles.navbar}>
            <Link to="/" className={styles.logoContainer}>
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

                {isAuthenticated && user ? (
                    renderUserMenu()
                ) : (
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