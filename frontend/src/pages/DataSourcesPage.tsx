/**
 * Data Sources Page Component
 * Manage connections to various data sources
 */
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Cable as CableIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import {
  Connection,
  ConnectionCreate,
  ConnectionType,
  listConnections,
  createConnection,
  updateConnection,
  deleteConnection,
  testConnection,
  testConnectionConfig,
  getConnectionTypes,
} from '../api/connections';

export default function DataSourcesPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionTypes, setConnectionTypes] = useState<ConnectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [deleteConnectionId, setDeleteConnectionId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    config: {} as Record<string, any>,
  });

  useEffect(() => {
    loadConnections();
    loadConnectionTypes();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await listConnections();
      setConnections(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const loadConnectionTypes = async () => {
    try {
      const types = await getConnectionTypes();
      setConnectionTypes(types);
    } catch (err: any) {
      console.error('Failed to load connection types:', err);
    }
  };

  const handleOpenDialog = (connection?: Connection) => {
    if (connection) {
      setEditingConnection(connection);
      setFormData({
        name: connection.name,
        description: connection.description || '',
        type: connection.type,
        config: connection.config,
      });
    } else {
      setEditingConnection(null);
      setFormData({
        name: '',
        description: '',
        type: '',
        config: {},
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingConnection(null);
    setFormData({ name: '', description: '', type: '', config: {} });
  };

  const handleTypeChange = (type: string) => {
    setFormData({ ...formData, type, config: {} });
  };

  const handleConfigChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      config: { ...formData.config, [field]: value },
    });
  };

  const handleTestConnection = async () => {
    try {
      setTestingId('test-config');
      const result = await testConnectionConfig({
        type: formData.type,
        config: formData.config,
      });

      if (result.success) {
        setSuccess(`Connection test successful: ${result.message}`);
      } else {
        setError(`Connection test failed: ${result.message}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to test connection');
    } finally {
      setTestingId(null);
    }
  };

  const handleSaveConnection = async () => {
    try {
      if (editingConnection) {
        await updateConnection(editingConnection.id, {
          name: formData.name,
          description: formData.description,
          config: formData.config,
        });
        setSuccess('Connection updated successfully');
      } else {
        await createConnection({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          config: formData.config,
        } as ConnectionCreate);
        setSuccess('Connection created successfully');
      }
      handleCloseDialog();
      loadConnections();
    } catch (err: any) {
      setError(err.message || 'Failed to save connection');
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConnectionId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConnectionId) return;

    try {
      await deleteConnection(deleteConnectionId);
      setSuccess('Connection deleted successfully');
      setOpenDeleteDialog(false);
      setDeleteConnectionId(null);
      loadConnections();
    } catch (err: any) {
      setError(err.message || 'Failed to delete connection');
    }
  };

  const handleTestSavedConnection = async (id: string) => {
    try {
      setTestingId(id);
      const result = await testConnection(id);

      if (result.success) {
        setSuccess(`Connection test successful: ${result.message}`);
      } else {
        setError(`Connection test failed: ${result.message}`);
      }
      loadConnections();
    } catch (err: any) {
      setError(err.message || 'Failed to test connection');
    } finally {
      setTestingId(null);
    }
  };

  const getConnectionTypeFields = () => {
    const selectedType = connectionTypes.find((t) => t.type === formData.type);
    if (!selectedType) return [];

    const allFields = [
      ...selectedType.required_fields,
      ...selectedType.optional_fields,
    ];

    return allFields;
  };

  const renderConfigFields = () => {
    const fields = getConnectionTypeFields();
    const selectedType = connectionTypes.find((t) => t.type === formData.type);

    if (!selectedType) return null;

    return fields.map((field) => {
      const fieldName = field.replace(/ \(.*\)/, ''); // Remove default value text
      const isPassword = fieldName.toLowerCase().includes('password') ||
                        fieldName.toLowerCase().includes('secret') ||
                        fieldName.toLowerCase().includes('key');
      const isRequired = selectedType.required_fields.includes(field);

      return (
        <TextField
          key={fieldName}
          fullWidth
          label={fieldName}
          type={isPassword ? 'password' : 'text'}
          required={isRequired}
          value={formData.config[fieldName] || ''}
          onChange={(e) => handleConfigChange(fieldName, e.target.value)}
          margin="normal"
          helperText={!isRequired ? 'Optional' : ''}
        />
      );
    });
  };

  const getStatusChip = (connection: Connection) => {
    if (!connection.last_tested_at) {
      return <Chip label="Not Tested" size="small" />;
    }

    if (connection.test_status === 'success') {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="Connected"
          color="success"
          size="small"
        />
      );
    }

    return (
      <Chip
        icon={<ErrorIcon />}
        label="Failed"
        color="error"
        size="small"
      />
    );
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Data Sources
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage connections to databases, APIs, and cloud storage
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Connection
          </Button>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Connections Table */}
        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : connections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <StorageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">
                        No data sources configured yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  connections.map((connection) => (
                    <TableRow key={connection.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {connection.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={connection.type} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {connection.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(connection)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Test Connection">
                            <IconButton
                              size="small"
                              onClick={() => handleTestSavedConnection(connection.id)}
                              disabled={testingId === connection.id}
                            >
                              {testingId === connection.id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <CableIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(connection)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(connection.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingConnection ? 'Edit Connection' : 'Add New Connection'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={2}
              />
              <FormControl fullWidth margin="normal" disabled={!!editingConnection}>
                <InputLabel>Connection Type *</InputLabel>
                <Select
                  value={formData.type}
                  label="Connection Type *"
                  onChange={(e) => handleTypeChange(e.target.value)}
                >
                  {connectionTypes.map((type) => (
                    <MenuItem key={type.type} value={type.type}>
                      {type.name} - {type.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {formData.type && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Connection Configuration
                  </Typography>
                  {renderConfigFields()}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            {formData.type && (
              <Button
                onClick={handleTestConnection}
                disabled={testingId === 'test-config'}
                startIcon={testingId === 'test-config' ? <CircularProgress size={20} /> : <CableIcon />}
              >
                Test Connection
              </Button>
            )}
            <Button
              onClick={handleSaveConnection}
              variant="contained"
              disabled={!formData.name || !formData.type}
            >
              {editingConnection ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Delete Connection</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this connection? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
