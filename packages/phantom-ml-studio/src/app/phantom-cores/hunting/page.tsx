'use client';

// Phantom Hunting Core Management - Threat Hunting & Proactive Security
// Provides comprehensive GUI for threat hunting and proactive security operations

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
  Search as HuntingIcon,
  Target as TargetIcon,
  Psychology as HypothesisIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendIcon,
  Security as ThreatIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Visibility as DetectionIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces
interface HuntingStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      active_hunts: number;
      hunt_success_rate: number;
      threats_discovered: number;
      coverage_percentage: number;
    };
  };
}

interface HuntingAnalysis {
  analysis_id: string;
  hunt_profile: {
    hunt_name: string;
    hypothesis: string;
    confidence_score: number;
    threat_level: string;
  };
  findings: any;
  ioc_matches: any;
  recommendations: string[];
}

// API functions
const fetchHuntingStatus = async (): Promise<HuntingStatus> => {
  const response = await fetch('/api/phantom-cores/hunting?operation=status');
  return response.json();
};

const conductHunt = async (huntData: any) => {
  const response = await fetch('/api/phantom-cores/hunting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'conduct-hunt',
      huntData
    })
  });
  return response.json();
};

const analyzeHypothesis = async (hypothesisData: any) => {
  const response = await fetch('/api/phantom-cores/hunting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-hypothesis',
      hypothesisData
    })
  });
  return response.json();
};

const trackIOCs = async (iocData: any) => {
  const response = await fetch('/api/phantom-cores/hunting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'track-iocs',
      iocData
    })
  });
  return response.json();
};

const generateHuntReport = async (reportData: any) => {
  const response = await fetch('/api/phantom-cores/hunting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'generate-hunt-report',
      reportData
    })
  });
  return response.json();
};

// Component: Hunting Overview
const HuntingOverview: React.FC<{ status: HuntingStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Hunting system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  const getSuccessColor = (rate: number) => {
    if (rate >= 0.8) return 'success';
    if (rate >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
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
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active Hunts</Typography>
            <Typography variant="h3" color="primary">
              {metrics.active_hunts}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Ongoing investigations
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Success Rate</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.hunt_success_rate * 100}
                size={60}
                color={getSuccessColor(metrics.hunt_success_rate)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getSuccessColor(metrics.hunt_success_rate)}>
                  {(metrics.hunt_success_rate * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Hunt Success
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Threats Discovered</Typography>
            <Typography variant="h3" color="error">
              {metrics.threats_discovered}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This week
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Component: Hunting Analysis Panel
const HuntingAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<HuntingAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [huntType, setHuntType] = useState('behavioral_anomaly');
  const [targetScope, setTargetScope] = useState('enterprise_wide');

  const huntTypes = [
    'behavioral_anomaly', 'ioc_hunting', 'ttp_tracking', 'insider_threat',
    'apt_campaign', 'lateral_movement', 'data_exfiltration', 'malware_family'
  ];

  const targetScopes = [
    'enterprise_wide', 'network_perimeter', 'endpoint_focused', 'cloud_infrastructure',
    'critical_assets', 'user_behavior', 'server_infrastructure'
  ];

  const runThreatHunt = async () => {
    setLoading(true);
    try {
      const result = await conductHunt({
        hunt_type: huntType,
        target_scope: targetScope,
        hypothesis: 'Advanced persistent threat using living-off-the-land techniques',
        time_range: '30_days',
        confidence_threshold: 0.7,
        include_ml_analysis: true
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Threat hunt failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Threat Hunting Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Hunt Type</InputLabel>
              <Select
                value={huntType}
                onChange={(e) => setHuntType(e.target.value)}
                label="Hunt Type"
              >
                {huntTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Target Scope</InputLabel>
              <Select
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value)}
                label="Target Scope"
              >
                {targetScopes.map((scope) => (
                  <MenuItem key={scope} value={scope}>
                    {scope.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<HuntingIcon />}
              onClick={runThreatHunt}
              disabled={loading}
            >
              Hunt
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {analysis && (
          <Box>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Hunt Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Hunt Name:</strong> {analysis.hunt_profile.hunt_name}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Hypothesis:</strong> {analysis.hunt_profile.hypothesis}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Threat Level:</strong> {analysis.hunt_profile.threat_level}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" mr={1}>
                      <strong>Confidence Score:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.hunt_profile.confidence_score * 100).toFixed(1)}%`}
                      color={analysis.hunt_profile.confidence_score >= 0.8 ? 'success' :
                             analysis.hunt_profile.confidence_score >= 0.6 ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2">
                    <strong>Analysis ID:</strong> {analysis.analysis_id}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Hunt Results</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <DetectionIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="15 suspicious activities detected"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TargetIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="3 high-priority IOCs matched"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimelineIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Attack timeline reconstructed"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ThreatIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Advanced threat actor signatures identified"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Hunt Recommendations</Typography>
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

// Component: Hunting Operations Panel
const HuntingOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'hypothesis',
      title: 'Hypothesis Analysis',
      description: 'Analyze and validate threat hunting hypotheses',
      icon: <HypothesisIcon />,
      action: async () => {
        const result = await analyzeHypothesis({
          hypothesis: 'Insider threat using privileged access for data theft',
          evidence_sources: ['user_behavior', 'data_access_logs', 'network_traffic'],
          analysis_depth: 'comprehensive',
          confidence_threshold: 0.75
        });
        return result.data;
      }
    },
    {
      id: 'ioc_tracking',
      title: 'IOC Tracking',
      description: 'Track and correlate indicators of compromise',
      icon: <TargetIcon />,
      action: async () => {
        const result = await trackIOCs({
          ioc_types: ['file_hashes', 'ip_addresses', 'domains', 'registry_keys'],
          tracking_scope: 'enterprise_environment',
          correlation_analysis: true,
          threat_intelligence_enrichment: true
        });
        return result.data;
      }
    },
    {
      id: 'hunt_report',
      title: 'Hunt Report',
      description: 'Generate comprehensive threat hunting report',
      icon: <AnalyticsIcon />,
      action: async () => {
        const result = await generateHuntReport({
          report_type: 'Threat Hunting Campaign Report',
          time_period: '30_days',
          include_timeline: true,
          include_ioc_analysis: true,
          include_recommendations: true
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
        <Typography variant="h6" gutterBottom>Hunting Operations</Typography>

        <Grid container spacing={2}>
          {operations.map((operation) => (
            <Grid item xs={12} md={4} key={operation.id}>
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

// Main Component: Hunting Management Dashboard
const HuntingManagementDashboard: React.FC = () => {
  const { data: huntingStatus, isLoading, error } = useQuery({
    queryKey: ['hunting-status'],
    queryFn: fetchHuntingStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Hunting Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !huntingStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load hunting system status. Please ensure the hunting core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <HuntingIcon sx={{ mr: 2, fontSize: 32, color: '#3f51b5' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Hunting Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Threat Hunting & Proactive Security Operations Platform
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <HuntingOverview status={huntingStatus} />
        </Grid>

        <Grid item xs={12}>
          <HuntingAnalysisPanel />
        </Grid>

        <Grid item xs={12}>
          <HuntingOperationsPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default HuntingManagementDashboard;