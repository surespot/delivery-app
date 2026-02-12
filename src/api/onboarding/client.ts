import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from './types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const VERIFICATION_TOKEN_KEY = 'verificationToken';

// Helper function to get auth token from storage
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to get verification token from storage
const getVerificationToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(VERIFICATION_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting verification token:', error);
    return null;
  }
};

// Helper function to get refresh token from storage
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

// Helper function to save auth token
export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
};

// Helper function to save refresh token
export const saveRefreshToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving refresh token:', error);
  }
};

// Helper function to save verification token
export const saveVerificationToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(VERIFICATION_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving verification token:', error);
  }
};

// Helper function to clear tokens
export const clearTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, VERIFICATION_TOKEN_KEY]);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  requiresVerificationToken?: boolean;
}

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Attempts to refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data: ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }> =
        await response.json();

      if (response.ok && data.data?.tokens) {
        await saveAuthToken(data.data.tokens.accessToken);
        if (data.data.tokens.refreshToken) {
          await saveRefreshToken(data.data.tokens.refreshToken);
        }
        return data.data.tokens.accessToken;
      }

      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    requiresAuth = false,
    requiresVerificationToken = false,
  } = options;

  const url = `${BASE_URL}${endpoint}`;
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth token if required
  if (requiresAuth) {
    const token = await getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Add verification token if required
  if (requiresVerificationToken) {
    const token = await getVerificationToken();
    if (token) {
      requestHeaders['X-Verification-Token'] = token;
    }
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    // If we get a 401 and this requires auth, try to refresh the token
    if (response.status === 401 && requiresAuth && !isRefreshing) {
      const newAccessToken = await refreshAccessToken();
      
      if (newAccessToken) {
        // Retry the original request with the new token
        requestHeaders['Authorization'] = `Bearer ${newAccessToken}`;
        const retryConfig: RequestInit = {
          ...config,
          headers: requestHeaders,
        };
        
        const retryResponse = await fetch(url, retryConfig);
        const retryData: ApiResponse<T> = await retryResponse.json();
        
        if (!retryResponse.ok) {
          // If retry also fails, handle error
          if (!retryData.success && retryData.error) {
            throw new Error(retryData.error.message || 'An error occurred');
          }
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        
        return retryData;
      } else {
        // Refresh failed, clear tokens
        await clearTokens();
        throw new Error('Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      // Handle error responses
      if (!data.success && data.error) {
        throw new Error(data.error.message || 'An error occurred');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

// API Client Functions
export const onboardingApi = {
  // Get rider profile by registration code (masked)
  getRiderProfileByCode: (code: string) =>
    apiRequest<import('./types').MaskedRiderProfile>(
      `/riders/registration/${code}`
    ),

  // Initiate registration
  initiateRegistration: (data: import('./types').InitiateRegistrationRequest) =>
    apiRequest<import('./types').InitiateRegistrationResponse>(
      '/riders/registration/initiate',
      {
        method: 'POST',
        body: data,
      }
    ),

  // Send email OTP
  sendEmailOtp: (data: { email: string }) =>
    apiRequest<import('./types').SendOtpResponse>('/auth/email/send-otp', {
      method: 'POST',
      body: data,
    }),

  // Verify email OTP
  verifyEmailOtp: (data: { email: string; otp: string }) =>
    apiRequest<import('./types').VerifyOtpResponse>('/auth/email/verify-otp', {
      method: 'POST',
      body: data,
    }),

  // Resend email OTP
  resendEmailOtp: (data: { email: string }) =>
    apiRequest<import('./types').SendOtpResponse>('/auth/email/resend-otp', {
      method: 'POST',
      body: data,
    }),

  // Send phone OTP
  sendPhoneOtp: (data: { phone: string; countryCode?: string }) =>
    apiRequest<import('./types').SendOtpResponse>('/auth/phone/send-otp', {
      method: 'POST',
      body: data,
    }),

  // Verify phone OTP
  verifyPhoneOtp: (data: { phone: string; otp: string }) =>
    apiRequest<import('./types').VerifyOtpResponse>('/auth/phone/verify-otp', {
      method: 'POST',
      body: data,
    }),

  // Resend phone OTP
  resendPhoneOtp: (data: { phone: string }) =>
    apiRequest<import('./types').SendOtpResponse>('/auth/phone/resend-otp', {
      method: 'POST',
      body: data,
    }),

  // Create password
  createPassword: (data: import('./types').CreatePasswordRequest) =>
    apiRequest<import('./types').CreatePasswordResponse>(
      '/auth/password/create',
      {
        method: 'POST',
        body: data,
        requiresVerificationToken: true,
      }
    ),

  // Login
  login: (data: import('./types').LoginRequest) =>
    apiRequest<import('./types').LoginResponse>('/auth/login', {
      method: 'POST',
      body: data,
    }),

  // Refresh token
  refreshToken: (data: import('./types').RefreshTokenRequest) =>
    apiRequest<import('./types').RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: data,
    }),

  // Complete registration
  completeRegistration: (
    data: import('./types').CompleteRegistrationRequest
  ) =>
    apiRequest<import('./types').CompleteRegistrationResponse>(
      '/riders/registration/complete',
      {
        method: 'POST',
        body: data,
        requiresAuth: true,
      }
    ),

  // Get current rider profile
  getCurrentRiderProfile: () =>
    apiRequest<import('./types').RiderProfile>('/riders/me', {
      requiresAuth: true,
    }),

  // Update schedule
  updateSchedule: (data: import('./types').UpdateScheduleRequest) =>
    apiRequest<import('./types').UpdateScheduleResponse>(
      '/riders/me/schedule',
      {
        method: 'PATCH',
        body: data,
        requiresAuth: true,
      }
    ),

  // Logout
  logout: (data: { refreshToken: string }) =>
    apiRequest<import('./types').LogoutResponse>('/auth/logout', {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),

  // Upload profile avatar (multipart/form-data)
  uploadAvatar: async (file: {
    uri: string;
    type: string;
    name: string;
  }): Promise<ApiResponse<import('./types').UploadAvatarData>> => {
    try {
      const token = await getAuthToken();
      const formData = new FormData();

      formData.append('image', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);

      const response = await fetch(`${BASE_URL}/auth/profile/avatar`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data: ApiResponse<import('./types').UploadAvatarData> =
        await response.json();

      if (!response.ok || !data.success) {
        const message =
          data.error?.message ||
          (response.status === 400
            ? 'Invalid image. Please upload a JPEG, PNG, or WebP file under 5MB.'
            : 'Failed to upload profile picture');
        throw new Error(message);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred while uploading avatar');
    }
  },

  // Send password reset OTP (phone)
  sendPasswordResetOtp: (
    data: import('./types').SendPasswordResetOtpRequest
  ) =>
    apiRequest<import('./types').SendOtpResponse>(
      '/auth/password/reset/send-otp',
      {
        method: 'POST',
        body: data,
      }
    ),

  // Verify password reset OTP (phone)
  verifyPasswordResetOtp: (
    data: import('./types').VerifyPasswordResetOtpRequest
  ) =>
    apiRequest<import('./types').VerifyPasswordResetOtpResponse>(
      '/auth/password/reset/verify-otp',
      {
        method: 'POST',
        body: data,
      }
    ),

  // Send password reset OTP (email)
  sendPasswordResetEmailOtp: (
    data: import('./types').SendPasswordResetEmailOtpRequest
  ) =>
    apiRequest<import('./types').SendOtpResponse>(
      '/auth/password/reset/email/send-otp',
      {
        method: 'POST',
        body: data,
      }
    ),

  // Verify password reset OTP (email)
  verifyPasswordResetEmailOtp: (
    data: import('./types').VerifyPasswordResetEmailOtpRequest
  ) =>
    apiRequest<import('./types').VerifyPasswordResetOtpResponse>(
      '/auth/password/reset/email/verify-otp',
      {
        method: 'POST',
        body: data,
      }
    ),

  // Update password after reset
  updatePassword: async (
    data: import('./types').UpdatePasswordRequest,
    resetToken: string
  ): Promise<import('./types').UpdatePasswordResponseType> => {
    const url = `${BASE_URL}/auth/password/reset/update`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Reset-Token': resetToken,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const result: ApiResponse<import('./types').UpdatePasswordResponse> =
      await response.json();

    if (!response.ok) {
      if (!result.success && result.error) {
        throw new Error(result.error.message || 'An error occurred');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return result as import('./types').UpdatePasswordResponseType;
  },
};
