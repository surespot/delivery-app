import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  clearTokens,
  getRefreshToken,
  onboardingApi,
  saveAuthToken,
  saveRefreshToken,
  saveVerificationToken,
} from './client';
import type {
  CompleteRegistrationRequest,
  CreatePasswordRequest,
  InitiateRegistrationRequest,
  LoginRequest,
  UpdateScheduleRequest,
  VerifyOtpRequest,
} from './types';

// Query Keys
export const onboardingKeys = {
  all: ['onboarding'] as const,
  riderProfile: (code: string) => ['onboarding', 'rider-profile', code] as const,
  currentRider: () => ['onboarding', 'current-rider'] as const,
};

// Hooks for Rider Registration

/**
 * Get rider profile by registration code (masked data)
 */
export const useGetRiderProfileByCode = (code: string, enabled = true) => {
  return useQuery({
    queryKey: onboardingKeys.riderProfile(code),
    queryFn: () => onboardingApi.getRiderProfileByCode(code),
    enabled: enabled && code.length === 16,
    retry: false,
  });
};

/**
 * Initiate rider registration
 */
export const useInitiateRegistration = () => {
  return useMutation({
    mutationFn: (data: InitiateRegistrationRequest) =>
      onboardingApi.initiateRegistration(data),
  });
};

/**
 * Get current rider profile (authenticated)
 */
export const useGetCurrentRiderProfile = (enabled = true) => {
  return useQuery({
    queryKey: onboardingKeys.currentRider(),
    queryFn: () => onboardingApi.getCurrentRiderProfile(),
    enabled,
    retry: false,
  });
};

// Hooks for OTP Verification

/**
 * Send email OTP
 */
export const useSendEmailOtp = () => {
  return useMutation({
    mutationFn: (data: { email: string }) => onboardingApi.sendEmailOtp(data),
  });
};

/**
 * Verify email OTP
 */
export const useVerifyEmailOtp = () => {
  return useMutation({
    mutationFn: (data: VerifyOtpRequest) => {
      return onboardingApi.verifyEmailOtp({
        email: data.email!,
        otp: data.otp,
      });
    },
    onSuccess: async (response) => {
      if (response.data?.verificationToken) {
        await saveVerificationToken(response.data.verificationToken);
      }
    },
  });
};

/**
 * Resend email OTP
 */
export const useResendEmailOtp = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      onboardingApi.resendEmailOtp(data),
  });
};

/**
 * Send phone OTP
 */
export const useSendPhoneOtp = () => {
  return useMutation({
    mutationFn: (data: { phone: string; countryCode?: string }) =>
      onboardingApi.sendPhoneOtp(data),
  });
};

/**
 * Verify phone OTP
 */
export const useVerifyPhoneOtp = () => {
  return useMutation({
    mutationFn: (data: VerifyOtpRequest) => {
      return onboardingApi.verifyPhoneOtp({
        phone: data.phone!,
        otp: data.otp,
      });
    },
    onSuccess: async (response) => {
      if (response.data?.verificationToken) {
        await saveVerificationToken(response.data.verificationToken);
      }
    },
  });
};

/**
 * Resend phone OTP
 */
export const useResendPhoneOtp = () => {
  return useMutation({
    mutationFn: (data: { phone: string }) =>
      onboardingApi.resendPhoneOtp(data),
  });
};

// Hooks for Password and Authentication

/**
 * Create password
 */
export const useCreatePassword = () => {
  return useMutation({
    mutationFn: (data: CreatePasswordRequest) =>
      onboardingApi.createPassword(data),
    onSuccess: async (response) => {
      // Save tokens if provided in response
      if (response.data?.tokens) {
        if (response.data.tokens.accessToken) {
          await saveAuthToken(response.data.tokens.accessToken);
        }
        if (response.data.tokens.refreshToken) {
          await saveRefreshToken(response.data.tokens.refreshToken);
        }
      }
    },
  });
};

/**
 * Login
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginRequest) => onboardingApi.login(data),
    onSuccess: async (response) => {
      if (response.data?.tokens) {
        if (response.data.tokens.accessToken) {
          await saveAuthToken(response.data.tokens.accessToken);
        }
        if (response.data.tokens.refreshToken) {
          await saveRefreshToken(response.data.tokens.refreshToken);
        }
        // Invalidate queries to refetch user data
        queryClient.invalidateQueries({ queryKey: onboardingKeys.currentRider() });
      }
    },
  });
};

// Hooks for Registration Completion

/**
 * Complete rider registration
 */
export const useCompleteRegistration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CompleteRegistrationRequest) =>
      onboardingApi.completeRegistration(data),
    onSuccess: () => {
      // Invalidate rider profile query
      queryClient.invalidateQueries({ queryKey: onboardingKeys.currentRider() });
    },
  });
};

/**
 * Update rider schedule
 */
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateScheduleRequest) =>
      onboardingApi.updateSchedule(data),
    onSuccess: () => {
      // Invalidate rider profile query to get updated schedule
      queryClient.invalidateQueries({ queryKey: onboardingKeys.currentRider() });
    },
  });
};

/**
 * Refresh access token
 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      const response = await onboardingApi.refreshToken({ refreshToken });
      if (response.data?.tokens) {
        if (response.data.tokens.accessToken) {
          await saveAuthToken(response.data.tokens.accessToken);
        }
        if (response.data.tokens.refreshToken) {
          await saveRefreshToken(response.data.tokens.refreshToken);
        }
      }
      return response;
    },
  });
};

/**
 * Logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      return onboardingApi.logout({ refreshToken });
    },
    onSuccess: async () => {
      // Clear all tokens from storage
      await clearTokens();
      // Clear all queries
      queryClient.clear();
    },
  });
};

// Password Reset Hooks

/**
 * Send password reset OTP via phone
 */
export const useSendPasswordResetOtp = () => {
  return useMutation({
    mutationFn: (data: { phone: string }) =>
      onboardingApi.sendPasswordResetOtp(data),
  });
};

/**
 * Verify password reset OTP via phone
 */
export const useVerifyPasswordResetOtp = () => {
  return useMutation({
    mutationFn: (data: { phone: string; otp: string }) =>
      onboardingApi.verifyPasswordResetOtp(data),
  });
};

/**
 * Send password reset OTP via email
 */
export const useSendPasswordResetEmailOtp = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      onboardingApi.sendPasswordResetEmailOtp(data),
  });
};

/**
 * Verify password reset OTP via email
 */
export const useVerifyPasswordResetEmailOtp = () => {
  return useMutation({
    mutationFn: (data: { email: string; otp: string }) =>
      onboardingApi.verifyPasswordResetEmailOtp(data),
  });
};

/**
 * Update password after reset
 */
export const useUpdatePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      resetToken,
    }: {
      data: import('./types').UpdatePasswordRequest;
      resetToken: string;
    }) => onboardingApi.updatePassword(data, resetToken),
    onSuccess: async (response) => {
      if (response.data?.tokens) {
        if (response.data.tokens.accessToken) {
          await saveAuthToken(response.data.tokens.accessToken);
        }
        if (response.data.tokens.refreshToken) {
          await saveRefreshToken(response.data.tokens.refreshToken);
        }
        // Invalidate queries to refetch user data
        queryClient.invalidateQueries({
          queryKey: onboardingKeys.currentRider(),
        });
      }
    },
  });
};

/**
 * Upload profile avatar
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: { uri: string; type: string; name: string }) =>
      onboardingApi.uploadAvatar(file),
    onSuccess: () => {
      // Invalidate current rider profile to refresh avatar URL
      queryClient.invalidateQueries({
        queryKey: onboardingKeys.currentRider(),
      });
    },
  });
};
