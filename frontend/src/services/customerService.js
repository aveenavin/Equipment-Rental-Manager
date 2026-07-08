import api from './api';

export const fetchCustomers = (params = {}) => api.get('/customers', { params });

export const fetchCustomerById = (id) => api.get(`/customers/${id}`);

export const updateCustomer = (id, data) => api.patch(`/customers/${id}`, data);

export const deleteCustomer = (id) => api.delete(`/customers/${id}`);
