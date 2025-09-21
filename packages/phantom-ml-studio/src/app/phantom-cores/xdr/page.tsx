'use client';

// Phantom XDR Core Management - Extended Detection and Response Interface
// Provides comprehensive GUI for enterprise XDR capabilities

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
  ListItemIcon
} from '@mui/material';
import {
  Security as SecurityIcon,
  Search as SearchIcon,
  BugReport as ThreatIcon,
  Investigation as InvestigateIcon,
  PlayArrow as ResponseIcon,
  Psychology as BehaviorIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces
interface XDRSystemStatus {
  success: boolean;
  data?: {
    status_id: string;
    system_overview: {
      overall_status: string;
      system_health: string;
      uptime: string;
      current_load: string;
    };
    performance_metrics: {
      events_per_second: number;
      detection_latency: string;
      response_time: string;
    };
    threat_landscape: {
      active_threats: number;
      blocked_threats: number;
      investigated_incidents: number;
    };
    enterprise_coverage: {
      monitored_endpoints: number;
      network_sensors: number;
      cloud_integrations: number;
    };
  };
}

interface ThreatAnalysis {
  analysis_id: string;
  threat_overview: {
    total_threats_detected: number;
    critical_threats: number;
    high_priority_threats: number;
    medium_priority_threats: number;
  };
  detection_engines: any;
  recommendations: string[];
  timestamp: string;
}

// API functions
const fetchXDRStatus = async (): Promise<XDRSystemStatus> => {
  const response = await fetch('/api/phantom-cores/xdr?operation=status');
  return response.json();
};

const performThreatDetection = async (analysisData: any) => {
  const response = await fetch('/api/phantom-cores/xdr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'detect-threats',
      analysisData
    })
  });
  return response.json();
};

const investigateIncident = async (incidentData: any) => {
  const response = await fetch('/api/phantom-cores/xdr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'investigate-incident',
      incidentData
    })
  });
  return response.json();
};

const conductThreatHunt = async (huntParameters: any) => {
  const response = await fetch('/api/phantom-cores/xdr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'threat-hunt',
      huntParameters
    })
  });
  return response.json();
};

// Component: XDR System Overview
const XDRSystemOverview: React.FC<{ status: XDRSystemStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">XDR system status unavailable</Alert>
    );
  }

  const { system_overview, performance_metrics, threat_landscape, enterprise_coverage } = status.data;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>System Health</Typography>
            <Chip
              icon={system_overview.overall_status === 'operational' ? <CheckCircleIcon /> : <WarningIcon />}
              label={system_overview.overall_status}
              color={system_overview.overall_status === 'operational' ? 'success' : 'warning'}
            />
            <Typography variant="body2" color="textSecondary" mt={1}>
              Uptime: {system_overview.uptime}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Load: {system_overview.current_load}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Performance</Typography>
            <Typography variant="body2" color="textSecondary">
              Events/sec: <strong>{performance_metrics.events_per_second.toLocaleString()}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Detection: <strong>{performance_metrics.detection_latency}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Response: <strong>{performance_metrics.response_time}</strong>
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Threat Landscape</Typography>
            <Typography variant="body2" color="textSecondary">
              Active: <strong style={{ color: '#f44336' }}>{threat_landscape.active_threats}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Blocked: <strong style={{ color: '#4caf50' }}>{threat_landscape.blocked_threats.toLocaleString()}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Investigated: <strong>{threat_landscape.investigated_incidents}</strong>
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Coverage</Typography>
            <Typography variant="body2" color="textSecondary">
              Endpoints: <strong>{enterprise_coverage.monitored_endpoints.toLocaleString()}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Sensors: <strong>{enterprise_coverage.network_sensors}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Cloud: <strong>{enterprise_coverage.cloud_integrations}</strong>
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Component: Threat Detection Panel
const ThreatDetectionPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<ThreatAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [scope, setScope] = useState('enterprise_wide');

  const runThreatDetection = async () => {
    setLoading(true);
    try {
      const result = await performThreatDetection({
        scope,
        analysis_depth: 'comprehensive',
        detection_config: {
          enable_behavioral: true,
          enable_ml_anomaly: true,
          enable_signature: true,
          enable_threat_intel: true
        }
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Threat detection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Advanced Threat Detection</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Analysis Scope</InputLabel>
              <Select value={scope} onChange={(e) => setScope(e.target.value)} label="Analysis Scope">
                <MenuItem value="enterprise_wide">Enterprise Wide</MenuItem>
                <MenuItem value="network_perimeter">Network Perimeter</MenuItem>
                <MenuItem value="endpoint_focused">Endpoint Focused</MenuItem>
                <MenuItem value="cloud_infrastructure">Cloud Infrastructure</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<ThreatIcon />}
              onClick={runThreatDetection}
              disabled={loading}
            >
              Detect Threats
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {analysis && (
          <Box>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Threat Overview</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2">Total Detected:</Typography>
                      <Typography variant="h5" color="primary">
                        {analysis.threat_overview.total_threats_detected}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">Critical:</Typography>
                      <Typography variant="h5" color="error">
                        {analysis.threat_overview.critical_threats}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">High Priority:</Typography>
                      <Typography variant="h6" color="warning.main">
                        {analysis.threat_overview.high_priority_threats}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">Medium Priority:</Typography>
                      <Typography variant="h6" color="info.main">
                        {analysis.threat_overview.medium_priority_threats}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Recommendations</Typography>
                  <List dense>
                    {analysis.recommendations.map((recommendation, index) => (
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
              </Grid>
            </Grid>

            <Typography variant="caption" color="textSecondary">
              Analysis ID: {analysis.analysis_id} | Generated: {new Date(analysis.timestamp).toLocaleString()}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Component: XDR Operations Panel
const XDROperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'investigate',
      title: 'Incident Investigation',
      description: 'Comprehensive forensic analysis and incident investigation',
      icon: <InvestigateIcon />,
      action: async () => {
        const result = await investigateIncident({
          incident_type: 'security_alert',
          investigation_scope: {
            timeline: '72_hours',
            forensic_depth: 'comprehensive'
          }
        });
        return result.data;
      }
    },
    {
      id: 'hunt',
      title: 'Threat Hunting',
      description: 'Proactive threat hunting across enterprise environment',
      icon: <SearchIcon />,
      action: async () => {
        const result = await conductThreatHunt({
          hunt_name: 'Enterprise Security Hunt',
          hunt_scope: 'enterprise_environment',
          hypotheses: [
            {
              hypothesis: 'APT group using living-off-the-land techniques',
              techniques: ['T1059.001', 'T1070.004', 'T1218.011']
            }
          ]
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
        <Typography variant="h6" gutterBottom>XDR Operations</Typography>

        <Grid container spacing={2}>
          {operations.map((operation) => (
            <Grid item xs={12} md={6} key={operation.id}>
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
            </Grid>
          ))}
        </Grid>

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
                <pre style={{ fontSize: '12px', overflow: 'auto' }}>
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

// Main Component: XDR Management Dashboard
const XDRManagementDashboard: React.FC = () => {
  const { data: xdrStatus, isLoading, error } = useQuery({
    queryKey: ['xdr-status'],
    queryFn: fetchXDRStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading XDR Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !xdrStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load XDR system status. Please ensure the XDR core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <SecurityIcon sx={{ mr: 2, fontSize: 32, color: '#f44336' }} />
        <Box>
          <Typography variant="h4" component="h1">
            XDR Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Extended Detection and Response - Enterprise Security Operations
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <XDRSystemOverview status={xdrStatus} />
        </Grid>

        <Grid item xs={12}>
          <ThreatDetectionPanel />
        </Grid>

        <Grid item xs={12}>
          <XDROperationsPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default XDRManagementDashboard;