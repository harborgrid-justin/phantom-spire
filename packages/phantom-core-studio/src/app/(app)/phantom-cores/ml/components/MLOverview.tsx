'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useMLUtils } from '../hooks';
import type { MLStatus } from '../types';

interface MLOverviewProps {
  status: MLStatus | undefined;
}

export const MLOverview: React.FC<MLOverviewProps> = ({ status }) => {
  const { getAccuracyColor } = useMLUtils();

  if (!status?.data) {
    return (
      <Alert severity="warning">ML system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  // Add null check for metrics
  if (!metrics) {
    return (
      <Alert severity="info">ML metrics are currently being initialized...</Alert>
    );
  }

  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>System Status</Typography>
            <Chip
              icon={status.data.status === 'operational' ? <CheckCircleIcon /> : <WarningIcon />}
              label={status.data.status}
              color={status.data.status === 'operational' ? 'success' : 'warning'}
            />
            <Typography variant="body2" color="textSecondary" mt={1}>
              Uptime: {metrics.uptime}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active Models</Typography>
            <Typography variant="h3" color="primary">
              {metrics.active_models}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              ML models deployed
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Model Accuracy</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.model_accuracy * 100}
                size={60}
                color={getAccuracyColor(metrics.model_accuracy)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getAccuracyColor(metrics.model_accuracy)}>
                  {(metrics.model_accuracy * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg Accuracy
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Predictions/sec</Typography>
            <Typography variant="h3" color="secondary">
              {metrics.predictions_per_second.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Real-time processing
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
