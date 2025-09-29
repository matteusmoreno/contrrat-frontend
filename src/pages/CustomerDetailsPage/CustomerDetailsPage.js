// src/pages/CustomerDetailsPage/CustomerDetailsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styles from './CustomerDetailsPage.module.css';
import { getCustomerById } from '../../services/api';

const placeholderImage = "https://via.placeholder.com/300x300.png/1E1E1E/EAEAEA?text=Contratante";

const CustomerDetailsPage = () => {
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCustomerData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getCustomerById(id);
            setCustomer(response.data);
        } catch (err) {
            console.error("Erro ao buscar dados do contratante:", err);
            setError("Não foi possível carregar os detalhes deste contratante.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCustomerData();
    }, [fetchCustomerData]);

    if (loading) {
        return <div className={styles.loader}></div>;
    }

    if (error) {
        return <p className={styles.error}>{error}</p>;
    }

    if (!customer) {
        return <p className={styles.error}>Contratante não encontrado.</p>;
    }

    const memberSince = new Date(customer.createdAt).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
    });


    return (
        <div className={styles.pageLayout}>
            <section className={styles.detailsContainer}>
                <img src={customer.profilePictureUrl || placeholderImage} alt={customer.name} className={styles.profileImage} />
                <div className={styles.infoSection}>
                    <h1 className={styles.name}>{customer.name}</h1>
                    <p className={styles.profileType}>Contratante</p>
                    <p className={styles.location}>
                        {customer.address.city}, {customer.address.state}
                    </p>

                    <div className={styles.contactInfo}>
                        <h4>Contato</h4>
                        <p><strong>Email:</strong> {customer.email}</p>
                        <p><strong>Telefone:</strong> {customer.phoneNumber}</p>
                    </div>

                    <div className={styles.memberInfo}>
                        <p>Membro desde {memberSince}</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CustomerDetailsPage;