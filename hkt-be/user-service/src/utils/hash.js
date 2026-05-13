import crypto from 'crypto';

/**
 * Hash password using SHA-256
 * @param {string} password 
 * @returns {string} hashed password
 */
export function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Compare plain password with hashed password
 * @param {string} password 
 * @param {string} hashedPassword 
 * @returns {boolean}
 */
export function comparePassword(password, hashedPassword) {
  return hashPassword(password) === hashedPassword;
}
