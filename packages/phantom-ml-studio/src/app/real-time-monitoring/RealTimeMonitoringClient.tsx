'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider
} from '@mui/material';
import {
  Refresh,
  Warning,
  CheckCircle,
  Error,
  TrendingUp,
  Speed,
  Memory,
  Storage
} from '@mui/icons-material';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  timestamp: Date;
}

interface ModelMetrics {
  modelId: string;
  modelName: string;
  accuracy: number;
  latency: number;
  throughput: number;
  errorRate: number;
  predictions: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface Alert {
  id: string;
  type: 'performance' | 'error' | 'drift' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export default function RealTimeMonitoringClient() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockSystemMetrics: SystemMetrics = {
        cpu: Math.random() * 40 + 30, // 30-70%
        memory: Math.random() * 30 + 50, // 50-80%
        disk: Math.random() * 20 + 40, // 40-60%
        network: Math.random() * 100 + 50, // 50-150 Mbps
        timestamp: new Date()
      };

      const mockModelMetrics: ModelMetrics[] = [
        {
          modelId: 'model_1',
          modelName: 'Customer Churn Predictor',
          accuracy: 0.924 - (Math.random() - 0.5) * 0.02,
          latency: Math.random() * 20 + 30, // 30-50ms
          throughput: Math.random() * 100 + 200, // 200-300 req/s
          errorRate: Math.random() * 0.02, // 0-2%
          predictions: Math.floor(Math.random() * 1000) + 15000,
          status: Math.random() > 0.8 ? 'warning' : 'healthy'
        },
        {
          modelId: 'model_2',
          modelName: 'Fraud Detection Engine',
          accuracy: 0.956 - (Math.random() - 0.5) * 0.01,
          latency: Math.random() * 15 + 20, // 20-35ms
          throughput: Math.random() * 150 + 100, // 100-250 req/s
          errorRate: Math.random() * 0.015, // 0-1.5%
          predictions: Math.floor(Math.random() * 500) + 8000,
          status: 'healthy'
        },
        {
          modelId: 'model_3',
          modelName: 'Sentiment Analysis API',
          accuracy: 0.889 - (Math.random() - 0.5) * 0.03,
          latency: Math.random() * 30 + 40, // 40-70ms
          throughput: Math.random() * 80 + 150, // 150-230 req/s
          errorRate: Math.random() * 0.05, // 0-5%
          predictions: Math.floor(Math.random() * 300) + 5000,
          status: Math.random() > 0.7 ? 'critical' : 'healthy'
        }
      ];

      const mockAlerts: Alert[] = [
        {
          id: 'alert_1',
          type: 'performance',
          severity: 'medium',
          message: 'Model latency increased by 15% in the last hour',
          timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
          acknowledged: false
        },
        {
          id: 'alert_2',
          type: 'drift',
          severity: 'high',
          message: 'Data drift detected in customer demographics features',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          acknowledged: false
        },
        {
          id: 'alert_3',
          type: 'error',
          severity: 'low',
          message: 'Minor increase in API timeout errors',
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          acknowledged: true
        }
      ];

      setSystemMetrics(mockSystemMetrics);
      setModelMetrics(mockModelMetrics);
      setAlerts(mockAlerts);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch monitoring data');
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Real-Time Monitoring
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchMetrics}
        >
          Refresh
        </Button>
      </Box>

      {/* System Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Speed color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">CPU Usage</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {systemMetrics?.cpu.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={systemMetrics?.cpu || 0}
                color={systemMetrics && systemMetrics.cpu > 80 ? 'error' : systemMetrics && systemMetrics.cpu > 60 ? 'warning' : 'primary'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Memory color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Memory</Typography>
              </Box>
              <Typography variant="h4" color="secondary">
                {systemMetrics?.memory.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={systemMetrics?.memory || 0}
                color={systemMetrics && systemMetrics.memory > 90 ? 'error' : systemMetrics && systemMetrics.memory > 75 ? 'warning' : 'secondary'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Storage color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Disk Usage</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {systemMetrics?.disk.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={systemMetrics?.disk || 0}
                color={systemMetrics && systemMetrics.disk > 90 ? 'error' : 'info'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Network</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {systemMetrics?.network.toFixed(0)} Mbps
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min((systemMetrics?.network || 0) / 2, 100)}
                color="success"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Model Performance */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Model Performance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Model</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Accuracy</TableCell>
                      <TableCell>Latency</TableCell>
                      <TableCell>Throughput</TableCell>
                      <TableCell>Error Rate</TableCell>
                      <TableCell>Predictions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {modelMetrics.map((model) => (
                      <TableRow key={model.modelId}>
                        <TableCell>{model.modelName}</TableCell>
                        <TableCell>
                          <Chip
                            label={model.status}
                            color={getStatusColor(model.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{(model.accuracy * 100).toFixed(1)}%</TableCell>
                        <TableCell>{model.latency.toFixed(0)}ms</TableCell>
                        <TableCell>{model.throughput.toFixed(0)} req/s</TableCell>
                        <TableCell>{(model.errorRate * 100).toFixed(2)}%</TableCell>
                        <TableCell>{model.predictions.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Alerts */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Alerts
              </Typography>
              <Box>
                {alerts.filter(alert => !alert.acknowledged).length === 0 ? (
                  <Box display="flex" alignItems="center" justifyContent="center" py={4}>
                    <CheckCircle color="success" sx={{ mr: 1 }} />
                    <Typography color="text.secondary">No active alerts</Typography>
                  </Box>
                ) : (
                  alerts.filter(alert => !alert.acknowledged).map((alert) => (
                    <Alert
                      key={alert.id}
                      severity={getSeverityColor(alert.severity) as any}
                      action={
                        <Button
                          size="small"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      }
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {alert.type.toUpperCase()}
                      </Typography>
                      <Typography variant="body2">{alert.message}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {alert.timestamp.toLocaleString()}
                      </Typography>
                    </Alert>
                  ))
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Recent Alerts
              </Typography>
              {alerts.filter(alert => alert.acknowledged).map((alert) => (
                <Box key={alert.id} sx={{ mb: 1, opacity: 0.6 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {alert.type.toUpperCase()} - {alert.severity}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {alert.message}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}