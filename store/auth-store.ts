import { notificationsApi } from '@/src/api/notifications/client';
import {
  clearTokens,
  getAuthToken,
  getRefreshToken,
  getSavedPushToken,
  onboardingApi,
  saveAuthToken,
  savePushToken,
  saveRefreshToken,
} from '@/src/api/onboarding/client';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const USER_KEY = 'surespot_rider_user';

async function storeUser(user: User | null) {
  try {
    if (user === null) {
      await SecureStore.deleteItemAsync(USER_KEY);
    } else {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    }
  } catch {
    // Silently fail
  }
}

async function loadUser(): Promise<User | null> {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  avatar: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthenticated: (value: boolean) => void;
  isOnline: boolean;
  setIsOnline: (value: boolean) => void;
  isDemoMode: boolean;
  setDemoMode: (value: boolean) => void;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expoPushToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setPushToken: (token: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  isOnline: false,
  isDemoMode: false,

  user: null,
  accessToken: null,
  refreshToken: null,
  expoPushToken: null,

  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setIsOnline: (value) => set({ isOnline: value }),
  setDemoMode: (value) => set({ isDemoMode: value }),

  setUser: (user) => {
    set({ user });
    storeUser(user);
  },

  setAccessToken: (token) => {
    set({ accessToken: token, isAuthenticated: !!token });
    if (token) {
      saveAuthToken(token);
    }
  },

  setPushToken: (token) => {
    set({ expoPushToken: token });
    if (token) {
      savePushToken(token);
    }
  },

  updateUser: (updates) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };
    set({ user: updated });
    storeUser(updated);
  },

  logout: async () => {
    const { expoPushToken } = get();

    if (expoPushToken) {
      try {
        await notificationsApi.removePushToken(expoPushToken);
      } catch {
        // Best-effort — don't block logout
      }
    }

    await clearTokens();
    await storeUser(null);

    set({
      isAuthenticated: false,
      isDemoMode: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      expoPushToken: null,
    });
  },

  initialize: async () => {
    try {
      const [accessToken, refreshToken, user, pushToken] = await Promise.all([
        getAuthToken(),
        getRefreshToken(),
        loadUser(),
        getSavedPushToken(),
      ]);

      set({
        accessToken,
        refreshToken,
        user,
        expoPushToken: pushToken,
        isAuthenticated: !!(accessToken && user),
      });

      if (accessToken && user) {
        try {
          const response = await onboardingApi.getCurrentRiderProfile();
          const profile = response?.data;
          if (profile) {
            const refreshed: User = {
              id: profile.userId,
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: profile.email,
              phone: profile.phone,
              avatar: profile.avatar ?? null,
            };
            set({ user: refreshed });
            storeUser(refreshed);
          }
        } catch {
          // Use cached user if API refresh fails
        }
      }

      if (refreshToken && !accessToken) {
        try {
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'}/auth/refresh`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            }
          );
          const data = await response.json();
          if (response.ok && data.data?.tokens) {
            await saveAuthToken(data.data.tokens.accessToken);
            await saveRefreshToken(data.data.tokens.refreshToken);
            set({
              accessToken: data.data.tokens.accessToken,
              refreshToken: data.data.tokens.refreshToken,
              isAuthenticated: true,
            });
          }
        } catch {
          // Silent — expired refresh token means re-login required
        }
      }
    } catch {
      // Initialize to unauthenticated state on any error
      set({ isAuthenticated: false, user: null, accessToken: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));
