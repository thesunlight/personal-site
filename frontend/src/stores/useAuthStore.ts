import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminVO } from '../types';

interface AuthState {
  token: string | null;
  admin: AdminVO | null;
  setAuth: (token: string, admin: AdminVO) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      admin: null,
      setAuth: (token, admin) => set({ token, admin }),
      logout: () => set({ token: null, admin: null }),
      isAuthenticated: () => !!get().token,
    }),
    { name: 'auth-storage' }
  )
);
