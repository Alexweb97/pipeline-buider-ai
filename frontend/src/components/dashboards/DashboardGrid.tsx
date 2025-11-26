/**
 * DashboardGrid Component
 * Renders a responsive grid of dashboard charts using react-grid-layout
 */
import React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Dashboard, ChartConfig } from '../../types/dashboard';
import { ChartRenderer } from '../charts/ChartRenderer';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  dashboard: Dashboard;
  dashboardData: Record<string, any[]>;
  editable?: boolean;
  onLayoutChange?: (layouts: { lg: Layout[] }) => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  dashboard,
  dashboardData,
  editable = false,
  onLayoutChange,
}) => {
  const { config, layout } = dashboard;
  const charts = config.charts || [];

  // Handle layout change
  const handleLayoutChange = (currentLayout: Layout[], allLayouts: any) => {
    if (editable && onLayoutChange) {
      onLayoutChange({ lg: currentLayout });
    }
  };

  // Generate layouts from dashboard layout config
  const layouts = layout.layouts || {
    lg: charts.map((chart, index) => ({
      i: chart.id,
      x: (index % 3) * 4,
      y: Math.floor(index / 3) * 4,
      w: 4,
      h: 4,
      minW: 2,
      minH: 2,
    })),
  };

  return (
    <div className="w-full">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={80}
        isDraggable={editable}
        isResizable={editable}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
      >
        {charts.map((chart: ChartConfig) => (
          <div
            key={chart.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-hidden"
          >
            {editable && (
              <div className="drag-handle cursor-move bg-gray-100 -mx-4 -mt-4 mb-2 px-4 py-2 border-b border-gray-200">
                <span className="text-xs text-gray-500">☰ Drag to move</span>
              </div>
            )}
            <ChartRenderer
              type={chart.type}
              data={dashboardData[chart.id] || []}
              config={chart}
              height={250}
            />
          </div>
        ))}
      </ResponsiveGridLayout>

      {charts.length === 0 && (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <p className="text-gray-500 mb-2">No charts configured</p>
            {editable && (
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                + Add Chart
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
