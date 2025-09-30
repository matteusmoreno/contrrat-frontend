import React from 'react';
import styles from './AboutUsPage.module.css';

const AboutUsPage = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Sobre Nós</h1>
            <p className={styles.paragraph}>
                Bem-vindo ao Contrrat, a plataforma definitiva para conectar artistas talentosos com organizadores de eventos. Nossa missão é simplificar o processo de contratação, tornando-o mais seguro, transparente e eficiente para todos.
            </p>
            <h2 className={styles.subtitle}>Nossa História</h2>
            <p className={styles.paragraph}>
                O Contrrat nasceu da paixão pela arte e da percepção de uma necessidade no mercado de eventos. Vimos artistas lutando para gerenciar suas agendas e encontrar novas oportunidades, enquanto contratantes perdiam tempo e corriam riscos para encontrar o talento ideal. Decidimos criar uma ponte entre esses dois mundos.
            </p>
            <h2 className={styles.subtitle}>O Que Fazemos</h2>
            <p className={styles.paragraph}>
                Nossa plataforma oferece um ambiente completo onde artistas podem criar portfólios detalhados, gerenciar suas agendas com precisão e receber propostas de contrato de forma segura. Para os contratantes, oferecemos uma vasta gama de talentos verificados, com a facilidade de consultar a disponibilidade e negociar diretamente pelo site.
            </p>
            <h2 className={styles.subtitle}>Nosso Compromisso</h2>
            <p className={styles.paragraph}>
                Estamos comprometidos com a segurança, a transparência e o sucesso de cada evento. Acreditamos no poder da arte para criar momentos inesquecíveis e trabalhamos incansavelmente para que cada conexão feita através do Contrrat seja uma experiência positiva e profissional.
            </p>
        </div>
    );
};

export default AboutUsPage;