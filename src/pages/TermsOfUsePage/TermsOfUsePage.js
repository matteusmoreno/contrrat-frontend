import React from 'react';
import styles from './TermsOfUsePage.module.css';

const TermsOfUsePage = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Termos de Uso</h1>
            <p className={styles.lastUpdated}>Última atualização: 30 de setembro de 2025</p>

            <h2 className={styles.subtitle}>1. Termos</h2>
            <p className={styles.paragraph}>
                Ao acessar ao site Contrrat, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.
            </p>

            <h2 className={styles.subtitle}>2. Uso de Licença</h2>
            <p className={styles.paragraph}>
                É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Contrrat, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob esta licença, você não pode: modificar ou copiar os materiais; usar os materiais para qualquer finalidade comercial ou para exibição pública (comercial ou não comercial); tentar descompilar ou fazer engenharia reversa de qualquer software contido no site Contrrat; remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou transferir os materiais para outra pessoa ou 'espelhe' os materiais em qualquer outro servidor.
            </p>

            <h2 className={styles.subtitle}>3. Isenção de responsabilidade</h2>
            <p className={styles.paragraph}>
                Os materiais no site da Contrrat são fornecidos 'como estão'. Contrrat não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
            </p>

            <h2 className={styles.subtitle}>Modificações</h2>
            <p className={styles.paragraph}>
                O Contrrat pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
            </p>
        </div>
    );
};

export default TermsOfUsePage;