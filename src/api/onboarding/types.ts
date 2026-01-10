// API Response Types

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Rider Profile Types
export interface RiderStatsToday {
  completedOrders: number;
  earnings: number;
  earningsFormatted: string;
  distanceCoveredKm: number;
  distanceCoveredFormatted: string;
  timeOnlineMinutes: number;
  timeOnlineFormatted: string;
}

export interface RiderStats {
  today: RiderStatsToday;
}

export interface RiderProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  nin: string;
  regionId?: string;
  schedule?: number[];
  rating?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  stats?: RiderStats;
}

export interface MaskedRiderProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string; // Masked
  phone: string; // Masked
  dateOfBirth: string;
  address: string;
  nin: string; // Masked
  regionId?: string;
}

// Registration Types
export interface InitiateRegistrationRequest {
  registrationCode: string;
  firstName: string;
  lastName: string;
}

export interface InitiateRegistrationResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  nin: string;
  regionId?: string;
  schedule?: number[];
}

// OTP Types
export interface SendOtpRequest {
  email?: string;
  phone?: string;
  countryCode?: string;
}

export interface SendOtpResponse {
  expiresIn: number;
  retryAfter: number;
}

export interface VerifyOtpRequest {
  email?: string;
  phone?: string;
  otp: string;
}

export interface VerifyOtpResponse {
  verificationToken: string;
  expiresIn: number;
}

// Password Types
export interface CreatePasswordRequest {
  password: string;
  confirmPassword: string;
}

export interface CreatePasswordResponse {
  userId: string;
  requiresProfileCompletion: boolean;
  tokens?: Tokens;
}

// Login Types
export interface LoginRequest {
  identifier: string; // email or phone
  password: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  tokens: Tokens;
}

// Complete Registration Types
export interface CompleteRegistrationRequest {
  registrationCode: string;
  schedule: number[];
}

export interface CompleteRegistrationResponse {
  profileId: string;
  userId: string;
  status: string;
  schedule: number[];
}

// Schedule Types
export interface UpdateScheduleRequest {
  schedule: number[];
}

export interface UpdateScheduleResponse {
  schedule: number[];
}

// Refresh Token Types
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  tokens: Tokens;
}

// Logout Types
export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// Error Codes
export enum ErrorCode {
  INVALID_REGISTRATION_CODE = 'INVALID_REGISTRATION_CODE',
  RIDER_PROFILE_NOT_FOUND = 'RIDER_PROFILE_NOT_FOUND',
  RIDER_ALREADY_REGISTERED = 'RIDER_ALREADY_REGISTERED',
  NAME_MISMATCH = 'NAME_MISMATCH',
  EMAIL_ALREADY_REGISTERED = 'EMAIL_ALREADY_REGISTERED',
  PHONE_ALREADY_REGISTERED = 'PHONE_ALREADY_REGISTERED',
  OTP_RATE_LIMITED = 'OTP_RATE_LIMITED',
  INVALID_OTP = 'INVALID_OTP',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_SCHEDULE = 'INVALID_SCHEDULE',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',
}
