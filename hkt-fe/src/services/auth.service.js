import axiosClient from './api/axiosClient.js';

/**
 * Auth Service — Authentication & JWT
 * Handles: login, register, forgotPassword, resetPassword, logout
 */

export async function login(credentials) {
  const response = await axiosClient.post('/auth/login', credentials);
  return response.data;
}

export async function register(accountData) {
  const response = await axiosClient.post('/auth/register', accountData);
  return response.data;
}

export async function forgotPassword(email) {
  const response = await axiosClient.post('/auth/forgot-password', { email });
  return response.data;
}

export async function resetPassword(data) {
  const response = await axiosClient.post('/auth/reset-password', data);
  return response.data;
}

export function logout() {
  localStorage.removeItem('accessToken');
  window.dispatchEvent(new Event('logout'));
}
