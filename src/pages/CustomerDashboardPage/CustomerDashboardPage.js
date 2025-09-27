// src/pages/CustomerDashboardPage/CustomerDashboardPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, getContractsForCustomer } from '../../services/api';
import styles from './CustomerDashboardPage.module.css';
import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button';

// **INÍCIO DA CORREÇÃO**
// O caminho agora aponta para o arquivo JS específico dentro da pasta do componente.
import CustomerProfileSummary from '../../components/CustomerProfileSummary/CustomerProfileSummary';
import ContractList from '../../components/ContractList/ContractList';
// **FIM DA CORREÇÃO**

const CustomerDashboardPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (user?.customerId) {
                setLoading(true);
                setError(null);
                try {
                    const [profileResponse, contractsResponse] = await Promise.all([
                        getProfile('CUSTOMER', user.customerId),
                        getContractsForCustomer()
                    ]);
                    setProfileData(profileResponse.data);
                    setContracts(contractsResponse.data.content || []);
                } catch (err) {
                    console.error("Erro ao buscar dados do cliente:", err);
                    setError("Não foi possível carregar os dados do dashboard.");
                } finally {
                    setLoading(false);
                }
            }
        };

        if (!authLoading) {
            fetchData();
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return <div className={styles.message}>Carregando...</div>;
    }

    if (error) {
        return <div className={styles.messageError}>{error}</div>;
    }

    if (!profileData) {
        return <div className={styles.message}>Não foi possível carregar o perfil.</div>;
    }

    const pendingContracts = contracts.filter(c => c.status === 'PENDING_CONFIRMATION');
    const confirmedContracts = contracts.filter(c => c.status === 'CONFIRMED');
    const historyContracts = contracts.filter(c => ['REJECTED', 'CANCELED', 'COMPLETED'].includes(c.status));

    return (
        <div className={styles.dashboardGrid}>
            <aside className={styles.sidebar}>
                <CustomerProfileSummary profileData={profileData} />
            </aside>
            <main className={styles.mainContent}>
                <div className={styles.ctaCard}>
                    <h2>Encontre o artista ideal para seu próximo evento</h2>
                    <p>Milhares de talentos esperando por você.</p>
                    <Link to="/artistas">
                        <Button variant="primary">Buscar Artistas</Button>
                    </Link>
                </div>
                <ContractList title="Contratos Pendentes" contracts={pendingContracts} />
                <ContractList title="Próximos Eventos" contracts={confirmedContracts} />
                <ContractList title="Histórico de Contratos" contracts={historyContracts} />
            </main>
        </div>
    );
};

export default CustomerDashboardPage;