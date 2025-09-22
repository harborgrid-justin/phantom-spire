'use client';

// Phantom Incident Response Core Management - Incident Response & Crisis Management
// Provides comprehensive GUI for incident response and crisis management operations

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Emergency as IncidentIcon,
  Support as ResponseIcon,
  Assignment as CaseIcon,
  Timeline as TimelineIcon,
  Group as TeamIcon,
  Notifications as AlertIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Speed as UrgentIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces
interface IncidentResponseStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      active_incidents: number;
      response_time_avg: string;
      resolution_rate: number;
      team_readiness: number;
    };
  };
}

interface IncidentAnalysis {
  analysis_id: string;
  incident_profile: {
    incident_id: string;
    severity_level: string;
    incident_type: string;
    response_status: string;
  };
  response_metrics: any;
  containment_actions: any;
  recommendations: string[];
}

// API functions
const fetchIncidentResponseStatus = async (): Promise<IncidentResponseStatus> => {
  const response = await fetch('/api/phantom-cores/incident-response?operation=status');
  return response.json();
};

const analyzeIncident = async (incidentData: any) => {
  const response = await fetch('/api/phantom-cores/incident-response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-incident',
      incidentData
    })
  });
  return response.json();
};

const initiateResponse = async (responseData: any) => {
  const response = await fetch('/api/phantom-cores/incident-response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'initiate-response',
      responseData
    })
  });
  return response.json();
};

const coordinateTeam = async (teamData: any) => {
  const response = await fetch('/api/phantom-cores/incident-response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'coordinate-team',
      teamData
    })
  });
  return response.json();
};

const generateIncidentReport = async (reportData: any) => {
  const response = await fetch('/api/phantom-cores/incident-response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'generate-incident-report',
      reportData
    })
  });
  return response.json();
};

// Component: Incident Response Overview
const IncidentResponseOverview: React.FC<{ status: IncidentResponseStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Incident Response system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  // Add null check for metrics
  if (!metrics) {
    return (
      <Alert severity="info">Incident Response metrics are currently being initialized...</Alert>
    );
  }

  const getReadinessColor = (readiness: number) => {
    if (readiness >= 0.9) return 'success';
    if (readiness >= 0.7) return 'warning';
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
              label={status.data.status}
              color={status.data.status === 'operational' ? 'success' : 'warning'}
            />
            <Typography variant="body2" color="textSecondary" mt={1}>
              Uptime: {metrics.uptime}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active Incidents</Typography>
            <Typography variant="h3" color="error">
              {metrics.active_incidents}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Requiring attention
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Avg Response Time</Typography>
            <Typography variant="h3" color="primary">
              {metrics.response_time_avg}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Minutes to initial response
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Team Readiness</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.team_readiness * 100}
                size={60}
                color={getReadinessColor(metrics.team_readiness)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getReadinessColor(metrics.team_readiness)}>
                  {(metrics.team_readiness * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Team Readiness
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

// Component: Incident Analysis Panel
const IncidentAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<IncidentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [incidentType, setIncidentType] = useState('security_breach');
  const [severityLevel, setSeverityLevel] = useState('HIGH');

  const incidentTypes = [
    'security_breach', 'malware_infection', 'data_breach', 'ddos_attack',
    'insider_threat', 'phishing_campaign', 'ransomware', 'system_compromise'
  ];

  const severityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const runIncidentAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeIncident({
        incident_type: incidentType,
        severity_level: severityLevel,
        analysis_scope: 'comprehensive',
        include_threat_assessment: true,
        include_impact_analysis: true,
        priority_escalation: true
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Incident analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Incident Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Incident Type</InputLabel>
              <Select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                label="Incident Type"
              >
                {incidentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={severityLevel}
                onChange={(e) => setSeverityLevel(e.target.value)}
                label="Severity"
              >
                {severityLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<IncidentIcon />}
              onClick={runIncidentAnalysis}
              disabled={loading}
            >
              Analyze
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {analysis && (
          <Box>
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Incident Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Incident ID:</strong> {analysis.incident_profile.incident_id}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Type:</strong> {analysis.incident_profile.incident_type}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1} gap={1}>
                    <Typography variant="body2" component="span">
                      <strong>Severity:</strong>
                    </Typography>
                    <Chip
                      label={analysis.incident_profile.severity_level}
                      color={analysis.incident_profile.severity_level === 'CRITICAL' ? 'error' :
                             analysis.incident_profile.severity_level === 'HIGH' ? 'warning' : 'info'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" mb={1}>
                    <strong>Response Status:</strong> {analysis.incident_profile.response_status}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Analysis ID:</strong> {analysis.analysis_id}
                  </Typography>
                </Paper>
              </Box>

              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Response Actions</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <UrgentIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Immediate containment initiated"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TeamIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Response team assembled and briefed"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Security perimeter established"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AlertIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Stakeholders notified per protocol"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Response Recommendations</Typography>
              <List dense>
                {analysis.recommendations?.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
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
        )}
      </CardContent>
    </Card>
  );
};

// Component: Incident Response Operations Panel
const IncidentResponseOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'response',
      title: 'Initiate Response',
      description: 'Activate incident response protocols and procedures',
      icon: <ResponseIcon />,
      action: async () => {
        const result = await initiateResponse({
          response_level: 'full_activation',
          team_assembly: 'immediate',
          communication_plan: 'crisis_protocol',
          escalation_matrix: 'executive_level'
        });
        return result.data;
      }
    },
    {
      id: 'coordinate',
      title: 'Team Coordination',
      description: 'Coordinate response teams and resource allocation',
      icon: <TeamIcon />,
      action: async () => {
        const result = await coordinateTeam({
          teams: ['technical_response', 'communications', 'legal', 'management'],
          coordination_mode: 'unified_command',
          resource_allocation: 'priority_based',
          status_reporting: 'real_time'
        });
        return result.data;
      }
    },
    {
      id: 'report',
      title: 'Incident Report',
      description: 'Generate comprehensive incident response report',
      icon: <AssessmentIcon />,
      action: async () => {
        const result = await generateIncidentReport({
          report_type: 'Post-Incident Analysis Report',
          include_timeline: true,
          include_lessons_learned: true,
          include_recommendations: true,
          compliance_requirements: ['SOX', 'GDPR']
        });
        return result.data;
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
        <Typography variant="h6" gutterBottom>Incident Response Operations</Typography>

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

// Main Component: Incident Response Management Dashboard
const IncidentResponseManagementDashboard: React.FC = () => {
  const { data: incidentResponseStatus, isLoading, error } = useQuery({
    queryKey: ['incident-response-status'],
    queryFn: fetchIncidentResponseStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Incident Response Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !incidentResponseStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load incident response system status. Please ensure the incident response core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <IncidentIcon sx={{ mr: 2, fontSize: 32, color: '#f44336' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Incident Response Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Emergency Response & Crisis Management Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <IncidentResponseOverview status={incidentResponseStatus} />
        <IncidentAnalysisPanel />
        <IncidentResponseOperationsPanel />
      </Box>
    </Box>
  );
};

export default IncidentResponseManagementDashboard;
