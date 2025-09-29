// src/components/AvailabilityModal/AvailabilityModal.js
import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import PriceInput from '../PriceInput/PriceInput';
import styles from './AvailabilityModal.module.css';
import { createAvailability, updateAvailability, deleteAvailability } from '../../services/api';
import { FaToggleOff, FaToggleOn, FaDollarSign } from 'react-icons/fa';

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
    const [basePrice, setBasePrice] = useState('');


    const initializeStates = useCallback(() => {
        const initial = {};
        for (let i = 0; i < 24; i++) {
            initial[i] = { status: 'FREE', price: '', id: null };
        }

        existingAvailabilities.forEach(avail => {
            const startHour = new Date(avail.startTime).getHours();
            initial[startHour] = {
                id: avail.id,
                status: avail.availabilityStatus,
                price: avail.price || '',
            };
        });
        setInitialAvailabilities(JSON.parse(JSON.stringify(initial)));
        setCurrentAvailabilities(JSON.parse(JSON.stringify(initial)));
        setBasePrice('');
    }, [existingAvailabilities]);

    useEffect(() => {
        if (isOpen) {
            initializeStates();
        }
    }, [isOpen, initializeStates]);

    const handleHourClick = (hour) => {
        const availability = currentAvailabilities[hour];
        if (availability.status === 'BOOKED') return;

        let newStatus = 'AVAILABLE';
        if (availability.status === 'AVAILABLE') {
            newStatus = 'UNAVAILABLE';
        } else if (availability.status === 'UNAVAILABLE') {
            newStatus = 'FREE';
        }

        setCurrentAvailabilities(prev => ({
            ...prev,
            [hour]: {
                ...prev[hour],
                status: newStatus,
                price: newStatus !== 'AVAILABLE' ? '' : prev[hour].price,
            }
        }));
    };


    const handlePriceChange = (hour, price) => {
        setCurrentAvailabilities(prev => ({
            ...prev,
            [hour]: { ...prev[hour], price }
        }));
    };

    const handleMakeAllUnavailable = () => {
        const newAvailabilities = { ...currentAvailabilities };
        for (let hour = 0; hour < 24; hour++) {
            const slotDateTime = new Date(date);
            slotDateTime.setHours(hour, 0, 0, 0);
            const isPastHour = new Date() > slotDateTime;

            if (newAvailabilities[hour].status !== 'BOOKED' && !isPastHour) {
                newAvailabilities[hour] = { ...newAvailabilities[hour], status: 'UNAVAILABLE', price: '' };
            }
        }
        setCurrentAvailabilities(newAvailabilities);
    };

    const handleApplyBasePrice = () => {
        if (!basePrice || basePrice <= 0) {
            setError('Por favor, insira um valor base válido.');
            return;
        }
        setError('');
        const newAvailabilities = { ...currentAvailabilities };
        // --- INÍCIO DA CORREÇÃO ---
        for (let hour = 0; hour < 24; hour++) {
            const slotDateTime = new Date(date);
            slotDateTime.setHours(hour, 0, 0, 0);
            const isPastHour = new Date() > slotDateTime;

            // Só aplica o valor se o horário estiver LIVRE (FREE) e não tiver passado
            if (newAvailabilities[hour].status === 'FREE' && !isPastHour) {
                newAvailabilities[hour] = { ...newAvailabilities[hour], status: 'AVAILABLE', price: basePrice };
            }
        }
        // --- FIM DA CORREÇÃO ---
        setCurrentAvailabilities(newAvailabilities);
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

            if (current.status === 'AVAILABLE' && (!current.price || parseFloat(current.price) <= 0)) {
                setError(`Por favor, defina um preço válido para ${String(hour).padStart(2, '0')}:00.`);
                setIsSubmitting(false);
                return;
            }

            if (initial.status !== 'FREE' && current.status === 'FREE') {
                promises.push(deleteAvailability(initial.id));
            }
            else if (initial.status === 'FREE' && current.status !== 'FREE') {
                promises.push(createAvailability({
                    artistId,
                    startTime: formatAsLocalDateTime(startTime),
                    endTime: formatAsLocalDateTime(endTime),
                    price: current.status === 'AVAILABLE' ? current.price : null,
                    availabilityStatus: current.status
                }));
            }
            else if (initial.status !== 'FREE' && current.status !== 'FREE') {
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
            const errorMessage = err.response?.data?.message || err.response?.data || 'Não foi possível salvar as alterações.';
            setError(errorMessage);
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

                <div className={styles.bulkActions}>
                    <div className={styles.actionGroup}>
                        <Button variant="outline" onClick={handleMakeAllUnavailable}>
                            <FaToggleOff /> Indisponibilizar Dia Todo
                        </Button>
                    </div>
                    <div className={styles.actionGroup}>
                        <div className={styles.priceInputGroup}>
                            <FaDollarSign />
                            <PriceInput value={basePrice} onChange={setBasePrice} />
                        </div>
                        <Button onClick={handleApplyBasePrice}>
                            <FaToggleOn /> Aplicar Valor Base
                        </Button>
                    </div>
                </div>

                <div className={styles.hoursGrid}>
                    {Object.keys(currentAvailabilities).map(hourStr => {
                        const hour = parseInt(hourStr, 10);
                        const availability = currentAvailabilities[hour];
                        const now = new Date();
                        const slotDateTime = new Date(date);
                        slotDateTime.setHours(hour, 0, 0, 0);

                        const isPastHour = now > slotDateTime;

                        return (
                            <div key={hour} className={styles.hourSlot}>
                                <button
                                    onClick={() => handleHourClick(hour)}
                                    title={'Clique para alterar o status'}
                                    className={`${styles.hourButton} ${styles[(availability.status || 'FREE').toLowerCase()]} ${isPastHour ? styles.past : ''}`}
                                    disabled={availability.status === 'BOOKED' || isPastHour}
                                >
                                    <span className={styles.hourText}>{`${String(hour).padStart(2, '0')}:00`}</span>
                                    {availability.status === 'AVAILABLE' && (
                                        <span className={styles.priceText}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(availability.price || 0)}</span>
                                    )}
                                </button>

                                <div className={styles.slotActionArea}>
                                    {availability.status === 'AVAILABLE' && (
                                        <PriceInput
                                            value={availability.price}
                                            onChange={(price) => handlePriceChange(hour, price)}
                                        />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.legend}>
                    <div className={styles.legendItem}><span className={`${styles.legendColor} ${styles.free}`}></span> Livre</div>
                    <div className={styles.legendItem}><span className={`${styles.legendColor} ${styles.available}`}></span> Disponível</div>
                    <div className={styles.legendItem}><span className={`${styles.legendColor} ${styles.unavailable}`}></span> Indisponível</div>
                    <div className={styles.legendItem}><span className={`${styles.legendColor} ${styles.booked}`}></span> Reservado</div>
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