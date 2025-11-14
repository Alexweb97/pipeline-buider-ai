/**
 * Authentication Store (Zustand)
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import authApi from '../api/auth';
import type { User, LoginCredentials, RegisterData, AuthState } from '../types/auth';

// Safe localStorage wrapper that handles security errors
const safeLocalStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.warn('localStorage.getItem failed:', error);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.warn('localStorage.setItem failed:', error);
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.warn('localStorage.removeItem failed:', error);
    }
  },
};

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          // Call login API
          const tokenResponse = await authApi.login(credentials);

          // Store tokens in localStorage
          safeLocalStorage.setItem('access_token', tokenResponse.access_token);
          safeLocalStorage.setItem('refresh_token', tokenResponse.refresh_token);

          // Get user info
          const user = await authApi.getCurrentUser();

          // Update store
          set({
            user,
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.data?.detail || error.message || 'Login failed';
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          // Call register API
          const user = await authApi.register(data);

          // Automatically login after registration
          await get().login({
            username: data.username,
            password: data.password,
          });
        } catch (error: any) {
          const errorMessage =
            error.data?.detail || error.message || 'Registration failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // Call logout API
          await authApi.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API error:', error);
        } finally {
          // Clear tokens from localStorage
          safeLocalStorage.removeItem('access_token');
          safeLocalStorage.removeItem('refresh_token');
          safeLocalStorage.removeItem('user');

          // Reset store
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshUser: async () => {
        const token = safeLocalStorage.getItem('access_token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authApi.getCurrentUser();
          set({
            user,
            accessToken: token,
            refreshToken: safeLocalStorage.getItem('refresh_token'),
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          // Token is invalid, clear everything
          safeLocalStorage.removeItem('access_token');
          safeLocalStorage.removeItem('refresh_token');
          safeLocalStorage.removeItem('user');
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Failed to rehydrate auth state:', error);
        }
      },
    }
  )
);

export default useAuthStore;
