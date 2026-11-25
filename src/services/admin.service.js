import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import * as adminRepository from '../repositories/admin.repository.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('[SECURITY FATAL] JWT_SECRET is not configured in environment variables.');
}

const ADMIN_JWT_EXPIRES_IN = '24h';
const ALLOWED_ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'Administrator'];

/**
 * Service: Authenticate Administrator
 * Validates credentials against public.admin_users and issues a 24-hour admin JWT token.
 * @param {object} input
 * @param {string} input.email
 * @param {string} input.password
 * @returns {Promise<object>} Admin auth response matching frontend specification
 */
export const adminLoginService = async ({ email, password } = {}) => {
  // 1. Validate inputs
  if (!email || !password) {
    const error = new Error('Email and password are required.');
    error.statusCode = 400;
    throw error;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const rawPassword = String(password);

  // 2. Find admin in public.admin_users database
  const admin = await adminRepository.findByEmail(cleanEmail);
  if (!admin) {
    const error = new Error('Invalid login credentials.');
    error.statusCode = 401;
    throw error;
  }

  // 3. Confirm admin account is active
  if (!admin.isActive) {
    const error = new Error('Access denied. Administrator account is deactivated.');
    error.statusCode = 403;
    throw error;
  }

  // 4. Confirm administrator authorization role
  const hasRole = ALLOWED_ADMIN_ROLES.some(
    (role) => role.toUpperCase() === String(admin.role).toUpperCase()
  );

  if (!hasRole) {
    const error = new Error('Access denied. Administrator privileges required.');
    error.statusCode = 403;
    throw error;
  }

  // 5. Check password hash with bcrypt
  const isMatch = await bcrypt.compare(rawPassword, admin.password);
  if (!isMatch) {
    const error = new Error('Invalid login credentials.');
    error.statusCode = 401;
    throw error;
  }

  // 6. Generate 24-hour Admin JWT token
  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      isAdmin: true,
    },
    JWT_SECRET,
    { expiresIn: ADMIN_JWT_EXPIRES_IN }
  );

  console.log(`[ADMIN AUTH] Administrator logged in: ${admin.email} (Role: ${admin.role})`);

  // 7. Return exact frontend response structure (no name/title in user object)
  return {
    success: true,
    message: 'Admin authenticated successfully',
    token,
    user: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    },
  };
};
