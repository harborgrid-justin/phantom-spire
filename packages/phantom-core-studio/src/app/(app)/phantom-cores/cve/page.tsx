'use client';

// Phantom CVE Core Management - Enhanced Real-time CVE Management & Vulnerability Tracking
// Provides comprehensive GUI for CVE database management with real-time streaming, ML prioritization,
// and cross-module threat intelligence correlation

import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  BugReport as CVEIcon
} from '@mui/icons-material';

// Import modular components
import CVEOverview from './components/CVEOverview';
import CVEAnalysisPanel from './components/CVEAnalysisPanel';
import CVEOperationsPanel from './components/CVEOperationsPanel';

// Import custom hook
import { useCVEStatus } from './hooks/useCVEStatus';

// Main Component: CVE Management Dashboard
const CVEManagementDashboard: React.FC = () => {
  const { data: cveStatus, isLoading, error } = useCVEStatus();

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
