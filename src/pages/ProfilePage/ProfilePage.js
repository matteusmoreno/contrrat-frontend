// src/pages/ProfilePage/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile } from '../../services/api';
import styles from './ProfilePage.module.css';

const placeholderImage = "https://via.placeholder.com/150x150.png/1E1E1E/EAEAEA?text=Perfil";

const ProfilePage = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            const fetchProfileData = async () => {
                setLoading(true);
                setError(null);
                try {
                    // O token JWT tem o 'scope' como ARTIST/CUSTOMER e a claim 'artistId' ou 'customerId'
                    const profileId = user.scope === 'ARTIST' ? user.artistId : user.customerId;
                    const response = await getProfile(user.scope, profileId);
                    setProfileData(response.data);
                } catch (err) {
                    console.error("Erro ao buscar perfil:", err);
                    setError("Não foi possível carregar os dados do perfil.");
                } finally {
                    setLoading(false);
                }
            };
            fetchProfileData();
        }
    }, [user]);

    if (loading) return <div className={styles.loading}>Carregando perfil...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!profileData) return null;

    // Formata a data para dd/mm/aaaa para exibição
    const formattedBirthDate = new Date(profileData.birthDate).toLocaleDateString('pt-BR', {
        timeZone: 'UTC' // Importante para evitar problemas de fuso horário
    });

    return (
        <div className={styles.profileContainer}>
            <header className={styles.profileHeader}>
                <img src={placeholderImage} alt="Foto de Perfil" className={styles.profileImage} />
                <div className={styles.headerInfo}>
                    <h1>{profileData.name}</h1>
                    <p>{user.scope === 'ARTIST' ? 'Artista' : 'Contratante'}</p>
                </div>
            </header>

            <section className={styles.profileDetails}>
                <h2>Meus Dados</h2>
                <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                        <label>Email</label>
                        <p>{profileData.email}</p>
                    </div>
                    <div className={styles.detailItem}>
                        <label>Telefone</label>
                        <p>{profileData.phoneNumber}</p>
                    </div>
                    <div className={styles.detailItem}>
                        <label>Data de Nascimento</label>
                        <p>{formattedBirthDate}</p>
                    </div>
                    <div className={styles.detailItem}>
                        <label>Endereço</label>
                        <p>{`${profileData.address.street}, ${profileData.address.number} - ${profileData.address.city}/${profileData.address.state}`}</p>
                    </div>
                </div>
                {profileData.description && (
                    <div className={styles.artistDescription}>
                        <h2>Sobre Mim</h2>
                        <p>{profileData.description}</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default ProfilePage;