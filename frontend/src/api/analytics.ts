/**
 * Analytics API Client
 * Handles requests to the analytics endpoints
 */
import { api } from './client';

// Types
export interface ExecutionTrend {
  date: string;
  total: number;
  success: number;
  failed: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface PipelinePerformance {
  pipeline_id: string;
  pipeline_name: string;
  execution_count: number;
  avg_duration_seconds: number;
  success_rate: number;
}

export interface AnalyticsOverview {
  // KPIs
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  running_executions: number;
  success_rate: number;
  avg_duration_seconds: number;

  // Trends and distributions
  execution_trends: ExecutionTrend[];
  status_distribution: StatusDistribution[];
  pipeline_performance: PipelinePerformance[];

  // Metadata
  period_days: number;
}

export interface AnalyticsParams {
  days?: number;
  pipeline_id?: string;
}

// API Functions
export const getAnalyticsOverview = async (
  params?: AnalyticsParams
): Promise<AnalyticsOverview> => {
  return api.get<AnalyticsOverview>('/api/v1/analytics/overview', { params });
};
