/**
 * Test page to debug module loading
 */
import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Card, CardContent } from '@mui/material';
import { usePipelineStore } from '../stores/pipelineStore';
import { mapModulesToDefinitions } from '../utils/moduleMapper';

export const TestModulesPage: React.FC = () => {
  const { modules, loading, error, fetchModulesByType } = usePipelineStore();
  const [testError, setTestError] = useState<string | null>(null);
  const [rawModules, setRawModules] = useState<any>(null);

  useEffect(() => {
    const loadModules = async () => {
      try {
        console.log('[TestModules] Starting to fetch modules...');
        await fetchModulesByType();
        console.log('[TestModules] Modules fetched successfully');
      } catch (err: any) {
        console.error('[TestModules] Error fetching modules:', err);
        setTestError(err.message || 'Unknown error');
      }
    };

    loadModules();
  }, []);

  useEffect(() => {
    if (modules.length > 0) {
      console.log('[TestModules] Modules loaded:', modules);
      setRawModules(modules);
    }
  }, [modules]);

  const moduleDefinitions = modules.length > 0 ? mapModulesToDefinitions(modules) : [];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Module Loading Test Page
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Status:</Typography>
        <Typography>Loading: {loading ? 'Yes' : 'No'}</Typography>
        <Typography>Modules Count: {modules.length}</Typography>
        <Typography>Error: {error || 'None'}</Typography>
        <Typography>Test Error: {testError || 'None'}</Typography>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress />
          <Typography>Loading modules...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Store Error: {error}
        </Alert>
      )}

      {testError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Test Error: {testError}
        </Alert>
      )}

      {modules.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Raw Modules from API ({modules.length}):
          </Typography>
          <Box sx={{ mb: 3 }}>
            {modules.map((module) => (
              <Card key={module.id} sx={{ mb: 1 }}>
                <CardContent>
                  <Typography variant="subtitle2">
                    {module.display_name} ({module.type})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {module.description}
                  </Typography>
                  <Typography variant="caption" display="block">
                    ID: {module.id} | Name: {module.name}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Mapped Module Definitions ({moduleDefinitions.length}):
          </Typography>
          <Box sx={{ mb: 3 }}>
            {moduleDefinitions.map((module) => (
              <Card key={module.id} sx={{ mb: 1 }}>
                <CardContent>
                  <Typography variant="subtitle2">
                    {module.name} ({module.type})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {module.description}
                  </Typography>
                  <Typography variant="caption" display="block">
                    ID: {module.id} | Category: {module.category} | Color: {module.color}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}

      {!loading && modules.length === 0 && !error && (
        <Alert severity="warning">
          No modules loaded. This could mean:
          <ul>
            <li>The API is not responding</li>
            <li>The modules are not seeded in the database</li>
            <li>There's a CORS issue</li>
            <li>The fetch is not being triggered</li>
          </ul>
        </Alert>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Debug Info:</Typography>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
          {JSON.stringify({
            loading,
            error,
            testError,
            modulesCount: modules.length,
            apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
            rawModulesPreview: rawModules ? rawModules.slice(0, 2) : null
          }, null, 2)}
        </pre>
      </Box>
    </Box>
  );
};

export default TestModulesPage;
