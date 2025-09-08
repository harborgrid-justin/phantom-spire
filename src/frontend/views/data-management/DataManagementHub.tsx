/**
 * Data Management Hub
 * Central dashboard for all data management operations
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
  Snackbar
} from '@mui/material';
import { 
  Dashboard,
  Storage, 
  Analytics,
  Security,
  MonitorHeart,
  DataObject,
  Transform,
  Policy,
  TrendingUp,
  SettingsApplications,
  CloudSync,
  Assessment
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';
import { useNavigate } from 'react-router-dom';

export const DataManagementHub: React.FC = () => {
  const navigate = useNavigate();
  
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
  } = useServicePage('data-management');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);

  // UI/UX evaluation integration
  useEffect(() => {
    addUIUXEvaluation('main-datamanagementhub', {
      position: 'bottom-right',
      autoStart: true,
      showScore: true
    });
  }, []);

  // Mock data for demonstration
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setData({
          summary: {
            totalDataSources: 45,
            dataVolume: '125TB',
            dailyIngestion: '2.5TB',
            healthScore: 94.5,
            activeUsers: 890,
            lastUpdate: new Date()
          },
          categories: [
            {
              id: 'ingestion',
              name: 'Data Ingestion & Processing',
              icon: 'DataObject',
              description: 'Manage data sources, streams, and processing pipelines',
              pages: 8,
              status: 'healthy',
              metrics: { active: 24, pending: 3, errors: 1 }
            },
            {
              id: 'governance',
              name: 'Data Governance & Compliance',
              icon: 'Policy',
              description: 'Ensure data quality, compliance, and governance',
              pages: 8,
              status: 'healthy',
              metrics: { policies: 67, violations: 3, compliance: 94.5 }
            },
            {
              id: 'analytics',
              name: 'Data Analytics & Insights',
              icon: 'Analytics',
              description: 'Generate insights and analytics from your data',
              pages: 8,
              status: 'healthy',
              metrics: { reports: 156, dashboards: 78, queries: 8500 }
            },
            {
              id: 'operations',
              name: 'Data Operations & Monitoring',
              icon: 'MonitorHeart',
              description: 'Monitor, optimize, and maintain data infrastructure',
              pages: 8,
              status: 'warning',
              metrics: { uptime: 99.8, alerts: 3, storage: '71.2%' }
            }
          ],
          recentActivity: [
            {
              timestamp: new Date(Date.now() - 5 * 60 * 1000),
              action: 'Data pipeline completed',
              category: 'ingestion',
              details: 'Customer data ETL processed 125K records'
            },
            {
              timestamp: new Date(Date.now() - 10 * 60 * 1000),
              action: 'Compliance check passed',
              category: 'governance',
              details: 'GDPR compliance verification completed'
            },
            {
              timestamp: new Date(Date.now() - 15 * 60 * 1000),
              action: 'Report generated',
              category: 'analytics',
              details: 'Monthly sales analytics report created'
            }
          ]
        });
      } catch (error) {
        console.error('Failed to load data:', error);
        addNotification({
          type: 'error',
          message: 'Failed to load dashboard data'
        });
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
      console.error('Failed to refresh data:', err);
      addNotification({
        type: 'error',
        message: 'Failed to refresh data'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const navigateToCategory = (categoryId: string) => {
    switch (categoryId) {
      case 'ingestion':
        navigate('/data-management/ingestion/sources');
        break;
      case 'governance':
        navigate('/data-management/governance/dashboard');
        break;
      case 'analytics':
        navigate('/data-management/analytics/workbench');
        break;
      case 'operations':
        navigate('/data-management/operations/health-monitor');
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'DataObject': return <DataObject />;
      case 'Policy': return <Policy />;
      case 'Analytics': return <Analytics />;
      case 'MonitorHeart': return <MonitorHeart />;
      default: return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Loading Data Management Hub...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            🗄️ Data Management Hub
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Comprehensive data management platform for ingestion, governance, analytics, and operations.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            onClick={handleRefresh}
            disabled={refreshing}
            startIcon={<CloudSync />}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="contained" startIcon={<Assessment />}>
            View Reports
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Data Sources
              </Typography>
              <Typography variant="h4">
                {data?.summary?.totalDataSources || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Active connections
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Total Data Volume
              </Typography>
              <Typography variant="h4">
                {data?.summary?.dataVolume || '0TB'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Across all systems
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Daily Ingestion
              </Typography>
              <Typography variant="h4">
                {data?.summary?.dailyIngestion || '0TB'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Per day average
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Health Score
              </Typography>
              <Typography variant="h4">
                {data?.summary?.healthScore || 0}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Overall system health
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Management Categories */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Data Management Categories
            </Typography>
            <Grid container spacing={2}>
              {data?.categories?.map((category: any) => (
                <Grid item xs={12} md={6} key={category.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { 
                        boxShadow: 4,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s'
                      }
                    }}
                    onClick={() => navigateToCategory(category.id)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ mr: 2, color: 'primary.main' }}>
                          {getCategoryIcon(category.icon)}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">
                            {category.name}
                          </Typography>
                          <Chip 
                            label={category.status}
                            size="small"
                            color={getStatusColor(category.status) as any}
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {category.description}
                      </Typography>
                      <Typography variant="caption" color="primary">
                        {category.pages} pages available
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {data?.recentActivity?.map((activity: any, index: number) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    {getCategoryIcon('DataObject')}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.action}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {activity.details}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {activity.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
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