'use client';

// Phantom Risk Core Management - Enterprise Risk Assessment Dashboard
// Provides comprehensive GUI for risk management and assessment

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
  Assessment as RiskIcon,
  TrendingUp as TrendIcon,
  Security as SecurityIcon,
  Speed as PerformanceIcon,
  Report as ReportIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalance as GovernanceIcon,
  Timeline as TimelineIcon,
  Shield as ShieldIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces
interface RiskStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      active_assessments: number;
      overall_risk_score: number;
      critical_risks: number;
    };
  };
}

interface RiskAssessment {
  assessment_id: string;
  risk_profile: {
    organization: string;
    overall_risk_score: number;
    risk_level: string;
    assessment_date: string;
  };
  risk_categories: {
    operational: number;
    financial: number;
    reputational: number;
    compliance: number;
    technical: number;
  };
  critical_risks: any[];
  recommendations: string[];
  mitigation_strategies: string[];
}

// API functions
const fetchRiskStatus = async (): Promise<RiskStatus> => {
  const response = await fetch('/api/phantom-cores/risk?operation=status');
  return response.json();
};

const performRiskAssessment = async (assessmentData: any) => {
  const response = await fetch('/api/phantom-cores/risk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'assess-risks',
      assessmentData
    })
  });
  return response.json();
};

const analyzeTrends = async (analysisData: any) => {
  const response = await fetch('/api/phantom-cores/risk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-trends',
      analysisData
    })
  });
  return response.json();
};

const generateMitigation = async (mitigationData: any) => {
  const response = await fetch('/api/phantom-cores/risk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'generate-mitigation',
      mitigationData
    })
  });
  return response.json();
};

// Component: Risk Overview
const RiskOverview: React.FC<{ status: RiskStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Risk system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'success';
    if (score <= 60) return 'warning';
    return 'error';
  };

  const getRiskLevel = (score: number) => {
    if (score <= 30) return 'Low Risk';
    if (score <= 60) return 'Medium Risk';
    return 'High Risk';
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
            <Typography variant="h6" gutterBottom>Overall Risk Score</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.overall_risk_score}
                size={60}
                color={getRiskColor(metrics.overall_risk_score)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getRiskColor(metrics.overall_risk_score)}>
                  {metrics.overall_risk_score.toFixed(0)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {getRiskLevel(metrics.overall_risk_score)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active Assessments</Typography>
            <Typography variant="h3" color="primary">
              {metrics.active_assessments}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Currently running assessments
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Critical Risks</Typography>
            <Typography variant="h3" color="error">
              {metrics.critical_risks}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Requiring immediate attention
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Component: Risk Assessment Panel
const RiskAssessmentPanel: React.FC = () => {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [assessmentType, setAssessmentType] = useState('comprehensive');
  const [organization, setOrganization] = useState('Enterprise Organization');

  const assessmentTypes = [
    'comprehensive', 'operational', 'financial', 'cybersecurity', 'compliance'
  ];

  const runRiskAssessment = async () => {
    setLoading(true);
    try {
      const result = await performRiskAssessment({
        organization: organization,
        assessment_type: assessmentType,
        scope: 'enterprise_wide',
        risk_appetite: 'moderate',
        assessment_framework: 'ISO 31000'
      });
      setAssessment(result.data);
    } catch (error) {
      console.error('Risk assessment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Risk Assessment</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              size="small"
              label="Organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Assessment Type</InputLabel>
              <Select
                value={assessmentType}
                onChange={(e) => setAssessmentType(e.target.value)}
                label="Assessment Type"
              >
                {assessmentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<RiskIcon />}
              onClick={runRiskAssessment}
              disabled={loading}
            >
              Assess
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {assessment && (
          <Box>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Risk Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Organization:</strong> {assessment.risk_profile.organization}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Overall Score:</strong> {assessment.risk_profile.overall_risk_score.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Risk Level:</strong> {assessment.risk_profile.risk_level}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Assessment Date:</strong> {new Date(assessment.risk_profile.assessment_date).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Risk Categories</Typography>
                  <Grid container spacing={1}>
                    {Object.entries(assessment.risk_categories).map(([category, score]) => (
                      <Grid item xs={12} key={category}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {category}:
                          </Typography>
                          <Chip
                            label={`${score}/100`}
                            size="small"
                            color={score > 70 ? 'error' : score > 40 ? 'warning' : 'success'}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Key Recommendations</Typography>
                  <List dense>
                    {assessment.recommendations?.slice(0, 4).map((recommendation, index) => (
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

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Mitigation Strategies</Typography>
                  <List dense>
                    {assessment.mitigation_strategies?.slice(0, 4).map((strategy, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ShieldIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={strategy}
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

// Component: Risk Operations Panel
const RiskOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'trends',
      title: 'Risk Trend Analysis',
      description: 'Analyze risk trends and patterns over time',
      icon: <TrendIcon />,
      action: async () => {
        const result = await analyzeTrends({
          analysis_period: '12_months',
          trend_categories: ['operational', 'financial', 'cybersecurity'],
          prediction_horizon: '6_months'
        });
        return result.data;
      }
    },
    {
      id: 'mitigation',
      title: 'Generate Mitigation Plan',
      description: 'Generate comprehensive risk mitigation strategies',
      icon: <ShieldIcon />,
      action: async () => {
        const result = await generateMitigation({
          risk_tolerance: 'moderate',
          budget_constraints: 'standard',
          timeline: '12_months',
          priority_areas: ['cybersecurity', 'operational', 'compliance']
        });
        return result.data;
      }
    },
    {
      id: 'governance',
      title: 'Governance Review',
      description: 'Review risk governance and compliance frameworks',
      icon: <GovernanceIcon />,
      action: async () => {
        const result = await fetch('/api/phantom-cores/risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'governance-review',
            frameworks: ['ISO 31000', 'COSO ERM', 'Basel III'],
            scope: 'enterprise_wide'
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
        <Typography variant="h6" gutterBottom>Risk Operations</Typography>

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

// Main Component: Risk Management Dashboard
const RiskManagementDashboard: React.FC = () => {
  const { data: riskStatus, isLoading, error } = useQuery({
    queryKey: ['risk-status'],
    queryFn: fetchRiskStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Risk Management Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !riskStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load risk system status. Please ensure the risk core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <RiskIcon sx={{ mr: 2, fontSize: 32, color: '#ff9800' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Risk Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Enterprise Risk Assessment & Mitigation Platform
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <RiskOverview status={riskStatus} />
        </Grid>

        <Grid item xs={12}>
          <RiskAssessmentPanel />
        </Grid>

        <Grid item xs={12}>
          <RiskOperationsPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RiskManagementDashboard;