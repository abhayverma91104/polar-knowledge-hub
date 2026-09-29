'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'public' | 'researcher' | 'editor' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login(email, password);
          const { access_token, user } = res.data;
          localStorage.setItem('polar_token', access_token);
          set({ user, token: access_token, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('polar_token');
        localStorage.removeItem('polar_user');
        set({ user: null, token: null });
      },

      setUser: (user, token) => {
        localStorage.setItem('polar_token', token);
        set({ user, token });
      },
    }),
    {
      name: 'polar-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
