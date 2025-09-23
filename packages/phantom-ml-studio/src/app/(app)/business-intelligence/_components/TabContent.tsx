/**
 * Tab Content Components
 * Components for different dashboard tabs
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Alert,
  LinearProgress
} from '@mui/material';

// Resource Optimization Tab Component
export const ResourceOptimizationTab: React.FC = () => {
  const recommendations = [
    'Optimize compute allocation for 15% cost reduction',
    'Implement automated scaling for peak efficiency',
    'Consolidate storage systems for better utilization',
    'Upgrade hardware for improved performance/cost ratio'
  ];

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resource Optimization Recommendations
        </Typography>
        <Grid container spacing={2}>
          {recommendations.map((recommendation, index) => (
            <Grid size={{ xs: 12, sm: 6 }} key={index}>
              <Alert severity="info" sx={{ mb: 2 }}>
                {recommendation}
              </Alert>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

// Forecasting Tab Component
export const ForecastingTab: React.FC = () => {
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Performance Forecasting
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Predictive analytics indicate continued ROI growth with optimized resource allocation.
        </Typography>
        <LinearProgress variant="determinate" value={85} sx={{ mb: 2 }} />
        <Typography variant="caption" color="text.secondary">
          Forecast Accuracy: 85%
        </Typography>
      </Paper>
    </Box>
  );
};

export default {
  ResourceOptimizationTab,
  ForecastingTab
};
