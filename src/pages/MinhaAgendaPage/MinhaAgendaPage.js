// src/pages/MinhaAgendaPage/MinhaAgendaPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './MinhaAgendaPage.module.css'; // Mantenha o nome do CSS correspondente
import Calendar from '../../components/Calendar/Calendar';
import HourAvailabilityModal from '../../components/AvailabilityModal/AvailabilityModal';
import { getAllAvailabilityByArtistId } from '../../services/api';

const MinhaAgendaPage = () => {
    const { user } = useAuth();
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availabilities, setAvailabilities] = useState([]);

    const fetchAvailabilities = useCallback(async () => {
        if (user?.artistId) {
            try {
                const response = await getAllAvailabilityByArtistId(user.artistId);
                setAvailabilities(response.data.content || []);
            } catch (error) {
                console.error("Erro ao buscar disponibilidades:", error);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchAvailabilities();
    }, [fetchAvailabilities]);

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
        fetchAvailabilities();
    };

    const getAvailabilitiesForDate = (date) => {
        if (!date) return [];
        return availabilities.filter(avail => {
            const availDate = new Date(avail.startTime);
            return availDate.toDateString() === date.toDateString();
        });
    };

    if (user?.scope !== 'ARTIST') {
        return <div className={styles.container}><p>Acesso negado. Esta página é apenas para artistas.</p></div>;
    }

    return (
        <>
            <HourAvailabilityModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                date={selectedDate}
                artistId={user.artistId}
                existingAvailabilities={getAvailabilitiesForDate(selectedDate)}
            />
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Minha Agenda Completa</h1>
                    <p>Selecione uma data para adicionar seus horários disponíveis.</p>
                </header>

                <div className={styles.yearSelector}>
                    <button onClick={() => setCurrentYear(currentYear - 1)}>&lt;</button>
                    <h2>{currentYear}</h2>
                    <button onClick={() => setCurrentYear(currentYear + 1)}>&gt;</button>
                </div>

                <div className={styles.calendarsGrid}>
                    {Array.from({ length: 12 }, (_, i) => i).map(monthIndex => (
                        <Calendar
                            key={monthIndex}
                            year={currentYear}
                            month={monthIndex}
                            onDateClick={handleDateClick}
                            availabilities={availabilities}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default MinhaAgendaPage;