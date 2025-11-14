/**
 * Executions API Client
 */
import apiClient from './client';
import type {
  ExecutionResponse,
  ExecutionListResponse,
  ExecutionLog,
  PaginationParams,
} from '../types/api';

export const executionsApi = {
  /**
   * List all executions with pagination and filters
   */
  list: async (
    params?: PaginationParams & {
      pipeline_id?: string;
      status?: string;
      trigger_type?: string;
    }
  ): Promise<ExecutionListResponse> => {
    return apiClient.get<ExecutionListResponse>('/api/v1/executions', {
      params,
    });
  },

  /**
   * Get execution by ID
   */
  get: async (executionId: string): Promise<ExecutionResponse> => {
    return apiClient.get<ExecutionResponse>(`/api/v1/executions/${executionId}`);
  },

  /**
   * Get execution logs
   */
  getLogs: async (executionId: string): Promise<ExecutionLog[]> => {
    const response = await apiClient.get<{ logs: ExecutionLog[] }>(
      `/api/v1/executions/${executionId}/logs`
    );
    return response.logs;
  },

  /**
   * Cancel running execution
   */
  cancel: async (executionId: string): Promise<void> => {
    await apiClient.post(`/api/v1/executions/${executionId}/cancel`);
  },

  /**
   * Retry failed execution
   */
  retry: async (executionId: string): Promise<ExecutionResponse> => {
    return apiClient.post<ExecutionResponse>(
      `/api/v1/executions/${executionId}/retry`
    );
  },

  /**
   * Get executions for a specific pipeline
   */
  getByPipeline: async (pipelineId: string, params?: PaginationParams): Promise<ExecutionListResponse> => {
    return apiClient.get<ExecutionListResponse>('/api/v1/executions', {
      params: {
        ...params,
        pipeline_id: pipelineId,
      },
    });
  },

  /**
   * Get latest execution for a pipeline
   */
  getLatest: async (pipelineId: string): Promise<ExecutionResponse | null> => {
    const response = await apiClient.get<ExecutionListResponse>('/api/v1/executions', {
      params: {
        pipeline_id: pipelineId,
        page: 1,
        page_size: 1,
        sort_by: 'created_at',
        sort_order: 'desc',
      },
    });
    return response.executions[0] || null;
  },

  /**
   * Subscribe to execution updates via WebSocket
   * Returns a function to unsubscribe
   */
  subscribeToUpdates: (
    executionId: string,
    onUpdate: (execution: ExecutionResponse) => void,
    _onLog?: (log: ExecutionLog) => void // TODO: Implement WebSocket for real-time logs
  ): (() => void) => {
    // TODO: Implement WebSocket connection
    // For now, we'll use polling
    const pollInterval = setInterval(async () => {
      try {
        const execution = await executionsApi.get(executionId);
        onUpdate(execution);

        // If execution is complete, stop polling
        if (execution.status === 'success' || execution.status === 'failed' || execution.status === 'cancelled') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Failed to poll execution:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Return unsubscribe function
    return () => {
      clearInterval(pollInterval);
    };
  },
};

export default executionsApi;
