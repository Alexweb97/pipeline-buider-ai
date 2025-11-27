/**
 * ScatterChart Component
 * Renders a scatter chart using Recharts library
 */
import React from 'react';
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import { ChartConfig } from '../../types/dashboard';

interface ScatterChartProps {
  data: any[];
  config: ChartConfig;
  height?: number;
}

export const ScatterChart: React.FC<ScatterChartProps> = ({ data, config, height = 300 }) => {
  const { xAxis, yAxis, options } = config;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      {config.description && (
        <p className="text-sm text-gray-600 mb-4">{config.description}</p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsScatterChart
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {options?.showGrid !== false && (
            <CartesianGrid strokeDasharray="3 3" />
          )}
          <XAxis dataKey={xAxis} name={xAxis} />
          <YAxis dataKey={yAxis} name={yAxis} />
          <ZAxis range={[60, 400]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          {options?.showLegend !== false && <Legend />}
          <Scatter
            name={config.title}
            data={data}
            fill={options?.colors?.[0] || '#8884d8'}
          />
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
