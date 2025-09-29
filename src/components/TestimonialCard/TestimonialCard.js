// src/components/TestimonialCard/TestimonialCard.js
import React from 'react';
import styles from './TestimonialCard.module.css';
import { FaStar, FaUserCircle } from 'react-icons/fa';

const TestimonialCard = ({ quote, author, role }) => {
    return (
        <div className={styles.card}>
            <div className={styles.stars}>
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <p className={styles.quote}>"{quote}"</p>
            <div className={styles.authorInfo}>
                <FaUserCircle className={styles.avatarIcon} />
                <div>
                    <span className={styles.author}>{author}</span>
                    <span className={styles.role}>{role}</span>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;