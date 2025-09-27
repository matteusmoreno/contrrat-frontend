// src/components/ArtistAvailability/ArtistAvailability.js
import React, { useState } from 'react';
import styles from './ArtistAvailability.module.css';
import Calendar from '../Calendar/Calendar';
import Button from '../Button/Button';
import { createContract } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ArtistAvailability = ({ artist, availabilities }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleDateClick = (date) => {
        // No futuro, isso pode abrir um modal para ver os horários do dia
        console.log("Data selecionada:", date);
    };

    const handleSlotToggle = (slot) => {
        if (slot.availabilityStatus !== 'AVAILABLE') return;

        setSelectedSlots(prev =>
            prev.find(s => s.id === slot.id)
                ? prev.filter(s => s.id !== slot.id)
                : [...prev, slot]
        );
    };

    const handleProposeContract = async () => {
        if (selectedSlots.length === 0) {
            setError("Selecione pelo menos um horário.");
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const availabilityIds = selectedSlots.map(s => s.id);
            await createContract(availabilityIds);
            setSuccess('Proposta de contrato enviada com sucesso! Você será redirecionado para seu dashboard.');
            setTimeout(() => navigate('/dashboard/cliente'), 3000);
        } catch (err) {
            const errorMessage = err.response?.data || 'Erro ao enviar a proposta. Tente novamente.';
            setError(errorMessage);
            setIsSubmitting(false);
        }
    };

    const totalPrice = selectedSlots.reduce((total, slot) => total + slot.price, 0);

    const availableSlots = availabilities.filter(a => a.availabilityStatus === 'AVAILABLE');

    const groupedSlots = availableSlots.reduce((acc, slot) => {
        const date = new Date(slot.startTime).toDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(slot);
        return acc;
    }, {});


    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Agenda e Contratação</h2>
            <div className={styles.contentGrid}>
                <div className={styles.calendarSection}>
                    <Calendar
                        year={currentDate.getFullYear()}
                        month={currentDate.getMonth()}
                        onDateClick={handleDateClick}
                        availabilities={availabilities}
                    />
                </div>

                <div className={styles.slotsSection}>
                    <h3>Horários Disponíveis</h3>
                    <div className={styles.slotsList}>
                        {Object.keys(groupedSlots).length > 0 ? (
                            Object.entries(groupedSlots).map(([date, slots]) => (
                                <div key={date}>
                                    <h4 className={styles.slotDate}>{new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</h4>
                                    <div className={styles.slotGroup}>
                                        {slots.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).map(slot => (
                                            <button
                                                key={slot.id}
                                                onClick={() => handleSlotToggle(slot)}
                                                className={`${styles.slotButton} ${selectedSlots.find(s => s.id === slot.id) ? styles.selected : ''}`}
                                            >
                                                {new Date(slot.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                <span className={styles.slotPrice}>
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(slot.price)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={styles.noSlots}>Este artista ainda não cadastrou horários disponíveis.</p>
                        )}
                    </div>
                </div>

                <div className={styles.summarySection}>
                    <h3>Resumo da Proposta</h3>
                    {selectedSlots.length > 0 ? (
                        <>
                            <ul className={styles.summaryList}>
                                {selectedSlots.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).map(slot => (
                                    <li key={slot.id}>
                                        <span>{new Date(slot.startTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {new Date(slot.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(slot.price)}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.summaryTotal}>
                                <strong>Total:</strong>
                                <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}</strong>
                            </div>
                        </>
                    ) : (
                        <p className={styles.noSlotsSummary}>Selecione os horários ao lado para montar sua proposta.</p>
                    )}

                    {error && <p className={styles.messageError}>{error}</p>}
                    {success && <p className={styles.messageSuccess}>{success}</p>}

                    <Button
                        onClick={handleProposeContract}
                        disabled={selectedSlots.length === 0 || isSubmitting}
                    >
                        {isSubmitting ? 'Enviando Proposta...' : 'Propor Contrato'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ArtistAvailability;