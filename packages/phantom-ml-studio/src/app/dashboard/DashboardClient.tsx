'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
    // In production, send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => window.location.reload()}>
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await dashboardService.getDashboardData(
        { id: 'dash_req', type: 'getDashboardData' as const },
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Show loading overlay for refresh */}
        {isLoading && dashboardData && (
          <Alert severity="info" sx={{ mb: 2 }}>
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
        }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Models in Production
              </Typography>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                {dashboardData.modelsInProduction}
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Active Experiments
              </Typography>
              <Typography variant="h3" color="secondary.main" fontWeight="bold">
                {dashboardData.activeExperiments}
              </Typography>
            </CardContent>
          </Card>

          {dashboardData.performanceMetrics.map(metric => (
            <Card key={metric.name} elevation={2}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {metric.name}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {metric.value}{metric.name === 'Model Accuracy' ? '%' : 'ms'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {metric.change > 0 ? (
                    <TrendingUpIcon color="success" fontSize="small" />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="small" />
                  )}
                  <Typography
                    color={metric.change > 0 ? 'success.main' : 'error.main'}
                    variant="body2"
                    sx={{ ml: 0.5 }}
                  >
                    {Math.abs(metric.change)}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Charts Section */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Resource Utilization */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resource Utilization
            </Typography>
            <Box sx={{ height: 300 }}>
              <BarChart
                dataset={dashboardData.resourceUtilization}
                xAxis={[{ scaleType: 'band', dataKey: 'name' }]}
                series={[{
                  dataKey: 'usage',
                  label: 'Usage (%)',
                  color: '#667eea'
                }]}
                margin={{ left: 40, right: 40, top: 40, bottom: 40 }}
              />
            </Box>
          </Paper>

          {/* Recent Activity */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              <List>
                {dashboardData.recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight="medium">
                            {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(activity.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < dashboardData.recentActivity.length - 1 && <Divider />}
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