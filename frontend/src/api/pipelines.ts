/**
 * Pipelines API Client
 */
import apiClient from './client';
import type {
  PipelineResponse,
  PipelineListResponse,
  CreatePipelineRequest,
  UpdatePipelineRequest,
  ValidationResult,
  ExecuteRequestResponse,
  PaginationParams,
} from '../types/api';

export const pipelinesApi = {
  /**
   * List all pipelines with pagination
   */
  list: async (params?: PaginationParams): Promise<PipelineListResponse> => {
    return apiClient.get<PipelineListResponse>('/api/v1/pipelines', {
      params,
    });
  },

  /**
   * Get pipeline by ID
   */
  get: async (pipelineId: string): Promise<PipelineResponse> => {
    return apiClient.get<PipelineResponse>(`/api/v1/pipelines/${pipelineId}`);
  },

  /**
   * Create a new pipeline
   */
  create: async (data: CreatePipelineRequest): Promise<PipelineResponse> => {
    return apiClient.post<PipelineResponse>('/api/v1/pipelines', data);
  },

  /**
   * Update existing pipeline
   */
  update: async (pipelineId: string, data: UpdatePipelineRequest): Promise<PipelineResponse> => {
    return apiClient.put<PipelineResponse>(
      `/api/v1/pipelines/${pipelineId}`,
      data
    );
  },

  /**
   * Delete pipeline
   */
  delete: async (pipelineId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/pipelines/${pipelineId}`);
  },

  /**
   * Execute pipeline
   */
  execute: async (pipelineId: string, params?: Record<string, any>): Promise<ExecuteRequestResponse> => {
    return apiClient.post<ExecuteRequestResponse>(
      `/api/v1/pipelines/${pipelineId}/execute`,
      { params }
    );
  },

  /**
   * Validate pipeline configuration
   */
  validate: async (pipelineId: string): Promise<ValidationResult> => {
    return apiClient.post<ValidationResult>(
      `/api/v1/pipelines/${pipelineId}/validate`
    );
  },

  /**
   * Validate pipeline configuration before saving (without ID)
   */
  validateConfig: async (config: CreatePipelineRequest): Promise<ValidationResult> => {
    return apiClient.post<ValidationResult>(
      '/api/v1/pipelines/validate-config',
      config
    );
  },
};

export default pipelinesApi;
