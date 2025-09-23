'use client';

// Phantom Cores Dashboard - Unified interface for all phantom-*-core modules
// Provides comprehensive enterprise cybersecurity and ML management

import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import { PATHS } from '@/config/paths';
import { phantomCoresClient } from '@/api/phantom-cores-client';
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
  Speed as PerformanceIcon,
  Flag as IOCIcon,
  BugReport as MalwareIcon,
  Fingerprint as ForensicsIcon,
  Search as HuntingIcon,
  Groups as ThreatActorIcon,
  AccountTree as MitreIcon,
  Memory as SandboxIcon,
  Stars as ReputationIcon,
  Assessment as RiskIcon,
  Gavel as ComplianceIconAlt,
  Security as CryptoIcon,
  Feed as FeedsIcon,
  Shield as VulnIcon,
  Emergency as IncidentIcon,
  Psychology as IntelIcon,
  Launch as NavigateIcon
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
  const response = await phantomCoresClient.get('/api/phantom-cores?operation=status');
  return response.json();
};

const initializePhantomCores = async () => {
  const response = await phantomCoresClient.post('/api/phantom-cores', {
    operation: 'initialize',
    config: {
      organizationName: 'ML Studio Enterprise',
      enterpriseMode: true,
      integrationMode: 'full',
      enabledModules: [
        'ml', 'xdr', 'compliance', 'attribution', 'crypto', 'cve', 
        'feeds', 'forensics', 'hunting', 'incidentResponse', 'intel', 
        'ioc', 'malware', 'mitre', 'reputation', 'risk', 'sandbox', 
        'secop', 'threatActor', 'vulnerability'
      ]
    }
  });
  return response.json();
};

const performCrossAnalysis = async (): Promise<CrossModuleAnalysis> => {
  const response = await phantomCoresClient.post('/api/phantom-cores', {
    operation: 'cross-analysis',
    analysisType: 'enterprise_security_ml',
    includeML: true,
    includeXDR: true,
    includeCompliance: true
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

  // Add null checking for health_checks and enabled_modules
  const safeHealthChecks = health_checks || {};
  const safeEnabledModules = enabled_modules || [];

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

        <Box display="flex" flexWrap="wrap" gap={2}>
          <Box flex="1 1 350px" minWidth="350px">
            <Typography variant="subtitle2" gutterBottom>Module Health</Typography>
            <List dense>
              {Object.entries(safeHealthChecks).length > 0 ? (
                Object.entries(safeHealthChecks).map(([module, healthy]) => (
                  <ListItem key={module}>
                    <ListItemIcon>
                      {healthy ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={module.toUpperCase()}
                      secondary={healthy ? 'Operational' : 'Issues detected'}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="No health check data available"
                    secondary="System may be initializing"
                  />
                </ListItem>
              )}
            </List>
          </Box>

          <Box flex="1 1 350px" minWidth="350px">
            <Typography variant="subtitle2" gutterBottom>Configuration</Typography>
            <Typography variant="body2" color="textSecondary">
              Integration Mode: <strong>{integration_mode || 'Not configured'}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Enabled Modules: <strong>{safeEnabledModules.length}</strong>
            </Typography>
            <Box mt={1}>
              {safeEnabledModules.length > 0 ? (
                safeEnabledModules.map((module) => (
                  <Chip key={module} label={module} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No modules configured
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Component: Module Status Cards
const ModuleStatusCards: React.FC<{ status: SystemStatus | undefined }> = ({ status }) => {
  if (!status?.data?.module_status) return null;

  const { ml, xdr, compliance } = status.data.module_status;

  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      {/* ML Core Status */}
      <Box flex="1 1 300px" minWidth="300px">
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
      </Box>

      {/* XDR Core Status */}
      <Box flex="1 1 300px" minWidth="300px">
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
      </Box>

      {/* Compliance Core Status */}
      <Box flex="1 1 300px" minWidth="300px">
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
      </Box>
    </Box>
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
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box flex="1 1 350px" minWidth="350px">
                <Typography variant="subtitle2" gutterBottom>Key Insights</Typography>
                <List dense>
                  {(analysis.insights || []).length > 0 ? (
                    analysis.insights.map((insight, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ShieldIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={insight} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="No insights available" />
                    </ListItem>
                  )}
                </List>
              </Box>

              <Box flex="1 1 350px" minWidth="350px">
                <Typography variant="subtitle2" gutterBottom>Recommendations</Typography>
                <List dense>
                  {(analysis.recommendations || []).length > 0 ? (
                    analysis.recommendations.map((recommendation, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={recommendation} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="No recommendations available" />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2">
                Risk Score: <strong>{analysis.riskScore ? analysis.riskScore.toFixed(2) : 'N/A'}</strong>
              </Typography>
              <Typography variant="subtitle2">
                Modules Analyzed: <strong>{(analysis.modules || []).join(', ') || 'None'}</strong>
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Component: Phantom Modules Grid
const PhantomModulesGrid: React.FC = () => {
  const modules = [
    { 
      name: 'XDR Core', 
      path: 'xdr', 
      icon: <SecurityIcon />, 
      description: 'Extended Detection and Response Engine',
      status: 'operational',
      color: '#1976d2'
    },
    { 
      name: 'IOC Core', 
      path: 'ioc', 
      icon: <IOCIcon />, 
      description: 'Indicators of Compromise Processing',
      status: 'operational',
      color: '#d32f2f'
    },
    { 
      name: 'CVE Core', 
      path: 'cve', 
      icon: <VulnIcon />, 
      description: 'Vulnerability Management and Analysis',
      status: 'operational',
      color: '#ed6c02'
    },
    { 
      name: 'Intel Core', 
      path: 'intel', 
      icon: <IntelIcon />, 
      description: 'Threat Intelligence Platform',
      status: 'operational',
      color: '#9c27b0'
    },
    { 
      name: 'MITRE Core', 
      path: 'mitre', 
      icon: <MitreIcon />, 
      description: 'MITRE ATT&CK Framework Integration',
      status: 'operational',
      color: '#388e3c'
    },
    { 
      name: 'SecOp Core', 
      path: 'secop', 
      icon: <ShieldIcon />, 
      description: 'Security Operations Center',
      status: 'operational',
      color: '#1976d2'
    },
    { 
      name: 'Threat Actor Core', 
      path: 'threat-actor', 
      icon: <ThreatActorIcon />, 
      description: 'Threat Actor Profiling and Attribution',
      status: 'operational',
      color: '#d32f2f'
    },
    { 
      name: 'Incident Response Core', 
      path: 'incident-response', 
      icon: <IncidentIcon />, 
      description: 'Incident Response Management',
      status: 'operational',
      color: '#ed6c02'
    },
    { 
      name: 'ML Core', 
      path: 'ml', 
      icon: <MLIcon />, 
      description: 'Machine Learning and AI Platform',
      status: 'operational',
      color: '#9c27b0'
    },
    { 
      name: 'Malware Core', 
      path: 'malware', 
      icon: <MalwareIcon />, 
      description: 'Malware Analysis and Detection',
      status: 'operational',
      color: '#d32f2f'
    },
    { 
      name: 'Forensics Core', 
      path: 'forensics', 
      icon: <ForensicsIcon />, 
      description: 'Digital Forensics Analysis',
      status: 'operational',
      color: '#388e3c'
    },
    { 
      name: 'Hunting Core', 
      path: 'hunting', 
      icon: <HuntingIcon />, 
      description: 'Threat Hunting Platform',
      status: 'operational',
      color: '#1976d2'
    },
    { 
      name: 'Sandbox Core', 
      path: 'sandbox', 
      icon: <SandboxIcon />, 
      description: 'Malware Sandboxing & Dynamic Analysis',
      status: 'operational',
      color: '#388e3c'
    },
    { 
      name: 'Reputation Core', 
      path: 'reputation', 
      icon: <ReputationIcon />, 
      description: 'Reputation Scoring & Analysis',
      status: 'operational',
      color: '#ed6c02'
    },
    { 
      name: 'Risk Core', 
      path: 'risk', 
      icon: <RiskIcon />, 
      description: 'Risk Assessment & Management',
      status: 'operational',
      color: '#d32f2f'
    },
    { 
      name: 'Compliance Core', 
      path: 'compliance', 
      icon: <ComplianceIconAlt />, 
      description: 'Compliance Monitoring & Reporting',
      status: 'operational',
      color: '#1976d2'
    },
    { 
      name: 'Crypto Core', 
      path: 'crypto', 
      icon: <CryptoIcon />, 
      description: 'Cryptographic Analysis & Validation',
      status: 'operational',
      color: '#9c27b0'
    }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Phantom Core Modules
        </Typography>
        <Typography variant="body2" color="textSecondary" mb={3}>
          Click on any module to access its dedicated management interface
        </Typography>
        
        <Box display="flex" flexWrap="wrap" gap={2}>
          {modules.map((module) => (
            <Box key={module.path} flex="1 1 280px" minWidth="280px" maxWidth="300px">
              <Link href={PATHS.PHANTOM_CORE_DETAIL(module.path)} style={{ textDecoration: 'none' }}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      '& .module-icon': {
                        transform: 'scale(1.1)'
                      }
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Box 
                      className="module-icon"
                      sx={{ 
                        mb: 1, 
                        color: module.color,
                        transition: 'transform 0.2s ease-in-out'
                      }}
                    >
                      {React.cloneElement(module.icon, { sx: { fontSize: 32 } })}
                    </Box>
                    <Typography variant="subtitle1" component="h3" gutterBottom>
                      {module.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', mb: 1 }}>
                      {module.description}
                    </Typography>
                    <Chip 
                      label={module.status}
                      color="success"
                      size="small"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </CardContent>
                </Card>
              </Link>
            </Box>
          ))}
        </Box>
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
        <Box display="flex" flexDirection="column" gap={3}>
          <SystemStatusOverview status={systemStatus} />
          <ModuleStatusCards status={systemStatus} />
          <PhantomModulesGrid />
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
