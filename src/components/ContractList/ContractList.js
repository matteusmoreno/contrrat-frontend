// src/components/ContractList/ContractList.js
import React from 'react';
import styles from './ContractList.module.css';
import { Link } from 'react-router-dom';

const ContractCard = ({ contract }) => {
    const { artist, status, totalPrice, createdAt } = contract;

    const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR');
    const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice);

    return (
        <div className={`${styles.card} ${styles[status.toLowerCase()]}`}>
            <div className={styles.artistInfo}>
                <img src={artist.profilePictureUrl || "https://via.placeholder.com/50"} alt={artist.name} />
                <div>
                    <Link to={`/artistas/${artist.id}`} className={styles.artistName}>{artist.name}</Link>
                    <p className={styles.artisticField}>{artist.artisticField}</p>
                </div>
            </div>
            <div className={styles.contractDetails}>
                <p><strong>Data:</strong> {formattedDate}</p>
                <p><strong>Valor:</strong> {formattedPrice}</p>
            </div>
            <div className={styles.status}>
                {status.replace('_', ' ')}
            </div>
        </div>
    );
};


const ContractList = ({ title, contracts }) => {
    if (!contracts || contracts.length === 0) {
        return (
            <div className={styles.listContainer}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.emptyMessage}>Nenhum contrato nesta categoria.</p>
            </div>
        );
    }

    return (
        <div className={styles.listContainer}>
            <h3 className={styles.title}>{title}</h3>
            <div className={styles.cardsGrid}>
                {contracts.map(contract => (
                    <ContractCard key={contract.id} contract={contract} />
                ))}
            </div>
        </div>
    );
};

export default ContractList;