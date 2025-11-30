import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginRequest, RegisterRequest } from '../types/auth';
import { authApi } from '../utils/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  hydrate: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      // Actions
      login: async (data: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(data);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          const error = err as Error & { response?: { data?: { error?: string } } };
          set({
            isLoading: false,
            error: error.response?.data?.error || 'Login failed',
          });
          throw err;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          const error = err as Error & { response?: { data?: { error?: string } } };
          set({
            isLoading: false,
            error: error.response?.data?.error || 'Registration failed',
          });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      logoutAll: async () => {
        try {
          await authApi.logoutAll();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      clearError: () => set({ error: null }),

      hydrate: () => {
        const state = get();
        if (state.user) {
          set({ isAuthenticated: true, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.hydrate();
      },
    }
  )
);
