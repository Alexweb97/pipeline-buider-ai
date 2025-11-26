/**
 * AreaChart Component
 * Renders an area chart using Recharts library
 */
import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartConfig } from '../../types/dashboard';

interface AreaChartProps {
  data: any[];
  config: ChartConfig;
  height?: number;
}

export const AreaChart: React.FC<AreaChartProps> = ({ data, config, height = 300 }) => {
  const { xAxis = 'x', yAxis = 'y', options } = config;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      {config.description && (
        <p className="text-sm text-gray-600 mb-4">{config.description}</p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart
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
          <Area
            type={options?.smooth ? 'monotone' : 'linear'}
            dataKey={yAxis}
            stroke={options?.colors?.[0] || '#8884d8'}
            fill={options?.colors?.[0] || '#8884d8'}
            fillOpacity={0.6}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};
