'use client';

// Phantom Cores API Verification Dashboard
// Comprehensive verification and testing of all phantom-*-core enterprise APIs

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  VerifiedUser as VerifiedIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Description as ReportIcon,
  Hub as IntegrationIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

// Import types, API functions, and components
import { VerificationResponse } from './types';
import { fetchVerificationResults } from './api';
import { VerificationSummary, CoreDetails } from './components';

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

  // Generate summary report content
  const generateSummaryReport = (data: VerificationResponse) => {
    const totalCores = data.totalCores || 0;
    const accessible = data.summary.accessible || 0;
    const errors = data.summary.errors || 0;
    const warnings = data.summary.warnings || 0;
    const successRate = totalCores > 0 ? ((accessible / totalCores) * 100).toFixed(1) : '0.0';

    return `PHANTOM CORES API VERIFICATION REPORT
Generated: ${new Date(data.timestamp).toLocaleString()}

SUMMARY:
Total Phantom Cores: ${totalCores}
Accessible: ${accessible}
Errors: ${errors}
Warnings: ${warnings}
Success Rate: ${successRate}%

DETAILED RESULTS:
${Object.entries(data.verificationResults || {})
  .map(([coreName, result]) =>
    `${coreName.toUpperCase()}:
  Package: ${result.packageName || 'Unknown'}
  Status: ${result.status || 'Unknown'}
  Available APIs: ${(result.availableApis || []).length}
  API Coverage: ${(result.apiCoverage || 0).toFixed(1)}%
  Core Instance: ${result.coreInstance ? 'Yes' : 'No'}
  Enterprise Features: ${(result.enterpriseFeatures || []).length}
  Test Results: ${(result.testResults?.passed || 0)}/${(result.testResults?.totalTests || 0)} passed
  ${result.importError ? `  Import Error: ${result.importError}` : ''}
`).join('\n')}

RECOMMENDATIONS:
${errors > 0 ?
  '• Fix import errors for failed cores' :
  '• All cores are accessible'}
${accessible < totalCores ?
  '• Check package installations and dependencies' :
  '• All phantom cores successfully integrated'}
• Regular verification recommended for production deployments
• Monitor API coverage and test results for optimal performance`;
  };

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
                  {generateSummaryReport(verificationData)}
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
