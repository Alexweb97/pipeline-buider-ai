/**
 * Dashboards Page
 * Lists all dashboards with options to create, view, and manage
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../stores/dashboardStore';
import { DashboardCreate } from '../types/dashboard';

export const DashboardsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    dashboards,
    loading,
    error,
    fetchDashboards,
    createDashboard,
    deleteDashboard,
  } = useDashboardStore();

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
  }, [fetchDashboards]);

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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboards</h1>
              <p className="text-gray-600 mt-2">
                Create and manage your data visualization dashboards
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              + Create Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {dashboards.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No dashboards yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Create your first dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dashboard) => (
              <div
                key={dashboard.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {dashboard.name}
                  </h3>
                  {dashboard.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {dashboard.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>
                      {dashboard.config.charts?.length || 0} charts
                    </span>
                    <span>
                      {new Date(dashboard.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/dashboards/${dashboard.id}`)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/dashboards/${dashboard.id}/edit`)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dashboard.id)}
                      className="px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Create Dashboard
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newDashboard.name}
                  onChange={(e) =>
                    setNewDashboard({ ...newDashboard, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Dashboard"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newDashboard.description}
                  onChange={(e) =>
                    setNewDashboard({ ...newDashboard, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Dashboard description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pipeline ID *
                </label>
                <input
                  type="text"
                  value={newDashboard.pipeline_id}
                  onChange={(e) =>
                    setNewDashboard({ ...newDashboard, pipeline_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="UUID of the pipeline"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  value={newDashboard.theme}
                  onChange={(e) =>
                    setNewDashboard({ ...newDashboard, theme: e.target.value as 'light' | 'dark' })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newDashboard.name || !newDashboard.pipeline_id}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
