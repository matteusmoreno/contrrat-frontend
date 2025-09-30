// src/components/ContractList/ContractList.js
import React, { useState } from 'react';
import styles from './ContractList.module.css';
import { Link } from 'react-router-dom';
import ContractDetailsModal from '../ContractDetailsModal/ContractDetailsModal';
import { useAuth } from '../../contexts/AuthContext';
import { translateContractStatus } from '../../utils/translations'; // 1. Importa a função

const ContractCard = ({ contract, onCardClick, userRole }) => {
    const { artist, customer, status, totalPrice, createdAt } = contract;

    const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR');
    const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice);

    const displayProfile = userRole === 'ROLE_ARTIST' ? customer : artist;
    const profileLink = userRole === 'ROLE_ARTIST' ? `/clientes/${customer.id}` : `/artistas/${artist.id}`;
    const profileRole = userRole === 'ROLE_ARTIST' ? 'Contratante' : artist.artisticField;

    return (
        <div className={`${styles.card} ${styles[status.toLowerCase()]}`} onClick={() => onCardClick(contract)}>
            <div className={styles.profileInfo}>
                <img src={displayProfile.profilePictureUrl || "https://via.placeholder.com/50"} alt={displayProfile.name} />
                <div>
                    <Link to={profileLink} onClick={(e) => e.stopPropagation()} className={styles.profileName}>{displayProfile.name}</Link>
                    <p className={styles.profileRole}>{profileRole}</p>
                </div>
            </div>
            <div className={styles.contractDetails}>
                <p><strong>Data:</strong> {formattedDate}</p>
                <p><strong>Valor:</strong> {formattedPrice}</p>
            </div>
            <div className={styles.status}>
                {translateContractStatus(status)} {/* 2. Usa a função para traduzir */}
            </div>
        </div>
    );
};


const ContractList = ({ title, contracts, onAction, footer }) => {
    const [selectedContract, setSelectedContract] = useState(null);
    const { user } = useAuth();

    if (!contracts) {
        return null;
    }

    const handleAction = () => {
        if (onAction) {
            onAction();
        }
    }

    return (
        <>
            <ContractDetailsModal
                isOpen={!!selectedContract}
                onClose={() => setSelectedContract(null)}
                contract={selectedContract}
                onAction={handleAction}
            />
            <div className={styles.listContainer}>
                <h3 className={styles.title}>{title}</h3>
                {contracts.length === 0 ? (
                    <p className={styles.emptyMessage}>Nenhum contrato nesta categoria.</p>
                ) : (
                    <div className={styles.cardsGrid}>
                        {contracts.map(contract => (
                            <ContractCard
                                key={contract.id}
                                contract={contract}
                                onCardClick={setSelectedContract}
                                userRole={user?.authorities}
                            />
                        ))}
                    </div>
                )}
                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </>
    );
};

export default ContractList;