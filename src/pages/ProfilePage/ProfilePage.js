// src/pages/ProfilePage/ProfilePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, uploadImage, updateProfilePicture } from '../../services/api';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import styles from './ProfilePage.module.css';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';

const placeholderImage = "https://via.placeholder.com/150x150.png/1E1E1E/EAEAEA?text=Perfil";

const ProfilePage = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef(null);
    const imgRef = useRef(null);

    useEffect(() => {
        if (user) {
            const fetchProfileData = async () => {
                setLoading(true);
                setError(null);
                try {
                    const profileId = user.scope === 'ARTIST' ? user.artistId : user.customerId;
                    if (!profileId) {
                        throw new Error("ID do perfil não encontrado no token.");
                    }
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

    const handleImageClick = () => {
        if (uploading) return;
        fileInputRef.current.click();
    };

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImgSrc(reader.result?.toString() || '');
                setIsCropperOpen(true);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
        e.target.value = null;
    };

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const initialCrop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
            width,
            height
        );
        setCrop(initialCrop);
        imgRef.current = e.currentTarget;
    };

    const handleCropAndUpload = async () => {
        if (!completedCrop || !imgRef.current) {
            setError("Área de corte inválida.");
            return;
        }

        setUploading(true);
        setIsCropperOpen(false);
        setError(null);

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;

        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            imgRef.current,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(async (blob) => {
            if (!blob) {
                setError("Não foi possível processar a imagem.");
                setUploading(false);
                return;
            }

            const originalImage = profileData.profilePictureUrl;
            try {
                const imageUrl = await uploadImage(blob);
                await updateProfilePicture(user.scope, imageUrl);
                setProfileData(prev => ({ ...prev, profilePictureUrl: imageUrl }));
            } catch (err) {
                console.error("Erro no upload:", err);
                setError("Falha ao enviar a imagem. Tente novamente.");
                setProfileData(prev => ({ ...prev, profilePictureUrl: originalImage }));
            } finally {
                setUploading(false);
                setImgSrc('');
            }
        }, 'image/jpeg');
    };

    if (loading) return <div className={styles.loading}>Carregando perfil...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!profileData) return null;

    const formattedBirthDate = new Date(profileData.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    const displayImage = profileData.profilePictureUrl || placeholderImage;

    return (
        <>
            <Modal isOpen={isCropperOpen} onClose={() => setIsCropperOpen(false)}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--texto-primario)' }}>Recorte sua Imagem</h3>
                {imgSrc && (
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={1}
                        circularCrop
                    >
                        <img
                            ref={imgRef}
                            alt="Recorte"
                            src={imgSrc}
                            onLoad={onImageLoad}
                            style={{ maxHeight: '70vh' }}
                        />
                    </ReactCrop>
                )}
                <div style={{ marginTop: '1rem' }}>
                    <Button onClick={handleCropAndUpload} disabled={uploading}>
                        {uploading ? 'Enviando...' : 'Salvar Imagem'}
                    </Button>
                </div>
            </Modal>

            <div className={styles.profileContainer}>
                <header className={styles.profileHeader}>
                    <div className={styles.imageContainer} onClick={handleImageClick}>
                        {uploading ? (
                            <div className={styles.imageLoader}></div>
                        ) : (
                            <img src={displayImage} alt="Foto de Perfil" className={styles.profileImage} />
                        )}
                        <div className={styles.imageOverlay}>
                            <span>&#128247;</span>
                            <span>Alterar Foto</span>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className={styles.hiddenInput}
                            onChange={onSelectFile}
                            accept="image/png, image/jpeg"
                        />
                    </div>
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
                            <p>{`${profileData.address.street}, ${profileData.address.number || 'S/N'} - ${profileData.address.city}/${profileData.address.state}`}</p>
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
        </>
    );
};

export default ProfilePage;