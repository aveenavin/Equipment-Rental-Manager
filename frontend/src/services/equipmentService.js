import api from './api';

/**
 * Fetch paginated, filtered equipment list.
 */
export const fetchEquipment = (params = {}) => {
  return api.get('/equipment', { params });
};

/**
 * Fetch a single equipment item by ID.
 */
export const fetchEquipmentById = (id) => {
  return api.get(`/equipment/${id}`);
};

/**
 * Create a new equipment item with optional image uploads.
 * @param {FormData} formData - multipart/form-data
 */
export const createEquipment = (formData) => {
  return api.post('/equipment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Update an equipment item. Accepts FormData for optional image uploads.
 * @param {string} id
 * @param {FormData} formData
 */
export const updateEquipment = (id, formData) => {
  return api.patch(`/equipment/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Delete an equipment item by ID.
 */
export const deleteEquipment = (id) => {
  return api.delete(`/equipment/${id}`);
};
