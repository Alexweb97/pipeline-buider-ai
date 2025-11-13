/**
 * Schedules Page Component
 */
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Stack,
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Schedule as ScheduleIcon,
  PlayArrow,
  Pause,
  CheckCircle,
  Error as ErrorIcon,
  AccessTime,
  CalendarToday,
  Repeat,
  Timer,
  TrendingUp,
  AccountTree,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import type { Schedule, ScheduleCreateData, ScheduleFrequency } from '../types/schedule';

export default function SchedulesPage() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Mock data
  const mockSchedules: Schedule[] = [
    {
      id: '1',
      name: 'Daily Customer Data Sync',
      description: 'Synchronizes customer data from production to warehouse every day at 2 AM',
      pipeline_id: 'pipeline_1',
      pipeline_name: 'Customer Data ETL',
      frequency: 'daily',
      status: 'active',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z',
      created_by: 'admin',
      next_run_at: '2024-01-21T02:00:00Z',
      last_run_at: '2024-01-20T02:00:00Z',
      total_runs: 145,
      successful_runs: 143,
      failed_runs: 2,
      timezone: 'UTC',
      config: {
        hour: 2,
        minute: 0,
        max_retries: 3,
        send_notifications: true,
      },
    },
    {
      id: '2',
      name: 'Hourly Sales Update',
      description: 'Updates sales analytics data every hour',
      pipeline_id: 'pipeline_2',
      pipeline_name: 'Sales Analytics Pipeline',
      frequency: 'hourly',
      status: 'active',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-20T12:00:00Z',
      created_by: 'admin',
      next_run_at: '2024-01-20T15:00:00Z',
      last_run_at: '2024-01-20T14:00:00Z',
      total_runs: 320,
      successful_runs: 318,
      failed_runs: 2,
      timezone: 'UTC',
      config: {
        minute: 0,
        max_retries: 2,
      },
    },
    {
      id: '3',
      name: 'Weekly Inventory Report',
      description: 'Generates comprehensive inventory reports every Monday',
      pipeline_id: 'pipeline_3',
      pipeline_name: 'Inventory Sync',
      frequency: 'weekly',
      status: 'active',
      created_at: '2024-01-05T08:00:00Z',
      updated_at: '2024-01-18T16:00:00Z',
      created_by: 'admin',
      next_run_at: '2024-01-22T08:00:00Z',
      last_run_at: '2024-01-15T08:00:00Z',
      total_runs: 12,
      successful_runs: 12,
      failed_runs: 0,
      timezone: 'UTC',
      config: {
        days_of_week: ['monday'],
        hour: 8,
        minute: 0,
      },
    },
    {
      id: '4',
      name: 'Monthly Financial Summary',
      description: 'Aggregates financial data on the first day of each month',
      pipeline_id: 'pipeline_1',
      pipeline_name: 'Customer Data ETL',
      frequency: 'monthly',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      created_by: 'admin',
      next_run_at: '2024-02-01T00:00:00Z',
      last_run_at: '2024-01-01T00:00:00Z',
      total_runs: 1,
      successful_runs: 1,
      failed_runs: 0,
      timezone: 'UTC',
      config: {
        day_of_month: 1,
        hour: 0,
        minute: 0,
      },
    },
    {
      id: '5',
      name: 'Custom ETL Schedule',
      description: 'Custom cron schedule for advanced ETL operations',
      pipeline_id: 'pipeline_2',
      pipeline_name: 'Sales Analytics Pipeline',
      frequency: 'custom',
      status: 'paused',
      created_at: '2023-12-20T15:00:00Z',
      updated_at: '2024-01-10T09:00:00Z',
      created_by: 'admin',
      next_run_at: '2024-01-21T12:00:00Z',
      last_run_at: '2024-01-18T12:00:00Z',
      total_runs: 45,
      successful_runs: 43,
      failed_runs: 2,
      cron_expression: '0 12 * * 1-5',
      timezone: 'UTC',
      config: {
        cron_expression: '0 12 * * 1-5',
        max_retries: 3,
      },
    },
  ];

  const [schedules] = useState<Schedule[]>(mockSchedules);
  const [newSchedule, setNewSchedule] = useState<Partial<ScheduleCreateData>>({
    name: '',
    description: '',
    pipeline_id: '',
    frequency: 'daily',
    timezone: 'UTC',
    config: {},
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateSchedule = () => {
    console.log('Creating schedule:', newSchedule);
    setCreateDialogOpen(false);
    setNewSchedule({
      name: '',
      description: '',
      pipeline_id: '',
      frequency: 'daily',
      timezone: 'UTC',
      config: {},
    });
  };

  const getStatusColor = (status: Schedule['status']) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'paused':
        return theme.palette.warning.main;
      case 'expired':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: Schedule['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'paused':
        return <Pause sx={{ fontSize: 16 }} />;
      case 'expired':
        return <ErrorIcon sx={{ fontSize: 16 }} />;
      default:
        return <ScheduleIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getFrequencyIcon = (frequency: ScheduleFrequency) => {
    switch (frequency) {
      case 'once':
        return <Timer />;
      case 'hourly':
        return <AccessTime />;
      case 'daily':
        return <CalendarToday />;
      case 'weekly':
      case 'monthly':
        return <Repeat />;
      case 'custom':
        return <ScheduleIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getFrequencyColor = (frequency: ScheduleFrequency) => {
    switch (frequency) {
      case 'once':
        return '#6b7280';
      case 'hourly':
        return '#3b82f6';
      case 'daily':
        return '#8b5cf6';
      case 'weekly':
        return '#10b981';
      case 'monthly':
        return '#f59e0b';
      case 'custom':
        return '#ec4899';
      default:
        return theme.palette.primary.main;
    }
  };

  const formatNextRun = (nextRunAt: string) => {
    const date = new Date(nextRunAt);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) return 'Overdue';
    if (hours < 1) return `in ${minutes}m`;
    if (hours < 24) return `in ${hours}h ${minutes}m`;

    const days = Math.floor(hours / 24);
    return `in ${days}d ${hours % 24}h`;
  };

  const getSuccessRate = (schedule: Schedule) => {
    if (schedule.total_runs === 0) return 100;
    return ((schedule.successful_runs / schedule.total_runs) * 100).toFixed(1);
  };

  const filteredSchedules = schedules.filter((schedule) =>
    schedule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schedule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schedule.pipeline_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalSchedules = schedules.length;
  const activeSchedules = schedules.filter(s => s.status === 'active').length;
  const pausedSchedules = schedules.filter(s => s.status === 'paused').length;
  const totalRuns = schedules.reduce((sum, s) => sum + s.total_runs, 0);
  const totalSuccessful = schedules.reduce((sum, s) => sum + s.successful_runs, 0);
  const overallSuccessRate = totalRuns > 0 ? ((totalSuccessful / totalRuns) * 100).toFixed(1) : '0';

  // Upcoming runs (next 5)
  const upcomingRuns = [...schedules]
    .filter(s => s.status === 'active')
    .sort((a, b) => new Date(a.next_run_at).getTime() - new Date(b.next_run_at).getTime())
    .slice(0, 5);

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Schedules
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and monitor your pipeline schedules
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ height: 'fit-content' }}
        >
          Create Schedule
        </Button>
      </Box>

      {/* Stats Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {totalSchedules}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Schedules
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {activeSchedules}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {pausedSchedules}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Paused
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {overallSuccessRate}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Success Rate
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Search Bar */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <TextField
                fullWidth
                placeholder="Search schedules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Runs */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Upcoming Runs
                </Typography>
              </Box>
              <List dense>
                {upcomingRuns.map((schedule) => (
                  <ListItem
                    key={schedule.id}
                    sx={{
                      px: 0,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {getFrequencyIcon(schedule.frequency)}
                    </ListItemIcon>
                    <ListItemText
                      primary={schedule.name}
                      secondary={formatNextRun(schedule.next_run_at)}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
                {upcomingRuns.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No upcoming runs
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Schedules Grid */}
      <Grid container spacing={3}>
        {filteredSchedules.map((schedule) => (
          <Grid item xs={12} md={6} lg={4} key={schedule.id}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent>
                {/* Header with Status and Menu */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Chip
                    icon={getStatusIcon(schedule.status)}
                    label={schedule.status.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: alpha(getStatusColor(schedule.status), 0.1),
                      color: getStatusColor(schedule.status),
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        color: getStatusColor(schedule.status),
                      },
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                {/* Schedule Icon and Name */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(getFrequencyColor(schedule.frequency), 0.1),
                      color: getFrequencyColor(schedule.frequency),
                    }}
                  >
                    {getFrequencyIcon(schedule.frequency)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {schedule.name}
                    </Typography>
                    <Chip
                      label={schedule.frequency.toUpperCase()}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        mt: 0.5,
                        bgcolor: alpha(getFrequencyColor(schedule.frequency), 0.1),
                        color: getFrequencyColor(schedule.frequency),
                      }}
                    />
                  </Box>
                </Box>

                {/* Description */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {schedule.description}
                </Typography>

                {/* Pipeline Info */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    mb: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountTree sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="caption" color="text.secondary">
                      Pipeline:
                    </Typography>
                    <Typography variant="caption" fontWeight="600">
                      {schedule.pipeline_name}
                    </Typography>
                  </Box>
                </Paper>

                {/* Next Run */}
                <Box
                  sx={{
                    p: 1.5,
                    mb: 2,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Next Run
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTime sx={{ fontSize: 16, color: 'info.main' }} />
                    <Typography variant="body2" fontWeight="600">
                      {formatNextRun(schedule.next_run_at)}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(schedule.next_run_at).toLocaleString()}
                  </Typography>
                </Box>

                {/* Stats */}
                <Box
                  sx={{
                    pt: 2,
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Total Runs
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {schedule.total_runs}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Success
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {schedule.successful_runs}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Failed
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="error.main">
                          {schedule.failed_runs}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Success Rate */}
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" color="text.secondary">
                      Success Rate:
                    </Typography>
                    <Typography variant="caption" fontWeight="bold" color="success.main">
                      {getSuccessRate(schedule)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredSchedules.length === 0 && (
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
            py: 8,
          }}
        >
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No schedules found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Get started by creating your first schedule'}
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Schedule
            </Button>
          )}
        </Card>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <PlayArrow sx={{ mr: 1 }} fontSize="small" />
          Run Now
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Pause sx={{ mr: 1 }} fontSize="small" />
          Pause
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Schedule Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Schedule</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Schedule Name"
              value={newSchedule.name}
              onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
              placeholder="e.g., Daily Customer Sync"
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={newSchedule.description}
              onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
              placeholder="Describe this schedule..."
            />
            <FormControl fullWidth>
              <InputLabel>Pipeline</InputLabel>
              <Select
                value={newSchedule.pipeline_id}
                label="Pipeline"
                onChange={(e) => setNewSchedule({ ...newSchedule, pipeline_id: e.target.value })}
              >
                <MenuItem value="pipeline_1">Customer Data ETL</MenuItem>
                <MenuItem value="pipeline_2">Sales Analytics Pipeline</MenuItem>
                <MenuItem value="pipeline_3">Inventory Sync</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={newSchedule.frequency}
                label="Frequency"
                onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value as ScheduleFrequency })}
              >
                <MenuItem value="once">Once</MenuItem>
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="custom">Custom (Cron)</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Schedule timing details will be configured in the next step
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateSchedule}
            disabled={!newSchedule.name || !newSchedule.pipeline_id}
          >
            Next: Configure Timing
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
