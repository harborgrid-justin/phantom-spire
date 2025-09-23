import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as TimeoutIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
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

  // Handle both old and new data structure with proper type checking
  const totalApiEndpoints = data.summary.totalApiEndpoints || 0;
  const accessibleEndpoints = data.summary.accessibleEndpoints || 0;
  const errorEndpoints = data.summary.errorEndpoints || 0;
  const timeoutEndpoints = data.summary.timeoutEndpoints || 0;
  const overallSuccessRate = data.summary.overallSuccessRate || '0.0';
  
  // Enterprise Methods data with proper type checking
  const enterpriseMethods = data.enterpriseMethods;
  const phantomCores = data.phantomCores;
  
  const verificationDuration = data.verificationDuration || 0;

  return (
    <Box mb={3}>
      {/* Main Summary Cards */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <Card sx={{ minWidth: 250, flex: '1 1 250px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Total API Endpoints</Typography>
            <Typography variant="h3" color="primary">
              {totalApiEndpoints}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Enterprise methods + Phantom cores
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 250, flex: '1 1 250px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Accessible</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={parseFloat(overallSuccessRate)}
                size={60}
                color="success"
              />
              <Box ml={2}>
                <Typography variant="h4" color="success.main">
                  {accessibleEndpoints}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {overallSuccessRate}% success
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 250, flex: '1 1 250px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Errors</Typography>
            <Typography variant="h3" color="error">
              {errorEndpoints}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Failed endpoints
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 250, flex: '1 1 250px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Timeouts</Typography>
            <Typography variant="h3" color="warning.main">
              {timeoutEndpoints}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Slow responses
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Performance & System Status */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
        <Card sx={{ minWidth: 300, flex: '1 1 300px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Verification Performance
            </Typography>
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Total verification time: {verificationDuration}ms
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Average per endpoint: {totalApiEndpoints > 0 ? Math.round(verificationDuration / totalApiEndpoints) : 0}ms
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={parseFloat(overallSuccessRate)}
              color="success"
              sx={{ height: 8, borderRadius: 4 }}
            />
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 300, flex: '1 1 300px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>System Status</Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              <Chip
                icon={<CheckCircleIcon />}
                label={`${accessibleEndpoints} Accessible`}
                color="success"
                size="small"
              />
              {errorEndpoints > 0 && (
                <Chip
                  icon={<ErrorIcon />}
                  label={`${errorEndpoints} Errors`}
                  color="error"
                  size="small"
                />
              )}
              {timeoutEndpoints > 0 && (
                <Chip
                  icon={<TimeoutIcon />}
                  label={`${timeoutEndpoints} Timeouts`}
                  color="warning"
                  size="small"
                />
              )}
            </Box>
            <Typography variant="body2" color="textSecondary" mt={2}>
              Last verified: {new Date(data.timestamp).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Enterprise Methods Breakdown */}
      {enterpriseMethods && enterpriseMethods.total > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Enterprise Methods Verification</Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box flex="1 1 150px">
                <Typography variant="body2" color="textSecondary">Total Methods</Typography>
                <Typography variant="h6">{enterpriseMethods.total}</Typography>
              </Box>
              <Box flex="1 1 150px">
                <Typography variant="body2" color="textSecondary">Accessible</Typography>
                <Typography variant="h6" color="success.main">{enterpriseMethods.accessible}</Typography>
              </Box>
              <Box flex="1 1 150px">
                <Typography variant="body2" color="textSecondary">Errors</Typography>
                <Typography variant="h6" color="error.main">{enterpriseMethods.errors}</Typography>
              </Box>
              <Box flex="1 1 150px">
                <Typography variant="body2" color="textSecondary">Success Rate</Typography>
                <Typography variant="h6" color="primary">{enterpriseMethods.successRate}%</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Phantom Cores Breakdown */}
      {phantomCores && phantomCores.totalCores > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Phantom Cores Verification</Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box flex="1 1 150px">
                <Typography variant="body2" color="textSecondary">Total Cores</Typography>
                <Typography variant="h6">{phantomCores.totalCores}</Typography>
              </Box>
              <Box flex="1 1 150px">
                <Typography variant="body2" color="textSecondary">Accessible</Typography>
                <Typography variant="h6" color="success.main">{phantomCores.accessible}</Typography>
              </Box>
              <Box flex="1 1 150px">
                <Typography variant="body2" color="textSecondary">Errors</Typography>
                <Typography variant="h6" color="error.main">{phantomCores.errors}</Typography>
              </Box>
              <Box flex="1 1 150px">
                <Typography variant="body2" color="textSecondary">Success Rate</Typography>
                <Typography variant="h6" color="primary">{phantomCores.successRate}%</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
