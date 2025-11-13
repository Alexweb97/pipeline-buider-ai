/**
 * Data Source Types
 */

export type DataSourceType =
  | 'postgresql'
  | 'mysql'
  | 'mongodb'
  | 'redis'
  | 'rest_api'
  | 's3'
  | 'csv'
  | 'json'
  | 'kafka';

export type DataSourceStatus = 'connected' | 'disconnected' | 'error' | 'testing';

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  description: string;
  status: DataSourceStatus;
  created_at: string;
  updated_at: string;
  last_tested_at?: string;
  connection_details: ConnectionDetails;
  used_in_pipelines: number;
  records_count?: number;
}

export interface ConnectionDetails {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  // password ne sera jamais retourné par l'API
  ssl?: boolean;
  // Détails spécifiques par type
  [key: string]: any;
}

export interface DataSourceCreateData {
  name: string;
  type: DataSourceType;
  description: string;
  connection_details: ConnectionDetails;
}

export interface DataSourceUpdateData {
  name?: string;
  description?: string;
  connection_details?: Partial<ConnectionDetails>;
}

export interface DataSourceTestResult {
  success: boolean;
  message: string;
  latency_ms?: number;
  records_sample?: any[];
}

// Configuration par type de source
export interface SourceTypeConfig {
  type: DataSourceType;
  label: string;
  icon: string;
  color: string;
  fields: SourceField[];
}

export interface SourceField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'password' | 'boolean' | 'select';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  helperText?: string;
}
