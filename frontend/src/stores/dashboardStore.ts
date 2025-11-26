/**
 * Dashboard Store
 * Zustand store for managing dashboard state
 */
import { create } from 'zustand';
import {
  Dashboard,
  DashboardWithShares,
  DashboardCreate,
  DashboardUpdate,
  getDashboards,
  getDashboard,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  getDashboardData,
  DashboardDataResponse,
} from '../api/dashboards';

interface DashboardState {
  dashboards: Dashboard[];
  currentDashboard: DashboardWithShares | null;
  dashboardData: DashboardDataResponse | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchDashboards: (pipelineId?: string) => Promise<void>;
  fetchDashboard: (dashboardId: string) => Promise<void>;
  fetchDashboardData: (dashboardId: string) => Promise<void>;
  createDashboard: (data: DashboardCreate) => Promise<Dashboard>;
  updateDashboard: (dashboardId: string, data: DashboardUpdate) => Promise<void>;
  deleteDashboard: (dashboardId: string) => Promise<void>;
  clearError: () => void;
  clearCurrentDashboard: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dashboards: [],
  currentDashboard: null,
  dashboardData: null,
  loading: false,
  error: null,

  fetchDashboards: async (pipelineId?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getDashboards({
        pipeline_id: pipelineId,
        limit: 100,
      });
      set({ dashboards: response.dashboards, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch dashboards',
        loading: false,
      });
    }
  },

  fetchDashboard: async (dashboardId: string) => {
    set({ loading: true, error: null });
    try {
      const dashboard = await getDashboard(dashboardId);
      set({ currentDashboard: dashboard, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch dashboard',
        loading: false,
      });
    }
  },

  fetchDashboardData: async (dashboardId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await getDashboardData(dashboardId);
      // Transform the response data into chart data map
      // For now, all charts get the same data since backend returns one dataset
      // TODO: Enhance backend to return data per chart
      const chartDataMap: Record<string, any[]> = {};
      if (response.data) {
        // Get current dashboard config to know which charts exist
        const state = useDashboardStore.getState();
        const charts = state.currentDashboard?.config?.charts || [];
        charts.forEach((chart: any) => {
          chartDataMap[chart.id] = response.data || [];
        });
      }
      set({ dashboardData: chartDataMap as any, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch dashboard data',
        loading: false,
      });
    }
  },

  createDashboard: async (data: DashboardCreate) => {
    set({ loading: true, error: null });
    try {
      const newDashboard = await createDashboard(data);
      set((state) => ({
        dashboards: [...state.dashboards, newDashboard],
        loading: false,
      }));
      return newDashboard;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to create dashboard',
        loading: false,
      });
      throw error;
    }
  },

  updateDashboard: async (dashboardId: string, data: DashboardUpdate) => {
    set({ loading: true, error: null });
    try {
      const updatedDashboard = await updateDashboard(dashboardId, data);
      set((state) => ({
        dashboards: state.dashboards.map((d) =>
          d.id === dashboardId ? updatedDashboard : d
        ),
        currentDashboard:
          state.currentDashboard?.id === dashboardId
            ? { ...state.currentDashboard, ...updatedDashboard }
            : state.currentDashboard,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to update dashboard',
        loading: false,
      });
      throw error;
    }
  },

  deleteDashboard: async (dashboardId: string) => {
    set({ loading: true, error: null });
    try {
      await deleteDashboard(dashboardId);
      set((state) => ({
        dashboards: state.dashboards.filter((d) => d.id !== dashboardId),
        currentDashboard:
          state.currentDashboard?.id === dashboardId ? null : state.currentDashboard,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to delete dashboard',
        loading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  clearCurrentDashboard: () => set({ currentDashboard: null, dashboardData: null }),
}));
