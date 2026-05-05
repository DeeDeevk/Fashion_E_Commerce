import jwt from 'jsonwebtoken';
import * as userRepository from '../user/user.repository.js';
import { JWT_SECRET } from '../../config/index.js';
import { hashPassword, comparePassword } from '../../utils/hash.js';

// Simple temporary store for mock forgot-password OTPs
const otpStore = new Map();

export async function register(accountData) {
  const { username, password, customer } = accountData;

  if (!username || !password || !customer?.email || !customer?.fullName) {
    const error = new Error('Missing required fields for registration');
    error.statusCode = 400;
    throw error;
  }

  // Check if username or email already exists
  const existingUserByUsername = await userRepository.findByUsername(username);
  if (existingUserByUsername) {
    const error = new Error('Username already exists');
    error.statusCode = 409;
    throw error;
  }

  const existingUserByEmail = await userRepository.findByEmail(customer.email);
  if (existingUserByEmail) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  // Create new user record
  const newUser = await userRepository.create({
    username,
    password: hashPassword(password),
    email: customer.email,
    fullName: customer.fullName,
    phoneNumber: customer.phoneNumber || '',
    gender: customer.gender || 'MALE',
    dateOfBirth: customer.dateOfBirth || null
  });

  return newUser;
}

export async function login({ username, password }) {
  if (!username || !password) {
    const error = new Error('Username and password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findByUsername(username);
  if (!user || !comparePassword(password, user.password)) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      email: user.email,
      scope: 'USER' // Align with role checks in frontend
    }, 
    JWT_SECRET, 
    { expiresIn: '1d' }
  );

  return { token };
}

export async function forgotPassword(email) {
  if (!email) {
    const error = new Error('Email is required');
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error('Email not found');
    error.statusCode = 404;
    throw error;
  }

  // Generate mock OTP
  const otp = '123456';
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '10m' });

  // Store in memory
  otpStore.set(token, { email, otp, passwordUpdateAllowed: true });

  return { token, otp };
}

export async function resetPassword({ token, otp, newPassword }) {
  if (!token || !otp || !newPassword) {
    const error = new Error('Token, OTP and new password are required');
    error.statusCode = 400;
    throw error;
  }

  const storedData = otpStore.get(token);
  if (!storedData || storedData.otp !== otp) {
    const error = new Error('Invalid or expired OTP');
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findByEmail(storedData.email);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Update password
  await userRepository.updateById(user.id, {
    password: hashPassword(newPassword)
  });

  // Clean up
  otpStore.delete(token);

  return true;
}
