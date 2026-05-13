import authClient from './api/authClient.js';

/**
 * Auth Service — Authentication & JWT
 * Handles: login, register, forgotPassword, resetPassword, logout
 * All authentication requests are routed to the Auth module (port 8080)
 */

export async function login(credentials) {
  const response = await authClient.post('/auth/login', credentials);
  return response.data;
}

export async function register(accountData) {
  // Java Auth service register endpoint is /accounts (not /auth/register)
  const response = await authClient.post('/accounts', accountData);
  return response.data;
}

export async function forgotPassword(email) {
  const response = await authClient.post('/auth/forgot-password', { email });
  return response.data;
}

export async function resetPassword(data) {
  const response = await authClient.post('/auth/reset-password', data);
  return response.data;
}

export function logout() {
  localStorage.removeItem('accessToken');
  window.dispatchEvent(new Event('logout'));
}
