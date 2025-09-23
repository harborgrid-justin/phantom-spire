// IOC Overview Component - System Status and Metrics

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
import { IOCStatus } from '../types';

interface IOCOverviewProps {
  status: IOCStatus | undefined;
}

const IOCOverview: React.FC<IOCOverviewProps> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">IOC system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  // Add null check for metrics
  if (!metrics) {
    return (
      <Alert severity="info">IOC metrics are currently being initialized...</Alert>
    );
  }

  const getDetectionColor = (rate: number) => {
    if (rate >= 0.9) return 'success';
    if (rate >= 0.7) return 'warning';
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
            <Typography variant="h6" gutterBottom>Total IOCs</Typography>
            <Typography variant="h3" color="primary">
              {(metrics.total_iocs || 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Tracked indicators
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active IOCs</Typography>
            <Typography variant="h3" color="error">
              {metrics.active_iocs || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Currently threatening
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Detection Rate</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={(metrics.detection_rate || 0) * 100}
                size={60}
                color={getDetectionColor(metrics.detection_rate || 0)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getDetectionColor(metrics.detection_rate || 0)}>
                  {((metrics.detection_rate || 0) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Detection Rate
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default IOCOverview;
