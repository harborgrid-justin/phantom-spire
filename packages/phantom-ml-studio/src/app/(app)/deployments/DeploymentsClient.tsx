/**
 * Deployments Client Component
 * 
 * Main deployments interface providing:
 * - Deployment monitoring and management
 * - Real-time status updates with auto-refresh
 * - Deployment statistics and metrics
 * - Action buttons for deployment operations
 *
 * REFACTORED: Now uses modular components and custom hooks for better maintainability:
 * - useDeploymentsState: Manages all deployments state and data fetching
 * - DeploymentsHeader: Header with title, description, and action buttons
 * - DeploymentStats: Statistics cards showing deployment metrics
 * - DeploymentsTable: DataGrid table with deployment details and actions
 */

'use client';

import React from 'react';
import {
  Container,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';

// Custom hooks
import { useDeploymentsState } from './_hooks/useDeploymentsState';

// Components
import {
  DeploymentsHeader,
  DeploymentStats,
  DeploymentsTable
} from './_components';

export default function DeploymentsClient() {
  // Use the custom hook for state management
  const {
    deployments,
    isLoading,
    refreshing,
    error,
    lastUpdated,
    stats,
    handleRefresh,
    handleErrorDismiss
  } = useDeploymentsState();

  // Loading state
  if (isLoading && !deployments.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <DeploymentsHeader
        lastUpdated={lastUpdated}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={handleErrorDismiss} data-cy="alert-error">
          {error}
        </Alert>
      )}

      {/* Refresh Indicator */}
      {refreshing && (
        <Alert severity="info" sx={{ mb: 3 }} data-cy="alert-refreshing">
          Refreshing deployments...
        </Alert>
      )}

      {/* Statistics Cards */}
      <DeploymentStats stats={stats} />

      {/* Deployments Table */}
      <DeploymentsTable deployments={deployments} />
    </Container>
  );
}
