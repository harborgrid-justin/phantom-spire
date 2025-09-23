// Attribution Overview Component - System Status and Metrics

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { AttributionStatus } from '../types';

interface AttributionOverviewProps {
  status: AttributionStatus | undefined;
}

const AttributionOverview: React.FC<AttributionOverviewProps> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Attribution system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  // Add null check for metrics
  if (!metrics) {
    return (
      <Alert severity="info">Attribution metrics are currently being initialized...</Alert>
    );
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

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
            <Typography variant="h6" gutterBottom>Attribution Confidence</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={(metrics.attribution_confidence || 0) * 100}
                size={60}
                color={getConfidenceColor(metrics.attribution_confidence || 0)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getConfidenceColor(metrics.attribution_confidence || 0)}>
                  {((metrics.attribution_confidence || 0) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg Confidence
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active Campaigns</Typography>
            <Typography variant="h3" color="primary">
              {metrics.active_campaigns || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Under investigation
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Tracked Actors</Typography>
            <Typography variant="h3" color="secondary">
              {metrics.tracked_actors || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Known threat actors
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AttributionOverview;
