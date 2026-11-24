import { getBaseUrl, API_ENDPOINTS } from '../config/api';

/**
 * Lightweight in-memory and local session cache
 */
let sessionCache = {
  token: null,
  user: null,
  pendingEmail: null,
};

export const getSessionCache = () => sessionCache;

export const clearSessionCache = () => {
  sessionCache = {
    token: null,
    user: null,
    pendingEmail: null,
  };
};

/**
 * Standard fetch wrapper with timeout
 */
const requestWithTimeout = async (url, options = {}, timeoutMs = 12000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out. Please check if your backend server is running and reachable on this network.');
    }
    throw err;
  }
};

/**
 * 1. User Login Service
 * @param {object} params
 * @param {string} params.identifier - email or 10-digit mobile number
 * @param {string} params.password
 */
export const loginUser = async ({ identifier, password }) => {
  const cleanId = String(identifier || '').trim().toLowerCase();
  const rawPassword = String(password || '');

  if (!cleanId || !rawPassword) {
    return {
      success: false,
      message: 'Please provide both your email/phone and password.',
    };
  }

  const baseUrl = getBaseUrl();
  const endpoint = `${baseUrl}${API_ENDPOINTS.LOGIN}`;

  try {
    const isEmail = cleanId.includes('@');
    const response = await requestWithTimeout(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        identifier: cleanId,
        email: isEmail ? cleanId : undefined,
        mobile: !isEmail ? cleanId.replace(/\D/g, '') : undefined,
        password: rawPassword,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data || data.success === false) {
      return {
        success: false,
        message:
          data?.message ||
          data?.error ||
          `Login failed (${response.status}). Please check your credentials and backend server connection.`,
      };
    }

    // Save session
    sessionCache.token = data.token || null;
    sessionCache.user = data.user || null;

    return {
      success: true,
      message: data.message || 'Login successful.',
      token: data.token,
      user: data.user,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Unable to connect to the backend server. Please verify backend IP & Wi-Fi connection.',
    };
  }
};

/**
 * 2. User Registration Service
 * @param {object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.mobile
 * @param {string} params.password
 */
export const registerUser = async ({ name, email, mobile, password }) => {
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanMobile = String(mobile || '').replace(/\D/g, '');
  const rawPassword = String(password || '');

  if (!cleanName || !cleanEmail || !cleanMobile || !rawPassword) {
    return {
      success: false,
      message: 'All fields (Name, Email, Mobile, Password) are required.',
    };
  }

  const baseUrl = getBaseUrl();
  const endpoint = `${baseUrl}${API_ENDPOINTS.REGISTER}`;

  try {
    const response = await requestWithTimeout(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        name: cleanName,
        username: cleanName,
        email: cleanEmail,
        mobile: cleanMobile,
        password: rawPassword,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data || data.success === false) {
      return {
        success: false,
        message:
          data?.message ||
          data?.error ||
          `Registration failed (${response.status}). Please verify your details.`,
      };
    }

    sessionCache.pendingEmail = cleanEmail;

    return {
      success: true,
      message: data.message || 'Verification code sent to your email.',
      email: data.email || cleanEmail,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Unable to connect to backend registration service.',
    };
  }
};

/**
 * 3. Verify 6-Digit Email OTP Service
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.otp
 */
export const verifyEmailOtp = async ({ email, otp }) => {
  const cleanEmail = String(email || sessionCache.pendingEmail || '').trim().toLowerCase();
  const cleanOtp = String(otp || '').trim();

  if (!cleanEmail || cleanOtp.length < 6) {
    return {
      success: false,
      message: 'Please enter all 6 digits of the verification code sent to your email.',
    };
  }

  const baseUrl = getBaseUrl();
  const endpoint = `${baseUrl}${API_ENDPOINTS.VERIFY_OTP}`;

  try {
    const response = await requestWithTimeout(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        email: cleanEmail,
        otp: cleanOtp,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data || data.success === false) {
      return {
        success: false,
        message:
          data?.message ||
          data?.error ||
          'Invalid or expired verification code. Please check your email.',
      };
    }

    sessionCache.token = data.token || null;
    sessionCache.user = data.user || null;
    sessionCache.pendingEmail = null;

    return {
      success: true,
      message: data.message || 'Account verified successfully.',
      token: data.token,
      user: data.user,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Verification service unreachable.',
    };
  }
};

/**
 * 4. Resend 6-Digit Email OTP Service
 * @param {object} params
 * @param {string} params.email
 */
export const resendEmailOtp = async ({ email }) => {
  const cleanEmail = String(email || sessionCache.pendingEmail || '').trim().toLowerCase();

  if (!cleanEmail) {
    return {
      success: false,
      message: 'Email address is required to resend verification code.',
    };
  }

  const baseUrl = getBaseUrl();
  const endpoint = `${baseUrl}${API_ENDPOINTS.RESEND_OTP}`;

  try {
    const response = await requestWithTimeout(endpoint, {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data || data.success === false) {
      return {
        success: false,
        message:
          data?.message ||
          data?.error ||
          'Failed to resend code. Please wait for the cooldown timer.',
      };
    }

    return {
      success: true,
      message: data.message || 'A fresh verification code has been dispatched to your email.',
    };
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Unable to request fresh OTP.',
    };
  }
};

/**
 * 5. Fetch Live User Profile & Onboarding Status
 * Calls GET /api/v1/user/me to sync live buyer/seller status
 * @param {string} [tokenOverride]
 */
export const fetchLiveUser = async (tokenOverride) => {
  const token = tokenOverride || sessionCache.token;
  if (!token) {
    return {
      success: false,
      message: 'No active session token.',
      data: sessionCache.user || null,
    };
  }

  const baseUrl = getBaseUrl();
  const endpoint = `${baseUrl}${API_ENDPOINTS.USER_ME}`;

  try {
    const response = await requestWithTimeout(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, 8000);

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      return {
        success: false,
        message: data?.message || 'Could not fetch live status.',
        data: sessionCache.user || null,
      };
    }

    const userData = data.data || data.user || data;
    if (userData && typeof userData === 'object') {
      sessionCache.user = {
        ...(sessionCache.user || {}),
        ...userData,
      };
    }

    return {
      success: true,
      data: userData,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
      data: sessionCache.user || null,
    };
  }
};

export default {
  loginUser,
  registerUser,
  verifyEmailOtp,
  resendEmailOtp,
  fetchLiveUser,
  getSessionCache,
  clearSessionCache,
};
