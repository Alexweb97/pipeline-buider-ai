/**
 * Uploads Page
 * File upload and management interface with drag & drop
 */
import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  useTheme,
  alpha,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload,
  InsertDriveFile,
  Delete,
  Download,
  Search,
  Refresh,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import { useUploadsStore } from '../stores/uploadsStore';
import uploadsApi from '../api/uploads';

export default function UploadsPage() {
  const theme = useTheme();
  const { files, loading, uploading, error, total, fetchFiles, uploadFile, deleteFile, clearError } = useUploadsStore();

  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file icon color based on extension
  const getFileIconColor = (extension: string) => {
    const colors: Record<string, string> = {
      '.csv': theme.palette.success.main,
      '.json': theme.palette.info.main,
      '.xlsx': theme.palette.success.main,
      '.xls': theme.palette.success.main,
      '.parquet': theme.palette.primary.main,
      '.txt': theme.palette.grey[500],
      '.xml': theme.palette.warning.main,
      '.yaml': theme.palette.warning.main,
      '.yml': theme.palette.warning.main,
    };
    return colors[extension.toLowerCase()] || theme.palette.grey[500];
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      await uploadFile(file);
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, []);

  // Handle file download
  const handleDownload = (fileId: string, filename: string) => {
    const url = uploadsApi.downloadFile(fileId);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file delete
  const handleDeleteClick = (file: any) => {
    setSelectedFile(file);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFile) return;
    try {
      await deleteFile(selectedFile.id);
      setDeleteDialogOpen(false);
      setSelectedFile(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Filter files based on search
  const filteredFiles = files.filter((file) =>
    file.original_filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            File Uploads
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload and manage files for your data pipelines
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => fetchFiles()}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Upload Area */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: `2px dashed ${dragActive ? theme.palette.primary.main : theme.palette.divider}`,
          bgcolor: dragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
          transition: 'all 0.3s ease',
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              mx: 'auto',
              mb: 3,
            }}
          >
            <CloudUpload sx={{ fontSize: 48 }} />
          </Box>

          <Typography variant="h6" gutterBottom>
            {dragActive ? 'Drop file here' : 'Drag & drop file here'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            or click to browse
          </Typography>

          <Button
            variant="contained"
            component="label"
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Select File'}
            <input
              type="file"
              hidden
              accept=".csv,.json,.xlsx,.xls,.parquet,.txt,.tsv,.xml,.yaml,.yml"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </Button>

          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
            Supported formats: CSV, JSON, Excel, Parquet, TXT, TSV, XML, YAML (Max 100MB)
          </Typography>
        </CardContent>
      </Card>

      {/* Search and Stats */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <Chip label={`${total} file${total !== 1 ? 's' : ''}`} />
      </Box>

      {/* Files Table */}
      {loading && files.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </Box>
      ) : filteredFiles.length === 0 ? (
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, textAlign: 'center', py: 8 }}>
          <InsertDriveFile sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery ? 'No files found' : 'No files uploaded yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? 'Try adjusting your search' : 'Upload your first file to get started'}
          </Typography>
        </Card>
      ) : (
        <TableContainer component={Card} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>File</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Size</TableCell>
                <TableCell>Uploaded</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFiles.map((file) => (
                <TableRow key={file.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <InsertDriveFile sx={{ color: getFileIconColor(file.file_extension) }} />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {file.original_filename}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {file.filename}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={file.file_extension.replace('.', '').toUpperCase()} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">{formatFileSize(file.file_size)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(file.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(file.id, file.original_filename)}
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(file)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedFile?.original_filename}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
