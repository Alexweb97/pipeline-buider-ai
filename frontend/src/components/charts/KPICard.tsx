/**
 * KPICard Component
 * Renders a Key Performance Indicator card
 */
import React from 'react';
import { ChartConfig } from '../../types/dashboard';

interface KPICardProps {
  data: any[];
  config: ChartConfig;
  height?: number;
}

export const KPICard: React.FC<KPICardProps> = ({ data, config }) => {
  // Extract the KPI value - assume first item in data array
  const value = data.length > 0 ? data[0][config.yAxis || 'value'] : 0;

  // Format the value
  const formattedValue = typeof value === 'number'
    ? value.toLocaleString()
    : value;

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm font-medium text-gray-600 mb-2 text-center">
        {config.title}
      </h3>
      <div className="text-4xl font-bold text-blue-600 mb-2">
        {formattedValue}
      </div>
      {config.description && (
        <p className="text-xs text-gray-500 text-center">{config.description}</p>
      )}
    </div>
  );
};
