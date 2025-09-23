// Incident Response Overview Component

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
import { IncidentResponseStatus } from '../types';

interface IncidentResponseOverviewProps {
  status: IncidentResponseStatus | undefined;
}

const IncidentResponseOverview: React.FC<IncidentResponseOverviewProps> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Incident Response system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  if (!metrics) {
    return (
      <Alert severity="info">Incident Response metrics are currently being initialized...</Alert>
    );
  }

  const getReadinessColor = (readiness: number) => {
    if (readiness >= 0.9) return 'success';
    if (readiness >= 0.7) return 'warning';
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
            <Typography variant="h6" gutterBottom>Active Incidents</Typography>
            <Typography variant="h3" color="error">
              {metrics.active_incidents}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Requiring attention
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Avg Response Time</Typography>
            <Typography variant="h3" color="primary">
              {metrics.response_time_avg}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Minutes to initial response
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Team Readiness</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.team_readiness * 100}
                size={60}
                color={getReadinessColor(metrics.team_readiness)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getReadinessColor(metrics.team_readiness)}>
                  {(metrics.team_readiness * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Team Readiness
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default IncidentResponseOverview;
