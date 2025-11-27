/**
 * DashboardGrid Component
 * Renders a responsive grid of dashboard charts using react-grid-layout
 */
import React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Box, Card, CardContent, Typography, useTheme, alpha } from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
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
  const theme = useTheme();
  const { config, layout } = dashboard;
  const charts = config.charts || [];

  // Handle layout change
  const handleLayoutChange = (currentLayout: Layout[], _allLayouts: any) => {
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
    <Box sx={{ width: '100%' }}>
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
          <div key={chart.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {editable && (
                <Box
                  className="drag-handle"
                  sx={{
                    cursor: 'move',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    px: 2,
                    py: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    ☰ Drag to move
                  </Typography>
                </Box>
              )}
              <CardContent sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
                <ChartRenderer
                  type={chart.type}
                  data={dashboardData[chart.id] || []}
                  config={chart}
                  height={250}
                />
              </CardContent>
            </Card>
          </div>
        ))}
      </ResponsiveGridLayout>

      {charts.length === 0 && (
        <Card
          elevation={0}
          sx={{
            border: `2px dashed ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            textAlign: 'center',
            py: 8,
          }}
        >
          <DashboardIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No charts configured
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add charts to your dashboard to start visualizing data
          </Typography>
        </Card>
      )}
    </Box>
  );
};
