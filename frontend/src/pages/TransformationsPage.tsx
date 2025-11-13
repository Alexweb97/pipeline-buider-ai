/**
 * Transformations Page Component
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
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  FilterAlt,
  Transform,
  Functions,
  Merge,
  Sort,
  FilterList,
  Code,
  CheckCircle,
  DataObject,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import type { Transformation, TransformationCreateData, TransformationType, TransformationCategory } from '../types/transformation';

export default function TransformationsPage() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterCategory, setFilterCategory] = useState<TransformationCategory | 'all'>('all');

  // Mock data
  const mockTransformations: Transformation[] = [
    {
      id: '1',
      name: 'Customer Email Validation',
      type: 'validate',
      category: 'data_quality',
      description: 'Validates customer email addresses and filters invalid entries',
      status: 'active',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z',
      created_by: 'user_123',
      used_in_pipelines: 5,
      config: {
        validation_rules: ['email_format', 'domain_check'],
      },
      is_reusable: true,
      tags: ['validation', 'email', 'quality'],
    },
    {
      id: '2',
      name: 'Sales Data Aggregation',
      type: 'aggregate',
      category: 'data_shaping',
      description: 'Aggregates sales data by region and time period',
      status: 'active',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-18T16:00:00Z',
      created_by: 'user_123',
      used_in_pipelines: 3,
      config: {
        group_by: ['region', 'month'],
        aggregations: {
          total_sales: 'sum',
          avg_order_value: 'avg',
        },
      },
      is_reusable: true,
      tags: ['aggregation', 'sales', 'analytics'],
    },
    {
      id: '3',
      name: 'Remove Duplicate Records',
      type: 'deduplicate',
      category: 'data_quality',
      description: 'Removes duplicate entries based on unique identifiers',
      status: 'active',
      created_at: '2024-01-05T08:00:00Z',
      updated_at: '2024-01-12T11:00:00Z',
      created_by: 'user_456',
      used_in_pipelines: 7,
      config: {
        keys: ['customer_id', 'transaction_id'],
        keep: 'first',
      },
      is_reusable: true,
      tags: ['deduplication', 'quality'],
    },
    {
      id: '4',
      name: 'Product Price Filter',
      type: 'filter',
      category: 'data_shaping',
      description: 'Filters products based on price range and availability',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      created_by: 'user_789',
      used_in_pipelines: 2,
      config: {
        conditions: [
          { field: 'price', operator: '>', value: 0 },
          { field: 'in_stock', operator: '==', value: true },
        ],
      },
      is_reusable: true,
      tags: ['filter', 'products'],
    },
    {
      id: '5',
      name: 'Join Customer Orders',
      type: 'join',
      category: 'data_enrichment',
      description: 'Joins customer data with order history',
      status: 'active',
      created_at: '2023-12-20T15:00:00Z',
      updated_at: '2024-01-10T09:00:00Z',
      created_by: 'user_123',
      used_in_pipelines: 4,
      config: {
        left_key: 'customer_id',
        right_key: 'customer_id',
        join_type: 'left',
      },
      is_reusable: true,
      tags: ['join', 'enrichment'],
    },
    {
      id: '6',
      name: 'Custom Python Transform',
      type: 'custom',
      category: 'custom',
      description: 'Custom Python script for advanced data transformation',
      status: 'draft',
      created_at: '2024-01-20T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z',
      created_by: 'user_456',
      used_in_pipelines: 0,
      config: {
        language: 'python',
        code: 'def transform(data): return data',
      },
      is_reusable: false,
      tags: ['custom', 'python'],
    },
  ];

  const [transformations] = useState<Transformation[]>(mockTransformations);
  const [newTransformation, setNewTransformation] = useState<Partial<TransformationCreateData>>({
    name: '',
    type: 'filter',
    category: 'data_shaping',
    description: '',
    config: {},
    is_reusable: true,
    tags: [],
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateTransformation = () => {
    console.log('Creating transformation:', newTransformation);
    setCreateDialogOpen(false);
    setNewTransformation({
      name: '',
      type: 'filter',
      category: 'data_shaping',
      description: '',
      config: {},
      is_reusable: true,
      tags: [],
    });
  };

  const getTypeIcon = (type: TransformationType) => {
    switch (type) {
      case 'filter':
        return <FilterAlt />;
      case 'map':
        return <Transform />;
      case 'aggregate':
        return <Functions />;
      case 'join':
        return <Merge />;
      case 'sort':
        return <Sort />;
      case 'deduplicate':
        return <FilterList />;
      case 'custom':
        return <Code />;
      default:
        return <DataObject />;
    }
  };

  const getTypeColor = (type: TransformationType) => {
    switch (type) {
      case 'filter':
        return '#3b82f6';
      case 'map':
        return '#8b5cf6';
      case 'aggregate':
        return '#10b981';
      case 'join':
        return '#f59e0b';
      case 'sort':
        return '#6366f1';
      case 'deduplicate':
        return '#ec4899';
      case 'validate':
        return '#14b8a6';
      case 'custom':
        return '#6b7280';
      default:
        return theme.palette.primary.main;
    }
  };

  const getCategoryColor = (category: TransformationCategory) => {
    switch (category) {
      case 'data_quality':
        return theme.palette.success.main;
      case 'data_shaping':
        return theme.palette.primary.main;
      case 'data_enrichment':
        return theme.palette.secondary.main;
      case 'custom':
        return theme.palette.grey[600];
      default:
        return theme.palette.grey[500];
    }
  };

  const getCategoryLabel = (category: TransformationCategory) => {
    switch (category) {
      case 'data_quality':
        return 'Data Quality';
      case 'data_shaping':
        return 'Data Shaping';
      case 'data_enrichment':
        return 'Data Enrichment';
      case 'custom':
        return 'Custom';
      default:
        return category;
    }
  };

  const filteredTransformations = transformations.filter((transformation) => {
    const matchesSearch =
      transformation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transformation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transformation.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transformation.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || transformation.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Transformations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage reusable data transformations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ height: 'fit-content' }}
        >
          New Transformation
        </Button>
      </Box>

      {/* Search and Filter Bar */}
      <Card elevation={0} sx={{ mb: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search transformations..."
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
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Category"
                  onChange={(e) => setFilterCategory(e.target.value as TransformationCategory | 'all')}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="data_quality">Data Quality</MenuItem>
                  <MenuItem value="data_shaping">Data Shaping</MenuItem>
                  <MenuItem value="data_enrichment">Data Enrichment</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {transformations.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {transformations.filter(t => t.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="secondary.main">
              {transformations.filter(t => t.is_reusable).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reusable
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {transformations.reduce((sum, t) => sum + t.used_in_pipelines, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Uses
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Transformations Grid */}
      <Grid container spacing={3}>
        {filteredTransformations.map((transformation) => (
          <Grid item xs={12} md={6} lg={4} key={transformation.id}>
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
                    icon={<CheckCircle sx={{ fontSize: 16 }} />}
                    label={transformation.status.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: alpha(
                        transformation.status === 'active' ? theme.palette.success.main : theme.palette.grey[500],
                        0.1
                      ),
                      color: transformation.status === 'active' ? 'success.main' : 'text.secondary',
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        color: transformation.status === 'active' ? theme.palette.success.main : theme.palette.grey[500],
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

                {/* Type Icon and Name */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(getTypeColor(transformation.type), 0.1),
                      color: getTypeColor(transformation.type),
                    }}
                  >
                    {getTypeIcon(transformation.type)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {transformation.name}
                    </Typography>
                    <Chip
                      label={transformation.type.toUpperCase()}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        mt: 0.5,
                        bgcolor: alpha(getTypeColor(transformation.type), 0.1),
                        color: getTypeColor(transformation.type),
                      }}
                    />
                  </Box>
                </Box>

                {/* Category */}
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={getCategoryLabel(transformation.category)}
                    size="small"
                    sx={{
                      bgcolor: alpha(getCategoryColor(transformation.category), 0.1),
                      color: getCategoryColor(transformation.category),
                      fontWeight: 500,
                    }}
                  />
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
                  {transformation.description}
                </Typography>

                {/* Tags */}
                {transformation.tags.length > 0 && (
                  <Box sx={{ mb: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {transformation.tags.slice(0, 3).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          bgcolor: alpha(theme.palette.grey[500], 0.1),
                        }}
                      />
                    ))}
                  </Box>
                )}

                {/* Stats */}
                <Box
                  sx={{
                    pt: 2,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Used in Pipelines
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {transformation.used_in_pipelines}
                    </Typography>
                  </Box>
                  {transformation.is_reusable && (
                    <Tooltip title="Reusable">
                      <Chip
                        icon={<CheckCircle sx={{ fontSize: 14 }} />}
                        label="Reusable"
                        size="small"
                        sx={{
                          height: 24,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: 'info.main',
                          '& .MuiChip-icon': {
                            color: theme.palette.info.main,
                          },
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredTransformations.length === 0 && (
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
            py: 8,
          }}
        >
          <Transform sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No transformations found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery || filterCategory !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Get started by creating your first transformation'}
          </Typography>
          {!searchQuery && filterCategory === 'all' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              New Transformation
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
          <Code sx={{ mr: 1 }} fontSize="small" />
          Test
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DataObject sx={{ mr: 1 }} fontSize="small" />
          Duplicate
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Transformation Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Transformation</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Transformation Name"
              value={newTransformation.name}
              onChange={(e) => setNewTransformation({ ...newTransformation, name: e.target.value })}
              placeholder="e.g., Filter Active Customers"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newTransformation.type}
                    label="Type"
                    onChange={(e) => setNewTransformation({ ...newTransformation, type: e.target.value as TransformationType })}
                  >
                    <MenuItem value="filter">Filter</MenuItem>
                    <MenuItem value="map">Map</MenuItem>
                    <MenuItem value="aggregate">Aggregate</MenuItem>
                    <MenuItem value="join">Join</MenuItem>
                    <MenuItem value="sort">Sort</MenuItem>
                    <MenuItem value="deduplicate">Deduplicate</MenuItem>
                    <MenuItem value="pivot">Pivot</MenuItem>
                    <MenuItem value="unpivot">Unpivot</MenuItem>
                    <MenuItem value="validate">Validate</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newTransformation.category}
                    label="Category"
                    onChange={(e) => setNewTransformation({ ...newTransformation, category: e.target.value as TransformationCategory })}
                  >
                    <MenuItem value="data_quality">Data Quality</MenuItem>
                    <MenuItem value="data_shaping">Data Shaping</MenuItem>
                    <MenuItem value="data_enrichment">Data Enrichment</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newTransformation.description}
              onChange={(e) => setNewTransformation({ ...newTransformation, description: e.target.value })}
              placeholder="Describe what this transformation does..."
            />

            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Configuration details will be set in the next step
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTransformation}
            disabled={!newTransformation.name || !newTransformation.type}
          >
            Next: Configure
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
