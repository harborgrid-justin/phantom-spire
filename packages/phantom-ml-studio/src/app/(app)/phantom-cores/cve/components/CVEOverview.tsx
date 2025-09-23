// CVE Overview Component - System Status and Metrics

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
import { CVEStatus } from '../types';

interface CVEOverviewProps {
  status: CVEStatus | undefined;
}

const CVEOverview: React.FC<CVEOverviewProps> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">CVE system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  // Add null check for metrics
  if (!metrics) {
    return (
      <Alert severity="info">CVE metrics are currently being initialized...</Alert>
    );
  }

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 0.9) return 'success';
    if (percentage >= 0.7) return 'warning';
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
            <Typography variant="h6" gutterBottom>Total CVEs</Typography>
            <Typography variant="h3" color="primary">
              {(metrics.total_cves || 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Tracked vulnerabilities
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Critical CVEs</Typography>
            <Typography variant="h3" color="error">
              {metrics.critical_cves || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              High severity issues
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Coverage</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={(metrics.coverage_percentage || 0) * 100}
                size={60}
                color={getCoverageColor(metrics.coverage_percentage || 0)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getCoverageColor(metrics.coverage_percentage || 0)}>
                  {((metrics.coverage_percentage || 0) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Database Coverage
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default CVEOverview;
