import api from './api';

export const processReturn = (data) => api.post('/returns', data);

export const fetchReturns = (params = {}) => api.get('/returns', { params });

export const fetchReturnById = (id) => api.get(`/returns/${id}`);

export const fetchReturnByRentalId = (rentalId) => api.get(`/returns/rental/${rentalId}`);
