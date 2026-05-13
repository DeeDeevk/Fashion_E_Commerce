import axiosClient from './api/axiosClient.js';

/**
 * Address Service — Shipping Address Management
 * Handles: getAddresses, addAddress, updateAddress, deleteAddress
 */

export async function getAddresses(accountId) {
  const response = await axiosClient.get(`/addresses/${accountId}`);
  const data = response.data?.result ?? response.data;
  return Array.isArray(data) ? data : [];
}

export async function addAddress(addressData) {
  const response = await axiosClient.post('/addresses/add', addressData);
  return response.data?.result ?? response.data;
}

export async function updateAddress(addressData) {
  const response = await axiosClient.put('/addresses/update', addressData);
  return response.data?.result ?? response.data;
}

export async function deleteAddress(addressId) {
  await axiosClient.delete(`/addresses/${addressId}`);
  return true;
}
