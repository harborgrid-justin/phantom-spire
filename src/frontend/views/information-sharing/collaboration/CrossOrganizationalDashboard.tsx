/**
 * Cross-Organizational Dashboard
 * Multi-organization visibility and coordination dashboard
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
  LinearProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge
} from '@mui/material';
import { 
  Dashboard, 
  Business, 
  Security, 
  TrendingUp,
  Groups,
  Share,
  Warning,
  CheckCircle,
  Schedule,
  Assessment,
  Notifications,
  Message,
  Sync,
  Visibility,
  Public
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';
import { Status, Priority } from '../../../types/index';

interface Organization {
  id: string;
  name: string;
  type: 'Government' | 'Commercial' | 'ISAC' | 'Academic';
  status: 'active' | 'inactive' | 'restricted';
  lastActivity: string;
  sharedThreats: number;
  receivedThreats: number;
  trustScore: number;
  region: string;
}

interface ThreatAlert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'IOC' | 'Campaign' | 'Vulnerability' | 'Actor';
  source: string;
  targetOrgs: string[];
  timestamp: string;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved';
  confidence: number;
}

interface CollaborationMetrics {
  totalOrganizations: number;
  activeCollaborations: number;
  threatsSharedToday: number;
  avgResponseTime: string;
  networkTrustScore: number;
  alertsThisWeek: number;
}

export const CrossOrganizationalDashboard: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('cross-org-dashboard');

  const [currentTab, setCurrentTab] = useState(0);

  const [metrics, setMetrics] = useState<CollaborationMetrics>({
    totalOrganizations: 47,
    activeCollaborations: 23,
    threatsSharedToday: 156,
    avgResponseTime: '14 minutes',
    networkTrustScore: 87.5,
    alertsThisWeek: 89
  });

  const [organizations, setOrganizations] = useState<Organization[]>([
    {
      id: 'org-001',
      name: 'Financial Services ISAC',
      type: 'ISAC',
      status: 'active',
      lastActivity: '2024-01-15T10:30:00Z',
      sharedThreats: 1247,
      receivedThreats: 892,
      trustScore: 95,
      region: 'North America'
    },
    {
      id: 'org-002',
      name: 'National Cyber Security Centre',
      type: 'Government',
      status: 'active',
      lastActivity: '2024-01-15T09:15:00Z',
      sharedThreats: 2156,
      receivedThreats: 1340,
      trustScore: 98,
      region: 'Europe'
    },
    {
      id: 'org-003',
      name: 'Global Bank Security Team',
      type: 'Commercial',
      status: 'active',
      lastActivity: '2024-01-15T08:45:00Z',
      sharedThreats: 567,
      receivedThreats: 1890,
      trustScore: 87,
      region: 'Asia Pacific'
    },
    {
      id: 'org-004',
      name: 'Energy Sector Consortium',
      type: 'ISAC',
      status: 'restricted',
      lastActivity: '2024-01-14T16:20:00Z',
      sharedThreats: 234,
      receivedThreats: 456,
      trustScore: 72,
      region: 'North America'
    }
  ]);

  const [recentAlerts, setRecentAlerts] = useState<ThreatAlert[]>([
    {
      id: 'alert-001',
      title: 'APT29 Infrastructure Detected in Banking Sector',
      severity: 'critical',
      type: 'Campaign',
      source: 'Financial Services ISAC',
      targetOrgs: ['Global Bank Security Team', 'Regional Credit Union'],
      timestamp: '2024-01-15T10:30:00Z',
      status: 'investigating',
      confidence: 95
    },
    {
      id: 'alert-002',
      title: 'Critical Zero-Day Vulnerability CVE-2024-0001',
      severity: 'critical',
      type: 'Vulnerability',
      source: 'National Cyber Security Centre',
      targetOrgs: ['All Organizations'],
      timestamp: '2024-01-15T09:15:00Z',
      status: 'acknowledged',
      confidence: 98
    },
    {
      id: 'alert-003',
      title: 'Suspicious Domain Activity',
      severity: 'medium',
      type: 'IOC',
      source: 'Energy Sector Consortium',
      targetOrgs: ['Industrial Control Systems Group'],
      timestamp: '2024-01-15T08:45:00Z',
      status: 'new',
      confidence: 78
    }
  ]);

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('cross-org-dashboard', {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'restricted': return 'warning';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'error';
      case 'acknowledged': return 'warning';
      case 'investigating': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Dashboard color="primary" />
        🌐 Cross-Organizational Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Real-time visibility into multi-organization threat intelligence sharing and collaboration activities.
      </Typography>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Business sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {metrics.totalOrganizations}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Connected Organizations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Groups sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {metrics.activeCollaborations}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active Collaborations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Share sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {metrics.threatsSharedToday}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Threats Shared Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {metrics.avgResponseTime}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Avg Response Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Security sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" color="secondary.main">
                {metrics.networkTrustScore}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Network Trust Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Warning sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" color="error.main">
                {metrics.alertsThisWeek}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Alerts This Week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="Network Overview" />
          <Tab label="Active Alerts" />
          <Tab label="Organization Status" />
          <Tab label="Collaboration Metrics" />
        </Tabs>
      </Paper>

      {/* Network Overview Tab */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Network Activity
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Share color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Financial Services ISAC shared APT29 infrastructure data"
                    secondary="12 minutes ago • Received by 8 organizations"
                  />
                  <Chip label="High Priority" color="warning" size="small" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Zero-day vulnerability alert acknowledged by all organizations"
                    secondary="25 minutes ago • 100% acknowledgment rate"
                  />
                  <Chip label="Critical" color="error" size="small" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Groups color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="New collaboration initiated: Banking Trojan Defense"
                    secondary="1 hour ago • 5 organizations participating"
                  />
                  <Chip label="Collaboration" color="info" size="small" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Network trust score increased to 87.5%"
                    secondary="2 hours ago • +2.3% improvement"
                  />
                  <Chip label="Network Health" color="success" size="small" />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Network Health
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Overall Network Trust
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.networkTrustScore} 
                    sx={{ height: 8, borderRadius: 4, mt: 1 }}
                    color="success"
                  />
                  <Typography variant="caption" color="textSecondary">
                    {metrics.networkTrustScore}% - Excellent
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Active Participation
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={78} 
                    sx={{ height: 8, borderRadius: 4, mt: 1 }}
                    color="info"
                  />
                  <Typography variant="caption" color="textSecondary">
                    78% - Good
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Response Quality
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={91} 
                    sx={{ height: 8, borderRadius: 4, mt: 1 }}
                    color="success"
                  />
                  <Typography variant="caption" color="textSecondary">
                    91% - Excellent
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Alert severity="info">
              <Typography variant="body2">
                <strong>Network Status:</strong> All systems operational. High collaboration activity detected.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      )}

      {/* Active Alerts Tab */}
      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Active Cross-Organizational Alerts
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Alert</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Target Organizations</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Confidence</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">{alert.title}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip 
                                label={alert.severity} 
                                color={getSeverityColor(alert.severity)}
                                size="small"
                              />
                              <Typography variant="caption" color="textSecondary">
                                {new Date(alert.timestamp).toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={alert.type} variant="outlined" size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{alert.source}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {alert.targetOrgs.length > 2 
                              ? `${alert.targetOrgs.slice(0, 2).join(', ')} +${alert.targetOrgs.length - 2} more`
                              : alert.targetOrgs.join(', ')
                            }
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={alert.status} 
                            color={getAlertStatusColor(alert.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{alert.confidence}%</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" color="primary">
                              <Visibility />
                            </IconButton>
                            <IconButton size="small" color="info">
                              <Message />
                            </IconButton>
                          </Box>
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

      {/* Organization Status Tab */}
      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Partner Organization Status
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Organization</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Shared</TableCell>
                      <TableCell>Received</TableCell>
                      <TableCell>Trust Score</TableCell>
                      <TableCell>Last Activity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                              {org.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">{org.name}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {org.region}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={org.type} variant="outlined" size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={org.status} 
                            color={getStatusColor(org.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{org.sharedThreats.toLocaleString()}</TableCell>
                        <TableCell>{org.receivedThreats.toLocaleString()}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={org.trustScore} 
                              sx={{ width: 60, height: 4 }}
                              color={org.trustScore > 90 ? 'success' : org.trustScore > 70 ? 'warning' : 'error'}
                            />
                            <Typography variant="body2">{org.trustScore}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {new Date(org.lastActivity).toLocaleString()}
                          </Typography>
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