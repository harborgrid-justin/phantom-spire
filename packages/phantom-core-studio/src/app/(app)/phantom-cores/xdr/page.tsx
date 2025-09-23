'use client';

// Phantom XDR Core Management - Extended Detection and Response Interface
// Provides comprehensive GUI for enterprise XDR capabilities

import React from 'react';
import {
  Box,
  Typography,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Security as SecurityIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

// Import types, API functions, and components
import { XDRSystemStatus } from './_lib/types';
import { fetchXDRStatus } from './api';
import { 
  XDRSystemOverview, 
  ThreatDetectionPanel, 
  XDROperationsPanel 
} from './components';

// Main Component: XDR Management Dashboard
const XDRManagementDashboard: React.FC = () => {
  const { data: xdrStatus, isLoading, error } = useQuery({
    queryKey: ['xdr-status'],
    queryFn: fetchXDRStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading XDR Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !xdrStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load XDR system status. Please ensure the XDR core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <SecurityIcon sx={{ mr: 2, fontSize: 32, color: '#f44336' }} />
        <Box>
          <Typography variant="h4" component="h1">
            XDR Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Extended Detection and Response - Enterprise Security Operations
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <XDRSystemOverview status={xdrStatus} />
        <ThreatDetectionPanel />
        <XDROperationsPanel />
      </Box>
    </Box>
  );
};

export default XDRManagementDashboard;
