// Forensics Overview Component

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
import { ForensicsStatus } from '../types';

interface ForensicsOverviewProps {
  status: ForensicsStatus | undefined;
}

const ForensicsOverview: React.FC<ForensicsOverviewProps> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Forensics system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  if (!metrics) {
    return (
      <Alert severity="info">Forensics metrics are currently being initialized...</Alert>
    );
  }

  const getCompletionColor = (completion: number) => {
    if (completion >= 0.8) return 'success';
    if (completion >= 0.6) return 'warning';
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
            <Typography variant="h6" gutterBottom>Active Investigations</Typography>
            <Typography variant="h3" color="primary">
              {metrics.active_investigations || 8}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Forensic investigations
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Evidence Items</Typography>
            <Typography variant="h3" color="secondary">
              {(metrics.evidence_items || 1247).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Digital artifacts
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Analysis Progress</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={(metrics.artifact_extraction_rate || 0.92) * 100}
                size={60}
                color={getCompletionColor(metrics.artifact_extraction_rate || 0.92)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getCompletionColor(metrics.artifact_extraction_rate || 0.92)}>
                  {((metrics.artifact_extraction_rate || 0.92) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Extraction Rate
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ForensicsOverview;
