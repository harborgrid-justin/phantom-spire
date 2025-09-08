/**
 * System Health Monitoring and Performance Metrics Dashboard
 * Comprehensive enterprise system monitoring with interactive business logic
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Tooltip,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Switch,
  FormControlLabel,
  Snackbar
} from '@mui/material';
import {
  Refresh,
  Settings,
  Warning,
  CheckCircle,
  ErrorOutline,
  TrendingUp,
  Memory,
  Storage,
  Speed,
  NetworkCheck,
  NotificationsActive,
  HealthAndSafety,
  BugReport,
  Analytics,
  Timeline,
  Security
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

interface SystemService {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime: string;
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
}

interface PerformanceMetric {
  id: string;
  name: string;
  current: number;
  threshold: { warning: number; critical: number };
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export const SystemHealthMonitoring: React.FC = () => {
  const theme = useTheme();

  // Enhanced business logic integration
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    refresh
  } = useServicePage('admin');

  // Local state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [isRunningHealthCheck, setIsRunningHealthCheck] = useState(false);

  // UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('system-health-monitoring', {
      continuous: true,
      position: 'bottom-left', 
      minimized: true,
      interval: 90000
    });

    return () => evaluationController.remove();
  }, []);

  // Real-time admin data
  const adminData = useMemo(() => {
    if (!realTimeData.data) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        systemUptime: Date.now(),
        diskUsage: 0,
        backupStatus: 'unknown',
        securityAlerts: 0
      };
    }
    return realTimeData.data;
  }, [realTimeData.data]);

  // Mock system services data
  const systemServices: SystemService[] = useMemo(() => [
    {
      id: 'web-server',
      name: 'Web Server',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: 120,
      errorRate: 0.1,
      lastCheck: new Date()
    },
    {
      id: 'database',
      name: 'Database',
      status: 'healthy',
      uptime: '99.8%',
      responseTime: 45,
      errorRate: 0.05,
      lastCheck: new Date()
    },
    {
      id: 'cache',
      name: 'Cache Server',
      status: 'warning',
      uptime: '98.5%',
      responseTime: 200,
      errorRate: 2.1,
      lastCheck: new Date()
    },
    {
      id: 'message-queue',
      name: 'Message Queue',
      status: 'healthy',
      uptime: '100%',
      responseTime: 30,
      errorRate: 0.0,
      lastCheck: new Date()
    }
  ], []);

  // Performance metrics
  const performanceMetrics: PerformanceMetric[] = useMemo(() => [
    {
      id: 'cpu',
      name: 'CPU Usage',
      current: adminData.cpuUsage || Math.floor(Math.random() * 40) + 30,
      threshold: { warning: 70, critical: 85 },
      unit: '%',
      trend: 'stable'
    },
    {
      id: 'memory',
      name: 'Memory Usage',
      current: adminData.memoryUsage || Math.floor(Math.random() * 30) + 40,
      threshold: { warning: 80, critical: 90 },
      unit: '%',
      trend: 'down'
    },
    {
      id: 'disk',
      name: 'Disk Usage',
      current: adminData.diskUsage || Math.floor(Math.random() * 20) + 60,
      threshold: { warning: 85, critical: 95 },
      unit: '%',
      trend: 'up'
    }
  ], [adminData]);

  // Business logic operations
  const handleRunHealthCheck = async () => {
    setIsRunningHealthCheck(true);
    try {
      const result = await businessLogic.execute('system-health-check', {
        includeDetails: true,
        checkServices: true
      }, 'high');

      if (result.success) {
        addNotification('success', 'System health check completed successfully');
      }
    } catch (error) {
      addNotification('error', 'Health check failed');
    } finally {
      setIsRunningHealthCheck(false);
    }
  };

  const handleMaintenanceMode = async (enable: boolean) => {
    try {
      const result = await businessLogic.execute('maintenance-mode', {
        enabled: enable,
        reason: 'Scheduled maintenance'
      }, 'critical');

      if (result.success) {
        addNotification(
          enable ? 'warning' : 'success',
          `Maintenance mode ${enable ? 'enabled' : 'disabled'}`
        );
      }
    } catch (error) {
      addNotification('error', `Failed to ${enable ? 'enable' : 'disable'} maintenance mode`);
    }
  };

  const handleRestartService = async (serviceId: string) => {
    try {
      const result = await businessLogic.execute('restart-service', {
        serviceId,
        force: false
      }, 'high');

      if (result.success) {
        addNotification('info', `Service ${serviceId} restart initiated`);
      }
    } catch (error) {
      addNotification('error', `Failed to restart service ${serviceId}`);
    }
  };

  // Get status color and icon
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'healthy': 
      case 'success': 
        return { color: 'success' as const, icon: <CheckCircle />, text: 'HEALTHY' };
      case 'warning': 
        return { color: 'warning' as const, icon: <Warning />, text: 'WARNING' };
      case 'critical': 
      case 'error': 
        return { color: 'error' as const, icon: <ErrorOutline />, text: 'CRITICAL' };
      default: 
        return { color: 'default' as const, icon: <BugReport />, text: 'UNKNOWN' };
    }
  };

  const getMetricColor = (metric: PerformanceMetric) => {
    if (metric.current >= metric.threshold.critical) return 'error';
    if (metric.current >= metric.threshold.warning) return 'warning';
    return 'success';
  };

  const formatUptime = (uptimeMs: number) => {
    const days = Math.floor(uptimeMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((uptimeMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    return `${days}d ${hours}h`;
  };

  const criticalServices = systemServices.filter(s => s.status === 'critical');
  const warningServices = systemServices.filter(s => s.status === 'warning');

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🏥 System Health Monitoring
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" color="textSecondary">
              Enterprise system monitoring and performance metrics
            </Typography>
            {criticalServices.length === 0 ? (
              <Chip icon={<HealthAndSafety />} label="All Systems Healthy" color="success" size="small" />
            ) : (
              <Chip icon={<Warning />} label={`${criticalServices.length} Critical Issues`} color="error" size="small" />
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Badge badgeContent={notifications.length} color="error">
            <IconButton color={notifications.length > 0 ? 'warning' : 'default'}>
              <NotificationsActive />
            </IconButton>
          </Badge>
          
          <Button
            variant="outlined"
            startIcon={isRunningHealthCheck ? <CircularProgress size={16} /> : <Analytics />}
            onClick={handleRunHealthCheck}
            disabled={isRunningHealthCheck}
          >
            Health Check
          </Button>
          
          <Tooltip title="Refresh Data">
            <IconButton onClick={refresh} disabled={businessLogic.isLoading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* System Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {adminData.totalUsers?.toLocaleString() || '156'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Users
                  </Typography>
                </Box>
                <Security color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {adminData.activeUsers || '42'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Sessions
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {formatUptime(Date.now() - (adminData.systemUptime || Date.now() - 86400000))}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    System Uptime
                  </Typography>
                </Box>
                <Timeline color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" color={adminData.securityAlerts > 0 ? 'warning.main' : 'success.main'} fontWeight="bold">
                    {adminData.securityAlerts || '0'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Security Alerts
                  </Typography>
                </Box>
                <Warning color={adminData.securityAlerts > 0 ? 'warning' : 'success'} sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 Performance Metrics
            </Typography>
            
            <Grid container spacing={3}>
              {performanceMetrics.map((metric) => {
                const statusConfig = getStatusConfig(getMetricColor(metric));
                return (
                  <Grid item xs={12} key={metric.id}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {metric.id === 'cpu' && <Speed />}
                          {metric.id === 'memory' && <Memory />}
                          {metric.id === 'disk' && <Storage />}
                          <Typography variant="body1" fontWeight="medium">
                            {metric.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {metric.current}{metric.unit}
                          </Typography>
                          <Chip
                            label={statusConfig.text}
                            color={statusConfig.color}
                            size="small"
                          />
                          {metric.trend === 'up' && <TrendingUp color="warning" fontSize="small" />}
                        </Box>
                      </Box>
                      
                      <LinearProgress
                        variant="determinate"
                        value={metric.current}
                        color={getMetricColor(metric)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption" color="textSecondary">
                          Warning: {metric.threshold.warning}{metric.unit}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Critical: {metric.threshold.critical}{metric.unit}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🔧 Quick Actions
            </Typography>
            
            <List>
              <ListItem>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                    />
                  }
                  label="Auto Refresh"
                />
              </ListItem>
              
              <ListItem>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={() => handleMaintenanceMode(true)}
                >
                  Enable Maintenance Mode
                </Button>
              </ListItem>
              
              <ListItem>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => refresh()}
                >
                  Force Refresh All
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Services Status */}
      <Paper elevation={2}>
        <Typography variant="h6" sx={{ p: 2 }}>
          🛠️ Service Health Status
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Uptime</TableCell>
                <TableCell>Response Time</TableCell>
                <TableCell>Error Rate</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {systemServices.map((service) => {
                const statusConfig = getStatusConfig(service.status);
                return (
                  <TableRow key={service.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {service.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {service.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.text}
                        color={statusConfig.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {service.uptime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {service.responseTime}ms
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={service.errorRate > 1 ? 'error.main' : 'textPrimary'}>
                        {service.errorRate.toFixed(2)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleRestartService(service.id)}
                        disabled={service.status === 'healthy'}
                      >
                        Restart
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Notifications */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={6000}
          onClose={() => removeNotification(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            severity={notification.type} 
            onClose={() => removeNotification(notification.id)}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};
