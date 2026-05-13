import axiosClient from './api/axiosClient.js';

/**
 * Account Service — Account Information
 * Handles: getMyInfo (current logged-in account details)
 */

export async function getMyInfo() {
  const response = await axiosClient.get('/accounts/myinfor');
  return response.data?.result ?? response.data;
}
