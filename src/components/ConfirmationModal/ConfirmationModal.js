// src/components/ConfirmationModal/ConfirmationModal.js
import React from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import styles from './ConfirmationModal.module.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) {
        return null;
    }

    // Para e impede o evento de clique de continuar se propagando
    const handleConfirm = (e) => {
        e.stopPropagation();
        onConfirm();
    };

    // Para e impede o evento de clique de continuar se propagando
    const handleClose = (e) => {
        e.stopPropagation();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.container}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    <Button onClick={handleClose} variant="outline">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm}>
                        Confirmar
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;