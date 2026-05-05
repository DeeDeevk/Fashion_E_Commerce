import * as addressRepository from './address.repository.js';

export async function getAddresses(accountId) {
  return await addressRepository.findByAccountId(accountId);
}

export async function addAddress(addressData) {
  if (!addressData.delivery_address || !addressData.province) {
     const error = new Error('Address and Province are required');
     error.statusCode = 400;
     throw error;
  }
  return await addressRepository.create(addressData);
}

export async function updateAddress(addressData) {
  if (!addressData.id) {
    const error = new Error('Address ID is required');
    error.statusCode = 400;
    throw error;
  }
  return await addressRepository.update(addressData.id, addressData);
}

export async function deleteAddress(id) {
  return await addressRepository.remove(id);
}
