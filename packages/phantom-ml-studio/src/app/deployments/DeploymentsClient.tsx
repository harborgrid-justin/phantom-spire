'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Link,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Launch as LaunchIcon,
  Stop as StopIcon,
  PlayArrow as StartIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { deploymentsService } from '@/services/deployments';
import { Deployment } from '@/services/deployments';

// Error boundary component
class DeploymentsErrorBoundary extends React.Component<
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
    console.error('Deployments Error:', error, errorInfo);
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
            Something went wrong with deployments. Please try refreshing the page.
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default function DeploymentsClient() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDeployments = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await deploymentsService.getDeployments(
        { id: 'get_deps_req', type: 'getDeployments' as const },
        {}
      );

      if (response.success && response.data) {
        setDeployments(response.data.deployments);
        setLastUpdated(new Date());
      } else {
        setError(response.error?.message || 'Failed to fetch deployments.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Deployments fetch error:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDeployments();

    // Auto-refresh every 30 seconds for deployment status
    const interval = setInterval(() => fetchDeployments(true), 30000);
    return () => clearInterval(interval);
  }, [fetchDeployments]);

  const handleRefresh = useCallback(() => {
    fetchDeployments(true);
  }, [fetchDeployments]);

  const getStatusColor = (_status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'error': return 'error';
      case 'deploying': return 'primary';
      case 'stopping': return 'warning';
      default: return 'secondary';
    }
  };

  const getEnvironmentColor = (_environment: string) => {
    switch (environment) {
      case 'production': return 'error';
      case 'staging': return 'warning';
      case 'development': return 'info';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'deploymentId',
      headerName: 'Deployment ID',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'modelId',
      headerName: 'Model ID',
      width: 200,
      valueGetter: (_params: any) => params.row.config.modelId,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (_params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'environment',
      headerName: 'Environment',
      width: 130,
      valueGetter: (_params: any) => params.row.config.environment,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getEnvironmentColor(params.value)}
          size="small"
        />
      )
    },
    {
      field: 'instanceType',
      headerName: 'Instance Type',
      width: 150,
      valueGetter: (_params: any) => params.row.config.instanceType
    },
    {
      field: 'endpointUrl',
      headerName: 'Endpoint',
      width: 300,
      renderCell: (_params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Link
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ textDecoration: 'none', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {params.value}
          </Link>
          <IconButton size="small" href={params.value} target="_blank">
            <LaunchIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      valueFormatter: (_params: { value: any }) => new Date(params.value).toLocaleString()
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.row.status === 'active' ? (
            <Tooltip title="Stop deployment">
              <IconButton size="small" color="error" disabled>
                <StopIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Start deployment">
              <IconButton size="small" color="primary" disabled>
                <StartIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ];

  // Calculate deployment statistics
  const stats = deployments.reduce(
    (acc, deployment) => {
      acc.total++;
      acc[deployment.status] = (acc[deployment.status] || 0) + 1;
      return acc;
    },
    { total: 0, active: 0, inactive: 0, error: 0, deploying: 0 } as Record<string, number>
  );

  if (isLoading && !deployments.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <DeploymentsErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Deployments
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and monitor your deployed ML models
            </Typography>
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh deployments">
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled
            >
              New Deployment (Coming Soon)
            </Button>
          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Refresh Indicator */}
        {refreshing && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Refreshing deployments...
          </Alert>
        )}

        {/* Statistics Cards */}
        {deployments.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Deployments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {stats.active || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="text.secondary">
                    {stats.inactive || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Inactive
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {stats.error || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Errors
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    {stats.deploying || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Deploying
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Deployments Table */}
        {deployments.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No deployments found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Deploy your first model to start serving predictions
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={deployments.map(d => ({ ...d, id: d.deploymentId }))}
              columns={columns}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } }
              }}
              density="compact"
              disableRowSelectionOnClick
            />
          </Paper>
        )}
      </Container>
    </DeploymentsErrorBoundary>
  );
}