'use client';

// Phantom Attribution Core Management - Attribution Analysis & Threat Actor Profiling
// Provides comprehensive GUI for threat attribution and actor profiling capabilities

import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Psychology as AttributionIcon
} from '@mui/icons-material';

// Import modular components
import AttributionOverview from './components/AttributionOverview';
import AttributionAnalysisPanel from './components/AttributionAnalysisPanel';
import AttributionOperationsPanel from './components/AttributionOperationsPanel';

// Import custom hook
import { useAttributionStatus } from './hooks/useAttributionStatus';

// Main Component: Attribution Management Dashboard
const AttributionManagementDashboard: React.FC = () => {
  const { data: attributionStatus, isLoading, error } = useAttributionStatus();

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Attribution Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !attributionStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load attribution system status. Please ensure the attribution core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <AttributionIcon sx={{ mr: 2, fontSize: 32, color: '#9c27b0' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Attribution Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Threat Attribution Analysis & Actor Profiling Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <AttributionOverview status={attributionStatus} />
        <AttributionAnalysisPanel />
        <AttributionOperationsPanel />
      </Box>
    </Box>
  );
};

export default AttributionManagementDashboard;
