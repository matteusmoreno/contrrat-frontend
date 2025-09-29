// src/components/ConfirmationModal/ConfirmationModal.js
import React from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import styles from './ConfirmationModal.module.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.container}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    <Button onClick={onClose} variant="outline">
                        Cancelar
                    </Button>
                    <Button onClick={onConfirm}>
                        Confirmar
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
