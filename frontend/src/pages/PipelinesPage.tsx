/**
 * Pipelines Page Component
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
  Tooltip,
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
import DashboardLayout from '../components/DashboardLayout';
import type { Pipeline, PipelineCreateData } from '../types/pipeline';

export default function PipelinesPage() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Mock data - sera remplacé par des vraies données du backend
  const mockPipelines: Pipeline[] = [
    {
      id: '1',
      name: 'Customer Data ETL',
      description: 'Extract customer data from MySQL, transform and load to PostgreSQL',
      type: 'etl',
      status: 'active',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z',
      created_by: 'admin',
      last_run_at: '2024-01-20T14:30:00Z',
      next_run_at: '2024-01-21T14:30:00Z',
      total_runs: 145,
      success_rate: 98.5,
      source_count: 2,
      transformation_count: 5,
    },
    {
      id: '2',
      name: 'Sales Analytics Pipeline',
      description: 'Real-time sales data streaming and analytics',
      type: 'streaming',
      status: 'active',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-20T12:00:00Z',
      created_by: 'admin',
      last_run_at: '2024-01-20T12:00:00Z',
      total_runs: 320,
      success_rate: 99.2,
      source_count: 3,
      transformation_count: 8,
    },
    {
      id: '3',
      name: 'Inventory Sync',
      description: 'Daily inventory synchronization from warehouse system',
      type: 'elt',
      status: 'paused',
      created_at: '2024-01-05T08:00:00Z',
      updated_at: '2024-01-18T16:00:00Z',
      created_by: 'admin',
      last_run_at: '2024-01-18T08:00:00Z',
      total_runs: 78,
      success_rate: 95.8,
      source_count: 1,
      transformation_count: 3,
    },
  ];

  const [pipelines] = useState<Pipeline[]>(mockPipelines);
  const [newPipeline, setNewPipeline] = useState<PipelineCreateData>({
    name: '',
    description: '',
    type: 'etl',
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreatePipeline = () => {
    // TODO: Implémenter la création de pipeline
    console.log('Creating pipeline:', newPipeline);
    setCreateDialogOpen(false);
    setNewPipeline({ name: '', description: '', type: 'etl' });
  };

  const getStatusColor = (status: Pipeline['status']) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'paused':
        return theme.palette.warning.main;
      case 'failed':
        return theme.palette.error.main;
      case 'completed':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: Pipeline['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'paused':
        return <Pause sx={{ fontSize: 16 }} />;
      case 'failed':
        return <ErrorIcon sx={{ fontSize: 16 }} />;
      default:
        return <Schedule sx={{ fontSize: 16 }} />;
    }
  };

  const filteredPipelines = pipelines.filter((pipeline) =>
    pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pipeline.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
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

      {/* Pipelines Grid */}
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
                    onClick={(e) => handleMenuOpen(e)}
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
                    <Chip
                      label={pipeline.type.toUpperCase()}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem', mt: 0.5 }}
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
                  {pipeline.description}
                </Typography>

                {/* Stats */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Runs
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {pipeline.total_runs}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Success Rate
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {pipeline.success_rate}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

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
                    <Tooltip title="Data Sources">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DataObject sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption">{pipeline.source_count}</Typography>
                      </Box>
                    </Tooltip>
                    <Tooltip title="Transformations">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccountTree sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption">{pipeline.transformation_count}</Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Run Pipeline">
                      <IconButton size="small" color="primary">
                        <PlayArrow />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Pipeline">
                      <IconButton size="small">
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

      {/* Empty State */}
      {filteredPipelines.length === 0 && (
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
        <MenuItem onClick={handleMenuClose}>
          <PlayArrow sx={{ mr: 1 }} fontSize="small" />
          Run Now
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
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
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
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
            <FormControl fullWidth>
              <InputLabel>Pipeline Type</InputLabel>
              <Select
                value={newPipeline.type}
                label="Pipeline Type"
                onChange={(e) => setNewPipeline({ ...newPipeline, type: e.target.value as any })}
              >
                <MenuItem value="etl">ETL (Extract, Transform, Load)</MenuItem>
                <MenuItem value="elt">ELT (Extract, Load, Transform)</MenuItem>
                <MenuItem value="streaming">Real-time Streaming</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreatePipeline}
            disabled={!newPipeline.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
