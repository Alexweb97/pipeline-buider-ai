/**
 * Dashboard Types
 * TypeScript type definitions for dashboard entities
 */

export interface Dashboard {
  id: string;
  pipeline_id: string;
  name: string;
  description?: string;
  config: DashboardConfig;
  theme: 'light' | 'dark';
  layout: LayoutConfig;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardConfig {
  charts?: ChartConfig[];
  filters?: FilterConfig[];
  refreshInterval?: number; // in seconds
}

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  xAxis?: string;
  yAxis?: string;
  aggregation?: AggregationType;
  filters?: Record<string, any>;
  options?: ChartOptions;
}

export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'area'
  | 'scatter'
  | 'table'
  | 'kpi'
  | 'gauge';

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';

export interface ChartOptions {
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
  smooth?: boolean;
  showDataLabels?: boolean;
}

export interface FilterConfig {
  id: string;
  column: string;
  type: FilterType;
  label: string;
  options?: string[];
  defaultValue?: any;
}

export type FilterType = 'select' | 'multiselect' | 'slider' | 'date' | 'search';

export interface LayoutConfig {
  layouts?: {
    lg?: LayoutItem[];
    md?: LayoutItem[];
    sm?: LayoutItem[];
    xs?: LayoutItem[];
  };
}

export interface LayoutItem {
  i: string; // chart id
  x: number;
  y: number;
  w: number; // width in grid units
  h: number; // height in grid units
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

export interface DashboardShare {
  id: string;
  dashboard_id: string;
  user_id: string;
  permission: 'view' | 'edit';
  created_at: string;
}

export interface ChartData {
  chart_type: ChartType;
  data: any[];
  config?: ChartConfig;
  message?: string;
}
