// Compliance Overview Component

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
import Grid from '@mui/material/Grid';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { ComplianceStatus } from '../types';

interface ComplianceOverviewProps {
  status: ComplianceStatus | undefined;
}

const ComplianceOverview: React.FC<ComplianceOverviewProps> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Compliance system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  if (!metrics) {
    return (
      <Alert severity="info">Compliance metrics are currently being initialized...</Alert>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'success';
    if (score >= 0.7) return 'warning';
    return 'error';
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
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
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Compliance Score</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.compliance_score * 100}
                size={60}
                color={getScoreColor(metrics.compliance_score)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getScoreColor(metrics.compliance_score)}>
                  {(metrics.compliance_score * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Overall Score
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active Frameworks</Typography>
            <Typography variant="h3" color="primary">
              {metrics.frameworks_active}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Compliance frameworks monitored
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ComplianceOverview;
