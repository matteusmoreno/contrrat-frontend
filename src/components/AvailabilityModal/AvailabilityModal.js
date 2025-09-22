// src/components/AvailabilityModal/AvailabilityModal.js
import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import InputField from '../InputField/InputField';
import styles from './AvailabilityModal.module.css';
import { createAvailability } from '../../services/api';

const AvailabilityModal = ({ isOpen, onClose, date, artistId }) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [price, setPrice] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!startTime || !endTime || !price) {
            setError('Todos os campos são obrigatórios.');
            setIsSubmitting(false);
            return;
        }

        const startDateTime = new Date(date);
        const [startHour, startMinute] = startTime.split(':');
        startDateTime.setHours(startHour, startMinute);

        const endDateTime = new Date(date);
        const [endHour, endMinute] = endTime.split(':');
        endDateTime.setHours(endHour, endMinute);

        if (endDateTime <= startDateTime) {
            setError('O horário final deve ser após o horário inicial.');
            setIsSubmitting(false);
            return;
        }

        const availabilityData = {
            artistId,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            price,
            availabilityStatus: 'AVAILABLE'
        };

        try {
            await createAvailability(availabilityData);
            handleClose();
        } catch (err) {
            console.error("Erro ao criar disponibilidade:", err);
            setError(err.response?.data?.message || 'Não foi possível salvar a disponibilidade.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setStartTime('');
        setEndTime('');
        setPrice('');
        setError('');
        onClose();
    }

    if (!isOpen) return null;

    const formattedDate = date ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(date) : '';

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className={styles.container}>
                <h3>Adicionar Disponibilidade</h3>
                <p className={styles.dateLabel}>{formattedDate}</p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.timeInputs}>
                        <InputField
                            id="startTime"
                            name="startTime"
                            label="Início"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                        />
                        <InputField
                            id="endTime"
                            name="endTime"
                            label="Fim"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                        />
                    </div>
                    <InputField
                        id="price"
                        name="price"
                        label="Preço (R$)"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />

                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.buttons}>
                        <Button type="button" onClick={handleClose} className={styles.cancelButton}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default AvailabilityModal;