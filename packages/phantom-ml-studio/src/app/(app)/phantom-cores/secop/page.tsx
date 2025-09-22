'use client';

// Phantom SecOp Core Management - Security Operations Dashboard
// Provides comprehensive GUI for security operations and orchestration

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Security as SecurityIcon,
  PlayCircleOutline as OrchestrationIcon,
  Assignment as PlaybookIcon,
  Speed as AutomationIcon,
  Report as ReportIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  Shield as ShieldIcon,
  Settings as ConfigIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces
interface SecOpStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      active_workflows: number;
      automated_responses: number;
      soc_efficiency: number;
    };
  };
}

interface WorkflowExecution {
  execution_id: string;
  workflow_profile: {
    name: string;
    type: string;
    priority: string;
    estimated_duration: string;
  };
  execution_status: string;
  steps_completed: number;
  total_steps: number;
  outputs: any[];
  recommendations: string[];
}

// API functions
const fetchSecOpStatus = async (): Promise<SecOpStatus> => {
  const response = await fetch('/api/phantom-cores/secop?operation=status');
  return response.json();
};

const executeWorkflow = async (workflowData: any) => {
  const response = await fetch('/api/phantom-cores/secop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'execute-workflow',
      workflowData
    })
  });
  return response.json();
};

const orchestrateResponse = async (responseData: any) => {
  const response = await fetch('/api/phantom-cores/secop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'orchestrate-response',
      responseData
    })
  });
  return response.json();
};

const optimizeOperations = async (optimizationData: any) => {
  const response = await fetch('/api/phantom-cores/secop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'optimize-operations',
      optimizationData
    })
  });
  return response.json();
};

// Component: SecOp Overview
const SecOpOverview: React.FC<{ status: SecOpStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">SecOp system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  // Add null check for metrics
  if (!metrics) {
    return (
      <Alert severity="info">SecOp metrics are currently being initialized...</Alert>
    );
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'success';
    if (efficiency >= 70) return 'warning';
    return 'error';
  };

  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>System Status</Typography>
            <Chip
              icon={status.data.status === 'operational' ? <CheckCircleIcon /> : <WarningIcon />}
              label={status.data.status || 'Unknown'}
              color={status.data.status === 'operational' ? 'success' : 'warning'}
            />
            <Typography variant="body2" color="textSecondary" mt={1}>
              Uptime: {metrics.uptime || 'N/A'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>SOC Efficiency</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.soc_efficiency || 0}
                size={60}
                color={getEfficiencyColor(metrics.soc_efficiency || 0)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getEfficiencyColor(metrics.soc_efficiency || 0)}>
                  {(metrics.soc_efficiency || 0).toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Operational Efficiency
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active Workflows</Typography>
            <Typography variant="h3" color="primary">
              {metrics.active_workflows || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Currently executing workflows
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Automated Responses</Typography>
            <Typography variant="h3" color="success.main">
              {(metrics.automated_responses || 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Responses automated today
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

// Component: Workflow Execution Panel
const WorkflowExecutionPanel: React.FC = () => {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [loading, setLoading] = useState(false);
  const [workflowType, setWorkflowType] = useState('incident_response');
  const [priority, setPriority] = useState('high');

  const workflowTypes = [
    'incident_response',
    'threat_hunting',
    'vulnerability_management',
    'compliance_audit',
    'forensic_analysis'
  ];

  const priorities = ['low', 'medium', 'high', 'critical'];

  const runWorkflow = async () => {
    setLoading(true);
    try {
      const result = await executeWorkflow({
        workflow_name: `${workflowType.replace('_', ' ')} Workflow`,
        workflow_type: workflowType,
        priority: priority,
        automation_level: 'semi_automated',
        trigger_event: 'manual_execution'
      });
      setExecution(result.data);
    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Workflow Execution</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Workflow Type</InputLabel>
              <Select
                value={workflowType}
                onChange={(e) => setWorkflowType(e.target.value)}
                label="Workflow Type"
              >
                {workflowTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ').replace(//b/w/g, l => l.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                label="Priority"
              >
                {priorities.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<PlaybookIcon />}
              onClick={runWorkflow}
              disabled={loading}
            >
              Execute
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {execution && (
          <Box>
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Workflow Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Name:</strong> {execution.workflow_profile.name}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Type:</strong> {execution.workflow_profile.type}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Priority:</strong> {execution.workflow_profile.priority}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Est. Duration:</strong> {execution.workflow_profile.estimated_duration}
                  </Typography>
                </Paper>
              </Box>

              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Execution Status</Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Chip
                      label={execution.execution_status}
                      color={execution.execution_status === 'completed' ? 'success' : 'primary'}
                    />
                  </Box>
                  <Typography variant="body2" mb={1}>
                    Progress: {execution.steps_completed}/{execution.total_steps} steps
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(execution.steps_completed / execution.total_steps) * 100}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    Execution ID: {execution.execution_id}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Workflow Outputs</Typography>
                  <List dense>
                    {execution.outputs?.slice(0, 4).map((output, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={output.description || `Output ${index + 1}`}
                          secondary={output.value || 'Processing...'}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>

              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Recommendations</Typography>
                  <List dense>
                    {execution.recommendations?.slice(0, 4).map((recommendation, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ShieldIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={recommendation}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Component: SecOp Operations Panel
const SecOpOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'orchestrate',
      title: 'Response Orchestration',
      description: 'Orchestrate automated security response workflows',
      icon: <OrchestrationIcon />,
      action: async () => {
        const result = await orchestrateResponse({
          incident_type: 'security_breach',
          response_level: 'automated',
          coordination_scope: 'enterprise_wide',
          stakeholders: ['soc_team', 'incident_response', 'management']
        });
        return result.data;
      }
    },
    {
      id: 'optimize',
      title: 'Operations Optimization',
      description: 'Analyze and optimize security operations efficiency',
      icon: <AutomationIcon />,
      action: async () => {
        const result = await optimizeOperations({
          optimization_scope: 'soc_operations',
          metrics_period: '30_days',
          improvement_areas: ['response_time', 'false_positives', 'resource_utilization']
        });
        return result.data;
      }
    },
    {
      id: 'dashboard',
      title: 'SOC Dashboard',
      description: 'Generate comprehensive SOC operational dashboard',
      icon: <DashboardIcon />,
      action: async () => {
        const result = await fetch('/api/phantom-cores/secop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'generate-dashboard',
            dashboard_type: 'soc_operational',
            time_range: '24_hours',
            metrics: ['alerts', 'incidents', 'response_times', 'threat_levels']
          })
        });
        const data = await result.json();
        return data.data;
      }
    }
  ];

  const runOperation = async (operation: any) => {
    setLoading(true);
    setActiveOperation(operation.id);
    try {
      const result = await operation.action();
      setOperationResult(result);
    } catch (error) {
      console.error(`${operation.title} failed:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Security Operations</Typography>

        <Box display="flex" flexWrap="wrap" gap={2}>
          {operations.map((operation) => (
            <Box flex="1 1 300px" minWidth="300px" key={operation.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    {operation.icon}
                    <Typography variant="subtitle1" sx={{ ml: 1 }}>
                      {operation.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    {operation.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => runOperation(operation)}
                    disabled={loading && activeOperation === operation.id}
                  >
                    {loading && activeOperation === operation.id ? 'Running...' : 'Execute'}
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {loading && (
          <Box mt={2}>
            <LinearProgress />
            <Typography variant="body2" color="textSecondary" mt={1}>
              Executing {operations.find(op => op.id === activeOperation)?.title}...
            </Typography>
          </Box>
        )}

        {operationResult && (
          <Box mt={2}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Operation Results</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '400px' }}>
                  {JSON.stringify(operationResult, null, 2)}
                </pre>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Main Component: SecOp Management Dashboard
const SecOpManagementDashboard: React.FC = () => {
  const { data: secOpStatus, isLoading, error } = useQuery({
    queryKey: ['secop-status'],
    queryFn: fetchSecOpStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading SecOp Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !secOpStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load SecOp system status. Please ensure the SecOp core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <SecurityIcon sx={{ mr: 2, fontSize: 32, color: '#3f51b5' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Security Operations Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Enterprise Security Operations & Orchestration Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <SecOpOverview status={secOpStatus} />
        <WorkflowExecutionPanel />
        <SecOpOperationsPanel />
      </Box>
    </Box>
  );
};

export default SecOpManagementDashboard;
