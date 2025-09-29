// src/components/ContractProposals/ContractProposals.js
import React, { useState } from 'react';
import styles from './ContractProposals.module.css';
import Button from '../Button/Button';
import { confirmContract, rejectContract } from '../../services/api';
import ContractDetailsModal from '../ContractDetailsModal/ContractDetailsModal';

const ProposalCard = ({ contract, onAction, onCardClick }) => {
    const { customer, totalPrice, createdAt, availabilityIds } = contract;
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (e, action) => {
        e.stopPropagation(); // Impede que o clique no botão abra o modal
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.card} onClick={() => onCardClick(contract)}>
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
                <Button onClick={(e) => handleAction(e, 'reject')} variant="outline" disabled={isLoading}>
                    Recusar
                </Button>
                <Button onClick={(e) => handleAction(e, 'confirm')} disabled={isLoading}>
                    Aceitar
                </Button>
            </div>
        </div>
    );
};

const ContractProposals = ({ contracts, onAction }) => {
    const [selectedContract, setSelectedContract] = useState(null);

    if (!contracts || contracts.length === 0) {
        return null;
    }

    return (
        <>
            <ContractDetailsModal
                isOpen={!!selectedContract}
                onClose={() => setSelectedContract(null)}
                contract={selectedContract}
                onAction={onAction}
            />
            <div className={styles.container}>
                <h3 className={styles.title}>Novas Propostas de Contrato</h3>
                <div className={styles.cardList}>
                    {contracts.map(contract => (
                        <ProposalCard
                            key={contract.id}
                            contract={contract}
                            onAction={onAction}
                            onCardClick={setSelectedContract}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default ContractProposals;
