// src/pages/ProfilePage/ProfilePage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, uploadImage, updateProfilePicture, getArtisticFields, updateArtist, updateCustomer } from '../../services/api';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import styles from './ProfilePage.module.css';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import InputField from '../../components/InputField/InputField';
import AutocompleteInput from '../../components/AutocompleteInput/AutocompleteInput';
import TextareaField from '../../components/TextareaField/TextareaField';

const placeholderImage = "https://via.placeholder.com/150x150.png/1E1E1E/EAEAEA?text=Perfil";

const EditProfilePage = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [initialData, setInitialData] = useState(null);
    const [formData, setFormData] = useState(null);
    const [displayValues, setDisplayValues] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [artisticFieldOptions, setArtisticFieldOptions] = useState([]);

    // Estado para o cropper de imagem
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const imgRef = useRef(null);

    // Busca os dados iniciais do perfil
    useEffect(() => {
        const fetchProfileData = async () => {
            if (user) {
                setLoading(true);
                setError(null);
                try {
                    const profileId = user.scope === 'ARTIST' ? user.artistId : user.customerId;
                    if (!profileId) throw new Error("ID do perfil não encontrado.");

                    const [profileResponse, fieldsResponse] = await Promise.all([
                        getProfile(user.scope, profileId),
                        user.scope === 'ARTIST' ? getArtisticFields() : Promise.resolve({ data: [] })
                    ]);

                    const data = profileResponse.data;
                    const initialFormData = {
                        id: data.id,
                        name: data.name,
                        email: data.email,
                        phoneNumber: data.phoneNumber,
                        birthDate: data.birthDate.split('T')[0], // Formato YYYY-MM-DD
                        description: data.description || '',
                        artisticField: data.artisticField,
                        cep: data.address.zipCode,
                        number: data.address.number,
                        complement: data.address.complement || '',
                        profilePictureUrl: data.profilePictureUrl // Adiciona a URL da foto de perfil
                    };

                    setFormData(initialFormData);
                    setInitialData(initialFormData);

                    // Prepara os valores de exibição com máscaras
                    const birthDateFormatted = new Date(data.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                    const phoneFormatted = data.phoneNumber.replace(/^(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
                    setDisplayValues({
                        birthDate: birthDateFormatted,
                        phoneNumber: phoneFormatted,
                        cep: data.address.zipCode
                    });

                    if (user.scope === 'ARTIST') {
                        setArtisticFieldOptions(fieldsResponse.data);
                    }

                } catch (err) {
                    console.error("Erro ao buscar perfil:", err);
                    setError("Não foi possível carregar os dados do perfil.");
                } finally {
                    setLoading(false);
                }
            }
        };
        if (!authLoading) {
            fetchProfileData();
        }
    }, [user, authLoading]);

    // Verifica se o formulário foi alterado
    useEffect(() => {
        if (initialData && formData) {
            // Exclui 'profilePictureUrl' da comparação para não marcar como 'dirty' se só a imagem mudar
            const comparableFormData = { ...formData };
            delete comparableFormData.profilePictureUrl;
            const comparableInitialData = { ...initialData };
            delete comparableInitialData.profilePictureUrl;

            setIsDirty(JSON.stringify(comparableFormData) !== JSON.stringify(comparableInitialData));
        }
    }, [formData, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMaskedChange = (e) => {
        const { name, value } = e.target;
        const rawValue = value.replace(/\D/g, '');
        let maskedValue = value;

        if (name === 'birthDate') {
            maskedValue = rawValue.replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3').slice(0, 10);
            if (rawValue.length === 8) {
                const day = rawValue.slice(0, 2);
                const month = rawValue.slice(2, 4);
                const year = rawValue.slice(4, 8);
                setFormData(prev => ({ ...prev, birthDate: `${year}-${month}-${day}` }));
            } else {
                setFormData(prev => ({ ...prev, birthDate: '' })); // Limpa se incompleto ou inválido
            }
        } else if (name === 'phoneNumber') {
            maskedValue = rawValue.replace(/^(\d{2})(\d{4,5})(\d{4})/, '($1)$2-$3');
            setFormData(prev => ({ ...prev, phoneNumber: maskedValue }));
        } else if (name === 'cep') {
            maskedValue = rawValue.replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
            setFormData(prev => ({ ...prev, cep: maskedValue }));
        }

        setDisplayValues(prev => ({ ...prev, [name]: maskedValue }));
    };

    const handleArtisticFieldSelect = (option) => {
        setFormData(prev => ({ ...prev, artisticField: option.name }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        // Envia apenas os campos que foram alterados
        const changedData = {};
        for (const key in formData) {
            // Garante que 'profilePictureUrl' não seja enviado a menos que seja um campo do backend
            if (key !== 'profilePictureUrl' && formData[key] !== initialData[key]) {
                changedData[key] = formData[key];
            }
        }

        // Sempre envia o ID
        changedData.id = formData.id;

        // Se nenhum campo de texto foi alterado, mas a foto sim, não tente atualizar o perfil
        if (Object.keys(changedData).length === 1 && changedData.hasOwnProperty('id')) {
            setError("Nenhuma alteração detectada para salvar.");
            setIsSubmitting(false);
            return;
        }


        try {
            let response;
            if (user.scope === 'ARTIST') {
                response = await updateArtist(changedData);
            } else {
                response = await updateCustomer(changedData);
            }

            // Atualiza o estado inicial com os novos dados salvos
            const data = response.data;
            const newInitialData = {
                id: data.id,
                name: data.name,
                email: data.email,
                phoneNumber: data.phoneNumber,
                birthDate: data.birthDate.split('T')[0],
                description: data.description || '',
                artisticField: data.artisticField,
                cep: data.address.zipCode,
                number: data.address.number,
                complement: data.address.complement || '',
                profilePictureUrl: initialData.profilePictureUrl // Mantém a URL da foto de perfil
            };
            setInitialData(newInitialData);
            setFormData(newInitialData);

            setSuccess('Perfil atualizado com sucesso!');
            setTimeout(() => setSuccess(''), 3000); // Limpa a mensagem de sucesso

        } catch (err) {
            const errorMessage = err.response?.data || 'Erro ao atualizar o perfil.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Funções de Upload de Imagem ---
    const handleImageClick = () => { if (!uploading) fileInputRef.current.click(); };

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
        const initialCrop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height);
        setCrop(initialCrop);
    };

    const handleCropAndUpload = () => {
        if (!completedCrop || !imgRef.current) return;
        setUploading(true);
        setIsCropperOpen(false);
        setError(null); // Limpa erros anteriores antes de um novo upload

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgRef.current, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
            try {
                const imageUrl = await uploadImage(blob);
                await updateProfilePicture(user.scope, imageUrl);
                setInitialData(prev => ({ ...prev, profilePictureUrl: imageUrl })); // Atualiza a foto imediatamente no estado
                setSuccess('Foto de perfil atualizada!');
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError("Falha ao enviar a imagem.");
            } finally {
                setUploading(false);
                setImgSrc('');
            }
        }, 'image/jpeg');
    };
    // --- Fim das Funções de Upload ---

    if (loading || authLoading) return <div className={styles.message}>Carregando...</div>;
    if (error && !formData) return <div className={styles.messageError}>{error}</div>; // Exibe erro se não conseguir carregar o perfil
    if (!formData || !initialData) return null; // Não renderiza o formulário enquanto os dados não estiverem prontos

    return (
        <>
            <Modal isOpen={isCropperOpen} onClose={() => setIsCropperOpen(false)}>
                <h3>Recorte sua Imagem</h3>
                {imgSrc && (
                    <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={(c) => setCompletedCrop(c)} aspect={1} circularCrop>
                        <img ref={imgRef} alt="Recorte" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '70vh' }} />
                    </ReactCrop>
                )}
                <div className={styles.modalActions}>
                    <Button onClick={handleCropAndUpload} disabled={uploading}>{uploading ? 'Enviando...' : 'Salvar Imagem'}</Button>
                </div>
            </Modal>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={onSelectFile} accept="image/png, image/jpeg" />


            <div className={styles.pageContainer}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <header className={styles.header}>
                        <div className={styles.imageContainer} onClick={handleImageClick} title="Clique para alterar sua foto">
                            {/* **ALTERAÇÃO AQUI**: Usa initialData.profilePictureUrl para exibir a foto atual */}
                            {uploading ? <div className={styles.imageLoader}></div> : <img src={initialData.profilePictureUrl || placeholderImage} alt="Perfil" className={styles.profileImage} />}
                            <div className={styles.imageOverlay}><span>&#128247;</span></div>
                        </div>
                        <div className={styles.headerInfo}>
                            <h1>Editar Perfil</h1>
                            <p>Mantenha seus dados sempre atualizados.</p>
                        </div>
                    </header>

                    {error && <p className={styles.formError}>{error}</p>}
                    {success && <p className={styles.formSuccess}>{success}</p>}

                    <div className={styles.formSection}>
                        <h2>Dados Pessoais</h2>
                        <div className={styles.grid}>
                            <InputField id="name" name="name" label="Nome Completo" value={formData.name} onChange={handleChange} required />
                            <InputField id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
                            <InputField id="phoneNumber" name="phoneNumber" label="Telefone" value={displayValues.phoneNumber} onChange={handleMaskedChange} required maxLength={15} placeholder="(xx) xxxxx-xxxx" />
                            <InputField id="birthDate" name="birthDate" label="Data de Nascimento" value={displayValues.birthDate} onChange={handleMaskedChange} required maxLength={10} placeholder="dd/mm/aaaa" />
                        </div>
                    </div>

                    {user.scope === 'ARTIST' && (
                        <div className={styles.formSection}>
                            <h2>Sobre sua Arte</h2>
                            <div className={styles.grid}>
                                <AutocompleteInput label="Área de Atuação" options={artisticFieldOptions} onSelect={handleArtisticFieldSelect} initialValue={initialData.artisticField} required />
                                <div className={styles.fullWidth}>
                                    <TextareaField id="description" name="description" label="Descrição / Biografia" value={formData.description} onChange={handleChange} rows={5} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.formSection}>
                        <h2>Endereço</h2>
                        <div className={styles.grid}>
                            <InputField id="cep" name="cep" label="CEP" value={displayValues.cep} onChange={handleMaskedChange} required maxLength={9} placeholder="xxxxx-xxx" />
                            <InputField id="number" name="number" label="Número" value={formData.number} onChange={handleChange} required />
                            <InputField id="complement" name="complement" label="Complemento (Opcional)" value={formData.complement} onChange={handleChange} />
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <Button type="button" onClick={() => navigate(-1)} >Voltar</Button>
                        <Button type="submit" disabled={!isDirty || isSubmitting}>
                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default EditProfilePage;