'use client';

// Phantom IOC Core Management - Indicators of Compromise Management
// Provides comprehensive GUI for IOC management and threat indicator analysis

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
  Flag as IOCIcon,
  Fingerprint as HashIcon,
  Language as DomainIcon,
  Public as IPIcon,
  Description as FileIcon,
  Assessment as AnalysisIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  TrendingUp as TrendIcon,
  Speed as FastIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces
interface IOCStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      total_iocs: number;
      active_iocs: number;
      detection_rate: number;
      false_positive_rate: number;
    };
  };
}

interface IOCAnalysis {
  analysis_id: string;
  ioc_profile: {
    indicator_value: string;
    indicator_type: string;
    threat_level: string;
    confidence_score: number;
  };
  threat_assessment: any;
  attribution_data: any;
  recommendations: string[];
}

// API functions
const fetchIOCStatus = async (): Promise<IOCStatus> => {
  const response = await fetch('/api/phantom-cores/ioc?operation=status');
  return response.json();
};

const analyzeIOC = async (iocData: any) => {
  const response = await fetch('/api/phantom-cores/ioc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-ioc',
      iocData
    })
  });
  return response.json();
};

const enrichIOC = async (enrichmentData: any) => {
  const response = await fetch('/api/phantom-cores/ioc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'enrich-ioc',
      enrichmentData
    })
  });
  return response.json();
};

const correlateIOCs = async (correlationData: any) => {
  const response = await fetch('/api/phantom-cores/ioc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'correlate-iocs',
      correlationData
    })
  });
  return response.json();
};

const generateIOCReport = async (reportData: any) => {
  const response = await fetch('/api/phantom-cores/ioc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'generate-ioc-report',
      reportData
    })
  });
  return response.json();
};

// Component: IOC Overview
const IOCOverview: React.FC<{ status: IOCStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">IOC system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  // Add null check for metrics
  if (!metrics) {
    return (
      <Alert severity="info">IOC metrics are currently being initialized...</Alert>
    );
  }

  const getDetectionColor = (rate: number) => {
    if (rate >= 0.9) return 'success';
    if (rate >= 0.7) return 'warning';
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
            <Typography variant="h6" gutterBottom>Total IOCs</Typography>
            <Typography variant="h3" color="primary">
              {(metrics.total_iocs || 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Tracked indicators
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active IOCs</Typography>
            <Typography variant="h3" color="error">
              {metrics.active_iocs || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Currently threatening
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Detection Rate</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={(metrics.detection_rate || 0) * 100}
                size={60}
                color={getDetectionColor(metrics.detection_rate || 0)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getDetectionColor(metrics.detection_rate || 0)}>
                  {((metrics.detection_rate || 0) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Detection Rate
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

// Component: IOC Analysis Panel
const IOCAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<IOCAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [indicatorType, setIndicatorType] = useState('hash');
  const [indicatorValue, setIndicatorValue] = useState('a1b2c3d4e5f6...');

  const indicatorTypes = ['hash', 'ip_address', 'domain', 'url', 'file_path', 'registry_key', 'email', 'user_agent'];

  const runIOCAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeIOC({
        indicator_type: indicatorType,
        indicator_value: indicatorValue,
        analysis_scope: 'comprehensive',
        threat_intelligence_enrichment: true,
        attribution_analysis: true,
        confidence_threshold: 0.7
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('IOC analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">IOC Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Indicator Type</InputLabel>
              <Select
                value={indicatorType}
                onChange={(e) => setIndicatorType(e.target.value)}
                label="Indicator Type"
              >
                {indicatorTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Indicator Value"
              value={indicatorValue}
              onChange={(e) => setIndicatorValue(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="contained"
              startIcon={<IOCIcon />}
              onClick={runIOCAnalysis}
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
                  <Typography variant="subtitle1" gutterBottom>IOC Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Indicator:</strong> {analysis.ioc_profile.indicator_value}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Type:</strong> {analysis.ioc_profile.indicator_type}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1} gap={1}>
                    <Typography variant="body2" component="span">
                      <strong>Threat Level:</strong>
                    </Typography>
                    <Chip
                      label={analysis.ioc_profile.threat_level}
                      color={analysis.ioc_profile.threat_level === 'HIGH' ? 'error' :
                             analysis.ioc_profile.threat_level === 'MEDIUM' ? 'warning' : 'info'}
                      size="small"
                    />
                  </Box>
                  <Box display="flex" alignItems="center" mb={1} gap={1}>
                    <Typography variant="body2" component="span">
                      <strong>Confidence Score:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.ioc_profile.confidence_score * 100).toFixed(1)}%`}
                      color={analysis.ioc_profile.confidence_score >= 0.8 ? 'success' :
                             analysis.ioc_profile.confidence_score >= 0.6 ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2">
                    <strong>Analysis ID:</strong> {analysis.analysis_id}
                  </Typography>
                </Paper>
              </Box>

              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Threat Intelligence</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Associated with known malware family"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Recently observed in active campaigns"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <FastIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Fast flux infrastructure detected"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Multiple threat intel sources confirm"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>IOC Recommendations</Typography>
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

// Component: IOC Operations Panel
const IOCOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'enrich',
      title: 'IOC Enrichment',
      description: 'Enrich IOCs with threat intelligence data',
      icon: <AnalysisIcon />,
      action: async () => {
        const result = await enrichIOC({
          enrichment_sources: ['VirusTotal', 'ThreatConnect', 'OTX', 'PassiveTotal'],
          enrichment_types: ['reputation', 'geolocation', 'whois', 'passive_dns'],
          include_historical_data: true,
          correlation_analysis: true
        });
        return result.data;
      }
    },
    {
      id: 'correlate',
      title: 'IOC Correlation',
      description: 'Correlate IOCs to identify patterns and campaigns',
      icon: <TrendIcon />,
      action: async () => {
        const result = await correlateIOCs({
          correlation_algorithms: ['temporal', 'network', 'behavioral'],
          time_window: '30_days',
          similarity_threshold: 0.8,
          include_campaign_analysis: true
        });
        return result.data;
      }
    },
    {
      id: 'report',
      title: 'IOC Report',
      description: 'Generate comprehensive IOC analysis report',
      icon: <FileIcon />,
      action: async () => {
        const result = await generateIOCReport({
          report_type: 'IOC Intelligence Report',
          time_period: '7_days',
          include_trending_analysis: true,
          include_attribution: true,
          include_mitigation_strategies: true
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
        <Typography variant="h6" gutterBottom>IOC Operations</Typography>

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

// Main Component: IOC Management Dashboard
const IOCManagementDashboard: React.FC = () => {
  const { data: iocStatus, isLoading, error } = useQuery({
    queryKey: ['ioc-status'],
    queryFn: fetchIOCStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading IOC Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !iocStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load IOC system status. Please ensure the IOC core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <IOCIcon sx={{ mr: 2, fontSize: 32, color: '#e91e63' }} />
        <Box>
          <Typography variant="h4" component="h1">
            IOC Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Indicators of Compromise Management & Analysis Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <IOCOverview status={iocStatus} />
        <IOCAnalysisPanel />
        <IOCOperationsPanel />
      </Box>
    </Box>
  );
};

export default IOCManagementDashboard;
