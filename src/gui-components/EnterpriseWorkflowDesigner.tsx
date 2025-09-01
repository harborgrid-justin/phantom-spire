import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Zoom,
  Fade,
  useTheme,
  styled,
  alpha
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Settings,
  Visibility,
  Delete,
  ZoomIn,
  ZoomOut,
  Fullscreen
} from '@mui/icons-material';

// UI/UX Evaluation System Integration
import { addUIUXEvaluation } from '../services/ui-ux-evaluation';

// Enterprise-grade workflow designer with Fortune 100 UI/UX standards
const EnterpriseWorkflowDesigner: React.FC = () => {
  const theme = useTheme();
  const [workflows, setWorkflows] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Initialize UI/UX Evaluation System
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('enterprise-workflow-designer', {
      continuous: true,
      position: 'top-right', // Different position to avoid conflicts with dashboard
      minimized: true, // Start minimized for workflow designer to avoid interfering with workflow canvas
      interval: 45000 // Evaluate every 45 seconds
    });

    // Cleanup on unmount
    return () => {
      evaluationController.remove();
    };
  }, []);

  // Styled components following Material Design 3.0 principles
  const DesignerCanvas = styled(Paper)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    height: '800px',
    backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#fafafa',
    backgroundImage: `
      linear-gradient(${alpha(theme.palette.primary.main, 0.1)} 1px, transparent 1px),
      linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.1)} 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
    overflow: 'hidden',
    cursor: 'grab',
    '&:active': {
      cursor: 'grabbing'
    }
  }));

  const WorkflowNode = styled(Box)(({ theme, nodeType }) => ({
    position: 'absolute',
    width: '160px',
    height: '80px',
    backgroundColor: getNodeColor(nodeType, theme),
    borderRadius: '12px',
    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    boxShadow: theme.shadows[4],
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[8],
      borderColor: theme.palette.primary.main
    },
    '&.selected': {
      borderColor: theme.palette.secondary.main,
      boxShadow: `0 0 0 4px ${alpha(theme.palette.secondary.main, 0.2)}`
    },
    '&.executing': {
      animation: 'pulse 2s infinite',
      borderColor: theme.palette.success.main
    }
  }));

  // Enterprise workflow node types
  const workflowNodeTypes = [
    {
      type: 'threat-detection',
      label: 'Threat Detection',
      icon: '🛡️',
      description: 'AI-powered threat identification and classification'
    },
    {
      type: 'evidence-collection',
      label: 'Evidence Collection',
      icon: '📋',
      description: 'Automated forensics and evidence gathering'
    },
    {
      type: 'incident-response',
      label: 'Incident Response',
      icon: '🚨',
      description: 'Orchestrated incident handling and escalation'
    },
    {
      type: 'threat-analysis',
      label: 'Threat Analysis',
      icon: '🔍',
      description: 'Deep threat intelligence and correlation'
    },
    {
      type: 'automated-mitigation',
      label: 'Auto Mitigation',
      icon: '⚡',
      description: 'Automated threat containment and remediation'
    },
    {
      type: 'compliance-check',
      label: 'Compliance Check',
      icon: '✅',
      description: 'Regulatory compliance validation'
    }
  ];

  const getNodeColor = (nodeType: string, theme: any) => {
    const colors = {
      'threat-detection': alpha(theme.palette.error.main, 0.1),
      'evidence-collection': alpha(theme.palette.info.main, 0.1),
      'incident-response': alpha(theme.palette.warning.main, 0.1),
      'threat-analysis': alpha(theme.palette.primary.main, 0.1),
      'automated-mitigation': alpha(theme.palette.success.main, 0.1),
      'compliance-check': alpha(theme.palette.secondary.main, 0.1)
    };
    return colors[nodeType] || alpha(theme.palette.grey[500], 0.1);
  };

  // Advanced drag and drop with enterprise UX
  const [{ isDragging }, drag] = useDrag({
    type: 'workflow-node',
    item: { nodeType: selectedNode?.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'workflow-node',
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (clientOffset) {
        // Add new node to canvas
        const newNode = {
          id: `node-${Date.now()}`,
          type: item.nodeType,
          x: clientOffset.x,
          y: clientOffset.y,
          status: 'idle'
        };
        setWorkflows(prev => [...prev, newNode]);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  // Enterprise workflow execution simulation
  const executeWorkflow = useCallback(async () => {
    setIsExecuting(true);
    
    // Simulate Fortune 100-grade workflow execution
    for (const node of workflows) {
      node.status = 'executing';
      setWorkflows([...workflows]);
      
      // Simulate processing time based on node type
      const processingTime = {
        'threat-detection': 2000,
        'evidence-collection': 3000,
        'incident-response': 1500,
        'threat-analysis': 4000,
        'automated-mitigation': 2500,
        'compliance-check': 1000
      }[node.type] || 2000;
      
      await new Promise(resolve => setTimeout(resolve, processingTime));
      
      node.status = 'completed';
      setWorkflows([...workflows]);
    }
    
    setIsExecuting(false);
  }, [workflows]);

  const controlPanelActions = useMemo(() => [
    {
      icon: <PlayArrow />,
      label: 'Execute Workflow',
      action: executeWorkflow,
      disabled: isExecuting || workflows.length === 0,
      color: 'success'
    },
    {
      icon: <Pause />,
      label: 'Pause Execution',
      action: () => setIsExecuting(false),
      disabled: !isExecuting,
      color: 'warning'
    },
    {
      icon: <Stop />,
      label: 'Stop Workflow',
      action: () => {
        setIsExecuting(false);
        setWorkflows(workflows.map(w => ({ ...w, status: 'idle' })));
      },
      disabled: !isExecuting,
      color: 'error'
    },
    {
      icon: <ZoomIn />,
      label: 'Zoom In',
      action: () => setZoomLevel(prev => Math.min(prev + 0.25, 3)),
      color: 'primary'
    },
    {
      icon: <ZoomOut />,
      label: 'Zoom Out',
      action: () => setZoomLevel(prev => Math.max(prev - 0.25, 0.25)),
      color: 'primary'
    },
    {
      icon: <Fullscreen />,
      label: 'Fullscreen',
      action: () => setZoomLevel(1),
      color: 'primary'
    }
  ], [executeWorkflow, isExecuting, workflows, zoomLevel]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Enterprise-grade toolbar */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#ffffff'
          }}
        >
          <Typography variant="h5" component="h1" fontWeight="bold">
            🚀 Enterprise Workflow Designer
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {controlPanelActions.map((action, index) => (
              <Tooltip key={index} title={action.label} arrow TransitionComponent={Zoom}>
                <IconButton
                  onClick={action.action}
                  disabled={action.disabled}
                  color={action.color as any}
                  sx={{ 
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', flex: 1 }}>
          {/* Node palette */}
          <Paper 
            elevation={2} 
            sx={{ 
              width: 280, 
              p: 2, 
              backgroundColor: theme.palette.mode === 'dark' ? '#252525' : '#f8f9fa'
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight="bold">
              🎯 Workflow Components
            </Typography>
            
            {workflowNodeTypes.map((nodeType) => (
              <Fade in key={nodeType.type} timeout={300 * (workflowNodeTypes.indexOf(nodeType) + 1)}>
                <Paper
                  ref={drag}
                  elevation={2}
                  sx={{
                    p: 2,
                    mb: 2,
                    cursor: 'grab',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: `linear-gradient(135deg, ${getNodeColor(nodeType.type, theme)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                    '&:hover': {
                      transform: 'translateX(8px)',
                      boxShadow: theme.shadows[6]
                    }
                  }}
                  onClick={() => setSelectedNode(nodeType)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ mr: 1 }}>
                      {nodeType.icon}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {nodeType.label}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    {nodeType.description}
                  </Typography>
                </Paper>
              </Fade>
            ))}
          </Paper>

          {/* Main canvas */}
          <Box sx={{ flex: 1, position: 'relative' }}>
            <DesignerCanvas 
              ref={drop}
              elevation={1}
              sx={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left',
                opacity: isOver ? 0.8 : 1
              }}
            >
              {workflows.map((node) => (
                <WorkflowNode
                  key={node.id}
                  nodeType={node.type}
                  className={`${selectedNode?.id === node.id ? 'selected' : ''} ${node.status === 'executing' ? 'executing' : ''}`}
                  sx={{
                    left: node.x,
                    top: node.y
                  }}
                  onClick={() => setSelectedNode(node)}
                >
                  <Typography variant="h6">
                    {workflowNodeTypes.find(t => t.type === node.type)?.icon}
                  </Typography>
                  <Typography variant="caption" align="center" fontWeight="bold">
                    {workflowNodeTypes.find(t => t.type === node.type)?.label}
                  </Typography>
                  {node.status === 'executing' && (
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.success.main,
                        animation: 'pulse 1s infinite'
                      }}
                    />
                  )}
                </WorkflowNode>
              ))}
              
              {isOver && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    border: `2px dashed ${theme.palette.primary.main}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                  }}
                >
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    Drop to create workflow node
                  </Typography>
                </Box>
              )}
            </DesignerCanvas>
          </Box>
        </Box>

        {/* Status bar */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 1, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5'
          }}
        >
          <Typography variant="caption" color="textSecondary">
            🎯 Fortune 100-Grade Workflow Engine • Nodes: {workflows.length} • Zoom: {Math.round(zoomLevel * 100)}%
          </Typography>
          <Typography variant="caption" color="textSecondary">
            🚀 Enterprise CTI Platform • Status: {isExecuting ? 'Executing' : 'Ready'} • Performance: Optimal
          </Typography>
        </Paper>
      </Box>

      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </DndProvider>
  );
};

export default EnterpriseWorkflowDesigner;