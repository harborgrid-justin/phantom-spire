'use client';

// Phantom Crypto Core Management - Cryptographic Analysis & Cipher Detection
// Provides comprehensive GUI for cryptographic analysis and cipher detection capabilities

import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  VpnKey as CryptoIcon
} from '@mui/icons-material';

// Import modular components
import CryptoOverview from './components/CryptoOverview';
import CryptographicAnalysisPanel from './components/CryptographicAnalysisPanel';
import CryptoOperationsPanel from './components/CryptoOperationsPanel';

// Import custom hook
import { useCryptoStatus } from './hooks/useCryptoStatus';

// Main Component: Crypto Management Dashboard
const CryptoManagementDashboard: React.FC = () => {
  const { data: cryptoStatus, isLoading, error } = useCryptoStatus();

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Crypto Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !cryptoStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load crypto system status. Please ensure the crypto core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <CryptoIcon sx={{ mr: 2, fontSize: 32, color: '#ff9800' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Crypto Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Cryptographic Analysis & Cipher Detection Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <CryptoOverview status={cryptoStatus} />
        <CryptographicAnalysisPanel />
        <CryptoOperationsPanel />
      </Box>
    </Box>
  );
};

export default CryptoManagementDashboard;
