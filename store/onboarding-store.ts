import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  InitiateRegistrationResponse,
  RiderProfile,
} from '@/src/api/onboarding/types';

export type OnboardingStep = 'confirm' | 'email' | 'phone' | 'password' | 'schedule';

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

  // Current signup step (persisted so app can resume after being killed)
  currentStep: OnboardingStep | null;

  // Actions
  setRegistrationCode: (code: string) => void;
  setRiderProfile: (profile: InitiateRegistrationResponse | null) => void;
  setEmailVerificationToken: (token: string | null) => void;
  setPhoneVerificationToken: (token: string | null) => void;
  setUserId: (id: string | null) => void;
  setSelectedSchedule: (schedule: 'full-time' | 'part-time-weekdays' | 'part-time-weekends' | 'custom') => void;
  setScheduleDays: (days: number[]) => void;
  setCurrentStep: (step: OnboardingStep | null) => void;
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

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      registrationCode: null,
      riderProfile: null,
      emailVerificationToken: null,
      phoneVerificationToken: null,
      userId: null,
      selectedSchedule: 'full-time',
      scheduleDays: [1, 2, 3, 4, 5, 6],
      currentStep: null,

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

      setCurrentStep: (step) => set({ currentStep: step }),

      reset: () =>
        set({
          registrationCode: null,
          riderProfile: null,
          emailVerificationToken: null,
          phoneVerificationToken: null,
          userId: null,
          selectedSchedule: 'full-time',
          scheduleDays: [1, 2, 3, 4, 5, 6],
          currentStep: null,
        }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
