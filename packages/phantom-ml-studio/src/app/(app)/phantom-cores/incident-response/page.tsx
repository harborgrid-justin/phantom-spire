'use client';

// Phantom Incident Response Core Management - Incident Response & Crisis Management
// Provides comprehensive GUI for incident response and crisis management operations

import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Emergency as IncidentIcon
} from '@mui/icons-material';

// Import modular components
import IncidentResponseOverview from './components/IncidentResponseOverview';
import IncidentAnalysisPanel from './components/IncidentAnalysisPanel';
import IncidentResponseOperationsPanel from './components/IncidentResponseOperationsPanel';

// Import custom hook
import { useIncidentResponseStatus } from './hooks/useIncidentResponseStatus';

// Main Component: Incident Response Management Dashboard
const IncidentResponseManagementDashboard: React.FC = () => {
  const { data: incidentResponseStatus, isLoading, error } = useIncidentResponseStatus();

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Incident Response Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !incidentResponseStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load incident response system status. Please ensure the incident response core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <IncidentIcon sx={{ mr: 2, fontSize: 32, color: '#f44336' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Incident Response Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Emergency Response & Crisis Management Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <IncidentResponseOverview status={incidentResponseStatus} />
        <IncidentAnalysisPanel />
        <IncidentResponseOperationsPanel />
      </Box>
    </Box>
  );
};

export default IncidentResponseManagementDashboard;
