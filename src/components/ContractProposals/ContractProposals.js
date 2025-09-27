// src/components/ContractProposals/ContractProposals.js
import React, { useState } from 'react';
import styles from './ContractProposals.module.css';
import Button from '../Button/Button';
import { confirmContract, rejectContract } from '../../services/api';

const ProposalCard = ({ contract, onAction }) => {
    const { customer, totalPrice, createdAt, availabilityIds } = contract;
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action) => {
        setIsLoading(true);
        try {
            if (action === 'confirm') {
                await confirmContract(contract.id);
            } else {
                await rejectContract(contract.id);
            }
            onAction(); // Callback para atualizar a lista no componente pai
        } catch (error) {
            console.error(`Erro ao ${action} o contrato`, error);
            // Idealmente, mostrar um erro para o usuário aqui
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.customerInfo}>
                <img src={customer.profilePictureUrl || "https://via.placeholder.com/50"} alt={customer.name} />
                <div>
                    <span className={styles.customerName}>{customer.name}</span>
                    <span className={styles.proposalDate}>
                        {new Date(createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                    </span>
                </div>
            </div>
            <div className={styles.details}>
                <span>{availabilityIds.length} horário(s)</span>
                <span className={styles.totalPrice}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}
                </span>
            </div>
            <div className={styles.actions}>
                <Button onClick={() => handleAction('reject')} variant="outline" disabled={isLoading}>
                    Recusar
                </Button>
                <Button onClick={() => handleAction('confirm')} disabled={isLoading}>
                    Aceitar
                </Button>
            </div>
        </div>
    );
};

const ContractProposals = ({ contracts, onAction }) => {
    if (!contracts || contracts.length === 0) {
        return null; // Não renderiza nada se não houver propostas
    }

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Novas Propostas de Contrato</h3>
            <div className={styles.cardList}>
                {contracts.map(contract => (
                    <ProposalCard key={contract.id} contract={contract} onAction={onAction} />
                ))}
            </div>
        </div>
    );
};

export default ContractProposals;