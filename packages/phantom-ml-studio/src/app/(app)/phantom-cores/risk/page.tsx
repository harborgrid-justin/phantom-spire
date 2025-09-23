'use client';

// Phantom Risk Core Management - Enterprise Risk Assessment Dashboard
// Provides comprehensive GUI for risk management and assessment

import React from 'react';
import {
  Box,
  Typography,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Assessment as RiskIcon
} from '@mui/icons-material';
import { useRiskStatus } from './hooks';
import { RiskOverview, RiskAssessmentPanel, RiskOperationsPanel } from './components';

// Main Component: Risk Management Dashboard
const RiskManagementDashboard: React.FC = () => {
  const { data: riskStatus, isLoading, error } = useRiskStatus();

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

      <Box display="flex" flexDirection="column" gap={3}>
        <RiskOverview status={riskStatus} />
        <RiskAssessmentPanel />
        <RiskOperationsPanel />
      </Box>
    </Box>
  );
};

export default RiskManagementDashboard;
