/**
 * Code Editor Modal - Full-screen code editor
 * Provides a large, dedicated space for writing Python/SQL transformations
 */
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Typography,
  Stack,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Code as CodeIcon,
  Help as HelpIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import Editor, { Monaco } from '@monaco-editor/react';
import DataPreview from './DataPreview';

interface CodeEditorModalProps {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (code: string) => void;
  language: 'python' | 'sql';
  label?: string;
  onSave?: (code: string) => void;
}

export default function CodeEditorModal({
  open,
  onClose,
  value,
  onChange,
  language,
  label = 'Code Editor',
  onSave,
}: CodeEditorModalProps) {
  const [code, setCode] = useState(value || '');
  const [activeTab, setActiveTab] = useState(0);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Update local code when value changes from parent
  useEffect(() => {
    setCode(value || '');
  }, [value]);

  const handleCodeChange = (newCode: string | undefined) => {
    const codeValue = newCode || '';
    setCode(codeValue);
    // Clear validation when code changes
    setValidationResult(null);
  };

  const handleSave = () => {
    onChange(code);
    if (onSave) {
      onSave(code);
    }
    onClose();
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      const response = await fetch('/api/v1/transforms/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          code: code,
          language: language,
        }),
      });

      const result = await response.json();
      setValidationResult(result);
    } catch (error: any) {
      setValidationResult({
        valid: false,
        error: error.message || 'Validation failed',
      });
    } finally {
      setValidating(false);
    }
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewData(null);

    try {
      // Mock data for preview
      const sampleData = [
        { id: 1, name: 'Product A', price: 100, quantity: 5 },
        { id: 2, name: 'Product B', price: 200, quantity: 3 },
        { id: 3, name: 'Product C', price: 150, quantity: 7 },
      ];

      const response = await fetch('/api/v1/transforms/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          code,
          language,
          sample_data: sampleData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Preview failed');
      }

      const result = await response.json();
      setPreviewData(result);
      setActiveTab(2); // Switch to preview tab
    } catch (error: any) {
      setPreviewError(error.message || 'Preview failed');
    } finally {
      setPreviewLoading(false);
    }
  };

  const getMonacoLanguage = () => {
    if (language === 'python') return 'python';
    if (language === 'sql') return 'sql';
    return 'plaintext';
  };

  const handleEditorWillMount = (monaco: Monaco) => {
    // Configure Monaco before it mounts
    console.log('Monaco editor will mount', monaco);

    // Ensure themes are available
    monaco.editor.defineTheme('vs-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {}
    });
  };

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    console.log('Monaco editor mounted successfully');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FullscreenIcon />
          <Typography variant="h6">{label}</Typography>
          {language && (
            <Typography
              variant="caption"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              {language.toUpperCase()}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab icon={<CodeIcon />} label="Code" iconPosition="start" />
            <Tab icon={<HelpIcon />} label="Help" iconPosition="start" />
            <Tab
              icon={<PlayArrowIcon />}
              label="Preview"
              iconPosition="start"
              disabled={!previewData && !previewLoading && !previewError}
            />
          </Tabs>
        </Box>

        {/* Code Tab */}
        {activeTab === 0 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <Editor
                height="100%"
                language={getMonacoLanguage()}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                loading={<Box sx={{ p: 3, textAlign: 'center' }}>Loading editor...</Box>}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  tabSize: 4,
                  insertSpaces: true,
                  folding: true,
                  renderLineHighlight: 'all',
                  cursorBlinking: 'smooth',
                }}
              />
            </Box>

            <Box
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={handleValidate}
                  disabled={validating || !code}
                  startIcon={validating ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                >
                  Validate Code
                </Button>

                <Button
                  variant="contained"
                  size="medium"
                  onClick={handlePreview}
                  disabled={!code || previewLoading}
                  startIcon={previewLoading ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                >
                  Test & Preview
                </Button>

                <Box sx={{ flex: 1 }}>
                  {validationResult && (
                    <>
                      {validationResult.valid ? (
                        <Alert severity="success" sx={{ py: 0 }}>
                          ✓ Code is valid
                          {validationResult.warnings && validationResult.warnings.length > 0 && (
                            <span> (with warnings)</span>
                          )}
                        </Alert>
                      ) : (
                        <Alert severity="error" sx={{ py: 0 }}>
                          {validationResult.error || 'Code has errors'}
                        </Alert>
                      )}
                    </>
                  )}
                </Box>
              </Stack>

              {validationResult?.warnings && validationResult.warnings.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {validationResult.warnings.map((warning: string, idx: number) => (
                    <Alert key={idx} severity="warning" sx={{ py: 0, mt: 0.5 }}>
                      {warning}
                    </Alert>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Help Tab */}
        {activeTab === 1 && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 4 }}>
            <Typography variant="h5" gutterBottom>
              {language === 'python' ? 'Python Transform Help' : 'SQL Transform Help'}
            </Typography>

            {language === 'python' ? (
              <Box>
                <Typography variant="body1" paragraph>
                  Write a Python function named <code>transform</code> that takes a pandas DataFrame
                  and returns a transformed DataFrame.
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Example:
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    bgcolor: 'grey.900',
                    color: 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                  }}
                >
                  {`def transform(df: pd.DataFrame) -> pd.DataFrame:
    # Add calculated column
    df['total'] = df['price'] * df['quantity']

    # Filter rows
    df = df[df['total'] > 100]

    # Convert types
    df['date'] = pd.to_datetime(df['date'])

    return df`}
                </Box>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Available:
                </Typography>
                <ul>
                  <li>
                    <code>pd</code> - pandas library
                  </li>
                  <li>
                    <code>df</code> - input DataFrame
                  </li>
                  <li>Standard Python built-ins (len, sum, max, min, etc.)</li>
                </ul>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" paragraph>
                  Write a SQL query using <code>input</code> as the table name. Powered by DuckDB
                  for analytics-optimized SQL.
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Example:
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    bgcolor: 'grey.900',
                    color: 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                  }}
                >
                  {`SELECT
    id,
    name,
    price * quantity AS total,
    CASE
        WHEN total > 1000 THEN 'High'
        WHEN total > 500 THEN 'Medium'
        ELSE 'Low'
    END AS category
FROM input
WHERE status = 'active'
ORDER BY total DESC`}
                </Box>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Features:
                </Typography>
                <ul>
                  <li>Window functions (ROW_NUMBER, RANK, LAG, LEAD)</li>
                  <li>CTEs (WITH clauses)</li>
                  <li>All standard SQL aggregations</li>
                  <li>Date/time functions</li>
                  <li>String manipulation</li>
                </ul>
              </Box>
            )}
          </Box>
        )}

        {/* Preview Tab */}
        {activeTab === 2 && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transformation Preview
            </Typography>

            {previewLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress size={60} />
              </Box>
            )}

            {previewError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {previewError}
              </Alert>
            )}

            {previewData && !previewLoading && <DataPreview preview={previewData} />}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
        <Button onClick={onClose} size="large">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          disabled={!code}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
