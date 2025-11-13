/**
 * Pipeline Types
 */

export type PipelineStatus = 'draft' | 'active' | 'paused' | 'failed' | 'completed';

export type PipelineType = 'etl' | 'elt' | 'streaming';

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  type: PipelineType;
  status: PipelineStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  last_run_at?: string;
  next_run_at?: string;
  total_runs: number;
  success_rate: number;
  source_count: number;
  transformation_count: number;
}

export interface PipelineCreateData {
  name: string;
  description: string;
  type: PipelineType;
}

export interface PipelineUpdateData {
  name?: string;
  description?: string;
  status?: PipelineStatus;
}

export interface PipelineRun {
  id: string;
  pipeline_id: string;
  status: 'running' | 'success' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  duration?: number;
  records_processed: number;
  error_message?: string;
}
