'use client';

// Phantom Sandbox Core Management - Malware Sandboxing & Analysis
// Provides comprehensive GUI for malware sandboxing and dynamic analysis

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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  TextField
} from '@mui/material';
import {
  Computer as SandboxIcon,
  PlayArrow as ExecuteIcon,
  Security as SecurityIcon,
  Assessment as AnalysisIcon,
  BugReport as MalwareIcon,
  Memory as VirtualIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Speed as DynamicIcon,
  Shield as IsolationIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

// Interfaces
interface SandboxStatus {
  success: boolean;
  data?: {
    status: string;
    metrics: {
      uptime: string;
      sandbox_instances: number;
      samples_analyzed: number;
      detection_rate: number;
      avg_analysis_time: string;
    };
  };
}

interface SandboxAnalysis {
  analysis_id: string;
  sandbox_profile: {
    sample_hash: string;
    environment: string;
    analysis_duration: string;
    threat_detected: boolean;
  };
  behavioral_analysis: any;
  network_analysis: any;
  recommendations: string[];
}

// API functions
const fetchSandboxStatus = async (): Promise<SandboxStatus> => {
  const response = await fetch('/api/phantom-cores/sandbox?operation=status');
  return response.json();
};

const executeSandboxAnalysis = async (sandboxData: any) => {
  const response = await fetch('/api/phantom-cores/sandbox', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'execute-analysis',
      sandboxData
    })
  });
  return response.json();
};

// Component: Sandbox Overview
const SandboxOverview: React.FC<{ status: SandboxStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Sandbox system status unavailable</Alert>
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
            <Typography variant="h6" gutterBottom>Active Sandboxes</Typography>
            <Typography variant="h3" color="primary">
              {metrics.sandbox_instances}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Running instances
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Samples Analyzed</Typography>
            <Typography variant="h3" color="secondary">
              {metrics.samples_analyzed.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total specimens
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Detection Rate</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.detection_rate * 100}
                size={60}
                color="success"
              />
              <Box ml={2}>
                <Typography variant="h4" color="success.main">
                  {(metrics.detection_rate * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Malware Detection
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Component: Sandbox Analysis Panel
const SandboxAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<SandboxAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [environment, setEnvironment] = useState('windows_10');
  const [sampleHash, setSampleHash] = useState('a1b2c3d4e5f6789...');

  const environments = ['windows_10', 'windows_11', 'ubuntu_20', 'macos_monterey', 'android_11'];

  const runSandboxAnalysis = async () => {
    setLoading(true);
    try {
      const result = await executeSandboxAnalysis({
        sample_hash: sampleHash,
        environment: environment,
        analysis_timeout: 300,
        enable_network_monitoring: true,
        enable_file_monitoring: true,
        enable_registry_monitoring: true,
        isolation_level: 'maximum'
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Sandbox analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Sandbox Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              size="small"
              label="Sample Hash"
              value={sampleHash}
              onChange={(e) => setSampleHash(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Environment</InputLabel>
              <Select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                label="Environment"
              >
                {environments.map((env) => (
                  <MenuItem key={env} value={env}>
                    {env.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<ExecuteIcon />}
              onClick={runSandboxAnalysis}
              disabled={loading}
            >
              Execute
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {analysis && (
          <Box>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Analysis Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Sample Hash:</strong> {analysis.sandbox_profile.sample_hash}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Environment:</strong> {analysis.sandbox_profile.environment}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Duration:</strong> {analysis.sandbox_profile.analysis_duration}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Threat Detected:</strong>
                    <Chip
                      label={analysis.sandbox_profile.threat_detected ? 'YES' : 'NO'}
                      color={analysis.sandbox_profile.threat_detected ? 'error' : 'success'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2">
                    <strong>Analysis ID:</strong> {analysis.analysis_id}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Behavioral Analysis</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <MalwareIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Malicious behavior patterns detected"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Persistence mechanisms established"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <DynamicIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Network communication attempted"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <IsolationIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Successfully contained in sandbox"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Analysis Recommendations</Typography>
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

// Main Component: Sandbox Management Dashboard
const SandboxManagementDashboard: React.FC = () => {
  const { data: sandboxStatus, isLoading, error } = useQuery({
    queryKey: ['sandbox-status'],
    queryFn: fetchSandboxStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Sandbox Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !sandboxStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load sandbox system status. Please ensure the sandbox core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <SandboxIcon sx={{ mr: 2, fontSize: 32, color: '#4caf50' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Sandbox Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Malware Sandboxing & Dynamic Analysis Platform
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SandboxOverview status={sandboxStatus} />
        </Grid>

        <Grid item xs={12}>
          <SandboxAnalysisPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SandboxManagementDashboard;