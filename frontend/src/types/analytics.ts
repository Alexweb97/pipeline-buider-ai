/**
 * Analytics Types
 */

export type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all';

export type MetricType =
  | 'pipeline_runs'
  | 'success_rate'
  | 'data_volume'
  | 'execution_time'
  | 'error_count';

export interface Analytics {
  overview: OverviewMetrics;
  pipeline_performance: PipelinePerformance[];
  execution_trends: ExecutionTrend[];
  error_analysis: ErrorAnalysis;
  data_flow: DataFlowMetrics;
  resource_usage: ResourceUsage;
}

export interface OverviewMetrics {
  total_pipelines: number;
  total_runs: number;
  total_runs_change: number; // percentage change
  successful_runs: number;
  failed_runs: number;
  success_rate: number;
  success_rate_change: number;
  avg_execution_time: number; // seconds
  avg_execution_time_change: number;
  total_data_processed: number; // bytes
  total_data_processed_change: number;
  active_schedules: number;
  data_sources_connected: number;
}

export interface PipelinePerformance {
  pipeline_id: string;
  pipeline_name: string;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  success_rate: number;
  avg_execution_time: number;
  total_data_processed: number;
  last_run_at: string;
  status: 'healthy' | 'warning' | 'critical';
}

export interface ExecutionTrend {
  timestamp: string;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  avg_execution_time: number;
  data_processed: number;
}

export interface ErrorAnalysis {
  total_errors: number;
  error_rate: number;
  errors_by_type: ErrorByType[];
  errors_by_pipeline: ErrorByPipeline[];
  recent_errors: RecentError[];
}

export interface ErrorByType {
  error_type: string;
  count: number;
  percentage: number;
}

export interface ErrorByPipeline {
  pipeline_id: string;
  pipeline_name: string;
  error_count: number;
  last_error_at: string;
}

export interface RecentError {
  id: string;
  pipeline_id: string;
  pipeline_name: string;
  error_type: string;
  error_message: string;
  occurred_at: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DataFlowMetrics {
  total_sources: number;
  total_destinations: number;
  data_ingested: number;
  data_transformed: number;
  data_loaded: number;
  flows_by_source: DataFlowBySource[];
}

export interface DataFlowBySource {
  source_name: string;
  source_type: string;
  records_processed: number;
  data_volume: number;
  pipelines_count: number;
}

export interface ResourceUsage {
  cpu_usage: number;
  memory_usage: number;
  storage_used: number;
  storage_total: number;
  network_in: number;
  network_out: number;
  peak_hours: PeakHour[];
}

export interface PeakHour {
  hour: number;
  runs: number;
  avg_duration: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  category?: string;
}
