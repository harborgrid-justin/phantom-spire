/**
 * Bias Metrics Component
 * Displays detailed bias metrics analysis with visualizations
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';
import { BiasMetricsProps, METRIC_STATUS_COLORS } from '../types';

export function BiasMetrics({ metrics }: BiasMetricsProps) {
  const getMetricStatusColor = (status: string) => {
    return (METRIC_STATUS_COLORS as Record<string, string>)[status] || 'default';
  };

  const getMetricStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle fontSize="small" />;
      case 'warning':
        return <Warning fontSize="small" />;
      case 'fail':
        return <Error fontSize="small" />;
      default:
        return <CheckCircle fontSize="small" />;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'success';
      case 'warning':
        return 'warning';
      case 'fail':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Detailed Bias Metrics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Comprehensive analysis of model fairness across different metrics
        </Typography>

        <Grid container spacing={3}>
          {metrics.map((metric) => (
            <Grid size={{ xs: 12, md: 6 }} key={metric.metric}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  {/* Metric Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="h3">
                      {metric.metric}
                    </Typography>
                    <Chip
                      icon={getMetricStatusIcon(metric.status)}
                      label={metric.status.toUpperCase()}
                      size="small"
                      color={getMetricStatusColor(metric.status) as 'success' | 'warning' | 'error'}
                    />
                  </Box>

                  {/* Score Display */}
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h4" color={getMetricStatusColor(metric.status)}>
                        {metric.value.toFixed(3)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Threshold: {metric.threshold.toFixed(2)}
                      </Typography>
                    </Box>
                    
                    {/* Progress Bar */}
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(metric.value * 100, 100)}
                      color={getProgressColor(metric.status) as 'success' | 'warning' | 'error'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    
                    <Box display="flex" justifyContent="space-between" mt={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        0.0
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Current: {(metric.value * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        1.0
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary">
                    {metric.description}
                  </Typography>

                  {/* Status Interpretation */}
                  <Box mt={2} p={1.5} sx={{ 
                    backgroundColor: metric.status === 'fail' ? 'error.light' : 
                                   metric.status === 'warning' ? 'warning.light' : 
                                   'success.light',
                    borderRadius: 1,
                    opacity: 0.1
                  }}>
                    <Typography variant="caption" fontWeight="medium">
                      {metric.status === 'pass' && 'Metric passes fairness threshold'}
                      {metric.status === 'warning' && 'Metric shows moderate bias concern'}
                      {metric.status === 'fail' && 'Metric fails fairness requirements'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {metrics.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              No bias metrics available
            </Typography>
          </Box>
        )}

        {/* Summary */}
        {metrics.length > 0 && (
          <Box mt={3} p={2} sx={{ backgroundColor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Metrics Summary
            </Typography>
            <Box display="flex" gap={2}>
              <Chip 
                icon={<CheckCircle fontSize="small" />}
                label={`${metrics.filter(m => m.status === 'pass').length} Passing`}
                size="small"
                color="success"
                variant="outlined"
              />
              <Chip 
                icon={<Warning fontSize="small" />}
                label={`${metrics.filter(m => m.status === 'warning').length} Warning`}
                size="small"
                color="warning"
                variant="outlined"
              />
              <Chip 
                icon={<Error fontSize="small" />}
                label={`${metrics.filter(m => m.status === 'fail').length} Failing`}
                size="small"
                color="error"
                variant="outlined"
              />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}