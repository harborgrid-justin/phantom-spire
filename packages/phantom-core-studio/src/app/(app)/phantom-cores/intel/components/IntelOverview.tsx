// Intel Overview Component

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
import { IntelStatus } from '../types';

interface IntelOverviewProps {
  status: IntelStatus | undefined;
}

const IntelOverview: React.FC<IntelOverviewProps> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Intel system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  const getQualityColor = (quality: number) => {
    if (quality >= 0.8) return 'success';
    if (quality >= 0.6) return 'warning';
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
            <Typography variant="h6" gutterBottom>Active Operations</Typography>
            <Typography variant="h3" color="primary">
              {metrics.active_operations}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Intelligence collections
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Intelligence Quality</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.intelligence_quality * 100}
                size={60}
                color={getQualityColor(metrics.intelligence_quality)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getQualityColor(metrics.intelligence_quality)}>
                  {(metrics.intelligence_quality * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Quality Score
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Source Diversity</Typography>
            <Typography variant="h3" color="secondary">
              {metrics.source_diversity}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Unique intel sources
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default IntelOverview;
