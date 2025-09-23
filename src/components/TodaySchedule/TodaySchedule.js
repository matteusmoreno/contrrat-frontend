// src/components/TodaySchedule/TodaySchedule.js
import React from 'react';
import styles from './TodaySchedule.module.css';
import Button from '../Button/Button';

const TodaySchedule = ({ todayAvailabilities, onEditClick }) => {

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className={styles.todayContainer}>
            <div className={styles.header}>
                <h3>Agenda de Hoje</h3>
                <Button onClick={onEditClick}>Editar Dia</Button>
            </div>
            <div className={styles.hoursGrid}>
                {hours.map(hour => {
                    const availability = todayAvailabilities.find(a => new Date(a.startTime).getHours() === hour);
                    const status = availability ? availability.availabilityStatus.toLowerCase() : 'free';
                    const price = availability?.price ?
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(availability.price)
                        : null;

                    return (
                        <div key={hour} className={`${styles.hourSlot} ${styles[status]}`}>
                            <span className={styles.hourText}>{`${String(hour).padStart(2, '0')}:00`}</span>
                            {price && <span className={styles.priceText}>{price}</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TodaySchedule;