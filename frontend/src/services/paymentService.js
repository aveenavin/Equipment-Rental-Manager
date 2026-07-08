import api from './api';

export const recordPayment = (data) => api.post('/payments', data);

export const fetchPayments = (params = {}) => api.get('/payments', { params });

export const fetchPaymentById = (id) => api.get(`/payments/${id}`);

export const fetchPaymentsByRental = (rentalId) => api.get(`/payments/rental/${rentalId}`);

export const fetchInvoice = (rentalId) => api.get(`/payments/invoice/${rentalId}`);
