import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setAuth: (user: User, token: string) => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        login: async (email: string, password: string) => {
          try {
            const res = await api.post('/auth/login', { email, password });
            const { user, token } = res.data.data;
            set({ user, token, isAuthenticated: true }, false, 'login');
            return true;
          } catch {
            return false;
          }
        },

        register: async (name: string, email: string, password: string, phone?: string) => {
          try {
            const res = await api.post('/auth/register', { name, email, password, phone });
            const { user, token } = res.data.data;
            set({ user, token, isAuthenticated: true }, false, 'register');
            return true;
          } catch {
            return false;
          }
        },

        logout: () =>
          set(
            { user: null, token: null, isAuthenticated: false },
            false,
            'logout',
          ),

        setUser: (user: User | null) =>
          set(
            { user, isAuthenticated: user !== null },
            false,
            'setUser',
          ),

        setAuth: (user: User, token: string) =>
          set(
            { user, token, isAuthenticated: true },
            false,
            'setAuth',
          ),

        fetchMe: async () => {
          const { token } = get();
          if (!token) return;
          try {
            const res = await api.get('/auth/me');
            set({ user: res.data.data, isAuthenticated: true }, false, 'fetchMe');
          } catch {
            set({ user: null, token: null, isAuthenticated: false }, false, 'fetchMe-fail');
          }
        },
      }),
      {
        name: 'vladi-token',
        partialize: (state) => ({ token: state.token }),
      },
    ),
    { name: 'AuthStore' },
  ),
);
