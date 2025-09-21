'use client';

// Phantom Threat Actor Core Management - Threat Actor Profiling Dashboard
// Provides comprehensive GUI for threat actor tracking and intelligence

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
  Tab,
  Avatar
} from '@mui/material';
import {
  Person as ThreatActorIcon,
  Group as GroupIcon,
  Psychology as BehaviorIcon,
  Fingerprint as AttributionIcon,
  Report as ReportIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Shield as ShieldIcon,
  Analytics as AnalyticsIcon,
  Public as GlobalIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces
interface ThreatActorStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      tracked_actors: number;
      active_campaigns: number;
      attribution_confidence: number;
    };
  };
}

interface ThreatActorProfile {
  actor_id: string;
  actor_profile: {
    name: string;
    aliases: string[];
    type: string;
    sophistication_level: string;
    motivation: string;
    origin_country: string;
  };
  capabilities: {
    technical_skills: string;
    resource_level: string;
    target_sectors: string[];
    attack_vectors: string[];
  };
  campaign_history: any[];
  attribution_indicators: string[];
  threat_level: string;
  confidence_score: number;
}

// API functions
const fetchThreatActorStatus = async (): Promise<ThreatActorStatus> => {
  const response = await fetch('/api/phantom-cores/threat-actor?operation=status');
  return response.json();
};

const profileThreatActor = async (profileData: any) => {
  const response = await fetch('/api/phantom-cores/threat-actor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'profile-actor',
      profileData
    })
  });
  return response.json();
};

const trackCampaign = async (campaignData: any) => {
  const response = await fetch('/api/phantom-cores/threat-actor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'track-campaign',
      campaignData
    })
  });
  return response.json();
};

const analyzeAttribution = async (attributionData: any) => {
  const response = await fetch('/api/phantom-cores/threat-actor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-attribution',
      attributionData
    })
  });
  return response.json();
};

// Component: Threat Actor Overview
const ThreatActorOverview: React.FC<{ status: ThreatActorStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Threat Actor system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
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
                value={metrics.attribution_confidence}
                size={60}
                color={getConfidenceColor(metrics.attribution_confidence)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getConfidenceColor(metrics.attribution_confidence)}>
                  {metrics.attribution_confidence.toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg. Confidence
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Tracked Actors</Typography>
            <Typography variant="h3" color="primary">
              {metrics.tracked_actors}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Known threat actors
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active Campaigns</Typography>
            <Typography variant="h3" color="error">
              {metrics.active_campaigns}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Currently monitored campaigns
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Component: Threat Actor Profiling Panel
const ThreatActorProfilingPanel: React.FC = () => {
  const [profile, setProfile] = useState<ThreatActorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [actorType, setActorType] = useState('apt_group');
  const [targetSector, setTargetSector] = useState('government');

  const actorTypes = [
    'apt_group',
    'cybercriminal_group',
    'nation_state',
    'hacktivist',
    'insider_threat'
  ];

  const targetSectors = [
    'government',
    'financial',
    'healthcare',
    'technology',
    'energy',
    'defense'
  ];

  const runProfiling = async () => {
    setLoading(true);
    try {
      const result = await profileThreatActor({
        actor_type: actorType,
        target_sector: targetSector,
        analysis_depth: 'comprehensive',
        attribution_methods: ['behavioral', 'technical', 'infrastructure'],
        data_sources: ['osint', 'malware_analysis', 'infrastructure_analysis']
      });
      setProfile(result.data);
    } catch (error) {
      console.error('Threat actor profiling failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Threat Actor Profiling</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Actor Type</InputLabel>
              <Select
                value={actorType}
                onChange={(e) => setActorType(e.target.value)}
                label="Actor Type"
              >
                {actorTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Target Sector</InputLabel>
              <Select
                value={targetSector}
                onChange={(e) => setTargetSector(e.target.value)}
                label="Target Sector"
              >
                {targetSectors.map((sector) => (
                  <MenuItem key={sector} value={sector}>
                    {sector.charAt(0).toUpperCase() + sector.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<ThreatActorIcon />}
              onClick={runProfiling}
              disabled={loading}
            >
              Profile
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {profile && (
          <Box>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                      <ThreatActorIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">{profile.actor_profile.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {profile.actor_profile.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" mb={1}>
                    <strong>Aliases:</strong> {profile.actor_profile.aliases.join(', ')}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Sophistication:</strong> {profile.actor_profile.sophistication_level}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Motivation:</strong> {profile.actor_profile.motivation}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Origin:</strong> {profile.actor_profile.origin_country}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Threat Assessment</Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="body2" sx={{ mr: 2 }}>Threat Level:</Typography>
                    <Chip
                      label={profile.threat_level}
                      color={profile.threat_level === 'critical' ? 'error' :
                             profile.threat_level === 'high' ? 'warning' : 'info'}
                    />
                  </Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="body2" sx={{ mr: 2 }}>Confidence Score:</Typography>
                    <Typography variant="h6" color="primary">
                      {profile.confidence_score.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" mb={1}>
                    <strong>Technical Skills:</strong> {profile.capabilities.technical_skills}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Resource Level:</strong> {profile.capabilities.resource_level}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Target Sectors</Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {profile.capabilities.target_sectors.map((sector, index) => (
                      <Chip key={index} label={sector} size="small" />
                    ))}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Attack Vectors</Typography>
                  <List dense>
                    {profile.capabilities.attack_vectors.slice(0, 3).map((vector, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <SecurityIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={vector}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Component: Threat Actor Operations Panel
const ThreatActorOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'campaign',
      title: 'Campaign Tracking',
      description: 'Track and analyze ongoing threat actor campaigns',
      icon: <TimelineIcon />,
      action: async () => {
        const result = await trackCampaign({
          campaign_name: 'Enterprise Target Campaign',
          actor_indicators: ['phishing_emails', 'c2_infrastructure', 'malware_signatures'],
          tracking_scope: 'global',
          analysis_period: '90_days'
        });
        return result.data;
      }
    },
    {
      id: 'attribution',
      title: 'Attribution Analysis',
      description: 'Perform comprehensive attribution analysis',
      icon: <AttributionIcon />,
      action: async () => {
        const result = await analyzeAttribution({
          incident_data: {
            attack_patterns: ['spear_phishing', 'lateral_movement', 'data_exfiltration'],
            infrastructure_iocs: ['domain_names', 'ip_addresses', 'ssl_certificates'],
            malware_families: ['custom_backdoor', 'credential_harvester']
          },
          attribution_confidence_threshold: 0.7
        });
        return result.data;
      }
    },
    {
      id: 'intelligence',
      title: 'Threat Intelligence',
      description: 'Generate comprehensive threat intelligence report',
      icon: <AnalyticsIcon />,
      action: async () => {
        const result = await fetch('/api/phantom-cores/threat-actor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'generate-intelligence',
            intelligence_type: 'threat_actor_landscape',
            scope: 'enterprise_threats',
            time_range: '12_months'
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
        <Typography variant="h6" gutterBottom>Threat Actor Operations</Typography>

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

// Main Component: Threat Actor Management Dashboard
const ThreatActorManagementDashboard: React.FC = () => {
  const { data: threatActorStatus, isLoading, error } = useQuery({
    queryKey: ['threat-actor-status'],
    queryFn: fetchThreatActorStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Threat Actor Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !threatActorStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load threat actor system status. Please ensure the threat actor core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <ThreatActorIcon sx={{ mr: 2, fontSize: 32, color: '#9c27b0' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Threat Actor Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Enterprise Threat Actor Tracking & Attribution Platform
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ThreatActorOverview status={threatActorStatus} />
        </Grid>

        <Grid item xs={12}>
          <ThreatActorProfilingPanel />
        </Grid>

        <Grid item xs={12}>
          <ThreatActorOperationsPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThreatActorManagementDashboard;