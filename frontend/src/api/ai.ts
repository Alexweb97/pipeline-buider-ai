/**
 * AI API Client
 */
import apiClient from './client';

export interface AIGenerateRequest {
  prompt: string;
}

export interface AIImproveRequest {
  current_config: any;
  improvement_request: string;
}

export interface AIExplainRequest {
  config: any;
}

export interface PipelineConfig {
  name: string;
  description: string;
  type: 'etl' | 'elt' | 'streaming';
  nodes: any[];
  edges: any[];
}

export interface AIExplainResponse {
  explanation: string;
}

const aiApi = {
  /**
   * Generate a pipeline from natural language description
   */
  generatePipeline: async (prompt: string): Promise<PipelineConfig> => {
    return apiClient.post<PipelineConfig>('/api/v1/ai/generate', { prompt });
  },

  /**
   * Improve an existing pipeline
   */
  improvePipeline: async (currentConfig: any, improvementRequest: string): Promise<PipelineConfig> => {
    return apiClient.post<PipelineConfig>('/api/v1/ai/improve', {
      current_config: currentConfig,
      improvement_request: improvementRequest,
    });
  },

  /**
   * Get explanation of a pipeline
   */
  explainPipeline: async (config: any): Promise<AIExplainResponse> => {
    return apiClient.post<AIExplainResponse>('/api/v1/ai/explain', { config });
  },
};

export default aiApi;
