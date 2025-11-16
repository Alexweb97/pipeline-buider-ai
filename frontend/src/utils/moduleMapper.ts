/**
 * Module Mapper - Convert backend ModuleResponse to frontend ModuleDefinition
 */
import type { ModuleResponse } from '../types/api';
import type { ModuleDefinition, NodeType, ModuleCategory, ConfigField } from '../types/pipelineBuilder';

/**
 * Map backend type to frontend category (plural form)
 */
function mapTypeToCategory(type: string): ModuleCategory {
  switch (type) {
    case 'extractor':
      return 'extractors';
    case 'transformer':
      return 'transformers';
    case 'loader':
      return 'loaders';
    default:
      return 'extractors'; // Default fallback
  }
}

/**
 * Map backend module response to frontend module definition
 */
export function mapModuleResponseToDefinition(module: ModuleResponse): ModuleDefinition {
  // Map backend type to frontend NodeType
  const nodeType: NodeType = module.type as NodeType;

  // Parse config schema to ConfigField[]
  const configSchema = parseConfigSchema(module.config_schema);

  // Extract default values from schema
  const defaultConfig = extractDefaultConfig(module.config_schema);

  return {
    id: module.name, // Use name as ID for consistency with frontend
    type: nodeType,
    category: mapTypeToCategory(module.type), // Map type to category (plural form)
    name: module.display_name,
    description: module.description || '',
    icon: module.icon || getDefaultIcon(module.type),
    color: getColorForType(module.type),
    defaultConfig,
    configSchema,
  };
}

/**
 * Parse JSON schema to ConfigField array
 */
function parseConfigSchema(schema: Record<string, any>): ConfigField[] {
  const fields: ConfigField[] = [];

  if (!schema.properties) {
    return fields;
  }

  for (const [key, value] of Object.entries(schema.properties as Record<string, any>)) {
    const field: ConfigField = {
      name: key,
      label: value.title || formatLabel(key),
      type: mapSchemaTypeToFieldType(value.type, value.format),
      required: schema.required?.includes(key) || false,
      helperText: value.description,
      defaultValue: value.default,
      format: value.format,
      accept: value.accept, // For file-upload fields
    };

    // Handle enum options
    if (value.enum) {
      field.options = value.enum.map((v: any) => ({
        label: String(v),
        value: String(v),
      }));
    }

    fields.push(field);
  }

  return fields;
}

/**
 * Extract default config values from schema
 */
function extractDefaultConfig(schema: Record<string, any>): Record<string, any> {
  const defaults: Record<string, any> = {};

  if (!schema.properties) {
    return defaults;
  }

  for (const [key, value] of Object.entries(schema.properties as Record<string, any>)) {
    if (value.default !== undefined) {
      defaults[key] = value.default;
    }
  }

  return defaults;
}

/**
 * Map JSON Schema type to ConfigField type
 */
function mapSchemaTypeToFieldType(type: string, format?: string): ConfigField['type'] {
  // ConfigField supports: 'text' | 'number' | 'select' | 'boolean' | 'json' | 'code' | 'file-upload'
  if (format === 'file-upload') return 'file-upload'; // File upload field
  if (format === 'password') return 'text'; // Use text for passwords (can be enhanced with input type)
  if (format === 'uri' || format === 'url') return 'text';
  if (format === 'code' || format === 'sql') return 'code'; // Code editor

  switch (type) {
    case 'string':
      return 'text';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return 'json'; // Use json editor for arrays
    case 'object':
      return 'json'; // Use json editor for objects
    default:
      return 'text';
  }
}

/**
 * Format field name to label
 */
function formatLabel(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get default icon for module type
 */
function getDefaultIcon(type: string): string {
  switch (type) {
    case 'extractor':
      return 'Database';
    case 'transformer':
      return 'Transform';
    case 'loader':
      return 'Storage';
    default:
      return 'Functions';
  }
}

/**
 * Get color for module type
 */
function getColorForType(type: string): string {
  switch (type) {
    case 'extractor':
      return '#4F46E5'; // Indigo
    case 'transformer':
      return '#10B981'; // Emerald
    case 'loader':
      return '#F59E0B'; // Amber
    default:
      return '#6B7280'; // Gray
  }
}

/**
 * Map multiple modules
 */
export function mapModulesToDefinitions(modules: ModuleResponse[]): ModuleDefinition[] {
  return modules.map(mapModuleResponseToDefinition);
}
