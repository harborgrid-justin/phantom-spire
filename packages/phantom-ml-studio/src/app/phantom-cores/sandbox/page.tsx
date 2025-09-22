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
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
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

  // Add null check for metrics
  if (!metrics) {
    return (
      <Alert severity="info">Sandbox metrics are currently being initialized...</Alert>
    );
  }

  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>System Status</Typography>
            <Chip
              icon={status.data.status === 'operational' ? <CheckCircleIcon /> : <WarningIcon />}
              label={status.data.status || 'Unknown'}
              color={status.data.status === 'operational' ? 'success' : 'warning'}
            />
            <Typography variant="body2" color="textSecondary" mt={1}>
              Uptime: {metrics.uptime || 'N/A'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active Sandboxes</Typography>
            <Typography variant="h3" color="primary">
              {metrics.sandbox_instances || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Running instances
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Samples Analyzed</Typography>
            <Typography variant="h3" color="secondary">
              {(metrics.samples_analyzed || 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total specimens
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
                color="success"
              />
              <Box ml={2}>
                <Typography variant="h4" color="success.main">
                  {((metrics.detection_rate || 0) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Malware Detection
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
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
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Box flex="1 1 400px" minWidth="400px">
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
              </Box>

              <Box flex="1 1 400px" minWidth="400px">
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
              </Box>
            </Box>

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

// Component: Sandbox Queue Panel
const SandboxQueuePanel: React.FC = () => {
  const [queuedFiles, setQueuedFiles] = useState([
    { id: 1, filename: 'suspicious_file.exe', status: 'queued', priority: 'high', size: '2.3MB', submittedAt: '2024-01-15 10:30:00' },
    { id: 2, filename: 'malware_sample.zip', status: 'processing', priority: 'critical', size: '1.8MB', submittedAt: '2024-01-15 10:25:00' },
    { id: 3, filename: 'unknown_binary.dll', status: 'completed', priority: 'medium', size: '512KB', submittedAt: '2024-01-15 10:20:00' },
  ]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sandbox Queue
        </Typography>
        <List>
          {queuedFiles.map((file) => (
            <ListItem key={file.id} divider>
              <ListItemIcon>
                {file.status === 'queued' && <SandboxIcon color="action" />}
                {file.status === 'processing' && <DynamicIcon color="primary" />}
                {file.status === 'completed' && <CheckCircleIcon color="success" />}
              </ListItemIcon>
              <ListItemText
                primary={file.filename}
                secondary={
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Size: {file.size} | Priority: {file.priority} | Status: {file.status}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Submitted: {file.submittedAt}
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

// Component: Sandbox Metrics Panel
const SandboxMetricsPanel: React.FC = () => {
  const metrics = {
    totalAnalyses: 1247,
    threatDetected: 342,
    cleanFiles: 905,
    averageAnalysisTime: '3.2min',
    successRate: '98.7%'
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Performance Metrics
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <Box flex="1 1 200px" minWidth="200px">
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{metrics.totalAnalyses}</Typography>
              <Typography variant="body2" color="textSecondary">Total Analyses</Typography>
            </Paper>
          </Box>
          <Box flex="1 1 200px" minWidth="200px">
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="error">{metrics.threatDetected}</Typography>
              <Typography variant="body2" color="textSecondary">Threats Detected</Typography>
            </Paper>
          </Box>
          <Box flex="1 1 200px" minWidth="200px">
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success">{metrics.cleanFiles}</Typography>
              <Typography variant="body2" color="textSecondary">Clean Files</Typography>
            </Paper>
          </Box>
          <Box flex="1 1 200px" minWidth="200px">
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{metrics.averageAnalysisTime}</Typography>
              <Typography variant="body2" color="textSecondary">Avg Analysis Time</Typography>
            </Paper>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Component: Sandbox History Panel  
const SandboxHistoryPanel: React.FC = () => {
  const [historyData, setHistoryData] = useState([
    { id: 1, filename: 'trojan.exe', result: 'malicious', confidence: 95, analysisTime: '4.2min', timestamp: '2024-01-15 10:15:00' },
    { id: 2, filename: 'document.pdf', result: 'clean', confidence: 99, analysisTime: '2.1min', timestamp: '2024-01-15 10:10:00' },
    { id: 3, filename: 'installer.msi', result: 'suspicious', confidence: 78, analysisTime: '3.8min', timestamp: '2024-01-15 10:05:00' },
    { id: 4, filename: 'archive.zip', result: 'clean', confidence: 97, analysisTime: '1.9min', timestamp: '2024-01-15 10:00:00' },
  ]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Analysis History
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Filename</TableCell>
                <TableCell>Result</TableCell>
                <TableCell align="center">Confidence</TableCell>
                <TableCell>Analysis Time</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyData.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.filename}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.result}
                      color={
                        row.result === 'malicious' ? 'error' : 
                        row.result === 'suspicious' ? 'warning' : 'success'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{row.confidence}%</TableCell>
                  <TableCell>{row.analysisTime}</TableCell>
                  <TableCell>{row.timestamp}</TableCell>
                  <TableCell align="center">
                    <Button size="small" variant="outlined">
                      View Report
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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

      <Box display="flex" flexDirection="column" gap={3}>
        <SandboxOverview status={sandboxStatus} />
        <SandboxAnalysisPanel />
        
        <Box display="flex" flexWrap="wrap" gap={3}>
          <Box flex="1 1 400px" minWidth="400px">
            <SandboxQueuePanel />
          </Box>
          <Box flex="1 1 400px" minWidth="400px">
            <SandboxMetricsPanel />
          </Box>
        </Box>
        
        <SandboxHistoryPanel />
      </Box>
    </Box>
  );
};

export default SandboxManagementDashboard;
