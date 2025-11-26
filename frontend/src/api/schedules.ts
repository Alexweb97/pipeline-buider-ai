/**
 * Schedules API Client
 */
import { apiClient } from './client';
import type {
  Schedule,
  ScheduleCreateData,
  ScheduleUpdateData,
  ScheduleStats,
  ScheduleStatus,
} from '../types/schedule';

interface ScheduleListParams {
  page?: number;
  page_size?: number;
  status?: ScheduleStatus;
  pipeline_id?: string;
  search?: string;
}

interface ScheduleListResponse {
  schedules: Schedule[];
  total: number;
  page: number;
  page_size: number;
}

interface TriggerResponse {
  schedule_id: string;
  pipeline_id: string;
  celery_task_id: string;
  status: string;
  message: string;
}

interface SyncAirflowResponse {
  schedule_id: string;
  dag_id: string;
  dag_file: string;
  message: string;
}

export const schedulesApi = {
  /**
   * List all schedules with pagination and filters
   */
  list: async (params?: ScheduleListParams): Promise<ScheduleListResponse> => {
    return apiClient.get<ScheduleListResponse>('/api/v1/schedules', { params });
  },

  /**
   * Get schedule by ID
   */
  get: async (id: string): Promise<Schedule> => {
    return apiClient.get<Schedule>(`/api/v1/schedules/${id}`);
  },

  /**
   * Create a new schedule
   */
  create: async (data: ScheduleCreateData): Promise<Schedule> => {
    return apiClient.post<Schedule>('/api/v1/schedules', data);
  },

  /**
   * Update a schedule
   */
  update: async (id: string, data: ScheduleUpdateData): Promise<Schedule> => {
    return apiClient.put<Schedule>(`/api/v1/schedules/${id}`, data);
  },

  /**
   * Delete a schedule
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/api/v1/schedules/${id}`);
  },

  /**
   * Toggle schedule status (active/paused)
   */
  toggleStatus: async (id: string, status: ScheduleStatus): Promise<{ status: string; message: string }> => {
    return apiClient.patch(`/api/v1/schedules/${id}/status`, { status });
  },

  /**
   * Get schedule statistics
   */
  getStats: async (): Promise<ScheduleStats> => {
    return apiClient.get<ScheduleStats>('/api/v1/schedules/stats');
  },

  /**
   * Manually trigger a schedule execution
   */
  trigger: async (id: string): Promise<TriggerResponse> => {
    return apiClient.post<TriggerResponse>(`/api/v1/schedules/${id}/trigger`);
  },

  /**
   * Sync schedule to Airflow DAG
   */
  syncAirflow: async (id: string): Promise<SyncAirflowResponse> => {
    return apiClient.post<SyncAirflowResponse>(`/api/v1/schedules/${id}/sync-airflow`);
  },
};

export default schedulesApi;
