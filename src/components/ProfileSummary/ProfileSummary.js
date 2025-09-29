// src/components/ProfileSummary/ProfileSummary.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProfileSummary.module.css';
import Button from '../Button/Button';
import { upgradeToPremium } from '../../services/api';
import { FaCheckCircle, FaStar } from 'react-icons/fa';

const placeholderImage = "https://via.placeholder.com/150x150.png/1E1E1E/EAEAEA?text=Perfil";

const ProfileSummary = ({ profileData, onImageClick, isUploading, onUpdate }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!profileData) {
        return <div className={styles.loading}>Carregando perfil...</div>;
    }

    const { id, name, artisticField, email, profilePictureUrl, address, phoneNumber, createdAt, active, premium } = profileData;

    const memberSince = new Date(createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const handleUpgrade = async () => {
        setIsSubmitting(true);
        try {
            await upgradeToPremium(id);
            if (onUpdate) {
                onUpdate(); // Chama a função para recarregar os dados no dashboard
            }
        } catch (error) {
            console.error("Erro ao tentar se tornar premium:", error);
            // Adicionar feedback de erro para o usuário aqui, se desejar
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.summaryContainer}>
            <div className={styles.imageContainer} onClick={onImageClick}>
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

            {premium ? (
                <div className={styles.premiumBadge}>
                    <FaCheckCircle /> Conta Premium
                </div>
            ) : (
                <div className={styles.premiumCard}>
                    <h4><FaStar /> Torne-se Premium</h4>
                    <p>Destaque seu perfil, apareça primeiro nas buscas e consiga mais contratos.</p>
                    <Button onClick={handleUpgrade} disabled={isSubmitting}>
                        {isSubmitting ? 'Aguarde...' : 'Fazer Upgrade'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ProfileSummary;