// src/components/Footer/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
// import logo from '../../assets/contrrat-logo.png'; // Logo não é mais usado
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContainer}>
                <div className={styles.footerAbout}>
                    {/* **ALTERAÇÃO AQUI:** Removida a tag <img> */}
                    <Link to="/" className={styles.logoContainer}>
                        <span className={styles.logoText}>Contrrat</span>
                    </Link>
                    <p>Conectando talentos a grandes momentos. Encontre o artista perfeito para o seu evento de forma simples e segura.</p>
                </div>
                <div className={styles.footerLinks}>
                    <h4>Navegação</h4>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/artistas">Artistas</Link></li>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Cadastre-se</Link></li>
                    </ul>
                </div>
                <div className={styles.footerSocial}>
                    <h4>Siga-nos</h4>
                    <div className={styles.socialIcons}>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                    </div>
                </div>
            </div>
            <div className={styles.footerBottom}>
                <p>&copy; {new Date().getFullYear()} Contrrat. Todos os direitos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;