/**
 * Threat Actor Feed Integration Component
 * External threat intelligence feed integration and management
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
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
  useTheme,
  alpha,
  Tabs,
  Tab,
  LinearProgress,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';

import {
  Hub,
  CloudSync,
  Sync,
  SyncProblem,
  CheckCircle,  Error as ErrorIcon,
  Warning,
  Search,
  Add,
  Edit,
  Delete,
  Refresh,
  Download,
  Settings,
  Visibility,
  Timeline,
  Analytics,
  Security,
  Computer
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';
import { Status, Priority } from '../../types/index';

interface ThreatFeed {
  id: string;
  name: string;
  provider: string;
  description: string;
  type: 'commercial' | 'government' | 'open_source' | 'community' | 'internal';
  format: 'stix' | 'misp' | 'csv' | 'json' | 'xml' | 'api';
  status: 'active' | 'paused' | 'error' | 'configured';
  url: string;
  authentication: {
    type: 'none' | 'api_key' | 'basic' | 'oauth' | 'certificate';
    configured: boolean;
  };
  schedule: {
    enabled: boolean;
    interval: number; // minutes
    lastSync: Date;
    nextSync: Date;
  };
  metrics: {
    totalRecords: number;
    newActors: number;
    updatedActors: number;
    newIOCs: number;
    uptime: number;
    avgResponseTime: number;
  };
  mapping: {
    actorNameField: string;
    confidenceField: string;
    severityField: string;
    customMappings: Record<string, string>;
  };
  filters: {
    minConfidence: number;
    actorTypes: string[];
    excludeKeywords: string[];
    includeKeywords: string[];
  };
  lastError?: {
    message: string;
    timestamp: Date;
    code: string;
  };
}

interface FeedData {
  id: string;
  feedId: string;
  feedName: string;
  actorName: string;
  dataType: 'actor' | 'ioc' | 'campaign' | 'technique';
  content: any;
  confidence: number;
  receivedAt: Date;
  processed: boolean;
  status: 'pending' | 'processed' | 'rejected' | 'duplicate';
  rejectionReason?: string;
}

const ThreatActorFeedIntegration: React.FC = () => {
  const theme = useTheme();
  
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('threat-intelligence-feeds');

  const [feeds, setFeeds] = useState<ThreatFeed[]>([]);
  const [feedData, setFeedData] = useState<FeedData[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<ThreatFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const generateMockFeeds = useCallback((): ThreatFeed[] => {
    const feedProviders = [
      'CrowdStrike Falcon', 'FireEye iSIGHT', 'Recorded Future', 'ThreatConnect',
      'MISP Community', 'AlienVault OTX', 'IBM X-Force', 'Mandiant'
    ];
    
    const feeds: ThreatFeed[] = [];
    
    for (let i = 1; i <= 12; i++) {
      const provider = feedProviders[Math.floor(Math.random() * feedProviders.length)];
      const lastSync = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
      
      feeds.push({
        id: `feed-${i}`,
        name: `${provider} Feed ${i}`,
        provider,
        description: `Threat intelligence feed from ${provider} providing actor data`,
        type: ['commercial', 'government', 'open_source', 'community'][Math.floor(Math.random() * 4)] as any,
        format: ['stix', 'misp', 'csv', 'json', 'xml', 'api'][Math.floor(Math.random() * 6)] as any,
        status: ['active', 'paused', 'error', 'configured'][Math.floor(Math.random() * 4)] as any,
        url: `https://api.${provider.toLowerCase().replace(' ', '')}.com/v1/threat-intel`,
        authentication: {
          type: ['none', 'api_key', 'basic', 'oauth'][Math.floor(Math.random() * 4)] as any,
          configured: Math.random() > 0.2
        },
        schedule: {
          enabled: Math.random() > 0.3,
          interval: [15, 30, 60, 120, 360][Math.floor(Math.random() * 5)],
          lastSync,
          nextSync: new Date(lastSync.getTime() + 60 * 60 * 1000)
        },
        metrics: {
          totalRecords: Math.floor(Math.random() * 10000) + 1000,
          newActors: Math.floor(Math.random() * 50) + 5,
          updatedActors: Math.floor(Math.random() * 100) + 10,
          newIOCs: Math.floor(Math.random() * 500) + 50,
          uptime: Math.random() * 0.1 + 0.9,
          avgResponseTime: Math.floor(Math.random() * 2000) + 500
        },
        mapping: {
          actorNameField: 'actor.name',
          confidenceField: 'confidence',
          severityField: 'severity',
          customMappings: {
            'aliases': 'actor.aliases',
            'country': 'actor.country'
          }
        },
        filters: {
          minConfidence: Math.floor(Math.random() * 30) + 50,
          actorTypes: ['APT', 'Cybercriminal', 'Hacktivist'],
          excludeKeywords: ['test', 'demo'],
          includeKeywords: ['apt', 'malware', 'campaign']
        },
        lastError: Math.random() > 0.7 ? {
          message: 'Authentication failed',
          timestamp: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000),
          code: 'AUTH_ERROR'
        } : undefined
      });
    }
    
    return feeds;
  }, []);

  const generateMockFeedData = useCallback((): FeedData[] => {
    const data: FeedData[] = [];
    
    for (let i = 1; i <= 100; i++) {
      data.push({
        id: `data-${i}`,
        feedId: `feed-${Math.floor(Math.random() * 12) + 1}`,
        feedName: `Feed ${Math.floor(Math.random() * 12) + 1}`,
        actorName: `FeedActor-${i}`,
        dataType: ['actor', 'ioc', 'campaign', 'technique'][Math.floor(Math.random() * 4)] as any,
        content: {
          name: `FeedActor-${i}`,
          aliases: [`FA-${i}`, `Group-${i}`],
          confidence: Math.floor(Math.random() * 40) + 60
        },
        confidence: Math.floor(Math.random() * 40) + 60,
        receivedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        processed: Math.random() > 0.3,
        status: ['pending', 'processed', 'rejected', 'duplicate'][Math.floor(Math.random() * 4)] as any,
        rejectionReason: Math.random() > 0.8 ? 'Low confidence score' : undefined
      });
    }
    
    return data.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockFeeds = generateMockFeeds();
        const mockData = generateMockFeedData();
        setFeeds(mockFeeds);
        setFeedData(mockData);
        setSelectedFeed(mockFeeds[0]);
        addUIUXEvaluation('feed-integration-loaded', 'success', {
          feedCount: mockFeeds.length,
          dataCount: mockData.length,
          loadTime: 1000
        });
      } catch (error) {
        console.error('Error loading feed data:', error);
        addNotification('error', 'Failed to load feed integration data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockFeeds, generateMockFeedData, addNotification]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'error': return 'error';
      case 'configured': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Sync color="success" />;
      case 'paused': return <Warning color="warning" />;
      case 'error': return <SyncProblem color="error" />;
      case 'configured': return <CheckCircle color="info" />;
      default: return <CloudSync />;
    }
  };

  const activeFeeds = feeds.filter(f => f.status === 'active').length;
  const totalRecords = feeds.reduce((sum, f) => sum + f.metrics.totalRecords, 0);

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
          <Hub color="primary" />
          Threat Actor Feed Integration
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage external threat intelligence feeds and data integration
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary">{feeds.length}</Typography>
              <Typography variant="caption">Total Feeds</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success">{activeFeeds}</Typography>
              <Typography variant="caption">Active Feeds</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info">{totalRecords.toLocaleString()}</Typography>
              <Typography variant="caption">Total Records</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning">
                {feedData.filter(d => d.status === 'pending').length}
              </Typography>
              <Typography variant="caption">Pending Processing</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '600px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Threat Intelligence Feeds ({feeds.length})</Typography>
                <Button variant="contained" startIcon={<Add />} size="small">
                  Add Feed
                </Button>
              </Box>
              
              <Box sx={{ height: '520px', overflow: 'auto' }}>
                <List dense>
                  {feeds.map(feed => (
                    <ListItem
                      key={feed.id}
                      button
                      selected={selectedFeed?.id === feed.id}
                      onClick={() => setSelectedFeed(feed)}
                      sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                    >
                      <ListItemIcon>
                        <Badge
                          color={getStatusColor(feed.status)}
                          variant="dot"
                          invisible={feed.status !== 'active'}
                        >
                          {getStatusIcon(feed.status)}
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {feed.name}
                            </Typography>
                            <Chip 
                              label={feed.type} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {feed.provider} • {feed.format.toUpperCase()}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {feed.metrics.totalRecords.toLocaleString()} records • 
                              {Math.round(feed.metrics.uptime * 100)}% uptime
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small">
                          <Settings />
                        </IconButton>
                        <IconButton size="small">
                          <Sync />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '600px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {selectedFeed?.name || 'Select Feed'}
              </Typography>

              {selectedFeed ? (
                <Box sx={{ height: '510px' }}>
                  <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
                    <Tab label="Overview" />
                    <Tab label="Configuration" />
                    <Tab label="Data" />
                    <Tab label="Metrics" />
                  </Tabs>

                  {selectedTab === 0 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Paper sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="subtitle2">Feed Status</Typography>
                              <Chip 
                                label={selectedFeed.status} 
                                color={getStatusColor(selectedFeed.status)}
                                icon={getStatusIcon(selectedFeed.status)}
                              />
                            </Box>
                            <Typography variant="body2" color="textSecondary" paragraph>
                              {selectedFeed.description}
                            </Typography>
                            
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="caption" display="block">Provider</Typography>
                                <Typography variant="body2">{selectedFeed.provider}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" display="block">Format</Typography>
                                <Typography variant="body2">{selectedFeed.format.toUpperCase()}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" display="block">Last Sync</Typography>
                                <Typography variant="body2">
                                  {selectedFeed.schedule.lastSync.toLocaleString()}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" display="block">Next Sync</Typography>
                                <Typography variant="body2">
                                  {selectedFeed.schedule.nextSync.toLocaleString()}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                        
                        {selectedFeed.lastError && (
                          <Grid item xs={12}>
                            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                              <Typography variant="subtitle2" color="error" gutterBottom>
                                Last Error
                              </Typography>
                              <Typography variant="body2" color="error">
                                {selectedFeed.lastError.message}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {selectedFeed.lastError.timestamp.toLocaleString()} • 
                                Code: {selectedFeed.lastError.code}
                              </Typography>
                            </Paper>
                          </Grid>
                        )}
                        
                        <Grid item xs={12}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Schedule</Typography>
                            <FormControlLabel
                              control={<Switch checked={selectedFeed.schedule.enabled} />}
                              label="Automatic synchronization"
                            />
                            <Typography variant="body2" color="textSecondary">
                              Interval: {selectedFeed.schedule.interval} minutes
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {selectedTab === 1 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>Feed Configuration</Typography>
                      
                      <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="body2" gutterBottom>Connection</Typography>
                        <Typography variant="caption" display="block">URL: {selectedFeed.url}</Typography>
                        <Typography variant="caption" display="block">
                          Authentication: {selectedFeed.authentication.type} 
                          ({selectedFeed.authentication.configured ? 'Configured' : 'Not configured'})
                        </Typography>
                      </Paper>
                      
                      <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="body2" gutterBottom>Field Mapping</Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Local Field</TableCell>
                                <TableCell>Feed Field</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>Actor Name</TableCell>
                                <TableCell>{selectedFeed.mapping.actorNameField}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Confidence</TableCell>
                                <TableCell>{selectedFeed.mapping.confidenceField}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Severity</TableCell>
                                <TableCell>{selectedFeed.mapping.severityField}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                      
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="body2" gutterBottom>Filters</Typography>
                        <Typography variant="caption" display="block">
                          Minimum Confidence: {selectedFeed.filters.minConfidence}%
                        </Typography>
                        <Typography variant="caption" display="block">
                          Actor Types: {selectedFeed.filters.actorTypes.join(', ')}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Include Keywords: {selectedFeed.filters.includeKeywords.join(', ')}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Exclude Keywords: {selectedFeed.filters.excludeKeywords.join(', ')}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  {selectedTab === 2 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Recent Feed Data ({feedData.filter(d => d.feedId === selectedFeed.id).length})
                      </Typography>
                      <List dense>
                        {feedData
                          .filter(d => d.feedId === selectedFeed.id)
                          .slice(0, 20)
                          .map(data => (
                            <ListItem key={data.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                              <ListItemIcon>
                                {data.dataType === 'actor' && <Security />}
                                {data.dataType === 'ioc' && <Computer />}
                                {data.dataType === 'campaign' && <Timeline />}
                                {data.dataType === 'technique' && <Analytics />}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2">{data.actorName}</Typography>
                                    <Chip 
                                      label={data.status} 
                                      size="small" 
                                      color={
                                        data.status === 'processed' ? 'success' :
                                        data.status === 'rejected' ? 'error' :
                                        data.status === 'duplicate' ? 'warning' : 'default'
                                      }
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="caption" display="block">
                                      {data.dataType} • Confidence: {data.confidence}%
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {data.receivedAt.toLocaleString()}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                      </List>
                    </Box>
                  )}

                  {selectedTab === 3 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>Feed Metrics</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                              {selectedFeed.metrics.totalRecords.toLocaleString()}
                            </Typography>
                            <Typography variant="caption">Total Records</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4" color="success">
                              {Math.round(selectedFeed.metrics.uptime * 100)}%
                            </Typography>
                            <Typography variant="caption">Uptime</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4" color="info">
                              {selectedFeed.metrics.newActors}
                            </Typography>
                            <Typography variant="caption">New Actors</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4" color="warning">
                              {selectedFeed.metrics.avgResponseTime}ms
                            </Typography>
                            <Typography variant="caption">Avg Response</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    height: '500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Hub sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.5), mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      Select a Feed
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThreatActorFeedIntegration;