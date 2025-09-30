// src/components/Calendar/Calendar.js
import React from 'react';
import styles from './Calendar.module.css';

const Calendar = ({ year, month, onDateClick, availabilities, selectedDate }) => {
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const daysOfWeek = ["D", "S", "T", "Q", "Q", "S", "S"];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const calendarDays = [];

    for (let i = 0; i < startingDay; i++) {
        calendarDays.push(<div key={`empty-start-${i}`} className={styles.emptyDay}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isPast = date < new Date().setHours(0, 0, 0, 0);
        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

        const hasAvailableSlots = availabilities.some(avail => {
            const availDate = new Date(avail.startTime);
            return availDate.getDate() === day &&
                availDate.getMonth() === month &&
                availDate.getFullYear() === year &&
                avail.availabilityStatus === 'AVAILABLE';
        });

        calendarDays.push(
            <button
                key={day}
                className={`${styles.day} ${isPast ? styles.pastDay : ''} ${hasAvailableSlots && !isPast ? styles.availableDay : ''} ${isSelected ? styles.selectedDay : ''}`}
                onClick={() => !isPast && onDateClick(date)}
                disabled={isPast}
            >
                {day}
            </button>
        );
    }

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.daysOfWeek}>
                {daysOfWeek.map((day, index) => (
                    <div key={index} className={styles.dayOfWeek}>{day}</div>
                ))}
            </div>
            <div className={styles.daysGrid}>
                {calendarDays}
            </div>
        </div>
    );
};

export default Calendar;