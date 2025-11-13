/**
 * Uploads Page Component
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
  LinearProgress,
  Paper,
  Divider,
  Stack,
  Avatar,
} from '@mui/material';
import {
  CloudUpload,
  MoreVert,
  Delete,
  Download,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  PlayArrow,
  Cancel,
  InsertDriveFile,
  Description,
  TableChart,
  Code,
  DataObject,
  Refresh,
  Warning,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import type { Upload, UploadStatus, FileType } from '../types/upload';

export default function UploadsPage() {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Mock data
  const mockUploads: Upload[] = [
    {
      id: '1',
      file_name: 'customer_data_2024.csv',
      file_type: 'csv',
      file_size: 15728640, // 15 MB
      status: 'completed',
      created_at: '2024-01-20T14:30:00Z',
      updated_at: '2024-01-20T14:32:00Z',
      uploaded_by: 'admin',
      progress: 100,
      destination: 'customers_table',
      pipeline_id: 'pipeline_1',
      pipeline_name: 'Customer Data ETL',
      rows_processed: 45230,
      errors_count: 0,
      processing_time: 120,
      metadata: {
        mime_type: 'text/csv',
        encoding: 'utf-8',
        delimiter: ',',
        columns_count: 12,
        estimated_rows: 45230,
      },
    },
    {
      id: '2',
      file_name: 'sales_report_q1.xlsx',
      file_type: 'xlsx',
      file_size: 8388608, // 8 MB
      status: 'processing',
      created_at: '2024-01-20T15:00:00Z',
      updated_at: '2024-01-20T15:01:00Z',
      uploaded_by: 'admin',
      progress: 67,
      destination: 'sales_data',
      pipeline_id: 'pipeline_2',
      pipeline_name: 'Sales Analytics Pipeline',
      rows_processed: 15000,
      metadata: {
        mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        sheet_name: 'Q1_Sales',
        columns_count: 8,
        estimated_rows: 22000,
      },
    },
    {
      id: '3',
      file_name: 'products_inventory.json',
      file_type: 'json',
      file_size: 5242880, // 5 MB
      status: 'uploading',
      created_at: '2024-01-20T15:10:00Z',
      updated_at: '2024-01-20T15:10:30Z',
      uploaded_by: 'admin',
      progress: 43,
      destination: 'inventory',
      metadata: {
        mime_type: 'application/json',
        encoding: 'utf-8',
        estimated_rows: 12000,
      },
    },
    {
      id: '4',
      file_name: 'user_activity_log.csv',
      file_type: 'csv',
      file_size: 20971520, // 20 MB
      status: 'failed',
      created_at: '2024-01-20T13:00:00Z',
      updated_at: '2024-01-20T13:02:00Z',
      uploaded_by: 'admin',
      progress: 0,
      errors_count: 1,
      error_message: 'Invalid CSV format: Missing closing quote in row 15234',
      metadata: {
        mime_type: 'text/csv',
        encoding: 'utf-8',
        delimiter: ',',
      },
    },
    {
      id: '5',
      file_name: 'transaction_data.parquet',
      file_type: 'parquet',
      file_size: 31457280, // 30 MB
      status: 'pending',
      created_at: '2024-01-20T15:15:00Z',
      updated_at: '2024-01-20T15:15:00Z',
      uploaded_by: 'admin',
      progress: 0,
      destination: 'transactions',
      metadata: {
        mime_type: 'application/parquet',
        compression: 'snappy',
        estimated_rows: 150000,
      },
    },
  ];

  const [uploads] = useState<Upload[]>(mockUploads);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status: UploadStatus) => {
    switch (status) {
      case 'completed':
        return theme.palette.success.main;
      case 'uploading':
      case 'processing':
        return theme.palette.info.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'failed':
      case 'cancelled':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle sx={{ fontSize: 20 }} />;
      case 'uploading':
      case 'processing':
        return <Refresh sx={{ fontSize: 20 }} />;
      case 'pending':
        return <Schedule sx={{ fontSize: 20 }} />;
      case 'failed':
        return <ErrorIcon sx={{ fontSize: 20 }} />;
      case 'cancelled':
        return <Cancel sx={{ fontSize: 20 }} />;
      default:
        return <Schedule sx={{ fontSize: 20 }} />;
    }
  };

  const getFileTypeIcon = (fileType: FileType) => {
    switch (fileType) {
      case 'csv':
        return <TableChart />;
      case 'json':
        return <Code />;
      case 'xlsx':
        return <Description />;
      case 'xml':
        return <DataObject />;
      case 'parquet':
        return <DataObject />;
      default:
        return <InsertDriveFile />;
    }
  };

  const getFileTypeColor = (fileType: FileType) => {
    switch (fileType) {
      case 'csv':
        return '#10b981';
      case 'json':
        return '#f59e0b';
      case 'xlsx':
        return '#3b82f6';
      case 'xml':
        return '#8b5cf6';
      case 'parquet':
        return '#ec4899';
      default:
        return theme.palette.grey[500];
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  // Calculate stats
  const totalUploads = uploads.length;
  const completedUploads = uploads.filter(u => u.status === 'completed').length;
  const failedUploads = uploads.filter(u => u.status === 'failed').length;
  const processingUploads = uploads.filter(u => u.status === 'uploading' || u.status === 'processing').length;
  const totalSize = uploads.reduce((sum, u) => sum + u.file_size, 0);
  const totalRowsProcessed = uploads
    .filter(u => u.rows_processed)
    .reduce((sum, u) => sum + (u.rows_processed || 0), 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Uploads
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage file uploads and data ingestion
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          sx={{ height: 'fit-content' }}
        >
          Upload File
        </Button>
      </Box>

      {/* Stats Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {totalUploads}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Uploads
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {completedUploads}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {processingUploads}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Processing
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'center', py: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="error.main">
              {failedUploads}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Failed
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    width: 56,
                    height: 56,
                  }}
                >
                  <CloudUpload sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {formatFileSize(totalSize)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Data Uploaded
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                    width: 56,
                    height: 56,
                  }}
                >
                  <TableChart sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {totalRowsProcessed.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rows Processed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upload Drop Zone */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: `2px dashed ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          },
        }}
      >
        <CardContent sx={{ py: 6, textAlign: 'center' }}>
          <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Drop files here or click to upload
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Support for CSV, JSON, Excel, XML, and Parquet files
          </Typography>
          <Button variant="outlined" startIcon={<CloudUpload />}>
            Select Files
          </Button>
        </CardContent>
      </Card>

      {/* Uploads List */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent Uploads
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            View and manage your uploaded files
          </Typography>

          <Stack spacing={2}>
            {uploads.map((upload) => (
              <Paper
                key={upload.id}
                elevation={0}
                sx={{
                  p: 2.5,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(getFileTypeColor(upload.file_type), 0.1),
                        color: getFileTypeColor(upload.file_type),
                        width: 48,
                        height: 48,
                      }}
                    >
                      {getFileTypeIcon(upload.file_type)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight="bold" noWrap>
                        {upload.file_name}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Chip
                          label={upload.file_type.toUpperCase()}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            bgcolor: alpha(getFileTypeColor(upload.file_type), 0.1),
                            color: getFileTypeColor(upload.file_type),
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(upload.file_size)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(upload.created_at)}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      icon={getStatusIcon(upload.status)}
                      label={upload.status.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: alpha(getStatusColor(upload.status), 0.1),
                        color: getStatusColor(upload.status),
                        fontWeight: 600,
                        '& .MuiChip-icon': { color: getStatusColor(upload.status) },
                      }}
                    />
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e)}>
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Box>

                {/* Progress Bar for uploading/processing */}
                {(upload.status === 'uploading' || upload.status === 'processing') && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {upload.status === 'uploading' ? 'Uploading' : 'Processing'}...
                      </Typography>
                      <Typography variant="caption" fontWeight="600">
                        {upload.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={upload.progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.info.main,
                        },
                      }}
                    />
                  </Box>
                )}

                {/* Error Message */}
                {upload.status === 'failed' && upload.error_message && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      mb: 2,
                      bgcolor: alpha(theme.palette.error.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Warning sx={{ fontSize: 18, color: 'error.main' }} />
                      <Typography variant="caption" color="error.main">
                        {upload.error_message}
                      </Typography>
                    </Box>
                  </Paper>
                )}

                {/* Upload Details */}
                <Grid container spacing={2}>
                  {upload.destination && (
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Destination
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {upload.destination}
                      </Typography>
                    </Grid>
                  )}
                  {upload.pipeline_name && (
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Pipeline
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {upload.pipeline_name}
                      </Typography>
                    </Grid>
                  )}
                  {upload.rows_processed !== undefined && (
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Rows Processed
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {upload.rows_processed.toLocaleString()}
                      </Typography>
                    </Grid>
                  )}
                  {upload.processing_time && (
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Processing Time
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {formatDuration(upload.processing_time)}
                      </Typography>
                    </Grid>
                  )}
                  {upload.metadata?.columns_count && (
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Columns
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {upload.metadata.columns_count}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>
          <PlayArrow sx={{ mr: 1 }} fontSize="small" />
          Process
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Download sx={{ mr: 1 }} fontSize="small" />
          Download
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>
    </DashboardLayout>
  );
}
