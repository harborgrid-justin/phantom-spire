/**
 * Multi-Source Threat Feed Integration Dashboard
 * Comprehensive threat intelligence feed management and integration platform
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
  Stack,
  Container,
  Fab,
  ListItemSecondaryAction,
  ListSubheader,
  CardActions,
  CardHeader
} from '@mui/material';

import {
  CloudDownload,
  Sync,
  SyncProblem,
  CheckCircle,
  Error,
  Warning,
  Info,
  Schedule,
  PlayArrow,
  Pause,
  Stop,
  Settings,
  Edit,
  Delete,
  Add,
  Remove,
  Refresh,
  Download,
  Upload,
  Share,
  FilterList,
  Search,
  Sort,
  ViewModule,
  ViewList,
  ViewComfy,
  GridView,
  Dashboard,
  Analytics,
  Assessment,
  Security,
  Shield,
  BugReport,
  Computer,
  Storage,
  NetworkCheck,
  Hub,
  DeviceHub,
  Transform,
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
  Person,
  Business,
  LocationOn,
  Public,
  Language,
  Code,
  DataUsage,
  Speed,
  Memory,
  Visibility,
  VisibilityOff,
  Star,
  StarBorder,
  Bookmark,
  BookmarkBorder,
  Label,
  LocalOffer,
  Category,
  Class,
  TrendingUp,
  TrendingDown,
  ShowChart,
  BarChart,
  PieChart,
  DonutLarge,
  Timeline as TimelineIcon,
  Event,
  AccessTime,
  Notifications,
  NotificationsActive,
  NotificationsOff,
  Email,
  Sms,
  Phone,
  Message,
  Chat,
  Forum,
  Comment,
  AttachMoney
} from '@mui/icons-material';

import { LineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, ComposedChart, Pie } from 'recharts';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';

// Enhanced Interfaces for Multi-Source Threat Feed Integration
interface ThreatFeed {
  id: string;
  name: string;
  description: string;
  provider: string;
  type: 'commercial' | 'open-source' | 'government' | 'community' | 'internal';
  format: 'stix' | 'misp' | 'json' | 'xml' | 'csv' | 'rss' | 'atom' | 'custom';
  category: 'ioc' | 'malware' | 'apt' | 'vulnerability' | 'reputation' | 'geolocation' | 'mixed';
  url: string;
  status: 'active' | 'inactive' | 'error' | 'maintenance' | 'testing';
  lastSync: Date;
  nextSync: Date;
  syncInterval: number; // minutes
  totalRecords: number;
  newRecords: number;
  quality: number; // 0-100
  reliability: number; // 0-100
  confidence: number; // 0-100
  cost: number; // monthly cost
  rateLimits: RateLimit;
  authentication: AuthConfig;
  transformation: TransformationConfig;
  filtering: FilterConfig;
  enrichment: EnrichmentConfig;
  validation: ValidationConfig;
  retention: RetentionConfig;
  metrics: FeedMetrics;
  alerts: FeedAlert[];
  tags: string[];
  enabled: boolean;
  priority: number;
}

interface RateLimit {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  currentUsage: number;
  resetTime?: Date;
  exceeded: boolean;
}

interface AuthConfig {
  type: 'none' | 'api-key' | 'oauth' | 'basic' | 'bearer' | 'custom';
  credentials: Record<string, string>;
  headers?: Record<string, string>;
  parameters?: Record<string, string>;
  refreshToken?: string;
  expiresAt?: Date;
}

interface TransformationConfig {
  enabled: boolean;
  mappings: FieldMapping[];
  scripts: TransformationScript[];
  validation: boolean;
  normalization: boolean;
}

interface FieldMapping {
  source: string;
  target: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
  transformation?: string;
}

interface TransformationScript {
  id: string;
  name: string;
  description: string;
  language: 'javascript' | 'python' | 'jq' | 'regex';
  script: string;
  enabled: boolean;
}

interface FilterConfig {
  enabled: boolean;
  rules: FilterRule[];
  whitelists: string[];
  blacklists: string[];
  duplicateRemoval: boolean;
}

interface FilterRule {
  id: string;
  name: string;
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'matches' | 'in' | 'not_in';
  value: any;
  action: 'include' | 'exclude' | 'tag' | 'transform';
  enabled: boolean;
}

interface EnrichmentConfig {
  enabled: boolean;
  sources: EnrichmentSource[];
  caching: boolean;
  batchSize: number;
}

interface EnrichmentSource {
  id: string;
  name: string;
  type: 'ip-reputation' | 'domain-reputation' | 'file-analysis' | 'geolocation' | 'whois' | 'custom';
  url: string;
  fields: string[];
  enabled: boolean;
  priority: number;
}

interface ValidationConfig {
  enabled: boolean;
  rules: ValidationRule[];
  strictMode: boolean;
  reportErrors: boolean;
}

interface ValidationRule {
  field: string;
  type: 'format' | 'range' | 'enum' | 'pattern' | 'custom';
  parameters: any;
  message: string;
}

interface RetentionConfig {
  enabled: boolean;
  duration: number; // days
  archival: boolean;
  compression: boolean;
  encryption: boolean;
}

interface FeedMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  dataVolume: number; // bytes
  recordsProcessed: number;
  recordsFiltered: number;
  recordsEnriched: number;
  errors: number;
  uptime: number; // percentage
  slaCompliance: number; // percentage
}

interface FeedAlert {
  id: string;
  feedId: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  details?: any;
}

interface FeedIntegration {
  id: string;
  name: string;
  description: string;
  feeds: string[]; // feed IDs
  processors: IntegrationProcessor[];
  workflow: IntegrationWorkflow;
  outputs: IntegrationOutput[];
  monitoring: IntegrationMonitoring;
  schedule: ScheduleConfig;
  status: 'active' | 'inactive' | 'error' | 'running';
}

interface IntegrationProcessor {
  id: string;
  name: string;
  type: 'correlation' | 'deduplication' | 'normalization' | 'enrichment' | 'aggregation' | 'analysis';
  config: any;
  enabled: boolean;
  order: number;
}

interface IntegrationWorkflow {
  steps: WorkflowStep[];
  parallelProcessing: boolean;
  errorHandling: 'stop' | 'continue' | 'retry';
  retryAttempts: number;
  timeout: number; // minutes
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'input' | 'process' | 'output' | 'decision' | 'delay';
  config: any;
  dependencies: string[];
  enabled: boolean;
}

interface IntegrationOutput {
  id: string;
  name: string;
  type: 'siem' | 'soar' | 'database' | 'file' | 'api' | 'webhook' | 'email';
  config: any;
  enabled: boolean;
  formatting: OutputFormatting;
}

interface OutputFormatting {
  format: 'json' | 'xml' | 'csv' | 'stix' | 'misp' | 'custom';
  template?: string;
  compression?: boolean;
  encryption?: boolean;
}

interface IntegrationMonitoring {
  enabled: boolean;
  metrics: string[];
  alerts: AlertConfig[];
  reporting: ReportConfig;
}

interface AlertConfig {
  id: string;
  name: string;
  condition: string;
  threshold: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  enabled: boolean;
}

interface ReportConfig {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  template: string;
}

interface ScheduleConfig {
  enabled: boolean;
  frequency: 'continuous' | 'interval' | 'cron';
  interval?: number; // minutes
  cron?: string;
  timezone: string;
}

const MultiSourceThreatFeedIntegration: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Feed Management States
  const [feeds, setFeeds] = useState<ThreatFeed[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<ThreatFeed | null>(null);
  const [feedDetailOpen, setFeedDetailOpen] = useState(false);
  const [createFeedOpen, setCreateFeedOpen] = useState(false);
  const [configureFeedOpen, setConfigureFeedOpen] = useState(false);
  
  // Integration States
  const [integrations, setIntegrations] = useState<FeedIntegration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<FeedIntegration | null>(null);
  const [integrationDetailOpen, setIntegrationDetailOpen] = useState(false);
  
  // Filter and Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  
  // View States
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'lastSync' | 'quality' | 'priority' | 'cost'>('lastSync');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Sync States
  const [syncingFeeds, setSyncingFeeds] = useState<Set<string>>(new Set());
  const [syncProgress, setSyncProgress] = useState<Record<string, number>>({});
  const [syncLogs, setSyncLogs] = useState<Record<string, any[]>>({});
  
  // Analytics States
  const [feedAnalytics, setFeedAnalytics] = useState<any>({});
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [qualityData, setQualityData] = useState<any[]>([]);
  const [costAnalysis, setCostAnalysis] = useState<any[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('multi-source-threat-feed-integration', {
      continuous: true,
      position: 'top-left',
      minimized: true,
      interval: 180000
    });

    return () => evaluationController.remove();
  }, []);

  // Load feed data
  useEffect(() => {
    loadFeeds();
    loadIntegrations();
    loadAnalytics();
  }, []);

  const loadFeeds = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockFeeds: ThreatFeed[] = generateMockFeeds();
      setFeeds(mockFeeds);
      
    } catch (err) {
      setError('Failed to load threat feeds');
      console.error('Error loading feeds:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadIntegrations = async () => {
    try {
      const integrations = generateMockIntegrations();
      setIntegrations(integrations);
    } catch (err) {
      console.error('Error loading integrations:', err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analytics = generateFeedAnalytics();
      setFeedAnalytics(analytics);
      
      const performance = generatePerformanceData();
      setPerformanceData(performance);
      
      const quality = generateQualityData();
      setQualityData(quality);
      
      const cost = generateCostAnalysis();
      setCostAnalysis(cost);
      
      const volume = generateVolumeData();
      setVolumeData(volume);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  // Generate mock data
  const generateMockFeeds = useCallback((): ThreatFeed[] => {
    const providers = ['VirusTotal', 'AlienVault OTX', 'ThreatConnect', 'Recorded Future', 'CrowdStrike', 'FireEye', 'IBM X-Force', 'Proofpoint', 'Symantec', 'Palo Alto Networks'];
    const types: ThreatFeed['type'][] = ['commercial', 'open-source', 'government', 'community', 'internal'];
    const formats: ThreatFeed['format'][] = ['stix', 'misp', 'json', 'xml', 'csv', 'rss'];
    const categories: ThreatFeed['category'][] = ['ioc', 'malware', 'apt', 'vulnerability', 'reputation', 'geolocation'];
    const statuses: ThreatFeed['status'][] = ['active', 'inactive', 'error', 'maintenance', 'testing'];
    
    return Array.from({ length: 30 }, (_, index) => ({
      id: `feed-${index + 1}`,
      name: `${providers[index % providers.length]} Feed ${index + 1}`,
      description: `Threat intelligence feed from ${providers[index % providers.length]}`,
      provider: providers[index % providers.length],
      type: types[index % types.length],
      format: formats[index % formats.length],
      category: categories[index % categories.length],
      url: `https://api.${providers[index % providers.length].toLowerCase().replace(/\s+/g, '')}.com/feed${index + 1}`,
      status: statuses[index % statuses.length],
      lastSync: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      nextSync: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000),
      syncInterval: [5, 15, 30, 60, 120, 240][index % 6],
      totalRecords: Math.floor(Math.random() * 100000) + 1000,
      newRecords: Math.floor(Math.random() * 1000),
      quality: Math.floor(Math.random() * 30) + 70,
      reliability: Math.floor(Math.random() * 20) + 80,
      confidence: Math.floor(Math.random() * 25) + 75,
      cost: Math.floor(Math.random() * 5000) + 100,
      rateLimits: generateRateLimit(),
      authentication: generateAuthConfig(),
      transformation: generateTransformationConfig(),
      filtering: generateFilterConfig(),
      enrichment: generateEnrichmentConfig(),
      validation: generateValidationConfig(),
      retention: generateRetentionConfig(),
      metrics: generateFeedMetrics(),
      alerts: generateFeedAlerts(),
      tags: [`tag-${index % 8 + 1}`, `category-${index % 6 + 1}`],
      enabled: Math.random() > 0.1,
      priority: Math.floor(Math.random() * 10) + 1
    }));
  }, []);

  const generateRateLimit = (): RateLimit => ({
    requestsPerSecond: Math.floor(Math.random() * 10) + 1,
    requestsPerMinute: Math.floor(Math.random() * 100) + 10,
    requestsPerHour: Math.floor(Math.random() * 1000) + 100,
    requestsPerDay: Math.floor(Math.random() * 10000) + 1000,
    currentUsage: Math.floor(Math.random() * 500),
    resetTime: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 60 * 60 * 1000) : undefined,
    exceeded: Math.random() < 0.1
  });

  const generateAuthConfig = (): AuthConfig => {
    const types: AuthConfig['type'][] = ['none', 'api-key', 'oauth', 'basic', 'bearer'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      type,
      credentials: type === 'api-key' ? { apiKey: 'dummy-key' } : {},
      headers: type === 'bearer' ? { Authorization: 'Bearer token' } : undefined,
      expiresAt: type === 'oauth' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
    };
  };

  const generateTransformationConfig = (): TransformationConfig => ({
    enabled: Math.random() > 0.3,
    mappings: [
      {
        source: 'indicator',
        target: 'ioc',
        type: 'string',
        required: true
      }
    ],
    scripts: [
      {
        id: 'script-1',
        name: 'Data Normalization',
        description: 'Normalize incoming data format',
        language: 'javascript',
        script: 'function transform(data) { return data; }',
        enabled: true
      }
    ],
    validation: true,
    normalization: true
  });

  const generateFilterConfig = (): FilterConfig => ({
    enabled: Math.random() > 0.2,
    rules: [
      {
        id: 'rule-1',
        name: 'Confidence Filter',
        field: 'confidence',
        operator: '>=',
        value: 70,
        action: 'include',
        enabled: true
      }
    ],
    whitelists: ['trusted-source-1'],
    blacklists: ['blocked-source-1'],
    duplicateRemoval: true
  });

  const generateEnrichmentConfig = (): EnrichmentConfig => ({
    enabled: Math.random() > 0.4,
    sources: [
      {
        id: 'enrich-1',
        name: 'IP Reputation',
        type: 'ip-reputation',
        url: 'https://api.reputation.com',
        fields: ['reputation', 'country', 'asn'],
        enabled: true,
        priority: 1
      }
    ],
    caching: true,
    batchSize: 100
  });

  const generateValidationConfig = (): ValidationConfig => ({
    enabled: Math.random() > 0.3,
    rules: [
      {
        field: 'ioc',
        type: 'format',
        parameters: { pattern: '^[a-fA-F0-9]{32}$' },
        message: 'Invalid IOC format'
      }
    ],
    strictMode: false,
    reportErrors: true
  });

  const generateRetentionConfig = (): RetentionConfig => ({
    enabled: true,
    duration: Math.floor(Math.random() * 365) + 30,
    archival: Math.random() > 0.5,
    compression: Math.random() > 0.4,
    encryption: Math.random() > 0.3
  });

  const generateFeedMetrics = (): FeedMetrics => ({
    totalRequests: Math.floor(Math.random() * 10000) + 1000,
    successfulRequests: Math.floor(Math.random() * 9000) + 800,
    failedRequests: Math.floor(Math.random() * 100) + 10,
    averageResponseTime: Math.floor(Math.random() * 1000) + 100,
    dataVolume: Math.floor(Math.random() * 1000000000) + 10000000,
    recordsProcessed: Math.floor(Math.random() * 50000) + 5000,
    recordsFiltered: Math.floor(Math.random() * 5000) + 500,
    recordsEnriched: Math.floor(Math.random() * 10000) + 1000,
    errors: Math.floor(Math.random() * 50) + 5,
    uptime: Math.random() * 0.1 + 0.9,
    slaCompliance: Math.random() * 0.15 + 0.85
  });

  const generateFeedAlerts = (): FeedAlert[] => {
    return Array.from({ length: Math.floor(Math.random() * 5) }, (_, index) => ({
      id: `alert-${index + 1}`,
      feedId: 'feed-1',
      type: ['error', 'warning', 'info', 'success'][index % 4] as any,
      message: `Feed alert ${index + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      acknowledged: Math.random() > 0.5,
      details: { alertIndex: index + 1 }
    }));
  };

  const generateMockIntegrations = (): FeedIntegration[] => {
    return Array.from({ length: 10 }, (_, index) => ({
      id: `integration-${index + 1}`,
      name: `Integration ${index + 1}`,
      description: `Multi-feed integration ${index + 1}`,
      feeds: [`feed-${index + 1}`, `feed-${index + 2}`],
      processors: [
        {
          id: 'processor-1',
          name: 'Correlation Engine',
          type: 'correlation',
          config: {},
          enabled: true,
          order: 1
        }
      ],
      workflow: {
        steps: [],
        parallelProcessing: true,
        errorHandling: 'continue',
        retryAttempts: 3,
        timeout: 60
      },
      outputs: [
        {
          id: 'output-1',
          name: 'SIEM Export',
          type: 'siem',
          config: {},
          enabled: true,
          formatting: {
            format: 'json',
            compression: true
          }
        }
      ],
      monitoring: {
        enabled: true,
        metrics: ['throughput', 'errors', 'latency'],
        alerts: [],
        reporting: {
          enabled: true,
          frequency: 'daily',
          recipients: ['admin@company.com'],
          template: 'standard'
        }
      },
      schedule: {
        enabled: true,
        frequency: 'interval',
        interval: 60,
        timezone: 'UTC'
      },
      status: ['active', 'inactive', 'error', 'running'][index % 4] as any
    }));
  };

  const generateFeedAnalytics = () => ({
    totalFeeds: 30,
    activeFeeds: 25,
    errorFeeds: 2,
    averageQuality: 85,
    totalRecords: 2500000,
    newRecordsToday: 15000,
    totalCost: 45000,
    uptime: 0.95
  });

  const generatePerformanceData = () => {
    return Array.from({ length: 24 }, (_, index) => ({
      hour: index,
      throughput: Math.floor(Math.random() * 1000) + 500,
      latency: Math.floor(Math.random() * 200) + 50,
      errors: Math.floor(Math.random() * 20),
      uptime: Math.random() * 0.1 + 0.9
    }));
  };

  const generateQualityData = () => {
    return [
      { name: 'Excellent (90-100%)', value: 12, color: theme.palette.success.main },
      { name: 'Good (80-89%)', value: 10, color: theme.palette.info.main },
      { name: 'Fair (70-79%)', value: 6, color: theme.palette.warning.main },
      { name: 'Poor (<70%)', value: 2, color: theme.palette.error.main }
    ];
  };

  const generateCostAnalysis = () => {
    return [
      { provider: 'Commercial Premium', cost: 15000, feeds: 8, costPerFeed: 1875 },
      { provider: 'Commercial Standard', cost: 8000, feeds: 6, costPerFeed: 1333 },
      { provider: 'Open Source', cost: 2000, feeds: 12, costPerFeed: 167 },
      { provider: 'Government', cost: 5000, feeds: 3, costPerFeed: 1667 },
      { provider: 'Community', cost: 500, feeds: 4, costPerFeed: 125 }
    ];
  };

  const generateVolumeData = () => {
    return Array.from({ length: 7 }, (_, index) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
      records: Math.floor(Math.random() * 50000) + 20000,
      newRecords: Math.floor(Math.random() * 5000) + 1000,
      filteredRecords: Math.floor(Math.random() * 2000) + 500
    }));
  };

  // Filter and sort feeds
  const filteredFeeds = useMemo(() => {
    let filtered = feeds.filter(feed => {
      const matchesSearch = feed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          feed.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          feed.provider.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || feed.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || feed.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || feed.status === statusFilter;
      const matchesProvider = providerFilter === 'all' || feed.provider === providerFilter;
      
      return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesProvider;
    });

    // Sort feeds
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'lastSync':
          comparison = a.lastSync.getTime() - b.lastSync.getTime();
          break;
        case 'quality':
          comparison = a.quality - b.quality;
          break;
        case 'priority':
          comparison = a.priority - b.priority;
          break;
        case 'cost':
          comparison = a.cost - b.cost;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [feeds, searchTerm, typeFilter, categoryFilter, statusFilter, providerFilter, sortBy, sortOrder]);

  // Sync feed
  const syncFeed = useCallback(async (feedId: string) => {
    setSyncingFeeds(prev => new Set([...prev, feedId]));
    setSyncProgress(prev => ({ ...prev, [feedId]: 0 }));
    setSyncLogs(prev => ({ ...prev, [feedId]: [] }));

    try {
      const feed = feeds.find(f => f.id === feedId);
      if (!feed) return;

      // Simulate sync process
      const steps = ['Connecting', 'Authenticating', 'Downloading', 'Processing', 'Storing'];
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        // Log step start
        setSyncLogs(prev => ({
          ...prev,
          [feedId]: [...prev[feedId], {
            timestamp: new Date(),
            level: 'info',
            message: `${step}...`,
            step
          }]
        }));

        // Simulate step execution
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
        
        // Update progress
        setSyncProgress(prev => ({
          ...prev,
          [feedId]: Math.round(((i + 1) / steps.length) * 100)
        }));

        // Log step completion
        setSyncLogs(prev => ({
          ...prev,
          [feedId]: [...prev[feedId], {
            timestamp: new Date(),
            level: 'success',
            message: `${step} completed`,
            step
          }]
        }));
      }

      // Update feed sync time
      setFeeds(prev => prev.map(f => 
        f.id === feedId 
          ? { ...f, lastSync: new Date(), newRecords: Math.floor(Math.random() * 1000) }
          : f
      ));

    } catch (error) {
      setSyncLogs(prev => ({
        ...prev,
        [feedId]: [...prev[feedId], {
          timestamp: new Date(),
          level: 'error',
          message: `Sync failed: ${error}`,
          step: 'Error'
        }]
      }));
    } finally {
      setSyncingFeeds(prev => {
        const newSet = new Set(prev);
        newSet.delete(feedId);
        return newSet;
      });
    }
  }, [feeds]);

  // Render status chip
  const renderStatusChip = (status: ThreatFeed['status']) => {
    const colors = {
      active: { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) },
      inactive: { color: theme.palette.grey[600], bg: alpha(theme.palette.grey[500], 0.1) },
      error: { color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.1) },
      maintenance: { color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) },
      testing: { color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.1) }
    };

    const icons = {
      active: <CheckCircle sx={{ fontSize: 16 }} />,
      inactive: <Pause sx={{ fontSize: 16 }} />,
      error: <Error sx={{ fontSize: 16 }} />,
      maintenance: <Settings sx={{ fontSize: 16 }} />,
      testing: <Schedule sx={{ fontSize: 16 }} />
    };

    return (
      <Chip
        size="small"
        icon={icons[status]}
        label={status.toUpperCase()}
        sx={{
          color: colors[status].color,
          backgroundColor: colors[status].bg
        }}
      />
    );
  };

  // Render type chip
  const renderTypeChip = (type: ThreatFeed['type']) => {
    const colors = {
      commercial: { color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1) },
      'open-source': { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) },
      government: { color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) },
      community: { color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.1) },
      internal: { color: theme.palette.secondary.main, bg: alpha(theme.palette.secondary.main, 0.1) }
    };

    return (
      <Chip
        size="small"
        label={type.replace('-', ' ').toUpperCase()}
        sx={{
          color: colors[type].color,
          backgroundColor: colors[type].bg
        }}
      />
    );
  };

  // Render feed grid
  const renderFeedGrid = () => (
    <Grid container spacing={2}>
      {filteredFeeds.map((feed) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={feed.id}>
          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4]
              }
            }}
            onClick={() => {
              setSelectedFeed(feed);
              setFeedDetailOpen(true);
            }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <DataUsage />
                </Avatar>
              }
              title={
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                  {feed.name}
                </Typography>
              }
              subheader={feed.provider}
              action={
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {renderStatusChip(feed.status)}
                  {syncingFeeds.has(feed.id) && (
                    <CircularProgress size={16} />
                  )}
                </Box>
              }
            />
            
            <CardContent sx={{ pt: 0 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }} noWrap>
                {feed.description}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                {renderTypeChip(feed.type)}
                <Chip size="small" label={feed.category} variant="outlined" />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Quality: {feed.quality}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={feed.quality}
                  sx={{ width: 60, height: 4 }}
                  color={feed.quality >= 90 ? 'success' : feed.quality >= 80 ? 'info' : feed.quality >= 70 ? 'warning' : 'error'}
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="textSecondary">
                  {feed.totalRecords.toLocaleString()} records
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  ${feed.cost}/mo
                </Typography>
              </Box>
              
              {syncingFeeds.has(feed.id) && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={syncProgress[feed.id] || 0} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {syncProgress[feed.id] || 0}% complete
                  </Typography>
                </Box>
              )}
            </CardContent>
            
            <CardActions>
              <Button
                size="small"
                startIcon={<Sync />}
                onClick={(e) => {
                  e.stopPropagation();
                  syncFeed(feed.id);
                }}
                disabled={syncingFeeds.has(feed.id)}
              >
                Sync
              </Button>
              <Button
                size="small"
                startIcon={<Settings />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFeed(feed);
                  setConfigureFeedOpen(true);
                }}
              >
                Configure
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render feed table
  const renderFeedTable = () => (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Quality</TableCell>
              <TableCell>Records</TableCell>
              <TableCell>Last Sync</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFeeds.map((feed) => (
              <TableRow key={feed.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                      <DataUsage fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {feed.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {feed.description}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{feed.provider}</TableCell>
                <TableCell>
                  {renderTypeChip(feed.type)}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={feed.category} variant="outlined" />
                </TableCell>
                <TableCell>
                  {renderStatusChip(feed.status)}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {feed.quality}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={feed.quality}
                      sx={{ width: 40, height: 4 }}
                      color={feed.quality >= 90 ? 'success' : feed.quality >= 80 ? 'info' : feed.quality >= 70 ? 'warning' : 'error'}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {feed.totalRecords.toLocaleString()}
                    </Typography>
                    {feed.newRecords > 0 && (
                      <Typography variant="caption" color="success.main">
                        +{feed.newRecords.toLocaleString()} new
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {feed.lastSync.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    ${feed.cost.toLocaleString()}/mo
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => syncFeed(feed.id)}
                      disabled={syncingFeeds.has(feed.id)}
                    >
                      <Sync />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setSelectedFeed(feed);
                        setConfigureFeedOpen(true);
                      }}
                    >
                      <Settings />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setSelectedFeed(feed);
                        setFeedDetailOpen(true);
                      }}
                    >
                      <Launch />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  // Render analytics dashboard
  const renderAnalyticsDashboard = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DataUsage sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6">Total Feeds</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {feedAnalytics.totalFeeds}
            </Typography>
            <Typography variant="body2" color="success.main">
              {feedAnalytics.activeFeeds} active
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DataUsage sx={{ mr: 1, color: theme.palette.info.main }} />
              <Typography variant="h6">Total Records</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {(feedAnalytics.totalRecords / 1000000).toFixed(1)}M
            </Typography>
            <Typography variant="body2" color="success.main">
              +{(feedAnalytics.newRecordsToday / 1000).toFixed(0)}K today
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Assessment sx={{ mr: 1, color: theme.palette.warning.main }} />
              <Typography variant="h6">Avg Quality</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {feedAnalytics.averageQuality}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AttachMoney sx={{ mr: 1, color: theme.palette.error.main }} />
              <Typography variant="h6">Monthly Cost</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              ${(feedAnalytics.totalCost / 1000).toFixed(0)}K
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Chart */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Feed Performance (24 Hours)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="throughput" fill={theme.palette.primary.main} name="Throughput" />
              <Line yAxisId="right" type="monotone" dataKey="latency" stroke={theme.palette.secondary.main} name="Latency (ms)" />
            </ComposedChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Quality Distribution */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Feed Quality Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={qualityData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {qualityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Cost Analysis */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Cost Analysis by Provider Type
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={costAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="provider" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="cost" fill={theme.palette.primary.main} name="Total Cost ($)" />
              <Bar dataKey="costPerFeed" fill={theme.palette.secondary.main} name="Cost per Feed ($)" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  // Main render
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Multi-Source Threat Feed Integration
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive threat intelligence feed management and integration platform
        </Typography>
      </Box>

      {/* Header Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
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
              sx={{ minWidth: 250 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="commercial">Commercial</MenuItem>
                <MenuItem value="open-source">Open Source</MenuItem>
                <MenuItem value="government">Government</MenuItem>
                <MenuItem value="community">Community</MenuItem>
                <MenuItem value="internal">Internal</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="ioc">IOC</MenuItem>
                <MenuItem value="malware">Malware</MenuItem>
                <MenuItem value="apt">APT</MenuItem>
                <MenuItem value="vulnerability">Vulnerability</MenuItem>
                <MenuItem value="reputation">Reputation</MenuItem>
                <MenuItem value="geolocation">Geolocation</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="testing">Testing</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
            >
              <ToggleButton value="grid">
                <GridView />
              </ToggleButton>
              <ToggleButton value="table">
                <ViewList />
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateFeedOpen(true)}
            >
              Add Feed
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Feed Management" />
          <Tab label="Integrations" />
          <Tab label="Analytics" />
          <Tab label="Configuration" />
        </Tabs>
      </Paper>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <Box>
          {activeTab === 0 && (
            <>
              {viewMode === 'grid' ? renderFeedGrid() : renderFeedTable()}
            </>
          )}
          {activeTab === 1 && (
            <Typography variant="h6">Feed Integrations - Coming Soon</Typography>
          )}
          {activeTab === 2 && renderAnalyticsDashboard()}
          {activeTab === 3 && (
            <Typography variant="h6">Configuration - Coming Soon</Typography>
          )}
        </Box>
      )}

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Add />}
          tooltipTitle="Add Feed"
          onClick={() => setCreateFeedOpen(true)}
        />
        <SpeedDialAction
          icon={<Sync />}
          tooltipTitle="Sync All Feeds"
          onClick={() => {
            feeds.forEach(feed => {
              if (feed.status === 'active') {
                syncFeed(feed.id);
              }
            });
          }}
        />
        <SpeedDialAction
          icon={<Refresh />}
          tooltipTitle="Refresh Data"
          onClick={() => loadFeeds()}
        />
      </SpeedDial>
    </Container>
  );
};

export default MultiSourceThreatFeedIntegration;
