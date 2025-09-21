'use client';

// Phantom Reputation Core Management - Reputation Scoring & Analysis
// Provides comprehensive GUI for reputation scoring and threat reputation analysis

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
  Paper,
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
  TextField
} from '@mui/material';
import {
  Stars as ReputationIcon,
  TrendingDown as BadReputationIcon,
  TrendingUp as GoodReputationIcon,
  Analytics as AnalysisIcon,
  Assessment as ScoringIcon,
  Security as ThreatIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Public as GlobalIcon,
  Speed as FastIcon,
  Verified as TrustedIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

// Interfaces
interface ReputationStatus {
  success: boolean;
  data?: {
    status: string;
    metrics: {
      uptime: string;
      entities_scored: number;
      reputation_accuracy: number;
      threat_entities: number;
      trusted_entities: number;
    };
  };
}

interface ReputationAnalysis {
  analysis_id: string;
  reputation_profile: {
    entity_value: string;
    entity_type: string;
    reputation_score: number;
    threat_level: string;
  };
  scoring_factors: any;
  threat_intelligence: any;
  recommendations: string[];
}

// API functions
const fetchReputationStatus = async (): Promise<ReputationStatus> => {
  const response = await fetch('/api/phantom-cores/reputation?operation=status');
  return response.json();
};

const analyzeReputation = async (reputationData: any) => {
  const response = await fetch('/api/phantom-cores/reputation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-reputation',
      reputationData
    })
  });
  return response.json();
};

// Component: Reputation Overview
const ReputationOverview: React.FC<{ status: ReputationStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Reputation system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

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
            <Typography variant="h6" gutterBottom>Entities Scored</Typography>
            <Typography variant="h3" color="primary">
              {metrics.entities_scored.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total reputation scores
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Threat Entities</Typography>
            <Typography variant="h3" color="error">
              {metrics.threat_entities}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Malicious reputation
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Trusted Entities</Typography>
            <Typography variant="h3" color="success.main">
              {metrics.trusted_entities}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Good reputation
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Component: Reputation Analysis Panel
const ReputationAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<ReputationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [entityType, setEntityType] = useState('ip_address');
  const [entityValue, setEntityValue] = useState('192.168.1.100');

  const entityTypes = ['ip_address', 'domain', 'url', 'file_hash', 'email', 'user_agent'];

  const runReputationAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeReputation({
        entity_type: entityType,
        entity_value: entityValue,
        analysis_scope: 'comprehensive',
        include_threat_intelligence: true,
        include_historical_data: true,
        scoring_algorithms: ['ml_based', 'rule_based', 'crowd_sourced']
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Reputation analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReputationColor = (score: number) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.4) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Reputation Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Entity Type</InputLabel>
              <Select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                label="Entity Type"
              >
                {entityTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Entity Value"
              value={entityValue}
              onChange={(e) => setEntityValue(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="contained"
              startIcon={<ReputationIcon />}
              onClick={runReputationAnalysis}
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
                  <Typography variant="subtitle1" gutterBottom>Reputation Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Entity:</strong> {analysis.reputation_profile.entity_value}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Type:</strong> {analysis.reputation_profile.entity_type}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Threat Level:</strong>
                    <Chip
                      label={analysis.reputation_profile.threat_level}
                      color={analysis.reputation_profile.threat_level === 'HIGH' ? 'error' :
                             analysis.reputation_profile.threat_level === 'MEDIUM' ? 'warning' : 'success'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" mr={1}>
                      <strong>Reputation Score:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.reputation_profile.reputation_score * 100).toFixed(0)}%`}
                      color={getReputationColor(analysis.reputation_profile.reputation_score)}
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
                  <Typography variant="subtitle1" gutterBottom>Reputation Factors</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <ThreatIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Associated with malware campaigns"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <GlobalIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Multiple geographic threat reports"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <FastIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Recently observed malicious activity"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrustedIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Verified by multiple threat intel sources"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Reputation Recommendations</Typography>
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

// Main Component: Reputation Management Dashboard
const ReputationManagementDashboard: React.FC = () => {
  const { data: reputationStatus, isLoading, error } = useQuery({
    queryKey: ['reputation-status'],
    queryFn: fetchReputationStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Reputation Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !reputationStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load reputation system status. Please ensure the reputation core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <ReputationIcon sx={{ mr: 2, fontSize: 32, color: '#ffc107' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Reputation Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Reputation Scoring & Threat Intelligence Analysis Platform
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ReputationOverview status={reputationStatus} />
        </Grid>

        <Grid item xs={12}>
          <ReputationAnalysisPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReputationManagementDashboard;