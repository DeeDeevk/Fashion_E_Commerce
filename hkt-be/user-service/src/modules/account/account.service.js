import * as userRepository from '../user/user.repository.js';

export async function getMyInfo(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Map user data to account info structure expected by FE
  return {
    id: user.id,
    email: user.email,
    roles: [{ name: 'USER' }] // Dummy role for now
  };
}
