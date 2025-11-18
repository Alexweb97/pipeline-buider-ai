/**
 * Pipeline Builder Page - Visual drag & drop pipeline editor
 */
import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Node,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  Save,
  PlayArrow,
  Delete,
  Settings,
  ArrowBack,
} from '@mui/icons-material';
import { CustomNode } from '../components/nodes/CustomNode';
import { ModulePalette } from '../components/ModulePalette';
import { NodeConfigPanel } from '../components/NodeConfigPanel';
import NodePreviewModal from '../components/NodePreviewModal';
import { PipelineNode, ModuleDefinition, PipelineSaveData } from '../types/pipelineBuilder';
import { apiClient } from '../api/client';

const nodeTypes = {
  extractor: CustomNode,
  transformer: CustomNode,
  loader: CustomNode,
};

const PipelineBuilderContent: React.FC = () => {
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<PipelineNode | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [pipelineName, setPipelineName] = useState('');
  const [pipelineDescription, setPipelineDescription] = useState('');
  const [pipelineType, setPipelineType] = useState<'etl' | 'elt' | 'streaming'>('etl');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewNode, setPreviewNode] = useState<PipelineNode | null>(null);

  // Handle node preview - defined early to avoid hoisting issues
  const handleNodePreview = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setPreviewNode(node as unknown as PipelineNode);
      setPreviewModalOpen(true);
    }
  }, [nodes]);

  // Sync selectedNode with nodes array when it changes
  React.useEffect(() => {
    if (selectedNode) {
      const updatedNode = nodes.find((n) => n.id === selectedNode.id);
      if (updatedNode) {
        setSelectedNode(updatedNode as unknown as PipelineNode);
      }
    }
  }, [nodes, selectedNode?.id]);

  // Ensure all nodes have the onPreview callback
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onPreview: handleNodePreview,
        },
      }))
    );
  }, [handleNodePreview, setNodes]);

  // Handle edge connections
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Handle drag over canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop module onto canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const moduleData = event.dataTransfer.getData('application/reactflow');
      if (!moduleData) return;

      const module: ModuleDefinition = JSON.parse(moduleData);
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: PipelineNode = {
        id: `${module.id}-${Date.now()}`,
        type: module.type,
        position,
        data: {
          label: `${module.name} ${nodes.length + 1}`,
          moduleId: module.id,
          moduleName: module.name,
          icon: module.icon,
          color: module.color,
          config: { ...module.defaultConfig },
          status: 'idle',
          inputs: module.type === 'extractor' ? 0 : undefined,
          outputs: module.type === 'loader' ? 0 : undefined,
          onPreview: handleNodePreview,
        },
      };

      setNodes((nds) => [...nds, newNode as Node]);
    },
    [reactFlowInstance, nodes, setNodes, handleNodePreview]
  );

  // Handle drag start from palette
  const onDragStart = (event: React.DragEvent, module: ModuleDefinition) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(module));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Handle node selection
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as PipelineNode);
  }, []);

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Update node configuration
  const onUpdateNodeConfig = useCallback(
    (nodeId: string, config: Record<string, any>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                config,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Delete node
  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  // Clear canvas
  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
  };

  // Save pipeline
  const handleSave = async () => {
    try {
      // Clean nodes by removing onPreview callbacks
      const cleanNodes = nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onPreview: undefined,
        },
      }));

      const pipelineData = {
        name: pipelineName,
        description: pipelineDescription,
        config: {
          nodes: cleanNodes,
          edges: edges,
          type: pipelineType,
        },
        tags: [],
      };

      console.log('Saving pipeline:', pipelineData);

      const response = await apiClient.post('/api/v1/pipelines', pipelineData);

      console.log('Pipeline saved successfully:', response);
      setSaveDialogOpen(false);

      // Show success message
      alert(`Pipeline "${pipelineName}" saved successfully!`);

      // Optionally: navigate to pipelines list or show a success snackbar
    } catch (error: any) {
      console.error('Failed to save pipeline:', error);
      alert(`Failed to save pipeline: ${error.response?.data?.detail || error.message || 'Unknown error'}`);
    }
  };

  // Execute pipeline
  const handleExecute = () => {
    console.log('Executing pipeline with nodes:', nodes, 'and edges:', edges);
    // TODO: Call API to execute pipeline
    alert('Pipeline execution started!');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top Toolbar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
            title="Back to Dashboard"
          >
            <ArrowBack />
          </IconButton>

          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              flexGrow: 1,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
            onClick={() => navigate('/dashboard')}
          >
            Pipeline Builder
          </Typography>

          <Chip
            label={`${nodes.length} nodes`}
            size="small"
            color="primary"
            sx={{ mr: 2 }}
          />
          <Chip
            label={`${edges.length} connections`}
            size="small"
            color="secondary"
            sx={{ mr: 3 }}
          />

          <Button
            variant="outlined"
            startIcon={<Settings />}
            size="small"
            sx={{ mr: 1 }}
            disabled
          >
            Settings
          </Button>
          <Button
            variant="outlined"
            startIcon={<Delete />}
            size="small"
            onClick={handleClear}
            sx={{ mr: 1 }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            size="small"
            onClick={() => setSaveDialogOpen(true)}
            sx={{ mr: 1 }}
            disabled={nodes.length === 0}
          >
            Save
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayArrow />}
            size="small"
            onClick={handleExecute}
            disabled={nodes.length === 0}
          >
            Execute
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Module Palette */}
        <ModulePalette onDragStart={onDragStart} />

        {/* Center - React Flow Canvas */}
        <Box
          ref={reactFlowWrapper}
          sx={{ flex: 1, bgcolor: '#f5f5f5' }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
          >
            <Background color="#aaa" gap={15} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const pipelineNode = node as PipelineNode;
                return pipelineNode.data.color || '#3b82f6';
              }}
              style={{
                backgroundColor: '#f5f5f5',
              }}
            />
          </ReactFlow>
        </Box>

        {/* Right Sidebar - Node Configuration */}
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={onUpdateNodeConfig}
            onDelete={onDeleteNode}
          />
        )}
      </Box>

      {/* Save Pipeline Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Pipeline</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Pipeline Name"
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              placeholder="My ETL Pipeline"
              required
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={pipelineDescription}
              onChange={(e) => setPipelineDescription(e.target.value)}
              placeholder="Describe what this pipeline does..."
            />
            <FormControl fullWidth>
              <InputLabel>Pipeline Type</InputLabel>
              <Select
                value={pipelineType}
                label="Pipeline Type"
                onChange={(e) => setPipelineType(e.target.value as any)}
              >
                <MenuItem value="etl">ETL (Extract, Transform, Load)</MenuItem>
                <MenuItem value="elt">ELT (Extract, Load, Transform)</MenuItem>
                <MenuItem value="streaming">Streaming</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!pipelineName.trim()}
          >
            Save Pipeline
          </Button>
        </DialogActions>
      </Dialog>

      {/* Node Preview Modal */}
      {previewNode && (
        <NodePreviewModal
          open={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setPreviewNode(null);
          }}
          node={previewNode}
          nodes={nodes as unknown as PipelineNode[]}
          edges={edges}
        />
      )}
    </Box>
  );
};

// Wrapper with ReactFlowProvider
export const PipelineBuilderPage: React.FC = () => {
  return (
    <ReactFlowProvider>
      <PipelineBuilderContent />
    </ReactFlowProvider>
  );
};
