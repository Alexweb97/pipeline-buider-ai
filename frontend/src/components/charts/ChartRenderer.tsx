/**
 * ChartRenderer Component
 * Dynamically renders the appropriate chart component based on chart type
 */
import React from 'react';
import { ChartConfig, ChartType } from '../../types/dashboard';
import {
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  ScatterChart,
  KPICard,
  DataTable,
} from './index';

interface ChartRendererProps {
  type: ChartType;
  data: any[];
  config: ChartConfig;
  height?: number;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  type,
  data,
  config,
  height = 300,
}) => {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Render the appropriate chart based on type
  switch (type) {
    case 'bar':
      return <BarChart data={data} config={config} height={height} />;

    case 'line':
      return <LineChart data={data} config={config} height={height} />;

    case 'pie':
      return <PieChart data={data} config={config} height={height} />;

    case 'area':
      return <AreaChart data={data} config={config} height={height} />;

    case 'scatter':
      return <ScatterChart data={data} config={config} height={height} />;

    case 'kpi':
      return <KPICard data={data} config={config} height={height} />;

    case 'table':
      return <DataTable data={data} config={config} height={height} />;

    case 'gauge':
      // Gauge chart not yet implemented - fallback to KPI
      return <KPICard data={data} config={config} height={height} />;

    default:
      return (
        <div className="w-full h-full flex items-center justify-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Chart type "{type}" not supported</p>
        </div>
      );
  }
};
