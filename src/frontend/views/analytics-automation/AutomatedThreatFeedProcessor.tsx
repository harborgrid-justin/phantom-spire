/**
 * Automated Threat Intelligence Feed Processing Dashboard
 * Real-time threat feed ingestion, processing, and enrichment platform
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  AppBar,
  Toolbar,
  Drawer,
  ToggleButton,
  ToggleButtonGroup,
  ButtonGroup,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemButton,
  Collapse,
  Breadcrumbs,
  Link,
  RadioGroup,
  Radio,
  FormLabel,
  Checkbox,
  FormGroup,
  Autocomplete,
  SpeedDialAction as MuiSpeedDialAction,
  Snackbar
} from '@mui/material';

import {
  RssFeed as Rss,
  Stream,
  CloudDownload,
  Storage,
  DataUsage,
  Transform,
  AutoAwesome,
  Psychology,
  Memory,
  Speed,
  NetworkCheck,
  Computer,
  Security,
  Shield,
  BugReport,
  Analytics,
  Assessment,
  Timeline as TimelineIcon,
  TrendingUp,
  TrendingDown,
  Warning,
  Error,
  CheckCircle,
  Info,
  Visibility,
  VisibilityOff,
  FilterList,
  Download,
  Share,
  Settings,
  Refresh,
  PlayArrow,
  Pause,
  Stop,
  SkipNext,
  SkipPrevious,
  Search,
  Edit,
  Delete,
  Add,
  Remove,
  ContentCopy as Copy,
  Save,
  SaveAs,
  FolderOpen,
  Schedule,
  Flag,
  LocationOn,
  Person,
  Business,
  AccountTree,
  Hub,
  DeviceHub,
  Functions,
  AutoGraph,
  Insights,
  Calculate,
  Schema,
  GroupWork,
  CompareArrows,
  ExpandMore,
  ExpandLess,
  ChevronRight,
  MoreVert,
  Launch,
  OpenInNew,
  FastForward,
  FastRewind,
  Fullscreen,
  FullscreenExit,
  Sync,
  SyncProblem,
  SyncDisabled,
  CloudQueue,
  Cloud,
  CloudOff,
  SignalWifiOff,
  Wifi,
  RouterOutlined,
  Public,
  Language,
  Api,
  Code,
  Extension,
  Cable,
  Webhook,
  QrCode,
  Notifications,
  NotificationsActive,
  NotificationsOff,
  Email,
  Sms,
  PhoneAndroid,
  Laptop,
  DesktopWindows,
  Monitor,
  Tablet,
  PhonelinkSetup,
  Cast,
  CastConnected,
  History
} from '@mui/icons-material';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  ReferenceLine,
  Brush,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';


// Feed processing interfaces
interface ThreatFeed {
  id: string;
  name: string;
  description: string;
  provider: string;
  url: string;
  feedType: 'commercial' | 'open_source' | 'government' | 'community' | 'internal';
  dataFormat: 'stix' | 'misp' | 'json' | 'xml' | 'csv' | 'taxii' | 'custom';
  authentication: {
    type: 'none' | 'api_key' | 'oauth' | 'basic' | 'certificate';
    credentials?: Record<string, string>;
  };
  schedule: {
    frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'manual';
    interval?: number;
    nextUpdate?: Date;
    lastUpdate?: Date;
  };
  processing: {
    enabled: boolean;
    enrichment: boolean;
    deduplication: boolean;
    validation: boolean;
    transformation: boolean;
    correlation: boolean;
  };
  filters: {
    enabled: boolean;
    confidence: number;
    severity: string[];
    types: string[];
    sources: string[];
    timeWindow: number;
  };
  statistics: {
    totalIngested: number;
    successfulIngests: number;
    failedIngests: number;
    duplicatesFiltered: number;
    lastIngestCount: number;
    avgIngestTime: number;
    avgProcessingTime: number;
    errorRate: number;
  };
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
    uptime: number;
    lastError?: string;
    consecutiveFailures: number;
    responseTime: number;
  };
  quality: {
    accuracy: number;
    completeness: number;
    timeliness: number;
    relevance: number;
    uniqueness: number;
    overallScore: number;
  };
  metadata: {
    created: Date;
    modified: Date;
    createdBy: string;
    tags: string[];
    isActive: boolean;
    priority: number;
  };
}

interface FeedProcessor {
  id: string;
  name: string;
  description: string;
  type: 'enricher' | 'validator' | 'transformer' | 'correlator' | 'classifier' | 'deduplicator';
  configuration: {
    rules: ProcessingRule[];
    parallelism: number;
    batchSize: number;
    timeout: number;
    retryPolicy: {
      maxRetries: number;
      backoffStrategy: 'linear' | 'exponential';
      initialDelay: number;
    };
  };
  performance: {
    throughput: number;
    latency: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
    lastProcessed: Date;
  };
  status: 'running' | 'stopped' | 'error' | 'maintenance';
  dependencies: string[];
  outputs: string[];
  metrics: {
    itemsProcessed: number;
    successRate: number;
    avgProcessingTime: number;
    queueSize: number;
  };
}

interface ProcessingRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  conditions: {
    field: string;
    operator: string;
    value: any;
    logic?: 'AND' | 'OR';
  }[];
  actions: {
    type: 'enrich' | 'validate' | 'transform' | 'tag' | 'filter' | 'alert';
    parameters: Record<string, any>;
  }[];
  statistics: {
    matchCount: number;
    successCount: number;
    errorCount: number;
    lastExecuted?: Date;
  };
}

interface ProcessingPipeline {
  id: string;
  name: string;
  description: string;
  stages: {
    id: string;
    name: string;
    processor: string;
    enabled: boolean;
    order: number;
    configuration: Record<string, any>;
  }[];
  feeds: string[];
  status: 'active' | 'paused' | 'error' | 'maintenance';
  throughput: {
    input: number;
    output: number;
    processed: number;
    filtered: number;
  };
  quality: {
    accuracy: number;
    completeness: number;
    freshness: number;
  };
  schedule: {
    type: 'continuous' | 'batch' | 'event_driven';
    configuration: Record<string, any>;
  };
  monitoring: {
    alerts: boolean;
    thresholds: Record<string, number>;
    notifications: string[];
  };
}

interface FeedMetrics {
  timestamp: Date;
  feedId: string;
  ingestionRate: number;
  processingLatency: number;
  errorRate: number;
  qualityScore: number;
  throughput: number;
  queueSize: number;
  memoryUsage: number;
  cpuUsage: number;
}

const AutomatedThreatFeedProcessor: React.FC = () => {
  const theme = useTheme();
  const wsRef = useRef<WebSocket | null>(null);
  
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
  } = useServicePage('analytics-automation');
  
  // Core data states
  const [threatFeeds, setThreatFeeds] = useState<ThreatFeed[]>([]);
  const [feedProcessors, setFeedProcessors] = useState<FeedProcessor[]>([]);
  const [processingPipelines, setProcessingPipelines] = useState<ProcessingPipeline[]>([]);
  const [feedMetrics, setFeedMetrics] = useState<FeedMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time states
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [liveMetrics, setLiveMetrics] = useState<Record<string, any>>({});
  
  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFeed, setSelectedFeed] = useState<ThreatFeed | null>(null);
  const [selectedProcessor, setSelectedProcessor] = useState<FeedProcessor | null>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<ProcessingPipeline | null>(null);
  const [feedDetailsOpen, setFeedDetailsOpen] = useState(false);
  const [processorDetailsOpen, setProcessorDetailsOpen] = useState(false);
  const [pipelineDetailsOpen, setPipelineDetailsOpen] = useState(false);
  const [createFeedOpen, setCreateFeedOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [monitoringOpen, setMonitoringOpen] = useState(false);
  
  // Processing states
  const [processingEnabled, setProcessingEnabled] = useState<Record<string, boolean>>({});
  const [processingProgress, setProcessingProgress] = useState<Record<string, number>>({});
  const [queueSizes, setQueueSizes] = useState<Record<string, number>>({});
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('automated-threat-feed-processor', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 150000
    });

    return () => evaluationController.remove();
  }, []);

  // Business logic operations
  const handleStartProcessing = async (feedId: string) => {
    try {
      await businessLogic.execute('start-feed-processing', { feedId }, 'medium');
      addNotification('success', 'Feed processing started');
    } catch (error) {
      addNotification('error', 'Failed to start feed processing');
    }
  };

  const handleCreateProcessingPipeline = async (pipelineData: any) => {
    try {
      await businessLogic.execute('create-processing-pipeline', pipelineData, 'medium');
      addNotification('success', 'Processing pipeline created');
    } catch (error) {
      addNotification('error', 'Failed to create processing pipeline');
    }
  };

  const handleRefreshProcessor = async () => {
    try {
      await refresh();
      addNotification('success', 'Processor data refreshed');
    } catch (error) {
      addNotification('error', 'Failed to refresh processor');
    }
  };


  // Initialize WebSocket for real-time updates
  useEffect(() => {
    if (realTimeEnabled) {
      setConnectionStatus('connecting');
      
      // Simulate WebSocket connection
      const mockWebSocket = {
        readyState: 1,
        send: () => {},
        close: () => {},
        addEventListener: () => {},
        removeEventListener: () => {}
      } as any;
      
      wsRef.current = mockWebSocket;
      setConnectionStatus('connected');
      
      // Simulate real-time updates
      const interval = setInterval(() => {
        setLiveMetrics({
          totalThroughput: Math.floor(Math.random() * 1000) + 500,
          activeFeeds: threatFeeds.filter(f => f.metadata.isActive).length,
          errorRate: Math.random() * 5,
          avgLatency: Math.random() * 100 + 50,
          queueSize: Math.floor(Math.random() * 1000),
          timestamp: new Date()
        });
      }, 5000);
      
      return () => {
        clearInterval(interval);
        setConnectionStatus('disconnected');
      };
    }
  }, [realTimeEnabled, threatFeeds]);

  // Generate mock threat feeds
  const generateMockFeeds = useCallback((): ThreatFeed[] => {
    const providers = ['VirusTotal', 'Hybrid Analysis', 'URLVoid', 'AbuseIPDB', 'ThreatConnect', 'Recorded Future', 'FireEye', 'CrowdStrike'];
    const feedTypes = ['commercial', 'open_source', 'government', 'community', 'internal'] as const;
    const dataFormats = ['stix', 'misp', 'json', 'xml', 'csv', 'taxii'] as const;
    const frequencies = ['real_time', 'hourly', 'daily', 'weekly'] as const;
    const healthStatuses = ['healthy', 'degraded', 'unhealthy', 'offline'] as const;
    
    const feeds: ThreatFeed[] = [];
    
    for (let i = 0; i < 15; i++) {
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const feedType = feedTypes[Math.floor(Math.random() * feedTypes.length)];
      const dataFormat = dataFormats[Math.floor(Math.random() * dataFormats.length)];
      const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
      const healthStatus = healthStatuses[Math.floor(Math.random() * healthStatuses.length)];
      
      const totalIngested = Math.floor(Math.random() * 1000000) + 100000;
      const successfulIngests = Math.floor(totalIngested * (0.8 + Math.random() * 0.15));
      const failedIngests = totalIngested - successfulIngests;
      
      feeds.push({
        id: `feed-${i}`,
        name: `${provider} ${feedType.replace('_', ' ')} Feed`,
        description: `${provider} threat intelligence feed providing ${dataFormat.toUpperCase()} formatted data`,
        provider,
        url: `https://api.${provider.toLowerCase().replace(' ', '')}.com/feeds/v1/threats`,
        feedType,
        dataFormat,
        authentication: {
          type: feedType === 'open_source' ? 'none' : 'api_key',
          credentials: feedType !== 'open_source' ? { apiKey: 'encrypted_key' } : undefined
        },
        schedule: {
          frequency,
          interval: frequency === 'hourly' ? 3600 : frequency === 'daily' ? 86400 : undefined,
          nextUpdate: new Date(Date.now() + Math.random() * 86400000),
          lastUpdate: new Date(Date.now() - Math.random() * 86400000)
        },
        processing: {
          enabled: true,
          enrichment: Math.random() > 0.3,
          deduplication: true,
          validation: true,
          transformation: Math.random() > 0.4,
          correlation: Math.random() > 0.5
        },
        filters: {
          enabled: true,
          confidence: Math.floor(Math.random() * 30) + 70,
          severity: ['high', 'critical'],
          types: ['malware', 'phishing', 'botnet'],
          sources: [provider],
          timeWindow: 86400
        },
        statistics: {
          totalIngested,
          successfulIngests,
          failedIngests,
          duplicatesFiltered: Math.floor(totalIngested * 0.1),
          lastIngestCount: Math.floor(Math.random() * 1000) + 100,
          avgIngestTime: Math.random() * 5000 + 1000,
          avgProcessingTime: Math.random() * 2000 + 500,
          errorRate: (failedIngests / totalIngested) * 100
        },
        health: {
          status: healthStatus,
          uptime: Math.random() * 99 + 1,
          lastError: healthStatus === 'unhealthy' ? 'Connection timeout' : undefined,
          consecutiveFailures: healthStatus === 'unhealthy' ? Math.floor(Math.random() * 5) + 1 : 0,
          responseTime: Math.random() * 1000 + 100
        },
        quality: {
          accuracy: Math.random() * 20 + 80,
          completeness: Math.random() * 15 + 85,
          timeliness: Math.random() * 25 + 75,
          relevance: Math.random() * 20 + 80,
          uniqueness: Math.random() * 30 + 70,
          overallScore: Math.random() * 15 + 85
        },
        metadata: {
          created: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          modified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          createdBy: 'feed-admin@company.com',
          tags: [feedType, dataFormat, provider.toLowerCase()],
          isActive: Math.random() > 0.2,
          priority: Math.floor(Math.random() * 5) + 1
        }
      });
    }
    
    return feeds.sort((a, b) => b.metadata.priority - a.metadata.priority);
  }, []);

  // Generate mock processors
  const generateMockProcessors = useCallback((): FeedProcessor[] => {
    const processorTypes = ['enricher', 'validator', 'transformer', 'correlator', 'classifier', 'deduplicator'] as const;
    const statuses = ['running', 'stopped', 'error', 'maintenance'] as const;
    
    return processorTypes.map((type, index) => ({
      id: `processor-${index}`,
      name: `${type.replace('_', ' ')} Processor`,
      description: `Advanced ${type} for threat intelligence processing`,
      type,
      configuration: {
        rules: [
          {
            id: `rule-${index}-1`,
            name: `${type} Rule 1`,
            description: `Primary ${type} rule`,
            enabled: true,
            priority: 1,
            conditions: [
              { field: 'confidence', operator: '>', value: 80, logic: 'AND' },
              { field: 'type', operator: 'in', value: ['malware', 'phishing'], logic: 'AND' }
            ],
            actions: [
              { type: 'tag', parameters: { tags: [type] } }
            ],
            statistics: {
              matchCount: Math.floor(Math.random() * 10000),
              successCount: Math.floor(Math.random() * 9000),
              errorCount: Math.floor(Math.random() * 100),
              lastExecuted: new Date(Date.now() - Math.random() * 3600000)
            }
          }
        ],
        parallelism: Math.floor(Math.random() * 8) + 2,
        batchSize: Math.floor(Math.random() * 500) + 100,
        timeout: Math.floor(Math.random() * 30000) + 10000,
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000
        }
      },
      performance: {
        throughput: Math.floor(Math.random() * 500) + 100,
        latency: Math.random() * 100 + 20,
        errorRate: Math.random() * 5,
        cpuUsage: Math.random() * 80 + 10,
        memoryUsage: Math.random() * 1000 + 500,
        lastProcessed: new Date(Date.now() - Math.random() * 300000)
      },
      status: statuses[Math.floor(Math.random() * statuses.length)],
      dependencies: index > 0 ? [`processor-${index - 1}`] : [],
      outputs: [`processor-${index + 1}`],
      metrics: {
        itemsProcessed: Math.floor(Math.random() * 100000) + 10000,
        successRate: Math.random() * 10 + 90,
        avgProcessingTime: Math.random() * 1000 + 200,
        queueSize: Math.floor(Math.random() * 1000)
      }
    }));
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1800));
        
        setThreatFeeds(generateMockFeeds());
        setFeedProcessors(generateMockProcessors());
        
        // Generate mock pipelines
        setProcessingPipelines([
          {
            id: 'pipeline-main',
            name: 'Main Processing Pipeline',
            description: 'Primary threat intelligence processing pipeline',
            stages: [
              { id: 'ingestion', name: 'Data Ingestion', processor: 'processor-0', enabled: true, order: 1, configuration: {} },
              { id: 'validation', name: 'Data Validation', processor: 'processor-1', enabled: true, order: 2, configuration: {} },
              { id: 'enrichment', name: 'Data Enrichment', processor: 'processor-2', enabled: true, order: 3, configuration: {} },
              { id: 'correlation', name: 'Data Correlation', processor: 'processor-3', enabled: true, order: 4, configuration: {} }
            ],
            feeds: ['feed-0', 'feed-1', 'feed-2'],
            status: 'active',
            throughput: {
              input: 1500,
              output: 1200,
              processed: 1450,
              filtered: 250
            },
            quality: {
              accuracy: 94.5,
              completeness: 89.2,
              freshness: 96.8
            },
            schedule: {
              type: 'continuous',
              configuration: { batchSize: 1000 }
            },
            monitoring: {
              alerts: true,
              thresholds: { errorRate: 5, latency: 10000 },
              notifications: ['admin@company.com']
            }
          }
        ]);
        
      } catch (err) {
        setError('Failed to load feed processing data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockFeeds, generateMockProcessors]);

  // Filter feeds
  const filteredFeeds = useMemo(() => {
    return threatFeeds.filter(feed => {
      if (searchTerm && !feed.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !feed.provider.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !feed.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (providerFilter !== 'all' && feed.provider !== providerFilter) {
        return false;
      }
      if (statusFilter !== 'all' && feed.health.status !== statusFilter) {
        return false;
      }
      if (typeFilter !== 'all' && feed.feedType !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [threatFeeds, searchTerm, providerFilter, statusFilter, typeFilter]);

  // Calculate dashboard statistics
  const dashboardStats = useMemo(() => {
    const totalFeeds = filteredFeeds.length;
    const activeFeeds = filteredFeeds.filter(f => f.metadata.isActive).length;
    const healthyFeeds = filteredFeeds.filter(f => f.health.status === 'healthy').length;
    const totalIngested = filteredFeeds.reduce((sum, f) => sum + f.statistics.totalIngested, 0);
    const avgQuality = filteredFeeds.length > 0 ?
      Math.round(filteredFeeds.reduce((sum, f) => sum + f.quality.overallScore, 0) / filteredFeeds.length) : 0;
    const totalErrors = filteredFeeds.reduce((sum, f) => sum + f.statistics.failedIngests, 0);
    const runningProcessors = feedProcessors.filter(p => p.status === 'running').length;
    const activePipelines = processingPipelines.filter(p => p.status === 'active').length;
    
    return {
      totalFeeds,
      activeFeeds,
      healthyFeeds,
      totalIngested,
      avgQuality,
      totalErrors,
      runningProcessors,
      activePipelines
    };
  }, [filteredFeeds, feedProcessors, processingPipelines]);

  // Get health color
  const getHealthColor = (status: string): string => {
    switch (status) {
      case 'healthy': return theme.palette.success.main;
      case 'degraded': return theme.palette.warning.main;
      case 'unhealthy': return theme.palette.error.main;
      case 'offline': return theme.palette.grey[500];
      default: return theme.palette.grey[500];
    }
  };

  // Render feed overview
  const renderFeedOverview = () => (
    <Grid container spacing={3}>
      {filteredFeeds.map(feed => (
        <Grid item xs={12} sm={6} lg={4} key={feed.id}>
          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8],
              },
              border: feed.metadata.isActive ? undefined : `1px solid ${theme.palette.grey[300]}`
            }}
            onClick={() => {
              setSelectedFeed(feed);
              setFeedDetailsOpen(true);
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: getHealthColor(feed.health.status),
                      width: 32,
                      height: 32
                    }}
                  >
                    <Rss fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" noWrap>
                      {feed.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {feed.provider} • {feed.dataFormat.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: 0.5 }}>
                  <Chip
                    size="small"
                    label={feed.health.status}
                    sx={{
                      bgcolor: alpha(getHealthColor(feed.health.status), 0.1),
                      color: getHealthColor(feed.health.status)
                    }}
                  />
                  <Badge
                    badgeContent={feed.metadata.isActive ? 'Active' : 'Inactive'}
                    color={feed.metadata.isActive ? 'success' : 'default'}
                    variant="dot"
                  />
                </Box>
              </Box>

              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {feed.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`Quality: ${Math.round(feed.quality.overallScore)}%`}
                  sx={{
                    bgcolor: alpha(feed.quality.overallScore >= 80 ? theme.palette.success.main : 
                                 feed.quality.overallScore >= 60 ? theme.palette.warning.main :
                                 theme.palette.error.main, 0.1),
                    color: feed.quality.overallScore >= 80 ? theme.palette.success.main : 
                           feed.quality.overallScore >= 60 ? theme.palette.warning.main :
                           theme.palette.error.main
                  }}
                />
                <Chip
                  size="small"
                  label={feed.schedule.frequency.replace('_', ' ')}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`${feed.statistics.lastIngestCount} items`}
                  variant="outlined"
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Total Ingested
                    </Typography>
                    <Typography variant="h6">
                      {(feed.statistics.totalIngested / 1000).toFixed(0)}K
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Success Rate
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {((feed.statistics.successfulIngests / feed.statistics.totalIngested) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Response Time
                    </Typography>
                    <Typography variant="body2">
                      {Math.round(feed.health.responseTime)}ms
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Uptime
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      {feed.health.uptime.toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Last update: {feed.schedule.lastUpdate?.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle feed
                      setThreatFeeds(prev => prev.map(f =>
                        f.id === feed.id ? { ...f, metadata: { ...f.metadata, isActive: !f.metadata.isActive } } : f
                      ));
                    }}
                    color={feed.metadata.isActive ? 'error' : 'success'}
                  >
                    {feed.metadata.isActive ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Refresh feed
                    }}
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFeed(feed);
                      setFeedDetailsOpen(true);
                    }}
                  >
                    <Settings fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render processing pipeline
  const renderProcessingPipeline = () => (
    <Grid container spacing={3}>
      {processingPipelines.map(pipeline => (
        <Grid item xs={12} key={pipeline.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {pipeline.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {pipeline.description}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip
                    label={pipeline.status}
                    color={
                      pipeline.status === 'active' ? 'success' :
                      pipeline.status === 'paused' ? 'warning' :
                      pipeline.status === 'error' ? 'error' : 'default'
                    }
                  />
                  <Switch
                    checked={pipeline.status === 'active'}
                    onChange={() => {
                      setProcessingPipelines(prev => prev.map(p =>
                        p.id === pipeline.id 
                          ? { ...p, status: p.status === 'active' ? 'paused' : 'active' }
                          : p
                      ));
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Processing Stages
                </Typography>
                <Stepper orientation="horizontal">
                  {pipeline.stages.map((stage, index) => {
                    const processor = feedProcessors.find(p => p.id === stage.processor);
                    return (
                      <Step key={stage.id} active={stage.enabled} completed={processor?.status === 'running'}>
                        <StepLabel
                          optional={
                            <Typography variant="caption">
                              {processor?.type.replace('_', ' ')}
                            </Typography>
                          }
                          error={processor?.status === 'error'}
                        >
                          {stage.name}
                        </StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Throughput Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Input Rate
                          </Typography>
                          <Typography variant="h6" color="primary.main">
                            {pipeline.throughput.input}/min
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Output Rate
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {pipeline.throughput.output}/min
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Processed
                          </Typography>
                          <Typography variant="body2">
                            {pipeline.throughput.processed}/min
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Filtered
                          </Typography>
                          <Typography variant="body2">
                            {pipeline.throughput.filtered}/min
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Quality Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Accuracy
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {pipeline.quality.accuracy.toFixed(1)}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={pipeline.quality.accuracy}
                              sx={{ flexGrow: 1 }}
                            />
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Completeness
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {pipeline.quality.completeness.toFixed(1)}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={pipeline.quality.completeness}
                              sx={{ flexGrow: 1 }}
                            />
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Freshness
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {pipeline.quality.freshness.toFixed(1)}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={pipeline.quality.freshness}
                              sx={{ flexGrow: 1 }}
                            />
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {pipeline.feeds.slice(0, 3).map(feedId => {
                    const feed = threatFeeds.find(f => f.id === feedId);
                    return feed ? (
                      <Chip
                        key={feedId}
                        size="small"
                        label={feed.provider}
                        variant="outlined"
                      />
                    ) : null;
                  })}
                  {pipeline.feeds.length > 3 && (
                    <Chip
                      size="small"
                      label={`+${pipeline.feeds.length - 3} more`}
                      variant="outlined"
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPipeline(pipeline);
                      setPipelineDetailsOpen(true);
                    }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Edit pipeline
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render real-time monitoring
  const renderRealTimeMonitoring = () => (
    <Grid container spacing={3}>
      {/* Real-time Status */}
      <Grid item xs={12}>
        <Alert
          severity={connectionStatus === 'connected' ? 'success' : 'warning'}
          icon={connectionStatus === 'connected' ? <Wifi /> : <SignalWifiOff />}
          action={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption">
                {connectionStatus === 'connected' ? 'Live' : 'Disconnected'}
              </Typography>
              <Switch
                checked={realTimeEnabled}
                onChange={(e) => setRealTimeEnabled(e.target.checked)}
                size="small"
              />
            </Box>
          }
        >
          Real-time feed monitoring is {connectionStatus}
        </Alert>
      </Grid>

      {/* Live Metrics Cards */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <Stream />
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {liveMetrics.totalThroughput || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Items/min
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {dashboardStats.activeFeeds}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Feeds
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                    <Memory />
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {liveMetrics.queueSize || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Queue Size
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                    <Speed />
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {Math.round(liveMetrics.avgLatency || 0)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg Latency (ms)
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: liveMetrics.errorRate > 5 ? theme.palette.error.main : theme.palette.success.main }}>
                    <Error />
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {(liveMetrics.errorRate || 0).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Error Rate
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                    <Transform />
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {dashboardStats.runningProcessors}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Processors
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Processing Performance Chart */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Feed Processing Performance (Last 24 Hours)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={Array.from({ length: 24 }, (_, i) => ({
                  hour: `${23 - i}h ago`,
                  throughput: Math.floor(Math.random() * 500) + 200,
                  latency: Math.random() * 50 + 20,
                  errors: Math.floor(Math.random() * 20),
                  quality: Math.random() * 10 + 85
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="throughput" fill={theme.palette.primary.main} name="Throughput" />
                <Line yAxisId="right" type="monotone" dataKey="latency" stroke={theme.palette.warning.main} name="Latency (ms)" />
                <Line yAxisId="right" type="monotone" dataKey="quality" stroke={theme.palette.success.main} name="Quality Score" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Feed Health Overview */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Feed Health Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={[
                    { name: 'Healthy', value: threatFeeds.filter(f => f.health.status === 'healthy').length, fill: theme.palette.success.main },
                    { name: 'Degraded', value: threatFeeds.filter(f => f.health.status === 'degraded').length, fill: theme.palette.warning.main },
                    { name: 'Unhealthy', value: threatFeeds.filter(f => f.health.status === 'unhealthy').length, fill: theme.palette.error.main },
                    { name: 'Offline', value: threatFeeds.filter(f => f.health.status === 'offline').length, fill: theme.palette.grey[500] }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({name, value}) => `${name}: ${value}`}
                >
                  {[
                    { fill: theme.palette.success.main },
                    { fill: theme.palette.warning.main },
                    { fill: theme.palette.error.main },
                    { fill: theme.palette.grey[500] }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Automated Threat Feed Processing
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Real-time threat intelligence feed ingestion, processing, and enrichment
        </Typography>
      </Box>

      {/* Dashboard Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <Rss />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {dashboardStats.totalFeeds}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Feeds
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {dashboardStats.healthyFeeds}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Healthy
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <DataUsage />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {(dashboardStats.totalIngested / 1000000).toFixed(1)}M
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Items Ingested
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <Assessment />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {dashboardStats.avgQuality}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Quality
                  </Typography>
                </Box>
              </Box>
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
              placeholder="Search feeds, providers..."
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
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Provider</InputLabel>
              <Select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                label="Provider"
              >
                <MenuItem value="all">All Providers</MenuItem>
                <MenuItem value="VirusTotal">VirusTotal</MenuItem>
                <MenuItem value="Hybrid Analysis">Hybrid Analysis</MenuItem>
                <MenuItem value="URLVoid">URLVoid</MenuItem>
                <MenuItem value="AbuseIPDB">AbuseIPDB</MenuItem>
                <MenuItem value="ThreatConnect">ThreatConnect</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Health</InputLabel>
              <Select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
                label="Health"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="healthy">Healthy</MenuItem>
                <MenuItem value="degraded">Degraded</MenuItem>
                <MenuItem value="unhealthy">Unhealthy</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                label="Time Range"
              >
                <MenuItem value="1h">Last Hour</MenuItem>
                <MenuItem value="6h">Last 6 Hours</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateFeedOpen(true)}
              >
                Add Feed
              </Button>
              <Button
                variant="outlined"
                startIcon={<Settings />}
                onClick={() => setSettingsOpen(true)}
              >
                Settings
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content Tabs */}
      <Paper>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Feed Overview" icon={<Rss />} />
          <Tab label="Processing Pipeline" icon={<Transform />} />
          <Tab label="Real-time Monitoring" icon={<Analytics />} />
          <Tab label="Quality Metrics" icon={<Assessment />} />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            {activeTab === 0 && renderFeedOverview()}
            {activeTab === 1 && renderProcessingPipeline()}
            {activeTab === 2 && renderRealTimeMonitoring()}
            {activeTab === 3 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Quality Metrics Dashboard</Typography>
                <Typography variant="body2" color="textSecondary">
                  Detailed quality metrics analysis coming soon...
                </Typography>
              </Paper>
            )}
          </>
        )}
      </Box>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Feed Processing Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Add />}
          tooltipTitle="Add Feed"
          onClick={() => setCreateFeedOpen(true)}
        />
        <SpeedDialAction
          icon={<PlayArrow />}
          tooltipTitle="Start All"
          onClick={() => {/* Start all feeds */}}
        />
        <SpeedDialAction
          icon={<Refresh />}
          tooltipTitle="Refresh All"
          onClick={() => {/* Refresh all feeds */}}
        />
        <SpeedDialAction
          icon={<Settings />}
          tooltipTitle="Settings"
          onClick={() => setSettingsOpen(true)}
        />
      </SpeedDial>

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

export default AutomatedThreatFeedProcessor;
