import { create } from 'zustand';
import type {
  InitiateRegistrationResponse,
  RiderProfile,
} from '@/src/api/onboarding/types';

interface OnboardingState {
  // Registration data
  registrationCode: string | null;
  riderProfile: InitiateRegistrationResponse | null;
  
  // Verification tokens
  emailVerificationToken: string | null;
  phoneVerificationToken: string | null;
  
  // User ID after password creation
  userId: string | null;
  
  // Schedule selection
  selectedSchedule: 'full-time' | 'part-time-weekdays' | 'part-time-weekends' | 'custom';
  scheduleDays: number[];
  
  // Actions
  setRegistrationCode: (code: string) => void;
  setRiderProfile: (profile: InitiateRegistrationResponse | null) => void;
  setEmailVerificationToken: (token: string | null) => void;
  setPhoneVerificationToken: (token: string | null) => void;
  setUserId: (id: string | null) => void;
  setSelectedSchedule: (schedule: 'full-time' | 'part-time-weekdays' | 'part-time-weekends' | 'custom') => void;
  setScheduleDays: (days: number[]) => void;
  reset: () => void;
}

// Helper function to get days for schedule type
const getDaysForScheduleType = (
  type: 'full-time' | 'part-time-weekdays' | 'part-time-weekends' | 'custom'
): number[] => {
  switch (type) {
    case 'full-time':
      return [1, 2, 3, 4, 5, 6]; // Mon-Sat
    case 'part-time-weekdays':
      return [1, 2, 3, 4, 5]; // Mon-Fri
    case 'part-time-weekends':
      return [6, 0]; // Sat-Sun
    case 'custom':
      return [];
    default:
      return [];
  }
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  registrationCode: null,
  riderProfile: null,
  emailVerificationToken: null,
  phoneVerificationToken: null,
  userId: null,
  selectedSchedule: 'full-time',
  scheduleDays: [1, 2, 3, 4, 5, 6],
  
  setRegistrationCode: (code) => set({ registrationCode: code }),
  
  setRiderProfile: (profile) => set({ riderProfile: profile }),
  
  setEmailVerificationToken: (token) => set({ emailVerificationToken: token }),
  
  setPhoneVerificationToken: (token) => set({ phoneVerificationToken: token }),
  
  setUserId: (id) => set({ userId: id }),
  
  setSelectedSchedule: (schedule) =>
    set({
      selectedSchedule: schedule,
      scheduleDays: getDaysForScheduleType(schedule),
    }),
  
  setScheduleDays: (days) => set({ scheduleDays: days }),
  
  reset: () =>
    set({
      registrationCode: null,
      riderProfile: null,
      emailVerificationToken: null,
      phoneVerificationToken: null,
      userId: null,
      selectedSchedule: 'full-time',
      scheduleDays: [1, 2, 3, 4, 5, 6],
    }),
}));
