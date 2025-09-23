// MITRE Overview Component

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
import { MitreStatus } from '../types';

interface MitreOverviewProps {
  status: MitreStatus | undefined;
}

const MitreOverview: React.FC<MitreOverviewProps> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">MITRE system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  if (!metrics) {
    return (
      <Alert severity="info">MITRE metrics are currently being initialized...</Alert>
    );
  }

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 0.8) return 'success';
    if (coverage >= 0.6) return 'warning';
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
              Framework: {metrics.framework_version}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Techniques Mapped</Typography>
            <Typography variant="h3" color="primary">
              {metrics.techniques_mapped}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              ATT&CK techniques
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
                value={metrics.coverage_percentage * 100}
                size={60}
                color={getCoverageColor(metrics.coverage_percentage)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getCoverageColor(metrics.coverage_percentage)}>
                  {(metrics.coverage_percentage * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Framework Coverage
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Detection Rules</Typography>
            <Typography variant="h3" color="secondary">
              {metrics.detection_rules}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Active detection rules
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default MitreOverview;
