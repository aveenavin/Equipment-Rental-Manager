import api from './api';

export const fetchMaintenanceLogs = (params = {}) => api.get('/maintenance', { params });

export const fetchMaintenanceLogById = (id) => api.get(`/maintenance/${id}`);

export const createMaintenanceLog = (data) => api.post('/maintenance', data);

export const completeMaintenanceLog = (id, data) => api.patch(`/maintenance/${id}/complete`, data);
