// src/utils/translations.js
export const translateContractStatus = (status) => {
    const translations = {
        PENDING_CONFIRMATION: 'PENDENTE',
        CONFIRMED: 'CONFIRMADO',
        REJECTED: 'RECUSADO',
        CANCELED: 'CANCELADO',
        COMPLETED: 'FINALIZADO',
    };
    return translations[status] || status;
};