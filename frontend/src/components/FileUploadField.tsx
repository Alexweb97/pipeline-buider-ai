/**
 * File Upload Field Component
 * Used in module configuration forms for file-based extractors
 */
import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  LinearProgress,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import uploadsApi, { UploadedFile } from '../api/uploads';
import toast from 'react-hot-toast';

interface FileUploadFieldProps {
  label: string;
  value?: string; // file_id
  onChange: (fileId: string) => void;
  accept?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function FileUploadField({
  label,
  value,
  onChange,
  accept,
  description,
  required = false,
  disabled = false,
}: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load file details if value exists
  useEffect(() => {
    if (value && !uploadedFile) {
      uploadsApi.getFile(value).then(setUploadedFile).catch(() => {
        setError('Failed to load file details');
      });
    }
  }, [value]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress (since FormData upload doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const uploaded = await uploadsApi.uploadFile(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setUploadedFile(uploaded);
      onChange(uploaded.id);
      toast.success(`File "${file.name}" uploaded successfully`);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="body2" fontWeight="medium" gutterBottom>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>

      {description && (
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          {description}
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!uploadedFile ? (
        <Box>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={disabled || uploading}
          />

          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            fullWidth
            sx={{ mb: 1 }}
          >
            {uploading ? 'Uploading...' : 'Select File'}
          </Button>

          {uploading && (
            <Box>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="text.secondary" mt={0.5}>
                Uploading... {uploadProgress}%
              </Typography>
            </Box>
          )}

          {accept && (
            <Typography variant="caption" color="text.secondary">
              Accepted formats: {accept}
            </Typography>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CheckCircle color="success" fontSize="small" />

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight="medium">
              {uploadedFile.original_filename}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip
                label={uploadedFile.file_extension.toUpperCase()}
                size="small"
                variant="outlined"
              />
              <Chip
                label={formatFileSize(uploadedFile.file_size)}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>

          {!disabled && (
            <IconButton
              size="small"
              onClick={handleRemove}
              title="Remove file"
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
}
