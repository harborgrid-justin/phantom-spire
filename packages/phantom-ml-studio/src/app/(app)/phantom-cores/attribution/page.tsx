'use client';

// Phantom Attribution Core Management - Attribution Analysis & Threat Actor Profiling
// Provides comprehensive GUI for threat attribution and actor profiling capabilities

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
  Psychology as AttributionIcon,
  AccountCircle as ActorIcon,
  Fingerprint as TTPIcon,
  Timeline as TimelineIcon,
  TrendingUp as AnalyticsIcon,
  Assignment as ProfileIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Map as MapIcon,
  Speed as ConfidenceIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces
interface AttributionStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      active_campaigns: number;
      attribution_confidence: number;
      tracked_actors: number;
    };
  };
}

interface AttributionAnalysis {
  analysis_id: string;
  attribution_profile: {
    threat_actor: string;
    confidence_score: number;
    campaign_name: string;
    attribution_techniques: string[];
  };
  campaign_analysis: any;
  ttp_mapping: any;
  recommendations: string[];
}

// API functions
const fetchAttributionStatus = async (): Promise<AttributionStatus> => {
  const response = await fetch('/api/phantom-cores/attribution?operation=status');
  return response.json();
};

const analyzeAttribution = async (analysisData: any) => {
  const response = await fetch('/api/phantom-cores/attribution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-attribution',
      analysisData
    })
  });
  return response.json();
};

const profileThreatActor = async (actorData: any) => {
  const response = await fetch('/api/phantom-cores/attribution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'profile-actor',
      actorData
    })
  });
  return response.json();
};

const analyzeTTP = async (ttpData: any) => {
  const response = await fetch('/api/phantom-cores/attribution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-ttp',
      ttpData
    })
  });
  return response.json();
};

const generateCampaignProfile = async (campaignData: any) => {
  const response = await fetch('/api/phantom-cores/attribution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'generate-campaign-profile',
      campaignData
    })
  });
  return response.json();
};

// Component: Attribution Overview
const AttributionOverview: React.FC<{ status: AttributionStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Attribution system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
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
            <Typography variant="h6" gutterBottom>Attribution Confidence</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.attribution_confidence * 100}
                size={60}
                color={getConfidenceColor(metrics.attribution_confidence)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getConfidenceColor(metrics.attribution_confidence)}>
                  {(metrics.attribution_confidence * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg Confidence
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active Campaigns</Typography>
            <Typography variant="h3" color="primary">
              {metrics.active_campaigns}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Under investigation
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Tracked Actors</Typography>
            <Typography variant="h3" color="secondary">
              {metrics.tracked_actors}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Known threat actors
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Component: Attribution Analysis Panel
const AttributionAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<AttributionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState('campaign_attribution');
  const [targetActor, setTargetActor] = useState('APT29');

  const analysisTypes = [
    'campaign_attribution', 'actor_profiling', 'ttp_analysis', 'infrastructure_mapping'
  ];

  const knownActors = [
    'APT29', 'APT28', 'Lazarus Group', 'FIN7', 'Carbanak', 'Equation Group',
    'Comment Crew', 'Mustang Panda', 'TA505', 'Conti'
  ];

  const runAttributionAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeAttribution({
        analysis_type: analysisType,
        target_actor: targetActor,
        analysis_scope: 'comprehensive',
        confidence_threshold: 0.7,
        include_ttp_mapping: true,
        timeframe: '90_days'
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Attribution analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Attribution Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Analysis Type</InputLabel>
              <Select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                label="Analysis Type"
              >
                {analysisTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Target Actor</InputLabel>
              <Select
                value={targetActor}
                onChange={(e) => setTargetActor(e.target.value)}
                label="Target Actor"
              >
                {knownActors.map((actor) => (
                  <MenuItem key={actor} value={actor}>
                    {actor}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AttributionIcon />}
              onClick={runAttributionAnalysis}
              disabled={loading}
            >
              Analyze
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {analysis && (
          <Box>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Attribution Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Threat Actor:</strong> {analysis.attribution_profile.threat_actor}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Campaign:</strong> {analysis.attribution_profile.campaign_name}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" mr={1}>
                      <strong>Confidence Score:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.attribution_profile.confidence_score * 100).toFixed(1)}%`}
                      color={analysis.attribution_profile.confidence_score >= 0.8 ? 'success' :
                             analysis.attribution_profile.confidence_score >= 0.6 ? 'warning' : 'error'}
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
                  <Typography variant="subtitle1" gutterBottom>TTP Techniques</Typography>
                  <List dense>
                    {analysis.attribution_profile.attribution_techniques?.slice(0, 4).map((technique, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TTPIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={technique}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Key Recommendations</Typography>
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

// Component: Attribution Operations Panel
const AttributionOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'profile',
      title: 'Actor Profiling',
      description: 'Generate comprehensive threat actor profile',
      icon: <ActorIcon />,
      action: async () => {
        const result = await profileThreatActor({
          actor_name: 'APT29 (Cozy Bear)',
          profiling_scope: 'comprehensive',
          include_infrastructure: true,
          include_campaigns: true,
          timeframe: '24_months'
        });
        return result.data;
      }
    },
    {
      id: 'ttp',
      title: 'TTP Analysis',
      description: 'Analyze tactics, techniques, and procedures',
      icon: <TTPIcon />,
      action: async () => {
        const result = await analyzeTTP({
          analysis_type: 'MITRE ATT&CK Mapping',
          techniques: ['T1566.001', 'T1059.001', 'T1105'],
          scope: 'enterprise_matrix',
          include_detection_rules: true
        });
        return result.data;
      }
    },
    {
      id: 'campaign',
      title: 'Campaign Profiling',
      description: 'Generate detailed campaign profile and attribution',
      icon: <ProfileIcon />,
      action: async () => {
        const result = await generateCampaignProfile({
          campaign_name: 'Operation Ghost Flame',
          attribution_indicators: ['domain_patterns', 'malware_families', 'infrastructure'],
          analysis_depth: 'comprehensive',
          confidence_threshold: 0.75
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
        <Typography variant="h6" gutterBottom>Attribution Operations</Typography>

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

// Main Component: Attribution Management Dashboard
const AttributionManagementDashboard: React.FC = () => {
  const { data: attributionStatus, isLoading, error } = useQuery({
    queryKey: ['attribution-status'],
    queryFn: fetchAttributionStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Attribution Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !attributionStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load attribution system status. Please ensure the attribution core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <AttributionIcon sx={{ mr: 2, fontSize: 32, color: '#9c27b0' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Attribution Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Threat Attribution Analysis & Actor Profiling Platform
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AttributionOverview status={attributionStatus} />
        </Grid>

        <Grid item xs={12}>
          <AttributionAnalysisPanel />
        </Grid>

        <Grid item xs={12}>
          <AttributionOperationsPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AttributionManagementDashboard;