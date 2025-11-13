/**
 * Custom Node Component for Pipeline Builder
 */
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Paper, Typography, IconButton, Chip } from '@mui/material';
import {
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
  Settings,
  PlayArrow,
  CheckCircle,
  Error as ErrorIcon,
  HourglassEmpty,
} from '@mui/icons-material';
import { PipelineNode } from '../../types/pipelineBuilder';

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

const statusColors = {
  idle: '#6b7280',
  running: '#3b82f6',
  success: '#10b981',
  error: '#ef4444',
};

const statusIcons = {
  idle: <HourglassEmpty fontSize="small" />,
  running: <PlayArrow fontSize="small" />,
  success: <CheckCircle fontSize="small" />,
  error: <ErrorIcon fontSize="small" />,
};

export const CustomNode = memo(({ data, selected }: NodeProps<PipelineNode['data']>) => {
  const showInputHandle = data.inputs !== 0;
  const showOutputHandle = data.outputs !== 0;

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        minWidth: 140,
        maxWidth: 180,
        border: selected ? `2px solid ${data.color}` : '2px solid transparent',
        borderRadius: 1.5,
        overflow: 'hidden',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      {/* Input Handle */}
      {showInputHandle && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: data.color,
            width: 10,
            height: 10,
            border: '2px solid white',
          }}
        />
      )}

      {/* Node Header */}
      <Box
        sx={{
          backgroundColor: data.color,
          color: 'white',
          px: 1,
          py: 0.75,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
        }}
      >
        <Box sx={{ fontSize: 16 }}>{iconMap[data.icon]}</Box>
        <Typography variant="caption" fontWeight="bold" sx={{ flex: 1, fontSize: '0.75rem' }}>
          {data.moduleName}
        </Typography>
        <IconButton size="small" sx={{ color: 'white', p: 0.25 }}>
          <Settings sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      {/* Node Body */}
      <Box sx={{ px: 1, py: 0.75 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            fontSize: '0.65rem',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {data.label}
        </Typography>

        {/* Status & Metrics */}
        {data.status && (
          <Box sx={{ mt: 0.5 }}>
            <Chip
              size="small"
              icon={statusIcons[data.status]}
              label={data.status.charAt(0).toUpperCase() + data.status.slice(1)}
              sx={{
                height: 18,
                fontSize: '0.65rem',
                backgroundColor: `${statusColors[data.status]}20`,
                color: statusColors[data.status],
                fontWeight: 'bold',
                '& .MuiChip-icon': {
                  color: statusColors[data.status],
                  fontSize: 12,
                  marginLeft: '4px',
                },
                '& .MuiChip-label': {
                  px: 0.5,
                },
              }}
            />
          </Box>
        )}
      </Box>

      {/* Output Handle */}
      {showOutputHandle && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: data.color,
            width: 10,
            height: 10,
            border: '2px solid white',
          }}
        />
      )}
    </Paper>
  );
});

CustomNode.displayName = 'CustomNode';
