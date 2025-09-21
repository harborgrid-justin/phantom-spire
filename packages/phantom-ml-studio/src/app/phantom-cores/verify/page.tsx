'use client';

// Phantom Cores API Verification Dashboard
// Comprehensive verification and testing of all phantom-*-core enterprise APIs

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  VerifiedUser as VerifiedIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Code as ApiIcon,
  Security as SecurityIcon,
  Assessment as TestIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as RunTestIcon,
  Description as ReportIcon,
  Hub as IntegrationIcon
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';

// Interfaces
interface VerificationResult {
  packageName: string;
  status: 'accessible' | 'error' | 'warning';
  importError?: string;
  availableApis: string[];
  expectedApis: string[];
  apiCoverage: number;
  coreInstance: boolean;
  enterpriseFeatures: string[];
  testResults: {
    totalTests: number;
    passed: number;
    failed: number;
    tests: Array<{
      api: string;
      status: 'passed' | 'failed' | 'warning';
      result?: string;
      error?: string;
      reason?: string;
    }>;
  };
}

interface VerificationResponse {
  timestamp: string;
  totalCores: number;
  verificationResults: Record<string, VerificationResult>;
  summary: {
    accessible: number;
    errors: number;
    warnings: number;
  };
}

// API functions
const fetchVerificationResults = async (): Promise<VerificationResponse> => {
  const response = await fetch('/api/phantom-cores/verify');
  if (!response.ok) {
    throw new Error('Failed to fetch verification results');
  }
  return response.json();
};

const testSpecificApi = async (data: { coreName: string; apiName: string; parameters?: any }) => {
  const response = await fetch('/api/phantom-cores/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'test-api',
      ...data
    })
  });
  return response.json();
};

// Component: Verification Summary
const VerificationSummary: React.FC<{ data: VerificationResponse }> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accessible': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const successRate = ((data.summary.accessible / data.totalCores) * 100).toFixed(1);

  return (
    <Grid container spacing={2} mb={3}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Total Cores</Typography>
            <Typography variant="h3" color="primary">
              {data.totalCores}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Phantom core packages
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Accessible</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={parseFloat(successRate)}
                size={60}
                color="success"
              />
              <Box ml={2}>
                <Typography variant="h4" color="success.main">
                  {data.summary.accessible}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {successRate}% success
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Errors</Typography>
            <Typography variant="h3" color="error">
              {data.summary.errors}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Failed imports
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Warnings</Typography>
            <Typography variant="h3" color="warning.main">
              {data.summary.warnings}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Partial access
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Component: Core Details
const CoreDetails: React.FC<{ coreName: string; result: VerificationResult }> = ({ coreName, result }) => {
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedApi, setSelectedApi] = useState('');
  const [testParameters, setTestParameters] = useState('{}');

  const testApiMutation = useMutation({
    mutationFn: testSpecificApi,
    onSuccess: (data) => {
      console.log('API test result:', data);
    }
  });

  const handleTestApi = () => {
    if (selectedApi) {
      try {
        const parameters = JSON.parse(testParameters);
        testApiMutation.mutate({
          coreName,
          apiName: selectedApi,
          parameters
        });
      } catch (error) {
        console.error('Invalid JSON parameters:', error);
      }
    }
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" width="100%">
          <Box display="flex" alignItems="center" flex={1}>
            <Chip
              icon={result.status === 'accessible' ? <CheckCircleIcon /> :
                    result.status === 'error' ? <ErrorIcon /> : <WarningIcon />}
              label={result.status}
              color={result.status === 'accessible' ? 'success' :
                     result.status === 'error' ? 'error' : 'warning'}
              size="small"
              sx={{ mr: 2 }}
            />
            <Typography variant="subtitle1">
              {coreName}
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            APIs: {result.availableApis.length} | Coverage: {result.apiCoverage.toFixed(1)}%
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {/* Package Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Package Information</Typography>
              <Typography variant="body2" mb={1}>
                <strong>Package:</strong> {result.packageName}
              </Typography>
              <Typography variant="body2" mb={1}>
                <strong>Status:</strong> {result.status}
              </Typography>
              <Typography variant="body2" mb={1}>
                <strong>Core Instance:</strong> {result.coreInstance ? 'Available' : 'Not Available'}
              </Typography>
              <Typography variant="body2" mb={1}>
                <strong>API Coverage:</strong> {result.apiCoverage.toFixed(1)}%
              </Typography>
              {result.importError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  Import Error: {result.importError}
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Enterprise Features */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Enterprise Features</Typography>
              <List dense>
                {result.enterpriseFeatures.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <SecurityIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={feature}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Available APIs */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1">Available APIs</Typography>
                <Button
                  size="small"
                  startIcon={<RunTestIcon />}
                  onClick={() => setTestDialogOpen(true)}
                  disabled={result.availableApis.length === 0}
                >
                  Test API
                </Button>
              </Box>
              <List dense>
                {result.availableApis.map((api, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ApiIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={api}
                      primaryTypographyProps={{ variant: 'body2', fontFamily: 'monospace' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Test Results */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Test Results</Typography>
              <Typography variant="body2" color="textSecondary" mb={1}>
                Total: {result.testResults.totalTests} |
                Passed: {result.testResults.passed} |
                Failed: {result.testResults.failed}
              </Typography>
              <List dense>
                {result.testResults.tests.slice(0, 5).map((test, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Chip
                        size="small"
                        label={test.status}
                        color={test.status === 'passed' ? 'success' :
                               test.status === 'failed' ? 'error' : 'warning'}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={test.api}
                      secondary={test.result || test.error || test.reason}
                      primaryTypographyProps={{ variant: 'body2', fontFamily: 'monospace' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* API Test Dialog */}
        <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Test API - {coreName}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select API</InputLabel>
                  <Select
                    value={selectedApi}
                    onChange={(e) => setSelectedApi(e.target.value)}
                    label="Select API"
                  >
                    {result.availableApis.map((api) => (
                      <MenuItem key={api} value={api}>{api}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Test Parameters (JSON)"
                  value={testParameters}
                  onChange={(e) => setTestParameters(e.target.value)}
                  placeholder='{"test": true, "parameter": "value"}'
                />
              </Grid>
              {testApiMutation.data && (
                <Grid item xs={12}>
                  <Alert severity={testApiMutation.data.success ? 'success' : 'error'}>
                    <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                      {JSON.stringify(testApiMutation.data, null, 2)}
                    </pre>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTestDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleTestApi}
              variant="contained"
              disabled={!selectedApi || testApiMutation.isPending}
            >
              {testApiMutation.isPending ? 'Testing...' : 'Test API'}
            </Button>
          </DialogActions>
        </Dialog>
      </AccordionDetails>
    </Accordion>
  );
};

// Main Component: API Verification Dashboard
const PhantomCoresVerificationDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const { data: verificationData, isLoading, error, refetch } = useQuery({
    queryKey: ['phantom-cores-verification'],
    queryFn: fetchVerificationResults,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>
          Verifying Phantom Cores API Accessibility...
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Testing all 20 phantom-*-core packages and their enterprise APIs
        </Typography>
      </Box>
    );
  }

  if (error || !verificationData) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load verification results. Please ensure all phantom cores are properly configured.
        </Alert>
        <Button variant="contained" onClick={() => refetch()} sx={{ mt: 2 }}>
          Retry Verification
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <VerifiedIcon sx={{ mr: 2, fontSize: 32, color: '#4caf50' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Phantom Cores API Verification
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Enterprise API Accessibility Report for All Phantom-*-Core Packages
          </Typography>
        </Box>
        <Box ml="auto">
          <Button
            variant="contained"
            startIcon={<ReportIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh Verification
          </Button>
        </Box>
      </Box>

      {/* Summary */}
      <VerificationSummary data={verificationData} />

      {/* Main Content */}
      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
            <Tab label="All Cores" icon={<IntegrationIcon />} />
            <Tab label="Accessible" icon={<CheckCircleIcon />} />
            <Tab label="Errors" icon={<ErrorIcon />} />
            <Tab label="Summary Report" icon={<ReportIcon />} />
          </Tabs>

          {/* Tab Content */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                All Phantom Core Packages ({verificationData.totalCores})
              </Typography>
              {Object.entries(verificationData.verificationResults).map(([coreName, result]) => (
                <CoreDetails key={coreName} coreName={coreName} result={result} />
              ))}
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Accessible Cores ({verificationData.summary.accessible})
              </Typography>
              {Object.entries(verificationData.verificationResults)
                .filter(([_, result]) => result.status === 'accessible')
                .map(([coreName, result]) => (
                  <CoreDetails key={coreName} coreName={coreName} result={result} />
                ))}
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Cores with Errors ({verificationData.summary.errors})
              </Typography>
              {Object.entries(verificationData.verificationResults)
                .filter(([_, result]) => result.status === 'error')
                .map(([coreName, result]) => (
                  <CoreDetails key={coreName} coreName={coreName} result={result} />
                ))}
            </Box>
          )}

          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Verification Summary Report</Typography>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  {`PHANTOM CORES API VERIFICATION REPORT
Generated: ${new Date(verificationData.timestamp).toLocaleString()}

SUMMARY:
========
Total Phantom Cores: ${verificationData.totalCores}
Accessible: ${verificationData.summary.accessible}
Errors: ${verificationData.summary.errors}
Warnings: ${verificationData.summary.warnings}
Success Rate: ${((verificationData.summary.accessible / verificationData.totalCores) * 100).toFixed(1)}%

DETAILED RESULTS:
================
${Object.entries(verificationData.verificationResults)
  .map(([coreName, result]) =>
    `${coreName.toUpperCase()}:
  Package: ${result.packageName}
  Status: ${result.status}
  Available APIs: ${result.availableApis.length}
  API Coverage: ${result.apiCoverage.toFixed(1)}%
  Core Instance: ${result.coreInstance ? 'Yes' : 'No'}
  Enterprise Features: ${result.enterpriseFeatures.length}
  Test Results: ${result.testResults.passed}/${result.testResults.totalTests} passed
  ${result.importError ? `  Import Error: ${result.importError}` : ''}
`).join('\n')}

RECOMMENDATIONS:
===============
${verificationData.summary.errors > 0 ?
  '• Fix import errors for failed cores' :
  '• All cores are accessible'}
${verificationData.summary.accessible < verificationData.totalCores ?
  '• Check package installations and dependencies' :
  '• All phantom cores successfully integrated'}
• Regular verification recommended for production deployments
• Monitor API coverage and test results for optimal performance`}
                </Typography>
              </Paper>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PhantomCoresVerificationDashboard;