'use client';

// Phantom Compliance Core Management - Enterprise Compliance Dashboard
// Provides comprehensive GUI for compliance management and regulatory frameworks

import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Assessment as ComplianceIcon
} from '@mui/icons-material';

// Import modular components
import ComplianceOverview from './components/ComplianceOverview';
import ComplianceAnalysisPanel from './components/ComplianceAnalysisPanel';
import ComplianceOperationsPanel from './components/ComplianceOperationsPanel';

// Import custom hook
import { useComplianceStatus } from './hooks/useComplianceStatus';

// Main Component: Compliance Management Dashboard
const ComplianceManagementDashboard: React.FC = () => {
  const { data: complianceStatus, isLoading, error } = useComplianceStatus();

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

      <Box display="flex" flexDirection="column" gap={3}>
        <ComplianceOverview status={complianceStatus} />
        <ComplianceAnalysisPanel />
        <ComplianceOperationsPanel />
      </Box>
    </Box>
  );
};

export default ComplianceManagementDashboard;
