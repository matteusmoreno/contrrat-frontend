// src/pages/ArtistDashboardPage/ArtistDashboardPage.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ArtistDashboardPage.module.css';
import Calendar from '../../components/Calendar/Calendar';
import AvailabilityModal from '../../components/AvailabilityModal/AvailabilityModal';

const ArtistDashboardPage = () => {
    const { user } = useAuth();
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    // TODO: Adicionar lógica para buscar disponibilidades existentes e passá-las para o calendário.

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
        // TODO: Atualizar a lista de disponibilidades após adicionar uma nova.
    };

    const months = Array.from({ length: 12 }, (_, i) => i);

    if (user?.scope !== 'ARTIST') {
        return <div className={styles.container}><p>Acesso negado. Esta página é apenas para artistas.</p></div>;
    }

    return (
        <>
            <AvailabilityModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                date={selectedDate}
                artistId={user.artistId}
            />
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Minha Agenda</h1>
                    <p>Selecione uma data para adicionar seus horários disponíveis.</p>
                </header>

                <div className={styles.yearSelector}>
                    <button onClick={() => setCurrentYear(currentYear - 1)}>&lt;</button>
                    <h2>{currentYear}</h2>
                    <button onClick={() => setCurrentYear(currentYear + 1)}>&gt;</button>
                </div>

                <div className={styles.calendarsGrid}>
                    {months.map(monthIndex => (
                        <Calendar
                            key={monthIndex}
                            year={currentYear}
                            month={monthIndex}
                            onDateClick={handleDateClick}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default ArtistDashboardPage;