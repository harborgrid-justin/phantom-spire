/**
 * Threat Intelligence Marketplace
 * Comprehensive threat intelligence feed management and data analysis
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Security } from '@mui/icons-material';
import { ThreatFeed, ThreatData } from './types';
import {
  FeedCard,
  FilterBar,
  ThreatDataTable,
  SubscriptionCard,
  FeedDetailsDialog
} from './components';

export default function ThreatIntelligenceClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [threatFeeds, setThreatFeeds] = useState<ThreatFeed[]>([]);
  const [threatData, setThreatData] = useState<ThreatData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pricingFilter, setPricingFilter] = useState('all');
  const [feedDetailsOpen, setFeedDetailsOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<ThreatFeed | null>(null);

  useEffect(() => {
    fetchThreatFeeds();
    fetchThreatData();
  }, []);

  const fetchThreatFeeds = async () => {
    try {
      // Mock threat intelligence feeds data
      const mockFeeds: ThreatFeed[] = [
        {
          id: 'feed_1',
          name: 'Global Malware Intelligence',
          description: 'Comprehensive malware indicators from multiple sources with real-time updates',
          provider: 'CyberThreat Labs',
          category: 'malware',
          pricing: 'paid',
          price: '$99/month',
          confidence: 95,
          coverage: ['File Hashes', 'URLs', 'Domains'],
          updates: 'Real-time',
          lastUpdate: new Date(),
          format: 'json',
          subscribed: false,
          subscribers: 1250,
          rating: 4.8
        },
        {
          id: 'feed_2', 
          name: 'Phishing URL Database',
          description: 'Curated database of phishing URLs and domains updated hourly',
          provider: 'SecurityFirst Inc',
          category: 'phishing',
          pricing: 'freemium',
          confidence: 88,
          coverage: ['URLs', 'Domains', 'Email Addresses'],
          updates: 'Hourly',
          lastUpdate: new Date(Date.now() - 3600000),
          format: 'csv',
          subscribed: true,
          subscribers: 850,
          rating: 4.5
        },
        {
          id: 'feed_3',
          name: 'Botnet C&C Tracker',
          description: 'Command and control server tracking with botnet family attribution',
          provider: 'ThreatIntel Pro',
          category: 'botnet',
          pricing: 'paid',
          price: '$149/month',
          confidence: 92,
          coverage: ['IP Addresses', 'Domains', 'Network Traffic'],
          updates: 'Every 6 hours',
          lastUpdate: new Date(Date.now() - 21600000),
          format: 'xml',
          subscribed: false,
          subscribers: 320,
          rating: 4.7
        },
        {
          id: 'feed_4',
          name: 'APT Indicators Feed',
          description: 'Advanced Persistent Threat indicators with campaign attribution',
          provider: 'Elite Threat Research',
          category: 'apt',
          pricing: 'paid',
          price: '$299/month',
          confidence: 96,
          coverage: ['All Indicator Types', 'TTPs', 'Campaign Data'],
          updates: 'Daily',
          lastUpdate: new Date(Date.now() - 86400000),
          format: 'stix',
          subscribed: true,
          subscribers: 75,
          rating: 4.9
        },
        {
          id: 'feed_5',
          name: 'Open Source Intelligence',
          description: 'Community-driven threat intelligence from open sources',
          provider: 'OSINT Collective',
          category: 'ioc',
          pricing: 'free',
          confidence: 75,
          coverage: ['Various IOCs', 'OSINT Reports'],
          updates: 'Weekly',
          lastUpdate: new Date(Date.now() - 604800000),
          format: 'json',
          subscribed: false,
          subscribers: 2100,
          rating: 4.2
        },
        {
          id: 'feed_6',
          name: 'Vulnerability Exploit Database',
          description: 'Real-time vulnerability and exploit intelligence',
          provider: 'VulnTrack Systems',
          category: 'vulnerability',
          pricing: 'paid',
          price: '$199/month',
          confidence: 89,
          coverage: ['CVE IDs', 'Exploit Code', 'PoC URLs'],
          updates: 'Real-time',
          lastUpdate: new Date(Date.now() - 1800000),
          format: 'json',
          subscribed: true,
          subscribers: 540,
          rating: 4.6
        }
      ];

      setThreatFeeds(mockFeeds);
    } catch (err) {
      console.error('Failed to fetch threat feeds:', err);
      setError('Failed to load threat feeds');
    } finally {
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

  const subscribedFeeds = threatFeeds.filter(feed => feed.subscribed);

  const handleSubscribe = async (feedId: string) => {
    try {
      setThreatFeeds(feeds => feeds.map(feed =>
        feed.id === feedId ? { ...feed, subscribed: true } : feed
      ));
    } catch {
      setError('Failed to subscribe to feed');
    }
  };

  const handleUnsubscribe = async (feedId: string) => {
    try {
      setThreatFeeds(feeds => feeds.map(feed =>
        feed.id === feedId ? { ...feed, subscribed: false } : feed
      ));
    } catch {
      setError('Failed to unsubscribe from feed');
    }
  };

  const handleViewDetails = (feed: ThreatFeed) => {
    setSelectedFeed(feed);
    setFeedDetailsOpen(true);
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
          <FilterBar
            searchTerm={searchTerm}
            categoryFilter={categoryFilter}
            pricingFilter={pricingFilter}
            onSearchChange={setSearchTerm}
            onCategoryChange={setCategoryFilter}
            onPricingChange={setPricingFilter}
          />

          <Grid container spacing={3}>
            {filteredFeeds.map((feed) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={feed.id}>
                <FeedCard
                  feed={feed}
                  onSubscribe={handleSubscribe}
                  onUnsubscribe={handleUnsubscribe}
                  onViewDetails={handleViewDetails}
                />
              </Grid>
            ))}
          </Grid>

          {filteredFeeds.length === 0 && (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary">
                No feeds found matching your criteria
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* My Subscriptions Tab */}
      {activeTab === 1 && (
        <Grid container spacing={2}>
          {subscribedFeeds.map((feed) => (
            <SubscriptionCard
              key={feed.id}
              feed={feed}
              onUnsubscribe={handleUnsubscribe}
            />
          ))}

          {subscribedFeeds.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                  No active subscriptions
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Browse available feeds to start subscribing
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Threat Data Tab */}
      {activeTab === 2 && (
        <ThreatDataTable threatData={threatData} />
      )}

      {/* Feed Details Dialog */}
      <FeedDetailsDialog
        feed={selectedFeed}
        open={feedDetailsOpen}
        onClose={() => setFeedDetailsOpen(false)}
        onSubscribe={handleSubscribe}
      />
    </Box>
  );
}