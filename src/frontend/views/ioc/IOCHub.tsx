/**
 * IOC Hub - Central navigation for all 32 IOC-related pages
 */

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Speed,
  Security,
  Attribution,
  Search,
  Lightbulb,
  Star,
  BatchPrediction,
  Timeline,
  Storage,
  Archive,
  RssFeed as Rss,
  Api,
  Settings,
  SyncAlt,
  Map,
  Hub,
  ShowChart,
  Dashboard,
  PlayArrow,
  AutoMode,
  Work,
  Search as Investigate,
  Group,
  Share,
  People,
  Reviews,
  Psychology,
  Analytics,
  Insights,
  Rule
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface IOCPageCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  path: string;
  status: 'active' | 'new' | 'updated';
}

export const IOCHub: React.FC = () => {
  const navigate = useNavigate();

  const iocPages: IOCPageCard[] = [
    // Analytics & Reporting (4)
    {
      id: 'trend-analytics',
      title: 'Trend Analytics',
      description: 'Advanced trend analysis with predictive insights',
      icon: <TrendingUp />,
      category: 'Analytics & Reporting',
      path: '/ioc/analytics/trends',
      status: 'new'
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      description: 'Comprehensive risk assessment dashboard',
      icon: <Assessment />,
      category: 'Analytics & Reporting',
      path: '/ioc/analytics/risk-assessment',
      status: 'new'
    },
    {
      id: 'performance-metrics',
      title: 'Performance Metrics',
      description: 'IOC detection performance monitoring',
      icon: <Speed />,
      category: 'Analytics & Reporting',
      path: '/ioc/analytics/performance',
      status: 'new'
    },
    {
      id: 'compliance-reports',
      title: 'Compliance Reports',
      description: 'Regulatory compliance and reporting',
      icon: <Security />,
      category: 'Analytics & Reporting',
      path: '/ioc/analytics/compliance',
      status: 'new'
    },
    
    // Intelligence & Enrichment (4)
    {
      id: 'threat-attribution',
      title: 'Threat Attribution',
      description: 'Threat actor attribution analysis',
      icon: <Attribution />,
      category: 'Intelligence & Enrichment',
      path: '/ioc/intelligence/attribution',
      status: 'new'
    },
    {
      id: 'osint-enrichment',
      title: 'OSINT Enrichment',
      description: 'Open source intelligence enrichment',
      icon: <Search />,
      category: 'Intelligence & Enrichment',
      path: '/ioc/intelligence/osint',
      status: 'new'
    },
    {
      id: 'contextual-analysis',
      title: 'Contextual Analysis',
      description: 'Campaign and TTP mapping',
      icon: <Lightbulb />,
      category: 'Intelligence & Enrichment',
      path: '/ioc/intelligence/context',
      status: 'new'
    },
    {
      id: 'reputation-scoring',
      title: 'Reputation Scoring',
      description: 'Multi-source reputation analysis',
      icon: <Star />,
      category: 'Intelligence & Enrichment',
      path: '/ioc/intelligence/reputation',
      status: 'new'
    },

    // Operations & Management (4)
    {
      id: 'batch-operations',
      title: 'Batch Operations',
      description: 'Bulk IOC create, update, delete operations',
      icon: <BatchPrediction />,
      category: 'Operations & Management',
      path: '/ioc/operations/batch',
      status: 'new'
    },
    {
      id: 'lifecycle-management',
      title: 'Lifecycle Management',
      description: 'IOC lifecycle and automation rules',
      icon: <Timeline />,
      category: 'Operations & Management',
      path: '/ioc/operations/lifecycle',
      status: 'new'
    },
    {
      id: 'data-quality',
      title: 'Data Quality',
      description: 'Data quality assessment and improvement',
      icon: <Storage />,
      category: 'Operations & Management',
      path: '/ioc/operations/data-quality',
      status: 'new'
    },
    {
      id: 'archive-management',
      title: 'Archive Management',
      description: 'IOC archival and retention policies',
      icon: <Archive />,
      category: 'Operations & Management',
      path: '/ioc/operations/archive',
      status: 'new'
    },

    // Integration & Feeds (4)
    {
      id: 'feed-sources',
      title: 'Feed Sources',
      description: 'External IOC feed management',
      icon: <Rss />,
      category: 'Integration & Feeds',
      path: '/ioc/feeds/sources',
      status: 'new'
    },
    {
      id: 'api-connectors',
      title: 'API Connectors',
      description: 'API connector management',
      icon: <Api />,
      category: 'Integration & Feeds',
      path: '/ioc/feeds/connectors',
      status: 'new'
    },
    {
      id: 'feed-management',
      title: 'Feed Management',
      description: 'Comprehensive feed dashboard',
      icon: <Settings />,
      category: 'Integration & Feeds',
      path: '/ioc/feeds/management',
      status: 'new'
    },
    {
      id: 'data-synchronization',
      title: 'Data Synchronization',
      description: 'Cross-system data synchronization',
      icon: <SyncAlt />,
      category: 'Integration & Feeds',
      path: '/ioc/feeds/synchronization',
      status: 'new'
    },

    // Visualization (4)
    {
      id: 'geolocation-mapping',
      title: 'Geolocation Mapping',
      description: 'Interactive geolocation visualization',
      icon: <Map />,
      category: 'Visualization',
      path: '/ioc/visualization/geolocation',
      status: 'new'
    },
    {
      id: 'relationship-network',
      title: 'Relationship Network',
      description: 'IOC relationship visualization',
      icon: <Hub />,
      category: 'Visualization',
      path: '/ioc/visualization/relationships',
      status: 'new'
    },
    {
      id: 'timeline-analysis',
      title: 'Timeline Analysis',
      description: 'Activity timeline visualization',
      icon: <ShowChart />,
      category: 'Visualization',
      path: '/ioc/visualization/timeline',
      status: 'new'
    },
    {
      id: 'interactive-dashboard',
      title: 'Interactive Dashboard',
      description: 'Real-time IOC dashboard',
      icon: <Dashboard />,
      category: 'Visualization',
      path: '/ioc/visualization/dashboard',
      status: 'new'
    },

    // Workflows (4)
    {
      id: 'security-playbooks',
      title: 'Security Playbooks',
      description: 'IOC-triggered security playbooks',
      icon: <PlayArrow />,
      category: 'Workflows',
      path: '/ioc/workflows/playbooks',
      status: 'new'
    },
    {
      id: 'automation-workflows',
      title: 'Automation Workflows',
      description: 'Automated response workflows',
      icon: <AutoMode />,
      category: 'Workflows',
      path: '/ioc/workflows/automation',
      status: 'new'
    },
    {
      id: 'case-management',
      title: 'Case Management',
      description: 'IOC-related case tracking',
      icon: <Work />,
      category: 'Workflows',
      path: '/ioc/workflows/cases',
      status: 'new'
    },
    {
      id: 'investigation-tools',
      title: 'Investigation Tools',
      description: 'Digital forensic investigation tools',
      icon: <Investigate />,
      category: 'Workflows',
      path: '/ioc/workflows/investigation',
      status: 'new'
    },

    // Collaboration (4)
    {
      id: 'team-workspaces',
      title: 'Team Workspaces',
      description: 'Collaborative analysis workspaces',
      icon: <Group />,
      category: 'Collaboration',
      path: '/ioc/collaboration/workspaces',
      status: 'new'
    },
    {
      id: 'external-sharing',
      title: 'External Sharing',
      description: 'IOC sharing and community intelligence',
      icon: <Share />,
      category: 'Collaboration',
      path: '/ioc/collaboration/sharing',
      status: 'new'
    },
    {
      id: 'community-intelligence',
      title: 'Community Intelligence',
      description: 'Crowd-sourced intelligence platform',
      icon: <People />,
      category: 'Collaboration',
      path: '/ioc/collaboration/community',
      status: 'new'
    },
    {
      id: 'peer-reviews',
      title: 'Peer Reviews',
      description: 'IOC validation peer review system',
      icon: <Reviews />,
      category: 'Collaboration',
      path: '/ioc/collaboration/reviews',
      status: 'new'
    },

    // Advanced Features (4)
    {
      id: 'ml-detection',
      title: 'ML Detection',
      description: 'Machine learning-powered detection',
      icon: <Psychology />,
      category: 'Advanced Features',
      path: '/ioc/advanced/ml-detection',
      status: 'new'
    },
    {
      id: 'behavioral-analysis',
      title: 'Behavioral Analysis',
      description: 'Behavioral anomaly detection',
      icon: <Analytics />,
      category: 'Advanced Features',
      path: '/ioc/advanced/behavioral',
      status: 'new'
    },
    {
      id: 'predictive-intelligence',
      title: 'Predictive Intelligence',
      description: 'Threat forecasting and predictions',
      icon: <Insights />,
      category: 'Advanced Features',
      path: '/ioc/advanced/predictive',
      status: 'new'
    },
    {
      id: 'custom-rules',
      title: 'Custom Rules',
      description: 'Custom detection and alert rules',
      icon: <Rule />,
      category: 'Advanced Features',
      path: '/ioc/advanced/custom-rules',
      status: 'new'
    }
  ];

  const categories = [...new Set(iocPages.map(page => page.category))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'primary';
      case 'updated': return 'secondary';
      case 'active': return 'success';
      default: return 'default';
    }
  };

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Hub />
        IOC Management Hub
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Comprehensive indicators of compromise management with 32 specialized pages for business-ready threat intelligence operations.
      </Typography>

      <Box sx={{ mb: 4, p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          🎯 Complete IOC Platform
        </Typography>
        <Typography variant="body2">
          Access all 32 IOC-related pages including analytics, intelligence enrichment, operations management, 
          data visualization, automated workflows, team collaboration, and advanced ML-powered features.
        </Typography>
      </Box>

      {categories.map((category) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {category}
            <Chip 
              label={`${iocPages.filter(page => page.category === category).length} pages`} 
              size="small" 
              color="primary"
            />
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            {iocPages
              .filter(page => page.category === category)
              .map((page) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={page.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardActionArea 
                      sx={{ height: '100%', p: 2 }}
                      onClick={() => handleCardClick(page.path)}
                    >
                      <CardContent sx={{ p: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {page.icon}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" component="h3" gutterBottom>
                              {page.title}
                            </Typography>
                            <Chip 
                              label={page.status.toUpperCase()} 
                              color={getStatusColor(page.status) as any}
                              size="small"
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          {page.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};