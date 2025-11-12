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
    const response = await apiClient.post<TokenResponse>('/api/v1/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<User> => {
    const response = await apiClient.post<User>('/api/v1/auth/register', data);
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
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
    const response = await apiClient.get<User>('/api/v1/auth/me');
    return response.data;
  },
};

export default authApi;
