import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/api'; // Importa nossa função de login
import Button from '../../components/Button/Button';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const [username, setUsername] = useState(''); // Estado para guardar o email
    const [password, setPassword] = useState(''); // Estado para guardar a senha
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Hook para redirecionar o usuário

    const handleSubmit = async (event) => {
        event.preventDefault(); // Impede o recarregamento da página
        setError('');

        try {
            const response = await login(username, password);
            const { token } = response.data;

            localStorage.setItem('authToken', token); // Salva o token
            window.location.href = '/'; // Redireciona para a home (recarregando a pág para o axios pegar o token)

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
            </form>
        </div>
    );
};

export default LoginPage;