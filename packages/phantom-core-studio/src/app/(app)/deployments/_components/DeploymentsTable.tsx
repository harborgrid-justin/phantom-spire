/**
 * Deployments Table Component
 * Contains the DataGrid for displaying deployment information
 */

import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Link,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Launch as LaunchIcon,
  Stop as StopIcon,
  PlayArrow as StartIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Deployment } from '@/features/deployments/lib';

interface DeploymentsTableProps {
  deployments: Deployment[];
}

export const DeploymentsTable: React.FC<DeploymentsTableProps> = ({ deployments }) => {
  // Utility functions
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

  // Column definitions
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
          <IconButton size="small" href={params.value} target="_blank" rel="noopener noreferrer" data-cy="btn-open-endpoint">
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

  // Empty state
  if (deployments.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }} data-cy="deployments-empty">
        <Typography variant="h6" color="text.secondary" gutterBottom data-cy="empty-title">
          No deployments found
        </Typography>
        <Typography variant="body2" color="text.secondary" data-cy="empty-description">
          Deploy your first model to start serving predictions
        </Typography>
      </Paper>
    );
  }

  // Table with data
  return (
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
  );
};

export default DeploymentsTable;
