'use client';

// Phantom Threat Actor Core Management - Threat Actor Profiling Dashboard
// Provides comprehensive GUI for threat actor tracking and intelligence

import React from 'react';
import {
  Box,
  Typography,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Person as ThreatActorIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

// Import types, API functions, and components
import { ThreatActorStatus } from './types';
import { fetchThreatActorStatus } from './api';
import { 
  ThreatActorOverview, 
  ThreatActorProfilingPanel, 
  ThreatActorOperationsPanel 
} from './components';

// Main Component: Threat Actor Management Dashboard
const ThreatActorManagementDashboard: React.FC = () => {
  const { data: threatActorStatus, isLoading, error } = useQuery({
    queryKey: ['threat-actor-status'],
    queryFn: fetchThreatActorStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Threat Actor Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !threatActorStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load threat actor system status. Please ensure the threat actor core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <ThreatActorIcon sx={{ mr: 2, fontSize: 32, color: '#9c27b0' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Threat Actor Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Enterprise Threat Actor Tracking & Attribution Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <ThreatActorOverview status={threatActorStatus} />
        <ThreatActorProfilingPanel />
        <ThreatActorOperationsPanel />
      </Box>
    </Box>
  );
};

export default ThreatActorManagementDashboard;
