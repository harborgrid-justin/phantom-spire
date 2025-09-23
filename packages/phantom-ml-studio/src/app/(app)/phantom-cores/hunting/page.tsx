'use client';

// Phantom Hunting Core Management - Threat Hunting & Proactive Security
// Provides comprehensive GUI for threat hunting and proactive security operations

import React from 'react';
import { Box, Typography, Alert, LinearProgress } from '@mui/material';
import { Search as HuntingIcon } from '@mui/icons-material';
import { useHuntingStatus } from './hooks/useHuntingStatus';
import { HuntingOverview } from './components/HuntingOverview';
import { HuntingAnalysisPanel } from './components/HuntingAnalysisPanel';
import { HuntingOperationsPanel } from './components/HuntingOperationsPanel';

// Main Component: Hunting Management Dashboard
const HuntingManagementDashboard: React.FC = () => {
  const { data: huntingStatus, isLoading, error } = useHuntingStatus();

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Hunting Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !huntingStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load hunting system status. Please ensure the hunting core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <HuntingIcon sx={{ mr: 2, fontSize: 32, color: '#3f51b5' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Hunting Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Threat Hunting & Proactive Security Operations Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <HuntingOverview status={huntingStatus} />
        <HuntingAnalysisPanel />
        <HuntingOperationsPanel />
      </Box>
    </Box>
  );
};

export default HuntingManagementDashboard;
