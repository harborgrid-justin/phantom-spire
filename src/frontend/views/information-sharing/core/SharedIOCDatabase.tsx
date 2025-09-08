/**
 * Shared IOC Database
 * Cross-organizational IOC sharing and collaborative intelligence database
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Storage, 
  Security, 
  Search, 
  Share,
  Download,
  Upload,
  Verified,
  TrendingUp,
  FilterList
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';

export const SharedIOCDatabase: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('shared-ioc-database');

  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [iocType, setIocType] = useState('All');

  const mockIOCs = [
    {
      id: 'ioc-001',
      indicator: '192.168.1.100',
      type: 'IP',
      classification: 'TLP:GREEN',
      source: 'Financial ISAC',
      confidence: 95,
      lastSeen: '2024-01-15T10:30:00Z',
      tags: ['malware', 'c2'],
      sharedWith: 8
    },
    {
      id: 'ioc-002',
      indicator: 'evil-domain.com',
      type: 'Domain',
      classification: 'TLP:AMBER',
      source: 'US-CERT',
      confidence: 88,
      lastSeen: '2024-01-15T09:15:00Z',
      tags: ['phishing', 'banking'],
      sharedWith: 12
    }
  ];

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('shared-ioc-database', {
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
        <Storage color="primary" />
        🗄️ Shared IOC Database
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Cross-organizational IOC sharing and collaborative intelligence database with real-time updates.
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Database Status:</strong> 1.2M IOCs indexed • 47 contributing organizations • 99.9% uptime
        </Typography>
      </Alert>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="Search IOCs" />
          <Tab label="Recent Contributions" />
          <Tab label="Trending Indicators" />
          <Tab label="My Contributions" />
        </Tabs>
      </Paper>

      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search IOCs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>IOC Type</InputLabel>
                    <Select
                      value={iocType}
                      label="IOC Type"
                      onChange={(e) => setIocType(e.target.value)}
                    >
                      <MenuItem value="All">All Types</MenuItem>
                      <MenuItem value="IP">IP Address</MenuItem>
                      <MenuItem value="Domain">Domain</MenuItem>
                      <MenuItem value="URL">URL</MenuItem>
                      <MenuItem value="Hash">File Hash</MenuItem>
                      <MenuItem value="Email">Email</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Upload />}
                  >
                    Contribute IOCs
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Search Results
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Indicator</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Classification</TableCell>
                      <TableCell>Confidence</TableCell>
                      <TableCell>Last Seen</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockIOCs.map((ioc) => (
                      <TableRow key={ioc.id}>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {ioc.indicator}
                        </TableCell>
                        <TableCell>
                          <Chip label={ioc.type} variant="outlined" size="small" />
                        </TableCell>
                        <TableCell>{ioc.source}</TableCell>
                        <TableCell>
                          <Chip label={ioc.classification} size="small" />
                        </TableCell>
                        <TableCell>{ioc.confidence}%</TableCell>
                        <TableCell>
                          {new Date(ioc.lastSeen).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="outlined" startIcon={<Download />} size="small">
                            Export
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