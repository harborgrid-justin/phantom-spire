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
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
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

// Component: Reputation Feeds Panel
const ReputationFeedsPanel: React.FC = () => {
  const [feeds] = useState([
    { id: 1, name: 'VirusTotal Intelligence', status: 'active', type: 'commercial', entries: 245789, reliability: 95 },
    { id: 2, name: 'AbuseIPDB', status: 'active', type: 'open_source', entries: 89456, reliability: 87 },
    { id: 3, name: 'Internal IOC Feed', status: 'active', type: 'internal', entries: 12467, reliability: 98 },
    { id: 4, name: 'MISP Community', status: 'degraded', type: 'community', entries: 156234, reliability: 82 },
  ]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Reputation Feeds Status
        </Typography>
        <List>
          {feeds.map((feed) => (
            <ListItem key={feed.id} divider>
              <ListItemIcon>
                <Chip
                  label={feed.status}
                  color={feed.status === 'active' ? 'success' : 'warning'}
                  size="small"
                />
              </ListItemIcon>
              <ListItemText
                primary={feed.name}
                secondary={
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Type: {feed.type} | Entries: {feed.entries.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Reliability: {feed.reliability}%
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

// Component: Reputation Metrics Panel
const ReputationMetricsPanel: React.FC = () => {
  const metrics = {
    dailyQueries: 1547293,
    cacheHitRate: 89.4,
    avgResponseTime: '12ms',
    accuracyRate: 96.7,
    maliciousEntities: 847293,
    suspiciousEntities: 156842
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Performance Metrics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{metrics.dailyQueries.toLocaleString()}</Typography>
              <Typography variant="body2" color="textSecondary">Daily Queries</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success">{metrics.cacheHitRate}%</Typography>
              <Typography variant="body2" color="textSecondary">Cache Hit Rate</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="info">{metrics.avgResponseTime}</Typography>
              <Typography variant="body2" color="textSecondary">Avg Response Time</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="warning">{metrics.accuracyRate}%</Typography>
              <Typography variant="body2" color="textSecondary">Accuracy Rate</Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Component: Reputation Query Panel
const ReputationQueryPanel: React.FC = () => {
  const [queryEntity, setQueryEntity] = useState('');
  const [entityType, setEntityType] = useState('ip');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!queryEntity.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/phantom-cores/reputation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'query',
          entity: queryEntity,
          entity_type: entityType
        })
      });
      const result = await response.json();
      if (result.success) {
        setQueryResults(prev => [result.data, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Reputation Query Tool
        </Typography>
        <Grid container spacing={2} alignItems="center" mb={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Entity (IP, Domain, Hash)"
              value={queryEntity}
              onChange={(e) => setQueryEntity(e.target.value)}
              placeholder="e.g., 192.168.1.1"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Entity Type</InputLabel>
              <Select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                label="Entity Type"
              >
                <MenuItem value="ip">IP Address</MenuItem>
                <MenuItem value="domain">Domain</MenuItem>
                <MenuItem value="hash">File Hash</MenuItem>
                <MenuItem value="url">URL</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleQuery}
              disabled={loading || !queryEntity.trim()}
            >
              {loading ? <CircularProgress size={20} /> : 'Query'}
            </Button>
          </Grid>
        </Grid>

        {queryResults.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Entity</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="center">Score</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell align="center">Confidence</TableCell>
                  <TableCell>Recommendation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {queryResults.map((result, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{result.entity}</TableCell>
                    <TableCell>{result.entity_type}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={result.reputation_score}
                        color={result.reputation_score < 30 ? 'error' : result.reputation_score < 60 ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={result.risk_level}
                        color={result.risk_level === 'high' ? 'error' : result.risk_level === 'medium' ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">{Math.round(result.confidence * 100)}%</TableCell>
                    <TableCell>
                      <Chip
                        label={result.recommendation}
                        color={result.recommendation === 'BLOCK' ? 'error' : result.recommendation === 'MONITOR' ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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

        <Grid item xs={12} md={6}>
          <ReputationFeedsPanel />
        </Grid>

        <Grid item xs={12} md={6}>
          <ReputationMetricsPanel />
        </Grid>

        <Grid item xs={12}>
          <ReputationQueryPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReputationManagementDashboard;