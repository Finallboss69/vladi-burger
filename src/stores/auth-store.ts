import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@/types';
import { mockUser } from '@/lib/mock-data';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        login: (_email: string, _password: string) =>
          set(
            {
              user: mockUser,
              token: 'mock-jwt-token-vladi-burger',
              isAuthenticated: true,
            },
            false,
            'login',
          ),

        logout: () =>
          set(
            {
              user: null,
              token: null,
              isAuthenticated: false,
            },
            false,
            'logout',
          ),

        setUser: (user: User | null) =>
          set(
            { user, isAuthenticated: user !== null },
            false,
            'setUser',
          ),
      }),
      {
        name: 'vladi-token',
        partialize: (state) => ({ token: state.token }),
      },
    ),
    { name: 'AuthStore' },
  ),
);
