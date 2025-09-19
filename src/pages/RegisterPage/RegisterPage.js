// src/pages/RegisterPage/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './RegisterPage.module.css';
import { createArtist, createCustomer } from '../../services/api'; // Criaremos em breve
import Button from '../../components/Button/Button';
import InputField from '../../components/InputField/InputField';

const RegisterPage = () => {
    const [profileType, setProfileType] = useState('CUSTOMER'); // ou 'ARTIST'
    const [formData, setFormData] = useState({
        name: '',
        birthDate: '',
        phoneNumber: '',
        email: '',
        password: '',
        cep: '',
        number: '',
        complement: '',
        description: '', // Apenas para artistas
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            let response;
            if (profileType === 'ARTIST') {
                response = await createArtist(formData);
            } else {
                response = await createCustomer(formData);
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
                    <button
                        type="button"
                        className={`${styles.toggleButton} ${profileType === 'CUSTOMER' ? styles.active : ''}`}
                        onClick={() => setProfileType('CUSTOMER')}
                    >
                        Sou Contratante
                    </button>
                    <button
                        type="button"
                        className={`${styles.toggleButton} ${profileType === 'ARTIST' ? styles.active : ''}`}
                        onClick={() => setProfileType('ARTIST')}
                    >
                        Sou Artista
                    </button>
                </div>

                <InputField id="name" label="Nome Completo" value={formData.name} onChange={handleChange} required />
                <InputField id="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
                <InputField id="password" label="Senha" type="password" value={formData.password} onChange={handleChange} required />
                <InputField id="birthDate" label="Data de Nascimento" type="date" value={formData.birthDate} onChange={handleChange} required />
                <InputField id="phoneNumber" label="Telefone (xx)xxxxx-xxxx" value={formData.phoneNumber} onChange={handleChange} required pattern="\(\d{2}\)\d{4,5}-\d{4}" title="Formato: (xx)xxxxx-xxxx" />
                <InputField id="cep" label="CEP" value={formData.cep} onChange={handleChange} required pattern="\d{5}-\d{3}" title="Formato: xxxxx-xxx" />
                <InputField id="number" label="Número" value={formData.number} onChange={handleChange} />
                <InputField id="complement" label="Complemento" value={formData.complement} onChange={handleChange} />

                {profileType === 'ARTIST' && (
                    <InputField id="description" label="Descrição (Fale sobre sua arte)" value={formData.description} onChange={handleChange} />
                )}

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