/**
 * Pipelines Page Component
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
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  PlayArrow,
  Pause,
  Edit,
  Delete,
  ContentCopy,
  AccountTree,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  DataObject,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { usePipelineStore } from '../stores/pipelineStore';
import type { PipelineResponse } from '../types/api';

export default function PipelinesPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineResponse | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Get pipelines from store
  const {
    pipelines,
    loading,
    error,
    fetchPipelines,
    createPipeline,
    deletePipeline,
    executePipeline,
    clearError,
  } = usePipelineStore();

  const [newPipeline, setNewPipeline] = useState({
    name: '',
    description: '',
  });

  // Fetch pipelines on mount
  useEffect(() => {
    fetchPipelines().catch((err) => {
      console.error('Failed to fetch pipelines:', err);
    });
  }, [fetchPipelines]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, pipeline: PipelineResponse) => {
    setAnchorEl(event.currentTarget);
    setSelectedPipeline(pipeline);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreatePipeline = async () => {
    if (!newPipeline.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Pipeline name is required',
        severity: 'error',
      });
      return;
    }

    try {
      const pipelineId = await createPipeline({
        name: newPipeline.name,
        description: newPipeline.description,
        nodes: [],
        edges: [],
      });

      setSnackbar({
        open: true,
        message: 'Pipeline created successfully',
        severity: 'success',
      });

      setCreateDialogOpen(false);
      setNewPipeline({ name: '', description: '' });

      // Navigate to pipeline builder to configure the new pipeline
      navigate(`/pipeline-builder?id=${pipelineId}`);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.data?.detail || err.message || 'Failed to create pipeline',
        severity: 'error',
      });
    }
  };

  const handleDeletePipeline = async () => {
    if (!selectedPipeline) return;

    try {
      await deletePipeline(selectedPipeline.id);
      setSnackbar({
        open: true,
        message: 'Pipeline deleted successfully',
        severity: 'success',
      });
      handleMenuClose();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.data?.detail || err.message || 'Failed to delete pipeline',
        severity: 'error',
      });
    }
  };

  const handleRunPipeline = async (pipelineId: string) => {
    try {
      await executePipeline(pipelineId);
      setSnackbar({
        open: true,
        message: 'Pipeline execution started',
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.data?.detail || err.message || 'Failed to start pipeline',
        severity: 'error',
      });
    }
  };

  const handleEditPipeline = (pipelineId: string) => {
    navigate(`/pipeline-builder?id=${pipelineId}`);
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
      case 'draft':
        return theme.palette.warning.main;
      case 'failed':
        return theme.palette.error.main;
      case 'completed':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'paused':
      case 'draft':
        return <Pause sx={{ fontSize: 16 }} />;
      case 'failed':
        return <ErrorIcon sx={{ fontSize: 16 }} />;
      default:
        return <Schedule sx={{ fontSize: 16 }} />;
    }
  };

  // Calculate stats from pipeline data
  const getPipelineStats = (pipeline: PipelineResponse) => {
    const nodes = pipeline.config?.nodes || [];
    const nodeCount = nodes.length;
    const extractorCount = nodes.filter((n: any) => n.type === 'extractor').length;
    const transformerCount = nodes.filter((n: any) => n.type === 'transformer').length;

    return {
      nodeCount,
      extractorCount,
      transformerCount,
    };
  };

  const filteredPipelines = pipelines.filter((pipeline) =>
    pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pipeline.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Error Snackbar */}
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
            Pipelines
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your ETL/ELT data pipelines
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ height: 'fit-content' }}
        >
          Create Pipeline
        </Button>
      </Box>

      {/* Search Bar */}
      <Card elevation={0} sx={{ mb: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search pipelines..."
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

      {/* Loading State */}
      {loading && pipelines.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && pipelines.length === 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Pipelines Grid */}
      {!loading && (
        <Grid container spacing={3}>
          {filteredPipelines.map((pipeline) => (
          <Grid item xs={12} md={6} lg={4} key={pipeline.id}>
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
                    icon={getStatusIcon(pipeline.status)}
                    label={pipeline.status.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: alpha(getStatusColor(pipeline.status), 0.1),
                      color: getStatusColor(pipeline.status),
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        color: getStatusColor(pipeline.status),
                      },
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, pipeline)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                {/* Pipeline Icon and Name */}
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
                    <AccountTree sx={{ fontSize: 28 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {pipeline.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(pipeline.created_at).toLocaleDateString()}
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
                  {pipeline.description || 'No description'}
                </Typography>

                {/* Stats */}
                {(() => {
                  const stats = getPipelineStats(pipeline);
                  return (
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Modules
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {stats.nodeCount}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Extractors
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {stats.extractorCount}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  );
                })()}

                {/* Footer Info */}
                <Box
                  sx={{
                    pt: 2,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Tooltip title="Transformers">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccountTree sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption">
                          {getPipelineStats(pipeline).transformerCount}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Run Pipeline">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleRunPipeline(pipeline.id)}
                      >
                        <PlayArrow />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Pipeline">
                      <IconButton
                        size="small"
                        onClick={() => handleEditPipeline(pipeline.id)}
                      >
                        <Edit />
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
      {!loading && filteredPipelines.length === 0 && !error && (
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
            py: 8,
          }}
        >
          <AccountTree sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No pipelines found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Get started by creating your first pipeline'}
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Pipeline
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
        <MenuItem
          onClick={() => {
            if (selectedPipeline) handleRunPipeline(selectedPipeline.id);
            handleMenuClose();
          }}
        >
          <PlayArrow sx={{ mr: 1 }} fontSize="small" />
          Run Now
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedPipeline) handleEditPipeline(selectedPipeline.id);
            handleMenuClose();
          }}
        >
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ContentCopy sx={{ mr: 1 }} fontSize="small" />
          Duplicate
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Pause sx={{ mr: 1 }} fontSize="small" />
          Pause
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeletePipeline();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Pipeline Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Pipeline</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Pipeline Name"
              value={newPipeline.name}
              onChange={(e) => setNewPipeline({ ...newPipeline, name: e.target.value })}
              placeholder="e.g., Customer Data ETL"
              autoFocus
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newPipeline.description}
              onChange={(e) => setNewPipeline({ ...newPipeline, description: e.target.value })}
              placeholder="Describe what this pipeline does..."
            />
            <Alert severity="info">
              After creating the pipeline, you'll be redirected to the Pipeline Builder to configure it with modules.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreatePipeline}
            disabled={!newPipeline.name.trim() || loading}
          >
            {loading ? 'Creating...' : 'Create & Configure'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
