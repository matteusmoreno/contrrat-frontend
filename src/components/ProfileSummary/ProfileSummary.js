// src/components/ProfileSummary/ProfileSummary.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProfileSummary.module.css';
import Button from '../Button/Button';

const placeholderImage = "https://via.placeholder.com/150x150.png/1E1E1E/EAEAEA?text=Perfil";

const ProfileSummary = ({ profileData }) => {
    if (!profileData) {
        return <div className={styles.loading}>Carregando perfil...</div>;
    }

    const { name, artisticField, email, profilePictureUrl, address, phoneNumber, createdAt, active } = profileData;

    // Formata a data de criação
    const memberSince = new Date(createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className={styles.summaryContainer}>
            <img
                src={profilePictureUrl || placeholderImage}
                alt={name}
                className={styles.profileImage}
            />
            <h2 className={styles.name}>{name}</h2>
            <p className={styles.artisticField}>{artisticField}</p>

            <div className={styles.details}>
                <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>📧</span>
                    <span>{email}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>📞</span>
                    <span>{phoneNumber}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>📍</span>
                    <span>{address.city}, {address.state}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>📅</span>
                    <span>Membro desde {memberSince}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>{active ? '✅' : '❌'}</span>
                    <span className={active ? styles.activeStatus : styles.inactiveStatus}>
                        {active ? 'Perfil Ativo' : 'Perfil Inativo'}
                    </span>
                </div>
            </div>

            <Link to="/perfil" className={styles.editButtonLink}>
                <Button>Editar Perfil Completo</Button>
            </Link>
        </div>
    );
};

export default ProfileSummary;