'use client';

// Phantom ML Core Management - Machine Learning Security Analytics
// Provides comprehensive GUI for ML-powered security analytics and threat detection

import React from 'react';
import {
  Box,
  Typography,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  AutoAwesome as MLIcon
} from '@mui/icons-material';
import { useMLStatus } from './hooks';
import { MLOverview, MLAnalysisPanel, MLOperationsPanel } from './components';

// Main Component: ML Management Dashboard
const MLManagementDashboard: React.FC = () => {
  const { data: mlStatus, isLoading, error } = useMLStatus();

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading ML Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !mlStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load ML system status. Please ensure the ML core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <MLIcon sx={{ mr: 2, fontSize: 32, color: '#00bcd4' }} />
        <Box>
          <Typography variant="h4" component="h1">
            ML Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Machine Learning Security Analytics Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <MLOverview status={mlStatus} />
        <MLAnalysisPanel />
        <MLOperationsPanel />
      </Box>
    </Box>
  );
};

export default MLManagementDashboard;
