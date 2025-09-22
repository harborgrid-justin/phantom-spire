import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { VerificationResponse } from '../types';

interface VerificationSummaryProps {
  data: VerificationResponse;
}

export const VerificationSummary: React.FC<VerificationSummaryProps> = ({ data }) => {
  // Add null checks for data and summary
  if (!data || !data.summary) {
    return (
      <Alert severity="warning">Verification summary data unavailable</Alert>
    );
  }

  const totalCores = data.totalCores || 0;
  const accessible = data.summary.accessible || 0;
  const errors = data.summary.errors || 0;
  const warnings = data.summary.warnings || 0;
  
  const successRate = totalCores > 0 ? ((accessible / totalCores) * 100).toFixed(1) : '0.0';

  return (
    <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Total Cores</Typography>
            <Typography variant="h3" color="primary">
              {totalCores}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Phantom core packages
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Accessible</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={parseFloat(successRate)}
                size={60}
                color="success"
              />
              <Box ml={2}>
                <Typography variant="h4" color="success.main">
                  {accessible}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {successRate}% success
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Errors</Typography>
            <Typography variant="h3" color="error">
              {errors}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Failed imports
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Warnings</Typography>
            <Typography variant="h3" color="warning.main">
              {warnings}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Partial access
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
