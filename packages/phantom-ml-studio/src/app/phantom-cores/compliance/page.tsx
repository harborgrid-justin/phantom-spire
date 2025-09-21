'use client';

// Phantom Compliance Core Management - Enterprise Compliance Dashboard
// Provides comprehensive GUI for compliance management and regulatory frameworks

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
  Assessment as ComplianceIcon,
  Security as SecurityIcon,
  Assignment as AuditIcon,
  TrendingUp as MetricsIcon,
  Report as ReportIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalance as FrameworkIcon,
  Timeline as TimelineIcon,
  Speed as QuickIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces
interface ComplianceStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      frameworks_active: number;
      compliance_score: number;
    };
  };
}

interface ComplianceAnalysis {
  framework_id: string;
  framework_profile: {
    name: string;
    compliance_score: number;
    maturity_level: string;
  };
  assessment_results: any;
  gap_analysis: any;
  recommendations: string[];
}

// API functions
const fetchComplianceStatus = async (): Promise<ComplianceStatus> => {
  const response = await fetch('/api/phantom-cores/compliance?operation=status');
  return response.json();
};

const analyzeFramework = async (frameworkData: any) => {
  const response = await fetch('/api/phantom-cores/compliance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-framework',
      frameworkData
    })
  });
  return response.json();
};

const assessCompliance = async (assessmentData: any) => {
  const response = await fetch('/api/phantom-cores/compliance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'assess-status',
      assessmentData
    })
  });
  return response.json();
};

const conductAudit = async (auditData: any) => {
  const response = await fetch('/api/phantom-cores/compliance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'conduct-audit',
      auditData
    })
  });
  return response.json();
};

const generateReport = async (reportData: any) => {
  const response = await fetch('/api/phantom-cores/compliance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'generate-report',
      reportData
    })
  });
  return response.json();
};

// Component: Compliance Overview
const ComplianceOverview: React.FC<{ status: ComplianceStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Compliance system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'success';
    if (score >= 0.7) return 'warning';
    return 'error';
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
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

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Compliance Score</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.compliance_score * 100}
                size={60}
                color={getScoreColor(metrics.compliance_score)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getScoreColor(metrics.compliance_score)}>
                  {(metrics.compliance_score * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Overall Score
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active Frameworks</Typography>
            <Typography variant="h3" color="primary">
              {metrics.frameworks_active}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Compliance frameworks monitored
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Component: Framework Analysis Panel
const FrameworkAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<ComplianceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState('ISO 27001');
  const [industry, setIndustry] = useState('Technology');

  const frameworks = [
    'ISO 27001', 'SOC 2', 'GDPR', 'HIPAA', 'PCI DSS', 'NIST CSF', 'SOX', 'FISMA'
  ];

  const industries = [
    'Technology', 'Healthcare', 'Financial Services', 'Government', 'Retail', 'Manufacturing'
  ];

  const runFrameworkAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeFramework({
        name: `${selectedFramework} Compliance Framework`,
        industry: industry,
        standards: [selectedFramework],
        scope: 'enterprise-wide',
        maturityTarget: 'Advanced'
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Framework analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Framework Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Framework</InputLabel>
              <Select
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
                label="Framework"
              >
                {frameworks.map((framework) => (
                  <MenuItem key={framework} value={framework}>
                    {framework}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Industry</InputLabel>
              <Select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                label="Industry"
              >
                {industries.map((ind) => (
                  <MenuItem key={ind} value={ind}>
                    {ind}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<FrameworkIcon />}
              onClick={runFrameworkAnalysis}
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
                  <Typography variant="subtitle1" gutterBottom>Framework Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Name:</strong> {analysis.framework_profile.name}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Compliance Score:</strong> {(analysis.framework_profile.compliance_score * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Maturity Level:</strong> {analysis.framework_profile.maturity_level}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Framework ID:</strong> {analysis.framework_id}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Key Recommendations</Typography>
                  <List dense>
                    {analysis.recommendations?.slice(0, 4).map((recommendation, index) => (
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
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Component: Compliance Operations Panel
const ComplianceOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const operations = [
    {
      id: 'assess',
      title: 'Compliance Assessment',
      description: 'Comprehensive compliance status assessment',
      icon: <SecurityIcon />,
      action: async () => {
        const result = await assessCompliance({
          framework_id: 'enterprise-framework',
          assessmentScope: ['data_protection', 'access_control', 'audit_trails'],
          assessmentType: 'comprehensive'
        });
        return result.data;
      }
    },
    {
      id: 'audit',
      title: 'Compliance Audit',
      description: 'Conduct comprehensive compliance audit',
      icon: <AuditIcon />,
      action: async () => {
        const result = await conductAudit({
          audit_type: 'ML Compliance Audit',
          scope: ['model_governance', 'data_privacy', 'algorithmic_fairness'],
          auditStandards: ['ISO 27001', 'GDPR']
        });
        return result.data;
      }
    },
    {
      id: 'report',
      title: 'Generate Report',
      description: 'Generate comprehensive compliance report',
      icon: <ReportIcon />,
      action: async () => {
        const result = await generateReport({
          report_type: 'ML Studio Compliance Report',
          frameworks: ['ISO 27001', 'SOC 2', 'GDPR'],
          reportingPeriod: 'Q4 2024',
          includeMetrics: true
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
        <Typography variant="h6" gutterBottom>Compliance Operations</Typography>

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

// Main Component: Compliance Management Dashboard
const ComplianceManagementDashboard: React.FC = () => {
  const { data: complianceStatus, isLoading, error } = useQuery({
    queryKey: ['compliance-status'],
    queryFn: fetchComplianceStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Compliance Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !complianceStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load compliance system status. Please ensure the compliance core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <ComplianceIcon sx={{ mr: 2, fontSize: 32, color: '#4caf50' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Compliance Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Enterprise Compliance & Regulatory Framework Management
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ComplianceOverview status={complianceStatus} />
        </Grid>

        <Grid item xs={12}>
          <FrameworkAnalysisPanel />
        </Grid>

        <Grid item xs={12}>
          <ComplianceOperationsPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplianceManagementDashboard;