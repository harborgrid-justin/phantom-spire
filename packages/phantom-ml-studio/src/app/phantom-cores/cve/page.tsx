'use client';

// Phantom CVE Core Management - Enhanced Real-time CVE Management & Vulnerability Tracking
// Provides comprehensive GUI for CVE database management with real-time streaming, ML prioritization,
// and cross-module threat intelligence correlation

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
  Badge,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  BugReport as CVEIcon,
  Security as VulnIcon,
  Assessment as AssessmentIcon,
  Update as UpdateIcon,
  TrendingUp as TrendIcon,
  Flag as PriorityIcon,
  Stream as StreamIcon,
  Psychology as MLIcon,
  Hub as CrossModuleIcon,
  Notifications as NotificationIcon,
  Speed as RealtimeIcon,
  Analytics as CorrelationIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Shield as ShieldIcon,
  Timeline as TimelineIcon,
  Speed as CriticalIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces
interface CVEStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      total_cves: number;
      critical_cves: number;
      patched_vulnerabilities: number;
      coverage_percentage: number;
    };
  };
}

interface CVEAnalysis {
  analysis_id: string;
  vulnerability_profile: {
    cve_id: string;
    severity_score: number;
    impact_level: string;
    exploitability: string;
  };
  assessment_results: any;
  remediation_plan: any;
  recommendations: string[];
}

// API functions
const fetchCVEStatus = async (): Promise<CVEStatus> => {
  const response = await fetch('/api/phantom-cores/cve?operation=status');
  return response.json();
};

const analyzeCVE = async (analysisData: any) => {
  const response = await fetch('/api/phantom-cores/cve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-cve',
      analysisData
    })
  });
  return response.json();
};

const trackVulnerability = async (vulnData: any) => {
  const response = await fetch('/api/phantom-cores/cve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'track-vulnerability',
      vulnData
    })
  });
  return response.json();
};

const updateCVEDatabase = async (updateData: any) => {
  const response = await fetch('/api/phantom-cores/cve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'update-database',
      updateData
    })
  });
  return response.json();
};

const generateVulnerabilityReport = async (reportData: any) => {
  const response = await fetch('/api/phantom-cores/cve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'generate-report',
      reportData
    })
  });
  return response.json();
};

// New Real-time CVE API functions
const correlateCVE = async (correlationData: any) => {
  const response = await fetch('/api/phantom-cores/cve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'correlate-cve',
      ...correlationData
    })
  });
  return response.json();
};

const analyzeRealtimeStream = async (streamData: any) => {
  const response = await fetch('/api/phantom-cores/cve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'stream-analysis',
      ...streamData
    })
  });
  return response.json();
};

const checkRealtimeFeed = async (feedData: any) => {
  const response = await fetch('/api/phantom-cores/cve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'real-time-feed',
      ...feedData
    })
  });
  return response.json();
};

const mlPrioritizeCVEs = async (priorityData: any) => {
  const response = await fetch('/api/phantom-cores/cve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'ml-prioritization',
      ...priorityData
    })
  });
  return response.json();
};

const crossModuleAnalysis = async (analysisData: any) => {
  const response = await fetch('/api/phantom-cores/cve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'cross-module-analysis',
      ...analysisData
    })
  });
  return response.json();
};

// Component: CVE Overview
const CVEOverview: React.FC<{ status: CVEStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">CVE system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  // Add null check for metrics
  if (!metrics) {
    return (
      <Alert severity="info">CVE metrics are currently being initialized...</Alert>
    );
  }

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 0.9) return 'success';
    if (percentage >= 0.7) return 'warning';
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
            <Typography variant="h6" gutterBottom>Total CVEs</Typography>
            <Typography variant="h3" color="primary">
              {(metrics.total_cves || 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Tracked vulnerabilities
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Critical CVEs</Typography>
            <Typography variant="h3" color="error">
              {metrics.critical_cves || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              High severity issues
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Coverage</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={(metrics.coverage_percentage || 0) * 100}
                size={60}
                color={getCoverageColor(metrics.coverage_percentage || 0)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getCoverageColor(metrics.coverage_percentage || 0)}>
                  {((metrics.coverage_percentage || 0) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Database Coverage
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

// Component: CVE Analysis Panel
const CVEAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<CVEAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [cveId, setCveId] = useState('CVE-2024-21887');
  const [severity, setSeverity] = useState('CRITICAL');

  const severityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const runCVEAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeCVE({
        cve_id: cveId,
        severity_filter: severity,
        analysis_scope: 'comprehensive',
        include_exploits: true,
        include_patches: true,
        assessment_type: 'full_impact'
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('CVE analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">CVE Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              size="small"
              label="CVE ID"
              value={cveId}
              onChange={(e) => setCveId(e.target.value)}
              sx={{ minWidth: 180 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
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
              startIcon={<CVEIcon />}
              onClick={runCVEAnalysis}
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
                  <Typography variant="subtitle1" gutterBottom>Vulnerability Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>CVE ID:</strong> {analysis.vulnerability_profile.cve_id}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Impact Level:</strong> {analysis.vulnerability_profile.impact_level}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Exploitability:</strong> {analysis.vulnerability_profile.exploitability}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1} gap={1}>
                    <Typography variant="body2" component="span">
                      <strong>CVSS Score:</strong>
                    </Typography>
                    <Chip
                      label={analysis.vulnerability_profile.severity_score.toFixed(1)}
                      color={analysis.vulnerability_profile.severity_score >= 9.0 ? 'error' :
                             analysis.vulnerability_profile.severity_score >= 7.0 ? 'warning' : 'info'}
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
                  <Typography variant="subtitle1" gutterBottom>Risk Assessment</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CriticalIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Active exploitation detected in the wild"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PriorityIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Patches available for affected systems"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ShieldIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Mitigation strategies identified"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimelineIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Trending upward in attack campaigns"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Remediation Recommendations</Typography>
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

// Component: CVE Operations Panel
const CVEOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'track',
      title: 'Vulnerability Tracking',
      description: 'Track and monitor vulnerability lifecycle with real-time updates',
      icon: <VulnIcon />,
      action: async () => {
        const result = await trackVulnerability({
          tracking_scope: 'enterprise_environment',
          vulnerability_sources: ['NVD', 'MITRE', 'vendor_advisories'],
          tracking_criteria: {
            severity_threshold: 'MEDIUM',
            affected_systems: 'all'
          }
        });
        return result.data;
      }
    },
    {
      id: 'update',
      title: 'Real-time Database Update',
      description: 'Update CVE database with streaming real-time feeds',
      icon: <UpdateIcon />,
      action: async () => {
        const result = await updateCVEDatabase({
          update_sources: ['NIST NVD', 'MITRE CVE', 'CISA KEV'],
          update_frequency: 'real_time',
          include_metadata: true,
          verify_signatures: true
        });
        return result.data;
      }
    },
    {
      id: 'report',
      title: 'Enhanced Vulnerability Report',
      description: 'Generate comprehensive report with threat intelligence fusion',
      icon: <AssessmentIcon />,
      action: async () => {
        const result = await generateVulnerabilityReport({
          report_type: 'Enterprise Vulnerability Assessment',
          time_period: '30_days',
          include_trends: true,
          severity_breakdown: true,
          remediation_status: true
        });
        return result.data;
      }
    },
    {
      id: 'correlate',
      title: 'CVE Threat Correlation',
      description: 'Perform AI-powered threat intelligence correlation',
      icon: <CorrelationIcon />,
      action: async () => {
        const result = await correlateCVE({
          cveId: 'CVE-2024-21887',
          includeMLAnalysis: true,
          correlationTypes: ['mitre', 'ioc', 'threat-actor', 'malware']
        });
        return result.data;
      }
    },
    {
      id: 'stream',
      title: 'Real-time Stream Analysis',
      description: 'Analyze CVE processing stream performance and metrics',
      icon: <StreamIcon />,
      action: async () => {
        const result = await analyzeRealtimeStream({
          includeMetrics: true,
          includePerfomance: true,
          analyzeQueue: true
        });
        return result.data;
      }
    },
    {
      id: 'feed',
      title: 'Real-time Feed Status',
      description: 'Monitor live CVE feed connections and data flow',
      icon: <RealtimeIcon />,
      action: async () => {
        const result = await checkRealtimeFeed({
          feedType: 'all',
          severityFilter: ['critical', 'high', 'medium'],
          includeHealth: true
        });
        return result.data;
      }
    },
    {
      id: 'ml-priority',
      title: 'ML-Powered Prioritization',
      description: 'Use machine learning to prioritize CVE remediation',
      icon: <MLIcon />,
      action: async () => {
        const result = await mlPrioritizeCVEs({
          cves: ['CVE-2024-21887', 'CVE-2024-1234', 'CVE-2024-5678'],
          organizationContext: {
            sector: 'Technology',
            riskTolerance: 'Low',
            assetCriticality: 'High'
          },
          includeMLMetrics: true
        });
        return result.data;
      }
    },
    {
      id: 'cross-module',
      title: 'Cross-Module Analysis',
      description: 'Unified threat analysis across all phantom-*-core modules',
      icon: <CrossModuleIcon />,
      action: async () => {
        const result = await crossModuleAnalysis({
          cveId: 'CVE-2024-21887',
          modules: ['mitre', 'ioc', 'threat-actor', 'vulnerability', 'malware'],
          includeCorrelation: true,
          includeML: true
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
        <Typography variant="h6" gutterBottom>CVE Operations</Typography>

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

// Main Component: CVE Management Dashboard
const CVEManagementDashboard: React.FC = () => {
  const { data: cveStatus, isLoading, error } = useQuery({
    queryKey: ['cve-status'],
    queryFn: fetchCVEStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading CVE Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !cveStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load CVE system status. Please ensure the CVE core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <CVEIcon sx={{ mr: 2, fontSize: 32, color: '#f44336' }} />
        <Box>
          <Typography variant="h4" component="h1">
            CVE Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Vulnerability Tracking & CVE Database Management Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <CVEOverview status={cveStatus} />
        <CVEAnalysisPanel />
        <CVEOperationsPanel />
      </Box>
    </Box>
  );
};

export default CVEManagementDashboard;
