import React from 'react';
import styles from './PrivacyPolicyPage.module.css';

const PrivacyPolicyPage = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Política de Privacidade</h1>
            <p className={styles.lastUpdated}>Última atualização: 30 de setembro de 2025</p>

            <p className={styles.paragraph}>
                A sua privacidade é importante para nós. É política do Contrrat respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site Contrrat, e outros sites que possuímos e operamos.
            </p>

            <h2 className={styles.subtitle}>1. Informações que coletamos</h2>
            <p className={styles.paragraph}>
                Coletamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
            </p>

            <h2 className={styles.subtitle}>2. Uso de dados</h2>
            <p className={styles.paragraph}>
                Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
            </p>

            <h2 className={styles.subtitle}>3. Cookies</h2>
            <p className={styles.paragraph}>
                Utilizamos cookies para melhorar a experiência de navegação. Ao utilizar nosso site, você concorda com o uso de cookies.
            </p>

            <h2 className={styles.subtitle}>4. Links para sites de terceiros</h2>
            <p className={styles.paragraph}>
                O nosso site pode ter links para sites externos que não são operados por nós. Esteja ciente de que não temos controle sobre o conteúdo e práticas desses sites e não podemos aceitar responsabilidade por suas respectivas políticas de privacidade.
            </p>

            <p className={styles.paragraph}>
                Esta política é efetiva a partir de Setembro/2025.
            </p>
        </div>
    );
};

export default PrivacyPolicyPage;