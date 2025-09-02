/**
 * Threat Intelligence Repository
 * Knowledge base for threat intelligence data
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Storage, 
  Security, 
  Group, 
  Timeline, 
  Search,
  BookmarkBorder,
  TrendingUp
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

export const ThreatIntelRepository: React.FC = () => {
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
  } = useServicePage('repository');

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('threat-intel-repository', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 180000
    });

    return () => evaluationController.remove();
  }, []);

  // State for repository data
  const [threatActors, setThreatActors] = useState([
    { name: 'APT29 (Cozy Bear)', indicators: 1234, lastActivity: '2 days ago', severity: 'critical' },
    { name: 'Lazarus Group', indicators: 987, lastActivity: '1 week ago', severity: 'high' },
    { name: 'FIN7', indicators: 756, lastActivity: '3 days ago', severity: 'high' }
  ]);

  const [campaigns, setCampaigns] = useState([
    { name: 'Operation Ghost', indicators: 456, duration: '30 days', status: 'active' },
    { name: 'SolarWinds Supply Chain', indicators: 234, duration: '90 days', status: 'archived' },
    { name: 'Exchange Server Attacks', indicators: 678, duration: '45 days', status: 'monitoring' }
  ]);

  // Business logic operations
  const handleSearchRepository = async (query: string) => {
    try {
      await businessLogic.execute('search-repository', { query });
      addNotification('info', `Searching repository for: ${query}`);
    } catch (error) {
      addNotification('error', 'Repository search failed');
    }
  };

  const handleUpdateThreatActor = async (actorName: string) => {
    try {
      await businessLogic.execute('update-threat-actor', { actorName });
      addNotification('success', 'Threat actor data updated');
    } catch (error) {
      addNotification('error', 'Failed to update threat actor');
    }
  };

  const handleRefreshRepository = async () => {
    try {
      await refresh();
      addNotification('success', 'Repository data refreshed');
    } catch (error) {
      addNotification('error', 'Failed to refresh repository');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        📚 Threat Intelligence Repository
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Centralized knowledge base for threat intelligence research and analysis.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Threat Actors
              </Typography>
              <Button size="small" variant="outlined">
                View All
              </Button>
            </Box>
            
            <List>
              {threatActors.map((actor, index) => (
                <React.Fragment key={actor.name}>
                  <ListItem>
                    <ListItemIcon>
                      <Group />
                    </ListItemIcon>
                    <ListItemText
                      primary={actor.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {actor.indicators} indicators • Active {actor.lastActivity}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      size="small"
                      label={actor.severity}
                      color={actor.severity === 'critical' ? 'error' : 'warning'}
                    />
                  </ListItem>
                  {index < threatActors.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Active Campaigns
              </Typography>
              <Button size="small" variant="outlined">
                View All
              </Button>
            </Box>
            
            <List>
              {campaigns.map((campaign, index) => (
                <React.Fragment key={campaign.name}>
                  <ListItem>
                    <ListItemIcon>
                      <Timeline />
                    </ListItemIcon>
                    <ListItemText
                      primary={campaign.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {campaign.indicators} indicators • Duration: {campaign.duration}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      size="small"
                      label={campaign.status}
                      color={
                        campaign.status === 'active' ? 'success' :
                        campaign.status === 'monitoring' ? 'warning' : 'default'
                      }
                    />
                  </ListItem>
                  {index < campaigns.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Security sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary" fontWeight="bold">
                45,678
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Indicators
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Group sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                156
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Threat Actors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Timeline sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main" fontWeight="bold">
                89
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active Campaigns
              </Typography>
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
