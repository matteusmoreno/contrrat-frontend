// src/pages/RegisterPage/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './RegisterPage.module.css';
import { createArtist, createCustomer } from '../../services/api';
import Button from '../../components/Button/Button';
import InputField from '../../components/InputField/InputField';

const RegisterPage = () => {
    const [profileType, setProfileType] = useState('CUSTOMER');
    const [formData, setFormData] = useState({
        name: '',
        birthDate: '',
        phoneNumber: '',
        email: '',
        password: '',
        cep: '',
        number: '',
        complement: '',
        description: '',
    });

    const [displayValues, setDisplayValues] = useState({
        birthDate: '',
        phoneNumber: '',
        cep: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMaskedChange = (e) => {
        const { name, value } = e.target;
        const rawValue = value.replace(/\D/g, '');
        let maskedValue = rawValue;
        let finalValue = value; // Valor a ser salvo no estado principal

        if (name === 'birthDate') {
            if (rawValue.length > 2) maskedValue = `${rawValue.slice(0, 2)}/${rawValue.slice(2)}`;
            if (rawValue.length > 4) maskedValue = `${rawValue.slice(0, 2)}/${rawValue.slice(2, 4)}/${rawValue.slice(4, 8)}`;

            if (rawValue.length === 8) {
                const day = rawValue.slice(0, 2);
                const month = rawValue.slice(2, 4);
                const year = rawValue.slice(4, 8);
                finalValue = `${year}-${month}-${day}`;
            } else {
                finalValue = '';
            }
        } else if (name === 'phoneNumber') {
            // CORREÇÃO: Removido o espaço e ajustado para 9º dígito
            maskedValue = rawValue
                .replace(/^(\d{2})(\d)/g, '($1)$2')
                .replace(/(\d{5})(\d)/, '$1-$2');
            finalValue = maskedValue;
        } else if (name === 'cep') {
            maskedValue = rawValue.replace(/(\d{5})(\d)/, '$1-$2');
            finalValue = maskedValue;
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
        setDisplayValues(prev => ({ ...prev, [name]: maskedValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (profileType === 'ARTIST') {
                await createArtist(formData);
            } else {
                await createCustomer(formData);
            }

            setSuccess('Cadastro realizado com sucesso! Você será redirecionado para o login.');

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            const errorMessage = err.response?.data || 'Erro ao realizar o cadastro. Verifique seus dados.';
            setError(errorMessage);
        }
    };

    return (
        <div className={styles.registerContainer}>
            <form className={styles.registerForm} onSubmit={handleSubmit}>
                <h2>Crie sua Conta</h2>

                <div className={styles.toggleContainer}>
                    <button type="button" className={`${styles.toggleButton} ${profileType === 'CUSTOMER' ? styles.active : ''}`} onClick={() => setProfileType('CUSTOMER')}>
                        Sou Contratante
                    </button>
                    <button type="button" className={`${styles.toggleButton} ${profileType === 'ARTIST' ? styles.active : ''}`} onClick={() => setProfileType('ARTIST')}>
                        Sou Artista
                    </button>
                </div>

                <InputField id="name" name="name" label="Nome Completo" value={formData.name} onChange={handleChange} required />
                <InputField id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
                <InputField id="password" name="password" label="Senha" type="password" value={formData.password} onChange={handleChange} required />
                <InputField id="birthDate" name="birthDate" label="Data de Nascimento" type="text" value={displayValues.birthDate} onChange={handleMaskedChange} required maxLength="10" placeholder="dd/mm/aaaa" />
                <InputField id="phoneNumber" name="phoneNumber" label="Telefone" value={displayValues.phoneNumber} onChange={handleMaskedChange} required maxLength="14" placeholder="(xx)xxxxx-xxxx" />

                {profileType === 'ARTIST' && (
                    <InputField id="description" name="description" label="Descrição (Fale sobre sua arte)" value={formData.description} onChange={handleChange} />
                )}

                <div className={styles.formSection}>
                    <h3>Endereço</h3>
                    <InputField id="cep" name="cep" label="CEP" value={displayValues.cep} onChange={handleMaskedChange} required maxLength="9" placeholder="xxxxx-xxx" />
                    <InputField id="number" name="number" label="Número" value={formData.number} onChange={handleChange} required />
                    <InputField id="complement" name="complement" label="Complemento (Opcional)" value={formData.complement} onChange={handleChange} />
                </div>

                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}

                <Button type="submit">Cadastrar</Button>

                <p className={styles.formFooter}>
                    Já tem uma conta? <Link to="/login">Faça login</Link>
                </p>
            </form>
        </div>
    );
};

export default RegisterPage;