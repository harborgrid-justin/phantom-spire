/**
 * Threat Intelligence Dashboard
 * Main command center for CTI operations - competing with Anomali
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Tooltip,
  useTheme,
  alpha,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Snackbar
} from '@mui/material';
import {
  Dashboard,
  Security,
  TrendingUp,
  TrendingDown,
  Warning,
  Error,
  CheckCircle,
  Info,
  Timeline,
  Public,
  Speed,
  BugReport,
  Visibility,
  Analytics,
  Refresh,
  FilterList,
  Download,
  Share,
  MoreVert
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';
import { ThreatSeverity, IOCType } from '../../types/common';

interface DashboardMetrics {
  totalIOCs: number;
  activeThreats: number;
  resolvedIncidents: number;
  threatLevel: ThreatSeverity;
  feedsOperational: number;
  totalFeeds: number;
  securityScore: number;
  lastUpdate: Date;
}

interface ThreatTrendData {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

interface IOCTypeData {
  type: IOCType;
  count: number;
  trend: number;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'ioc' | 'incident' | 'alert' | 'investigation';
  title: string;
  description: string;
  severity: ThreatSeverity;
  timestamp: Date;
  user: string;
}

interface TopThreatActor {
  id: string;
  name: string;
  aliases: string[];
  associatedIOCs: number;
  lastActivity: Date;
  severity: ThreatSeverity;
  targetSectors: string[];
}

interface CampaignActivity {
  id: string;
  name: string;
  description: string;
  indicators: number;
  firstSeen: Date;
  lastSeen: Date;
  countries: string[];
  severity: ThreatSeverity;
}

export const ThreatIntelligenceDashboard: React.FC = () => {
  const theme = useTheme();
  
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
  } = useServicePage('dashboard');
  
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [threatTrends, setThreatTrends] = useState<ThreatTrendData[]>([]);
  const [iocTypes, setIOCTypes] = useState<IOCTypeData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topActors, setTopActors] = useState<TopThreatActor[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('threat-intelligence-dashboard', {
      continuous: true,
      position: 'bottom-right',
      minimized: true,
      interval: 90000 // 90 seconds for main dashboard
    });

    return () => evaluationController.remove();
  }, []);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls - in production these would be real endpoints
      await Promise.all([
        loadMetrics(),
        loadThreatTrends(),
        loadIOCTypes(),
        loadRecentActivity(),
        loadTopActors(),
        loadCampaigns()
      ]);
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async (): Promise<void> => {
    // Mock metrics data
    await new Promise(resolve => setTimeout(resolve, 500));
    setMetrics({
      totalIOCs: 45678,
      activeThreats: 23,
      resolvedIncidents: 156,
      threatLevel: 'medium',
      feedsOperational: 12,
      totalFeeds: 15,
      securityScore: 87,
      lastUpdate: new Date()
    });
  };

  const loadThreatTrends = async (): Promise<void> => {
    // Mock trend data for last 30 days
    const trends: ThreatTrendData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        critical: Math.floor(Math.random() * 5) + 1,
        high: Math.floor(Math.random() * 15) + 5,
        medium: Math.floor(Math.random() * 30) + 15,
        low: Math.floor(Math.random() * 50) + 25,
        total: 0
      });
    }
    
    // Calculate totals
    trends.forEach(trend => {
      trend.total = trend.critical + trend.high + trend.medium + trend.low;
    });
    
    setThreatTrends(trends);
  };

  const loadIOCTypes = async (): Promise<void> => {
    const types: IOCTypeData[] = [
      { type: 'ip', count: 15234, trend: 5.2, color: '#1976d2' },
      { type: 'domain', count: 8765, trend: -2.1, color: '#388e3c' },
      { type: 'url', count: 12456, trend: 8.7, color: '#f57c00' },
      { type: 'hash_sha256', count: 6543, trend: 3.4, color: '#7b1fa2' },
      { type: 'email', count: 3210, trend: -1.5, color: '#d32f2f' },
      { type: 'file_name', count: 2107, trend: 12.3, color: '#0288d1' }
    ];
    
    setIOCTypes(types);
  };

  const loadRecentActivity = async (): Promise<void> => {
    const activities: RecentActivity[] = [
      {
        id: '1',
        type: 'alert',
        title: 'High-severity IOC detected',
        description: 'Malicious IP 192.168.1.100 detected in network traffic',
        severity: 'high',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        user: 'Security Analyst'
      },
      {
        id: '2',
        type: 'incident',
        title: 'New incident created',
        description: 'INC-2024-0045: Suspected APT activity',
        severity: 'critical',
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        user: 'John Smith'
      },
      {
        id: '3',
        type: 'ioc',
        title: 'IOC enrichment completed',
        description: 'Domain analysis for malicious-site.com completed',
        severity: 'medium',
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        user: 'Enrichment Engine'
      },
      {
        id: '4',
        type: 'investigation',
        title: 'Investigation updated',
        description: 'Added 3 new indicators to Campaign Lazarus',
        severity: 'medium',
        timestamp: new Date(Date.now() - 1200000), // 20 minutes ago
        user: 'Threat Researcher'
      }
    ];
    
    setRecentActivity(activities);
  };

  const loadTopActors = async (): Promise<void> => {
    const actors: TopThreatActor[] = [
      {
        id: '1',
        name: 'Lazarus Group',
        aliases: ['APT38', 'Hidden Cobra'],
        associatedIOCs: 1234,
        lastActivity: new Date(Date.now() - 86400000), // 1 day ago
        severity: 'critical',
        targetSectors: ['Financial', 'Government', 'Cryptocurrency']
      },
      {
        id: '2',
        name: 'APT29',
        aliases: ['Cozy Bear', 'The Dukes'],
        associatedIOCs: 987,
        lastActivity: new Date(Date.now() - 172800000), // 2 days ago
        severity: 'high',
        targetSectors: ['Government', 'Healthcare', 'Energy']
      },
      {
        id: '3',
        name: 'FIN7',
        aliases: ['Carbanak Group'],
        associatedIOCs: 756,
        lastActivity: new Date(Date.now() - 259200000), // 3 days ago
        severity: 'high',
        targetSectors: ['Retail', 'Hospitality', 'Financial']
      }
    ];
    
    setTopActors(actors);
  };

  const loadCampaigns = async (): Promise<void> => {
    const campaignData: CampaignActivity[] = [
      {
        id: '1',
        name: 'Operation Sharpshooter',
        description: 'Targeted attacks against defense contractors',
        indicators: 156,
        firstSeen: new Date(Date.now() - 2592000000), // 30 days ago
        lastSeen: new Date(Date.now() - 86400000), // 1 day ago
        countries: ['US', 'GB', 'DE', 'FR'],
        severity: 'high'
      },
      {
        id: '2',
        name: 'CloudHopper Campaign',
        description: 'Supply chain attacks via MSPs',
        indicators: 89,
        firstSeen: new Date(Date.now() - 5184000000), // 60 days ago
        lastSeen: new Date(Date.now() - 172800000), // 2 days ago
        countries: ['JP', 'KR', 'SG', 'AU'],
        severity: 'critical'
      }
    ];
    
    setCampaigns(campaignData);
  };

  // Business logic operations
  const handleGenerateThreatReport = async () => {
    try {
      await businessLogic.execute('generate-threat-report', {
        timeRange: '24h',
        includeIOCs: true,
        includeActors: true
      });
      addNotification('success', 'Threat report generation started');
    } catch (error) {
      addNotification('error', 'Failed to generate threat report');
    }
  };

  const handleRefreshThreatFeeds = async () => {
    try {
      await businessLogic.execute('refresh-threat-feeds', {}, 'high');
      addNotification('info', 'Threat feed refresh initiated');
      await loadDashboardData();
    } catch (error) {
      addNotification('error', 'Failed to refresh threat feeds');
    }
  };

  const handleEmergencyThreatResponse = async (threatId: string) => {
    try {
      await businessLogic.execute('emergency-threat-response', { threatId }, 'critical');
      addNotification('warning', 'Emergency threat response protocol activated');
    } catch (error) {
      addNotification('error', 'Failed to activate emergency response');
    }
  };

  const handleDashboardRefresh = async () => {
    try {
      await refresh();
      await loadDashboardData();
      addNotification('success', 'Dashboard refreshed successfully');
    } catch (error) {
      addNotification('error', 'Failed to refresh dashboard');
    }
  };

  // Color configuration for severity levels
  const severityColors = {
    critical: theme.palette.error.main,
    high: theme.palette.warning.main,
    medium: theme.palette.info.main,
    low: theme.palette.success.main,
    informational: theme.palette.grey[500]
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading && !metrics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Loading Threat Intelligence Dashboard</Typography>
          <LinearProgress sx={{ width: 300, mb: 2 }} />
          <Typography variant="body2" color="textSecondary">
            Aggregating threat data from multiple sources...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '100%', overflow: 'auto' }}>
      {/* Dashboard Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🛡️ Threat Intelligence Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Real-time threat landscape overview • Last updated: {lastRefresh.toLocaleTimeString()}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Auto-refresh enabled">
            <Chip
              icon={<Refresh />}
              label={autoRefresh ? 'Auto Refresh' : 'Manual'}
              color={autoRefresh ? 'success' : 'default'}
              onClick={() => setAutoRefresh(!autoRefresh)}
            />
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleDashboardRefresh}
            disabled={loading || !isFullyLoaded}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {metrics ? formatNumber(metrics.totalIOCs) : '—'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total IOCs
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <Security color="primary" />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp color="success" sx={{ mr: 0.5, fontSize: 16 }} />
                <Typography variant="caption" color="success.main">
                  +12.3% from last week
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="error">
                    {metrics?.activeThreats || '—'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Threats
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                  <Warning color="error" />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingDown color="success" sx={{ mr: 0.5, fontSize: 16 }} />
                <Typography variant="caption" color="success.main">
                  -5.2% from yesterday
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success">
                    {metrics?.resolvedIncidents || '—'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Resolved Incidents
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                  <CheckCircle color="success" />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  {metrics ? `${metrics.feedsOperational}/${metrics.totalFeeds} feeds operational` : '—'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="info">
                    {metrics?.securityScore || '—'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Security Score
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                  <Speed color="info" />
                </Avatar>
              </Box>
              <LinearProgress
                variant="determinate"
                value={metrics?.securityScore || 0}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
                color="info"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Threat Level Alert */}
      {metrics?.threatLevel && (
        <Alert
          severity={
            metrics.threatLevel === 'critical' || metrics.threatLevel === 'high'
              ? 'error'
              : metrics.threatLevel === 'medium'
              ? 'warning'
              : 'info'
          }
          sx={{ mb: 3 }}
          action={
            <Button size="small" variant="outlined">
              View Details
            </Button>
          }
        >
          <Typography variant="subtitle2" fontWeight="bold">
            Current Threat Level: {metrics.threatLevel.toUpperCase()}
          </Typography>
          <Typography variant="body2">
            {metrics.threatLevel === 'high' && 'Elevated threat activity detected. Enhanced monitoring is active.'}
            {metrics.threatLevel === 'medium' && 'Normal threat activity levels. Continue standard monitoring procedures.'}
            {metrics.threatLevel === 'low' && 'Low threat activity. All systems operating normally.'}
            {metrics.threatLevel === 'critical' && 'Critical threat level reached. Immediate action required.'}
          </Typography>
        </Alert>
      )}

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Threat Trends */}
        <Grid item xs={12} lg={8}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  📈 Threat Activity Trends (30 Days)
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={threatTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <Area
                      type="monotone"
                      dataKey="critical"
                      stackId="1"
                      stroke={severityColors.critical}
                      fill={severityColors.critical}
                    />
                    <Area
                      type="monotone"
                      dataKey="high"
                      stackId="1"
                      stroke={severityColors.high}
                      fill={severityColors.high}
                    />
                    <Area
                      type="monotone"
                      dataKey="medium"
                      stackId="1"
                      stroke={severityColors.medium}
                      fill={severityColors.medium}
                    />
                    <Area
                      type="monotone"
                      dataKey="low"
                      stackId="1"
                      stroke={severityColors.low}
                      fill={severityColors.low}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* IOC Distribution */}
        <Grid item xs={12} lg={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🎯 IOC Type Distribution
              </Typography>
              
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={iocTypes}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                    >
                      {iocTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                {iocTypes.slice(0, 4).map((type) => (
                  <Box key={type.type} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: type.color,
                        mr: 1
                      }}
                    />
                    <Typography variant="caption" sx={{ flex: 1 }}>
                      {type.type.toUpperCase()}
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {formatNumber(type.count)}
                    </Typography>
                    <Box sx={{ ml: 1 }}>
                      {type.trend > 0 ? (
                        <TrendingUp color="success" sx={{ fontSize: 14 }} />
                      ) : (
                        <TrendingDown color="error" sx={{ fontSize: 14 }} />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row - Activity & Intelligence */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} lg={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  🔄 Recent Activity
                </Typography>
                <Button size="small" variant="text">
                  View All
                </Button>
              </Box>
              
              <List dense>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem
                      sx={{
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05)
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: alpha(severityColors[activity.severity], 0.1)
                          }}
                        >
                          {activity.type === 'alert' && <Warning sx={{ fontSize: 16, color: severityColors[activity.severity] }} />}
                          {activity.type === 'incident' && <BugReport sx={{ fontSize: 16, color: severityColors[activity.severity] }} />}
                          {activity.type === 'ioc' && <Security sx={{ fontSize: 16, color: severityColors[activity.severity] }} />}
                          {activity.type === 'investigation' && <Visibility sx={{ fontSize: 16, color: severityColors[activity.severity] }} />}
                        </Avatar>
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {activity.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip
                                size="small"
                                label={activity.severity}
                                color={
                                  activity.severity === 'critical' || activity.severity === 'high'
                                    ? 'error'
                                    : activity.severity === 'medium'
                                    ? 'warning'
                                    : 'success'
                                }
                              />
                              <Typography variant="caption" color="textSecondary">
                                {getTimeAgo(activity.timestamp)} • {activity.user}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Threat Actors & Campaigns */}
        <Grid item xs={12} lg={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🎭 Active Threat Actors & Campaigns
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Top Threat Actors
                </Typography>
                {topActors.slice(0, 2).map((actor) => (
                  <Box key={actor.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {actor.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {actor.aliases.join(', ')}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={actor.severity}
                        color={actor.severity === 'critical' ? 'error' : 'warning'}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {formatNumber(actor.associatedIOCs)} IOCs • Active {getTimeAgo(actor.lastActivity)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {actor.targetSectors.slice(0, 3).map((sector) => (
                        <Chip key={sector} size="small" label={sector} variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Active Campaigns
                </Typography>
                {campaigns.map((campaign) => (
                  <Box key={campaign.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {campaign.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {campaign.description}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={campaign.severity}
                        color={campaign.severity === 'critical' ? 'error' : 'warning'}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {campaign.indicators} indicators • Last seen {getTimeAgo(campaign.lastSeen)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {campaign.countries.map((country) => (
                        <Chip key={country} size="small" label={country} variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
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
