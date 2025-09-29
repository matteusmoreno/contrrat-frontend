// src/pages/ContractManagementPage/ContractManagementPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getContractsForArtist, getContractsForCustomer } from '../../services/api';
import ContractList from '../../components/ContractList/ContractList';
import styles from './ContractManagementPage.module.css';

const ContractManagementPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchContracts = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError('');

        try {
            const isArtist = user.authorities === 'ROLE_ARTIST';
            const fetcher = isArtist ? getContractsForArtist : getContractsForCustomer;
            const response = await fetcher();
            setContracts(response.data.content || []);
        } catch (err) {
            console.error("Erro ao buscar contratos:", err);
            setError('Não foi possível carregar seus contratos. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading) {
            fetchContracts();
        }
    }, [authLoading, fetchContracts]);


    if (loading || authLoading) {
        return <div className={styles.loader}></div>;
    }

    if (error) {
        return <p className={styles.messageError}>{error}</p>;
    }

    const pendingContracts = contracts.filter(c => c.status === 'PENDING_CONFIRMATION');
    const confirmedContracts = contracts.filter(c => c.status === 'CONFIRMED');
    const historyContracts = contracts.filter(c => ['REJECTED', 'CANCELED', 'COMPLETED'].includes(c.status));

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Gerenciamento de Contratos</h1>
                <p>Visualize e gerencie todos os seus contratos em um só lugar.</p>
            </header>

            <div className={styles.contractsSection}>
                {user.authorities === 'ROLE_ARTIST' && (
                    <ContractList
                        title="Propostas Pendentes"
                        contracts={pendingContracts}
                        onAction={fetchContracts}
                    />
                )}

                {user.authorities === 'ROLE_CUSTOMER' && (
                    <ContractList
                        title="Contratos Aguardando Confirmação do Artista"
                        contracts={pendingContracts}
                        onAction={fetchContracts}
                    />
                )}


                <ContractList
                    title="Próximos Eventos Confirmados"
                    contracts={confirmedContracts}
                    onAction={fetchContracts}
                />

                <ContractList
                    title="Histórico de Contratos"
                    contracts={historyContracts}
                    onAction={fetchContracts}
                />
            </div>
        </div>
    );
};

export default ContractManagementPage;