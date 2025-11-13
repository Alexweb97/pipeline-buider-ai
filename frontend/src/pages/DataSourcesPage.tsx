/**
 * Data Sources Page Component
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
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Cable,
  CheckCircle,
  Error as ErrorIcon,
  Storage as StorageIcon,
  DataObject,
  Cloud,
  Api,
  Description,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import type { DataSource, DataSourceCreateData, DataSourceType } from '../types/dataSource';

export default function DataSourcesPage() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Mock data
  const mockDataSources: DataSource[] = [
    {
      id: '1',
      name: 'Production MySQL',
      type: 'mysql',
      description: 'Main production database for customer data',
      status: 'connected',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z',
      last_tested_at: '2024-01-20T14:30:00Z',
      connection_details: {
        host: 'mysql.prod.example.com',
        port: 3306,
        database: 'customers',
        username: 'etl_user',
        ssl: true,
      },
      used_in_pipelines: 3,
      records_count: 125000,
    },
    {
      id: '2',
      name: 'Analytics PostgreSQL',
      type: 'postgresql',
      description: 'Data warehouse for analytics and reporting',
      status: 'connected',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-20T12:00:00Z',
      last_tested_at: '2024-01-20T12:00:00Z',
      connection_details: {
        host: 'postgres.analytics.example.com',
        port: 5432,
        database: 'warehouse',
        username: 'analytics_user',
        ssl: true,
      },
      used_in_pipelines: 5,
      records_count: 2500000,
    },
    {
      id: '3',
      name: 'Sales API',
      type: 'rest_api',
      description: 'REST API for sales data integration',
      status: 'connected',
      created_at: '2024-01-05T08:00:00Z',
      updated_at: '2024-01-18T16:00:00Z',
      last_tested_at: '2024-01-18T16:00:00Z',
      connection_details: {
        base_url: 'https://api.sales.example.com',
        auth_type: 'bearer',
      },
      used_in_pipelines: 2,
    },
    {
      id: '4',
      name: 'S3 Data Lake',
      type: 's3',
      description: 'AWS S3 bucket for raw data storage',
      status: 'error',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      last_tested_at: '2024-01-15T10:00:00Z',
      connection_details: {
        bucket: 'company-data-lake',
        region: 'us-east-1',
      },
      used_in_pipelines: 1,
    },
  ];

  const [dataSources] = useState<DataSource[]>(mockDataSources);
  const [newSource, setNewSource] = useState<Partial<DataSourceCreateData>>({
    name: '',
    type: 'postgresql',
    description: '',
    connection_details: {},
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateSource = () => {
    console.log('Creating data source:', newSource);
    setCreateDialogOpen(false);
    setNewSource({
      name: '',
      type: 'postgresql',
      description: '',
      connection_details: {},
    });
  };

  const getStatusColor = (status: DataSource['status']) => {
    switch (status) {
      case 'connected':
        return theme.palette.success.main;
      case 'disconnected':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      case 'testing':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: DataSource['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 16 }} />;
      default:
        return <Cable sx={{ fontSize: 16 }} />;
    }
  };

  const getTypeIcon = (type: DataSourceType) => {
    switch (type) {
      case 'postgresql':
      case 'mysql':
        return <DataObject />;
      case 'mongodb':
      case 'redis':
        return <StorageIcon />;
      case 'rest_api':
        return <Api />;
      case 's3':
        return <Cloud />;
      case 'csv':
      case 'json':
        return <Description />;
      default:
        return <Cable />;
    }
  };

  const getTypeColor = (type: DataSourceType) => {
    switch (type) {
      case 'postgresql':
        return '#336791';
      case 'mysql':
        return '#4479A1';
      case 'mongodb':
        return '#47A248';
      case 'redis':
        return '#DC382D';
      case 'rest_api':
        return theme.palette.secondary.main;
      case 's3':
        return '#FF9900';
      default:
        return theme.palette.primary.main;
    }
  };

  const filteredSources = dataSources.filter((source) =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Data Sources
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Connect and manage your data sources
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ height: 'fit-content' }}
        >
          Add Source
        </Button>
      </Box>

      {/* Search Bar */}
      <Card elevation={0} sx={{ mb: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search data sources..."
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

      {/* Data Sources Grid */}
      <Grid container spacing={3}>
        {filteredSources.map((source) => (
          <Grid item xs={12} md={6} lg={4} key={source.id}>
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
                    icon={getStatusIcon(source.status)}
                    label={source.status.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: alpha(getStatusColor(source.status), 0.1),
                      color: getStatusColor(source.status),
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        color: getStatusColor(source.status),
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

                {/* Source Icon and Name */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(getTypeColor(source.type), 0.1),
                      color: getTypeColor(source.type),
                    }}
                  >
                    {getTypeIcon(source.type)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {source.name}
                    </Typography>
                    <Chip
                      label={source.type.toUpperCase()}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        mt: 0.5,
                        bgcolor: alpha(getTypeColor(source.type), 0.1),
                        color: getTypeColor(source.type),
                      }}
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
                  {source.description}
                </Typography>

                {/* Connection Info */}
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.grey[500], 0.05),
                    mb: 2,
                  }}
                >
                  <Grid container spacing={1}>
                    {source.connection_details.host && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          Host: {source.connection_details.host}
                        </Typography>
                      </Grid>
                    )}
                    {source.connection_details.database && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          Database: {source.connection_details.database}
                        </Typography>
                      </Grid>
                    )}
                    {source.connection_details.base_url && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          URL: {source.connection_details.base_url}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>

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
                      {source.used_in_pipelines}
                    </Typography>
                  </Box>
                  {source.records_count && (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Records
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {source.records_count.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredSources.length === 0 && (
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
            py: 8,
          }}
        >
          <StorageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No data sources found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Get started by connecting your first data source'}
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Add Source
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
          <Cable sx={{ mr: 1 }} fontSize="small" />
          Test Connection
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Data Source Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Data Source</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Source Name"
              value={newSource.name}
              onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
              placeholder="e.g., Production MySQL"
            />
            <FormControl fullWidth>
              <InputLabel>Source Type</InputLabel>
              <Select
                value={newSource.type}
                label="Source Type"
                onChange={(e) => setNewSource({ ...newSource, type: e.target.value as DataSourceType })}
              >
                <MenuItem value="postgresql">PostgreSQL</MenuItem>
                <MenuItem value="mysql">MySQL</MenuItem>
                <MenuItem value="mongodb">MongoDB</MenuItem>
                <MenuItem value="redis">Redis</MenuItem>
                <MenuItem value="rest_api">REST API</MenuItem>
                <MenuItem value="s3">Amazon S3</MenuItem>
                <MenuItem value="csv">CSV File</MenuItem>
                <MenuItem value="json">JSON File</MenuItem>
                <MenuItem value="kafka">Apache Kafka</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={newSource.description}
              onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
              placeholder="Describe this data source..."
            />

            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Connection details will be configured in the next step
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateSource}
            disabled={!newSource.name || !newSource.type}
          >
            Next: Configure Connection
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
