/**
 * Dashboard API Client
 * Handles all dashboard-related API calls
 */
import api from './client';

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
  return api.get<DashboardListResponse>('/api/v1/dashboards', { params });
};

/**
 * Get a specific dashboard
 */
export const getDashboard = async (dashboardId: string): Promise<DashboardWithShares> => {
  return api.get<DashboardWithShares>(`/api/v1/dashboards/${dashboardId}`);
};

/**
 * Create a new dashboard
 */
export const createDashboard = async (data: DashboardCreate): Promise<Dashboard> => {
  return api.post<Dashboard>('/api/v1/dashboards', data);
};

/**
 * Update a dashboard
 */
export const updateDashboard = async (
  dashboardId: string,
  data: DashboardUpdate
): Promise<Dashboard> => {
  return api.put<Dashboard>(`/api/v1/dashboards/${dashboardId}`, data);
};

/**
 * Delete a dashboard
 */
export const deleteDashboard = async (dashboardId: string): Promise<void> => {
  await api.delete(`/api/v1/dashboards/${dashboardId}`);
};

/**
 * Share a dashboard with a user
 */
export const shareDashboard = async (
  dashboardId: string,
  data: { user_id: string; permission: 'view' | 'edit' }
): Promise<DashboardShare> => {
  return api.post<DashboardShare>(`/api/v1/dashboards/${dashboardId}/shares`, data);
};

/**
 * Remove dashboard share
 */
export const removeDashboardShare = async (
  dashboardId: string,
  shareId: string
): Promise<void> => {
  await api.delete(`/api/v1/dashboards/${dashboardId}/shares/${shareId}`);
};

/**
 * Get dashboard data from latest pipeline execution
 */
export const getDashboardData = async (
  dashboardId: string
): Promise<DashboardDataResponse> => {
  return api.get<DashboardDataResponse>(`/api/v1/dashboards/${dashboardId}/data`);
};
