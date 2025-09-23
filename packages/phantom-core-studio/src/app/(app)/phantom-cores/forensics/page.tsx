'use client';

// Phantom Forensics Core Management - Digital Forensics & Evidence Analysis
// Provides comprehensive GUI for digital forensics and evidence analysis capabilities

import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Biotech as ForensicsIcon
} from '@mui/icons-material';

// Import modular components
import ForensicsOverview from './components/ForensicsOverview';
import ForensicsAnalysisPanel from './components/ForensicsAnalysisPanel';
import ForensicsOperationsPanel from './components/ForensicsOperationsPanel';

// Import custom hook
import { useForensicsStatus } from './hooks/useForensicsStatus';

// Main Component: Forensics Management Dashboard
const ForensicsManagementDashboard: React.FC = () => {
  const { data: forensicsStatus, isLoading, error } = useForensicsStatus();

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Forensics Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !forensicsStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load forensics system status. Please ensure the forensics core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <ForensicsIcon sx={{ mr: 2, fontSize: 32, color: '#795548' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Forensics Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Digital Forensics & Evidence Analysis Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <ForensicsOverview status={forensicsStatus} />
        <ForensicsAnalysisPanel />
        <ForensicsOperationsPanel />
      </Box>
    </Box>
  );
};

export default ForensicsManagementDashboard;
