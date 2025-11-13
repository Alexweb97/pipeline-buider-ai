/**
 * Analytics Page Component
 */
import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  useTheme,
  alpha,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Error as ErrorIcon,
  Storage,
  DataUsage,
  Schedule,
  Assessment,
  Warning,
  Timer,
  AccountTree,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import type { TimeRange, PipelinePerformance, RecentError } from '../types/analytics';

export default function AnalyticsPage() {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  // Mock data
  const overviewMetrics = {
    total_pipelines: 8,
    total_runs: 1245,
    total_runs_change: 12.5,
    successful_runs: 1189,
    failed_runs: 56,
    success_rate: 95.5,
    success_rate_change: 2.3,
    avg_execution_time: 342, // seconds
    avg_execution_time_change: -8.2,
    total_data_processed: 45.6, // GB
    total_data_processed_change: 18.9,
    active_schedules: 12,
    data_sources_connected: 6,
  };

  const pipelinePerformance: PipelinePerformance[] = [
    {
      pipeline_id: '1',
      pipeline_name: 'Customer Data ETL',
      total_runs: 145,
      successful_runs: 143,
      failed_runs: 2,
      success_rate: 98.6,
      avg_execution_time: 245,
      total_data_processed: 12.5,
      last_run_at: '2024-01-20T14:30:00Z',
      status: 'healthy',
    },
    {
      pipeline_id: '2',
      pipeline_name: 'Sales Analytics Pipeline',
      total_runs: 320,
      successful_runs: 318,
      failed_runs: 2,
      success_rate: 99.4,
      avg_execution_time: 180,
      total_data_processed: 8.3,
      last_run_at: '2024-01-20T14:00:00Z',
      status: 'healthy',
    },
    {
      pipeline_id: '3',
      pipeline_name: 'Inventory Sync',
      total_runs: 78,
      successful_runs: 70,
      failed_runs: 8,
      success_rate: 89.7,
      avg_execution_time: 420,
      total_data_processed: 15.2,
      last_run_at: '2024-01-18T08:00:00Z',
      status: 'warning',
    },
    {
      pipeline_id: '4',
      pipeline_name: 'Product Data Import',
      total_runs: 234,
      successful_runs: 198,
      failed_runs: 36,
      success_rate: 84.6,
      avg_execution_time: 512,
      total_data_processed: 6.8,
      last_run_at: '2024-01-20T12:00:00Z',
      status: 'critical',
    },
  ];

  const recentErrors: RecentError[] = [
    {
      id: '1',
      pipeline_id: '4',
      pipeline_name: 'Product Data Import',
      error_type: 'Connection Timeout',
      error_message: 'Database connection timeout after 30 seconds',
      occurred_at: '2024-01-20T14:25:00Z',
      severity: 'high',
    },
    {
      id: '2',
      pipeline_id: '3',
      pipeline_name: 'Inventory Sync',
      error_type: 'Data Validation',
      error_message: 'Invalid data format in column "quantity"',
      occurred_at: '2024-01-20T13:15:00Z',
      severity: 'medium',
    },
    {
      id: '3',
      pipeline_id: '1',
      pipeline_name: 'Customer Data ETL',
      error_type: 'Memory Error',
      error_message: 'Out of memory while processing large dataset',
      occurred_at: '2024-01-20T10:00:00Z',
      severity: 'critical',
    },
  ];

  const errorsByType = [
    { error_type: 'Connection Timeout', count: 23, percentage: 41 },
    { error_type: 'Data Validation', count: 15, percentage: 27 },
    { error_type: 'Memory Error', count: 10, percentage: 18 },
    { error_type: 'Authentication Failed', count: 8, percentage: 14 },
  ];

  const getStatusColor = (status: PipelinePerformance['status']) => {
    switch (status) {
      case 'healthy':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'critical':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: PipelinePerformance['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle sx={{ fontSize: 20 }} />;
      case 'warning':
        return <Warning sx={{ fontSize: 20 }} />;
      case 'critical':
        return <ErrorIcon sx={{ fontSize: 20 }} />;
      default:
        return <Assessment sx={{ fontSize: 20 }} />;
    }
  };

  const getSeverityColor = (severity: RecentError['severity']) => {
    switch (severity) {
      case 'critical':
        return theme.palette.error.main;
      case 'high':
        return theme.palette.error.light;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const formatBytes = (bytes: number) => {
    return `${bytes.toFixed(1)} GB`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor performance and insights across your pipelines
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(_, value) => value && setTimeRange(value)}
          size="small"
        >
          <ToggleButton value="24h">24h</ToggleButton>
          <ToggleButton value="7d">7d</ToggleButton>
          <ToggleButton value="30d">30d</ToggleButton>
          <ToggleButton value="90d">90d</ToggleButton>
          <ToggleButton value="all">All</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Runs */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              border: `1px solid ${theme.palette.divider}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                  }}
                >
                  <Assessment sx={{ fontSize: 28 }} />
                </Box>
                <Chip
                  icon={<TrendingUp sx={{ fontSize: 16 }} />}
                  label={`+${overviewMetrics.total_runs_change}%`}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: theme.palette.success.main },
                  }}
                />
              </Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {overviewMetrics.total_runs.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Pipeline Runs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Success Rate */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                  }}
                >
                  <CheckCircle sx={{ fontSize: 28 }} />
                </Box>
                <Chip
                  icon={<TrendingUp sx={{ fontSize: 16 }} />}
                  label={`+${overviewMetrics.success_rate_change}%`}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: theme.palette.success.main },
                  }}
                />
              </Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {overviewMetrics.success_rate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Success Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Avg Execution Time */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: 'info.main',
                  }}
                >
                  <Timer sx={{ fontSize: 28 }} />
                </Box>
                <Chip
                  icon={<TrendingDown sx={{ fontSize: 16 }} />}
                  label={`${Math.abs(overviewMetrics.avg_execution_time_change)}%`}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: theme.palette.success.main },
                  }}
                />
              </Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {formatDuration(overviewMetrics.avg_execution_time)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Execution Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Processed */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: 'secondary.main',
                  }}
                >
                  <Storage sx={{ fontSize: 28 }} />
                </Box>
                <Chip
                  icon={<TrendingUp sx={{ fontSize: 16 }} />}
                  label={`+${overviewMetrics.total_data_processed_change}%`}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: theme.palette.success.main },
                  }}
                />
              </Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {formatBytes(overviewMetrics.total_data_processed)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Data Processed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Pipeline Performance */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Pipeline Performance
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Performance metrics for each pipeline
              </Typography>

              <Stack spacing={2}>
                {pipelinePerformance.map((pipeline) => (
                  <Paper
                    key={pipeline.pipeline_id}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(getStatusColor(pipeline.status), 0.1),
                            color: getStatusColor(pipeline.status),
                          }}
                        >
                          <AccountTree />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {pipeline.pipeline_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last run: {formatTimeAgo(pipeline.last_run_at)}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        icon={getStatusIcon(pipeline.status)}
                        label={pipeline.status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(pipeline.status), 0.1),
                          color: getStatusColor(pipeline.status),
                          fontWeight: 600,
                          '& .MuiChip-icon': { color: getStatusColor(pipeline.status) },
                        }}
                      />
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Total Runs
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {pipeline.total_runs}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Success Rate
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {pipeline.success_rate}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Avg Time
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {formatDuration(pipeline.avg_execution_time)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Data Processed
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {formatBytes(pipeline.total_data_processed)}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Success Rate Progress Bar */}
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Success: {pipeline.successful_runs}
                        </Typography>
                        <Typography variant="caption" color="error.main">
                          Failed: {pipeline.failed_runs}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pipeline.success_rate}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getStatusColor(pipeline.status),
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Error Analysis */}
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ErrorIcon sx={{ mr: 1, color: 'error.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Error Analysis
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Errors by type in the last {timeRange}
                </Typography>

                <Stack spacing={2}>
                  {errorsByType.map((error, index) => (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight="600">
                          {error.error_type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {error.count} ({error.percentage}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={error.percentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: theme.palette.error.main,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Recent Errors */}
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Errors
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Latest pipeline failures
                </Typography>

                <List disablePadding>
                  {recentErrors.map((error, index) => (
                    <Box key={error.id}>
                      <ListItem
                        sx={{
                          px: 0,
                          py: 1.5,
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                          <Chip
                            label={error.severity.toUpperCase()}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              bgcolor: alpha(getSeverityColor(error.severity), 0.1),
                              color: getSeverityColor(error.severity),
                              fontWeight: 600,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeAgo(error.occurred_at)}
                          </Typography>
                        </Box>
                        <ListItemText
                          primary={error.pipeline_name}
                          secondary={
                            <>
                              <Typography component="span" variant="caption" fontWeight="600" color="error.main">
                                {error.error_type}
                              </Typography>
                              <br />
                              <Typography component="span" variant="caption" color="text.secondary">
                                {error.error_message}
                              </Typography>
                            </>
                          }
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                        />
                      </ListItem>
                      {index < recentErrors.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Stats
                </Typography>

                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Active Schedules
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {overviewMetrics.active_schedules}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DataUsage sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Data Sources
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {overviewMetrics.data_sources_connected}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Successful Runs
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {overviewMetrics.successful_runs}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ErrorIcon sx={{ fontSize: 20, color: 'error.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Failed Runs
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="error.main">
                      {overviewMetrics.failed_runs}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
