// src/components/TodaySchedule/TodaySchedule.js
import React from 'react';
import styles from './TodaySchedule.module.css';
import Button from '../Button/Button';
import PriceInput from '../PriceInput/PriceInput';

const TodaySchedule = ({ availabilities, onAvailabilitiesChange, onSave, onCancel, isDirty, isSubmitting, error }) => {

    const handleHourClick = (hour) => {
        const availability = availabilities[hour];
        if (availability.status === 'BOOKED') return;

        let newStatus = 'AVAILABLE';
        if (availability.status === 'AVAILABLE') newStatus = 'UNAVAILABLE';
        if (availability.status === 'UNAVAILABLE') newStatus = 'FREE';

        const newState = {
            ...availabilities,
            [hour]: {
                ...availability,
                status: newStatus,
                price: newStatus !== 'AVAILABLE' ? '' : availability.price,
            }
        };
        onAvailabilitiesChange(newState);
    };

    const handlePriceChange = (hour, price) => {
        const newState = {
            ...availabilities,
            [hour]: { ...availabilities[hour], price }
        };
        onAvailabilitiesChange(newState);
    };

    const currentHour = new Date().getHours();
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className={styles.todayContainer}>
            <div className={styles.header}>
                <h3>Agenda de Hoje</h3>
                <span className={styles.dateLabel}>{formattedDate}</span>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.hoursGrid}>
                {Object.keys(availabilities).map(hourStr => {
                    const hour = parseInt(hourStr, 10);
                    const availability = availabilities[hour];
                    const isPast = hour <= currentHour;

                    return (
                        <div key={hour} className={styles.hourSlotWrapper}>
                            <button
                                onClick={() => handleHourClick(hour)}
                                className={`${styles.hourSlot} ${styles[(availability.status || 'FREE').toLowerCase()]} ${isPast ? styles.past : ''}`}
                                disabled={availability.status === 'BOOKED' || isPast}
                                title={isPast ? "Este horário já passou" : "Clique para alterar o status"}
                            >
                                <span className={styles.hourText}>{`${String(hour).padStart(2, '0')}:00`}</span>
                                {availability.status === 'AVAILABLE' && availability.price > 0 && (
                                    <span className={styles.priceText}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(availability.price)}</span>
                                )}
                            </button>
                            <div className={styles.priceInputWrapper}>
                                {availability.status === 'AVAILABLE' && !isPast && (
                                    <PriceInput
                                        value={availability.price}
                                        onChange={(price) => handlePriceChange(hour, price)}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {isDirty && (
                <div className={styles.actions}>
                    <Button onClick={onCancel} disabled={isSubmitting} type="secondary">Cancelar</Button>
                    <Button onClick={onSave} disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default TodaySchedule;