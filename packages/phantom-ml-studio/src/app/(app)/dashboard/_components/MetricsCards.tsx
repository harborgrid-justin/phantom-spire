/**
 * Metrics Cards Component
 * Displays dashboard key metrics in card format
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { PerformanceMetric } from '@/features/dashboard/types/dashboard.types';

interface MetricsCardsProps {
  modelsInProduction: number;
  activeExperiments: number;
  performanceMetrics: PerformanceMetric[];
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  modelsInProduction,
  activeExperiments,
  performanceMetrics
}) => {
  return (
    <Box 
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr 1fr',
          md: '1fr 1fr 1fr 1fr 1fr'
        },
        gap: 3,
        mb: 3
      }} 
      data-cy="dashboard-metrics-grid"
    >
      {/* Models in Production */}
      <Card elevation={2} data-cy="metric-card-models-production">
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom data-cy="metric-label">
            Models in Production
          </Typography>
          <Typography variant="h3" color="primary.main" fontWeight="bold" data-cy="metric-value">
            {modelsInProduction}
          </Typography>
        </CardContent>
      </Card>

      {/* Active Experiments */}
      <Card elevation={2} data-cy="metric-card-active-experiments">
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom data-cy="metric-label">
            Active Experiments
          </Typography>
          <Typography variant="h3" color="secondary.main" fontWeight="bold" data-cy="metric-value">
            {activeExperiments}
          </Typography>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {performanceMetrics.map(metric => (
        <Card 
          key={metric.name} 
          elevation={2} 
          data-cy={`metric-card-${metric.name.toLowerCase().replace(/\s+/g, '-')}`}
        >
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
  );
};

export default MetricsCards;
