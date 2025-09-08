/**
 * Public Threat Feed Directory
 * Comprehensive directory of public and open-source threat intelligence feeds
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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Badge,
  Link,
  CardActions,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Public, 
  Rss, 
  OpenInNew, 
  Star,
  Search,
  Download,
  Code,
  Security,
  Language,
  Schedule,
  Verified,
  TrendingUp,
  FilterList,
  Bookmark,
  Share,
  ExpandMore,
  Info,
  Speed
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';

interface PublicFeed {
  id: string;
  name: string;
  provider: string;
  type: 'IOC' | 'Malware' | 'Domains' | 'URLs' | 'IPs' | 'Mixed' | 'Reports';
  format: 'JSON' | 'XML' | 'CSV' | 'STIX' | 'RSS' | 'API' | 'Text';
  access: 'free' | 'registration' | 'api-key' | 'commercial';
  url: string;
  apiEndpoint?: string;
  updateFrequency: 'Real-time' | 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';
  description: string;
  coverage: string[];
  languages: string[];
  rating: number;
  subscribers: number;
  isVerified: boolean;
  isTrending: boolean;
  lastUpdate: string;
  reliability: 'high' | 'medium' | 'low';
  tags: string[];
}

interface FeedCategory {
  id: string;
  name: string;
  description: string;
  feedCount: number;
  icon: React.ReactNode;
}

interface FeedStats {
  totalFeeds: number;
  freeFeeds: number;
  realtimeFeeds: number;
  verifiedFeeds: number;
  totalSubscribers: number;
}

export const PublicThreatFeedDirectory: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('public-feed-directory');

  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [accessFilter, setAccessFilter] = useState('All');
  const [formatFilter, setFormatFilter] = useState('All');

  const [feedStats, setFeedStats] = useState<FeedStats>({
    totalFeeds: 247,
    freeFeeds: 189,
    realtimeFeeds: 56,
    verifiedFeeds: 123,
    totalSubscribers: 45620
  });

  const [feedCategories, setFeedCategories] = useState<FeedCategory[]>([
    {
      id: 'malware',
      name: 'Malware Intelligence',
      description: 'Malware samples, families, and analysis feeds',
      feedCount: 67,
      icon: <Security />
    },
    {
      id: 'network',
      name: 'Network Indicators',
      description: 'IPs, domains, URLs, and network-based IOCs',
      feedCount: 89,
      icon: <Language />
    },
    {
      id: 'reports',
      name: 'Threat Reports',
      description: 'Research reports and threat intelligence analysis',
      feedCount: 34,
      icon: <Info />
    },
    {
      id: 'realtime',
      name: 'Real-time Feeds',
      description: 'Live streaming threat intelligence feeds',
      feedCount: 56,
      icon: <Speed />
    }
  ]);

  const [publicFeeds, setPublicFeeds] = useState<PublicFeed[]>([
    {
      id: 'feed-001',
      name: 'Abuse.ch MalwareBazaar',
      provider: 'abuse.ch',
      type: 'Malware',
      format: 'JSON',
      access: 'free',
      url: 'https://bazaar.abuse.ch/',
      apiEndpoint: 'https://mb-api.abuse.ch/api/v1/',
      updateFrequency: 'Real-time',
      description: 'Malware sample sharing platform with hash-based IOCs and family classifications',
      coverage: ['Malware hashes', 'File analysis', 'Family classification'],
      languages: ['English'],
      rating: 4.8,
      subscribers: 8950,
      isVerified: true,
      isTrending: true,
      lastUpdate: '2024-01-15T10:30:00Z',
      reliability: 'high',
      tags: ['malware', 'hashes', 'free', 'api']
    },
    {
      id: 'feed-002',
      name: 'VirusTotal Intelligence',
      provider: 'VirusTotal',
      type: 'Mixed',
      format: 'API',
      access: 'api-key',
      url: 'https://www.virustotal.com/',
      apiEndpoint: 'https://www.virustotal.com/vtapi/v2/',
      updateFrequency: 'Real-time',
      description: 'Comprehensive malware and URL analysis with community-driven intelligence',
      coverage: ['File analysis', 'URL scanning', 'Domain reputation', 'Behavioral analysis'],
      languages: ['Multiple'],
      rating: 4.9,
      subscribers: 15400,
      isVerified: true,
      isTrending: true,
      lastUpdate: '2024-01-15T10:45:00Z',
      reliability: 'high',
      tags: ['malware', 'urls', 'api', 'analysis']
    },
    {
      id: 'feed-003',
      name: 'Malware Domain List',
      provider: 'MDL Community',
      type: 'Domains',
      format: 'CSV',
      access: 'free',
      url: 'https://www.malwaredomainlist.com/',
      updateFrequency: 'Daily',
      description: 'Community-maintained list of domains hosting malware and malicious content',
      coverage: ['Malicious domains', 'Hosting infrastructure', 'Command & control'],
      languages: ['English'],
      rating: 4.3,
      subscribers: 6780,
      isVerified: true,
      isTrending: false,
      lastUpdate: '2024-01-15T06:00:00Z',
      reliability: 'medium',
      tags: ['domains', 'infrastructure', 'free', 'community']
    },
    {
      id: 'feed-004',
      name: 'CIRCL OSINT Feed',
      provider: 'CIRCL Luxembourg',
      type: 'Mixed',
      format: 'STIX',
      access: 'free',
      url: 'https://www.circl.lu/',
      apiEndpoint: 'https://www.circl.lu/doc/misp/',
      updateFrequency: 'Hourly',
      description: 'Open source intelligence feed from Luxembourg CIRCL with MISP integration',
      coverage: ['OSINT indicators', 'Government intelligence', 'MISP events'],
      languages: ['English', 'French'],
      rating: 4.5,
      subscribers: 4560,
      isVerified: true,
      isTrending: false,
      lastUpdate: '2024-01-15T09:00:00Z',
      reliability: 'high',
      tags: ['osint', 'government', 'misp', 'stix']
    },
    {
      id: 'feed-005',
      name: 'Emerging Threats Open Rules',
      provider: 'Proofpoint',
      type: 'Mixed',
      format: 'Text',
      access: 'free',
      url: 'https://rules.emergingthreats.net/',
      updateFrequency: 'Daily',
      description: 'Open source Suricata/Snort rules for network-based threat detection',
      coverage: ['Network signatures', 'IDS rules', 'Attack patterns'],
      languages: ['English'],
      rating: 4.7,
      subscribers: 12340,
      isVerified: true,
      isTrending: true,
      lastUpdate: '2024-01-15T08:00:00Z',
      reliability: 'high',
      tags: ['rules', 'ids', 'network', 'detection']
    },
    {
      id: 'feed-006',
      name: 'PhishTank',
      provider: 'OpenDNS',
      type: 'URLs',
      format: 'JSON',
      access: 'registration',
      url: 'https://www.phishtank.com/',
      apiEndpoint: 'https://data.phishtank.com/data/',
      updateFrequency: 'Hourly',
      description: 'Community-verified phishing URL database with real-time updates',
      coverage: ['Phishing URLs', 'Brand impersonation', 'Scam sites'],
      languages: ['English'],
      rating: 4.4,
      subscribers: 7890,
      isVerified: true,
      isTrending: false,
      lastUpdate: '2024-01-15T10:15:00Z',
      reliability: 'medium',
      tags: ['phishing', 'urls', 'community', 'verification']
    }
  ]);

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('public-feed-directory', {
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

  const getAccessColor = (access: string) => {
    switch (access) {
      case 'free': return 'success';
      case 'registration': return 'info';
      case 'api-key': return 'warning';
      case 'commercial': return 'error';
      default: return 'default';
    }
  };

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'error';
      default: return 'default';
    }
  };

  const filteredFeeds = publicFeeds.filter(feed => {
    const matchesSearch = feed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feed.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feed.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feed.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'All' || feed.type === typeFilter;
    const matchesAccess = accessFilter === 'All' || feed.access === accessFilter;
    const matchesFormat = formatFilter === 'All' || feed.format === formatFilter;
    return matchesSearch && matchesType && matchesAccess && matchesFormat;
  });

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Public color="primary" />
        🌍 Public Threat Feed Directory
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Comprehensive directory of public and open-source threat intelligence feeds from around the world.
      </Typography>

      {/* Directory Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h5" color="primary">
                {feedStats.totalFeeds}
              </Typography>
              <Typography variant="caption">
                Total Feeds
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h5" color="success.main">
                {feedStats.freeFeeds}
              </Typography>
              <Typography variant="caption">
                Free Access
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h5" color="warning.main">
                {feedStats.realtimeFeeds}
              </Typography>
              <Typography variant="caption">
                Real-time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h5" color="info.main">
                {feedStats.verifiedFeeds}
              </Typography>
              <Typography variant="caption">
                Verified
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h5" color="secondary.main">
                {(feedStats.totalSubscribers / 1000).toFixed(1)}k
              </Typography>
              <Typography variant="caption">
                Subscribers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="Browse Feeds" />
          <Tab label="Categories" />
          <Tab label="Trending" />
          <Tab label="My Bookmarks" />
        </Tabs>
      </Paper>

      {/* Browse Feeds Tab */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* Search and Filters */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
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
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={typeFilter}
                      label="Type"
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Types</MenuItem>
                      <MenuItem value="IOC">IOC</MenuItem>
                      <MenuItem value="Malware">Malware</MenuItem>
                      <MenuItem value="Domains">Domains</MenuItem>
                      <MenuItem value="URLs">URLs</MenuItem>
                      <MenuItem value="IPs">IPs</MenuItem>
                      <MenuItem value="Mixed">Mixed</MenuItem>
                      <MenuItem value="Reports">Reports</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Access</InputLabel>
                    <Select
                      value={accessFilter}
                      label="Access"
                      onChange={(e) => setAccessFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Access</MenuItem>
                      <MenuItem value="free">Free</MenuItem>
                      <MenuItem value="registration">Registration</MenuItem>
                      <MenuItem value="api-key">API Key</MenuItem>
                      <MenuItem value="commercial">Commercial</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Format</InputLabel>
                    <Select
                      value={formatFilter}
                      label="Format"
                      onChange={(e) => setFormatFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Formats</MenuItem>
                      <MenuItem value="JSON">JSON</MenuItem>
                      <MenuItem value="XML">XML</MenuItem>
                      <MenuItem value="CSV">CSV</MenuItem>
                      <MenuItem value="STIX">STIX</MenuItem>
                      <MenuItem value="RSS">RSS</MenuItem>
                      <MenuItem value="API">API</MenuItem>
                      <MenuItem value="Text">Text</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterList />}
                    size="small"
                  >
                    Advanced
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
                        <Typography variant="h6" component="h3">
                          {feed.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {feed.isVerified && (
                            <Verified color="success" fontSize="small" />
                          )}
                          {feed.isTrending && (
                            <TrendingUp color="warning" fontSize="small" />
                          )}
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        by {feed.provider}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Rating value={feed.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="caption">
                          ({feed.subscribers.toLocaleString()} users)
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {feed.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                        <Chip label={feed.type} size="small" variant="outlined" />
                        <Chip label={feed.format} size="small" variant="outlined" />
                        <Chip 
                          label={feed.access} 
                          color={getAccessColor(feed.access)}
                          size="small"
                        />
                        <Chip 
                          label={feed.reliability} 
                          color={getReliabilityColor(feed.reliability)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      
                      <Typography variant="caption" color="textSecondary">
                        Updates: {feed.updateFrequency}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="textSecondary">
                        Last updated: {new Date(feed.lastUpdate).toLocaleString()}
                      </Typography>
                    </CardContent>
                    
                    <CardActions>
                      <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
                        <Tooltip title="Visit feed website">
                          <IconButton 
                            size="small" 
                            color="primary"
                            component="a"
                            href={feed.url}
                            target="_blank"
                          >
                            <OpenInNew />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Bookmark feed">
                          <IconButton size="small">
                            <Bookmark />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share feed">
                          <IconButton size="small">
                            <Share />
                          </IconButton>
                        </Tooltip>
                        <Button 
                          size="small" 
                          variant="contained" 
                          startIcon={<Download />}
                          sx={{ flexGrow: 1, ml: 1 }}
                        >
                          Access Feed
                        </Button>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Categories Tab */}
      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {feedCategories.map((category) => (
                <Grid item xs={12} sm={6} md={3} key={category.id}>
                  <Card sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                        {category.icon}
                      </Avatar>
                      <Typography variant="h6" gutterBottom>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {category.description}
                      </Typography>
                      <Chip 
                        label={`${category.feedCount} feeds`} 
                        color="primary" 
                        variant="outlined"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
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