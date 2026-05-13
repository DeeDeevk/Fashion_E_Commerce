import axiosClient from './api/axiosClient.js';

/**
 * Customer Service — Customer Profile Management
 * Handles: getProfile, updateProfile
 */

export async function getProfile() {
  const response = await axiosClient.get('/customer/profile');
  return response.data?.result ?? response.data;
}

export async function updateProfile(profileData) {
  const response = await axiosClient.put('/customer/update', profileData);
  return response.data?.result ?? response.data;
}
