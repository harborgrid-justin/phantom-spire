/**
 * Sharing Audit Trail
 * Comprehensive audit logging and monitoring for information sharing activities
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
  Timeline, 
  Security, 
  Visibility, 
  Download,
  Search,
  FilterList,
  Assessment,
  Warning,
  CheckCircle,
  Schedule,
  Person,
  Business
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';
import { Status, Priority } from '../../../types/index';

export const SharingAuditTrail: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('sharing-audit-trail');

  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');

  const auditLogs = [
    {
      id: 'audit-001',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'analyst@org.com',
      action: 'SHARE_INTELLIGENCE',
      resource: 'APT29 Infrastructure Data',
      target: 'Financial Services ISAC',
      classification: 'TLP:AMBER',
      result: 'SUCCESS',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0'
    },
    {
      id: 'audit-002',
      timestamp: '2024-01-15T10:15:00Z',
      user: 'coordinator@partner.org',
      action: 'ACCESS_SHARED_DATA',
      resource: 'Banking Trojan IOCs',
      target: 'IOC Database',
      classification: 'TLP:GREEN',
      result: 'SUCCESS',
      ipAddress: '10.0.0.50',
      userAgent: 'Firefox/121.0'
    },
    {
      id: 'audit-003',
      timestamp: '2024-01-15T09:45:00Z',
      user: 'external@vendor.com',
      action: 'DOWNLOAD_REPORT',
      resource: 'Threat Analysis Report',
      target: 'Report Repository',
      classification: 'TLP:WHITE',
      result: 'DENIED',
      ipAddress: '203.0.113.15',
      userAgent: 'Chrome/119.0.0.0'
    }
  ];

  const complianceMetrics = {
    totalEvents: 12450,
    successfulActions: 11987,
    deniedActions: 463,
    complianceScore: 98.2,
    criticalEvents: 12,
    averageResponseTime: '0.8s'
  };

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('sharing-audit-trail', {
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

  const getResultColor = (result: string) => {
    switch (result) {
      case 'SUCCESS': return 'success';
      case 'DENIED': return 'error';
      case 'WARNING': return 'warning';
      default: return 'default';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'SHARE_INTELLIGENCE': return <Security />;
      case 'ACCESS_SHARED_DATA': return <Visibility />;
      case 'DOWNLOAD_REPORT': return <Download />;
      default: return <Assessment />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Timeline color="primary" />
        📋 Sharing Audit Trail
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Comprehensive audit logging and monitoring for all information sharing activities and compliance tracking.
      </Typography>

      {/* Compliance Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="primary">
                {(complianceMetrics.totalEvents / 1000).toFixed(1)}k
              </Typography>
              <Typography variant="caption">Total Events</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="success.main">
                {complianceMetrics.complianceScore}%
              </Typography>
              <Typography variant="caption">Compliance</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="error.main">
                {complianceMetrics.deniedActions}
              </Typography>
              <Typography variant="caption">Denied</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="warning.main">
                {complianceMetrics.criticalEvents}
              </Typography>
              <Typography variant="caption">Critical</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="info.main">
                {complianceMetrics.averageResponseTime}
              </Typography>
              <Typography variant="caption">Avg Response</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="secondary.main">
                24/7
              </Typography>
              <Typography variant="caption">Monitoring</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Audit Status:</strong> All systems monitored • Real-time logging active • {complianceMetrics.complianceScore}% compliance maintained
        </Typography>
      </Alert>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="Audit Logs" />
          <Tab label="Compliance Reports" />
          <Tab label="Security Events" />
          <Tab label="Analytics" />
        </Tabs>
      </Paper>

      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* Search and Filters */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search audit logs..."
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
                    <InputLabel>Action Type</InputLabel>
                    <Select
                      value={actionFilter}
                      label="Action Type"
                      onChange={(e) => setActionFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Actions</MenuItem>
                      <MenuItem value="SHARE_INTELLIGENCE">Share Intelligence</MenuItem>
                      <MenuItem value="ACCESS_SHARED_DATA">Access Data</MenuItem>
                      <MenuItem value="DOWNLOAD_REPORT">Download Report</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>User</InputLabel>
                    <Select
                      value={userFilter}
                      label="User"
                      onChange={(e) => setUserFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Users</MenuItem>
                      <MenuItem value="Internal">Internal Users</MenuItem>
                      <MenuItem value="Partner">Partner Users</MenuItem>
                      <MenuItem value="External">External Users</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Download />}
                  >
                    Export
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Audit Log Table */}
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Audit Events
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Resource</TableCell>
                      <TableCell>Target</TableCell>
                      <TableCell>Result</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person fontSize="small" />
                            <Typography variant="body2">{log.user}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getActionIcon(log.action)}
                            <Typography variant="body2">{log.action}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{log.resource}</Typography>
                          <Chip label={log.classification} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{log.target}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={log.result} 
                            color={getResultColor(log.result)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="outlined" size="small">
                            View
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
                Compliance Summary
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="GDPR Compliance"
                    secondary="All data sharing activities logged and compliant with GDPR requirements"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="SOX Compliance"
                    secondary="Financial data handling meets SOX audit requirements"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Access Control Review"
                    secondary="Quarterly access review due in 15 days"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Compliance Score</Typography>
                <Typography variant="h3" color="success.main">
                  {complianceMetrics.complianceScore}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Excellent Compliance
                </Typography>
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