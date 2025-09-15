'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  IconButton
} from '@mui/material';
import {
  Search,
  Security,
  ShoppingCart,
  Star,
  Download,
  Visibility,
  TrendingUp,
  Warning,
  CheckCircle,
  Public,
  Lock,
  AttachMoney,
  FilterList
} from '@mui/icons-material';

interface ThreatFeed {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: 'malware' | 'phishing' | 'botnet' | 'apt' | 'vulnerability' | 'ioc';
  pricing: 'free' | 'paid' | 'freemium';
  price?: number;
  rating: number;
  reviews: number;
  updates: 'realtime' | 'hourly' | 'daily' | 'weekly';
  format: 'json' | 'xml' | 'csv' | 'stix' | 'taxii';
  coverage: string[];
  confidence: number;
  subscribed: boolean;
  lastUpdate: Date;
}

interface ThreatData {
  id: string;
  type: string;
  indicator: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  firstSeen: Date;
  lastSeen: Date;
  tags: string[];
}

export default function ThreatIntelligenceClient() {
  const [activeTab, setActiveTab] = useState(0);
  const [threatFeeds, setThreatFeeds] = useState<ThreatFeed[]>([]);
  const [threatData, setThreatData] = useState<ThreatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [pricingFilter, setPricingFilter] = useState<string>('all');
  const [selectedFeed, setSelectedFeed] = useState<ThreatFeed | null>(null);
  const [feedDetailsOpen, setFeedDetailsOpen] = useState(false);

  useEffect(() => {
    fetchThreatFeeds();
    fetchThreatData();
  }, []);

  const fetchThreatFeeds = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockFeeds: ThreatFeed[] = [
        {
          id: 'feed_1',
          name: 'Global Malware Intelligence',
          provider: 'CyberThreat Corp',
          description: 'Comprehensive malware indicators and family classifications',
          category: 'malware',
          pricing: 'paid',
          price: 299,
          rating: 4.8,
          reviews: 156,
          updates: 'realtime',
          format: 'json',
          coverage: ['Windows', 'Linux', 'Android', 'iOS'],
          confidence: 95,
          subscribed: true,
          lastUpdate: new Date(Date.now() - 3600000)
        },
        {
          id: 'feed_2',
          name: 'Phishing URL Database',
          provider: 'SecureWeb Solutions',
          description: 'Real-time phishing URL detection and classification',
          category: 'phishing',
          pricing: 'freemium',
          price: 99,
          rating: 4.6,
          reviews: 89,
          updates: 'hourly',
          format: 'csv',
          coverage: ['Web', 'Email'],
          confidence: 92,
          subscribed: false,
          lastUpdate: new Date(Date.now() - 1800000)
        },
        {
          id: 'feed_3',
          name: 'APT Indicators Feed',
          provider: 'ThreatHunter Labs',
          description: 'Advanced persistent threat indicators and TTPs',
          category: 'apt',
          pricing: 'paid',
          price: 599,
          rating: 4.9,
          reviews: 234,
          updates: 'daily',
          format: 'stix',
          coverage: ['Enterprise', 'Government'],
          confidence: 98,
          subscribed: true,
          lastUpdate: new Date(Date.now() - 7200000)
        },
        {
          id: 'feed_4',
          name: 'Open Source IOCs',
          provider: 'Community Contributors',
          description: 'Community-driven indicators of compromise',
          category: 'ioc',
          pricing: 'free',
          rating: 4.2,
          reviews: 67,
          updates: 'daily',
          format: 'json',
          coverage: ['General'],
          confidence: 78,
          subscribed: true,
          lastUpdate: new Date(Date.now() - 14400000)
        },
        {
          id: 'feed_5',
          name: 'Botnet C&C Tracker',
          provider: 'NetDefense Inc',
          description: 'Command and control infrastructure tracking',
          category: 'botnet',
          pricing: 'paid',
          price: 199,
          rating: 4.7,
          reviews: 112,
          updates: 'realtime',
          format: 'xml',
          coverage: ['Network'],
          confidence: 94,
          subscribed: false,
          lastUpdate: new Date(Date.now() - 900000)
        }
      ];

      setThreatFeeds(mockFeeds);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch threat feeds');
      setLoading(false);
    }
  };

  const fetchThreatData = async () => {
    try {
      const mockThreatData: ThreatData[] = [
        {
          id: 'threat_1',
          type: 'File Hash',
          indicator: 'a1b2c3d4e5f6789...',
          confidence: 95,
          severity: 'high',
          source: 'Global Malware Intelligence',
          firstSeen: new Date(Date.now() - 86400000),
          lastSeen: new Date(Date.now() - 3600000),
          tags: ['trojan', 'banking', 'stealer']
        },
        {
          id: 'threat_2',
          type: 'IP Address',
          indicator: '192.168.100.5',
          confidence: 87,
          severity: 'medium',
          source: 'Botnet C&C Tracker',
          firstSeen: new Date(Date.now() - 172800000),
          lastSeen: new Date(Date.now() - 7200000),
          tags: ['botnet', 'c2', 'zeus']
        },
        {
          id: 'threat_3',
          type: 'Domain',
          indicator: 'malicious-site.example.com',
          confidence: 92,
          severity: 'critical',
          source: 'Phishing URL Database',
          firstSeen: new Date(Date.now() - 43200000),
          lastSeen: new Date(Date.now() - 1800000),
          tags: ['phishing', 'banking', 'credential-theft']
        },
        {
          id: 'threat_4',
          type: 'URL',
          indicator: 'https://fake-bank.net/login',
          confidence: 98,
          severity: 'critical',
          source: 'APT Indicators Feed',
          firstSeen: new Date(Date.now() - 21600000),
          lastSeen: new Date(Date.now() - 900000),
          tags: ['apt', 'spearphishing', 'financial']
        }
      ];

      setThreatData(mockThreatData);
    } catch (err) {
      console.error('Failed to fetch threat data:', err);
    }
  };

  const filteredFeeds = threatFeeds.filter(feed => {
    const matchesSearch = feed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feed.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feed.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || feed.category === categoryFilter;
    const matchesPricing = pricingFilter === 'all' || feed.pricing === pricingFilter;

    return matchesSearch && matchesCategory && matchesPricing;
  });

  const handleSubscribe = async (feedId: string) => {
    try {
      setThreatFeeds(feeds => feeds.map(feed =>
        feed.id === feedId ? { ...feed, subscribed: true } : feed
      ));
    } catch (err) {
      setError('Failed to subscribe to feed');
    }
  };

  const handleUnsubscribe = async (feedId: string) => {
    try {
      setThreatFeeds(feeds => feeds.map(feed =>
        feed.id === feedId ? { ...feed, subscribed: false } : feed
      ));
    } catch (err) {
      setError('Failed to unsubscribe from feed');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: any } = {
      'malware': 'error',
      'phishing': 'warning',
      'botnet': 'info',
      'apt': 'secondary',
      'vulnerability': 'primary',
      'ioc': 'success'
    };
    return colors[category] || 'default';
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Threat Intelligence Marketplace
        </Typography>
        <Button variant="contained" startIcon={<Security />}>
          Browse Feeds
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Available Feeds" />
          <Tab label="My Subscriptions" />
          <Tab label="Threat Data" />
        </Tabs>
      </Box>

      {/* Available Feeds Tab */}
      {activeTab === 0 && (
        <Box>
          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
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
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                      <MenuItem value="all">All Categories</MenuItem>
                      <MenuItem value="malware">Malware</MenuItem>
                      <MenuItem value="phishing">Phishing</MenuItem>
                      <MenuItem value="botnet">Botnet</MenuItem>
                      <MenuItem value="apt">APT</MenuItem>
                      <MenuItem value="vulnerability">Vulnerability</MenuItem>
                      <MenuItem value="ioc">IOC</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Pricing</InputLabel>
                    <Select value={pricingFilter} onChange={(e) => setPricingFilter(e.target.value)}>
                      <MenuItem value="all">All Pricing</MenuItem>
                      <MenuItem value="free">Free</MenuItem>
                      <MenuItem value="freemium">Freemium</MenuItem>
                      <MenuItem value="paid">Paid</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Feeds Grid */}
          <Grid container spacing={3}>
            {filteredFeeds.map((feed) => (
              <Grid item xs={12} md={6} lg={4} key={feed.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {feed.name}
                      </Typography>
                      <Chip
                        label={feed.category}
                        color={getCategoryColor(feed.category)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      by {feed.provider}
                    </Typography>

                    <Typography variant="body2" paragraph>
                      {feed.description}
                    </Typography>

                    <Box display="flex" alignItems="center" mb={2}>
                      <Rating value={feed.rating} precision={0.1} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({feed.reviews} reviews)
                      </Typography>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Updates: <strong>{feed.updates}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Confidence: <strong>{feed.confidence}%</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Format: <strong>{feed.format.toUpperCase()}</strong>
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        {feed.pricing === 'free' ? (
                          <Chip label="FREE" color="success" size="small" />
                        ) : feed.pricing === 'freemium' ? (
                          <Chip label="FREEMIUM" color="warning" size="small" />
                        ) : (
                          <Chip
                            label={`$${feed.price}/month`}
                            color="primary"
                            size="small"
                            icon={<AttachMoney />}
                          />
                        )}
                      </Box>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedFeed(feed);
                            setFeedDetailsOpen(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                        {feed.subscribed ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleUnsubscribe(feed.id)}
                          >
                            Unsubscribe
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleSubscribe(feed.id)}
                          >
                            Subscribe
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* My Subscriptions Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {threatFeeds.filter(feed => feed.subscribed).map((feed) => (
            <Grid item xs={12} key={feed.id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <Typography variant="h6">{feed.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feed.provider}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Chip
                        label={feed.category}
                        color={getCategoryColor(feed.category)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography variant="body2">
                        Updates: {feed.updates}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Typography variant="body2">
                        Last Update: {feed.lastUpdate.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box display="flex" gap={1}>
                        <Button size="small" startIcon={<Download />}>
                          Download
                        </Button>
                        <Button size="small" variant="outlined" color="error">
                          Unsubscribe
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Threat Data Tab */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Threat Indicators
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Indicator</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>First Seen</TableCell>
                    <TableCell>Tags</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {threatData.map((threat) => (
                    <TableRow key={threat.id}>
                      <TableCell>{threat.type}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {threat.indicator}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={threat.severity}
                          color={getSeverityColor(threat.severity) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{threat.confidence}%</TableCell>
                      <TableCell>{threat.source}</TableCell>
                      <TableCell>{threat.firstSeen.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Box>
                          {threat.tags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Feed Details Dialog */}
      <Dialog open={feedDetailsOpen} onClose={() => setFeedDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedFeed?.name}</DialogTitle>
        <DialogContent>
          {selectedFeed && (
            <Box>
              <Typography variant="body1" paragraph>
                {selectedFeed.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Provider:</strong> {selectedFeed.provider}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Category:</strong> {selectedFeed.category}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Updates:</strong> {selectedFeed.updates}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Format:</strong> {selectedFeed.format.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Confidence:</strong> {selectedFeed.confidence}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Coverage:</strong> {selectedFeed.coverage.join(', ')}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedDetailsOpen(false)}>Close</Button>
          {selectedFeed && !selectedFeed.subscribed && (
            <Button
              variant="contained"
              onClick={() => {
                handleSubscribe(selectedFeed.id);
                setFeedDetailsOpen(false);
              }}
            >
              Subscribe
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}