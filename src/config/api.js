import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';

/**
 * Ulavan Santhai Mobile App - API Configuration
 *
 * Priority order for resolving the backend URL:
 *   1. Runtime override via setCustomBaseUrl() (ServerConfigModal)
 *   2. .env variables (EXPO_PUBLIC_API_URL / EXPO_PUBLIC_BACKEND_URL)
 *   3. .env LAN IP + Port (EXPO_PUBLIC_LAN_IP + EXPO_PUBLIC_BACKEND_PORT)
 *   4. Runtime Metro bundler host IP (auto-detected lazily after RN runtime is ready)
 *   5. Emulator / localhost fallback
 */
const ENV_API_URL =
  process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';
const ENV_LAN_IP =
  process.env.EXPO_PUBLIC_LAN_IP || process.env.EXPO_PUBLIC_BACKEND_IP || '';
const ENV_PORT =
  process.env.EXPO_PUBLIC_BACKEND_PORT || process.env.EXPO_PUBLIC_PORT || '5000';

const extractHost = (rawUrl) => {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return null;
  const cleaned = rawUrl.includes('://') ? rawUrl.split('://')[1] : rawUrl;
  const host = cleaned.split('/')[0].split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return host;
  }
  return null;
};

const getMetroBundlerHost = () => {
  try {
    const expoGoConfig = require('expo')?.getExpoGoProjectConfig?.();
    const hostFromExpoGo =
      extractHost(expoGoConfig?.debuggerHost) || extractHost(expoGoConfig?.hostUri);
    if (hostFromExpoGo) return hostFromExpoGo;
  } catch {
    // Ignore when ExpoGo config is unavailable
  }

  try {
    const sourceCodeModule =
      TurboModuleRegistry?.get?.('SourceCode') || NativeModules?.SourceCode;
    const scriptURL =
      sourceCodeModule?.getConstants?.()?.scriptURL || sourceCodeModule?.scriptURL;
    const hostFromScript = extractHost(scriptURL);
    if (hostFromScript) return hostFromScript;
  } catch {
    // Ignore when SourceCode is unavailable
  }

  return null;
};

const resolveDefaultBaseUrl = () => {
  if (ENV_API_URL) {
    return ENV_API_URL.trim().replace(/\/+$/, '');
  }
  if (ENV_LAN_IP) {
    return `http://${ENV_LAN_IP.trim()}:${ENV_PORT}`;
  }
  if (Platform.OS === 'web') {
    return `http://localhost:${ENV_PORT}`;
  }
  const metroHost = getMetroBundlerHost();
  if (metroHost) {
    return `http://${metroHost}:${ENV_PORT}`;
  }
  const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${fallbackHost}:${ENV_PORT}`;
};

export const BACKEND_PORT = ENV_PORT;
export const API_BASE_URL = ENV_API_URL
  ? ENV_API_URL.trim().replace(/\/+$/, '')
  : ENV_LAN_IP
    ? `http://${ENV_LAN_IP.trim()}:${ENV_PORT}`
    : `http://localhost:${ENV_PORT}`;

export const API_ENDPOINTS = {
  // Authentication Routes (from backend branch: src/routes/auth.routes.js)
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  VERIFY_OTP: '/api/auth/email/verify',
  RESEND_OTP: '/api/auth/email/resend',

  // User onboarding status / profile check (from backend branch: src/routes/user.routes.js)
  USER_ME: '/api/v1/user/me',

  // Status / Health check (from backend branch: src/server.js app.get('/'))
  HEALTH: '/',
};

/**
 * Dynamic helper to update backend IP if phone and PC are on a different network
 */
let customBaseUrl = null;

export const setCustomBaseUrl = (url) => {
  if (url) {
    customBaseUrl = url.trim().replace(/\/+$/, '');
  }
};

export const getBaseUrl = () => customBaseUrl || resolveDefaultBaseUrl();

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  getBaseUrl,
  setCustomBaseUrl,
};
