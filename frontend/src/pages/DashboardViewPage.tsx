/**
 * DashboardView Page
 * Displays a dashboard with all its charts
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../stores/dashboardStore';
import { DashboardGrid } from '../components/dashboards/DashboardGrid';

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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboards')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Dashboards
          </button>
        </div>
      </div>
    );
  }

  if (!currentDashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Dashboard not found</p>
          <button
            onClick={() => navigate('/dashboards')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Dashboards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/dashboards')}
                className="text-gray-600 hover:text-gray-900 mb-2 flex items-center text-sm"
              >
                ← Back to Dashboards
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentDashboard.name}
              </h1>
              {currentDashboard.description && (
                <p className="text-gray-600 mt-1">{currentDashboard.description}</p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Auto-refresh toggle */}
              {currentDashboard.config.refreshInterval && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    Auto-refresh ({currentDashboard.config.refreshInterval}s)
                  </span>
                </label>
              )}

              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Refresh
              </button>

              {/* Edit button */}
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardGrid
          dashboard={currentDashboard}
          dashboardData={dashboardData || {}}
          editable={false}
        />
      </div>
    </div>
  );
};
