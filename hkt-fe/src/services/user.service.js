import axiosClient from './api/axiosClient.js';

export async function getProfile() {
  const response = await axiosClient.get('/customer/profile');
  return response.data;
}

export async function updateProfile(profileData) {
  const response = await axiosClient.put('/customer/update', profileData);
  return response.data;
}
