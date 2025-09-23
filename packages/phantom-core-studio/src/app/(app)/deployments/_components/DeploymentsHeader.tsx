/**
 * Deployments Header Component
 * Contains header information, title, and action buttons
 */

import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface DeploymentsHeaderProps {
  lastUpdated: Date | null;
  refreshing: boolean;
  onRefresh: () => void;
}

export const DeploymentsHeader: React.FC<DeploymentsHeaderProps> = ({
  lastUpdated,
  refreshing,
  onRefresh
}) => {
  return (
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
          <IconButton onClick={onRefresh} disabled={refreshing} data-cy="btn-refresh">
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
  );
};

export default DeploymentsHeader;
