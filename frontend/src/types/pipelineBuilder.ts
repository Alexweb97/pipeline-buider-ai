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
  type: 'text' | 'number' | 'select' | 'boolean' | 'json' | 'code' | 'file-upload';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: any;
  helperText?: string;
  accept?: string; // For file-upload type
  format?: string; // JSON Schema format (file-upload, password, uri, code, sql, etc.)
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
