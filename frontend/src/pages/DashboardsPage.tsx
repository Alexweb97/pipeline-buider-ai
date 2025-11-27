/**
 * Dashboards Page
 * Lists all dashboards with options to create, view, and manage
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
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
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import {
  Add,
  Visibility,
  Edit,
  Delete,
  BarChart,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useDashboardStore } from '../stores/dashboardStore';
import { usePipelineStore } from '../stores/pipelineStore';
import { DashboardCreate } from '../types/dashboard';
import DashboardLayout from '../components/DashboardLayout';

export const DashboardsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    dashboards,
    loading,
    error,
    fetchDashboards,
    createDashboard,
    deleteDashboard,
  } = useDashboardStore();

  const { pipelines, fetchPipelines } = usePipelineStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDashboard, setNewDashboard] = useState<Partial<DashboardCreate>>({
    name: '',
    description: '',
    pipeline_id: '',
    theme: 'light',
    config: {},
    layout: {},
  });

  useEffect(() => {
    fetchDashboards();
    fetchPipelines();
  }, [fetchDashboards, fetchPipelines]);

  const handleCreate = async () => {
    if (!newDashboard.name || !newDashboard.pipeline_id) {
      return;
    }

    try {
      const dashboard = await createDashboard(newDashboard as DashboardCreate);
      setShowCreateModal(false);
      setNewDashboard({
        name: '',
        description: '',
        pipeline_id: '',
        theme: 'light',
        config: {},
        layout: {},
      });
      navigate(`/dashboards/${dashboard.id}`);
    } catch (err) {
      console.error('Failed to create dashboard:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dashboard?')) {
      await deleteDashboard(id);
    }
  };

  if (loading && dashboards.length === 0) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Loading dashboards...
            </Typography>
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Dashboards
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage your data visualization dashboards
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowCreateModal(true)}
          sx={{ height: 'fit-content' }}
        >
          Create Dashboard
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Dashboard Grid */}
      {dashboards.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
            py: 8,
          }}
        >
          <DashboardIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No dashboards yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Get started by creating your first dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Dashboard
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {dashboards.map((dashboard) => (
            <Grid item xs={12} md={6} lg={4} key={dashboard.id}>
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
                  {/* Dashboard Icon and Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
                      <BarChart sx={{ fontSize: 28 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {dashboard.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(dashboard.updated_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  {dashboard.description && (
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
                      {dashboard.description}
                    </Typography>
                  )}

                  {/* Stats */}
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={`${dashboard.config.charts?.length || 0} charts`}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={dashboard.theme}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: 'info.main',
                      }}
                    />
                  </Box>

                  {/* Actions */}
                  <Box
                    sx={{
                      pt: 2,
                      borderTop: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/dashboards/${dashboard.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => navigate(`/dashboards/${dashboard.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(dashboard.id)}
                      sx={{ ml: 1 }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Modal */}
      <Dialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Dashboard</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={newDashboard.name}
              onChange={(e) =>
                setNewDashboard({ ...newDashboard, name: e.target.value })
              }
              placeholder="My Dashboard"
              autoFocus
              required
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newDashboard.description}
              onChange={(e) =>
                setNewDashboard({ ...newDashboard, description: e.target.value })
              }
              placeholder="Dashboard description..."
            />
            <FormControl fullWidth required>
              <InputLabel>Pipeline</InputLabel>
              <Select
                value={newDashboard.pipeline_id}
                label="Pipeline"
                onChange={(e) =>
                  setNewDashboard({ ...newDashboard, pipeline_id: e.target.value })
                }
              >
                {pipelines.length === 0 ? (
                  <MenuItem disabled>No pipelines available</MenuItem>
                ) : (
                  pipelines.map((pipeline) => (
                    <MenuItem key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {pipelines.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  No pipelines available. Please create a pipeline first.
                </Typography>
              )}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                value={newDashboard.theme}
                label="Theme"
                onChange={(e) =>
                  setNewDashboard({ ...newDashboard, theme: e.target.value as 'light' | 'dark' })
                }
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!newDashboard.name || !newDashboard.pipeline_id}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};
