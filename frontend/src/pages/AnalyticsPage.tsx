/**
 * Analytics Page
 * Displays pipeline execution analytics, metrics, and trends
 */
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  Error as ErrorIcon,
  PlayArrow,
  Timer,
} from '@mui/icons-material';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { usePipelineStore } from '../stores/pipelineStore';

// Status-specific colors
const STATUS_COLORS: Record<string, string> = {
  success: '#10b981',    // green
  failed: '#ef4444',     // red
  running: '#3b82f6',    // blue
  pending: '#f59e0b',    // orange
  cancelled: '#8b5cf6',  // purple
};

export default function AnalyticsPage() {
  const theme = useTheme();
  const { analytics, loading, error, fetchAnalytics } = useAnalyticsStore();
  const { pipelines, fetchPipelines } = usePipelineStore();

  const [selectedPipeline, setSelectedPipeline] = useState<string>('all');
  const [period, setPeriod] = useState<number>(30);

  useEffect(() => {
    fetchPipelines();
  }, [fetchPipelines]);

  useEffect(() => {
    const params = {
      days: period,
      ...(selectedPipeline !== 'all' && { pipeline_id: selectedPipeline }),
    };
    fetchAnalytics(params);
  }, [fetchAnalytics, period, selectedPipeline]);

  // Format duration in human readable format
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  // KPI Card Component
  const KPICard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color: string;
  }) => (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        height: '100%',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(color, 0.1),
              color: color,
              mr: 2,
            }}
          >
            <Icon />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading && !analytics) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Loading analytics...
            </Typography>
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <Alert severity="info">No analytics data available</Alert>
      </DashboardLayout>
    );
  }

  // Prepare chart data
  const trendData = analytics.execution_trends.map((trend) => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Total: trend.total,
    Success: trend.success,
    Failed: trend.failed,
  }));

  const statusData = analytics.status_distribution.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    status: item.status.toLowerCase(),
  }));

  const performanceData = analytics.pipeline_performance
    .sort((a, b) => b.execution_count - a.execution_count)
    .slice(0, 10)
    .map((perf) => ({
      name: perf.pipeline_name.length > 20
        ? perf.pipeline_name.substring(0, 20) + '...'
        : perf.pipeline_name,
      executions: perf.execution_count,
      avgDuration: perf.avg_duration_seconds,
      successRate: perf.success_rate,
    }));

  return (
    <DashboardLayout>
      {/* Header with Filters */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Pipeline execution metrics and performance insights
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Pipeline</InputLabel>
              <Select
                value={selectedPipeline}
                label="Pipeline"
                onChange={(e) => setSelectedPipeline(e.target.value)}
              >
                <MenuItem value="all">All Pipelines</MenuItem>
                {pipelines.map((pipeline) => (
                  <MenuItem key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                label="Period"
                onChange={(e) => setPeriod(Number(e.target.value))}
              >
                <MenuItem value={7}>Last 7 days</MenuItem>
                <MenuItem value={30}>Last 30 days</MenuItem>
                <MenuItem value={90}>Last 90 days</MenuItem>
                <MenuItem value={365}>Last year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      {/* KPIs Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Executions"
            value={analytics.total_executions}
            icon={TrendingUp}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Success Rate"
            value={`${analytics.success_rate.toFixed(1)}%`}
            subtitle={`${analytics.successful_executions} successful`}
            icon={CheckCircle}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Failed Executions"
            value={analytics.failed_executions}
            icon={ErrorIcon}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Avg Duration"
            value={formatDuration(analytics.avg_duration_seconds)}
            icon={Timer}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Execution Trends */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Execution Trends
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Daily execution counts over time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Total" stroke={theme.palette.primary.main} strokeWidth={2} />
                  <Line type="monotone" dataKey="Success" stroke={theme.palette.success.main} strokeWidth={2} />
                  <Line type="monotone" dataKey="Failed" stroke={theme.palette.error.main} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Breakdown by execution status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Pipeline Performance */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Pipelines by Execution Count
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Most frequently executed pipelines
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="executions" fill={theme.palette.primary.main} name="Executions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Table */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pipeline Performance Details
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '12px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="subtitle2" color="text.secondary">Pipeline</Typography>
                      </th>
                      <th style={{ textAlign: 'right', padding: '12px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="subtitle2" color="text.secondary">Executions</Typography>
                      </th>
                      <th style={{ textAlign: 'right', padding: '12px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="subtitle2" color="text.secondary">Avg Duration</Typography>
                      </th>
                      <th style={{ textAlign: 'right', padding: '12px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="subtitle2" color="text.secondary">Success Rate</Typography>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.pipeline_performance.slice(0, 10).map((perf, index) => (
                      <tr key={index}>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <Typography variant="body2">{perf.pipeline_name}</Typography>
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <Typography variant="body2">{perf.execution_count}</Typography>
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <Typography variant="body2">{formatDuration(perf.avg_duration_seconds)}</Typography>
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <Chip
                            label={`${perf.success_rate.toFixed(1)}%`}
                            size="small"
                            color={perf.success_rate >= 90 ? 'success' : perf.success_rate >= 70 ? 'warning' : 'error'}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
