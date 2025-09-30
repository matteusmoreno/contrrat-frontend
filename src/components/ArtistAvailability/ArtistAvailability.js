// src/components/ArtistAvailability/ArtistAvailability.js
import React, { useState, useMemo } from 'react';
import styles from './ArtistAvailability.module.css';
import Button from '../Button/Button';
import Calendar from '../Calendar/Calendar';
import { createContract } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { FaRegClock, FaRegCalendarCheck, FaRegTimesCircle, FaLock } from 'react-icons/fa';

const areDatesTheSame = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
};

const ArtistAvailability = ({ artist, availabilities }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const slotsForSelectedDay = useMemo(() => {
        const slots = [];
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);

        for (let i = 0; i < 24; i++) {
            const hourStart = new Date(dayStart);
            hourStart.setHours(i);

            const existingSlot = availabilities.find(slot => {
                const slotDate = new Date(slot.startTime);
                return areDatesTheSame(slotDate, selectedDate) && slotDate.getHours() === i;
            });

            if (existingSlot) {
                slots.push({ hour: i, ...existingSlot, status: existingSlot.availabilityStatus });
            } else {
                slots.push({
                    hour: i,
                    id: `free-${i}-${selectedDate.toISOString()}`,
                    status: 'FREE',
                    startTime: hourStart.toISOString(),
                    price: 0,
                });
            }
        }
        return slots;
    }, [selectedDate, availabilities]);

    const handleDayClick = (day) => setSelectedDate(day);

    const toggleSlot = (slot) => {
        setSelectedSlots(prev => {
            const isSelected = prev.some(s => s.id === slot.id);
            if (isSelected) {
                return prev.filter(s => s.id !== slot.id);
            }
            return [...prev, slot];
        });
    };

    const removeSlot = (slotId) => {
        setSelectedSlots(prev => prev.filter(s => s.id !== slotId));
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

    const changeMonth = (amount) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    };

    const totalPrice = selectedSlots.reduce((total, slot) => total + slot.price, 0);

    const today = new Date();
    const isCurrentMonthOrPast = currentDate.getFullYear() < today.getFullYear() ||
        (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() < today.getMonth());

    return (
        <section className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Verificar Disponibilidade e Contratar</h2>
                <p className={styles.subtitle}>Selecione um dia no calendário para ver os horários disponíveis.</p>
            </div>

            <div className={styles.mainGrid}>
                <div className={styles.calendarWrapper}>
                    <div className={styles.monthNavigator}>
                        <Button onClick={() => changeMonth(-1)} disabled={isCurrentMonthOrPast}>&lt;</Button>
                        <h3>{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate)}</h3>
                        <Button onClick={() => changeMonth(1)}>&gt;</Button>
                    </div>
                    <Calendar
                        year={currentDate.getFullYear()}
                        month={currentDate.getMonth()}
                        onDateClick={handleDayClick}
                        availabilities={availabilities}
                        selectedDate={selectedDate}
                    />
                </div>

                <div className={styles.scheduleWrapper}>
                    <h3 className={styles.scheduleTitle}>
                        Horários de {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                    </h3>
                    <ul className={styles.scheduleList}>
                        {slotsForSelectedDay.map(slot => {
                            const isSelected = selectedSlots.some(s => s.id === slot.id);
                            const isPast = new Date(slot.startTime) < new Date();
                            const isDisabled = isPast || slot.status !== 'AVAILABLE';

                            let Icon;
                            let statusText;

                            switch (slot.status) {
                                case 'AVAILABLE':
                                    Icon = FaRegCalendarCheck;
                                    statusText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(slot.price);
                                    break;
                                case 'UNAVAILABLE':
                                    Icon = FaRegTimesCircle;
                                    statusText = "Indisponível";
                                    break;
                                case 'BOOKED':
                                    Icon = FaLock;
                                    statusText = "Reservado";
                                    break;
                                default: // FREE
                                    Icon = FaRegClock;
                                    statusText = "Sem classificação";
                                    break;
                            }

                            if (isPast && !['BOOKED', 'UNAVAILABLE'].includes(slot.status)) {
                                statusText = "Horário passado";
                            }

                            return (
                                <li key={slot.id}>
                                    <button
                                        className={`${styles.slotItem} ${styles[slot.status.toLowerCase()]} ${isSelected ? styles.selected : ''} ${isPast ? styles.past : ''}`}
                                        onClick={() => !isDisabled && toggleSlot(slot)}
                                        disabled={isDisabled}
                                    >
                                        <div className={styles.slotTimeInfo}>
                                            <Icon className={styles.slotIcon} />
                                            <span className={styles.slotTime}>{`${String(slot.hour).padStart(2, '0')}:00`}</span>
                                        </div>
                                        <span className={styles.slotStatus}>{statusText}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {selectedSlots.length > 0 && (
                <div className={styles.summarySection}>
                    <h3>Resumo da Proposta</h3>
                    <ul className={styles.summaryList}>
                        {selectedSlots.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).map(slot => (
                            <li key={slot.id}>
                                <div className={styles.slotInfo}>
                                    <span className={styles.slotDateTime}>
                                        {new Date(slot.startTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        {' - '}
                                        {new Date(slot.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className={styles.slotPriceSummary}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(slot.price)}</span>
                                </div>
                                <button onClick={() => removeSlot(slot.id)} className={styles.removeButton} aria-label="Remover horário">&times;</button>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.summaryTotal}>
                        <strong>Total:</strong>
                        <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}</strong>
                    </div>
                    {error && <p className={styles.messageError}>{error}</p>}
                    {success && <p className={styles.messageSuccess}>{success}</p>}
                    <div className={styles.summaryActions}>
                        <Button onClick={handleProposeContract} disabled={isSubmitting}>
                            {isSubmitting ? 'Enviando...' : 'Propor Contrato'}
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ArtistAvailability;