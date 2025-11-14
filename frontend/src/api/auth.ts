/**
 * Authentication API Client
 */
import apiClient from './client';
import type { LoginCredentials, RegisterData, TokenResponse, User } from '../types/auth';

export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    return apiClient.post<TokenResponse>('/api/v1/auth/login', credentials);
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<User> => {
    return apiClient.post<User>('/api/v1/auth/register', data);
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    return apiClient.post<TokenResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout');
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>('/api/v1/auth/me');
  },
};

export default authApi;
