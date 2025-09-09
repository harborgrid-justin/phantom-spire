/**
 * Real-time Operations Center
 * Live monitoring and operational dashboards with interactive business logic
 */

import React, { useEffect, useState, useMemo } from 'react';
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
  Alert,
  Button,
  IconButton,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  Visibility, 
  Security, 
  Speed, 
  Warning, 
  CheckCircle,
  TrendingUp,
  NetworkCheck,
  Refresh,
  Settings,
  NotificationsActive,
  PlayArrow,
  Pause,
  BugReport,
  HealthAndSafety,
  Storage,
  Memory
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';
import { Status, Priority } from '../../types/index';

interface SystemAlert {
  id: string;
  message: string;
  time: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  acknowledged: boolean;
}

export const RealTimeOperationsCenter: React.FC = () => {
  // Enhanced business logic integration
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    isFullyLoaded,
    refresh
  } = useServicePage('operations');

  // Local state
  const [selectedTab, setSelectedTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      message: 'High severity IOC detected in network traffic',
      time: '2 min ago',
      severity: 'high',
      acknowledged: false
    },
    {
      id: '2',
      message: 'Feed synchronization completed successfully',
      time: '5 min ago',
      severity: 'info',
      acknowledged: true
    },
    {
      id: '3',
      message: 'Incident INC-2024-0145 escalated to Level 2',
      time: '8 min ago',
      severity: 'critical',
      acknowledged: false
    }
  ]);

  // UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('realtime-operations-center', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 30000 // More frequent for operations center
    });

    return () => evaluationController.remove();
  }, []);

  // Real-time operations data
  const operationsData = useMemo(() => {
    if (!realTimeData.data) {
      return {
        systemStatus: 'unknown',
        cpuUsage: 0,
        memoryUsage: 0,
        activeConnections: 0,
        queueSize: 0,
        health: 'unknown'
      };
    }
    return realTimeData.data;
  }, [realTimeData.data]);

  // System metrics with real-time data
  const systemMetrics = useMemo(() => [
    { 
      label: 'CPU Usage', 
      value: operationsData.cpuUsage || 0, 
      status: operationsData.cpuUsage > 80 ? 'critical' : operationsData.cpuUsage > 60 ? 'warning' : 'normal',
      icon: <Speed />
    },
    { 
      label: 'Memory Usage', 
      value: operationsData.memoryUsage || 0, 
      status: operationsData.memoryUsage > 85 ? 'critical' : operationsData.memoryUsage > 70 ? 'warning' : 'normal',
      icon: <Memory />
    },
    { 
      label: 'Active Connections', 
      value: operationsData.activeConnections || 0, 
      status: operationsData.activeConnections > 500 ? 'warning' : 'normal',
      icon: <NetworkCheck />,
      isCount: true
    },
    { 
      label: 'Queue Size', 
      value: operationsData.queueSize || 0, 
      status: operationsData.queueSize > 100 ? 'critical' : operationsData.queueSize > 50 ? 'warning' : 'normal',
      icon: <Storage />,
      isCount: true
    }
  ], [operationsData]);

  // Business logic operations
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await businessLogic.execute('acknowledge-alert', { alertId });
      setSystemAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
      addNotification('success', 'Alert acknowledged');
    } catch (error) {
      addNotification('error', 'Failed to acknowledge alert');
    }
  };

  const handleSystemMaintenance = async (action: string) => {
    try {
      await businessLogic.execute('system-maintenance', { action }, 'critical');
      addNotification('info', `System ${action} initiated`);
    } catch (error) {
      addNotification('error', `Failed to ${action} system`);
    }
  };

  const handleEmergencyResponse = async () => {
    try {
      await businessLogic.execute('emergency-response', {
        timestamp: new Date(),
        initiatedBy: 'operator'
      }, 'critical');
      addNotification('warning', 'Emergency response protocol activated');
    } catch (error) {
      addNotification('error', 'Failed to activate emergency response');
    }
  };

  // Get status color and icon
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'critical': return { color: 'error', icon: <Warning />, text: 'CRITICAL' };
      case 'warning': return { color: 'warning', icon: <Warning />, text: 'WARNING' };
      case 'normal': return { color: 'success', icon: <CheckCircle />, text: 'NORMAL' };
      default: return { color: 'default', icon: <Visibility />, text: 'UNKNOWN' };
    }
  };

  const getSeverityChip = (severity: string) => {
    const severityConfig = {
      critical: { color: 'error' as const, icon: '🚨' },
      high: { color: 'warning' as const, icon: '⚠️' },
      medium: { color: 'info' as const, icon: 'ℹ️' },
      low: { color: 'default' as const, icon: '💡' },
      info: { color: 'success' as const, icon: '✅' }
    };

    const config = severityConfig[severity as keyof typeof severityConfig];
    return (
      <Chip
        label={`${config.icon} ${severity.toUpperCase()}`}
        color={config.color}
        size="small"
      />
    );
  };

  const unacknowledgedAlerts = systemAlerts.filter(alert => !alert.acknowledged);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with real-time status */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📡 Real-time Operations Center
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" color="textSecondary">
              Live monitoring of system health, threat feeds, and operational metrics
            </Typography>
            {realTimeData.isConnected ? (
              <Chip icon={<HealthAndSafety />} label="Systems Online" color="success" size="small" />
            ) : (
              <Chip icon={<BugReport />} label="Connection Issues" color="error" size="small" />
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Badge badgeContent={unacknowledgedAlerts.length} color="error">
            <IconButton color="warning">
              <NotificationsActive />
            </IconButton>
          </Badge>
          
          <Tooltip title="Refresh Dashboard">
            <IconButton 
              onClick={refresh}
              disabled={businessLogic.isLoading}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                size="small"
              />
            }
            label="Auto"
            sx={{ ml: 1 }}
          />
        </Box>
      </Box>

      {/* System Status Alert */}
      <Alert 
        severity={operationsData.health === 'healthy' ? 'success' : operationsData.health === 'warning' ? 'warning' : 'info'} 
        sx={{ mb: 3 }}
        action={
          <Button color="inherit" size="small" onClick={handleEmergencyResponse}>
            Emergency Response
          </Button>
        }
      >
        <Typography variant="body2">
          <strong>System Status:</strong> {operationsData.systemStatus || 'Unknown'} • 
          Last updated: {realTimeData.lastUpdate?.toLocaleTimeString() || 'Never'}
        </Typography>
      </Alert>

      {/* Navigation Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          <Tab label="System Metrics" />
          <Tab label="Live Alerts" />
          <Tab label="Performance" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {/* System Performance Cards */}
          {systemMetrics.map((metric) => {
            const statusConfig = getStatusConfig(metric.status);
            return (
              <Grid item xs={12} md={3} key={metric.label}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h4" color={`${statusConfig.color}.main`} fontWeight="bold">
                          {metric.isCount ? metric.value.toLocaleString() : `${metric.value}%`}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {metric.label}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        {metric.icon}
                        <Typography variant="caption" display="block">
                          {statusConfig.text}
                        </Typography>
                      </Box>
                    </Box>
                    {!metric.isCount && (
                      <LinearProgress
                        variant="determinate"
                        value={metric.value}
                        color={statusConfig.color}
                        sx={{ mt: 2, height: 8, borderRadius: 4 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
          
          {/* Quick Actions */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                🎛️ System Operations
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<PlayArrow />}
                    onClick={() => handleSystemMaintenance('restart')}
                    color="warning"
                  >
                    Restart Services
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<Pause />}
                    onClick={() => handleSystemMaintenance('maintenance')}
                  >
                    Maintenance Mode
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    onClick={() => handleSystemMaintenance('optimize')}
                  >
                    Optimize Performance
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {selectedTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                🚨 Live System Alerts
              </Typography>
              <List>
                {systemAlerts.map((alert) => (
                  <ListItem 
                    key={alert.id}
                    sx={{ 
                      backgroundColor: alert.acknowledged ? 'transparent' : 'action.hover',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemIcon>
                      {getSeverityChip(alert.severity)}
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.message}
                      secondary={`${alert.time} • ${alert.acknowledged ? 'Acknowledged' : 'Pending'}`}
                    />
                    {!alert.acknowledged && (
                      <Button
                        size="small"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {selectedTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                📊 Performance Metrics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell>Current</TableCell>
                      <TableCell>Average (1h)</TableCell>
                      <TableCell>Peak (24h)</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {systemMetrics.map((metric) => (
                      <TableRow key={metric.label}>
                        <TableCell>{metric.label}</TableCell>
                        <TableCell>
                          {metric.isCount ? metric.value.toLocaleString() : `${metric.value}%`}
                        </TableCell>
                        <TableCell>
                          {metric.isCount ? 
                            (metric.value * 0.8).toFixed(0) : 
                            `${(metric.value * 0.85).toFixed(1)}%`
                          }
                        </TableCell>
                        <TableCell>
                          {metric.isCount ? 
                            (metric.value * 1.2).toFixed(0) : 
                            `${Math.min(100, metric.value * 1.15).toFixed(1)}%`
                          }
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusConfig(metric.status).text}
                            color={getStatusConfig(metric.status).color}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Alert Dialog */}
      <Dialog
        open={alertDialogOpen}
        onClose={() => setAlertDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Alert Details</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedAlert.message}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Time: {selectedAlert.time}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Severity: {selectedAlert.severity}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialogOpen(false)}>Close</Button>
          {selectedAlert && !selectedAlert.acknowledged && (
            <Button 
              onClick={() => {
                handleAcknowledgeAlert(selectedAlert.id);
                setAlertDialogOpen(false);
              }}
              variant="contained"
            >
              Acknowledge
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
