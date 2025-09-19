// src/pages/LoginPage/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Importe nosso hook
import Button from '../../components/Button/Button';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login } = useAuth(); // Obtenha a função login do contexto
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            await login(username, password);
            navigate('/'); // Redireciona para a home SEM recarregar a página
        } catch (err) {
            setError('Usuário ou senha inválidos. Tente novamente.');
        }
    };

    return (
        <div className={styles.loginContainer}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
                <h2>Acesse sua Conta</h2>
                <div className={styles.inputGroup}>
                    <label htmlFor="username">Email</label>
                    <input
                        type="email"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="password">Senha</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className={styles.error}>{error}</p>}
                <Button type="submit">Entrar</Button>
                <p className={styles.formFooter}>
                    Não tem uma conta? <Link to="/register">Cadastre-se</Link>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;