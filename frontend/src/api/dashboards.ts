/**
 * Dashboard API Client
 * Handles all dashboard-related API calls
 */
import api from './config';

export interface Dashboard {
  id: string;
  pipeline_id: string;
  name: string;
  description?: string;
  config: Record<string, any>;
  theme: 'light' | 'dark';
  layout: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardShare {
  id: string;
  dashboard_id: string;
  user_id: string;
  permission: 'view' | 'edit';
  created_at: string;
}

export interface DashboardWithShares extends Dashboard {
  shares: DashboardShare[];
}

export interface DashboardCreate {
  pipeline_id: string;
  name: string;
  description?: string;
  config?: Record<string, any>;
  layout?: Record<string, any>;
  theme?: 'light' | 'dark';
}

export interface DashboardUpdate {
  name?: string;
  description?: string;
  config?: Record<string, any>;
  layout?: Record<string, any>;
  theme?: 'light' | 'dark';
}

export interface DashboardListResponse {
  dashboards: Dashboard[];
  total: number;
}

export interface DashboardDataResponse {
  dashboard_id: string;
  pipeline_id: string;
  execution_id: string | null;
  data: any[];
  metadata: {
    rows: number;
    columns: number;
    last_updated: string | null;
    execution_time?: number;
  };
  message?: string;
}

/**
 * Get all dashboards
 */
export const getDashboards = async (params?: {
  skip?: number;
  limit?: number;
  pipeline_id?: string;
}): Promise<DashboardListResponse> => {
  const response = await api.get('/dashboards', { params });
  return response.data;
};

/**
 * Get a specific dashboard
 */
export const getDashboard = async (dashboardId: string): Promise<DashboardWithShares> => {
  const response = await api.get(`/dashboards/${dashboardId}`);
  return response.data;
};

/**
 * Create a new dashboard
 */
export const createDashboard = async (data: DashboardCreate): Promise<Dashboard> => {
  const response = await api.post('/dashboards', data);
  return response.data;
};

/**
 * Update a dashboard
 */
export const updateDashboard = async (
  dashboardId: string,
  data: DashboardUpdate
): Promise<Dashboard> => {
  const response = await api.put(`/dashboards/${dashboardId}`, data);
  return response.data;
};

/**
 * Delete a dashboard
 */
export const deleteDashboard = async (dashboardId: string): Promise<void> => {
  await api.delete(`/dashboards/${dashboardId}`);
};

/**
 * Share a dashboard with a user
 */
export const shareDashboard = async (
  dashboardId: string,
  data: { user_id: string; permission: 'view' | 'edit' }
): Promise<DashboardShare> => {
  const response = await api.post(`/dashboards/${dashboardId}/shares`, data);
  return response.data;
};

/**
 * Remove dashboard share
 */
export const removeDashboardShare = async (
  dashboardId: string,
  shareId: string
): Promise<void> => {
  await api.delete(`/dashboards/${dashboardId}/shares/${shareId}`);
};

/**
 * Get dashboard data from latest pipeline execution
 */
export const getDashboardData = async (
  dashboardId: string
): Promise<DashboardDataResponse> => {
  const response = await api.get(`/dashboards/${dashboardId}/data`);
  return response.data;
};
