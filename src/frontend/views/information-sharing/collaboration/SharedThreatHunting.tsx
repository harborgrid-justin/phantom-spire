/**
 * Shared Threat Hunting
 * Multi-organization collaborative threat hunting platform
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
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Avatar,
  LinearProgress
} from '@mui/material';
import { 
  Search, 
  Groups, 
  Timeline, 
  Share,
  Assignment,
  TrendingUp,
  Security
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';
import { Status, Priority } from '../../../types/index';

export const SharedThreatHunting: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('shared-threat-hunting');

  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('shared-threat-hunting', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 180000
    });

    return () => evaluationController.remove();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Search color="primary" />
        🎯 Shared Threat Hunting
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Multi-organization collaborative threat hunting with shared queries, indicators, and hunting teams.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Hunting Status:</strong> 8 active hunts • 23 participating organizations • 156 shared queries
        </Typography>
      </Alert>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="Active Hunts" />
          <Tab label="Shared Queries" />
          <Tab label="Hunt Results" />
          <Tab label="Hunting Teams" />
        </Tabs>
      </Paper>

      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Collaborative Hunting Campaigns
              </Typography>
              <List>
                <ListItem divider>
                  <ListItemIcon>
                    <Assignment color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Operation Silent Dragon"
                    secondary="Multi-org hunt for APT activity in financial sector • 12 organizations • 45% complete"
                  />
                  <LinearProgress variant="determinate" value={45} sx={{ width: 100, mr: 2 }} />
                  <Button variant="outlined" size="small">Join Hunt</Button>
                </ListItem>
                <ListItem divider>
                  <ListItemIcon>
                    <Security color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Supply Chain Compromise Hunt"
                    secondary="Hunting for supply chain indicators • 8 organizations • 67% complete"
                  />
                  <LinearProgress variant="determinate" value={67} sx={{ width: 100, mr: 2 }} />
                  <Button variant="outlined" size="small">View Results</Button>
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Hunt Statistics</Typography>
                <Typography variant="h4" color="primary">8</Typography>
                <Typography variant="body2" color="textSecondary">Active Hunts</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

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