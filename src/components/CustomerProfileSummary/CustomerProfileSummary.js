// src/components/CustomerProfileSummary/CustomerProfileSummary.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CustomerProfileSummary.module.css';
import Button from '../Button/Button';

const placeholderImage = "https://via.placeholder.com/150x150.png/1E1E1E/EAEAEA?text=Perfil";

const CustomerProfileSummary = ({ profileData, onImageClick, isUploading }) => {
    if (!profileData) {
        return <div className={styles.loading}>Carregando perfil...</div>;
    }

    const { name, email, profilePictureUrl, address, phoneNumber, createdAt, active } = profileData;

    const memberSince = new Date(createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className={styles.summaryContainer}>
            <div className={styles.imageContainer} onClick={onImageClick} title="Clique para alterar sua foto">
                {isUploading ? (
                    <div className={styles.imageLoader}></div>
                ) : (
                    <img
                        src={profilePictureUrl || placeholderImage}
                        alt={name}
                        className={styles.profileImage}
                    />
                )}
                {!isUploading && (
                    <div className={styles.imageOverlay}>
                        <span>&#128247;</span>
                        <span>Alterar</span>
                    </div>
                )}
            </div>

            <h2 className={styles.name}>{name}</h2>

            <div className={styles.details}>
                <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>&#9993;</span>
                    <span>{email}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>&#128222;</span>
                    <span>{phoneNumber}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>&#128205;</span>
                    <span>{address.city}, {address.state}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>&#128197;</span>
                    <span>Membro desde {memberSince}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>{active ? '\u2705' : '\u274C'}</span>
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

export default CustomerProfileSummary;