import { Platform } from 'react-native';

/**
 * Ulavan Santhai Mobile App - API Configuration
 * 
 * Default LAN IP from frontend .env: 192.168.1.50
 * Port: 5000 (Express Backend)
 */
const DEFAULT_LAN_IP = '192.168.1.74';
const DEFAULT_PORT = '5000';

const getHostAddress = () => {
  if (Platform.OS === 'android') {
    // Android emulator alias for host machine: 10.0.2.2
    // If running on a physical phone via Expo Go, LAN IP is used
    return DEFAULT_LAN_IP;
  }
  if (Platform.OS === 'ios') {
    return DEFAULT_LAN_IP;
  }
  // Web preview
  return 'localhost';
};

const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
export const BACKEND_PORT = DEFAULT_PORT;
export const API_BASE_URL = envApiUrl ? envApiUrl.replace(/\/+$/, '') : `http://${getHostAddress()}:${DEFAULT_PORT}`;

export const API_ENDPOINTS = {
  // Authentication Routes (from backend branch: src/routes/auth.routes.js)
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  VERIFY_OTP: '/api/auth/email/verify',
  RESEND_OTP: '/api/auth/email/resend',
  
  // Status / Health check (from backend branch: src/server.js app.get('/'))
  HEALTH: '/',
};

/**
 * Dynamic helper to update backend IP if phone and PC are on a different network
 */
let customBaseUrl = API_BASE_URL;

export const setCustomBaseUrl = (url) => {
  if (url) {
    customBaseUrl = url.replace(/\/+$/, '');
  }
};

export const getBaseUrl = () => customBaseUrl;

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  getBaseUrl,
  setCustomBaseUrl,
};
