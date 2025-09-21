'use client';

// Phantom Cores Dashboard - Unified interface for all phantom-*-core modules
// Provides comprehensive enterprise cybersecurity and ML management

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
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Security as SecurityIcon,
  Assessment as ComplianceIcon,
  Psychology as MLIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Analytics as AnalyticsIcon,
  Shield as ShieldIcon,
  Computer as SystemIcon,
  Speed as PerformanceIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Component interfaces
interface SystemStatus {
  success: boolean;
  data?: {
    overall_health: boolean;
    module_status: {
      ml: any;
      xdr: any;
      compliance: any;
    };
    health_checks: Record<string, boolean>;
    integration_mode: string;
    enabled_modules: string[];
  };
  error?: string;
}

interface CrossModuleAnalysis {
  analysisId: string;
  analysisType: string;
  modules: string[];
  results: any;
  insights: string[];
  recommendations: string[];
  riskScore: number;
}

// API functions
const fetchSystemStatus = async (): Promise<SystemStatus> => {
  const response = await fetch('/api/phantom-cores?operation=status');
  return response.json();
};

const initializePhantomCores = async () => {
  const response = await fetch('/api/phantom-cores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'initialize',
      config: {
        organizationName: 'ML Studio Enterprise',
        enterpriseMode: true,
        integrationMode: 'full',
        enabledModules: ['ml', 'xdr', 'compliance']
      }
    })
  });
  return response.json();
};

const performCrossAnalysis = async (): Promise<CrossModuleAnalysis> => {
  const response = await fetch('/api/phantom-cores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'cross-analysis',
      analysisType: 'enterprise_security_ml',
      includeML: true,
      includeXDR: true,
      includeCompliance: true
    })
  });
  const result = await response.json();
  return result.data;
};

// Component: System Status Overview
const SystemStatusOverview: React.FC<{ status: SystemStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Status
          </Typography>
          <Alert severity="warning">System status unavailable</Alert>
        </CardContent>
      </Card>
    );
  }

  const { overall_health, health_checks, integration_mode, enabled_modules } = status.data;

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">System Status</Typography>
          <Chip
            icon={overall_health ? <CheckCircleIcon /> : <ErrorIcon />}
            label={overall_health ? 'Healthy' : 'Issues Detected'}
            color={overall_health ? 'success' : 'error'}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>Module Health</Typography>
            <List dense>
              {Object.entries(health_checks).map(([module, healthy]) => (
                <ListItem key={module}>
                  <ListItemIcon>
                    {healthy ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={module.toUpperCase()}
                    secondary={healthy ? 'Operational' : 'Issues detected'}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>Configuration</Typography>
            <Typography variant="body2" color="textSecondary">
              Integration Mode: <strong>{integration_mode}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Enabled Modules: <strong>{enabled_modules.length}</strong>
            </Typography>
            <Box mt={1}>
              {enabled_modules.map((module) => (
                <Chip key={module} label={module} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Component: Module Status Cards
const ModuleStatusCards: React.FC<{ status: SystemStatus | undefined }> = ({ status }) => {
  if (!status?.data?.module_status) return null;

  const { ml, xdr, compliance } = status.data.module_status;

  return (
    <Grid container spacing={2}>
      {/* ML Core Status */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <MLIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">ML Core</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              Status: <strong>{ml?.status || 'Unknown'}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Models: <strong>{ml?.active_models || 0}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Training Jobs: <strong>{ml?.training_jobs || 0}</strong>
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* XDR Core Status */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <SecurityIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">XDR Core</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              Status: <strong>{xdr?.system_overview?.overall_status || 'Unknown'}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Threats: <strong>{xdr?.threat_landscape?.active_threats || 0}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Uptime: <strong>{xdr?.system_overview?.uptime || 'N/A'}</strong>
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Compliance Core Status */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <ComplianceIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">Compliance Core</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              Status: <strong>{compliance?.status || 'Unknown'}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Frameworks: <strong>{compliance?.active_frameworks || 0}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Score: <strong>{compliance?.compliance_score || 'N/A'}</strong>
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Component: Cross-Module Analysis
const CrossModuleAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<CrossModuleAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const result = await performCrossAnalysis();
      setAnalysis(result);
    } catch (error) {
      console.error('Cross-module analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Cross-Module Analysis</Typography>
          <Button
            variant="contained"
            startIcon={<AnalyticsIcon />}
            onClick={runAnalysis}
            disabled={loading}
          >
            Run Analysis
          </Button>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {analysis && (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Key Insights</Typography>
                <List dense>
                  {analysis.insights.map((insight, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <ShieldIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={insight} />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Recommendations</Typography>
                <List dense>
                  {analysis.recommendations.map((recommendation, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={recommendation} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2">
                Risk Score: <strong>{analysis.riskScore.toFixed(2)}</strong>
              </Typography>
              <Typography variant="subtitle2">
                Modules Analyzed: <strong>{analysis.modules.join(', ')}</strong>
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Main Component: Phantom Cores Dashboard
const PhantomCoresDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const queryClient = useQueryClient();

  // System status query
  const { data: systemStatus, isLoading, error } = useQuery({
    queryKey: ['phantom-cores-status'],
    queryFn: fetchSystemStatus,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Initialize cores mutation
  const initializeMutation = useMutation({
    mutationFn: initializePhantomCores,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phantom-cores-status'] });
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['phantom-cores-status'] });
  };

  const handleInitialize = () => {
    initializeMutation.mutate();
  };

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Phantom Cores Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !systemStatus?.success) {
    return (
      <Box p={3}>
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={handleInitialize}>
              Initialize Cores
            </Button>
          }
        >
          Phantom Cores not initialized or unavailable. Click initialize to set up the system.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <DashboardIcon sx={{ mr: 2, fontSize: 32 }} />
          <Box>
            <Typography variant="h4" component="h1">
              Phantom Cores Dashboard
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Unified Enterprise Cybersecurity & ML Management
            </Typography>
          </Box>
        </Box>

        <Box>
          <Tooltip title="Refresh Status">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<SystemIcon />}
            onClick={handleInitialize}
            disabled={initializeMutation.isPending}
            sx={{ ml: 1 }}
          >
            {initializeMutation.isPending ? 'Initializing...' : 'Reinitialize'}
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" icon={<DashboardIcon />} />
          <Tab label="Cross-Analysis" icon={<AnalyticsIcon />} />
          <Tab label="Performance" icon={<PerformanceIcon />} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {tabValue === 0 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SystemStatusOverview status={systemStatus} />
            </Grid>
            <Grid item xs={12}>
              <ModuleStatusCards status={systemStatus} />
            </Grid>
          </Grid>
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <CrossModuleAnalysisPanel />
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Alert severity="info">
                Performance monitoring dashboard coming soon. This will include real-time metrics
                for all phantom core modules including throughput, response times, and resource usage.
              </Alert>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default PhantomCoresDashboard;