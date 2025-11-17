/**
 * Node Preview Modal - Displays output data from a node
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { Close, Refresh } from '@mui/icons-material';
import { PipelineNode } from '../types/pipelineBuilder';
import DataPreview from './DataPreview';
import { apiClient } from '../api/client';

interface NodePreviewModalProps {
  open: boolean;
  onClose: () => void;
  node: PipelineNode;
  nodes: PipelineNode[];
  edges: any[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`preview-tabpanel-${index}`}
      aria-labelledby={`preview-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function NodePreviewModal({
  open,
  onClose,
  node,
  nodes,
  edges,
}: NodePreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);

    try {
      // Remove onPreview callbacks from nodes before sending to backend
      const cleanNode = {
        ...node,
        data: {
          ...node.data,
          onPreview: undefined,
        },
      };

      const cleanNodes = nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onPreview: undefined,
        },
      }));

      // Build the pipeline path up to this node
      const response: any = await apiClient.post(
        `/api/v1/pipelines/preview-node/${node.id}`,
        {
          node: cleanNode,
          nodes: cleanNodes,
          edges,
        }
      );

      setPreviewData(response.data);
    } catch (err: any) {
      console.error('Preview error:', err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          'Failed to fetch preview data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPreview();
    }
  }, [open, node.id]);

  const handleRefresh = () => {
    fetchPreview();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div">
              Node Output Preview
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {node.data.moduleName} - {node.data.label}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleRefresh} disabled={loading}>
            <Refresh />
          </IconButton>
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            aria-label="preview tabs"
          >
            <Tab label="Output Data" />
            <Tab label="Info" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3, height: 'calc(100% - 48px)', overflow: 'auto' }}>
          {/* Loading State */}
          {loading && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 2,
              }}
            >
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Executing pipeline up to this node...
              </Typography>
            </Box>
          )}

          {/* Error State */}
          {!loading && error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Preview Failed
              </Typography>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          )}

          {/* Preview Data */}
          {!loading && !error && previewData && (
            <>
              <TabPanel value={activeTab} index={0}>
                <DataPreview preview={previewData} />
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Node Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Module:</strong> {node.data.moduleName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Label:</strong> {node.data.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Node ID:</strong> {node.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Type:</strong> {node.type}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Configuration
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        bgcolor: 'grey.100',
                        p: 2,
                        borderRadius: 1,
                        overflow: 'auto',
                        fontSize: '0.875rem',
                      }}
                    >
                      {JSON.stringify(node.data.config, null, 2)}
                    </Box>
                  </Box>
                </Box>
              </TabPanel>
            </>
          )}

          {/* No Data */}
          {!loading && !error && !previewData && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No preview data available
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
