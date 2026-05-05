import * as userRepository from './user.repository.js';

const ALLOWED_UPDATE_FIELDS = ['email', 'fullName', 'phone', 'address'];

export async function getProfile(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

export async function updateProfile(userId, payload) {
  const updates = {};

  ALLOWED_UPDATE_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      updates[field] = payload[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    const error = new Error('No valid fields provided for update');
    error.statusCode = 400;
    throw error;
  }

  const updatedUser = await userRepository.updateById(userId, updates);

  if (!updatedUser) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return updatedUser;
}
