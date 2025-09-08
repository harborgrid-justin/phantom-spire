'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { ArrowBack, Refresh, Settings } from '@mui/icons-material';

const RealtimeMonitoringPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/xdr/monitoring/realtime', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      // Mock data for demonstration
      setData({
        status: 'operational',
        metrics: {
          total: Math.floor(Math.random() * 1000),
          active: Math.floor(Math.random() * 100),
          resolved: Math.floor(Math.random() * 500)
        },
        lastUpdate: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Real-time Monitoring
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={handleRefresh}
          variant="outlined"
          sx={{ mr: 1 }}
        >
          Refresh
        </Button>
        <Button
          startIcon={<Settings />}
          variant="outlined"
        >
          Configure
        </Button>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Live security event monitoring
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Unable to connect to live data. Showing demo data.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overview
              </Typography>
              
              {data && (
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell align="right">Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Status
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={data.status || 'Active'} 
                            color="success" 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Total Items
                        </TableCell>
                        <TableCell align="right">
                          {data.metrics?.total || 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Active
                        </TableCell>
                        <TableCell align="right">
                          {data.metrics?.active || 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Resolved
                        </TableCell>
                        <TableCell align="right">
                          {data.metrics?.resolved || 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Last Update
                        </TableCell>
                        <TableCell align="right">
                          {data.lastUpdate ? new Date(data.lastUpdate).toLocaleString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="contained" fullWidth>
                  Execute Action
                </Button>
                <Button variant="outlined" fullWidth>
                  View History
                </Button>
                <Button variant="outlined" fullWidth>
                  Export Data
                </Button>
                <Button variant="outlined" fullWidth>
                  View Reports
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Module Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This module provides live security event monitoring. 
                Use the controls above to interact with the system and configure settings as needed.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RealtimeMonitoringPage;