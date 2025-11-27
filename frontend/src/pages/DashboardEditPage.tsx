/**
 * DashboardEdit Page
 * Edit dashboard configuration and add/remove charts
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  useTheme,
  alpha,
  Divider,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Delete,
  Save,
  Visibility,
} from '@mui/icons-material';
import { useDashboardStore } from '../stores/dashboardStore';
import { ChartConfig, ChartType } from '../types/dashboard';
import DashboardLayout from '../components/DashboardLayout';

// Generate a simple unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const chartTypes: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
  { value: 'table', label: 'Data Table' },
  { value: 'kpi', label: 'KPI Card' },
];

export const DashboardEditPage: React.FC = () => {
  const theme = useTheme();
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const navigate = useNavigate();
  const {
    currentDashboard,
    loading,
    error,
    fetchDashboard,
    updateDashboard,
  } = useDashboardStore();

  const [showAddChartModal, setShowAddChartModal] = useState(false);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [dashboardInfo, setDashboardInfo] = useState({
    name: '',
    description: '',
    theme: 'light' as 'light' | 'dark',
    refreshInterval: 30,
  });

  const [newChart, setNewChart] = useState<Partial<ChartConfig>>({
    type: 'bar',
    title: '',
    description: '',
    xAxis: 'x',
    yAxis: 'y',
    options: {
      showLegend: true,
      showGrid: true,
      showDataLabels: false,
    },
  });

  useEffect(() => {
    if (dashboardId) {
      fetchDashboard(dashboardId);
    }
  }, [dashboardId, fetchDashboard]);

  useEffect(() => {
    if (currentDashboard) {
      setDashboardInfo({
        name: currentDashboard.name,
        description: currentDashboard.description || '',
        theme: currentDashboard.theme,
        refreshInterval: currentDashboard.config.refreshInterval || 30,
      });
      setCharts(currentDashboard.config.charts || []);
    }
  }, [currentDashboard]);

  const handleAddChart = () => {
    if (!newChart.title) {
      return;
    }

    const chart: ChartConfig = {
      id: generateId(),
      type: newChart.type as ChartType,
      title: newChart.title,
      description: newChart.description,
      xAxis: newChart.xAxis || 'x',
      yAxis: newChart.yAxis || 'y',
      options: newChart.options,
    };

    setCharts([...charts, chart]);
    setShowAddChartModal(false);
    setNewChart({
      type: 'bar',
      title: '',
      description: '',
      xAxis: 'x',
      yAxis: 'y',
      options: {
        showLegend: true,
        showGrid: true,
        showDataLabels: false,
      },
    });
  };

  const handleDeleteChart = (chartId: string) => {
    setCharts(charts.filter((c) => c.id !== chartId));
  };

  const handleSave = async () => {
    if (!dashboardId) return;

    try {
      await updateDashboard(dashboardId, {
        name: dashboardInfo.name,
        description: dashboardInfo.description,
        theme: dashboardInfo.theme,
        config: {
          charts,
          refreshInterval: dashboardInfo.refreshInterval,
        },
      });
      // Reload the dashboard to get fresh data
      await fetchDashboard(dashboardId);
      navigate(`/dashboards/${dashboardId}`);
    } catch (err) {
      console.error('Failed to update dashboard:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Loading dashboard...
            </Typography>
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !currentDashboard) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Box sx={{ textAlign: 'center' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/dashboards')}
            >
              Back to Dashboards
            </Button>
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/dashboards/${dashboardId}`)}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold">
            Edit Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => navigate(`/dashboards/${dashboardId}`)}
            >
              Preview
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Dashboard Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Dashboard Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dashboard Name"
                value={dashboardInfo.name}
                onChange={(e) =>
                  setDashboardInfo({ ...dashboardInfo, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={dashboardInfo.theme}
                  label="Theme"
                  onChange={(e) =>
                    setDashboardInfo({ ...dashboardInfo, theme: e.target.value as 'light' | 'dark' })
                  }
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Refresh Interval (seconds)"
                value={dashboardInfo.refreshInterval}
                onChange={(e) =>
                  setDashboardInfo({ ...dashboardInfo, refreshInterval: parseInt(e.target.value) || 30 })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={dashboardInfo.description}
                onChange={(e) =>
                  setDashboardInfo({ ...dashboardInfo, description: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Charts ({charts.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowAddChartModal(true)}
            >
              Add Chart
            </Button>
          </Box>

          {charts.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                border: `2px dashed ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No charts configured yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setShowAddChartModal(true)}
                sx={{ mt: 2 }}
              >
                Add Your First Chart
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {charts.map((chart) => (
                <Grid item xs={12} md={6} key={chart.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      '&:hover': {
                        boxShadow: theme.shadows[2],
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {chart.title}
                          </Typography>
                          <Chip
                            label={chart.type.toUpperCase()}
                            size="small"
                            color="primary"
                            sx={{ mb: 1 }}
                          />
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteChart(chart.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                      {chart.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {chart.description}
                        </Typography>
                      )}
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        X-Axis: {chart.xAxis} | Y-Axis: {chart.yAxis}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Add Chart Modal */}
      <Dialog
        open={showAddChartModal}
        onClose={() => setShowAddChartModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Chart</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Chart Title"
              value={newChart.title}
              onChange={(e) =>
                setNewChart({ ...newChart, title: e.target.value })
              }
              placeholder="Sales by Region"
              autoFocus
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={newChart.description}
              onChange={(e) =>
                setNewChart({ ...newChart, description: e.target.value })
              }
              placeholder="Chart description..."
            />
            <FormControl fullWidth required>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={newChart.type}
                label="Chart Type"
                onChange={(e) =>
                  setNewChart({ ...newChart, type: e.target.value as ChartType })
                }
              >
                {chartTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="X-Axis Column"
                  value={newChart.xAxis}
                  onChange={(e) =>
                    setNewChart({ ...newChart, xAxis: e.target.value })
                  }
                  placeholder="date"
                  helperText="Column name from pipeline data"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Y-Axis Column"
                  value={newChart.yAxis}
                  onChange={(e) =>
                    setNewChart({ ...newChart, yAxis: e.target.value })
                  }
                  placeholder="value"
                  helperText="Column name from pipeline data"
                />
              </Grid>
            </Grid>
            <Alert severity="info">
              Make sure the column names match the data structure from your pipeline execution.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddChartModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddChart}
            disabled={!newChart.title}
          >
            Add Chart
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};
