// src/pages/CustomerDashboardPage/CustomerDashboardPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, getContractsForCustomer, uploadImage, updateProfilePicture, getAvailabilityById } from '../../services/api';
import styles from './CustomerDashboardPage.module.css';
import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import CustomerProfileSummary from '../../components/CustomerProfileSummary/CustomerProfileSummary';
import ContractList from '../../components/ContractList/ContractList';
import Modal from '../../components/Modal/Modal';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const CustomerDashboardPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [contracts, setContracts] = useState([]);
    const [allAvailabilities, setAllAvailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Estados para o Modal de Imagem ---
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const imgRef = useRef(null);
    // --- Fim dos Estados para o Modal de Imagem ---

    const fetchCustomerData = useCallback(async () => {
        if (user?.customerId) {
            setLoading(true);
            setError(null);
            try {
                const [profileResponse, contractsResponse] = await Promise.all([
                    getProfile('CUSTOMER', user.customerId),
                    getContractsForCustomer()
                ]);

                const profile = profileResponse.data;
                const fetchedContracts = contractsResponse.data.content || [];

                const confirmedContracts = fetchedContracts.filter(c => c.status === 'CONFIRMED');
                const availabilityIds = confirmedContracts.flatMap(c => c.availabilityIds);
                const uniqueAvailabilityIds = [...new Set(availabilityIds)];

                if (uniqueAvailabilityIds.length > 0) {
                    const availabilityPromises = uniqueAvailabilityIds.map(id => getAvailabilityById(id));
                    const availabilityResponses = await Promise.all(availabilityPromises);
                    const fetchedAvailabilities = availabilityResponses.map(res => res.data);
                    setAllAvailabilities(fetchedAvailabilities);
                }

                setProfileData(profile);
                setContracts(fetchedContracts);

            } catch (err) {
                console.error("Erro ao buscar dados do cliente:", err);
                setError("Não foi possível carregar os dados do dashboard.");
            } finally {
                setLoading(false);
            }
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading) {
            fetchCustomerData();
        }
    }, [user, authLoading, fetchCustomerData]);

    // --- Funções para o Modal de Imagem ---
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
            width, height
        );
        setCrop(initialCrop);
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
            completedCrop.x * scaleX, completedCrop.y * scaleY,
            completedCrop.width * scaleX, completedCrop.height * scaleY,
            0, 0, canvas.width, canvas.height
        );

        canvas.toBlob(async (blob) => {
            if (!blob) {
                setError("Não foi possível processar a imagem.");
                setUploading(false);
                return;
            }
            try {
                const imageUrl = await uploadImage(blob);
                const profileType = user.authorities === 'ROLE_ARTIST' ? 'ARTIST' : 'CUSTOMER';
                await updateProfilePicture(profileType, imageUrl);
                setProfileData(prev => ({ ...prev, profilePictureUrl: imageUrl }));
            } catch (err) {
                console.error("Erro no upload:", err);
                setError("Falha ao enviar a imagem. Tente novamente.");
            } finally {
                setUploading(false);
                setImgSrc('');
            }
        }, 'image/jpeg');
    };
    // --- Fim das Funções para o Modal de Imagem ---


    if (authLoading || loading) {
        return <div className={styles.message}>Carregando...</div>;
    }

    if (error) {
        return <div className={styles.messageError}>{error}</div>;
    }

    if (!profileData) {
        return <div className={styles.message}>Não foi possível carregar o perfil.</div>;
    }

    const pendingContracts = contracts.filter(c => c.status === 'PENDING_CONFIRMATION');

    const upcomingConfirmedContracts = contracts
        .filter(c => c.status === 'CONFIRMED')
        .map(c => {
            const startTimes = c.availabilityIds.map(id => {
                const availability = allAvailabilities.find(a => a.id === id);
                return availability ? new Date(availability.startTime) : null;
            }).filter(Boolean);

            const earliestStartTime = startTimes.length > 0 ? new Date(Math.min.apply(null, startTimes)) : null;

            return {
                ...c,
                sortDate: earliestStartTime
            };
        })
        .filter(c => c.sortDate && c.sortDate > new Date())
        .sort((a, b) => a.sortDate - b.sortDate);

    const confirmedContractsToShow = upcomingConfirmedContracts.slice(0, 2);

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
                        <img ref={imgRef} alt="Recorte" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '70vh' }} />
                    </ReactCrop>
                )}
                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <Button onClick={handleCropAndUpload} disabled={uploading}>
                        {uploading ? 'Enviando...' : 'Salvar Imagem'}
                    </Button>
                </div>
            </Modal>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={onSelectFile}
                accept="image/png, image/jpeg"
            />

            <div className={styles.dashboardGrid}>
                <aside className={styles.sidebar}>
                    <CustomerProfileSummary
                        profileData={profileData}
                        onImageClick={handleImageClick}
                        isUploading={uploading}
                    />
                </aside>
                <main className={styles.mainContent}>
                    <div className={styles.ctaCard}>
                        <h2>Encontre o artista ideal para seu próximo evento</h2>
                        <p>Milhares de talentos esperando por você.</p>
                        <Link to="/artistas">
                            <Button variant="primary">Buscar Artistas</Button>
                        </Link>
                    </div>
                    {pendingContracts.length > 0 && (
                        <ContractList
                            title="Contratos Pendentes"
                            contracts={pendingContracts}
                            onAction={fetchCustomerData}
                        />
                    )}

                    {upcomingConfirmedContracts.length > 0 && (
                        <div className={styles.nextEventsSection}>
                            <ContractList
                                title={`Próximos Eventos (${upcomingConfirmedContracts.length})`}
                                contracts={confirmedContractsToShow}
                                onAction={fetchCustomerData}
                            />
                            {upcomingConfirmedContracts.length > 2 && (
                                <div className={styles.allContractsButton}>
                                    <Link to="/meus-contratos">Ver Todos os Contratos</Link>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default CustomerDashboardPage;