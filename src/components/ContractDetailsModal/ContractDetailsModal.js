// src/components/ContractDetailsModal/ContractDetailsModal.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './ContractDetailsModal.module.css';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import { getAvailabilityById, confirmContract, rejectContract, cancelContract } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { translateContractStatus } from '../../utils/translations'; // 1. Importa a função

const ContractDetailsModal = ({ isOpen, onClose, contract, onAction }) => {
    const { user } = useAuth();
    const [availabilityDetails, setAvailabilityDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchAvailabilityDetails = useCallback(async () => {
        if (!contract?.availabilityIds) return;
        setLoading(true);
        setError('');
        try {
            const promises = contract.availabilityIds.map(id => getAvailabilityById(id));
            const responses = await Promise.all(promises);
            const details = responses.map(res => res.data);
            setAvailabilityDetails(details);
        } catch (err) {
            console.error("Erro ao buscar detalhes da agenda:", err);
            setError('Não foi possível carregar os detalhes da agenda.');
        } finally {
            setLoading(false);
        }
    }, [contract]);

    useEffect(() => {
        if (isOpen) {
            fetchAvailabilityDetails();
        }
    }, [isOpen, fetchAvailabilityDetails]);

    const handleAction = async (action) => {
        setLoading(true);
        setError('');
        try {
            if (action === 'confirm') {
                await confirmContract(contract.id);
            } else if (action === 'reject') {
                await rejectContract(contract.id);
            } else if (action === 'cancel') {
                await cancelContract(contract.id);
            }
            onAction();
            onClose();
        } catch (err) {
            console.error(`Erro ao ${action} o contrato:`, err);
            setError(err.response?.data || 'Ocorreu um erro ao processar a ação.');
            setLoading(false);
        }
    };

    if (!isOpen || !contract) return null;

    const { artist, customer, status, totalPrice, createdAt } = contract;
    const userRole = user?.authorities;

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.modalContent}>
                <h3 className={styles.title}>Detalhes do Contrato</h3>
                <div className={styles.parties}>
                    <div className={styles.party}>
                        <h4>Contratante</h4>
                        <Link to={`/clientes/${customer.id}`} className={styles.partyLink}>
                            <img src={customer.profilePictureUrl || "https://via.placeholder.com/50"} alt={customer.name} />
                            <span>{customer.name}</span>
                        </Link>
                    </div>
                    <div className={styles.party}>
                        <h4>Artista</h4>
                        <Link to={`/artistas/${artist.id}`} className={styles.partyLink}>
                            <img src={artist.profilePictureUrl || "https://via.placeholder.com/50"} alt={artist.name} />
                            <span>{artist.name}</span>
                        </Link>
                    </div>
                </div>

                <div className={styles.detailsGrid}>
                    <div>
                        <strong>Status:</strong>
                        <span className={`${styles.status} ${styles[status.toLowerCase()]}`}>{translateContractStatus(status)}</span> {/* 2. Usa a função para traduzir */}
                    </div>
                    <div><strong>Valor Total:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}</div>
                    <div><strong>Data da Proposta:</strong> {formatDate(createdAt)}</div>
                </div>

                <div className={styles.scheduleSection}>
                    <h4>Horários Agendados</h4>
                    {loading && !availabilityDetails.length ? <p>Carregando horários...</p> : (
                        <ul className={styles.scheduleList}>
                            {availabilityDetails.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).map(slot => (
                                <li key={slot.id}>
                                    <span className={styles.scheduleDate}>{formatDate(slot.startTime)}</span>
                                    <span className={styles.scheduleTime}>{formatTime(slot.startTime)} às {formatTime(slot.endTime)}</span>
                                    <span className={styles.schedulePrice}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(slot.price)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.actions}>
                    {userRole === 'ROLE_ARTIST' && status === 'PENDING_CONFIRMATION' && (
                        <>
                            <Button onClick={() => handleAction('reject')} variant="outline" disabled={loading}>Recusar</Button>
                            <Button onClick={() => handleAction('confirm')} disabled={loading}>Aceitar Proposta</Button>
                        </>
                    )}

                    {userRole === 'ROLE_CUSTOMER' && status === 'PENDING_CONFIRMATION' && (
                        <Button onClick={() => handleAction('cancel')} variant="danger" disabled={loading}>
                            Cancelar Proposta
                        </Button>
                    )}

                    {status === 'CONFIRMED' && (
                        <Button onClick={() => handleAction('cancel')} variant="danger" disabled={loading}>
                            Cancelar Contrato
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ContractDetailsModal;