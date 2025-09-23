'use client';

// Phantom MITRE Core Management - MITRE ATT&CK Framework Integration
// Provides comprehensive GUI for MITRE ATT&CK framework integration and TTP analysis

import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  AccountTree as MitreIcon
} from '@mui/icons-material';

// Import modular components
import MitreOverview from './components/MitreOverview';
import MitreAnalysisPanel from './components/MitreAnalysisPanel';
import MitreOperationsPanel from './components/MitreOperationsPanel';

// Import custom hook
import { useMitreStatus } from './hooks/useMitreStatus';

// Main Component: MITRE Management Dashboard
const MitreManagementDashboard: React.FC = () => {
  const { data: mitreStatus, isLoading, error } = useMitreStatus();

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading MITRE Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !mitreStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load MITRE system status. Please ensure the MITRE core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <MitreIcon sx={{ mr: 2, fontSize: 32, color: '#607d8b' }} />
        <Box>
          <Typography variant="h4" component="h1">
            MITRE Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            MITRE ATT&CK Framework Integration & TTP Analysis Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <MitreOverview status={mitreStatus} />
        <MitreAnalysisPanel />
        <MitreOperationsPanel />
      </Box>
    </Box>
  );
};

export default MitreManagementDashboard;
