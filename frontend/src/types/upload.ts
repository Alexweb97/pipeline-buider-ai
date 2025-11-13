/**
 * Upload Types
 */

export type UploadStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type FileType =
  | 'csv'
  | 'json'
  | 'xlsx'
  | 'xml'
  | 'parquet'
  | 'txt'
  | 'other';

export interface Upload {
  id: string;
  file_name: string;
  file_type: FileType;
  file_size: number;
  status: UploadStatus;
  created_at: string;
  updated_at: string;
  uploaded_by: string;
  progress: number; // 0-100
  destination?: string;
  pipeline_id?: string;
  pipeline_name?: string;
  rows_processed?: number;
  errors_count?: number;
  error_message?: string;
  processing_time?: number; // seconds
  metadata?: UploadMetadata;
}

export interface UploadMetadata {
  mime_type: string;
  encoding?: string;
  delimiter?: string; // for CSV
  sheet_name?: string; // for Excel
  compression?: string;
  columns_count?: number;
  estimated_rows?: number;
  file_hash?: string;
}

export interface UploadCreateData {
  file: File;
  destination?: string;
  pipeline_id?: string;
  auto_process?: boolean;
  metadata?: Partial<UploadMetadata>;
}

export interface UploadStats {
  total_uploads: number;
  total_size: number; // bytes
  successful_uploads: number;
  failed_uploads: number;
  processing_uploads: number;
  uploads_today: number;
  uploads_by_type: UploadByType[];
  recent_uploads: Upload[];
}

export interface UploadByType {
  file_type: FileType;
  count: number;
  total_size: number;
  percentage: number;
}

export interface UploadValidation {
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  row_count: number;
  column_count: number;
  sample_data?: any[];
}

export interface ValidationError {
  row?: number;
  column?: string;
  message: string;
  severity: 'error' | 'critical';
}

export interface ValidationWarning {
  row?: number;
  column?: string;
  message: string;
}

export interface UploadProgress {
  upload_id: string;
  status: UploadStatus;
  progress: number;
  bytes_uploaded: number;
  bytes_total: number;
  speed?: number; // bytes per second
  time_remaining?: number; // seconds
}
