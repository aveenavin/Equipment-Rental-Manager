import api from './api';

export const fetchRentals = (params = {}) => api.get('/rentals', { params });

export const fetchRentalById = (id) => api.get(`/rentals/${id}`);

export const createRental = (data) => api.post('/rentals', data);

export const updateRentalStatus = (id, data) => api.patch(`/rentals/${id}/status`, data);

export const cancelRental = (id) => api.patch(`/rentals/${id}/cancel`);

export const fetchItemAvailability = (itemId) =>
  api.get(`/rentals/availability/${itemId}`);
