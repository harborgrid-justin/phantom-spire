// Crypto Overview Component - System Status and Metrics

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
import { CryptoStatus } from '../types';

interface CryptoOverviewProps {
  status: CryptoStatus | undefined;
}

const CryptoOverview: React.FC<CryptoOverviewProps> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Crypto system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  // Add null check for metrics
  if (!metrics) {
    return (
      <Alert severity="info">Crypto metrics are currently being initialized...</Alert>
    );
  }

  const getStrengthColor = (strength: number) => {
    if (strength >= 0.9) return 'success';
    if (strength >= 0.7) return 'warning';
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
            <Typography variant="h6" gutterBottom>Detection Rate</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={(metrics.cipher_detection_rate || 0) * 100}
                size={60}
                color="primary"
              />
              <Box ml={2}>
                <Typography variant="h4" color="primary">
                  {((metrics.cipher_detection_rate || 0) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Cipher Detection
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Analyzed Samples</Typography>
            <Typography variant="h3" color="secondary">
              {(metrics.analyzed_samples || 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Cryptographic samples
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Encryption Strength</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={(metrics.encryption_strength || 0) * 100}
                size={60}
                color={getStrengthColor(metrics.encryption_strength || 0)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getStrengthColor(metrics.encryption_strength || 0)}>
                  {((metrics.encryption_strength || 0) * 100).toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg Strength
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default CryptoOverview;
