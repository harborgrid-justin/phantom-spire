/**
 * Community Contributions
 * Platform for user-generated threat intelligence content and community collaboration
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
  Rating,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  IconButton,
  Badge
} from '@mui/material';
import { 
  Groups, 
  Star, 
  TrendingUp, 
  ThumbUp,
  Comment,
  Share,
  Download,
  Upload,
  Verified,
  Schedule
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';

export const CommunityContributions: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('community-contributions');

  const [currentTab, setCurrentTab] = useState(0);

  const mockContributions = [
    {
      id: 'contrib-001',
      title: 'APT29 Infrastructure Analysis',
      contributor: 'SecResearcher01',
      type: 'Analysis',
      votes: 47,
      downloads: 1240,
      rating: 4.8,
      createdAt: '2024-01-14T10:00:00Z',
      verified: true
    },
    {
      id: 'contrib-002',
      title: 'Banking Trojan IOCs Q1 2024',
      contributor: 'ThreatHunter99',
      type: 'IOC Collection',
      votes: 32,
      downloads: 890,
      rating: 4.5,
      createdAt: '2024-01-13T14:30:00Z',
      verified: true
    }
  ];

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('community-contributions', {
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
        <Groups color="primary" />
        👥 Community Contributions
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        User-generated threat intelligence content with community voting, peer review, and collaboration features.
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Community Status:</strong> 1,247 contributions • 456 active contributors • 89 new submissions this week
        </Typography>
      </Alert>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="Recent Contributions" />
          <Tab label="Top Rated" />
          <Tab label="My Contributions" />
          <Tab label="Peer Reviews" />
        </Tabs>
      </Paper>

      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Latest Community Contributions
              </Typography>
              <List>
                {mockContributions.map((contribution) => (
                  <ListItem key={contribution.id} divider>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {contribution.contributor.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{contribution.title}</Typography>
                          <Chip label={contribution.type} size="small" variant="outlined" />
                          {contribution.verified && (
                            <Verified color="success" fontSize="small" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            by {contribution.contributor}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                            <Rating value={contribution.rating} precision={0.1} size="small" readOnly />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ThumbUp fontSize="small" />
                              <Typography variant="caption">{contribution.votes}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Download fontSize="small" />
                              <Typography variant="caption">{contribution.downloads}</Typography>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button variant="outlined" size="small">View</Button>
                      <IconButton size="small" color="primary">
                        <ThumbUp />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Contribute Content</Typography>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Upload />}
                  sx={{ mb: 1 }}
                >
                  Upload Analysis
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Share />}
                >
                  Share IOCs
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Community Stats</Typography>
                <Typography variant="h4" color="primary">1,247</Typography>
                <Typography variant="body2" color="textSecondary">Total Contributions</Typography>
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