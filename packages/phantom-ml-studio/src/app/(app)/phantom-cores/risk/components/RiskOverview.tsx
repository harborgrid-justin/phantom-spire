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
import { useRiskUtils } from '../hooks';
import type { RiskStatus } from '../types';

interface RiskOverviewProps {
  status: RiskStatus | undefined;
}

export const RiskOverview: React.FC<RiskOverviewProps> = ({ status }) => {
  const { getRiskColor, getRiskLevel } = useRiskUtils();

  if (!status?.data) {
    return (
      <Alert severity="warning">Risk system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  // Add null check for metrics
  if (!metrics) {
    return (
      <Alert severity="info">Risk metrics are currently being initialized...</Alert>
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
              label={status.data.status || 'Unknown'}
              color={status.data.status === 'operational' ? 'success' : 'warning'}
            />
            <Typography variant="body2" color="textSecondary" mt={1}>
              Uptime: {metrics.uptime || 'N/A'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Overall Risk Score</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.overall_risk_score || 0}
                size={60}
                color={getRiskColor(metrics.overall_risk_score || 0)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getRiskColor(metrics.overall_risk_score || 0)}>
                  {(metrics.overall_risk_score || 0).toFixed(0)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {getRiskLevel(metrics.overall_risk_score || 0)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active Assessments</Typography>
            <Typography variant="h3" color="primary">
              {metrics.active_assessments || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Currently running assessments
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Critical Risks</Typography>
            <Typography variant="h3" color="error">
              {metrics.critical_risks || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Requiring immediate attention
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
