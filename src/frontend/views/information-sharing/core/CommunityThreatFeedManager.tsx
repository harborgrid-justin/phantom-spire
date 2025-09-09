/**
 * Community Threat Feed Manager
 * Platform for managing community-driven threat intelligence feeds
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
  Switch,
  LinearProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Divider
} from '@mui/material';
import { 
  RssFeed as Rss, 
  CloudDownload, 
  Security, 
  Groups,
  Add,
  Search,
  Star,
  TrendingUp,
  CheckCircle,
  Warning,  Error as ErrorIcon,
  Info,
  Refresh,
  FilterList,
  Share
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';

interface ThreatFeed {
  id: string;
  name: string;
  provider: string;
  type: 'IOC' | 'Malware' | 'Network' | 'Behavioral' | 'Mixed';
  format: 'JSON' | 'XML' | 'CSV' | 'STIX' | 'MISP';
  updateFrequency: 'Real-time' | 'Hourly' | 'Daily' | 'Weekly';
  status: 'active' | 'inactive' | 'error' | 'pending';
  subscribers: number;
  rating: number;
  lastUpdate: string;
  description: string;
  isFree: boolean;
  isVerified: boolean;
  tags: string[];
}

interface CommunityContribution {
  id: string;
  contributor: string;
  title: string;
  type: 'Feed' | 'Analysis' | 'IOC' | 'Report';
  status: 'published' | 'pending' | 'reviewed';
  votes: number;
  downloads: number;
  createdAt: string;
}

export const CommunityThreatFeedManager: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('community-feeds');

  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const [threatFeeds, setThreatFeeds] = useState<ThreatFeed[]>([
    {
      id: 'feed-001',
      name: 'Open Threat Exchange',
      provider: 'AlienVault Community',
      type: 'Mixed',
      format: 'JSON',
      updateFrequency: 'Real-time',
      status: 'active',
      subscribers: 15420,
      rating: 4.7,
      lastUpdate: '2024-01-15T10:30:00Z',
      description: 'Community-driven threat intelligence from security researchers worldwide',
      isFree: true,
      isVerified: true,
      tags: ['community', 'mixed', 'realtime']
    },
    {
      id: 'feed-002',
      name: 'Malware Domain List',
      provider: 'MDL Community',
      type: 'Network',
      format: 'CSV',
      updateFrequency: 'Daily',
      status: 'active',
      subscribers: 8900,
      rating: 4.3,
      lastUpdate: '2024-01-15T08:00:00Z',
      description: 'List of domains hosting malware and malicious content',
      isFree: true,
      isVerified: true,
      tags: ['domains', 'malware', 'network']
    },
    {
      id: 'feed-003',
      name: 'Emerging Threats Rules',
      provider: 'Proofpoint Community',
      type: 'Network',
      format: 'STIX',
      updateFrequency: 'Hourly',
      status: 'active',
      subscribers: 12340,
      rating: 4.8,
      lastUpdate: '2024-01-15T11:00:00Z',
      description: 'Network intrusion detection rules for emerging threats',
      isFree: false,
      isVerified: true,
      tags: ['rules', 'ids', 'network']
    },
    {
      id: 'feed-004',
      name: 'IOC Database',
      provider: 'Security Research Collective',
      type: 'IOC',
      format: 'JSON',
      updateFrequency: 'Real-time',
      status: 'error',
      subscribers: 5670,
      rating: 4.1,
      lastUpdate: '2024-01-14T16:30:00Z',
      description: 'Comprehensive IOC database from multiple security vendors',
      isFree: true,
      isVerified: false,
      tags: ['ioc', 'indicators', 'multi-vendor']
    }
  ]);

  const [contributions, setContributions] = useState<CommunityContribution[]>([
    {
      id: 'contrib-001',
      contributor: 'SecResearcher01',
      title: 'APT29 Infrastructure Analysis',
      type: 'Analysis',
      status: 'published',
      votes: 47,
      downloads: 1240,
      createdAt: '2024-01-14T10:00:00Z'
    },
    {
      id: 'contrib-002',
      contributor: 'ThreatHunter99',
      title: 'Banking Trojan IOCs Q1 2024',
      type: 'IOC',
      status: 'published',
      votes: 32,
      downloads: 890,
      createdAt: '2024-01-13T14:30:00Z'
    },
    {
      id: 'contrib-003',
      contributor: 'CyberAnalyst2024',
      title: 'Emerging Ransomware Variants Feed',
      type: 'Feed',
      status: 'pending',
      votes: 18,
      downloads: 0,
      createdAt: '2024-01-15T09:00:00Z'
    }
  ]);

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('community-feeds', {
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
      case 'error': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'inactive': return <Info />;
      case 'error': return <ErrorIcon />;
      case 'pending': return <Warning />;
      default: return <Info />;
    }
  };

  const filteredFeeds = threatFeeds.filter(feed => {
    const matchesSearch = feed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feed.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feed.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || feed.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Rss color="primary" />
        🌍 Community Threat Feed Manager
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Discover, manage, and contribute to community-driven threat intelligence feeds.
      </Typography>

      {/* Status Overview */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Community Status:</strong> 247 active feeds • 45,000 community members • 1.2M IOCs shared this month
        </Typography>
      </Alert>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="Available Feeds" />
          <Tab label="My Subscriptions" />
          <Tab label="Community Contributions" />
          <Tab label="Feed Analytics" />
        </Tabs>
      </Paper>

      {/* Available Feeds Tab */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* Search and Filter */}
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search feeds..."
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
                    <InputLabel>Filter by Type</InputLabel>
                    <Select
                      value={filterType}
                      label="Filter by Type"
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <MenuItem value="All">All Types</MenuItem>
                      <MenuItem value="IOC">IOC</MenuItem>
                      <MenuItem value="Malware">Malware</MenuItem>
                      <MenuItem value="Network">Network</MenuItem>
                      <MenuItem value="Behavioral">Behavioral</MenuItem>
                      <MenuItem value="Mixed">Mixed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Add />}
                  >
                    Contribute Feed
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Feed List */}
            <Grid container spacing={2}>
              {filteredFeeds.map((feed) => (
                <Grid item xs={12} md={6} lg={4} key={feed.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {feed.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {feed.isVerified && (
                            <CheckCircle color="success" fontSize="small" />
                          )}
                          {feed.isFree && (
                            <Chip label="Free" size="small" color="success" />
                          )}
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        by {feed.provider}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {feed.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                        <Chip label={feed.type} size="small" variant="outlined" />
                        <Chip label={feed.format} size="small" variant="outlined" />
                        <Chip label={feed.updateFrequency} size="small" variant="outlined" />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Rating value={feed.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="caption">
                          ({feed.rating})
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(feed.status)}
                          <Chip 
                            label={feed.status} 
                            color={getStatusColor(feed.status)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {feed.subscribers.toLocaleString()} subscribers
                        </Typography>
                      </Box>
                      
                      <Typography variant="caption" color="textSecondary">
                        Last updated: {new Date(feed.lastUpdate).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          fullWidth 
                          variant="contained" 
                          startIcon={<CloudDownload />}
                          size="small"
                        >
                          Subscribe
                        </Button>
                        <IconButton size="small" color="primary">
                          <Share />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Community Contributions Tab */}
      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Community Contributions
              </Typography>
              <List>
                {contributions.map((contribution) => (
                  <ListItem key={contribution.id} divider>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        {contribution.contributor.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{contribution.title}</Typography>
                          <Chip label={contribution.type} size="small" variant="outlined" />
                          <Chip 
                            label={contribution.status} 
                            color={contribution.status === 'published' ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            by {contribution.contributor}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TrendingUp fontSize="small" />
                              <Typography variant="caption">{contribution.votes} votes</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CloudDownload fontSize="small" />
                              <Typography variant="caption">{contribution.downloads} downloads</Typography>
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(contribution.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button variant="outlined" size="small">
                        View
                      </Button>
                      <IconButton size="small" color="primary">
                        <Star />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contribution Statistics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Total Contributions
                    </Typography>
                    <Typography variant="h4" color="primary">
                      1,247
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Active Contributors
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      456
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      This Month
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      89
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
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