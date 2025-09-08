/**
 * Threat Intelligence Exchange Hub
 * Central hub for threat intelligence sharing across organizations
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
  IconButton,
  LinearProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Hub, 
  Share, 
  CloudSync, 
  Security, 
  Groups,
  TrendingUp,
  Download,
  Upload,
  Verified,
  Warning,
  Info,
  Schedule
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';

interface ThreatIntelData {
  id: string;
  title: string;
  type: 'IOC' | 'TTP' | 'Campaign' | 'Actor' | 'Vulnerability';
  source: string;
  confidence: number;
  timestamp: string;
  classification: 'TLP:WHITE' | 'TLP:GREEN' | 'TLP:AMBER' | 'TLP:RED';
  size: string;
}

interface SharingPartner {
  id: string;
  name: string;
  type: 'Commercial' | 'Government' | 'ISAC' | 'Academic';
  status: 'active' | 'pending' | 'inactive';
  lastActivity: string;
  sharedItems: number;
}

export const ThreatIntelligenceExchangeHub: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('threat-exchange');

  const [currentTab, setCurrentTab] = useState(0);
  const [recentIntel, setRecentIntel] = useState<ThreatIntelData[]>([
    {
      id: 'intel-001',
      title: 'APT29 Infrastructure Updates',
      type: 'TTP',
      source: 'US-CERT',
      confidence: 95,
      timestamp: '2024-01-15T10:30:00Z',
      classification: 'TLP:AMBER',
      size: '2.4 MB'
    },
    {
      id: 'intel-002',
      title: 'Banking Trojan IOCs',
      type: 'IOC',
      source: 'Financial ISAC',
      confidence: 88,
      timestamp: '2024-01-15T09:15:00Z',
      classification: 'TLP:GREEN',
      size: '156 KB'
    },
    {
      id: 'intel-003',
      title: 'Critical CVE Exploitation',
      type: 'Vulnerability',
      source: 'CISA',
      confidence: 98,
      timestamp: '2024-01-15T08:45:00Z',
      classification: 'TLP:WHITE',
      size: '512 KB'
    }
  ]);

  const [sharingPartners, setSharingPartners] = useState<SharingPartner[]>([
    {
      id: 'partner-001',
      name: 'US-CERT',
      type: 'Government',
      status: 'active',
      lastActivity: '5 minutes ago',
      sharedItems: 1247
    },
    {
      id: 'partner-002',
      name: 'Financial Services ISAC',
      type: 'ISAC',
      status: 'active',
      lastActivity: '12 minutes ago',
      sharedItems: 892
    },
    {
      id: 'partner-003',
      name: 'Threat Research Consortium',
      type: 'Commercial',
      status: 'active',
      lastActivity: '1 hour ago',
      sharedItems: 2156
    }
  ]);

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('threat-exchange-hub', {
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

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'TLP:WHITE': return 'default';
      case 'TLP:GREEN': return 'success';
      case 'TLP:AMBER': return 'warning';
      case 'TLP:RED': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IOC': return <Security />;
      case 'TTP': return <TrendingUp />;
      case 'Campaign': return <Groups />;
      case 'Actor': return <Verified />;
      case 'Vulnerability': return <Warning />;
      default: return <Info />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Hub color="primary" />
        🌐 Threat Intelligence Exchange Hub
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Central platform for sharing and accessing threat intelligence across partner organizations and communities.
      </Typography>

      {/* Real-time Status */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Exchange Status:</strong> 47 active partners • 1,247 intelligence items shared today • 99.2% uptime
        </Typography>
      </Alert>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="Recent Intelligence" />
          <Tab label="Sharing Partners" />
          <Tab label="Exchange Analytics" />
          <Tab label="My Contributions" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Latest Threat Intelligence
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" startIcon={<Download />} size="small">
                    Download Selected
                  </Button>
                  <Button variant="contained" startIcon={<Upload />} size="small">
                    Share Intelligence
                  </Button>
                </Box>
              </Box>
              
              <List>
                {recentIntel.map((intel) => (
                  <ListItem key={intel.id} divider>
                    <ListItemIcon>
                      {getTypeIcon(intel.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{intel.title}</Typography>
                          <Chip 
                            label={intel.type} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={intel.classification} 
                            size="small" 
                            color={getClassificationColor(intel.classification)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Source: {intel.source} • Confidence: {intel.confidence}% • Size: {intel.size}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(intel.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <IconButton size="small" color="primary">
                        <Download />
                      </IconButton>
                      <IconButton size="small" color="secondary">
                        <Share />
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
                  Exchange Statistics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Today's Activity
                    </Typography>
                    <Typography variant="h4" color="primary">
                      1,247
                    </Typography>
                    <Typography variant="caption">
                      Intelligence items shared
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Active Partners
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      47
                    </Typography>
                    <Typography variant="caption">
                      Organizations connected
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Quality Score
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      94.2%
                    </Typography>
                    <Typography variant="caption">
                      Average confidence rating
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Sharing Partners
              </Typography>
              <List>
                {sharingPartners.map((partner) => (
                  <ListItem key={partner.id} divider>
                    <ListItemIcon>
                      <Badge 
                        badgeContent={partner.status === 'active' ? '●' : '○'} 
                        color={partner.status === 'active' ? 'success' : 'default'}
                      >
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {partner.name.charAt(0)}
                        </Avatar>
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{partner.name}</Typography>
                          <Chip label={partner.type} size="small" variant="outlined" />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="textSecondary">
                          Last activity: {partner.lastActivity} • {partner.sharedItems} items shared
                        </Typography>
                      }
                    />
                    <Button variant="outlined" size="small">
                      Manage
                    </Button>
                  </ListItem>
                ))}
              </List>
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