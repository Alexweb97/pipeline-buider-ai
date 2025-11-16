/**
 * Node Configuration Panel - Right sidebar for editing node properties
 */
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import { Close, Delete, ContentCopy, Bookmarks, SaveAs } from '@mui/icons-material';
import { PipelineNode } from '../types/pipelineBuilder';
import { usePipelineStore } from '../stores/pipelineStore';
import { mapModulesToDefinitions } from '../utils/moduleMapper';
import FileUploadField from './FileUploadField';

interface NodeConfigPanelProps {
  node: PipelineNode | null;
  onClose: () => void;
  onUpdate: (nodeId: string, config: Record<string, any>) => void;
  onDelete: (nodeId: string) => void;
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const { modules } = usePipelineStore();

  if (!node) return null;

  // Find module by ID from store
  const moduleDefinitions = mapModulesToDefinitions(modules);
  const module = moduleDefinitions.find(m => m.id === node.data.moduleId);

  if (!module) {
    return (
      <Paper
        sx={{
          width: 400,
          height: '100%',
          borderLeft: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Alert severity="warning">
            Module configuration not found. Please ensure modules are loaded from the backend.
          </Alert>
        </Box>
      </Paper>
    );
  }

  const handleConfigChange = (fieldName: string, value: any) => {
    const updatedConfig = {
      ...node.data.config,
      [fieldName]: value,
    };
    onUpdate(node.id, updatedConfig);
  };

  const handlePresetChange = (presetId: string) => {
    if (!module.presets) return;

    const preset = module.presets.find((p: any) => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      onUpdate(node.id, preset.config);
    }
  };

  const renderConfigField = (field: any) => {
    const value = node.data.config[field.name] ?? field.defaultValue ?? '';

    switch (field.type) {
      case 'text':
        return (
          <TextField
            key={field.name}
            fullWidth
            size="small"
            label={field.label}
            value={value}
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            helperText={field.helperText}
          />
        );

      case 'number':
        return (
          <TextField
            key={field.name}
            fullWidth
            size="small"
            type="number"
            label={field.label}
            value={value}
            onChange={(e) => handleConfigChange(field.name, Number(e.target.value))}
            required={field.required}
            placeholder={field.placeholder}
            helperText={field.helperText}
          />
        );

      case 'select':
        return (
          <FormControl key={field.name} fullWidth size="small" required={field.required}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              label={field.label}
              onChange={(e) => handleConfigChange(field.name, e.target.value)}
            >
              {field.options?.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'boolean':
        return (
          <FormControlLabel
            key={field.name}
            control={
              <Switch
                checked={Boolean(value)}
                onChange={(e) => handleConfigChange(field.name, e.target.checked)}
              />
            }
            label={field.label}
          />
        );

      case 'code':
      case 'json':
        return (
          <TextField
            key={field.name}
            fullWidth
            multiline
            rows={4}
            size="small"
            label={field.label}
            value={value}
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            helperText={field.helperText}
            sx={{ fontFamily: 'monospace' }}
          />
        );

      case 'file-upload':
        return (
          <FileUploadField
            key={field.name}
            label={field.label}
            value={value}
            onChange={(fileId) => handleConfigChange(field.name, fileId)}
            accept={field.accept}
            description={field.helperText}
            required={field.required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Paper
      sx={{
        width: 350,
        height: '100%',
        overflow: 'auto',
        borderLeft: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: node.data.color,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {node.data.moduleName}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {module.description}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </Box>

      {/* Node Info */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Node Information
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label={node.data.moduleId}
            size="small"
            variant="outlined"
          />
          <Chip
            label={module.type.toUpperCase()}
            size="small"
            sx={{
              bgcolor: `${node.data.color}20`,
              color: node.data.color,
              fontWeight: 'bold',
            }}
          />
        </Box>
      </Box>

      <Divider />

      {/* Configuration Presets */}
      {module.presets && module.presets.length > 0 && (
        <>
          <Box sx={{ p: 2, bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Bookmarks fontSize="small" color="primary" />
              <Typography variant="subtitle2" fontWeight="bold">
                Configuration Presets
              </Typography>
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel>Select a preset</InputLabel>
              <Select
                value={selectedPreset}
                label="Select a preset"
                onChange={(e) => handlePresetChange(e.target.value)}
              >
                <MenuItem value="">
                  <em>Custom Configuration</em>
                </MenuItem>
                {module.presets.map((preset: any) => (
                  <MenuItem key={preset.id} value={preset.id}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {preset.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {preset.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedPreset && (
              <Alert severity="info" sx={{ mt: 1, py: 0 }}>
                <Typography variant="caption">
                  Preset applied. You can still customize the configuration below.
                </Typography>
              </Alert>
            )}
          </Box>
          <Divider />
        </>
      )}

      {/* Configuration Fields */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Configuration
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {module.configSchema.map(renderConfigField)}
        </Box>
      </Box>

      <Divider />

      {/* Actions */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<SaveAs />}
          fullWidth
          color="primary"
          onClick={() => {
            // TODO: Implement save as template dialog
            alert('Save as Template - Coming soon!\nThis will allow you to save your current configuration as a reusable template.');
          }}
        >
          Save as Template
        </Button>
        <Button
          variant="outlined"
          startIcon={<ContentCopy />}
          fullWidth
          disabled
        >
          Duplicate Node
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          fullWidth
          onClick={() => {
            onDelete(node.id);
            onClose();
          }}
        >
          Delete Node
        </Button>
      </Box>
    </Paper>
  );
};
