/**
 * Schedules Page Component
 */
import { useState, useEffect } from 'react';
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
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  PlayArrow,
  Pause,
  Delete,
  Schedule,
  CheckCircle,
  Error as ErrorIcon,
  AccessTime,
  Sync,
  Cloud,
  CloudOff,
  Repeat,
  AccountTree,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useScheduleStore } from '../stores/scheduleStore';
import { usePipelineStore } from '../stores/pipelineStore';
import type {
  Schedule as ScheduleType,
  ScheduleFrequency,
  ScheduleStatus,
  ScheduleCreateData,
  DayOfWeek,
} from '../types/schedule';

const FREQUENCY_OPTIONS: { value: ScheduleFrequency; label: string }[] = [
  { value: 'once', label: 'Once' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom (Cron)' },
];

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
];

export default function SchedulesPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | ''>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Get schedules from store
  const {
    schedules,
    stats,
    loading,
    error,
    fetchSchedules,
    fetchStats,
    createSchedule,
    deleteSchedule,
    toggleStatus,
    triggerSchedule,
    syncToAirflow,
    clearError,
  } = useScheduleStore();

  // Get pipelines for the dropdown
  const { pipelines, fetchPipelines } = usePipelineStore();

  // Form state
  const [newSchedule, setNewSchedule] = useState<{
    name: string;
    description: string;
    pipeline_id: string;
    frequency: ScheduleFrequency;
    timezone: string;
    config: {
      minute: number;
      hour: number;
      days_of_week: DayOfWeek[];
      day_of_month: number;
      cron_expression: string;
    };
  }>({
    name: '',
    description: '',
    pipeline_id: '',
    frequency: 'daily',
    timezone: 'UTC',
    config: {
      minute: 0,
      hour: 0,
      days_of_week: ['monday'],
      day_of_month: 1,
      cron_expression: '0 0 * * *',
    },
  });

  // Fetch data on mount
  useEffect(() => {
    fetchSchedules().catch(console.error);
    fetchStats().catch(console.error);
    fetchPipelines().catch(console.error);
  }, [fetchSchedules, fetchStats, fetchPipelines]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, schedule: ScheduleType) => {
    setAnchorEl(event.currentTarget);
    setSelectedSchedule(schedule);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Don't clear selectedSchedule immediately to allow pending operations to use it
    // It will be reset on next menu open
  };

  const handleCreateSchedule = async () => {
    if (!newSchedule.name.trim() || !newSchedule.pipeline_id) {
      setSnackbar({
        open: true,
        message: 'Schedule name and pipeline are required',
        severity: 'error',
      });
      return;
    }

    try {
      const data: ScheduleCreateData = {
        name: newSchedule.name,
        description: newSchedule.description,
        pipeline_id: newSchedule.pipeline_id,
        frequency: newSchedule.frequency,
        timezone: newSchedule.timezone,
        config: newSchedule.config,
      };

      await createSchedule(data);
      setSnackbar({
        open: true,
        message: 'Schedule created successfully',
        severity: 'success',
      });
      setCreateDialogOpen(false);
      resetForm();
      fetchStats();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.data?.detail || err.message || 'Failed to create schedule',
        severity: 'error',
      });
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return;

    try {
      await deleteSchedule(selectedSchedule.id);
      setSnackbar({
        open: true,
        message: 'Schedule deleted successfully',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      handleMenuClose();
      fetchStats();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.data?.detail || err.message || 'Failed to delete schedule',
        severity: 'error',
      });
    }
  };

  const handleToggleStatus = async (schedule: ScheduleType) => {
    const newStatus: ScheduleStatus = schedule.status === 'active' ? 'paused' : 'active';
    try {
      await toggleStatus(schedule.id, newStatus);
      setSnackbar({
        open: true,
        message: `Schedule ${newStatus === 'active' ? 'activated' : 'paused'}`,
        severity: 'success',
      });
      fetchStats();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.data?.detail || err.message || 'Failed to toggle status',
        severity: 'error',
      });
    }
  };

  const handleTriggerNow = async (scheduleId: string) => {
    // Close menu first to avoid anchorEl reference issues on re-render
    handleMenuClose();
    try {
      await triggerSchedule(scheduleId);
      setSnackbar({
        open: true,
        message: 'Schedule triggered successfully',
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.data?.detail || err.message || 'Failed to trigger schedule',
        severity: 'error',
      });
    }
  };

  const handleSyncAirflow = async (scheduleId: string) => {
    // Close menu first to avoid anchorEl reference issues on re-render
    handleMenuClose();
    try {
      await syncToAirflow(scheduleId);
      setSnackbar({
        open: true,
        message: 'Schedule synced to Airflow',
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.data?.detail || err.message || 'Failed to sync to Airflow',
        severity: 'error',
      });
    }
  };

  const resetForm = () => {
    setNewSchedule({
      name: '',
      description: '',
      pipeline_id: '',
      frequency: 'daily',
      timezone: 'UTC',
      config: {
        minute: 0,
        hour: 0,
        days_of_week: ['monday'],
        day_of_month: 1,
        cron_expression: '0 0 * * *',
      },
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
    clearError();
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'paused':
        return <Pause sx={{ fontSize: 16 }} />;
      case 'expired':
        return <ErrorIcon sx={{ fontSize: 16 }} />;
      default:
        return <Schedule sx={{ fontSize: 16 }} />;
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const option = FREQUENCY_OPTIONS.find((f) => f.value === frequency);
    return option?.label || frequency;
  };

  const formatNextRun = (nextRunAt: string | undefined) => {
    if (!nextRunAt) return 'Not scheduled';
    const date = new Date(nextRunAt);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff < 0) return 'Overdue';
    if (diff < 3600000) return `In ${Math.round(diff / 60000)} min`;
    if (diff < 86400000) return `In ${Math.round(diff / 3600000)} hours`;
    return date.toLocaleDateString();
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (schedule.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || schedule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Schedules
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Automate your pipeline executions with schedules
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

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Total Schedules
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.total_schedules}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Active
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {stats.active_schedules}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Runs Today
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.runs_today}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Success Rate
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {stats.success_rate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filter */}
      <Card elevation={0} sx={{ mb: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              sx={{ flex: 1, minWidth: 200 }}
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
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as ScheduleStatus | '')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && schedules.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && schedules.length === 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Schedules Grid */}
      {!loading && (
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
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
                      {schedule.is_airflow_synced ? (
                        <Tooltip title="Synced to Airflow">
                          <Cloud sx={{ color: 'success.main', fontSize: 20 }} />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Not synced to Airflow">
                          <CloudOff sx={{ color: 'text.disabled', fontSize: 20 }} />
                        </Tooltip>
                      )}
                    </Box>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, schedule)}>
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
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        color: 'warning.main',
                      }}
                    >
                      <Schedule sx={{ fontSize: 28 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {schedule.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {schedule.pipeline_name || 'No pipeline'}
                      </Typography>
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
                      minHeight: '40px',
                    }}
                  >
                    {schedule.description || 'No description'}
                  </Typography>

                  {/* Schedule Info */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Repeat sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{getFrequencyLabel(schedule.frequency)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{formatNextRun(schedule.next_run_at)}</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Stats */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      p: 1.5,
                      bgcolor: alpha(theme.palette.grey[500], 0.05),
                      borderRadius: 1,
                      mb: 2,
                    }}
                  >
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {schedule.total_runs}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {schedule.successful_runs}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Success
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" color="error.main">
                        {schedule.failed_runs}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Failed
                      </Typography>
                    </Box>
                  </Box>

                  {/* Footer */}
                  <Box
                    sx={{
                      pt: 2,
                      borderTop: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={schedule.status === 'active'}
                          onChange={() => handleToggleStatus(schedule)}
                          size="small"
                          disabled={schedule.status === 'expired'}
                        />
                      }
                      label={schedule.status === 'active' ? 'Active' : 'Paused'}
                    />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Run Now">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleTriggerNow(schedule.id)}
                        >
                          <PlayArrow />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Pipeline">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/pipeline-builder?id=${schedule.pipeline_id}`)}
                        >
                          <AccountTree />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {!loading && filteredSchedules.length === 0 && !error && (
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
            py: 8,
          }}
        >
          <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No schedules found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery || statusFilter
              ? 'Try adjusting your filters'
              : 'Get started by creating your first schedule'}
          </Typography>
          {!searchQuery && !statusFilter && (
            <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>
              Create Schedule
            </Button>
          )}
        </Card>
      )}

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            if (selectedSchedule) handleTriggerNow(selectedSchedule.id);
          }}
        >
          <PlayArrow sx={{ mr: 1 }} fontSize="small" />
          Run Now
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedSchedule) handleToggleStatus(selectedSchedule);
            handleMenuClose();
          }}
        >
          {selectedSchedule?.status === 'active' ? (
            <>
              <Pause sx={{ mr: 1 }} fontSize="small" />
              Pause
            </>
          ) : (
            <>
              <PlayArrow sx={{ mr: 1 }} fontSize="small" />
              Activate
            </>
          )}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedSchedule) handleSyncAirflow(selectedSchedule.id);
          }}
        >
          <Sync sx={{ mr: 1 }} fontSize="small" />
          Sync to Airflow
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Schedule Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Schedule</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Schedule Name"
              value={newSchedule.name}
              onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
              placeholder="e.g., Daily Sales Report"
              autoFocus
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={newSchedule.description}
              onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
              placeholder="Describe what this schedule does..."
            />
            <FormControl fullWidth>
              <InputLabel>Pipeline</InputLabel>
              <Select
                value={newSchedule.pipeline_id}
                label="Pipeline"
                onChange={(e) => setNewSchedule({ ...newSchedule, pipeline_id: e.target.value })}
              >
                {pipelines.map((pipeline) => (
                  <MenuItem key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={newSchedule.frequency}
                label="Frequency"
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, frequency: e.target.value as ScheduleFrequency })
                }
              >
                {FREQUENCY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Frequency-specific options */}
            {newSchedule.frequency === 'hourly' && (
              <TextField
                fullWidth
                type="number"
                label="Minute of Hour"
                value={newSchedule.config.minute}
                onChange={(e) =>
                  setNewSchedule({
                    ...newSchedule,
                    config: { ...newSchedule.config, minute: parseInt(e.target.value) || 0 },
                  })
                }
                inputProps={{ min: 0, max: 59 }}
                helperText="0-59"
              />
            )}

            {(newSchedule.frequency === 'daily' || newSchedule.frequency === 'weekly') && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  type="number"
                  label="Hour"
                  value={newSchedule.config.hour}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      config: { ...newSchedule.config, hour: parseInt(e.target.value) || 0 },
                    })
                  }
                  inputProps={{ min: 0, max: 23 }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  type="number"
                  label="Minute"
                  value={newSchedule.config.minute}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      config: { ...newSchedule.config, minute: parseInt(e.target.value) || 0 },
                    })
                  }
                  inputProps={{ min: 0, max: 59 }}
                  sx={{ flex: 1 }}
                />
              </Box>
            )}

            {newSchedule.frequency === 'weekly' && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Days of Week
                </Typography>
                <ToggleButtonGroup
                  value={newSchedule.config.days_of_week}
                  onChange={(_, newDays) =>
                    setNewSchedule({
                      ...newSchedule,
                      config: { ...newSchedule.config, days_of_week: newDays || [] },
                    })
                  }
                  size="small"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <ToggleButton key={day.value} value={day.value}>
                      {day.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            )}

            {newSchedule.frequency === 'monthly' && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  type="number"
                  label="Day of Month"
                  value={newSchedule.config.day_of_month}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      config: { ...newSchedule.config, day_of_month: parseInt(e.target.value) || 1 },
                    })
                  }
                  inputProps={{ min: 1, max: 31 }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  type="number"
                  label="Hour"
                  value={newSchedule.config.hour}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      config: { ...newSchedule.config, hour: parseInt(e.target.value) || 0 },
                    })
                  }
                  inputProps={{ min: 0, max: 23 }}
                  sx={{ flex: 1 }}
                />
              </Box>
            )}

            {newSchedule.frequency === 'custom' && (
              <TextField
                fullWidth
                label="Cron Expression"
                value={newSchedule.config.cron_expression}
                onChange={(e) =>
                  setNewSchedule({
                    ...newSchedule,
                    config: { ...newSchedule.config, cron_expression: e.target.value },
                  })
                }
                placeholder="0 0 * * *"
                helperText="Format: minute hour day-of-month month day-of-week"
              />
            )}

            <Alert severity="info">
              The schedule will run based on UTC timezone. Airflow integration will be available after creation.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateDialogOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateSchedule}
            disabled={!newSchedule.name.trim() || !newSchedule.pipeline_id || loading}
          >
            {loading ? 'Creating...' : 'Create Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Schedule</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedSchedule?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteSchedule}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
