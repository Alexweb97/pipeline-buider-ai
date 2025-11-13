/**
 * Transformation Types
 */

export type TransformationType =
  | 'filter'
  | 'map'
  | 'aggregate'
  | 'join'
  | 'sort'
  | 'deduplicate'
  | 'pivot'
  | 'unpivot'
  | 'validate'
  | 'custom';

export type TransformationCategory = 'data_quality' | 'data_shaping' | 'data_enrichment' | 'custom';

export type TransformationStatus = 'active' | 'draft' | 'deprecated';

export interface Transformation {
  id: string;
  name: string;
  type: TransformationType;
  category: TransformationCategory;
  description: string;
  status: TransformationStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  used_in_pipelines: number;
  config: TransformationConfig;
  input_schema?: SchemaDefinition;
  output_schema?: SchemaDefinition;
  is_reusable: boolean;
  tags: string[];
}

export interface TransformationConfig {
  // Configuration spécifique selon le type
  [key: string]: any;
}

export interface SchemaDefinition {
  fields: SchemaField[];
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required: boolean;
  description?: string;
}

export interface TransformationCreateData {
  name: string;
  type: TransformationType;
  category: TransformationCategory;
  description: string;
  config: TransformationConfig;
  is_reusable?: boolean;
  tags?: string[];
}

export interface TransformationUpdateData {
  name?: string;
  description?: string;
  config?: Partial<TransformationConfig>;
  status?: TransformationStatus;
  tags?: string[];
}

export interface TransformationTestData {
  sample_input: any;
  expected_output?: any;
}

export interface TransformationTestResult {
  success: boolean;
  output?: any;
  error?: string;
  execution_time_ms: number;
  rows_processed?: number;
}

// Configuration templates par type
export interface TransformationTypeConfig {
  type: TransformationType;
  label: string;
  icon: string;
  color: string;
  category: TransformationCategory;
  description: string;
  configFields: TransformationConfigField[];
}

export interface TransformationConfigField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'code' | 'json';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  helperText?: string;
  defaultValue?: any;
}
