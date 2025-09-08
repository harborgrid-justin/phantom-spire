/**
 * Collaborative Analysis Workbench
 * Joint analysis platform for multi-organization threat research
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
  Avatar,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  TextField,
  IconButton,
  Divider,
  Badge
} from '@mui/material';
import { 
  Science, 
  Groups, 
  Assignment, 
  Share,
  Comment,
  Timeline,
  Assessment,
  Storage,
  Visibility,
  Edit,
  Download
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';

export const CollaborativeAnalysisWorkbench: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('collaborative-analysis');

  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('collaborative-analysis', {
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
        <Science color="primary" />
        🔬 Collaborative Analysis Workbench
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Joint analysis platform for multi-organization threat research and collaborative intelligence development.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Active Collaborations:</strong> 12 research projects • 47 analysts online • 156 shared artifacts
        </Typography>
      </Alert>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="Active Projects" />
          <Tab label="Shared Artifacts" />
          <Tab label="Analysis Tools" />
          <Tab label="Research Teams" />
        </Tabs>
      </Paper>

      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Collaborative Research Projects
              </Typography>
              <List>
                <ListItem divider>
                  <ListItemIcon>
                    <Assignment color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="APT29 Attribution Analysis"
                    secondary="Multi-org research into APT29 infrastructure and TTPs • 8 organizations • 15 analysts"
                  />
                  <Button variant="outlined" size="small">Join Analysis</Button>
                </ListItem>
                <ListItem divider>
                  <ListItemIcon>
                    <Assessment color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Banking Trojan Family Tree"
                    secondary="Collaborative malware family analysis • 5 organizations • 12 analysts"
                  />
                  <Button variant="outlined" size="small">View Progress</Button>
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Analysis Statistics</Typography>
                <Typography variant="h4" color="primary">47</Typography>
                <Typography variant="body2" color="textSecondary">Analysts Online</Typography>
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