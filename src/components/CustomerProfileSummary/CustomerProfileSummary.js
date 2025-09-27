// src/components/CustomerProfileSummary/CustomerProfileSummary.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CustomerProfileSummary.module.css';
import Button from '../Button/Button';

const placeholderImage = "https://via.placeholder.com/150x150.png/1E1E1E/EAEAEA?text=Perfil";

const CustomerProfileSummary = ({ profileData }) => {
    const { name, email, profilePictureUrl } = profileData;

    return (
        <div className={styles.summaryContainer}>
            <img src={profilePictureUrl || placeholderImage} alt={name} className={styles.profileImage} />
            <h2 className={styles.name}>{name}</h2>
            <p className={styles.email}>{email}</p>
            <Link to="/perfil" className={styles.editButtonLink}>
                <Button variant="outline">Editar Perfil</Button>
            </Link>
        </div>
    );
};

export default CustomerProfileSummary;