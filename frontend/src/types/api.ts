/**
 * API Response Types - Backend model mappings
 */

// Pipeline Types
export interface PipelineResponse {
  id: string;
  created_by: string;
  name: string;
  description?: string;
  version: string;
  config: PipelineConfig;
  schedule?: string;
  is_scheduled: boolean;
  status: PipelineStatus;
  tags: string[];
  default_params: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PipelineConfig {
  nodes: any[];
  edges: any[];
}

export type PipelineStatus = 'draft' | 'active' | 'inactive' | 'archived';

export interface PipelineListResponse {
  pipelines: PipelineResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreatePipelineRequest {
  name: string;
  description?: string;
  config: PipelineConfig;
  tags?: string[];
  default_params?: Record<string, any>;
}

export interface UpdatePipelineRequest {
  name?: string;
  description?: string;
  config?: PipelineConfig;
  schedule?: string;
  is_scheduled?: boolean;
  status?: PipelineStatus;
  tags?: string[];
  default_params?: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: string;
  message: string;
  node_id?: string;
  edge_id?: string;
}

export interface ValidationWarning {
  type: string;
  message: string;
  node_id?: string;
}

// Module Types
export interface ModuleResponse {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  type: ModuleType;
  category: string;
  version: string;
  python_class: string;
  config_schema: Record<string, any>;
  input_schema?: Record<string, any>;
  output_schema?: Record<string, any>;
  required_connections: string[];
  tags: string[];
  is_active: boolean;
  usage_count: number;
  icon?: string;
  documentation_url?: string;
  created_at: string;
  updated_at: string;
}

export type ModuleType = 'extractor' | 'transformer' | 'loader';

export interface ModuleListResponse {
  modules: ModuleResponse[];
  total: number;
}

export interface ModuleSchemaResponse {
  schema: Record<string, any>;
  defaults: Record<string, any>;
}

// Execution Types
export interface ExecutionResponse {
  id: string;
  pipeline_id: string;
  triggered_by?: string;
  status: ExecutionStatus;
  trigger_type: TriggerType;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  params: Record<string, any>;
  result?: Record<string, any>;
  error_message?: string;
  error_trace?: string;
  logs: ExecutionLog[];
  metrics: ExecutionMetrics;
  airflow_dag_run_id?: string;
  created_at: string;
}

export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
export type TriggerType = 'manual' | 'scheduled' | 'webhook';

export interface ExecutionLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  module?: string;
  node_id?: string;
}

export interface ExecutionMetrics {
  rows_processed?: number;
  data_size_bytes?: number;
  execution_time_ms?: number;
  memory_usage_mb?: number;
  [key: string]: any;
}

export interface ExecutionListResponse {
  executions: ExecutionResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface ExecuteRequestResponse {
  execution_id: string;
  pipeline_id: string;
  status: ExecutionStatus;
  message: string;
}

// Common API Types
export interface ApiError {
  detail: string;
  status_code: number;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  loading: boolean;
}
