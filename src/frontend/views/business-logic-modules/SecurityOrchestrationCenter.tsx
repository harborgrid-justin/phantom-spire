/**
 * Security Orchestration Center
 * Centralized security workflow orchestration and automation
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { 
  PlayArrow,
  Pause,
  Stop,
  CheckCircle,  Error as ErrorIcon,
  Schedule,
  Build,
  Security,
  Sync
} from '@mui/icons-material';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';
import { Status, Priority } from '../../types/index';

export const SecurityOrchestrationCenter: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('security-orchestration');

  const [workflows, setWorkflows] = useState<any[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Sample workflow definitions
  const workflowTemplates = [
    {
      name: 'Incident Response Workflow',
      type: 'incident_response',
      tools: ['threat_intel', 'forensics', 'containment', 'notification'],
      description: 'Automated incident response and containment'
    },
    {
      name: 'Threat Hunting Workflow',
      type: 'threat_hunting',
      tools: ['data_collection', 'analysis', 'correlation', 'reporting'],
      description: 'Proactive threat hunting and analysis'
    },
    {
      name: 'Vulnerability Management',
      type: 'vuln_management',
      tools: ['scanning', 'assessment', 'prioritization', 'remediation'],
      description: 'End-to-end vulnerability management'
    }
  ];

  const executeWorkflow = async (template: any) => {
    try {
      setIsExecuting(true);
      const response = await businessLogic.execute('orchestrate-workflow', {
        workflow_type: template.type,
        tools: template.tools,
        parameters: {
          priority: 'high',
          automated: true
        }
      });

      setActiveWorkflow(response);
      setWorkflows(prev => [...prev, response]);
      addNotification('success', `Workflow "${template.name}" initiated successfully`);
    } catch (error) {
      addNotification('error', `Failed to execute workflow: ${error}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const getStepStatus = (step: any) => {
    switch (step.status) {
      case 'completed': return 'success';
      case 'running': return 'primary';
      case 'failed': return 'error';
      default: return 'disabled';
    }
  };

  const getStepIcon = (step: any) => {
    switch (step.status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'running': return <CircularProgress size={20} />;
      case 'failed': return <ErrorIcon color="error" />;
      default: return <Schedule />;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  if (!isFullyLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Security Orchestration...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Sync sx={{ mr: 2, fontSize: 40 }} />
        Security Orchestration Center
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Orchestrate security tools and processes across your environment with automated workflows.
      </Typography>

      {hasErrors && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Some orchestration services are experiencing issues. Some workflows may be affected.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Workflow Templates */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Build sx={{ mr: 1 }} />
                Workflow Templates
              </Typography>
              
              <List>
                {workflowTemplates.map((template, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <Security />
                    </ListItemIcon>
                    <ListItemText
                      primary={template.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {template.description}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            {template.tools.map((tool, idx) => (
                              <Chip
                                key={idx}
                                label={tool}
                                size="small"
                                variant="outlined"
                                sx={{ mr: 1, mb: 1 }}
                              />
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => executeWorkflow(template)}
                      disabled={isExecuting}
                      startIcon={<PlayArrow />}
                    >
                      Execute
                    </Button>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Workflow */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Workflow
              </Typography>
              
              {activeWorkflow ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {activeWorkflow.workflow_type?.replace('_', ' ').toUpperCase()}
                    </Typography>
                    <Chip
                      label={activeWorkflow.workflow_status}
                      color={activeWorkflow.workflow_status === 'completed' ? 'success' : 'primary'}
                      sx={{ mb: 2 }}
                    />
                  </Box>

                  <Stepper orientation="vertical">
                    {activeWorkflow.steps?.map((step: any, index: number) => (
                      <Step key={index} active={step.status === 'running'} completed={step.status === 'completed'}>
                        <StepLabel
                          icon={getStepIcon(step)}
                          error={step.status === 'failed'}
                        >
                          {step.tool_name}
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2" color="textSecondary">
                            Order: {step.order} | Duration: {formatDuration(step.estimated_duration)}
                          </Typography>
                          {step.status === 'running' && (
                            <LinearProgress sx={{ mt: 1, mb: 1 }} />
                          )}
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Estimated Completion: {activeWorkflow.estimated_completion ? 
                        new Date(activeWorkflow.estimated_completion).toLocaleTimeString() : 'N/A'}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="textSecondary">
                    No active workflow. Select a template to start orchestration.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Workflow History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Workflows
              </Typography>
              
              {workflows.length > 0 ? (
                <List>
                  {workflows.slice(-5).map((workflow, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        {workflow.workflow_status === 'completed' ? 
                          <CheckCircle color="success" /> : 
                          workflow.workflow_status === 'failed' ? 
                          <ErrorIcon color="error" /> : 
                          <CircularProgress size={20} />
                        }
                      </ListItemIcon>
                      <ListItemText
                        primary={workflow.workflow_type?.replace('_', ' ').toUpperCase()}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              ID: {workflow.orchestration_id?.slice(0, 8)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Steps: {workflow.total_steps} | Status: {workflow.workflow_status}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip
                        label={workflow.workflow_status}
                        color={workflow.workflow_status === 'completed' ? 'success' : 
                               workflow.workflow_status === 'failed' ? 'error' : 'primary'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="textSecondary">
                    No workflow history available. Execute a workflow to see results here.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Orchestration Status
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {workflows.filter(w => w.workflow_status === 'completed').length}
                    </Typography>
                    <Typography variant="body2">Completed</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="warning">
                      {workflows.filter(w => w.workflow_status === 'running').length}
                    </Typography>
                    <Typography variant="body2">Running</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="error">
                      {workflows.filter(w => w.workflow_status === 'failed').length}
                    </Typography>
                    <Typography variant="body2">Failed</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success">
                      95%
                    </Typography>
                    <Typography variant="body2">Success Rate</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};