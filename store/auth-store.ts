import { create } from 'zustand';

export interface User {
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
  user: User;
  updateUser: (updates: Partial<User>) => void;
}

// Mock user data for development
const mockUser: User = {
  firstName: 'Ayo',
  lastName: 'Adedeji',
  phone: '+2347042568913',
  email: 'aade*****72@gmail.com',
  avatar: null,
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
  isOnline: true,
  setIsOnline: (value: boolean) => set({ isOnline: value }),
  user: mockUser,
  updateUser: (updates: Partial<User>) =>
    set((state) => ({
      user: { ...state.user, ...updates },
    })),
}));
