/**
 * Dashboard Client Component
 * 
 * Main dashboard displaying:
 * - Key performance metrics and system status
 * - Resource utilization charts
 * - Recent activity feed
 * - Real-time data with auto-refresh
 *
 * REFACTORED: Now uses modular components and custom hooks for better maintainability:
 * - useDashboardState: Manages dashboard data fetching and state
 * - DashboardErrorBoundary: Handles errors gracefully
 * - MetricsCards: Displays key metrics in card format
 * - DashboardCharts: Contains charts and activity components
 */

'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

// Custom hooks
import { useDashboardState } from './_hooks/useDashboardState';

// Components
import {
  DashboardErrorBoundary,
  MetricsCards,
  DashboardCharts
} from './_components';

export default function DashboardClient() {
  // Use the custom hook for state management
  const {
    dashboardData,
    isLoading,
    error,
    lastUpdated,
    handleRefresh
  } = useDashboardState();

  // Loading state
  if (isLoading && !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Error state (when no data is available)
  if (error && !dashboardData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          No dashboard data available. Please check your configuration.
        </Alert>
      </Container>
    );
  }

  return (
    <DashboardErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header with refresh */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }} 
          data-cy="dashboard-header"
        >
          <Typography variant="h4" component="h1" data-cy="dashboard-title">
            Dashboard
          </Typography>
          <Box 
            sx={{ display: 'flex', alignItems: 'center', gap: 2 }} 
            data-cy="dashboard-actions"
          >
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary" data-cy="last-updated">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} disabled={isLoading} data-cy="btn-refresh">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Show loading overlay for refresh */}
        {isLoading && dashboardData && (
          <Alert severity="info" sx={{ mb: 2 }} data-cy="alert-refreshing">
            Refreshing dashboard data...
          </Alert>
        )}

        {/* Key Metrics */}
        <MetricsCards
          modelsInProduction={dashboardData.modelsInProduction}
          activeExperiments={dashboardData.activeExperiments}
          performanceMetrics={dashboardData.performanceMetrics}
        />

        {/* Charts Section */}
        <DashboardCharts
          resourceUtilization={dashboardData.resourceUtilization}
          recentActivity={dashboardData.recentActivity}
        />
      </Container>
    </DashboardErrorBoundary>
  );
}
