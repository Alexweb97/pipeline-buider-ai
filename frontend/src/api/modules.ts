/**
 * Modules API Client
 */
import apiClient from './client';
import type {
  ModuleResponse,
  ModuleListResponse,
  ModuleSchemaResponse,
  ModuleType,
} from '../types/api';

export const modulesApi = {
  /**
   * List all available modules
   */
  list: async (filters?: {
    type?: ModuleType;
    category?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<ModuleListResponse> => {
    return apiClient.get<ModuleListResponse>('/api/v1/modules', {
      params: filters,
    });
  },

  /**
   * Get module by ID
   */
  get: async (moduleId: string): Promise<ModuleResponse> => {
    return apiClient.get<ModuleResponse>(`/api/v1/modules/${moduleId}`);
  },

  /**
   * Get module configuration schema
   */
  getSchema: async (moduleType: string, moduleName: string): Promise<ModuleSchemaResponse> => {
    return apiClient.get<ModuleSchemaResponse>(
      `/api/v1/modules/${moduleType}/${moduleName}/schema`
    );
  },

  /**
   * Get modules grouped by type (for ModulePalette)
   */
  getGrouped: async (): Promise<{
    extractors: ModuleResponse[];
    transformers: ModuleResponse[];
    loaders: ModuleResponse[];
  }> => {
    const response = await apiClient.get<ModuleListResponse>('/api/v1/modules', {
      params: { is_active: true },
    });

    const modules = response.modules;

    return {
      extractors: modules.filter((m) => m.type === 'extractor'),
      transformers: modules.filter((m) => m.type === 'transformer'),
      loaders: modules.filter((m) => m.type === 'loader'),
    };
  },

  /**
   * Increment module usage count
   */
  incrementUsage: async (moduleId: string): Promise<void> => {
    await apiClient.post(`/api/v1/modules/${moduleId}/increment-usage`);
  },
};

export default modulesApi;
