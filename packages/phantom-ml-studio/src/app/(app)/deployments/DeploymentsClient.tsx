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
  Grid2
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'error': return 'error';
      case 'deploying': return 'primary';
      case 'stopping': return 'warning';
      default: return 'secondary';
    }
  };

  const getEnvironmentColor = (environment: string) => {
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
        <Typography variant="body2" fontFamily="monospace" data-cy="deployment-id">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'modelId',
      headerName: 'Model ID',
      width: 200,
      valueGetter: (params: { row: { config: { modelId: string } } }) => params.row.config.modelId,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace" data-cy="model-id">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          variant="outlined"
          data-cy={`deployment-status-${params.value}`}
        />
      )
    },
    {
      field: 'environment',
      headerName: 'Environment',
      width: 130,
      valueGetter: (params: { row: { config: { environment: string } } }) => params.row.config.environment,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getEnvironmentColor(params.value)}
          size="small"
          data-cy={`deployment-environment-${params.value}`}
        />
      )
    },
    {
      field: 'instanceType',
      headerName: 'Instance Type',
      width: 150,
      valueGetter: (params: { row: { config: { instanceType: string } } }) => params.row.config.instanceType
    },
    {
      field: 'endpointUrl',
      headerName: 'Endpoint',
      width: 300,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} data-cy="endpoint-container">
          <Link
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ textDecoration: 'none', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}
            data-cy="endpoint-link"
          >
            {params.value}
          </Link>
          <IconButton size="small" href={params.value} target="_blank" data-cy="btn-open-endpoint">
            <LaunchIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      valueFormatter: (params: { value: string | number | Date }) => new Date(params.value).toLocaleString()
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }} data-cy="deployment-actions">
          {params.row.status === 'active' ? (
            <Tooltip title="Stop deployment">
              <IconButton size="small" color="error" disabled data-cy="btn-stop-deployment">
                <StopIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Start deployment">
              <IconButton size="small" color="primary" disabled data-cy="btn-start-deployment">
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }} data-cy="deployments-header">
          <Box data-cy="deployments-info">
            <Typography variant="h4" component="h1" gutterBottom data-cy="deployments-title">
              Deployments
            </Typography>
            <Typography variant="body1" color="text.secondary" data-cy="deployments-description">
              Manage and monitor your deployed ML models
            </Typography>
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }} data-cy="last-updated">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }} data-cy="deployments-actions">
            <Tooltip title="Refresh deployments">
              <IconButton onClick={handleRefresh} disabled={refreshing} data-cy="btn-refresh">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled
              data-cy="btn-new-deployment"
            >
              New Deployment (Coming Soon)
            </Button>
          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)} data-cy="alert-error">
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
        {deployments.length > 0 && (
          <Grid2 container spacing={3} sx={{ mb: 4 }} data-cy="deployment-stats-grid">
            <Grid2 size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card data-cy="deployment-stat-total">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" data-cy="stat-value">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" data-cy="stat-label">
                    Total Deployments
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card data-cy="deployment-stat-active">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" data-cy="stat-value">
                    {stats.active || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" data-cy="stat-label">
                    Active
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card data-cy="deployment-stat-inactive">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="text.secondary" data-cy="stat-value">
                    {stats.inactive || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" data-cy="stat-label">
                    Inactive
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card data-cy="deployment-stat-errors">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main" data-cy="stat-value">
                    {stats.error || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" data-cy="stat-label">
                    Errors
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card data-cy="deployment-stat-deploying">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main" data-cy="stat-value">
                    {stats.deploying || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" data-cy="stat-label">
                    Deploying
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
          </Grid2>
        )}

        {/* Deployments Table */}
        {deployments.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }} data-cy="deployments-empty">
            <Typography variant="h6" color="text.secondary" gutterBottom data-cy="empty-title">
              No deployments found
            </Typography>
            <Typography variant="body2" color="text.secondary" data-cy="empty-description">
              Deploy your first model to start serving predictions
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ height: 600, width: '100%' }} data-cy="deployments-table-container">
            <DataGrid
              rows={deployments.map(d => ({ ...d, id: d.deploymentId }))}
              columns={columns}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } }
              }}
              density="compact"
              disableRowSelectionOnClick
              data-cy="table-deployments"
            />
          </Paper>
        )}
      </Container>
  );
}