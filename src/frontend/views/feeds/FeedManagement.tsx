/**
 * Feed Management Interface
 * Threat intelligence feed configuration and monitoring
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Snackbar,
  Alert
} from '@mui/material';
import { RssFeed, CheckCircle,  Error as ErrorIcon, Schedule } from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

export const FeedManagement: React.FC = () => {
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
  } = useServicePage('feeds');

  const [feeds, setFeeds] = useState([
    { id: '1', name: 'VirusTotal', status: 'active', lastUpdate: '2 minutes ago', indicators: 12456 },
    { id: '2', name: 'AlienVault OTX', status: 'active', lastUpdate: '5 minutes ago', indicators: 8765 },
    { id: '3', name: 'MISP Feed', status: 'error', lastUpdate: '1 hour ago', indicators: 3421 },
    { id: '4', name: 'Internal Feed', status: 'active', lastUpdate: '1 minute ago', indicators: 567 }
  ]);

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('feed-management', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 180000
    });

    return () => evaluationController.remove();
  }, []);

  // Business logic operations
  const handleRefreshFeed = async (feedId: string) => {
    try {
      await businessLogic.execute('refresh-feed', { feedId });
      addNotification('info', 'Feed refresh initiated');
      // Update local state
      setFeeds(prev => prev.map(f => 
        f.id === feedId ? { ...f, status: 'active', lastUpdate: 'Just now' } : f
      ));
    } catch (error) {
      addNotification('error', 'Failed to refresh feed');
    }
  };

  const handleToggleFeed = async (feedId: string, enabled: boolean) => {
    try {
      await businessLogic.execute('toggle-feed', { feedId, enabled });
      addNotification('success', `Feed ${enabled ? 'enabled' : 'disabled'}`);
      setFeeds(prev => prev.map(f => 
        f.id === feedId ? { ...f, status: enabled ? 'active' : 'paused' } : f
      ));
    } catch (error) {
      addNotification('error', 'Failed to toggle feed');
    }
  };

  const handleBulkFeedOperation = async (operation: string) => {
    try {
      await businessLogic.execute('bulk-feed-operation', { operation }, 'medium');
      addNotification('info', `Bulk ${operation} initiated for all feeds`);
    } catch (error) {
      addNotification('error', `Failed to ${operation} feeds`);
    }
  };

  const handleRefreshAllFeeds = async () => {
    try {
      await refresh();
      await handleBulkFeedOperation('refresh');
      addNotification('success', 'All feeds refreshed');
    } catch (error) {
      addNotification('error', 'Failed to refresh all feeds');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🔄 Feed Management
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Monitor and configure threat intelligence feeds from multiple sources.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Threat Feeds
            </Typography>
            
            <List>
              {feeds.map((feed) => (
                <ListItem key={feed.id} divider>
                  <ListItemIcon>
                    {feed.status === 'active' ? (
                      <CheckCircle color="success" />
                    ) : feed.status === 'error' ? (
                      <ErrorIcon color="error" />
                    ) : (
                      <Schedule color="warning" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={feed.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {feed.indicators.toLocaleString()} indicators • Last update: {feed.lastUpdate}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={feed.status === 'active' ? 100 : feed.status === 'error' ? 0 : 50}
                          sx={{ mt: 1, height: 4, borderRadius: 2 }}
                          color={feed.status === 'active' ? 'success' : feed.status === 'error' ? 'error' : 'warning'}
                        />
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      size="small" 
                      label={feed.status} 
                      color={feed.status === 'active' ? 'success' : 'error'}
                    />
                    <Switch checked={feed.status === 'active'} />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Feed Statistics
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Total Active Feeds</Typography>
                <Typography variant="h4" color="primary">
                  {feeds.filter(f => f.status === 'active').length}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Total Indicators</Typography>
                <Typography variant="h4" color="success.main">
                  {feeds.reduce((sum, f) => sum + f.indicators, 0).toLocaleString()}
                </Typography>
              </Box>
              <Button variant="contained" fullWidth>
                Configure New Feed
              </Button>
            </CardContent>
          </Card>
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
