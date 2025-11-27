/**
 * DataTable Component
 * Renders a data table
 */
import React from 'react';
import { ChartConfig } from '../../types/dashboard';

interface DataTableProps {
  data: any[];
  config: ChartConfig;
  height?: number;
}

export const DataTable: React.FC<DataTableProps> = ({ data, config, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full p-4">
        <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Get column names from first data item
  const columns = Object.keys(data[0]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      {config.description && (
        <p className="text-sm text-gray-600 mb-4">{config.description}</p>
      )}
      <div className="overflow-auto" style={{ maxHeight: height }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
