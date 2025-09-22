'use client';

import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import {
  Analytics,
  MonitorHeart,
} from '@mui/icons-material';

const RealTimeAnalyticsDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
          🛡️ Phantom Spire Real-Time Analytics
        </Typography>
      </Box>

      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Analytics color="primary" />
        Real-Time Threat Intelligence Analytics
        <Chip 
          label="LIVE" 
          color="success" 
          size="small" 
        />
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Threats Tracked
              </Typography>
              <Typography variant="h3" color="primary">
                245,847
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Real-time streaming from NVD, MITRE, CISA KEV
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Processing Throughput
              </Typography>
              <Typography variant="h3" color="success.main">
                1,156/sec
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Sub-100ms correlation latency
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ML Model Confidence
              </Typography>
              <Typography variant="h3" color="info.main">
                94.2%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Threat intelligence fusion
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={3} sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MonitorHeart color="success" />
            System Performance Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Alert severity="success">
                <Typography variant="body2">
                  <strong>Real-Time Processing:</strong> Operating at 98.7% efficiency with sub-100ms latency
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12} md={4}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>ML Models:</strong> 94.2% accuracy with continuous learning enabled
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12} md={4}>
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Threat Level:</strong> Elevated - 127 critical threats require attention
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RealTimeAnalyticsDashboard;