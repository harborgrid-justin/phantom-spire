/**
 * Real-time Operations Center
 * Live monitoring and operational dashboards
 */

import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert
} from '@mui/material';
import { 
  Visibility, 
  Security, 
  Speed, 
  Warning, 
  CheckCircle,
  TrendingUp,
  NetworkCheck
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';

export const RealTimeOperationsCenter: React.FC = () => {
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('realtime-operations-center', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 30000 // More frequent for operations center
    });

    return () => evaluationController.remove();
  }, []);

  const systemMetrics = [
    { label: 'CPU Usage', value: 67, status: 'normal' },
    { label: 'Memory Usage', value: 45, status: 'normal' },
    { label: 'Network Throughput', value: 89, status: 'high' },
    { label: 'Storage Usage', value: 23, status: 'normal' }
  ];

  const liveAlerts = [
    { id: 1, message: 'High severity IOC detected', time: '2 min ago', severity: 'high' },
    { id: 2, message: 'Feed synchronization completed', time: '5 min ago', severity: 'info' },
    { id: 3, message: 'Incident INC-2024-0145 escalated', time: '8 min ago', severity: 'critical' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        📡 Real-time Operations Center
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Live monitoring of system health, threat feeds, and operational metrics.
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>System Status:</strong> All systems operational • Last updated: {new Date().toLocaleTimeString()}
        </Typography>
      </Alert>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Performance
            </Typography>
            {systemMetrics.map((metric) => (
              <Box key={metric.label} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{metric.label}</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metric.value}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={metric.value}
                  color={metric.status === 'high' ? 'warning' : 'primary'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Live Alerts
            </Typography>
            <List dense>
              {liveAlerts.map((alert) => (
                <ListItem key={alert.id}>
                  <ListItemIcon>
                    {alert.severity === 'critical' && <Warning color="error" />}
                    {alert.severity === 'high' && <Warning color="warning" />}
                    {alert.severity === 'info' && <CheckCircle color="info" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={alert.message}
                    secondary={alert.time}
                  />
                  <Chip
                    size="small"
                    label={alert.severity}
                    color={
                      alert.severity === 'critical' ? 'error' :
                      alert.severity === 'high' ? 'warning' : 'info'
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Security sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary" fontWeight="bold">
                23
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active Threats
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main" fontWeight="bold">
                98.7%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                System Uptime
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <NetworkCheck sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main" fontWeight="bold">
                15
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active Feeds
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
