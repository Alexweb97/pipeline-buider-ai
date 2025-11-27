/**
 * AI Assistant Modal
 * Modal interface for AI-powered pipeline generation
 */
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  AutoAwesome,
  Send,
  Close,
} from '@mui/icons-material';
import aiApi, { PipelineConfig } from '../api/ai';

interface AIAssistantModalProps {
  open: boolean;
  onClose: () => void;
  onPipelineGenerated: (config: PipelineConfig) => void;
  currentConfig?: any;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  open,
  onClose,
  onPipelineGenerated,
  currentConfig,
}) => {
  const [tab, setTab] = useState<'generate' | 'improve' | 'explain'>(
    currentConfig ? 'improve' : 'generate'
  );
  const [prompt, setPrompt] = useState('');
  const [improvementRequest, setImprovementRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const handleReset = () => {
    setPrompt('');
    setImprovementRequest('');
    setError(null);
    setExplanation(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config = await aiApi.generatePipeline(prompt);
      onPipelineGenerated(config);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!improvementRequest.trim()) {
      setError('Please describe the improvement');
      return;
    }

    if (!currentConfig) {
      setError('No pipeline to improve');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config = await aiApi.improvePipeline(currentConfig, improvementRequest);
      onPipelineGenerated(config);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to improve pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!currentConfig) {
      setError('No pipeline to explain');
      return;
    }

    setLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const result = await aiApi.explainPipeline(currentConfig);
      setExplanation(result.explanation);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to explain pipeline');
    } finally {
      setLoading(false);
    }
  };

  const examplePrompts = [
    'Fetch data from a REST API, clean it, and save to CSV',
    'Extract from PostgreSQL, transform dates, and load to MySQL',
    'Read Excel file, remove duplicates, and export to JSON',
    'Get data from API, aggregate by category, and save to database',
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesome color="primary" />
        AI Pipeline Assistant
      </DialogTitle>

      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Generate New" value="generate" />
          {currentConfig && <Tab label="Improve" value="improve" />}
          {currentConfig && <Tab label="Explain" value="explain" />}
        </Tabs>

        {/* Generate Tab */}
        {tab === 'generate' && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Describe the pipeline you want to create in plain English. The AI will generate
              the complete configuration with extractors, transformers, and loaders.
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Pipeline Description"
              placeholder="Example: Create a pipeline that fetches user data from the GitHub API, filters active users, and saves to a CSV file"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />

            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Example prompts:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {examplePrompts.map((example, idx) => (
                <Paper
                  key={idx}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background-color 0.2s',
                  }}
                  onClick={() => setPrompt(example)}
                >
                  <Typography variant="body2">{example}</Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {/* Improve Tab */}
        {tab === 'improve' && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Describe how you want to improve your current pipeline. The AI will modify
              the configuration based on your request.
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Improvement Request"
              placeholder="Example: Add error handling and data validation before loading"
              value={improvementRequest}
              onChange={(e) => setImprovementRequest(e.target.value)}
              disabled={loading}
            />
          </Box>
        )}

        {/* Explain Tab */}
        {tab === 'explain' && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Get a plain English explanation of what your pipeline does.
            </Typography>

            {explanation ? (
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {explanation}
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Click "Explain" to get an AI-generated explanation of your pipeline
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} startIcon={<Close />} disabled={loading}>
          Cancel
        </Button>
        {tab === 'generate' && (
          <Button
            onClick={handleGenerate}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            disabled={loading || !prompt.trim()}
          >
            {loading ? 'Generating...' : 'Generate Pipeline'}
          </Button>
        )}
        {tab === 'improve' && (
          <Button
            onClick={handleImprove}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
            disabled={loading || !improvementRequest.trim()}
          >
            {loading ? 'Improving...' : 'Improve Pipeline'}
          </Button>
        )}
        {tab === 'explain' && (
          <Button
            onClick={handleExplain}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
            disabled={loading}
          >
            {loading ? 'Explaining...' : 'Explain Pipeline'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AIAssistantModal;
