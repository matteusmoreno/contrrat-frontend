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
import ProfileTypeSelection from '../../components/ProfileTypeSelection/ProfileTypeSelection';
import PasswordStrengthBar from 'react-password-strength-bar';

const placeholderImage = "https://via.placeholder.com/150x150.png/1E1E1E/EAEAEA?text=Foto+de+Perfil";

const RegisterPage = () => {
    const [view, setView] = useState('SELECT_TYPE');
    const [profileType, setProfileType] = useState('');
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', birthDate: '', phoneNumber: '', email: '', password: '',
        cep: '', number: '', complement: '', description: '', artisticField: '',
        profilePictureUrl: '',
    });
    const [confirmations, setConfirmations] = useState({
        confirmEmail: '', confirmPassword: ''
    });
    const [displayValues, setDisplayValues] = useState({
        birthDate: '', phoneNumber: '', cep: '',
    });
    const [artisticFieldOptions, setArtisticFieldOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // --- Estados para a imagem ---
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [croppedBlob, setCroppedBlob] = useState(null);
    const fileInputRef = useRef(null);
    const imgRef = useRef(null);
    // --- Fim dos estados da imagem ---

    const totalSteps = profileType === 'ARTIST' ? 4 : 3;

    useEffect(() => {
        if (profileType === 'ARTIST') {
            const fetchFields = async () => {
                try {
                    const response = await getArtisticFields();
                    setArtisticFieldOptions(response.data);
                } catch (error) {
                    console.error("Erro ao buscar áreas de atuação:", error);
                }
            };
            fetchFields();
        }
    }, [profileType]);

    const handleSelectType = (type) => {
        setProfileType(type);
        setView('FILL_FORM');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setErrors(prev => ({ ...prev, [name]: undefined }));
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirmationChange = (e) => {
        const { name, value } = e.target;
        setErrors(prev => ({ ...prev, [name]: undefined }));
        setConfirmations(prev => ({ ...prev, [name]: value }));
    }

    const handleArtisticFieldSelect = (option) => {
        setErrors(prev => ({ ...prev, artisticField: undefined }));
        setFormData(prev => ({ ...prev, artisticField: option.name }));
    };

    const handleMaskedChange = (e) => {
        const { name, value } = e.target;
        setErrors(prev => ({ ...prev, [name]: undefined }));
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
                setFormData(prev => ({ ...prev, birthDate: '' }));
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

    // --- Funções de Imagem ---
    const handleImageClick = () => fileInputRef.current.click();

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
        const initialCrop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height);
        setCrop(initialCrop);
    };

    const handleCropConfirm = () => {
        if (!completedCrop || !imgRef.current) return;

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgRef.current, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (!blob) return;
            setCroppedBlob(blob);
            setImgSrc(URL.createObjectURL(blob)); // Atualiza a preview
            setIsCropperOpen(false);
        }, 'image/jpeg');
    };
    // --- Fim das Funções de Imagem ---

    const validateStep = () => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.name) newErrors.name = 'Nome é obrigatório.';
            if (!formData.birthDate) newErrors.birthDate = 'Data de nascimento é obrigatória.';
            if (!formData.phoneNumber) newErrors.phoneNumber = 'Telefone é obrigatório.';
        }
        if (step === 2) {
            if (!formData.email) newErrors.email = 'Email é obrigatório.';
            if (formData.email !== confirmations.confirmEmail) newErrors.confirmEmail = 'Os emails não coincidem.';
            if (!formData.password) newErrors.password = 'Senha é obrigatória.';
            if (formData.password.length < 6) newErrors.password = 'A senha deve ter no mínimo 6 caracteres.';
            if (formData.password !== confirmations.confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem.';
        }
        if (step === 3 && profileType === 'ARTIST') {
            if (!formData.artisticField) newErrors.artisticField = 'Área de atuação é obrigatória.';
        }
        const addressStep = profileType === 'ARTIST' ? 4 : 3;
        if (step === addressStep) {
            if (!formData.cep) newErrors.cep = 'CEP é obrigatório.';
            if (!formData.number) newErrors.number = 'Número é obrigatório.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            if (step < totalSteps) {
                setStep(step + 1);
            } else {
                handleSubmit();
            }
        }
    };

    const handlePrevious = () => {
        setApiError('');
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;
        setApiError('');
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
            navigate('/login', { state: { successMessage: 'Cadastro realizado com sucesso! Faça o login.' } });
        } catch (err) {
            const errorMessage = err.response?.data || 'Erro ao realizar o cadastro. Verifique seus dados.';
            setApiError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (view === 'SELECT_TYPE') {
        return <ProfileTypeSelection onSelectType={handleSelectType} />;
    }

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
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={onSelectFile} accept="image/png, image/jpeg" />

                <div className={styles.registerForm}>
                    <div className={styles.formHeader}>
                        <h2>Crie sua Conta de {profileType === 'ARTIST' ? 'Artista' : 'Contratante'}</h2>
                        <p>Passo {step} de {totalSteps}</p>
                    </div>

                    <div className={styles.progressBar}>
                        {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
                            <React.Fragment key={s}>
                                <div className={`${styles.progressStep} ${step >= s ? styles.active : ''}`}>{s}</div>
                                {s < totalSteps && <div className={`${styles.progressConnector} ${step > s ? styles.active : ''}`}></div>}
                            </React.Fragment>
                        ))}
                    </div>

                    {apiError && <p className={styles.error}>{apiError}</p>}

                    <div className={styles.stepContent}>
                        {step === 1 && (
                            <>
                                <h3 className={styles.stepTitle}>Informações Pessoais</h3>
                                <div className={styles.profileImageContainer} onClick={handleImageClick}>
                                    <img src={imgSrc || placeholderImage} alt="Foto de Perfil" className={styles.profileImagePreview} />
                                    <div className={styles.imageOverlay}>
                                        <span>&#128247;</span>
                                        <span>Adicionar Foto</span>
                                    </div>
                                </div>
                                <InputField name="name" label="Nome Completo" value={formData.name} onChange={handleChange} error={errors.name} required />
                                <InputField name="birthDate" label="Data de Nascimento" value={displayValues.birthDate} onChange={handleMaskedChange} error={errors.birthDate} required maxLength="10" placeholder="dd/mm/aaaa" />
                                <InputField name="phoneNumber" label="Telefone" value={displayValues.phoneNumber} onChange={handleMaskedChange} error={errors.phoneNumber} required maxLength="15" placeholder="(xx) xxxxx-xxxx" />
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h3 className={styles.stepTitle}>Informações de Acesso</h3>
                                <InputField name="email" label="Email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required />
                                <InputField name="confirmEmail" label="Confirme seu Email" type="email" value={confirmations.confirmEmail} onChange={handleConfirmationChange} error={errors.confirmEmail} required />
                                <InputField name="password" label="Senha" type="password" value={formData.password} onChange={handleChange} error={errors.password} required />
                                <PasswordStrengthBar password={formData.password} className={styles.passwordStrengthBar} />
                                <InputField name="confirmPassword" label="Confirme sua Senha" type="password" value={confirmations.confirmPassword} onChange={handleConfirmationChange} error={errors.confirmPassword} required />
                            </>
                        )}

                        {step === 3 && profileType === 'ARTIST' && (
                            <>
                                <h3 className={styles.stepTitle}>Sobre sua Arte</h3>
                                <AutocompleteInput label="Área de Atuação" options={artisticFieldOptions} onSelect={handleArtisticFieldSelect} />
                                {errors.artisticField && <p className={styles.error} style={{ textAlign: 'left', marginTop: '-1rem', marginBottom: '1rem' }}>{errors.artisticField}</p>}
                                <div className={styles.inputGroup}>
                                    <label htmlFor="description">Descrição</label>
                                    <textarea id="description" name="description" className={styles.descriptionTextarea} value={formData.description} onChange={handleChange} placeholder="Fale sobre seu trabalho, sua experiência e o que você oferece." />
                                </div>
                            </>
                        )}

                        {((step === 3 && profileType === 'CUSTOMER') || (step === 4 && profileType === 'ARTIST')) && (
                            <>
                                <h3 className={styles.stepTitle}>Endereço</h3>
                                <InputField name="cep" label="CEP" value={displayValues.cep} onChange={handleMaskedChange} error={errors.cep} required maxLength="9" placeholder="xxxxx-xxx" />
                                <InputField name="number" label="Número" value={formData.number} onChange={handleChange} error={errors.number} required />
                                <InputField name="complement" label="Complemento (Opcional)" value={formData.complement} onChange={handleChange} />
                            </>
                        )}
                    </div>

                    <div className={styles.formActions}>
                        {step > 1 ? (
                            <Button type="button" variant="outline" onClick={handlePrevious}>
                                Voltar
                            </Button>
                        ) : (
                            <Button type="button" variant="outline" onClick={() => setView('SELECT_TYPE')}>
                                Mudar Perfil
                            </Button>
                        )}

                        <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                            {step === totalSteps ? (isSubmitting ? 'Finalizando...' : 'Finalizar Cadastro') : 'Avançar'}
                        </Button>
                    </div>

                    <p className={styles.formFooter}>
                        Já tem uma conta? <Link to="/login">Faça login</Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;