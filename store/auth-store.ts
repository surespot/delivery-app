import { create } from 'zustand';
import { clearTokens } from '@/src/api/onboarding/client';

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
  setAuthenticated: (value: boolean) => void;
  isOnline: boolean;
  setIsOnline: (value: boolean) => void;
  user: User | null;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
  isOnline: true,
  setIsOnline: (value: boolean) => set({ isOnline: value }),
  user: null,
  accessToken: null,
  setUser: (user: User | null) => set({ user }),
  setAccessToken: (token: string | null) => {
    set({ accessToken: token, isAuthenticated: !!token });
  },
  updateUser: (updates: Partial<User>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
  logout: () => {
    clearTokens();
    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
    });
  },
}));
