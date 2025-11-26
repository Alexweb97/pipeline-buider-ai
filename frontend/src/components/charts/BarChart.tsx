/**
 * BarChart Component
 * Renders a bar chart using Recharts library
 */
import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartConfig } from '../../types/dashboard';

interface BarChartProps {
  data: any[];
  config: ChartConfig;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, config, height = 300 }) => {
  const { xAxis, yAxis, options } = config;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      {config.description && (
        <p className="text-sm text-gray-600 mb-4">{config.description}</p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {options?.showGrid !== false && (
            <CartesianGrid strokeDasharray="3 3" />
          )}
          <XAxis dataKey={xAxis} />
          <YAxis />
          <Tooltip />
          {options?.showLegend !== false && <Legend />}
          <Bar
            dataKey={yAxis}
            fill={options?.colors?.[0] || '#8884d8'}
            label={options?.showDataLabels ? { position: 'top' } : undefined}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
