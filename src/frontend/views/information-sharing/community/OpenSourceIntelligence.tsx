/**
 * Open Source Intelligence Integration
 * OSINT collection, analysis, and integration platform
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
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  Public, 
  Search, 
  Language, 
  TrendingUp,
  Assessment,
  Timeline,
  Security,
  Visibility,
  Link,
  Description
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';

export const OpenSourceIntelligence: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('osint-integration');

  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const osintSources = [
    {
      id: 'source-001',
      name: 'Have I Been Pwned',
      type: 'Breach Data',
      status: 'active',
      lastUpdate: '2024-01-15T10:30:00Z',
      reliability: 'high',
      coverage: 'Global',
      dataTypes: ['Email breaches', 'Password dumps']
    },
    {
      id: 'source-002',
      name: 'Shodan',
      type: 'Internet Scanning',
      status: 'active',
      lastUpdate: '2024-01-15T11:00:00Z',
      reliability: 'high',
      coverage: 'Global',
      dataTypes: ['Open ports', 'Services', 'Banners']
    },
    {
      id: 'source-003',
      name: 'Social Media Monitoring',
      type: 'Social Intelligence',
      status: 'active',
      lastUpdate: '2024-01-15T09:45:00Z',
      reliability: 'medium',
      coverage: 'Regional',
      dataTypes: ['Threat actor chatter', 'Leak notifications']
    }
  ];

  const recentFindings = [
    {
      id: 'finding-001',
      title: 'APT Group Infrastructure Exposed',
      source: 'Shodan',
      type: 'Infrastructure',
      confidence: 92,
      timestamp: '2024-01-15T10:30:00Z',
      description: 'C2 servers identified through banner analysis'
    },
    {
      id: 'finding-002',
      title: 'Data Breach Notification',
      source: 'Social Media Monitoring',
      type: 'Breach Intelligence',
      confidence: 78,
      timestamp: '2024-01-15T09:15:00Z',
      description: 'Threat actor advertising new database dump'
    }
  ];

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('osint-integration', {
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

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Public color="primary" />
        🌐 Open Source Intelligence
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        OSINT collection, analysis, and integration platform for public threat intelligence sources.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>OSINT Status:</strong> 47 active sources • 12,450 data points collected today • 156 actionable findings
        </Typography>
      </Alert>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="OSINT Sources" />
          <Tab label="Recent Findings" />
          <Tab label="Search & Query" />
          <Tab label="Analytics" />
        </Tabs>
      </Paper>

      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Active OSINT Sources
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Source</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Reliability</TableCell>
                      <TableCell>Coverage</TableCell>
                      <TableCell>Last Update</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {osintSources.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Language color="primary" />
                            <Typography variant="subtitle1">{source.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={source.type} variant="outlined" size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={source.status} color="success" size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={source.reliability} 
                            color={getReliabilityColor(source.reliability)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{source.coverage}</TableCell>
                        <TableCell>
                          {new Date(source.lastUpdate).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="outlined" size="small">
                            Configure
                          </Button>
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

      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent OSINT Findings
              </Typography>
              <List>
                {recentFindings.map((finding) => (
                  <ListItem key={finding.id} divider>
                    <ListItemIcon>
                      <Security color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{finding.title}</Typography>
                          <Chip label={finding.type} size="small" variant="outlined" />
                          <Chip label={`${finding.confidence}% confidence`} size="small" color="info" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {finding.description}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Source: {finding.source} • {new Date(finding.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <Button variant="outlined" size="small">
                      Investigate
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Today's Collection</Typography>
                <Typography variant="h4" color="primary">12,450</Typography>
                <Typography variant="body2" color="textSecondary">Data Points</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                OSINT Search & Query
              </Typography>
              <TextField
                fullWidth
                placeholder="Search across all OSINT sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" startIcon={<Search />} sx={{ mr: 1 }}>
                Search All Sources
              </Button>
              <Button variant="outlined" startIcon={<Assessment />}>
                Advanced Query
              </Button>
            </Paper>
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