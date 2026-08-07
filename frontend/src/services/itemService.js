import api from './api';

/**
 * Fetch paginated, filtered item list.
 */
export const fetchItems = (params = {}) => {
  return api.get('/items', { params });
};

/**
 * Fetch a single item by ID.
 */
export const fetchItemById = (id) => {
  return api.get(`/items/${id}`);
};

/**
 * Create a new item with optional image uploads.
 * @param {FormData} formData - multipart/form-data
 */
export const createItem = (formData) => {
  return api.post('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Update an item. Accepts FormData for optional image uploads.
 * @param {string} id
 * @param {FormData} formData
 */
export const updateItem = (id, formData) => {
  return api.patch(`/items/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Delete an item by ID.
 */
export const deleteItem = (id) => {
  return api.delete(`/items/${id}`);
};
