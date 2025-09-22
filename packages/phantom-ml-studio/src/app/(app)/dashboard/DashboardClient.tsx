'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';

import { dashboardService } from '@/services/dashboard';
import { DashboardData } from '@/services/dashboard';

// Error boundary component
class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
    // In production, send to error reporting service
  }

  override render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => router.refresh()}>
                Refresh Page
              </Button>
            }
          >
            Something went wrong loading the dashboard. Please try refreshing the page.
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default function DashboardClient() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await dashboardService.getDashboardData(
        { 
          id: 'dash_req', 
          type: 'getDashboardData' as const,
          data: null,
          metadata: { category: 'dashboard', module: 'dashboard-page', version: '1.0.0' },
          context: { environment: 'development' },
          timestamp: new Date()
        },
        {}
      );

      if (response.success && response.data) {
        setDashboardData(response.data);
        setLastUpdated(new Date());
      } else {
        setError(response.error?.message || 'Failed to fetch dashboard data.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Dashboard fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  if (isLoading && !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }} data-cy="dashboard-header">
          <Typography variant="h4" component="h1" data-cy="dashboard-title">
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} data-cy="dashboard-actions">
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
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr 1fr 1fr'
          },
          gap: 3,
          mb: 3
        }} data-cy="dashboard-metrics-grid">
          <Card elevation={2} data-cy="metric-card-models-production">
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom data-cy="metric-label">
                Models in Production
              </Typography>
              <Typography variant="h3" color="primary.main" fontWeight="bold" data-cy="metric-value">
                {dashboardData.modelsInProduction}
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={2} data-cy="metric-card-active-experiments">
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom data-cy="metric-label">
                Active Experiments
              </Typography>
              <Typography variant="h3" color="secondary.main" fontWeight="bold" data-cy="metric-value">
                {dashboardData.activeExperiments}
              </Typography>
            </CardContent>
          </Card>

          {dashboardData.performanceMetrics.map(metric => (
            <Card key={metric.name} elevation={2} data-cy={`metric-card-${metric.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom data-cy="metric-label">
                  {metric.name}
                </Typography>
                <Typography variant="h4" fontWeight="bold" data-cy="metric-value">
                  {metric.value}{metric.name === 'Model Accuracy' ? '%' : 'ms'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }} data-cy="metric-change">
                  {metric.change > 0 ? (
                    <TrendingUpIcon color="success" fontSize="small" data-cy="trend-up-icon" />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="small" data-cy="trend-down-icon" />
                  )}
                  <Typography
                    color={metric.change > 0 ? 'success.main' : 'error.main'}
                    variant="body2"
                    sx={{ ml: 0.5 }}
                    data-cy="metric-change-value"
                  >
                    {Math.abs(metric.change)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Charts Section */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }} data-cy="dashboard-charts-grid">
          {/* Resource Utilization */}
          <Paper elevation={2} sx={{ p: 3 }} data-cy="card-resource-utilization">
            <Typography variant="h6" gutterBottom data-cy="chart-title">
              Resource Utilization
            </Typography>
            <Box sx={{ height: 300 }} data-cy="chart-container">
              <BarChart
                dataset={dashboardData.resourceUtilization}
                xAxis={[{ scaleType: 'band', dataKey: 'name' }]}
                series={[{
                  dataKey: 'usage',
                  label: 'Usage (%)',
                  color: '#667eea'
                }]}
                margin={{ left: 40, right: 40, top: 40, bottom: 40 }}
                data-cy="chart-resource-utilization"
              />
            </Box>
          </Paper>

          {/* Recent Activity */}
          <Paper elevation={2} sx={{ p: 3 }} data-cy="card-recent-activity">
            <Typography variant="h6" gutterBottom data-cy="activity-title">
              Recent Activity
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }} data-cy="activity-container">
              <List data-cy="list-recent-activity">
                {dashboardData.recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem data-cy={`activity-item-${index}`}>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight="medium" data-cy="activity-type">
                            {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" data-cy="activity-description">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" data-cy="activity-timestamp">
                              {new Date(activity.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < dashboardData.recentActivity.length - 1 && <Divider data-cy={`activity-divider-${index}`} />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          </Paper>
        </Box>
      </Container>
    </DashboardErrorBoundary>
  );
}
