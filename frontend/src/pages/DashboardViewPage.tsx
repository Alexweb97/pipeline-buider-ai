/**
 * DashboardView Page
 * Displays a dashboard with all its charts
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Refresh,
  Edit,
} from '@mui/icons-material';
import { useDashboardStore } from '../stores/dashboardStore';
import { DashboardGrid } from '../components/dashboards/DashboardGrid';
import DashboardLayout from '../components/DashboardLayout';

export const DashboardViewPage: React.FC = () => {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const navigate = useNavigate();
  const {
    currentDashboard,
    dashboardData,
    loading,
    error,
    fetchDashboard,
    fetchDashboardData,
  } = useDashboardStore();

  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (dashboardId) {
      fetchDashboard(dashboardId);
      fetchDashboardData(dashboardId);
    }
  }, [dashboardId, fetchDashboard, fetchDashboardData]);

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh || !dashboardId || !currentDashboard?.config.refreshInterval) {
      return;
    }

    const interval = setInterval(() => {
      fetchDashboardData(dashboardId);
    }, currentDashboard.config.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, dashboardId, currentDashboard, fetchDashboardData]);

  const handleRefresh = () => {
    if (dashboardId) {
      fetchDashboardData(dashboardId);
    }
  };

  const handleEdit = () => {
    if (dashboardId) {
      navigate(`/dashboards/${dashboardId}/edit`);
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

  if (error) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
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

  if (!currentDashboard) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Dashboard not found
            </Typography>
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
          onClick={() => navigate('/dashboards')}
          sx={{ mb: 2 }}
        >
          Back to Dashboards
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {currentDashboard.name}
            </Typography>
            {currentDashboard.description && (
              <Typography variant="body1" color="text.secondary">
                {currentDashboard.description}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Auto-refresh toggle */}
            {currentDashboard.config.refreshInterval && (
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    Auto-refresh ({currentDashboard.config.refreshInterval}s)
                  </Typography>
                }
              />
            )}

            {/* Refresh button */}
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>

            {/* Edit button */}
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Dashboard Content */}
      <Box>
        <DashboardGrid
          dashboard={currentDashboard}
          dashboardData={(dashboardData || {}) as Record<string, any[]>}
          editable={false}
        />
      </Box>
    </DashboardLayout>
  );
};
