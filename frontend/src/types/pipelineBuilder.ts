/**
 * Pipeline Builder Types
 */
import { Node } from 'reactflow';

export type NodeType = 'extractor' | 'transformer' | 'loader';

export type ModuleCategory =
  | 'extractors'
  | 'transformers'
  | 'loaders';

export interface ConfigPreset {
  id: string;
  name: string;
  description: string;
  config: Record<string, any>;
}

export interface ConfigTemplate {
  id: string;
  name: string;
  description: string;
  moduleId: string;
  config: Record<string, any>;
  createdAt: string;
  createdBy?: string;
  tags?: string[];
}

export interface ModuleDefinition {
  id: string;
  type: NodeType;
  category: ModuleCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  defaultConfig: Record<string, any>;
  configSchema: ConfigField[];
  presets?: ConfigPreset[];
}

export interface ConfigField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'json' | 'code';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: any;
  helperText?: string;
}

export interface PipelineNode extends Node {
  type: NodeType;
  data: {
    label: string;
    moduleId: string;
    moduleName: string;
    icon: string;
    color: string;
    config: Record<string, any>;
    status?: 'idle' | 'running' | 'success' | 'error';
    outputs?: number;
    inputs?: number;
  };
}

export interface PipelineEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type?: string;
  animated?: boolean;
  style?: React.CSSProperties;
  data?: {
    throughput?: number;
    dataPreview?: any[];
  };
}

export interface PipelineBuilderState {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  selectedNode: PipelineNode | null;
  selectedEdge: PipelineEdge | null;
  isConfigPanelOpen: boolean;
  isPaletteOpen: boolean;
}

export interface PipelineSaveData {
  name: string;
  description: string;
  type: 'etl' | 'elt' | 'streaming';
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  schedule?: string;
  tags?: string[];
}

// Available Modules Library
export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  // ==================== EXTRACTORS ====================
  {
    id: 'postgres-extractor',
    type: 'extractor',
    category: 'extractors',
    name: 'PostgreSQL',
    description: 'Extract data from PostgreSQL database',
    icon: 'Database',
    color: '#336791',
    defaultConfig: {
      query: 'SELECT * FROM table_name',
      limit: 1000,
    },
    configSchema: [
      {
        name: 'connection_id',
        label: 'Connection',
        type: 'select',
        required: true,
        options: [],
      },
      {
        name: 'query',
        label: 'SQL Query',
        type: 'code',
        required: true,
        placeholder: 'SELECT * FROM table_name',
      },
      {
        name: 'limit',
        label: 'Row Limit',
        type: 'number',
        required: false,
        defaultValue: 1000,
      },
    ],
    presets: [
      {
        id: 'full-table',
        name: 'Full Table Export',
        description: 'Export all data from a table',
        config: {
          query: 'SELECT * FROM table_name',
          limit: null,
        },
      },
      {
        id: 'incremental-load',
        name: 'Incremental Load',
        description: 'Load only new/updated records since last run',
        config: {
          query: 'SELECT * FROM table_name WHERE updated_at > :last_run_date ORDER BY updated_at',
          limit: null,
        },
      },
      {
        id: 'sample-data',
        name: 'Sample Data (1000 rows)',
        description: 'Quick sample for testing',
        config: {
          query: 'SELECT * FROM table_name LIMIT 1000',
          limit: 1000,
        },
      },
      {
        id: 'date-range',
        name: 'Date Range Query',
        description: 'Filter by date range',
        config: {
          query: 'SELECT * FROM table_name WHERE created_at BETWEEN :start_date AND :end_date',
          limit: null,
        },
      },
    ],
  },
  {
    id: 'mysql-extractor',
    type: 'extractor',
    category: 'extractors',
    name: 'MySQL',
    description: 'Extract data from MySQL database',
    icon: 'Database',
    color: '#4479A1',
    defaultConfig: {},
    configSchema: [
      {
        name: 'connection_id',
        label: 'Connection',
        type: 'select',
        required: true,
        options: [],
      },
      {
        name: 'query',
        label: 'SQL Query',
        type: 'code',
        required: true,
      },
    ],
  },
  {
    id: 'mongodb-extractor',
    type: 'extractor',
    category: 'extractors',
    name: 'MongoDB',
    description: 'Extract data from MongoDB collection',
    icon: 'Database',
    color: '#47A248',
    defaultConfig: {},
    configSchema: [
      {
        name: 'connection_id',
        label: 'Connection',
        type: 'select',
        required: true,
        options: [],
      },
      {
        name: 'collection',
        label: 'Collection Name',
        type: 'text',
        required: true,
        placeholder: 'users',
      },
      {
        name: 'query',
        label: 'Query Filter (JSON)',
        type: 'json',
        required: false,
        placeholder: '{"status": "active"}',
      },
    ],
  },
  {
    id: 'csv-extractor',
    type: 'extractor',
    category: 'extractors',
    name: 'CSV File',
    description: 'Read data from CSV file',
    icon: 'Description',
    color: '#10b981',
    defaultConfig: {
      delimiter: ',',
      hasHeader: true,
    },
    configSchema: [
      {
        name: 'file_path',
        label: 'File Path',
        type: 'text',
        required: true,
        placeholder: '/path/to/file.csv',
      },
      {
        name: 'delimiter',
        label: 'Delimiter',
        type: 'select',
        required: true,
        options: [
          { value: ',', label: 'Comma (,)' },
          { value: ';', label: 'Semicolon (;)' },
          { value: '\t', label: 'Tab' },
        ],
        defaultValue: ',',
      },
      {
        name: 'hasHeader',
        label: 'Has Header',
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
    ],
  },
  {
    id: 'excel-extractor',
    type: 'extractor',
    category: 'extractors',
    name: 'Excel',
    description: 'Read data from Excel file (.xlsx, .xls)',
    icon: 'Description',
    color: '#217346',
    defaultConfig: {
      sheet_name: 0,
    },
    configSchema: [
      {
        name: 'file_path',
        label: 'File Path',
        type: 'text',
        required: true,
        placeholder: '/path/to/file.xlsx',
      },
      {
        name: 'sheet_name',
        label: 'Sheet Name/Index',
        type: 'text',
        required: false,
        placeholder: 'Sheet1 or 0',
        defaultValue: '0',
      },
    ],
  },
  {
    id: 'json-extractor',
    type: 'extractor',
    category: 'extractors',
    name: 'JSON File',
    description: 'Read data from JSON file',
    icon: 'Description',
    color: '#f59e0b',
    defaultConfig: {},
    configSchema: [
      {
        name: 'file_path',
        label: 'File Path',
        type: 'text',
        required: true,
        placeholder: '/path/to/file.json',
      },
      {
        name: 'json_path',
        label: 'JSON Path (optional)',
        type: 'text',
        required: false,
        placeholder: '$.data.items',
        helperText: 'Extract specific path from JSON',
      },
    ],
  },
  {
    id: 'api-extractor',
    type: 'extractor',
    category: 'extractors',
    name: 'REST API',
    description: 'Fetch data from REST API',
    icon: 'Api',
    color: '#8b5cf6',
    defaultConfig: {
      method: 'GET',
    },
    configSchema: [
      {
        name: 'url',
        label: 'API URL',
        type: 'text',
        required: true,
        placeholder: 'https://api.example.com/data',
      },
      {
        name: 'method',
        label: 'HTTP Method',
        type: 'select',
        required: true,
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
        ],
        defaultValue: 'GET',
      },
      {
        name: 'headers',
        label: 'Headers (JSON)',
        type: 'json',
        required: false,
        placeholder: '{"Authorization": "Bearer token"}',
      },
    ],
  },
  {
    id: 's3-extractor',
    type: 'extractor',
    category: 'extractors',
    name: 'S3/MinIO',
    description: 'Read data from S3 or MinIO',
    icon: 'Cloud',
    color: '#FF9900',
    defaultConfig: {},
    configSchema: [
      {
        name: 'bucket',
        label: 'Bucket Name',
        type: 'text',
        required: true,
        placeholder: 'my-bucket',
      },
      {
        name: 'path',
        label: 'File Path',
        type: 'text',
        required: true,
        placeholder: 'data/input.parquet',
      },
    ],
  },

  // ==================== TRANSFORMERS ====================
  // Data Cleaning & Validation
  {
    id: 'remove-nulls-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Remove Nulls',
    description: 'Remove rows with null/missing values',
    icon: 'FilterList',
    color: '#ef4444',
    defaultConfig: {
      strategy: 'any',
    },
    configSchema: [
      {
        name: 'columns',
        label: 'Columns to Check',
        type: 'text',
        required: false,
        placeholder: 'email, phone (leave empty for all)',
        helperText: 'Comma-separated column names',
      },
      {
        name: 'strategy',
        label: 'Remove Strategy',
        type: 'select',
        required: true,
        options: [
          { value: 'any', label: 'Any null value' },
          { value: 'all', label: 'All null values' },
        ],
        defaultValue: 'any',
      },
    ],
  },
  {
    id: 'fill-nulls-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Fill Nulls',
    description: 'Fill missing values with defaults',
    icon: 'Transform',
    color: '#10b981',
    defaultConfig: {},
    configSchema: [
      {
        name: 'strategy',
        label: 'Fill Strategy',
        type: 'select',
        required: true,
        options: [
          { value: 'constant', label: 'Constant Value' },
          { value: 'mean', label: 'Mean' },
          { value: 'median', label: 'Median' },
          { value: 'forward', label: 'Forward Fill' },
          { value: 'backward', label: 'Backward Fill' },
        ],
      },
      {
        name: 'fill_value',
        label: 'Fill Value (for constant)',
        type: 'text',
        required: false,
        placeholder: '0 or Unknown',
      },
    ],
  },
  {
    id: 'deduplicate-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Deduplicate',
    description: 'Remove duplicate rows',
    icon: 'FilterList',
    color: '#ec4899',
    defaultConfig: {
      keep: 'first',
    },
    configSchema: [
      {
        name: 'columns',
        label: 'Key Columns',
        type: 'text',
        required: false,
        placeholder: 'id, email (leave empty for all columns)',
      },
      {
        name: 'keep',
        label: 'Keep',
        type: 'select',
        required: true,
        options: [
          { value: 'first', label: 'First Occurrence' },
          { value: 'last', label: 'Last Occurrence' },
        ],
        defaultValue: 'first',
      },
    ],
  },
  {
    id: 'data-validation-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Data Validation',
    description: 'Validate data against rules',
    icon: 'FilterAlt',
    color: '#0ea5e9',
    defaultConfig: {},
    configSchema: [
      {
        name: 'rules',
        label: 'Validation Rules (JSON)',
        type: 'json',
        required: true,
        placeholder: '{"email": "email", "age": "int > 0"}',
        helperText: 'Define validation rules per column',
      },
      {
        name: 'action',
        label: 'On Validation Fail',
        type: 'select',
        required: true,
        options: [
          { value: 'remove', label: 'Remove Row' },
          { value: 'flag', label: 'Flag Row' },
          { value: 'fail', label: 'Fail Pipeline' },
        ],
      },
    ],
  },
  {
    id: 'normalize-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Normalize Text',
    description: 'Normalize and clean text data',
    icon: 'Transform',
    color: '#6366f1',
    defaultConfig: {},
    configSchema: [
      {
        name: 'columns',
        label: 'Text Columns',
        type: 'text',
        required: true,
        placeholder: 'name, description',
      },
      {
        name: 'operations',
        label: 'Operations',
        type: 'select',
        required: true,
        options: [
          { value: 'lowercase', label: 'Lowercase' },
          { value: 'uppercase', label: 'Uppercase' },
          { value: 'trim', label: 'Trim Whitespace' },
          { value: 'remove_special', label: 'Remove Special Chars' },
        ],
      },
    ],
  },
  {
    id: 'cast-types-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Cast Data Types',
    description: 'Convert column data types',
    icon: 'Transform',
    color: '#8b5cf6',
    defaultConfig: {},
    configSchema: [
      {
        name: 'type_mapping',
        label: 'Type Mapping (JSON)',
        type: 'json',
        required: true,
        placeholder: '{"age": "int", "price": "float", "created_at": "datetime"}',
      },
    ],
  },

  // Data Transformation
  {
    id: 'filter-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Filter Rows',
    description: 'Filter rows based on conditions',
    icon: 'FilterAlt',
    color: '#3b82f6',
    defaultConfig: {},
    configSchema: [
      {
        name: 'condition',
        label: 'Filter Condition',
        type: 'code',
        required: true,
        placeholder: 'row["age"] > 18 and row["status"] == "active"',
        helperText: 'Python expression to filter rows',
      },
    ],
    presets: [
      {
        id: 'active-only',
        name: 'Active Records Only',
        description: 'Filter for active/enabled records',
        config: {
          condition: 'row["status"] == "active"',
        },
      },
      {
        id: 'not-null',
        name: 'Remove Null Values',
        description: 'Filter out rows with null in key column',
        config: {
          condition: 'row["email"] is not None and row["email"] != ""',
        },
      },
      {
        id: 'date-range',
        name: 'Recent Records (30 days)',
        description: 'Records from last 30 days',
        config: {
          condition: '(datetime.now() - row["created_at"]).days <= 30',
        },
      },
      {
        id: 'numeric-range',
        name: 'Value in Range',
        description: 'Filter numeric values in range',
        config: {
          condition: 'row["amount"] >= 0 and row["amount"] <= 1000',
        },
      },
    ],
  },
  {
    id: 'select-columns-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Select Columns',
    description: 'Select specific columns',
    icon: 'FilterList',
    color: '#14b8a6',
    defaultConfig: {},
    configSchema: [
      {
        name: 'columns',
        label: 'Columns to Keep',
        type: 'text',
        required: true,
        placeholder: 'id, name, email, created_at',
      },
    ],
  },
  {
    id: 'rename-columns-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Rename Columns',
    description: 'Rename column names',
    icon: 'Transform',
    color: '#a855f7',
    defaultConfig: {},
    configSchema: [
      {
        name: 'rename_mapping',
        label: 'Rename Mapping (JSON)',
        type: 'json',
        required: true,
        placeholder: '{"old_name": "new_name", "user_id": "id"}',
      },
    ],
  },
  {
    id: 'add-column-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Add Column',
    description: 'Add calculated/derived column',
    icon: 'Functions',
    color: '#f59e0b',
    defaultConfig: {},
    configSchema: [
      {
        name: 'column_name',
        label: 'New Column Name',
        type: 'text',
        required: true,
        placeholder: 'full_name',
      },
      {
        name: 'expression',
        label: 'Expression',
        type: 'code',
        required: true,
        placeholder: 'row["first_name"] + " " + row["last_name"]',
        helperText: 'Python expression to calculate value',
      },
    ],
  },
  {
    id: 'map-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Map Values',
    description: 'Map/replace column values',
    icon: 'Transform',
    color: '#8b5cf6',
    defaultConfig: {},
    configSchema: [
      {
        name: 'column',
        label: 'Column Name',
        type: 'text',
        required: true,
        placeholder: 'status',
      },
      {
        name: 'mapping',
        label: 'Value Mapping (JSON)',
        type: 'json',
        required: true,
        placeholder: '{"0": "inactive", "1": "active", "2": "pending"}',
      },
    ],
  },
  {
    id: 'split-column-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Split Column',
    description: 'Split column into multiple columns',
    icon: 'Transform',
    color: '#06b6d4',
    defaultConfig: {},
    configSchema: [
      {
        name: 'column',
        label: 'Column to Split',
        type: 'text',
        required: true,
        placeholder: 'full_name',
      },
      {
        name: 'separator',
        label: 'Separator',
        type: 'text',
        required: true,
        placeholder: ' ',
        defaultValue: ' ',
      },
      {
        name: 'new_columns',
        label: 'New Column Names',
        type: 'text',
        required: true,
        placeholder: 'first_name, last_name',
      },
    ],
  },

  // Aggregation & Grouping
  {
    id: 'aggregate-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Aggregate',
    description: 'Aggregate data (group by, sum, avg)',
    icon: 'Functions',
    color: '#10b981',
    defaultConfig: {},
    configSchema: [
      {
        name: 'group_by',
        label: 'Group By Columns',
        type: 'text',
        required: true,
        placeholder: 'region, category',
      },
      {
        name: 'aggregations',
        label: 'Aggregations (JSON)',
        type: 'json',
        required: true,
        placeholder: '{"total_sales": {"column": "sales", "func": "sum"}}',
        helperText: 'Functions: sum, avg, min, max, count',
      },
    ],
    presets: [
      {
        id: 'sales-by-region',
        name: 'Sales by Region',
        description: 'Total and average sales per region',
        config: {
          group_by: 'region',
          aggregations: '{"total_sales": {"column": "amount", "func": "sum"}, "avg_sale": {"column": "amount", "func": "avg"}, "num_transactions": {"column": "id", "func": "count"}}',
        },
      },
      {
        id: 'daily-metrics',
        name: 'Daily Metrics',
        description: 'Aggregate metrics by date',
        config: {
          group_by: 'date',
          aggregations: '{"total_revenue": {"column": "revenue", "func": "sum"}, "total_orders": {"column": "order_id", "func": "count"}, "avg_order_value": {"column": "revenue", "func": "avg"}}',
        },
      },
      {
        id: 'user-activity',
        name: 'User Activity Summary',
        description: 'Activity stats per user',
        config: {
          group_by: 'user_id',
          aggregations: '{"total_actions": {"column": "action_id", "func": "count"}, "last_activity": {"column": "timestamp", "func": "max"}, "first_activity": {"column": "timestamp", "func": "min"}}',
        },
      },
    ],
  },
  {
    id: 'pivot-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Pivot',
    description: 'Pivot table transformation',
    icon: 'Transform',
    color: '#f97316',
    defaultConfig: {},
    configSchema: [
      {
        name: 'index',
        label: 'Index Column(s)',
        type: 'text',
        required: true,
        placeholder: 'date',
      },
      {
        name: 'columns',
        label: 'Columns to Pivot',
        type: 'text',
        required: true,
        placeholder: 'product',
      },
      {
        name: 'values',
        label: 'Values Column',
        type: 'text',
        required: true,
        placeholder: 'sales',
      },
    ],
  },
  {
    id: 'unpivot-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Unpivot (Melt)',
    description: 'Unpivot wide format to long format',
    icon: 'Transform',
    color: '#84cc16',
    defaultConfig: {},
    configSchema: [
      {
        name: 'id_vars',
        label: 'ID Variables',
        type: 'text',
        required: true,
        placeholder: 'id, name',
        helperText: 'Columns to keep as identifiers',
      },
      {
        name: 'value_vars',
        label: 'Value Variables',
        type: 'text',
        required: false,
        placeholder: 'jan, feb, mar (leave empty for all others)',
      },
    ],
  },
  {
    id: 'sort-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Sort',
    description: 'Sort rows by columns',
    icon: 'FilterList',
    color: '#64748b',
    defaultConfig: {
      ascending: true,
    },
    configSchema: [
      {
        name: 'columns',
        label: 'Sort By Columns',
        type: 'text',
        required: true,
        placeholder: 'date, amount',
      },
      {
        name: 'ascending',
        label: 'Ascending Order',
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
    ],
  },

  // Joins & Merges
  {
    id: 'join-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Join',
    description: 'Join with another dataset',
    icon: 'Merge',
    color: '#f59e0b',
    defaultConfig: {
      join_type: 'left',
    },
    configSchema: [
      {
        name: 'join_type',
        label: 'Join Type',
        type: 'select',
        required: true,
        options: [
          { value: 'left', label: 'Left Join' },
          { value: 'right', label: 'Right Join' },
          { value: 'inner', label: 'Inner Join' },
          { value: 'outer', label: 'Outer Join' },
        ],
        defaultValue: 'left',
      },
      {
        name: 'on_column',
        label: 'Join Column',
        type: 'text',
        required: true,
        placeholder: 'customer_id',
      },
      {
        name: 'right_dataset',
        label: 'Right Dataset ID',
        type: 'text',
        required: true,
        placeholder: 'node-id or table-name',
      },
    ],
  },
  {
    id: 'union-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Union',
    description: 'Combine multiple datasets vertically',
    icon: 'Merge',
    color: '#dc2626',
    defaultConfig: {},
    configSchema: [
      {
        name: 'datasets',
        label: 'Dataset IDs to Union',
        type: 'text',
        required: true,
        placeholder: 'node-id-1, node-id-2',
      },
    ],
  },

  // Date & Time
  {
    id: 'parse-date-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Parse Dates',
    description: 'Parse date/time columns',
    icon: 'Transform',
    color: '#0891b2',
    defaultConfig: {},
    configSchema: [
      {
        name: 'columns',
        label: 'Date Columns',
        type: 'text',
        required: true,
        placeholder: 'created_at, updated_at',
      },
      {
        name: 'format',
        label: 'Date Format',
        type: 'text',
        required: false,
        placeholder: '%Y-%m-%d %H:%M:%S',
        helperText: 'Leave empty for auto-detection',
      },
    ],
  },
  {
    id: 'extract-date-parts-transformer',
    type: 'transformer',
    category: 'transformers',
    name: 'Extract Date Parts',
    description: 'Extract year, month, day, etc.',
    icon: 'Functions',
    color: '#7c3aed',
    defaultConfig: {},
    configSchema: [
      {
        name: 'date_column',
        label: 'Date Column',
        type: 'text',
        required: true,
        placeholder: 'created_at',
      },
      {
        name: 'parts',
        label: 'Parts to Extract',
        type: 'text',
        required: true,
        placeholder: 'year, month, day, hour',
        helperText: 'Comma-separated: year, month, day, hour, minute, weekday',
      },
    ],
  },

  // ==================== LOADERS ====================
  {
    id: 'postgres-loader',
    type: 'loader',
    category: 'loaders',
    name: 'PostgreSQL',
    description: 'Load data into PostgreSQL',
    icon: 'Storage',
    color: '#336791',
    defaultConfig: {
      if_exists: 'append',
    },
    configSchema: [
      {
        name: 'connection_id',
        label: 'Connection',
        type: 'select',
        required: true,
        options: [],
      },
      {
        name: 'table_name',
        label: 'Table Name',
        type: 'text',
        required: true,
        placeholder: 'target_table',
      },
      {
        name: 'if_exists',
        label: 'If Table Exists',
        type: 'select',
        required: true,
        options: [
          { value: 'append', label: 'Append' },
          { value: 'replace', label: 'Replace' },
          { value: 'fail', label: 'Fail' },
        ],
        defaultValue: 'append',
      },
    ],
  },
  {
    id: 'mysql-loader',
    type: 'loader',
    category: 'loaders',
    name: 'MySQL',
    description: 'Load data into MySQL',
    icon: 'Storage',
    color: '#4479A1',
    defaultConfig: {
      if_exists: 'append',
    },
    configSchema: [
      {
        name: 'connection_id',
        label: 'Connection',
        type: 'select',
        required: true,
        options: [],
      },
      {
        name: 'table_name',
        label: 'Table Name',
        type: 'text',
        required: true,
        placeholder: 'target_table',
      },
      {
        name: 'if_exists',
        label: 'If Table Exists',
        type: 'select',
        required: true,
        options: [
          { value: 'append', label: 'Append' },
          { value: 'replace', label: 'Replace' },
          { value: 'fail', label: 'Fail' },
        ],
        defaultValue: 'append',
      },
    ],
  },
  {
    id: 'mongodb-loader',
    type: 'loader',
    category: 'loaders',
    name: 'MongoDB',
    description: 'Load data into MongoDB',
    icon: 'Storage',
    color: '#47A248',
    defaultConfig: {},
    configSchema: [
      {
        name: 'connection_id',
        label: 'Connection',
        type: 'select',
        required: true,
        options: [],
      },
      {
        name: 'collection',
        label: 'Collection Name',
        type: 'text',
        required: true,
        placeholder: 'my_collection',
      },
      {
        name: 'operation',
        label: 'Operation',
        type: 'select',
        required: true,
        options: [
          { value: 'insert', label: 'Insert' },
          { value: 'upsert', label: 'Upsert' },
          { value: 'replace', label: 'Replace' },
        ],
        defaultValue: 'insert',
      },
    ],
  },
  {
    id: 's3-loader',
    type: 'loader',
    category: 'loaders',
    name: 'S3/MinIO',
    description: 'Save data to S3 or MinIO',
    icon: 'Cloud',
    color: '#FF9900',
    defaultConfig: {
      format: 'parquet',
    },
    configSchema: [
      {
        name: 'bucket',
        label: 'Bucket Name',
        type: 'text',
        required: true,
        placeholder: 'my-bucket',
      },
      {
        name: 'path',
        label: 'File Path',
        type: 'text',
        required: true,
        placeholder: 'data/output.parquet',
      },
      {
        name: 'format',
        label: 'File Format',
        type: 'select',
        required: true,
        options: [
          { value: 'parquet', label: 'Parquet' },
          { value: 'csv', label: 'CSV' },
          { value: 'json', label: 'JSON' },
        ],
        defaultValue: 'parquet',
      },
    ],
  },
  {
    id: 'csv-loader',
    type: 'loader',
    category: 'loaders',
    name: 'CSV File',
    description: 'Write data to CSV file',
    icon: 'Description',
    color: '#10b981',
    defaultConfig: {
      delimiter: ',',
      include_header: true,
    },
    configSchema: [
      {
        name: 'file_path',
        label: 'Output File Path',
        type: 'text',
        required: true,
        placeholder: '/output/data.csv',
      },
      {
        name: 'delimiter',
        label: 'Delimiter',
        type: 'select',
        required: true,
        options: [
          { value: ',', label: 'Comma (,)' },
          { value: ';', label: 'Semicolon (;)' },
          { value: '\t', label: 'Tab' },
        ],
        defaultValue: ',',
      },
      {
        name: 'include_header',
        label: 'Include Header',
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
    ],
  },
  {
    id: 'excel-loader',
    type: 'loader',
    category: 'loaders',
    name: 'Excel',
    description: 'Write data to Excel file',
    icon: 'Description',
    color: '#217346',
    defaultConfig: {
      sheet_name: 'Sheet1',
    },
    configSchema: [
      {
        name: 'file_path',
        label: 'Output File Path',
        type: 'text',
        required: true,
        placeholder: '/output/data.xlsx',
      },
      {
        name: 'sheet_name',
        label: 'Sheet Name',
        type: 'text',
        required: false,
        placeholder: 'Sheet1',
        defaultValue: 'Sheet1',
      },
    ],
  },
  {
    id: 'json-loader',
    type: 'loader',
    category: 'loaders',
    name: 'JSON File',
    description: 'Write data to JSON file',
    icon: 'Description',
    color: '#f59e0b',
    defaultConfig: {
      orient: 'records',
    },
    configSchema: [
      {
        name: 'file_path',
        label: 'Output File Path',
        type: 'text',
        required: true,
        placeholder: '/output/data.json',
      },
      {
        name: 'orient',
        label: 'JSON Format',
        type: 'select',
        required: true,
        options: [
          { value: 'records', label: 'Records (array of objects)' },
          { value: 'index', label: 'Index' },
          { value: 'values', label: 'Values (array of arrays)' },
        ],
        defaultValue: 'records',
      },
      {
        name: 'indent',
        label: 'Pretty Print',
        type: 'boolean',
        required: false,
        defaultValue: true,
        helperText: 'Format JSON with indentation',
      },
    ],
  },
  {
    id: 'parquet-loader',
    type: 'loader',
    category: 'loaders',
    name: 'Parquet File',
    description: 'Write data to Parquet file (columnar)',
    icon: 'Description',
    color: '#059669',
    defaultConfig: {
      compression: 'snappy',
    },
    configSchema: [
      {
        name: 'file_path',
        label: 'Output File Path',
        type: 'text',
        required: true,
        placeholder: '/output/data.parquet',
      },
      {
        name: 'compression',
        label: 'Compression',
        type: 'select',
        required: true,
        options: [
          { value: 'snappy', label: 'Snappy (fast)' },
          { value: 'gzip', label: 'GZIP (balanced)' },
          { value: 'brotli', label: 'Brotli (high compression)' },
          { value: 'none', label: 'None' },
        ],
        defaultValue: 'snappy',
      },
    ],
  },
  {
    id: 'api-loader',
    type: 'loader',
    category: 'loaders',
    name: 'REST API',
    description: 'Send data to REST API endpoint',
    icon: 'Api',
    color: '#8b5cf6',
    defaultConfig: {
      method: 'POST',
    },
    configSchema: [
      {
        name: 'url',
        label: 'API URL',
        type: 'text',
        required: true,
        placeholder: 'https://api.example.com/data',
      },
      {
        name: 'method',
        label: 'HTTP Method',
        type: 'select',
        required: true,
        options: [
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'PATCH', label: 'PATCH' },
        ],
        defaultValue: 'POST',
      },
      {
        name: 'headers',
        label: 'Headers (JSON)',
        type: 'json',
        required: false,
        placeholder: '{"Authorization": "Bearer token", "Content-Type": "application/json"}',
      },
      {
        name: 'batch_size',
        label: 'Batch Size',
        type: 'number',
        required: false,
        placeholder: '100',
        helperText: 'Number of records per API call',
        defaultValue: 100,
      },
    ],
  },
  {
    id: 'datawarehouse-loader',
    type: 'loader',
    category: 'loaders',
    name: 'Data Warehouse',
    description: 'Load to Snowflake/BigQuery/Redshift',
    icon: 'Storage',
    color: '#06b6d4',
    defaultConfig: {
      if_exists: 'append',
    },
    configSchema: [
      {
        name: 'warehouse_type',
        label: 'Warehouse Type',
        type: 'select',
        required: true,
        options: [
          { value: 'snowflake', label: 'Snowflake' },
          { value: 'bigquery', label: 'Google BigQuery' },
          { value: 'redshift', label: 'AWS Redshift' },
        ],
      },
      {
        name: 'connection_id',
        label: 'Connection',
        type: 'select',
        required: true,
        options: [],
      },
      {
        name: 'table_name',
        label: 'Table Name',
        type: 'text',
        required: true,
        placeholder: 'schema.table_name',
      },
      {
        name: 'if_exists',
        label: 'If Table Exists',
        type: 'select',
        required: true,
        options: [
          { value: 'append', label: 'Append' },
          { value: 'replace', label: 'Replace' },
          { value: 'fail', label: 'Fail' },
        ],
        defaultValue: 'append',
      },
    ],
  },
];

// Helper functions
export const getModulesByCategory = (category: ModuleCategory): ModuleDefinition[] => {
  return MODULE_DEFINITIONS.filter(m => m.category === category);
};

export const getModuleById = (id: string): ModuleDefinition | undefined => {
  return MODULE_DEFINITIONS.find(m => m.id === id);
};
