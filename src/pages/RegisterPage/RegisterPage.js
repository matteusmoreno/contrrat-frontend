// src/pages/RegisterPage/RegisterPage.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import styles from './RegisterPage.module.css';
import { createArtist, createCustomer, uploadImage, getArtisticFields } from '../../services/api';
import Button from '../../components/Button/Button';
import InputField from '../../components/InputField/InputField';
import Modal from '../../components/Modal/Modal';
import AutocompleteInput from '../../components/AutocompleteInput/AutocompleteInput';

const placeholderImage = "https://via.placeholder.com/150x150.png/1E1E1E/EAEAEA?text=Foto+de+Perfil";

const RegisterPage = () => {
    const [profileType, setProfileType] = useState('CUSTOMER');
    const [formData, setFormData] = useState({
        name: '',
        birthDate: '',
        phoneNumber: '',
        email: '',
        password: '',
        cep: '',
        number: '',
        complement: '',
        description: '',
        profilePictureUrl: '',
        artisticField: '',
    });
    const [displayValues, setDisplayValues] = useState({
        birthDate: '',
        phoneNumber: '',
        cep: '',
    });
    const [artisticFieldOptions, setArtisticFieldOptions] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [croppedBlob, setCroppedBlob] = useState(null);


    const fileInputRef = useRef(null);
    const imgRef = useRef(null);

    useEffect(() => {
        const fetchFields = async () => {
            try {
                const response = await getArtisticFields();
                setArtisticFieldOptions(response.data);
            } catch (error) {
                console.error("Erro ao buscar áreas de atuação:", error);
            }
        };
        fetchFields();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArtisticFieldSelect = (option) => {
        setFormData(prev => ({ ...prev, artisticField: option.name }));
    };

    const handleMaskedChange = (e) => {
        const { name, value } = e.target;
        const rawValue = value.replace(/\D/g, '');
        let maskedValue = value; // Manter o que o usuário digita

        if (name === 'birthDate') {
            maskedValue = rawValue.replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3').slice(0, 10);
            if (rawValue.length === 8) {
                const day = rawValue.slice(0, 2);
                const month = rawValue.slice(2, 4);
                const year = rawValue.slice(4, 8);
                setFormData(prev => ({ ...prev, birthDate: `${year}-${month}-${day}` }));
            }
        } else if (name === 'phoneNumber') {
            maskedValue = rawValue.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 15);
            setFormData(prev => ({ ...prev, phoneNumber: maskedValue.replace(/\D/g, '') }));
        } else if (name === 'cep') {
            maskedValue = rawValue.replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
            setFormData(prev => ({ ...prev, cep: maskedValue }));
        }

        setDisplayValues(prev => ({ ...prev, [name]: maskedValue }));
    };


    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setCrop(undefined);
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImgSrc(reader.result?.toString() || '');
                setIsCropperOpen(true);
            });
            reader.readAsDataURL(file);
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
    };

    const handleCropConfirm = () => {
        if (!completedCrop || !imgRef.current) {
            setError("Área de corte inválida.");
            return;
        }

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            imgRef.current,
            completedCrop.x * scaleX, completedCrop.y * scaleY,
            completedCrop.width * scaleX, completedCrop.height * scaleY,
            0, 0, canvas.width, canvas.height
        );

        canvas.toBlob((blob) => {
            if (!blob) {
                setError("Não foi possível processar a imagem.");
                return;
            }
            setCroppedBlob(blob);
            // Mostra a imagem cortada no preview
            setImgSrc(URL.createObjectURL(blob));
            setIsCropperOpen(false);
        }, 'image/jpeg');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        let finalFormData = { ...formData };

        try {
            if (croppedBlob) {
                const imageUrl = await uploadImage(croppedBlob);
                finalFormData.profilePictureUrl = imageUrl;
            }

            if (profileType === 'ARTIST') {
                await createArtist(finalFormData);
            } else {
                await createCustomer(finalFormData);
            }

            setSuccess('Cadastro realizado com sucesso! Você será redirecionado para o login.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            const errorMessage = err.response?.data || 'Erro ao realizar o cadastro. Verifique seus dados.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Modal isOpen={isCropperOpen} onClose={() => setIsCropperOpen(false)}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--texto-primario)' }}>Recorte sua Imagem</h3>
                {imgSrc && (
                    <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={1} circularCrop>
                        <img ref={imgRef} alt="Recorte" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '70vh' }} />
                    </ReactCrop>
                )}
                <div style={{ marginTop: '1rem' }}>
                    <Button onClick={handleCropConfirm}>Confirmar Corte</Button>
                </div>
            </Modal>

            <div className={styles.registerContainer}>
                <form className={styles.registerForm} onSubmit={handleSubmit}>
                    <h2>Crie sua Conta</h2>

                    <div className={styles.profileImageContainer} onClick={handleImageClick}>
                        <img src={imgSrc || placeholderImage} alt="Foto de Perfil" className={styles.profileImagePreview} />
                        <div className={styles.imageOverlay}>
                            <span>&#128247;</span>
                            <span>Adicionar Foto</span>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={onSelectFile}
                            accept="image/png, image/jpeg"
                        />
                    </div>

                    <div className={styles.toggleContainer}>
                        <button type="button" className={`${styles.toggleButton} ${profileType === 'CUSTOMER' ? styles.active : ''}`} onClick={() => setProfileType('CUSTOMER')}>
                            Sou Contratante
                        </button>
                        <button type="button" className={`${styles.toggleButton} ${profileType === 'ARTIST' ? styles.active : ''}`} onClick={() => setProfileType('ARTIST')}>
                            Sou Artista
                        </button>
                    </div>

                    <InputField id="name" name="name" label="Nome Completo" value={formData.name} onChange={handleChange} required />
                    <InputField id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
                    <InputField id="password" name="password" label="Senha" type="password" value={formData.password} onChange={handleChange} required />
                    <InputField id="birthDate" name="birthDate" label="Data de Nascimento" type="text" value={displayValues.birthDate} onChange={handleMaskedChange} required maxLength="10" placeholder="dd/mm/aaaa" />
                    <InputField id="phoneNumber" name="phoneNumber" label="Telefone" value={displayValues.phoneNumber} onChange={handleMaskedChange} required maxLength="15" placeholder="(xx) xxxxx-xxxx" />

                    {profileType === 'ARTIST' && (
                        <>
                            <AutocompleteInput
                                label="Área de Atuação"
                                options={artisticFieldOptions}
                                onSelect={handleArtisticFieldSelect}
                                required
                            />
                            <InputField id="description" name="description" label="Descrição (Fale sobre sua arte)" value={formData.description} onChange={handleChange} />
                        </>
                    )}

                    <div className={styles.formSection}>
                        <h3>Endereço</h3>
                        <InputField id="cep" name="cep" label="CEP" value={displayValues.cep} onChange={handleMaskedChange} required maxLength="9" placeholder="xxxxx-xxx" />
                        <InputField id="number" name="number" label="Número" value={formData.number} onChange={handleChange} required />
                        <InputField id="complement" name="complement" label="Complemento (Opcional)" value={formData.complement} onChange={handleChange} />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}
                    {success && <p className={styles.success}>{success}</p>}

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>

                    <p className={styles.formFooter}>
                        Já tem uma conta? <Link to="/login">Faça login</Link>
                    </p>
                </form>
            </div>
        </>
    );
};

export default RegisterPage;