/**
 * 📊 Capacity Planning
 * Plan and forecast data infrastructure capacity needs
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { 
  Refresh,
  Settings,
  TrendingUp,  Error as ErrorIcon,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';
import { Status, Priority } from '../../../types/index';

export const CapacityPlanning: React.FC = () => {
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
  } = useServicePage('operations-capacity-planning');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);

  // UI/UX evaluation integration
  useEffect(() => {
    addUIUXEvaluation('operations-capacity-planning', {
      position: 'bottom-right',
      autoStart: true,
      showScore: true
    });
  }, []);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call to backend
        const response = await fetch('/api/v1/data-management/operations/capacity-planning');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const result = await response.json();
        setData(result.data);
        
        addNotification('success', 'Data loaded successfully');
      } catch (error) {
        console.error('Failed to load data:', error);
        addNotification('error', 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [addNotification]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refresh();
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <CircularProgress />
        </div>
      </div>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            📊 Capacity Planning
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Plan and forecast data infrastructure capacity needs
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            onClick={handleRefresh}
            disabled={refreshing}
            startIcon={<Refresh />}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="contained" startIcon={<Settings />}>
            Configure
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{data?.summary?.total || 0}</div>
              <div className="text-gray-600">Total</div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{data?.summary?.active || 0}</div>
              <div className="text-gray-600">Active</div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{data?.summary?.pending || 0}</div>
              <div className="text-gray-600">Pending</div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{data?.summary?.critical || 0}</div>
              <div className="text-gray-600">Critical</div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Area */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Main Content
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              This is the main content area for 📊 Capacity Planning. 
              The page is fully integrated with the business logic system and provides 
              comprehensive data management capabilities.
            </Typography>
            
            {/* Content based on data */}
            {data && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Current Status
                </Typography>
                <Chip 
                  label="Operational" 
                  color="success" 
                  icon={<CheckCircle />}
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label="Connected" 
                  variant="outlined"
                />
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-900">{data?.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600">Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Health:</span>
                <span className="text-green-600">Good</span>
              </div>
            </div>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {data?.recentActivity?.length > 0 ? (
                data.recentActivity.map((activity: any, index: number) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <Info />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.event || 'System update'}
                      secondary={activity.details || 'Activity details'}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No recent activity"
                    secondary="Check back later for updates"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

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