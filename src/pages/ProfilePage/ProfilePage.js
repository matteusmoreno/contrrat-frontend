// src/pages/ProfilePage/ProfilePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, uploadImage, updateProfilePicture, updateArtistProfile } from '../../services/api';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import styles from './ProfilePage.module.css';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import InputField from '../../components/InputField/InputField';

const placeholderImage = "https://via.placeholder.com/150x150.png/1E1E1E/EAEAEA?text=Perfil";

const ProfilePage = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para o modo de edição
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});

    // Estados para o cropper de imagem
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
                    // Inicializa os dados de edição com os dados do perfil
                    setEditData({ ...response.data, ...response.data.address });
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

    const handleEditToggle = () => {
        if (!isEditing) {
            // Entrando no modo de edição, reseta os dados para os atuais do perfil
            setEditData({ ...profileData, ...profileData.address });
        }
        setIsEditing(!isEditing);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const payload = {
            id: editData.id,
            name: editData.name,
            birthDate: editData.birthDate,
            phoneNumber: editData.phoneNumber,
            email: editData.email,
            description: editData.description,
            cep: editData.zipCode,
            number: editData.number,
            complement: editData.complement,
            artisticField: editData.artisticField // Adicione artisticField se for editável
        };

        try {
            const response = await updateArtistProfile(payload);
            setProfileData(response.data);
            setIsEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || "Erro ao salvar. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ... (funções de imagem permanecem as mesmas)
    const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (error && !isEditing) return <div className={styles.error}>{error}</div>; // Mostra erro principal se não estiver editando
    if (!profileData) return null;

    const formattedBirthDate = new Date(profileData.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    const displayImage = profileData.profilePictureUrl || placeholderImage;

    return (
        <>
            <Modal isOpen={isCropperOpen} onClose={() => setIsCropperOpen(false)}>
                {/* ... (código do modal de cropper) ... */}
            </Modal>

            <div className={styles.profileContainer}>
                <header className={styles.profileHeader}>
                    {/* ... (código do header com a imagem e nome) ... */}
                </header>

                <form onSubmit={handleSave}>
                    <div className={styles.editToggle}>
                        {!isEditing ? (
                            <Button type="button" onClick={handleEditToggle}>Editar Dados</Button>
                        ) : (
                            <p className={styles.editingLabel}>Modo de Edição</p>
                        )}
                    </div>

                    <section className={styles.profileDetails}>
                        <h2>Meus Dados</h2>
                        <div className={styles.detailsGrid}>
                            {/* Nome */}
                            <div className={styles.detailItem}>
                                <label>Nome</label>
                                {isEditing ? (
                                    <input name="name" value={editData.name || ''} onChange={handleEditChange} className={styles.inputField} />
                                ) : (
                                    <p>{profileData.name}</p>
                                )}
                            </div>

                            {/* Telefone */}
                            <div className={styles.detailItem}>
                                <label>Telefone</label>
                                {isEditing ? (
                                    <input name="phoneNumber" value={editData.phoneNumber || ''} onChange={handleEditChange} className={styles.inputField} />
                                ) : (
                                    <p>{profileData.phoneNumber}</p>
                                )}
                            </div>

                            {/* Endereço - CEP */}
                            <div className={styles.detailItem}>
                                <label>CEP</label>
                                {isEditing ? (
                                    <input name="zipCode" value={editData.zipCode || ''} onChange={handleEditChange} className={styles.inputField} />
                                ) : (
                                    <p>{profileData.address.zipCode}</p>
                                )}
                            </div>
                            {/* Endereço - Número */}
                            <div className={styles.detailItem}>
                                <label>Número</label>
                                {isEditing ? (
                                    <input name="number" value={editData.number || ''} onChange={handleEditChange} className={styles.inputField} />
                                ) : (
                                    <p>{profileData.address.number}</p>
                                )}
                            </div>
                        </div>

                        {/* Descrição do Artista */}
                        {user.scope === 'ARTIST' && (
                            <div className={styles.artistDescription}>
                                <h2>Sobre Mim</h2>
                                {isEditing ? (
                                    <textarea name="description" value={editData.description || ''} onChange={handleEditChange} className={styles.textareaField} rows="5" />
                                ) : (
                                    <p>{profileData.description || 'Nenhuma descrição adicionada.'}</p>
                                )}
                            </div>
                        )}
                    </section>

                    {isEditing && (
                        <div className={styles.actionsContainer}>
                            {error && <p className={styles.error}>{error}</p>}
                            <Button type="button" onClick={handleEditToggle}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </>
    );
};

export default ProfilePage;