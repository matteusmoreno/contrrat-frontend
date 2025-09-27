// src/components/HourSelectionModal/HourSelectionModal.js
import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import styles from './HourSelectionModal.module.css';

const HourSelectionModal = ({ isOpen, onClose, onConfirm, date, availabilitiesForDate, alreadySelectedIds }) => {
    const [selectedHours, setSelectedHours] = useState([]);

    useEffect(() => {
        // Pré-seleciona os horários que já estão no resumo
        setSelectedHours(
            availabilitiesForDate.filter(a => alreadySelectedIds.includes(a.id))
        );
    }, [isOpen, availabilitiesForDate, alreadySelectedIds]);

    const handleToggleHour = (slot) => {
        setSelectedHours(prev =>
            prev.find(s => s.id === slot.id)
                ? prev.filter(s => s.id !== slot.id)
                : [...prev, slot]
        );
    };

    const handleConfirm = () => {
        onConfirm(selectedHours);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.container}>
                <h3>Selecione os Horários</h3>
                <p className={styles.dateLabel}>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(date)}</p>

                <div className={styles.hoursGrid}>
                    {availabilitiesForDate
                        .filter(a => a.availabilityStatus === 'AVAILABLE')
                        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                        .map(slot => (
                            <button
                                key={slot.id}
                                onClick={() => handleToggleHour(slot)}
                                className={`${styles.hourButton} ${selectedHours.find(s => s.id === slot.id) ? styles.selected : ''}`}
                            >
                                {new Date(slot.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                <span className={styles.priceText}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(slot.price)}
                                </span>
                            </button>
                        ))}
                </div>

                <div className={styles.actions}>
                    <Button onClick={onClose} variant="outline">Cancelar</Button>
                    <Button onClick={handleConfirm}>Confirmar Seleção</Button>
                </div>
            </div>
        </Modal>
    );
};

export default HourSelectionModal;