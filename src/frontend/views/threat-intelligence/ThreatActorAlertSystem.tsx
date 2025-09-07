/**
 * Threat Actor Alert System Component
 * Real-time actor alerts and notifications
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Avatar,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';

import {
  Notifications,
  NotificationsActive,
  Warning,
  Error,
  Info,
  CheckCircle,
  Search,
  FilterList,
  Add,
  Edit,
  Delete,
  Refresh,
  Download,
  Share,
  ExpandMore,
  Schedule,
  Security,
  Computer,
  Language,
  LocationOn,
  TrendingUp,
  Analytics,
  Campaign,
  Assignment,
  Group,
  Public
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

// Interfaces
interface ThreatAlert {
  id: string;
  title: string;
  description: string;
  actorId: string;
  actorName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'new_campaign' | 'infrastructure_change' | 'technique_evolution' | 'attribution_update' | 'geolocation_change' | 'ioc_detected' | 'threat_level_change';
  status: 'active' | 'acknowledged' | 'resolved' | 'false_positive';
  timestamp: Date;
  source: 'automated' | 'analyst' | 'external_feed' | 'ml_detection';
  confidence: number;
  context: {
    affectedSystems?: string[];
    relatedIOCs?: string[];
    campaigns?: string[];
    techniques?: string[];
    geographicScope?: string[];
  };
  actions: Array<{
    id: string;
    type: 'investigate' | 'block' | 'monitor' | 'escalate' | 'notify';
    description: string;
    automated: boolean;
    completed: boolean;
    timestamp?: Date;
    performer?: string;
  }>;
  escalation: {
    level: number;
    escalatedTo?: string;
    escalatedAt?: Date;
    reason?: string;
  };
  notifications: Array<{
    channel: 'email' | 'sms' | 'slack' | 'teams' | 'webhook';
    recipient: string;
    sent: boolean;
    timestamp?: Date;
    error?: string;
  }>;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: {
    actorIds?: string[];
    severityThreshold: 'low' | 'medium' | 'high' | 'critical';
    categories: string[];
    keywords?: string[];
    confidenceThreshold: number;
  };
  actions: Array<{
    type: 'email' | 'sms' | 'slack' | 'block_ioc' | 'create_ticket';
    configuration: Record<string, any>;
    delay: number;
  }>;
  schedule: {
    enabled: boolean;
    timezone: string;
    workingHours: [number, number];
    weekdays: number[];
  };
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
}

interface AlertFilter {
  severity: string;
  category: string;
  status: string;
  actor: string;
  source: string;
  timeRange: string;
}

const ThreatActorAlertSystem: React.FC = () => {
  const theme = useTheme();
  
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('threat-intelligence-alerts');

  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<ThreatAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<AlertFilter>({
    severity: 'all',
    category: 'all',
    status: 'all',
    actor: 'all',
    source: 'all',
    timeRange: '24h'
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  const generateMockAlerts = useCallback((): ThreatAlert[] => {
    const alerts: ThreatAlert[] = [];
    const severities: ThreatAlert['severity'][] = ['critical', 'high', 'medium', 'low'];
    const categories: ThreatAlert['category'][] = [
      'new_campaign', 'infrastructure_change', 'technique_evolution', 
      'attribution_update', 'geolocation_change', 'ioc_detected', 'threat_level_change'
    ];
    const statuses: ThreatAlert['status'][] = ['active', 'acknowledged', 'resolved', 'false_positive'];
    const sources: ThreatAlert['source'][] = ['automated', 'analyst', 'external_feed', 'ml_detection'];

    for (let i = 1; i <= 50; i++) {
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      alerts.push({
        id: `alert-${i}`,
        title: `Threat Alert ${i}: ${category.replace('_', ' ').toUpperCase()}`,
        description: `Detailed description of threat alert ${i} related to ${category}`,
        actorId: `actor-${Math.floor(Math.random() * 15) + 1}`,
        actorName: `ThreatActor-${Math.floor(Math.random() * 15) + 1}`,
        severity,
        category,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        source: sources[Math.floor(Math.random() * sources.length)],
        confidence: Math.floor(Math.random() * 40) + 60,
        context: {
          affectedSystems: [`System-${i}A`, `System-${i}B`],
          relatedIOCs: [`ioc-${i}-1`, `ioc-${i}-2`],
          campaigns: [`Campaign-${Math.floor(Math.random() * 10) + 1}`],
          techniques: ['T1566', 'T1027', 'T1055'].slice(0, Math.floor(Math.random() * 3) + 1),
          geographicScope: ['North America', 'Europe'].slice(0, Math.floor(Math.random() * 2) + 1)
        },
        actions: [
          {
            id: `action-${i}-1`,
            type: 'investigate',
            description: 'Initial investigation started',
            automated: false,
            completed: Math.random() > 0.5,
            timestamp: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
            performer: 'analyst@company.com'
          },
          {
            id: `action-${i}-2`,
            type: 'block',
            description: 'Automatically blocked malicious IOCs',
            automated: true,
            completed: true,
            timestamp: new Date(Date.now() - Math.random() * 30 * 60 * 1000)
          }
        ],
        escalation: {
          level: Math.floor(Math.random() * 3),
          escalatedTo: Math.random() > 0.7 ? 'manager@company.com' : undefined,
          escalatedAt: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000) : undefined,
          reason: Math.random() > 0.7 ? 'High severity alert requiring management attention' : undefined
        },
        notifications: [
          {
            channel: 'email',
            recipient: 'soc-team@company.com',
            sent: true,
            timestamp: new Date(Date.now() - Math.random() * 10 * 60 * 1000)
          },
          {
            channel: 'slack',
            recipient: '#security-alerts',
            sent: Math.random() > 0.2,
            timestamp: Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 5 * 60 * 1000) : undefined,
            error: Math.random() > 0.8 ? 'Channel not found' : undefined
          }
        ]
      });
    }

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, []);

  const generateMockRules = useCallback((): AlertRule[] => {
    return [
      {
        id: 'rule-1',
        name: 'Critical Actor Activity',
        description: 'Alert on any activity from critical threat actors',
        enabled: true,
        conditions: {
          severityThreshold: 'high',
          categories: ['new_campaign', 'ioc_detected'],
          confidenceThreshold: 80
        },
        actions: [
          {
            type: 'email',
            configuration: { recipients: ['soc-lead@company.com'] },
            delay: 0
          },
          {
            type: 'slack',
            configuration: { channel: '#critical-alerts' },
            delay: 0
          }
        ],
        schedule: {
          enabled: true,
          timezone: 'UTC',
          workingHours: [8, 18],
          weekdays: [1, 2, 3, 4, 5]
        },
        createdBy: 'admin@company.com',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'rule-2',
        name: 'Infrastructure Changes',
        description: 'Monitor infrastructure changes for tracked actors',
        enabled: true,
        conditions: {
          severityThreshold: 'medium',
          categories: ['infrastructure_change'],
          confidenceThreshold: 70
        },
        actions: [
          {
            type: 'email',
            configuration: { recipients: ['analysts@company.com'] },
            delay: 300
          }
        ],
        schedule: {
          enabled: false,
          timezone: 'UTC',
          workingHours: [0, 24],
          weekdays: [1, 2, 3, 4, 5, 6, 7]
        },
        createdBy: 'analyst@company.com',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockAlerts = generateMockAlerts();
        const mockRules = generateMockRules();
        setAlerts(mockAlerts);
        setAlertRules(mockRules);
        addUIUXEvaluation('alert-system-loaded', 'success', {
          alertCount: mockAlerts.length,
          ruleCount: mockRules.length,
          loadTime: 1000
        });
      } catch (error) {
        console.error('Error loading alert data:', error);
        addNotification('error', 'Failed to load alert system data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockAlerts, generateMockRules, addNotification]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (searchTerm && !alert.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !alert.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !alert.actorName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filters.severity !== 'all' && alert.severity !== filters.severity) return false;
      if (filters.category !== 'all' && alert.category !== filters.category) return false;
      if (filters.status !== 'all' && alert.status !== filters.status) return false;
      if (filters.source !== 'all' && alert.source !== filters.source) return false;
      return true;
    });
  }, [alerts, searchTerm, filters]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'error';
      case 'acknowledged': return 'warning';
      case 'resolved': return 'success';
      case 'false_positive': return 'default';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'new_campaign': return <Campaign />;
      case 'infrastructure_change': return <Computer />;
      case 'technique_evolution': return <TrendingUp />;
      case 'attribution_update': return <Assignment />;
      case 'geolocation_change': return <LocationOn />;
      case 'ioc_detected': return <Security />;
      case 'threat_level_change': return <Warning />;
      default: return <Notifications />;
    }
  };

  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const criticalAlertsCount = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={activeAlertsCount} color="error" max={99}>
            <NotificationsActive color="primary" />
          </Badge>
          Threat Actor Alert System
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Real-time monitoring and alerting for threat actor activities
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="error">{activeAlertsCount}</Typography>
              <Typography variant="caption">Active Alerts</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning">{criticalAlertsCount}</Typography>
              <Typography variant="caption">Critical Alerts</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info">{alertRules.filter(r => r.enabled).length}</Typography>
              <Typography variant="caption">Active Rules</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={realTimeEnabled}
                    onChange={(e) => setRealTimeEnabled(e.target.checked)}
                    color="success"
                  />
                }
                label="Real-time"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search Alerts"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                label="Severity"
              >
                <MenuItem value="all">All Severities</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="new_campaign">New Campaign</MenuItem>
                <MenuItem value="infrastructure_change">Infrastructure</MenuItem>
                <MenuItem value="technique_evolution">Technique Evolution</MenuItem>
                <MenuItem value="ioc_detected">IOC Detected</MenuItem>
                <MenuItem value="threat_level_change">Threat Level</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="acknowledged">Acknowledged</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="false_positive">False Positive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  const newAlerts = generateMockAlerts();
                  setAlerts(newAlerts);
                  addNotification('success', 'Alerts refreshed');
                }}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<Add />}
              >
                New Rule
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '600px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Recent Alerts ({filteredAlerts.length})
              </Typography>
              <Box sx={{ height: '520px', overflow: 'auto' }}>
                <List dense>
                  {filteredAlerts.slice(0, 50).map(alert => (
                    <ListItem
                      key={alert.id}
                      button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setDetailsOpen(true);
                      }}
                      sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                    >
                      <ListItemIcon>
                        <Badge 
                          color={getSeverityColor(alert.severity)}
                          variant="dot"
                          invisible={alert.status !== 'active'}
                        >
                          {getCategoryIcon(alert.category)}
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                              {alert.title}
                            </Typography>
                            <Chip 
                              label={alert.severity} 
                              size="small" 
                              color={getSeverityColor(alert.severity)}
                            />
                            <Chip 
                              label={alert.status} 
                              size="small" 
                              color={getStatusColor(alert.status)}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {alert.actorName} • {alert.source} • {alert.confidence}% confidence
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {alert.timestamp.toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '600px' }}>
            <CardContent>
              <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
                <Tab label="Rules" />
                <Tab label="Stats" />
              </Tabs>

              {selectedTab === 0 && (
                <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Alert Rules ({alertRules.length})
                  </Typography>
                  {alertRules.map(rule => (
                    <Accordion key={rule.id}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Switch checked={rule.enabled} size="small" />
                          <Typography variant="body2">{rule.name}</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {rule.description}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Threshold: {rule.conditions.severityThreshold}+
                        </Typography>
                        <Typography variant="caption" display="block">
                          Actions: {rule.actions.length}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Created: {rule.createdAt.toLocaleDateString()}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}

              {selectedTab === 1 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Alert Statistics</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="error">
                          {alerts.filter(a => a.status === 'active').length}
                        </Typography>
                        <Typography variant="caption">Active</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="success">
                          {alerts.filter(a => a.status === 'resolved').length}
                        </Typography>
                        <Typography variant="caption">Resolved</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="caption" gutterBottom>Severity Distribution</Typography>
                      {['critical', 'high', 'medium', 'low'].map(severity => {
                        const count = alerts.filter(a => a.severity === severity).length;
                        const percentage = (count / alerts.length) * 100;
                        return (
                          <Box key={severity} sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                                {severity}
                              </Typography>
                              <Typography variant="caption">{count}</Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Alert Details</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  {getCategoryIcon(selectedAlert.category)}
                  <Typography variant="h6">{selectedAlert.title}</Typography>
                  <Chip 
                    label={selectedAlert.severity} 
                    color={getSeverityColor(selectedAlert.severity)}
                  />
                  <Chip 
                    label={selectedAlert.status} 
                    color={getStatusColor(selectedAlert.status)}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" paragraph>
                  {selectedAlert.description}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Alert Information</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Actor" secondary={selectedAlert.actorName} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Source" secondary={selectedAlert.source} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Confidence" secondary={`${selectedAlert.confidence}%`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Timestamp" secondary={selectedAlert.timestamp.toLocaleString()} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Context</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Affected Systems" 
                      secondary={selectedAlert.context.affectedSystems?.join(', ') || 'None'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Related IOCs" 
                      secondary={selectedAlert.context.relatedIOCs?.join(', ') || 'None'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Campaigns" 
                      secondary={selectedAlert.context.campaigns?.join(', ') || 'None'} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Geographic Scope" 
                      secondary={selectedAlert.context.geographicScope?.join(', ') || 'Unknown'} 
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Actions Taken</Typography>
                <List dense>
                  {selectedAlert.actions.map(action => (
                    <ListItem key={action.id}>
                      <ListItemIcon>
                        {action.completed ? <CheckCircle color="success" /> : <Schedule />}
                      </ListItemIcon>
                      <ListItemText
                        primary={action.description}
                        secondary={`${action.type} • ${action.automated ? 'Automated' : 'Manual'} • ${action.timestamp?.toLocaleString() || 'Pending'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained">Acknowledge</Button>
          <Button variant="outlined">Investigate</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThreatActorAlertSystem;