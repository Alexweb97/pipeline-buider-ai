/**
 * PieChart Component
 * Renders a pie chart using Recharts library
 */
import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartConfig } from '../../types/dashboard';

interface PieChartProps {
  data: any[];
  config: ChartConfig;
  height?: number;
}

const DEFAULT_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF6B6B',
];

export const PieChart: React.FC<PieChartProps> = ({ data, config, height = 300 }) => {
  const { xAxis, yAxis, options } = config;
  const colors = options?.colors || DEFAULT_COLORS;

  // Transform data for pie chart
  const pieData = data.map((item) => ({
    name: item[xAxis || 'name'],
    value: item[yAxis || 'value'],
  }));

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      {config.description && (
        <p className="text-sm text-gray-600 mb-4">{config.description}</p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={options?.showDataLabels !== false}
            label={options?.showDataLabels !== false ? (entry) => entry.name : undefined}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          {options?.showLegend !== false && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
