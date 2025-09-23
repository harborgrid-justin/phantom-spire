/**
 * Business Intelligence Client Component
 * 
 * Comprehensive enterprise business intelligence dashboard featuring:
 * - Real-time financial metrics and ROI analysis
 * - Resource optimization with cost-benefit calculations
 * - Performance forecasting and trend analysis
 * - Executive dashboards with enterprise KPIs
 * - Compliance reporting and audit trails
 *
 * REFACTORED: Now uses modular components and custom hooks for better maintainability:
 * - useBusinessIntelligenceState: Manages all BI data and state
 * - KPICards: Displays key performance indicators
 * - Chart components: Modular chart components for different visualizations
 * - Tab components: Separate components for each dashboard tab
 */

'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

// Custom hooks
import { useBusinessIntelligenceState } from './_hooks/useBusinessIntelligenceState';

// Components
import {
  KPICards,
  FinancialAnalysisTab,
  PerformanceMetricsTab,
  ResourceOptimizationTab,
  ForecastingTab
} from './_components';

export default function BusinessIntelligenceClient() {
  // Use the custom hook for state management
  const {
    loading,
    activeTab,
    roiData,
    performanceData,
    refreshing,
    handleRefresh,
    handleTabChange
  } = useBusinessIntelligenceState();

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Business Intelligence Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Enterprise analytics with ROI calculations, cost-benefit analysis, and performance forecasting
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>

      {/* Enterprise Alert */}
      <Alert severity="success" sx={{ mb: 4 }}>
        <AlertTitle>H2O.ai Competitive Advantage</AlertTitle>
        Enterprise-grade business intelligence with comprehensive financial analytics and ROI optimization.
      </Alert>

      {/* KPI Cards */}
      <KPICards />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => handleTabChange(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Financial Analysis" />
        <Tab label="Performance Metrics" />
        <Tab label="Resource Optimization" />
        <Tab label="Forecasting" />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && <FinancialAnalysisTab roiData={roiData} />}
      {activeTab === 1 && <PerformanceMetricsTab performanceData={performanceData} />}
      {activeTab === 2 && <ResourceOptimizationTab />}
      {activeTab === 3 && <ForecastingTab />}
    </Container>
  );
}
