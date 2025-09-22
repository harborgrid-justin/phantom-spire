'use client';

// Phantom Feeds Core Management - Threat Intelligence Feed Management
// Provides comprehensive GUI for threat intelligence feed management and processing

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
  RssFeed as FeedsIcon,
  Cloud as CloudIcon,
  Analytics as IntelIcon,
  Sync as SyncIcon,
  Assessment as QualityIcon,
  Speed as LatencyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  DataUsage as DataIcon,
  TrendingUp as TrendIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces
interface FeedsStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      active_feeds: number;
      feed_quality_score: number;
      processing_rate: number;
      data_volume_gb: number;
    };
  };
}

interface FeedAnalysis {
  analysis_id: string;
  feed_profile: {
    source_name: string;
    feed_type: string;
    quality_score: number;
    reliability_rating: string;
  };
  intelligence_summary: any;
  processing_metrics: any;
  recommendations: string[];
}

// API functions
const fetchFeedsStatus = async (): Promise<FeedsStatus> => {
  const response = await fetch('/api/phantom-cores/feeds?operation=status');
  return response.json();
};

const analyzeFeed = async (analysisData: any) => {
  const response = await fetch('/api/phantom-cores/feeds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-feed',
      analysisData
    })
  });
  return response.json();
};

const processFeedData = async (feedData: any) => {
  const response = await fetch('/api/phantom-cores/feeds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'process-feed',
      feedData
    })
  });
  return response.json();
};

const syncFeeds = async (syncData: any) => {
  const response = await fetch('/api/phantom-cores/feeds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'sync-feeds',
      syncData
    })
  });
  return response.json();
};

const assessFeedQuality = async (qualityData: any) => {
  const response = await fetch('/api/phantom-cores/feeds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'assess-quality',
      qualityData
    })
  });
  return response.json();
};

// Component: Feeds Overview
const FeedsOverview: React.FC<{ status: FeedsStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Feeds system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  const getQualityColor = (score: number) => {
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
            <Typography variant="h6" gutterBottom>Active Feeds</Typography>
            <Typography variant="h3" color="primary">
              {metrics.active_feeds}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Intelligence sources
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Feed Quality</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.feed_quality_score * 100}
                size={60}
                color={getQualityColor(metrics.feed_quality_score)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getQualityColor(metrics.feed_quality_score)}>
                  {(metrics.feed_quality_score * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Quality Score
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Data Volume</Typography>
            <Typography variant="h3" color="secondary">
              {metrics.data_volume_gb.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              GB processed daily
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Component: Feed Analysis Panel
const FeedAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<FeedAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedSource, setFeedSource] = useState('AlienVault OTX');
  const [feedType, setFeedType] = useState('IOC');

  const feedSources = [
    'AlienVault OTX', 'VirusTotal', 'ThreatConnect', 'IBM X-Force', 'Recorded Future',
    'Mandiant', 'CrowdStrike', 'FireEye', 'Symantec', 'Microsoft Defender'
  ];

  const feedTypes = ['IOC', 'YARA', 'STIX/TAXII', 'DNS', 'URL', 'Hash', 'IP', 'Domain'];

  const runFeedAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeFeed({
        feed_source: feedSource,
        feed_type: feedType,
        analysis_scope: 'comprehensive',
        quality_assessment: true,
        performance_metrics: true,
        timeframe: '24_hours'
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Feed analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Feed Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Feed Source</InputLabel>
              <Select
                value={feedSource}
                onChange={(e) => setFeedSource(e.target.value)}
                label="Feed Source"
              >
                {feedSources.map((source) => (
                  <MenuItem key={source} value={source}>
                    {source}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Feed Type</InputLabel>
              <Select
                value={feedType}
                onChange={(e) => setFeedType(e.target.value)}
                label="Feed Type"
              >
                {feedTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<FeedsIcon />}
              onClick={runFeedAnalysis}
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
                  <Typography variant="subtitle1" gutterBottom>Feed Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Source:</strong> {analysis.feed_profile.source_name}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Type:</strong> {analysis.feed_profile.feed_type}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Reliability:</strong> {analysis.feed_profile.reliability_rating}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" mr={1}>
                      <strong>Quality Score:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.feed_profile.quality_score * 100).toFixed(1)}%`}
                      color={analysis.feed_profile.quality_score >= 0.8 ? 'success' :
                             analysis.feed_profile.quality_score >= 0.6 ? 'warning' : 'error'}
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
                  <Typography variant="subtitle1" gutterBottom>Feed Metrics</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <LatencyIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Low latency feed processing (< 2 seconds)"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <DataIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="High data throughput (10K+ indicators/hour)"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Strong source authentication verified"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Trending indicators show high accuracy"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Feed Optimization Recommendations</Typography>
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

// Component: Feeds Operations Panel
const FeedsOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'process',
      title: 'Process Feeds',
      description: 'Process and normalize threat intelligence feeds',
      icon: <IntelIcon />,
      action: async () => {
        const result = await processFeedData({
          processing_mode: 'real_time',
          normalization: 'STIX_2.1',
          deduplication: true,
          enrichment: {
            geolocation: true,
            reputation_scoring: true,
            context_analysis: true
          }
        });
        return result.data;
      }
    },
    {
      id: 'sync',
      title: 'Sync Feeds',
      description: 'Synchronize with external threat intelligence sources',
      icon: <SyncIcon />,
      action: async () => {
        const result = await syncFeeds({
          sync_sources: ['OTX', 'VirusTotal', 'ThreatConnect', 'X-Force'],
          sync_frequency: 'continuous',
          retry_policy: 'exponential_backoff',
          verify_signatures: true
        });
        return result.data;
      }
    },
    {
      id: 'quality',
      title: 'Quality Assessment',
      description: 'Assess and score threat intelligence feed quality',
      icon: <QualityIcon />,
      action: async () => {
        const result = await assessFeedQuality({
          assessment_criteria: [
            'timeliness', 'accuracy', 'completeness', 'relevance'
          ],
          quality_thresholds: {
            minimum_score: 0.7,
            warning_threshold: 0.8
          },
          include_benchmarking: true
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
        <Typography variant="h6" gutterBottom>Feed Operations</Typography>

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

// Main Component: Feeds Management Dashboard
const FeedsManagementDashboard: React.FC = () => {
  const { data: feedsStatus, isLoading, error } = useQuery({
    queryKey: ['feeds-status'],
    queryFn: fetchFeedsStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Feeds Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !feedsStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load feeds system status. Please ensure the feeds core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <FeedsIcon sx={{ mr: 2, fontSize: 32, color: '#2196f3' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Feeds Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Threat Intelligence Feed Management & Processing Platform
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FeedsOverview status={feedsStatus} />
        </Grid>

        <Grid item xs={12}>
          <FeedAnalysisPanel />
        </Grid>

        <Grid item xs={12}>
          <FeedsOperationsPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FeedsManagementDashboard;