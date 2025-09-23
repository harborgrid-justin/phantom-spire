'use client';

// Phantom IOC Core Management - Indicators of Compromise Management
// Provides comprehensive GUI for IOC management and threat indicator analysis

import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Flag as IOCIcon
} from '@mui/icons-material';

// Import modular components
import IOCOverview from './components/IOCOverview';
import IOCAnalysisPanel from './components/IOCAnalysisPanel';
import IOCOperationsPanel from './components/IOCOperationsPanel';

// Import custom hook
import { useIOCStatus } from './hooks/useIOCStatus';

// Main Component: IOC Management Dashboard
const IOCManagementDashboard: React.FC = () => {
  const { data: iocStatus, isLoading, error } = useIOCStatus();

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading IOC Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !iocStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load IOC system status. Please ensure the IOC core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <IOCIcon sx={{ mr: 2, fontSize: 32, color: '#e91e63' }} />
        <Box>
          <Typography variant="h4" component="h1">
            IOC Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Indicators of Compromise Management & Analysis Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <IOCOverview status={iocStatus} />
        <IOCAnalysisPanel />
        <IOCOperationsPanel />
      </Box>
    </Box>
  );
};

export default IOCManagementDashboard;
