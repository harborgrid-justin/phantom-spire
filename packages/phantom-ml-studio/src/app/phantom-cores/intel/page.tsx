'use client';

// Phantom Intel Core Management - Intelligence Gathering & Analysis
// Provides comprehensive GUI for intelligence gathering and analysis operations

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
  Psychology as IntelIcon,
  Insights as AnalysisIcon,
  Public as OSINTIcon,
  Language as SIGINTIcon,
  Groups as HUMINTIcon,
  Assessment as ReportIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  TrendingUp as TrendIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces
interface IntelStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      active_operations: number;
      intelligence_quality: number;
      source_diversity: number;
      analysis_accuracy: number;
    };
  };
}

interface IntelAnalysis {
  analysis_id: string;
  intelligence_profile: {
    operation_name: string;
    collection_method: string;
    confidence_level: number;
    threat_assessment: string;
  };
  findings: any;
  source_assessment: any;
  recommendations: string[];
}

// API functions
const fetchIntelStatus = async (): Promise<IntelStatus> => {
  const response = await fetch('/api/phantom-cores/intel?operation=status');
  return response.json();
};

const gatherIntelligence = async (intelData: any) => {
  const response = await fetch('/api/phantom-cores/intel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'gather-intelligence',
      intelData
    })
  });
  return response.json();
};

const analyzeIntelligence = async (analysisData: any) => {
  const response = await fetch('/api/phantom-cores/intel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-intelligence',
      analysisData
    })
  });
  return response.json();
};

const validateSources = async (sourceData: any) => {
  const response = await fetch('/api/phantom-cores/intel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'validate-sources',
      sourceData
    })
  });
  return response.json();
};

const generateIntelReport = async (reportData: any) => {
  const response = await fetch('/api/phantom-cores/intel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'generate-intel-report',
      reportData
    })
  });
  return response.json();
};

// Component: Intel Overview
const IntelOverview: React.FC<{ status: IntelStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Intel system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  const getQualityColor = (quality: number) => {
    if (quality >= 0.8) return 'success';
    if (quality >= 0.6) return 'warning';
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
            <Typography variant="h6" gutterBottom>Active Operations</Typography>
            <Typography variant="h3" color="primary">
              {metrics.active_operations}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Intelligence collections
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Intelligence Quality</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.intelligence_quality * 100}
                size={60}
                color={getQualityColor(metrics.intelligence_quality)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getQualityColor(metrics.intelligence_quality)}>
                  {(metrics.intelligence_quality * 100).toFixed(1)}%
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
            <Typography variant="h6" gutterBottom>Source Diversity</Typography>
            <Typography variant="h3" color="secondary">
              {metrics.source_diversity}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Unique intel sources
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Component: Intelligence Analysis Panel
const IntelligenceAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<IntelAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [collectionMethod, setCollectionMethod] = useState('OSINT');
  const [targetDomain, setTargetDomain] = useState('cyber_threats');

  const collectionMethods = ['OSINT', 'SIGINT', 'HUMINT', 'GEOINT', 'MASINT', 'TECHINT'];
  const targetDomains = [
    'cyber_threats', 'nation_state_actors', 'criminal_organizations',
    'terrorist_groups', 'insider_threats', 'supply_chain_risks'
  ];

  const runIntelligenceAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeIntelligence({
        collection_method: collectionMethod,
        target_domain: targetDomain,
        analysis_scope: 'comprehensive',
        confidence_threshold: 0.75,
        correlation_analysis: true,
        threat_modeling: true
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Intelligence analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Intelligence Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Collection Method</InputLabel>
              <Select
                value={collectionMethod}
                onChange={(e) => setCollectionMethod(e.target.value)}
                label="Collection Method"
              >
                {collectionMethods.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Target Domain</InputLabel>
              <Select
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                label="Target Domain"
              >
                {targetDomains.map((domain) => (
                  <MenuItem key={domain} value={domain}>
                    {domain.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<IntelIcon />}
              onClick={runIntelligenceAnalysis}
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
                  <Typography variant="subtitle1" gutterBottom>Intelligence Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Operation:</strong> {analysis.intelligence_profile.operation_name}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Collection Method:</strong> {analysis.intelligence_profile.collection_method}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Threat Assessment:</strong> {analysis.intelligence_profile.threat_assessment}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" mr={1}>
                      <strong>Confidence Level:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.intelligence_profile.confidence_level * 100).toFixed(1)}%`}
                      color={analysis.intelligence_profile.confidence_level >= 0.8 ? 'success' :
                             analysis.intelligence_profile.confidence_level >= 0.6 ? 'warning' : 'error'}
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
                  <Typography variant="subtitle1" gutterBottom>Key Intelligence</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Advanced persistent threat campaign identified"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <VerifiedIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="High-confidence attribution to known actor"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Increasing activity in target sector"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <OSINTIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Multiple OSINT sources corroborate findings"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Intelligence Recommendations</Typography>
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

// Component: Intel Operations Panel
const IntelOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'gather',
      title: 'Intelligence Gathering',
      description: 'Collect intelligence from multiple sources',
      icon: <OSINTIcon />,
      action: async () => {
        const result = await gatherIntelligence({
          collection_sources: ['social_media', 'dark_web', 'technical_indicators', 'public_records'],
          collection_scope: 'targeted_campaign',
          automated_collection: true,
          source_validation: true
        });
        return result.data;
      }
    },
    {
      id: 'validate',
      title: 'Source Validation',
      description: 'Validate and assess intelligence source reliability',
      icon: <VerifiedIcon />,
      action: async () => {
        const result = await validateSources({
          validation_criteria: ['source_reliability', 'information_accuracy', 'timeliness'],
          cross_reference_analysis: true,
          confidence_scoring: true,
          bias_assessment: true
        });
        return result.data;
      }
    },
    {
      id: 'report',
      title: 'Intelligence Report',
      description: 'Generate comprehensive intelligence assessment report',
      icon: <ReportIcon />,
      action: async () => {
        const result = await generateIntelReport({
          report_type: 'Strategic Intelligence Assessment',
          classification_level: 'confidential',
          include_analysis: true,
          include_recommendations: true,
          distribution_list: ['security_team', 'executive_leadership']
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
        <Typography variant="h6" gutterBottom>Intelligence Operations</Typography>

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

// Main Component: Intel Management Dashboard
const IntelManagementDashboard: React.FC = () => {
  const { data: intelStatus, isLoading, error } = useQuery({
    queryKey: ['intel-status'],
    queryFn: fetchIntelStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Intel Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !intelStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load intel system status. Please ensure the intel core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <IntelIcon sx={{ mr: 2, fontSize: 32, color: '#673ab7' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Intel Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Intelligence Gathering & Analysis Platform
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <IntelOverview status={intelStatus} />
        </Grid>

        <Grid item xs={12}>
          <IntelligenceAnalysisPanel />
        </Grid>

        <Grid item xs={12}>
          <IntelOperationsPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default IntelManagementDashboard;