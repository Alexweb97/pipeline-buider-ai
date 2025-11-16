/**
 * Data Preview Component
 * Displays transformation results with schema and statistics
 */
import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface DataPreviewProps {
  preview: {
    success: boolean;
    input_shape?: number[];
    output_shape?: number[];
    input_columns?: string[];
    output_columns?: string[];
    preview_data?: Record<string, any>[];
    schema?: Record<string, any>;
    statistics?: Record<string, any>;
    error?: string;
    error_type?: string;
  };
}

export default function DataPreview({ preview }: DataPreviewProps) {
  if (!preview.success) {
    return (
      <Alert severity="error" icon={<ErrorIcon />}>
        <Typography variant="subtitle2" gutterBottom>
          Transformation Failed
        </Typography>
        <Typography variant="body2">
          {preview.error_type}: {preview.error}
        </Typography>
      </Alert>
    );
  }

  const columnsAdded = preview.output_columns && preview.input_columns
    ? preview.output_columns.filter(col => !preview.input_columns!.includes(col))
    : [];

  const columnsRemoved = preview.input_columns && preview.output_columns
    ? preview.input_columns.filter(col => !preview.output_columns!.includes(col))
    : [];

  const rowsChanged = preview.input_shape && preview.output_shape
    ? preview.output_shape[0] - preview.input_shape[0]
    : 0;

  return (
    <Box>
      {/* Success Header */}
      <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
        <Typography variant="subtitle2">
          Transformation executed successfully
        </Typography>
      </Alert>

      {/* Shape Changes */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Input Shape
              </Typography>
              <Typography variant="h6">
                {preview.input_shape?.[0]} rows × {preview.input_shape?.[1]} cols
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Output Shape
              </Typography>
              <Typography variant="h6">
                {preview.output_shape?.[0]} rows × {preview.output_shape?.[1]} cols
              </Typography>
              {rowsChanged !== 0 && (
                <Box sx={{ mt: 1 }}>
                  <Chip
                    size="small"
                    icon={rowsChanged > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    label={`${rowsChanged > 0 ? '+' : ''}${rowsChanged} rows`}
                    color={rowsChanged > 0 ? 'success' : 'warning'}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Column Changes
              </Typography>
              <Box sx={{ mt: 1 }}>
                {columnsAdded.length > 0 && (
                  <Chip
                    size="small"
                    label={`+${columnsAdded.length} columns`}
                    color="success"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                {columnsRemoved.length > 0 && (
                  <Chip
                    size="small"
                    label={`-${columnsRemoved.length} columns`}
                    color="warning"
                    sx={{ mb: 1 }}
                  />
                )}
                {columnsAdded.length === 0 && columnsRemoved.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No changes
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Column Schema */}
      {preview.schema && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Output Schema
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Column</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Null Count</strong></TableCell>
                  <TableCell><strong>Unique Values</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(preview.schema).map(([colName, colInfo]: [string, any]) => {
                  const isNew = columnsAdded.includes(colName);
                  return (
                    <TableRow key={colName}>
                      <TableCell>
                        {colName}
                        {isNew && (
                          <Chip size="small" label="NEW" color="success" sx={{ ml: 1 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <code style={{ fontSize: '0.875rem' }}>{colInfo.dtype}</code>
                      </TableCell>
                      <TableCell>{colInfo.null_count || 0}</TableCell>
                      <TableCell>{colInfo.unique_count || 0}</TableCell>
                      <TableCell>
                        {colInfo.null_count > 0 ? (
                          <Chip size="small" label="Has Nulls" color="warning" />
                        ) : (
                          <Chip size="small" label="Complete" color="success" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Preview Data */}
      {preview.preview_data && preview.preview_data.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Preview Data (First 10 rows)
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {Object.keys(preview.preview_data[0]).map((col) => (
                    <TableCell key={col}>
                      <strong>{col}</strong>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {preview.preview_data.map((row, idx) => (
                  <TableRow key={idx} hover>
                    {Object.values(row).map((value: any, cellIdx) => (
                      <TableCell key={cellIdx}>
                        {value === null || value === undefined
                          ? <em style={{ color: '#999' }}>null</em>
                          : String(value)
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}
