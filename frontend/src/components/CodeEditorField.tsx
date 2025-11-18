/**
 * Code Editor Field Component
 * Monaco-based code editor for Python/SQL transformations
 */
import { useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import {
  Box,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Typography,
  Stack,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface CodeEditorFieldProps {
  value: string;
  onChange: (code: string) => void;
  language: 'python' | 'sql';
  label?: string;
  description?: string;
  required?: boolean;
  onPreview?: (code: string) => Promise<any>;
}

export default function CodeEditorField({
  value,
  onChange,
  language,
  label,
  description,
  required = false,
  onPreview,
}: CodeEditorFieldProps) {
  const [code, setCode] = useState(value || '');
  const [activeTab, setActiveTab] = useState(0);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleCodeChange = (newCode: string | undefined) => {
    const codeValue = newCode || '';
    setCode(codeValue);
    onChange(codeValue);
    // Clear validation when code changes
    setValidationResult(null);
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
    if (onPreview) {
      await onPreview(code);
    }
  };

  const getMonacoLanguage = () => {
    if (language === 'python') return 'python';
    if (language === 'sql') return 'sql';
    return 'plaintext';
  };

  const handleEditorDidMount = () => {
    console.log('Monaco editor mounted successfully');
  };

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography variant="subtitle2" gutterBottom>
          {label}
          {required && <span style={{ color: 'error.main' }}> *</span>}
        </Typography>
      )}

      {description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {description}
        </Typography>
      )}

      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
        >
          <Tab label="Code" />
          <Tab label="Help" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Editor
              height="400px"
              language={getMonacoLanguage()}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 4,
                insertSpaces: true,
              }}
            />

            <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleValidate}
                  disabled={validating || !code}
                  startIcon={validating ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                >
                  Validate
                </Button>

                {onPreview && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handlePreview}
                    disabled={!code}
                    startIcon={<PlayArrowIcon />}
                  >
                    Test & Preview
                  </Button>
                )}

                {validationResult && (
                  <Box sx={{ flex: 1 }}>
                    {validationResult.valid ? (
                      <Alert severity="success" sx={{ py: 0 }}>
                        Code is valid
                        {validationResult.warnings && validationResult.warnings.length > 0 && (
                          <span> (with warnings)</span>
                        )}
                      </Alert>
                    ) : (
                      <Alert severity="error" sx={{ py: 0 }}>
                        {validationResult.error || 'Code has errors'}
                      </Alert>
                    )}
                  </Box>
                )}
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

        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {language === 'python' ? 'Python Transform Help' : 'SQL Transform Help'}
            </Typography>

            {language === 'python' ? (
              <Box>
                <Typography variant="body2" paragraph>
                  Write a Python function named <code>transform</code> that takes a pandas DataFrame
                  and returns a transformed DataFrame.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Example:
                </Typography>
                <pre style={{
                  background: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                  overflow: 'auto',
                }}>
{`def transform(df: pd.DataFrame) -> pd.DataFrame:
    # Add calculated column
    df['total'] = df['price'] * df['quantity']

    # Filter rows
    df = df[df['total'] > 100]

    # Convert types
    df['date'] = pd.to_datetime(df['date'])

    return df`}
                </pre>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Available:
                </Typography>
                <ul>
                  <li><code>pd</code> - pandas library</li>
                  <li><code>df</code> - input DataFrame</li>
                  <li>Standard Python built-ins (len, sum, max, min, etc.)</li>
                </ul>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" paragraph>
                  Write a SQL query using <code>input</code> as the table name.
                  Powered by DuckDB for analytics-optimized SQL.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Example:
                </Typography>
                <pre style={{
                  background: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                  overflow: 'auto',
                }}>
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
                </pre>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
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
      </Box>
    </Box>
  );
}
