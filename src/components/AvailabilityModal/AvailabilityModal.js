// src/components/AvailabilityModal/AvailabilityModal.js
import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import PriceInput from '../PriceInput/PriceInput';
import styles from './AvailabilityModal.module.css';
import { createAvailability, updateAvailability, deleteAvailability } from '../../services/api';

// Helper function to format a Date object into a local ISO-like string (YYYY-MM-DDTHH:mm:ss)
const formatAsLocalDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};


const HourAvailabilityModal = ({ isOpen, onClose, date, artistId, existingAvailabilities }) => {
    const [initialAvailabilities, setInitialAvailabilities] = useState({});
    const [currentAvailabilities, setCurrentAvailabilities] = useState({});
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initializeStates = useCallback(() => {
        const initial = {};
        for (let i = 0; i < 24; i++) {
            initial[i] = { status: 'FREE', price: undefined, id: null };
        }

        existingAvailabilities.forEach(avail => {
            // No frontend, sempre convertemos a string de data para um objeto Date
            const startHour = new Date(avail.startTime).getHours();
            initial[startHour] = {
                id: avail.id,
                status: avail.availabilityStatus,
                price: avail.price,
            };
        });
        setInitialAvailabilities(JSON.parse(JSON.stringify(initial))); // Deep copy
        setCurrentAvailabilities(JSON.parse(JSON.stringify(initial))); // Deep copy
    }, [existingAvailabilities]);

    useEffect(() => {
        if (isOpen) {
            initializeStates();
        }
    }, [isOpen, initializeStates]);

    const handleHourClick = (hour) => {
        const availability = currentAvailabilities[hour];

        if (availability.status === 'BOOKED') return;

        let nextStatus = 'AVAILABLE';
        if (availability.status === 'AVAILABLE') nextStatus = 'UNAVAILABLE';
        if (availability.status === 'UNAVAILABLE') nextStatus = 'FREE';

        setCurrentAvailabilities(prev => {
            const newAvail = { ...prev[hour], status: nextStatus };
            if (nextStatus !== 'AVAILABLE') {
                delete newAvail.price;
            }
            return { ...prev, [hour]: newAvail };
        });
    };

    const handlePriceChange = (hour, price) => {
        setCurrentAvailabilities(prev => ({
            ...prev,
            [hour]: { ...prev[hour], price }
        }));
    };

    const handleSave = async () => {
        setError('');
        setIsSubmitting(true);
        const promises = [];

        for (let hour = 0; hour < 24; hour++) {
            const initial = initialAvailabilities[hour];
            const current = currentAvailabilities[hour];

            const hasChanged = initial.status !== current.status || (current.status === 'AVAILABLE' && initial.price !== current.price);

            if (!hasChanged) continue;

            const startTime = new Date(date);
            startTime.setHours(hour, 0, 0, 0);
            const endTime = new Date(date);
            endTime.setHours(hour + 1, 0, 0, 0);

            // --- DELETAR ---
            if (initial.status !== 'FREE' && current.status === 'FREE') {
                promises.push(deleteAvailability(initial.id));
            }
            // --- CRIAR ---
            else if (initial.status === 'FREE' && current.status !== 'FREE') {
                if (current.status === 'AVAILABLE' && (!current.price || current.price <= 0)) {
                    setError(`Por favor, defina um preço válido para ${String(hour).padStart(2, '0')}:00.`);
                    setIsSubmitting(false);
                    return;
                }

                promises.push(createAvailability({
                    artistId,
                    startTime: formatAsLocalDateTime(startTime),
                    endTime: formatAsLocalDateTime(endTime),
                    price: current.status === 'AVAILABLE' ? current.price : null,
                    availabilityStatus: current.status
                }));
            }
            // --- ATUALIZAR ---
            else if (initial.status !== 'FREE' && current.status !== 'FREE') {
                if (current.status === 'AVAILABLE' && (!current.price || current.price <= 0)) {
                    setError(`Por favor, defina um preço válido para ${String(hour).padStart(2, '0')}:00.`);
                    setIsSubmitting(false);
                    return;
                }

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
            onClose();
        } catch (err) {
            console.error("Erro ao salvar disponibilidades:", err);
            setError(err.response?.data?.message || 'Não foi possível salvar as alterações.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const formattedDate = date ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(date) : '';

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.container}>
                <h3>Gerenciar Disponibilidade</h3>
                <p className={styles.dateLabel}>{formattedDate}</p>

                <div className={styles.hoursGrid}>
                    {Object.keys(currentAvailabilities).map(hourStr => {
                        const hour = parseInt(hourStr, 10);
                        const availability = currentAvailabilities[hour];

                        const now = new Date();
                        const slotDateTime = new Date(date);
                        slotDateTime.setHours(hour, 59, 59, 999); // Considera o final da hora

                        const isPastHour = now > slotDateTime;

                        return (
                            <div key={hour} className={styles.hourSlot}>
                                <button
                                    onClick={() => handleHourClick(hour)}
                                    className={`${styles.hourButton} ${styles[(availability.status || 'FREE').toLowerCase()]} ${isPastHour ? styles.past : ''}`}
                                    disabled={availability.status === 'BOOKED' || isPastHour}
                                >
                                    {`${String(hour).padStart(2, '0')}:00`}
                                </button>
                                {availability.status === 'AVAILABLE' && (
                                    <PriceInput
                                        value={availability.price}
                                        onChange={(price) => handlePriceChange(hour, price)}
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.legend}>
                    <div className={styles.legendItem}><span className={`${styles.legendColor} ${styles.available}`}></span> Disponível</div>
                    <div className={styles.legendItem}><span className={`${styles.legendColor} ${styles.unavailable}`}></span> Indisponível</div>
                    <div className={styles.legendItem}><span className={`${styles.legendColor} ${styles.booked}`}></span> Reservado</div>
                    <div className={styles.legendItem}><span className={`${styles.legendColor} ${styles.free}`}></span> Livre</div>
                </div>
                <div className={styles.buttons}>
                    <Button type="button" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default HourAvailabilityModal;