// src/components/ArtistAvailability/ArtistAvailability.js
import React, { useState } from 'react';
import styles from './ArtistAvailability.module.css';
import Calendar from '../Calendar/Calendar';
import Button from '../Button/Button';
import HourSelectionModal from '../HourSelectionModal/HourSelectionModal'; // Importa o novo modal
import { createContract } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ArtistAvailability = ({ artist, availabilities }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const navigate = useNavigate();

    const handleDateClick = (date) => {
        // Abre o modal apenas para dias que têm horários disponíveis
        const slotsForDay = availabilities.filter(a =>
            new Date(a.startTime).toDateString() === date.toDateString() && a.availabilityStatus === 'AVAILABLE'
        );

        if (slotsForDay.length > 0) {
            setSelectedDate(date);
            setIsModalOpen(true);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
    };

    const handleSelectionConfirm = (newlySelectedSlots) => {
        // Adiciona os novos horários selecionados, evitando duplicatas
        const updatedSlots = [...selectedSlots];
        newlySelectedSlots.forEach(newSlot => {
            if (!updatedSlots.find(s => s.id === newSlot.id)) {
                updatedSlots.push(newSlot);
            }
        });
        setSelectedSlots(updatedSlots);
        handleModalClose();
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

    const getAvailabilitiesForDate = (date) => {
        if (!date) return [];
        return availabilities.filter(avail => {
            const availDate = new Date(avail.startTime);
            return availDate.toDateString() === date.toDateString();
        });
    };

    return (
        <>
            <HourSelectionModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onConfirm={handleSelectionConfirm}
                date={selectedDate}
                availabilitiesForDate={getAvailabilitiesForDate(selectedDate)}
                alreadySelectedIds={selectedSlots.map(s => s.id)}
            />

            <div className={styles.container}>
                <h2 className={styles.title}>Agenda e Contratação</h2>
                <div className={styles.contentGrid}>
                    <div className={styles.calendarSection}>
                        <div className={styles.monthNavigator}>
                            <Button onClick={() => changeMonth(-1)}>&lt;</Button>
                            <h3>{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate)}</h3>
                            <Button onClick={() => changeMonth(1)}>&gt;</Button>
                        </div>
                        <Calendar
                            year={currentDate.getFullYear()}
                            month={currentDate.getMonth()}
                            onDateClick={handleDateClick}
                            availabilities={availabilities}
                        />
                    </div>

                    <div className={styles.summarySection}>
                        <h3>Resumo da Proposta</h3>
                        {selectedSlots.length > 0 ? (
                            <>
                                <ul className={styles.summaryList}>
                                    {selectedSlots.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).map(slot => (
                                        <li key={slot.id}>
                                            <div className={styles.slotDetails}>
                                                <span>{new Date(slot.startTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {new Date(slot.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(slot.price)}</span>
                                            </div>
                                            <button onClick={() => removeSlot(slot.id)} className={styles.removeButton}>&times;</button>
                                        </li>
                                    ))}
                                </ul>
                                <div className={styles.summaryTotal}>
                                    <strong>Total:</strong>
                                    <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}</strong>
                                </div>
                            </>
                        ) : (
                            <p className={styles.noSlotsSummary}>Navegue no calendário, clique em um dia disponível e escolha os horários.</p>
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
        </>
    );
};

export default ArtistAvailability;