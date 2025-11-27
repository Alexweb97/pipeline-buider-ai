/**
 * Analytics Store
 * Zustand store for managing analytics state
 */
import { create } from 'zustand';
import {
  AnalyticsOverview,
  AnalyticsParams,
  getAnalyticsOverview,
} from '../api/analytics';

interface AnalyticsState {
  analytics: AnalyticsOverview | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchAnalytics: (params?: AnalyticsParams) => Promise<void>;
  clearError: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  analytics: null,
  loading: false,
  error: null,

  fetchAnalytics: async (params?: AnalyticsParams) => {
    set({ loading: true, error: null });
    try {
      const data = await getAnalyticsOverview(params);
      set({ analytics: data, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch analytics',
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
