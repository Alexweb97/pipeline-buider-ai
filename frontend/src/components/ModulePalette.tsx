/**
 * Module Palette Component - Sidebar with draggable modules
 */
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ExpandMore,
  Search,
  Storage as DatabaseIcon,
  Description,
  Api,
  FilterAlt,
  Transform,
  Functions,
  Merge,
  FilterList,
  Storage,
  Cloud,
} from '@mui/icons-material';
import { MODULE_DEFINITIONS, ModuleDefinition, ModuleCategory } from '../types/pipelineBuilder';

const iconMap: Record<string, React.ReactNode> = {
  Database: <DatabaseIcon />,
  Description: <Description />,
  Api: <Api />,
  FilterAlt: <FilterAlt />,
  Transform: <Transform />,
  Functions: <Functions />,
  Merge: <Merge />,
  FilterList: <FilterList />,
  Storage: <Storage />,
  Cloud: <Cloud />,
};

const categoryLabels: Record<ModuleCategory, string> = {
  extractors: 'Data Extractors',
  transformers: 'Transformers',
  loaders: 'Data Loaders',
};

interface ModulePaletteProps {
  onDragStart: (event: React.DragEvent, module: ModuleDefinition) => void;
}

export const ModulePalette: React.FC<ModulePaletteProps> = ({ onDragStart }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<string[]>(['extractors', 'transformers', 'loaders']);

  const handleAccordionChange = (panel: string) => {
    setExpanded((prev) =>
      prev.includes(panel) ? prev.filter((p) => p !== panel) : [...prev, panel]
    );
  };

  const filteredModules = MODULE_DEFINITIONS.filter((module) =>
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modulesByCategory = (category: ModuleCategory) =>
    filteredModules.filter((m) => m.category === category);

  return (
    <Paper
      sx={{
        width: 320,
        height: '100%',
        overflow: 'auto',
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Module Library
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Search modules..."
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
      </Box>

      {/* Module Categories */}
      <Box sx={{ p: 1 }}>
        {(['extractors', 'transformers', 'loaders'] as ModuleCategory[]).map((category) => {
          const modules = modulesByCategory(category);
          if (modules.length === 0) return null;

          return (
            <Accordion
              key={category}
              expanded={expanded.includes(category)}
              onChange={() => handleAccordionChange(category)}
              elevation={0}
              disableGutters
              sx={{
                '&:before': { display: 'none' },
                mb: 1,
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {categoryLabels[category]}
                </Typography>
                <Chip
                  label={modules.length}
                  size="small"
                  sx={{ ml: 'auto', mr: 1 }}
                />
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List dense>
                  {modules.map((module) => (
                    <ListItem
                      key={module.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, module)}
                      sx={{
                        cursor: 'grab',
                        borderRadius: 1,
                        mb: 0.5,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          borderColor: module.color,
                        },
                        '&:active': {
                          cursor: 'grabbing',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: module.color,
                        }}
                      >
                        {iconMap[module.icon]}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="medium">
                            {module.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {module.description}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {/* Help Text */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Drag modules onto the canvas to build your pipeline. Connect nodes by dragging from output to input handles.
        </Typography>
      </Box>
    </Paper>
  );
};
