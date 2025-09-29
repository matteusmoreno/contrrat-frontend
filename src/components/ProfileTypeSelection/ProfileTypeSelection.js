// src/components/ProfileTypeSelection/ProfileTypeSelection.js
import React from 'react';
import styles from './ProfileTypeSelection.module.css';
import { FaPaintBrush, FaHandshake } from 'react-icons/fa';

const ProfileTypeSelection = ({ onSelectType }) => {
    return (
        <div className={styles.selectionContainer}>
            <h2>Junte-se à nossa comunidade</h2>
            <p>Para começar, escolha o tipo de perfil que melhor descreve você.</p>
            <div className={styles.optionsGrid}>
                <div className={styles.optionCard} onClick={() => onSelectType('ARTIST')}>
                    <FaPaintBrush className={styles.icon} />
                    <h3>Sou um Artista</h3>
                    <p>Crie seu portfólio, gerencie sua agenda e seja contratado para eventos.</p>
                </div>
                <div className={styles.optionCard} onClick={() => onSelectType('CUSTOMER')}>
                    <FaHandshake className={styles.icon} />
                    <h3>Sou um Contratante</h3>
                    <p>Encontre e contrate os melhores talentos para seus eventos com segurança.</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileTypeSelection;