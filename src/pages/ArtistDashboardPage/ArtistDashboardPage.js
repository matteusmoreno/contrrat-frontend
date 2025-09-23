// src/pages/ArtistDashboardPage/ArtistDashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ArtistDashboardPage.module.css';
import HourAvailabilityModal from '../../components/AvailabilityModal/AvailabilityModal';
import ProfileSummary from '../../components/ProfileSummary/ProfileSummary';
import TodaySchedule from '../../components/TodaySchedule/TodaySchedule';
import Button from '../../components/Button/Button';
import { getAllAvailabilityByArtistId, getProfile } from '../../services/api';

const ArtistDashboardPage = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availabilities, setAvailabilities] = useState([]);

    const fetchArtistData = useCallback(async () => {
        if (user?.artistId) {
            try {
                const [availResponse, profileResponse] = await Promise.all([
                    getAllAvailabilityByArtistId(user.artistId),
                    getProfile('ARTIST', user.artistId)
                ]);
                setAvailabilities(availResponse.data.content || []);
                setProfileData(profileResponse.data);
            } catch (error) {
                console.error("Erro ao buscar dados do artista:", error);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchArtistData();
    }, [fetchArtistData]);

    const handleEditToday = () => {
        setSelectedDate(new Date());
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
        fetchArtistData();
    };

    const getAvailabilitiesForDate = (date) => {
        if (!date) return [];
        return availabilities.filter(avail => {
            const availDate = new Date(avail.startTime);
            return availDate.toDateString() === date.toDateString();
        });
    };

    if (!user || (user.scope !== 'ARTIST' && !profileData)) {
        return <div className={styles.container}><p>Carregando...</p></div>;
    }

    if (user.scope !== 'ARTIST') {
        return <div className={styles.container}><p>Acesso negado. Esta página é apenas para artistas.</p></div>;
    }

    const today = new Date();
    const todayAvailabilities = getAvailabilitiesForDate(today);

    return (
        <>
            <HourAvailabilityModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                date={selectedDate}
                artistId={user.artistId}
                existingAvailabilities={getAvailabilitiesForDate(selectedDate)}
            />
            <div className={styles.dashboardGrid}>
                <aside className={styles.sidebar}>
                    <ProfileSummary profileData={profileData} />
                </aside>

                <main className={styles.mainContent}>
                    <TodaySchedule
                        todayAvailabilities={todayAvailabilities}
                        onEditClick={handleEditToday}
                    />

                    <div className={styles.fullScheduleSection}>
                        <div className={styles.header}>
                            <h3>Gerenciamento Completo</h3>
                            <p>Acesse sua agenda completa para gerenciar todos os dias do ano.</p>
                            <Link to="/minha-agenda">
                                <Button>Ver Calendário Completo</Button>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default ArtistDashboardPage;