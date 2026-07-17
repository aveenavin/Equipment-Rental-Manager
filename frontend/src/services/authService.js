import api from './api';

// Returns response.data so callers can access response.data.user, response.data.data, etc.
export const registerUser = (data) => api.post('/auth/register', data);

export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data; // { status, data: { user } }
};

export const logoutUser = () => api.post('/auth/logout');

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data; // { status, data: { user } }
};

export const verifyEmail = (token) => api.get(`/auth/verify/${token}`);

export const resendVerification = (email) =>
  api.post('/auth/resend-verification', { email });
