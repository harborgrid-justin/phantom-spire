/**
 * Deployment Statistics Component
 * Displays deployment statistics in card format
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box
} from '@mui/material';

interface DeploymentStatsProps {
  stats: Record<string, number>;
}

export const DeploymentStats: React.FC<DeploymentStatsProps> = ({ stats }) => {
  if (stats['total'] === 0) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }} 
      data-cy="deployment-stats-grid"
    >
      <Card data-cy="deployment-stat-total">
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="primary.main" data-cy="stat-value">
            {stats['total']}
          </Typography>
          <Typography variant="body2" color="text.secondary" data-cy="stat-label">
            Total Deployments
          </Typography>
        </CardContent>
      </Card>
      
      <Card data-cy="deployment-stat-active">
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="success.main" data-cy="stat-value">
            {stats['active'] || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary" data-cy="stat-label">
            Active
          </Typography>
        </CardContent>
      </Card>
      
      <Card data-cy="deployment-stat-inactive">
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="text.secondary" data-cy="stat-value">
            {stats['inactive'] || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary" data-cy="stat-label">
            Inactive
          </Typography>
        </CardContent>
      </Card>
      
      <Card data-cy="deployment-stat-errors">
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="error.main" data-cy="stat-value">
            {stats['error'] || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary" data-cy="stat-label">
            Errors
          </Typography>
        </CardContent>
      </Card>
      
      <Card data-cy="deployment-stat-deploying">
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="primary.main" data-cy="stat-value">
            {stats['deploying'] || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary" data-cy="stat-label">
            Deploying
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DeploymentStats;
