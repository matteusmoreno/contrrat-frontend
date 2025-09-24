// src/pages/ArtistDashboardPage/ArtistDashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ArtistDashboardPage.module.css';
import ProfileSummary from '../../components/ProfileSummary/ProfileSummary';
import TodaySchedule from '../../components/TodaySchedule/TodaySchedule';
import Button from '../../components/Button/Button';
import Calendar from '../../components/Calendar/Calendar';
import { getAllAvailabilityByArtistId, getProfile, createAvailability, updateAvailability, deleteAvailability } from '../../services/api';

// Helper para formatar a data para a API
const formatAsLocalDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:00:00`;
};

const ArtistDashboardPage = () => {
    const { user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);

    const [todayAvailabilities, setTodayAvailabilities] = useState({});
    const [initialTodayAvailabilities, setInitialTodayAvailabilities] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [allAvailabilities, setAllAvailabilities] = useState([]);


    const fetchArtistData = useCallback(async () => {
        if (user?.artistId) {
            setPageLoading(true);
            try {
                const [availResponse, profileResponse] = await Promise.all([
                    getAllAvailabilityByArtistId(user.artistId),
                    getProfile('ARTIST', user.artistId)
                ]);

                const fetchedAvailabilities = availResponse.data.content || [];
                setAllAvailabilities(fetchedAvailabilities);

                const today = new Date();
                const filteredToday = fetchedAvailabilities.filter(avail => {
                    const availDate = new Date(avail.startTime);
                    return availDate.toDateString() === today.toDateString();
                });

                const state = {};
                for (let i = 0; i < 24; i++) {
                    state[i] = { status: 'FREE', price: '', id: null };
                }
                filteredToday.forEach(avail => {
                    const startHour = new Date(avail.startTime).getHours();
                    state[startHour] = {
                        id: avail.id,
                        status: avail.availabilityStatus,
                        price: avail.price || '',
                    };
                });

                setTodayAvailabilities(JSON.parse(JSON.stringify(state)));
                setInitialTodayAvailabilities(JSON.parse(JSON.stringify(state)));
                setProfileData(profileResponse.data);
                setIsDirty(false);
                setError('');

            } catch (error) {
                console.error("Erro ao buscar dados do artista:", error);
                if (error.response && error.response.status === 404) {
                    alert("Seus dados de perfil de artista não foram encontrados. Por favor, realize o login novamente.");
                    logout();
                    navigate('/login');
                }
            } finally {
                setPageLoading(false);
            }
        }
    }, [user, logout, navigate]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchArtistData();
        } else if (!authLoading) {
            setPageLoading(false);
        }
    }, [authLoading, user, fetchArtistData]);

    const handleAvailabilitiesChange = (newAvailabilities) => {
        setTodayAvailabilities(newAvailabilities);
        setIsDirty(JSON.stringify(newAvailabilities) !== JSON.stringify(initialTodayAvailabilities));
    };

    const handleCancel = () => {
        setTodayAvailabilities(initialTodayAvailabilities);
        setIsDirty(false);
        setError('');
    };

    const handleSave = async () => {
        setError('');
        setIsSubmitting(true);
        const promises = [];
        const today = new Date();

        for (let hour = 0; hour < 24; hour++) {
            const initial = initialTodayAvailabilities[hour];
            const current = todayAvailabilities[hour];
            const hasChanged = initial.status !== current.status || (current.status === 'AVAILABLE' && initial.price !== current.price);

            if (!hasChanged) continue;

            const startTime = new Date(today);
            startTime.setHours(hour, 0, 0, 0);
            const endTime = new Date(today);
            endTime.setHours(hour + 1, 0, 0, 0);

            if (current.status === 'AVAILABLE' && (!current.price || parseFloat(current.price) <= 0)) {
                setError(`Defina um preço válido para ${String(hour).padStart(2, '0')}:00.`);
                setIsSubmitting(false);
                return;
            }

            if (initial.status !== 'FREE' && current.status === 'FREE') {
                promises.push(deleteAvailability(initial.id));
            } else if (initial.status === 'FREE' && current.status !== 'FREE') {
                promises.push(createAvailability({
                    artistId: user.artistId,
                    startTime: formatAsLocalDateTime(startTime),
                    endTime: formatAsLocalDateTime(endTime),
                    price: current.status === 'AVAILABLE' ? current.price : null,
                    availabilityStatus: current.status
                }));
            } else if (initial.status !== 'FREE' && current.status !== 'FREE') {
                promises.push(updateAvailability({
                    id: initial.id,
                    startTime: formatAsLocalDateTime(startTime),
                    endTime: formatAsLocalDateTime(endTime),
                    price: current.status === 'AVAILABLE' ? current.price : null,
                    availabilityStatus: current.status
                }));
            }
        }

        try {
            await Promise.all(promises);
            fetchArtistData();
        } catch (err) {
            console.error("Erro ao salvar disponibilidades:", err);
            setError(err.response?.data?.message || err.response?.data || 'Não foi possível salvar as alterações.');
        } finally {
            setIsSubmitting(false);
        }
    };


    if (authLoading || pageLoading) {
        return <div className={styles.container}><p>Carregando dashboard...</p></div>;
    }

    if (!user || user.scope !== 'ARTIST') {
        return <div className={styles.container}><p>Acesso negado. Esta página é apenas para artistas.</p></div>;
    }

    if (!profileData) {
        return <div className={styles.container}><p>Não foi possível carregar os dados do perfil do artista.</p></div>;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthPreviews = Array.from({ length: 2 }, (_, i) => {
        const d = new Date(currentYear, currentMonth + i, 1);
        return { month: d.getMonth(), year: d.getFullYear() };
    });

    return (
        <div className={styles.dashboardGrid}>
            <aside className={styles.sidebar}>
                <ProfileSummary profileData={profileData} />
            </aside>

            <main className={styles.mainContent}>
                <TodaySchedule
                    availabilities={todayAvailabilities}
                    onAvailabilitiesChange={handleAvailabilitiesChange}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isDirty={isDirty}
                    isSubmitting={isSubmitting}
                    error={error}
                />

                <div className={styles.fullScheduleSection}>
                    <div className={styles.header}>
                        <h3 className={styles.sectionTitle}>Gerenciamento Completo</h3>
                        <p>Visualize sua agenda para os próximos meses.</p>
                    </div>

                    <div className={styles.calendarPreviewGrid}>
                        {monthPreviews.map(({ year, month }) => (
                            <Calendar
                                key={`${year}-${month}`}
                                year={year}
                                month={month}
                                availabilities={allAvailabilities}
                                onDateClick={() => navigate('/minha-agenda')}
                            />
                        ))}
                    </div>

                    <div className={styles.fullScheduleButton}>
                        <Link to="/minha-agenda">
                            <Button>Ver Calendário Completo</Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ArtistDashboardPage;