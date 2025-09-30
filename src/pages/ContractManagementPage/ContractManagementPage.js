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
    const [activeTab, setActiveTab] = useState('pending');
    const [activeHistoryTab, setActiveHistoryTab] = useState('completed');

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

    const groupContractsByParty = (contractList) => {
        const isArtistView = user.authorities === 'ROLE_ARTIST';
        const partyKey = isArtistView ? 'customer' : 'artist';

        return contractList.reduce((acc, contract) => {
            const party = contract[partyKey];
            if (!acc[party.id]) {
                acc[party.id] = {
                    partyInfo: party,
                    contracts: []
                };
            }
            acc[party.id].contracts.push(contract);
            return acc;
        }, {});
    };

    if (loading || authLoading) {
        return <div className={styles.loader}></div>;
    }

    if (error) {
        return <p className={styles.messageError}>{error}</p>;
    }

    const pendingContracts = contracts.filter(c => c.status === 'PENDING_CONFIRMATION');
    const confirmedContracts = contracts.filter(c => c.status === 'CONFIRMED');
    const completedContracts = contracts.filter(c => c.status === 'COMPLETED');
    const rejectedContracts = contracts.filter(c => c.status === 'REJECTED');
    const canceledContracts = contracts.filter(c => c.status === 'CANCELED');

    const isArtist = user.authorities === 'ROLE_ARTIST';

    const groupedPending = groupContractsByParty(pendingContracts);
    const groupedConfirmed = groupContractsByParty(confirmedContracts);
    const groupedCompleted = groupContractsByParty(completedContracts);
    const groupedRejected = groupContractsByParty(rejectedContracts);
    const groupedCanceled = groupContractsByParty(canceledContracts);

    const renderGroupedContracts = (groupedData, title) => {
        const groups = Object.values(groupedData);
        if (groups.length === 0) {
            return <p className={styles.emptyMessage}>Nenhum contrato para exibir nesta categoria.</p>;
        }
        return groups.map(group => (
            <div key={group.partyInfo.id} className={styles.partyGroup}>
                <ContractList
                    title={`Contratos com ${group.partyInfo.name}`}
                    contracts={group.contracts}
                    onAction={fetchContracts}
                />
            </div>
        ));
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Gerenciamento de Contratos</h1>
                <p>Visualize e gerencie todos os seus contratos em um só lugar.</p>
            </header>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'pending' ? styles.active : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pendentes ({pendingContracts.length})
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'confirmed' ? styles.active : ''}`}
                    onClick={() => setActiveTab('confirmed')}
                >
                    Confirmados ({confirmedContracts.length})
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'history' ? styles.active : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    Histórico ({completedContracts.length + rejectedContracts.length + canceledContracts.length})
                </button>
            </div>

            <div className={styles.contractsSection}>
                {activeTab === 'pending' && renderGroupedContracts(groupedPending)}
                {activeTab === 'confirmed' && renderGroupedContracts(groupedConfirmed)}

                {activeTab === 'history' && (
                    <div className={styles.historyContainer}>
                        <div className={styles.subTabs}>
                            <button
                                className={`${styles.subTabButton} ${activeHistoryTab === 'completed' ? styles.active : ''}`}
                                onClick={() => setActiveHistoryTab('completed')}
                            >
                                Finalizados ({completedContracts.length})
                            </button>
                            <button
                                className={`${styles.subTabButton} ${activeHistoryTab === 'rejected' ? styles.active : ''}`}
                                onClick={() => setActiveHistoryTab('rejected')}
                            >
                                Rejeitados ({rejectedContracts.length})
                            </button>
                            <button
                                className={`${styles.subTabButton} ${activeHistoryTab === 'canceled' ? styles.active : ''}`}
                                onClick={() => setActiveHistoryTab('canceled')}
                            >
                                Cancelados ({canceledContracts.length})
                            </button>
                        </div>
                        <div className={styles.historyContent}>
                            {activeHistoryTab === 'completed' && renderGroupedContracts(groupedCompleted)}
                            {activeHistoryTab === 'rejected' && renderGroupedContracts(groupedRejected)}
                            {activeHistoryTab === 'canceled' && renderGroupedContracts(groupedCanceled)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContractManagementPage;