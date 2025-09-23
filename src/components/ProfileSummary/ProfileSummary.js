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

    return (
        <div className={styles.summaryContainer}>
            <img
                src={profileData.profilePictureUrl || placeholderImage}
                alt={profileData.name}
                className={styles.profileImage}
            />
            <h2 className={styles.name}>{profileData.name}</h2>
            <p className={styles.artisticField}>{profileData.artisticField}</p>
            <p className={styles.email}>{profileData.email}</p>
            <Link to="/perfil" className={styles.editButtonLink}>
                <Button>Editar Perfil</Button>
            </Link>
        </div>
    );
};

export default ProfileSummary;