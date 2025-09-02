/**
 * Analytics & Reporting Dashboard
 * Comprehensive threat intelligence analytics and reporting with interactive business logic
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Analytics, 
  TrendingUp, 
  Assessment, 
  Refresh,
  NotificationsActive,
  ErrorOutline,
  CheckCircle,
  Warning,
  Speed,
  Timeline,
  FilterList,
  GetApp,
  Settings
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

export const AnalyticsReporting: React.FC = () => {
  // Enhanced business logic integration
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('analytics');

  // Local state for UI interactions
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterCriteria, setFilterCriteria] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('analytics-reporting', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 180000
    });

    return () => evaluationController.remove();
  }, []);

  // Real-time data processing
  const analyticsData = useMemo(() => {
    if (!realTimeData.data) {
      return {
        totalIOCs: 0,
        activeThreats: 0,
        processedToday: 0,
        threatLevel: 'unknown',
        trends: { iocGrowth: 0, threatIncrease: 0 }
      };
    }
    return realTimeData.data;
  }, [realTimeData.data]);

  // Business logic operations
  const handleGenerateReport = async (reportType: string) => {
    setIsGeneratingReport(true);
    try {
      const result = await businessLogic.execute('generate-report', {
        type: reportType,
        timeRange: selectedTimeRange,
        filters: filterCriteria
      }, 'high');
      
      if (result.success) {
        addNotification('success', `${reportType} report generated successfully`);
      }
    } catch (error) {
      addNotification('error', `Failed to generate ${reportType} report`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDataRefresh = async () => {
    try {
      await refresh();
      addNotification('info', 'Data refreshed successfully');
    } catch (error) {
      addNotification('error', 'Failed to refresh data');
    }
  };

  const handleExportData = async () => {
    try {
      await businessLogic.execute('export-analytics-data', {
        format: 'csv',
        timeRange: selectedTimeRange
      });
      addNotification('success', 'Data export initiated');
    } catch (error) {
      addNotification('error', 'Data export failed');
    }
  };

  // Status indicators
  const getStatusColor = (value: number, thresholds: { low: number; medium: number }) => {
    if (value < thresholds.low) return 'success';
    if (value < thresholds.medium) return 'warning';
    return 'error';
  };

  const getThreatLevelChip = (level: string) => {
    const levelConfig = {
      low: { color: 'success' as const, icon: '🟢' },
      medium: { color: 'warning' as const, icon: '🟡' },
      high: { color: 'error' as const, icon: '🔴' },
      unknown: { color: 'default' as const, icon: '⚪' }
    };

    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.unknown;
    return (
      <Chip
        label={`${config.icon} ${level.toUpperCase()}`}
        color={config.color}
        size="small"
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with real-time status */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📊 Analytics & Reporting
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" color="textSecondary">
              Advanced threat intelligence analytics with real-time insights
            </Typography>
            {realTimeData.isConnected ? (
              <Chip icon={<CheckCircle />} label="Live Data" color="success" size="small" />
            ) : (
              <Chip icon={<ErrorOutline />} label="Disconnected" color="error" size="small" />
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Badge badgeContent={notifications.length} color="error">
            <IconButton 
              onClick={() => setShowNotifications(!showNotifications)}
              color={notifications.length > 0 ? 'warning' : 'default'}
            >
              <NotificationsActive />
            </IconButton>
          </Badge>
          
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={handleDataRefresh}
              disabled={businessLogic.isLoading}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Export Data">
            <IconButton onClick={handleExportData}>
              <GetApp />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Loading indicator */}
      {!isFullyLoaded && (
        <LinearProgress sx={{ mb: 2 }} />
      )}

      {/* Error alerts */}
      {hasErrors && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Some services are experiencing issues. Data may not be current.
        </Alert>
      )}

      {/* Controls */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Time Range</InputLabel>
              <Select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value="1h">Last Hour</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              size="small"
              fullWidth
              placeholder="Filter analytics data..."
              value={filterCriteria}
              onChange={(e) => setFilterCriteria(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterList />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
              }
              label="Auto Refresh"
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Typography variant="caption" color="textSecondary">
              Last Update: {realTimeData.lastUpdate?.toLocaleTimeString() || 'Never'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Real-time metrics dashboard */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {analyticsData.totalIOCs?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total IOCs
                  </Typography>
                </Box>
                <Speed color="primary" sx={{ fontSize: 40 }} />
              </Box>
              {analyticsData.trends?.iocGrowth !== undefined && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color={analyticsData.trends.iocGrowth >= 0 ? 'success.main' : 'error.main'}>
                    {analyticsData.trends.iocGrowth >= 0 ? '↗' : '↘'} {Math.abs(analyticsData.trends.iocGrowth)}% vs yesterday
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {analyticsData.activeThreats || '0'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Threats
                  </Typography>
                </Box>
                <Warning color="warning" sx={{ fontSize: 40 }} />
              </Box>
              <Box sx={{ mt: 1 }}>
                {getThreatLevelChip(analyticsData.threatLevel)}
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
                    {analyticsData.processedToday || '0'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Processed Today
                  </Typography>
                </Box>
                <Timeline color="success" sx={{ fontSize: 40 }} />
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
                    {businessLogic.stats?.recentRequests || '0'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    API Requests (5m)
                  </Typography>
                </Box>
                <Analytics color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Interactive features */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📈 Interactive Analytics
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TrendingUp />}
                  onClick={() => handleGenerateReport('trend-analysis')}
                  disabled={isGeneratingReport}
                >
                  Trend Analysis
                </Button>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Assessment />}
                  onClick={() => handleGenerateReport('executive-summary')}
                  disabled={isGeneratingReport}
                >
                  Executive Report
                </Button>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Analytics />}
                  onClick={() => handleGenerateReport('custom-dashboard')}
                  disabled={isGeneratingReport}
                >
                  Custom Dashboard
                </Button>
              </Grid>
            </Grid>

            {isGeneratingReport && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary" component="span">
                  Generating report...
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🔔 Recent Activity
            </Typography>
            
            <List dense>
              {notifications.slice(0, 5).map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem>
                    <ListItemIcon>
                      {notification.type === 'success' && <CheckCircle color="success" />}
                      {notification.type === 'error' && <ErrorOutline color="error" />}
                      {notification.type === 'warning' && <Warning color="warning" />}
                      {notification.type === 'info' && <Analytics color="info" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.message}
                      secondary={notification.timestamp.toLocaleTimeString()}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              
              {notifications.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No recent activity"
                    secondary="Activity will appear here as you use the system"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Notifications Snackbar */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={showNotifications}
          autoHideDuration={6000}
          onClose={() => removeNotification(notification.id)}
        >
          <Alert severity={notification.type} onClose={() => removeNotification(notification.id)}>
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};
