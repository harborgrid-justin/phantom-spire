/**
 * API Management and External Service Integration Dashboard
 * Comprehensive API and service integration management platform
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
  CardHeader,
  AvatarGroup
} from '@mui/material';

import {
  Api,
  Hub,
  DeviceHub,
  Cloud,
  CloudSync,
  CloudDone,
  CloudOff,
  Storage,
  Dataset,
  NetworkCheck,
  Router,
  Security,
  Shield,
  VpnKey,
  Key,
  Lock,
  LockOpen,
  Http,
  Https,
  Code,
  DataObject,
  Functions,
  Transform,
  CompareArrows,
  Sync,
  SyncProblem,
  CheckCircle,  Error as ErrorIcon,
  Warning,
  Info,
  Schedule,
  Timer,
  Speed,
  Timeline as TimelineIcon,
  TrendingUp,
  TrendingDown,
  Analytics,
  Assessment,
  Insights,
  Calculate,
  Schema,
  GroupWork,
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
  DataUsage,
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
  ShowChart,
  BarChart,
  PieChart,
  DonutLarge,
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
  BugReport,
  Build,
  Engineering,
  AdminPanelSettings,
  ManageAccounts,
  AccountBox,
  SupervisorAccount
} from '@mui/icons-material';

import { LineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, ComposedChart, Pie } from 'recharts';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';

// Enhanced Interfaces for API Management and External Service Integration
interface ApiEndpoint {
  id: string;
  name: string;
  description: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  version: string;
  category: 'threat-intel' | 'siem' | 'soar' | 'vulnerability' | 'forensics' | 'compliance' | 'other';
  provider: string;
  status: 'active' | 'inactive' | 'deprecated' | 'maintenance' | 'testing';
  authentication: AuthenticationMethod;
  rateLimit: RateLimitConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
  documentation: DocumentationConfig;
  testing: TestingConfig;
  caching: CachingConfig;
  transformation: TransformationConfig;
  validation: ValidationConfig;
  errorHandling: ErrorHandlingConfig;
  metrics: EndpointMetrics;
  alerts: EndpointAlert[];
  dependencies: string[];
  tags: string[];
  enabled: boolean;
  priority: number;
  cost: number;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthenticationMethod {
  type: 'none' | 'api-key' | 'bearer' | 'oauth1' | 'oauth2' | 'basic' | 'digest' | 'custom';
  location: 'header' | 'query' | 'body';
  keyName?: string;
  credentials: Record<string, string>;
  scopes?: string[];
  tokenUrl?: string;
  refreshUrl?: string;
  expiresAt?: Date;
  autoRefresh: boolean;
}

interface RateLimitConfig {
  enabled: boolean;
  requests: number;
  period: number; // seconds
  burst: number;
  currentUsage: number;
  remaining: number;
  resetTime?: Date;
  strategy: 'fixed-window' | 'sliding-window' | 'token-bucket';
}

interface SecurityConfig {
  tls: boolean;
  certificateValidation: boolean;
  allowedOrigins: string[];
  ipWhitelist: string[];
  ipBlacklist: string[];
  userAgent: string;
  customHeaders: Record<string, string>;
  encryption: boolean;
  signing: boolean;
}

interface MonitoringConfig {
  enabled: boolean;
  healthCheck: HealthCheckConfig;
  logging: LoggingConfig;
  metrics: MetricsConfig;
  alerting: AlertingConfig;
  tracing: boolean;
}

interface HealthCheckConfig {
  enabled: boolean;
  interval: number; // seconds
  timeout: number; // seconds
  retries: number;
  endpoint?: string;
  expectedStatus: number[];
  expectedContent?: string;
}

interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  requests: boolean;
  responses: boolean;
  errors: boolean;
  performance: boolean;
  sanitization: boolean;
}

interface MetricsConfig {
  enabled: boolean;
  responseTime: boolean;
  throughput: boolean;
  errorRate: boolean;
  availability: boolean;
  customMetrics: string[];
}

interface AlertingConfig {
  enabled: boolean;
  conditions: AlertCondition[];
  channels: string[];
  escalation: EscalationPolicy[];
}

interface AlertCondition {
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '=' | '!=';
  threshold: number;
  duration: number; // seconds
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface EscalationPolicy {
  level: number;
  delay: number; // seconds
  recipients: string[];
  actions: string[];
}

interface DocumentationConfig {
  enabled: boolean;
  openApi: boolean;
  examples: ApiExample[];
  changelog: ChangelogEntry[];
  guides: GuideEntry[];
}

interface ApiExample {
  id: string;
  name: string;
  description: string;
  request: any;
  response: any;
  language: string;
  category: string;
}

interface ChangelogEntry {
  version: string;
  date: Date;
  changes: string[];
  breaking: boolean;
}

interface GuideEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  order: number;
}

interface TestingConfig {
  enabled: boolean;
  automated: boolean;
  schedule: string; // cron expression
  testSuites: TestSuite[];
  coverage: number;
  lastRun?: Date;
  nextRun?: Date;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  tests: ApiTest[];
  enabled: boolean;
}

interface ApiTest {
  id: string;
  name: string;
  description: string;
  request: TestRequest;
  assertions: TestAssertion[];
  enabled: boolean;
}

interface TestRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  timeout: number;
}

interface TestAssertion {
  type: 'status' | 'header' | 'body' | 'response-time' | 'custom';
  property?: string;
  operator: string;
  expected: any;
  message: string;
}

interface CachingConfig {
  enabled: boolean;
  strategy: 'memory' | 'redis' | 'database' | 'cdn';
  ttl: number; // seconds
  invalidation: 'time-based' | 'event-based' | 'manual';
  compression: boolean;
  encryption: boolean;
}

interface TransformationConfig {
  enabled: boolean;
  requestTransform: TransformationRule[];
  responseTransform: TransformationRule[];
  errorTransform: TransformationRule[];
}

interface TransformationRule {
  id: string;
  name: string;
  condition?: string;
  script: string;
  language: 'javascript' | 'jq' | 'jsonata' | 'custom';
  enabled: boolean;
}

interface ValidationConfig {
  enabled: boolean;
  requestValidation: ValidationRule[];
  responseValidation: ValidationRule[];
  strictMode: boolean;
}

interface ValidationRule {
  field: string;
  type: 'required' | 'type' | 'format' | 'range' | 'enum' | 'custom';
  parameters: any;
  message: string;
}

interface ErrorHandlingConfig {
  retries: number;
  backoffStrategy: 'exponential' | 'linear' | 'fixed';
  retryConditions: string[];
  circuitBreaker: CircuitBreakerConfig;
  fallback: FallbackConfig;
}

interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  recoveryTimeout: number; // seconds
  monitoringPeriod: number; // seconds
}

interface FallbackConfig {
  enabled: boolean;
  strategy: 'cache' | 'default-response' | 'alternative-endpoint';
  config: any;
}

interface EndpointMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  throughput: number; // requests per second
  errorRate: number; // percentage
  availability: number; // percentage
  lastError?: string;
  lastErrorTime?: Date;
  uptime: number; // percentage
  dataTransferred: number; // bytes
}

interface EndpointAlert {
  id: string;
  endpointId: string;
  type: 'error' | 'warning' | 'info' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  details?: any;
  source: string;
}

const ApiManagementExternalService: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // API Management States
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [endpointDetailOpen, setEndpointDetailOpen] = useState(false);
  const [createEndpointOpen, setCreateEndpointOpen] = useState(false);
  const [testEndpointOpen, setTestEndpointOpen] = useState(false);
  
  // Filter and Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  
  // View States
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'lastUsed' | 'priority' | 'cost' | 'responseTime'>('lastUsed');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Testing States
  const [testingEndpoints, setTestingEndpoints] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testProgress, setTestProgress] = useState<Record<string, number>>({});
  
  // Analytics States
  const [apiMetrics, setApiMetrics] = useState<any>({});
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [errorData, setErrorData] = useState<any[]>([]);
  const [providerStats, setProviderStats] = useState<any[]>([]);

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('api-management-external-service', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 190000
    });

    return () => evaluationController.remove();
  }, []);

  // Load data
  useEffect(() => {
    loadEndpoints();
    loadAnalytics();
  }, []);

  const loadEndpoints = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 900));
      
      const mockEndpoints: ApiEndpoint[] = generateMockEndpoints();
      setEndpoints(mockEndpoints);
      
    } catch (err) {
      setError('Failed to load API endpoints');
      console.error('Error loading endpoints:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const metrics = generateApiMetrics();
      setApiMetrics(metrics);
      
      const performance = generatePerformanceData();
      setPerformanceData(performance);
      
      const errors = generateErrorData();
      setErrorData(errors);
      
      const providers = generateProviderStats();
      setProviderStats(providers);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  // Generate mock data
  const generateMockEndpoints = useCallback((): ApiEndpoint[] => {
    const providers = ['VirusTotal', 'Shodan', 'IBM X-Force', 'ThreatConnect', 'Recorded Future', 'CrowdStrike', 'FireEye', 'Symantec', 'Palo Alto', 'Check Point'];
    const methods: ApiEndpoint['method'][] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const categories: ApiEndpoint['category'][] = ['threat-intel', 'siem', 'soar', 'vulnerability', 'forensics', 'compliance'];
    const statuses: ApiEndpoint['status'][] = ['active', 'inactive', 'deprecated', 'maintenance', 'testing'];
    
    return Array.from({ length: 40 }, (_, index) => ({
      id: `endpoint-${index + 1}`,
      name: `${providers[index % providers.length]} API v${Math.floor(index / 10) + 1}`,
      description: `API endpoint for ${providers[index % providers.length]} integration`,
      url: `https://api.${providers[index % providers.length].toLowerCase().replace(/\s+/g, '')}.com/v${Math.floor(index / 10) + 1}`,
      method: methods[index % methods.length],
      version: `v${Math.floor(index / 10) + 1}.${index % 10}`,
      category: categories[index % categories.length],
      provider: providers[index % providers.length],
      status: statuses[index % statuses.length],
      authentication: generateAuthenticationMethod(),
      rateLimit: generateRateLimitConfig(),
      security: generateSecurityConfig(),
      monitoring: generateMonitoringConfig(),
      documentation: generateDocumentationConfig(),
      testing: generateTestingConfig(),
      caching: generateCachingConfig(),
      transformation: generateTransformationConfig(),
      validation: generateValidationConfig(),
      errorHandling: generateErrorHandlingConfig(),
      metrics: generateEndpointMetrics(),
      alerts: generateEndpointAlerts(),
      dependencies: index > 0 && Math.random() > 0.7 ? [`endpoint-${index}`] : [],
      tags: [`tag-${index % 8 + 1}`, `category-${index % 6 + 1}`],
      enabled: Math.random() > 0.1,
      priority: Math.floor(Math.random() * 10) + 1,
      cost: Math.floor(Math.random() * 1000) + 50,
      lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    }));
  }, []);

  const generateAuthenticationMethod = (): AuthenticationMethod => {
    const types: AuthenticationMethod['type'][] = ['none', 'api-key', 'bearer', 'oauth2', 'basic'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      type,
      location: 'header',
      keyName: type === 'api-key' ? 'X-API-Key' : undefined,
      credentials: type !== 'none' ? { key: 'dummy-value' } : {},
      scopes: type === 'oauth2' ? ['read', 'write'] : undefined,
      autoRefresh: type === 'oauth2'
    };
  };

  const generateRateLimitConfig = (): RateLimitConfig => ({
    enabled: Math.random() > 0.2,
    requests: Math.floor(Math.random() * 1000) + 100,
    period: [60, 300, 3600][Math.floor(Math.random() * 3)],
    burst: Math.floor(Math.random() * 100) + 10,
    currentUsage: Math.floor(Math.random() * 500),
    remaining: Math.floor(Math.random() * 500) + 100,
    resetTime: new Date(Date.now() + Math.random() * 60 * 60 * 1000),
    strategy: 'sliding-window'
  });

  const generateSecurityConfig = (): SecurityConfig => ({
    tls: Math.random() > 0.1,
    certificateValidation: Math.random() > 0.2,
    allowedOrigins: ['https://app.company.com'],
    ipWhitelist: [],
    ipBlacklist: [],
    userAgent: 'ThreatIntel-Platform/1.0',
    customHeaders: {},
    encryption: Math.random() > 0.3,
    signing: Math.random() > 0.6
  });

  const generateMonitoringConfig = (): MonitoringConfig => ({
    enabled: Math.random() > 0.1,
    healthCheck: {
      enabled: Math.random() > 0.2,
      interval: 300,
      timeout: 10,
      retries: 3,
      expectedStatus: [200, 201, 204],
      expectedContent: undefined
    },
    logging: {
      level: 'info',
      requests: true,
      responses: false,
      errors: true,
      performance: true,
      sanitization: true
    },
    metrics: {
      enabled: true,
      responseTime: true,
      throughput: true,
      errorRate: true,
      availability: true,
      customMetrics: []
    },
    alerting: {
      enabled: Math.random() > 0.3,
      conditions: [
        {
          metric: 'response_time',
          operator: '>',
          threshold: 5000,
          duration: 300,
          severity: 'high'
        }
      ],
      channels: ['email', 'slack'],
      escalation: []
    },
    tracing: Math.random() > 0.5
  });

  const generateDocumentationConfig = (): DocumentationConfig => ({
    enabled: Math.random() > 0.2,
    openApi: Math.random() > 0.3,
    examples: [],
    changelog: [],
    guides: []
  });

  const generateTestingConfig = (): TestingConfig => ({
    enabled: Math.random() > 0.4,
    automated: Math.random() > 0.5,
    schedule: '0 */6 * * *', // Every 6 hours
    testSuites: [],
    coverage: Math.floor(Math.random() * 40) + 60,
    lastRun: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : undefined,
    nextRun: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000)
  });

  const generateCachingConfig = (): CachingConfig => ({
    enabled: Math.random() > 0.4,
    strategy: ['memory', 'redis', 'database'][Math.floor(Math.random() * 3)] as any,
    ttl: Math.floor(Math.random() * 3600) + 300,
    invalidation: 'time-based',
    compression: Math.random() > 0.5,
    encryption: Math.random() > 0.7
  });

  const generateTransformationConfig = (): TransformationConfig => ({
    enabled: Math.random() > 0.6,
    requestTransform: [],
    responseTransform: [],
    errorTransform: []
  });

  const generateValidationConfig = (): ValidationConfig => ({
    enabled: Math.random() > 0.3,
    requestValidation: [],
    responseValidation: [],
    strictMode: false
  });

  const generateErrorHandlingConfig = (): ErrorHandlingConfig => ({
    retries: Math.floor(Math.random() * 5) + 1,
    backoffStrategy: 'exponential',
    retryConditions: ['timeout', '5xx'],
    circuitBreaker: {
      enabled: Math.random() > 0.6,
      failureThreshold: 5,
      recoveryTimeout: 60,
      monitoringPeriod: 300
    },
    fallback: {
      enabled: Math.random() > 0.8,
      strategy: 'cache',
      config: {}
    }
  });

  const generateEndpointMetrics = (): EndpointMetrics => ({
    totalRequests: Math.floor(Math.random() * 100000) + 1000,
    successfulRequests: Math.floor(Math.random() * 90000) + 900,
    failedRequests: Math.floor(Math.random() * 1000) + 10,
    averageResponseTime: Math.floor(Math.random() * 2000) + 100,
    minResponseTime: Math.floor(Math.random() * 50) + 10,
    maxResponseTime: Math.floor(Math.random() * 5000) + 500,
    throughput: Math.floor(Math.random() * 100) + 10,
    errorRate: Math.random() * 0.1,
    availability: Math.random() * 0.1 + 0.9,
    lastError: Math.random() > 0.7 ? 'Connection timeout' : undefined,
    lastErrorTime: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : undefined,
    uptime: Math.random() * 0.05 + 0.95,
    dataTransferred: Math.floor(Math.random() * 10000000000) + 1000000
  });

  const generateEndpointAlerts = (): EndpointAlert[] => {
    return Array.from({ length: Math.floor(Math.random() * 3) }, (_, index) => ({
      id: `alert-${index + 1}`,
      endpointId: 'endpoint-1',
      type: ['error', 'warning', 'info'][index % 3] as any,
      severity: ['low', 'medium', 'high', 'critical'][index % 4] as any,
      message: `Endpoint alert ${index + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      acknowledged: Math.random() > 0.5,
      source: 'monitoring-system'
    }));
  };

  const generateApiMetrics = () => ({
    totalEndpoints: 40,
    activeEndpoints: 35,
    totalRequests: 2500000,
    requestsToday: 45000,
    averageResponseTime: 350,
    errorRate: 0.025,
    availability: 0.994,
    totalCost: 25000
  });

  const generatePerformanceData = () => {
    return Array.from({ length: 24 }, (_, index) => ({
      hour: index,
      requests: Math.floor(Math.random() * 2000) + 1000,
      responseTime: Math.floor(Math.random() * 200) + 200,
      errors: Math.floor(Math.random() * 50) + 5,
      availability: Math.random() * 0.05 + 0.95
    }));
  };

  const generateErrorData = () => {
    return [
      { type: 'Timeout', count: 150, percentage: 35 },
      { type: '5xx Server Error', count: 120, percentage: 28 },
      { type: 'Rate Limit', count: 80, percentage: 19 },
      { type: '4xx Client Error', count: 50, percentage: 12 },
      { type: 'Network Error', count: 25, percentage: 6 }
    ];
  };

  const generateProviderStats = () => {
    return [
      { provider: 'VirusTotal', endpoints: 8, requests: 250000, cost: 5000, responseTime: 280 },
      { provider: 'Shodan', endpoints: 5, requests: 180000, cost: 2500, responseTime: 320 },
      { provider: 'IBM X-Force', endpoints: 6, requests: 200000, cost: 4000, responseTime: 250 },
      { provider: 'ThreatConnect', endpoints: 4, requests: 150000, cost: 3500, responseTime: 380 },
      { provider: 'CrowdStrike', endpoints: 7, requests: 220000, cost: 6000, responseTime: 190 }
    ];
  };

  // Filter and sort endpoints
  const filteredEndpoints = useMemo(() => {
    let filtered = endpoints.filter(endpoint => {
      const matchesSearch = endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          endpoint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          endpoint.provider.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || endpoint.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || endpoint.status === statusFilter;
      const matchesProvider = providerFilter === 'all' || endpoint.provider === providerFilter;
      const matchesMethod = methodFilter === 'all' || endpoint.method === methodFilter;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesProvider && matchesMethod;
    });

    // Sort endpoints
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'lastUsed':
          comparison = a.lastUsed.getTime() - b.lastUsed.getTime();
          break;
        case 'priority':
          comparison = a.priority - b.priority;
          break;
        case 'cost':
          comparison = a.cost - b.cost;
          break;
        case 'responseTime':
          comparison = a.metrics.averageResponseTime - b.metrics.averageResponseTime;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [endpoints, searchTerm, categoryFilter, statusFilter, providerFilter, methodFilter, sortBy, sortOrder]);

  // Test endpoint
  const testEndpoint = useCallback(async (endpointId: string) => {
    setTestingEndpoints(prev => new Set([...prev, endpointId]));
    setTestProgress(prev => ({ ...prev, [endpointId]: 0 }));

    try {
      const endpoint = endpoints.find(e => e.id === endpointId);
      if (!endpoint) return;

      // Simulate testing process
      const tests = ['Authentication', 'Response Format', 'Error Handling', 'Performance', 'Security'];
      
      for (let i = 0; i < tests.length; i++) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 500));
        
        setTestProgress(prev => ({
          ...prev,
          [endpointId]: Math.round(((i + 1) / tests.length) * 100)
        }));
      }

      // Generate test results
      const results = {
        success: Math.random() > 0.2,
        responseTime: Math.floor(Math.random() * 1000) + 100,
        statusCode: Math.random() > 0.1 ? 200 : 500,
        tests: tests.map(test => ({
          name: test,
          passed: Math.random() > 0.15,
          duration: Math.floor(Math.random() * 200) + 50
        })),
        timestamp: new Date()
      };

      setTestResults(prev => ({
        ...prev,
        [endpointId]: results
      }));

    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setTestingEndpoints(prev => {
        const newSet = new Set(prev);
        newSet.delete(endpointId);
        return newSet;
      });
    }
  }, [endpoints]);

  // Render status chip
  const renderStatusChip = (status: ApiEndpoint['status']) => {
    const colors = {
      active: { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) },
      inactive: { color: theme.palette.grey[600], bg: alpha(theme.palette.grey[500], 0.1) },
      deprecated: { color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.1) },
      maintenance: { color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) },
      testing: { color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.1) }
    };

    const icons = {
      active: <CheckCircle sx={{ fontSize: 16 }} />,
      inactive: <Pause sx={{ fontSize: 16 }} />,
      deprecated: <ErrorIcon sx={{ fontSize: 16 }} />,
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

  // Render method chip
  const renderMethodChip = (method: ApiEndpoint['method']) => {
    const colors = {
      GET: { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) },
      POST: { color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1) },
      PUT: { color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) },
      DELETE: { color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.1) },
      PATCH: { color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.1) },
      HEAD: { color: theme.palette.grey[600], bg: alpha(theme.palette.grey[500], 0.1) },
      OPTIONS: { color: theme.palette.secondary.main, bg: alpha(theme.palette.secondary.main, 0.1) }
    };

    return (
      <Chip
        size="small"
        label={method}
        sx={{
          color: colors[method].color,
          backgroundColor: colors[method].bg,
          fontFamily: 'monospace',
          fontWeight: 'bold'
        }}
      />
    );
  };

  // Render endpoint grid
  const renderEndpointGrid = () => (
    <Grid container spacing={2}>
      {filteredEndpoints.map((endpoint) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={endpoint.id}>
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
              setSelectedEndpoint(endpoint);
              setEndpointDetailOpen(true);
            }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <Api />
                </Avatar>
              }
              title={
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                  {endpoint.name}
                </Typography>
              }
              subheader={endpoint.provider}
              action={
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {renderMethodChip(endpoint.method)}
                  {testingEndpoints.has(endpoint.id) && (
                    <CircularProgress size={16} />
                  )}
                </Box>
              }
            />
            
            <CardContent sx={{ pt: 0 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }} noWrap>
                {endpoint.description}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                {renderStatusChip(endpoint.status)}
                <Chip size="small" label={endpoint.category} variant="outlined" />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Avg: {endpoint.metrics.averageResponseTime}ms
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {(endpoint.metrics.availability * 100).toFixed(1)}% uptime
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="textSecondary">
                  {endpoint.metrics.totalRequests.toLocaleString()} requests
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  ${endpoint.cost}/mo
                </Typography>
              </Box>
              
              {testingEndpoints.has(endpoint.id) && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={testProgress[endpoint.id] || 0} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {testProgress[endpoint.id] || 0}% complete
                  </Typography>
                </Box>
              )}
            </CardContent>
            
            <CardActions>
              <Button
                size="small"
                startIcon={<BugReport />}
                onClick={(e) => {
                  e.stopPropagation();
                  testEndpoint(endpoint.id);
                }}
                disabled={testingEndpoints.has(endpoint.id)}
              >
                Test
              </Button>
              <Button
                size="small"
                startIcon={<Settings />}
                onClick={(e) => {
                  e.stopPropagation();
                  // Open configuration dialog
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

  // Render analytics dashboard
  const renderAnalyticsDashboard = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Api sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6">Total Endpoints</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {apiMetrics.totalEndpoints}
            </Typography>
            <Typography variant="body2" color="success.main">
              {apiMetrics.activeEndpoints} active
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Http sx={{ mr: 1, color: theme.palette.info.main }} />
              <Typography variant="h6">Total Requests</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {(apiMetrics.totalRequests / 1000000).toFixed(1)}M
            </Typography>
            <Typography variant="body2" color="success.main">
              {(apiMetrics.requestsToday / 1000).toFixed(0)}K today
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Speed sx={{ mr: 1, color: theme.palette.warning.main }} />
              <Typography variant="h6">Avg Response</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {apiMetrics.averageResponseTime}ms
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircle sx={{ mr: 1, color: theme.palette.success.main }} />
              <Typography variant="h6">Availability</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {(apiMetrics.availability * 100).toFixed(2)}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Chart */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            API Performance (24 Hours)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="requests" fill={theme.palette.primary.main} name="Requests" />
              <Line yAxisId="right" type="monotone" dataKey="responseTime" stroke={theme.palette.secondary.main} name="Response Time (ms)" />
            </ComposedChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Error Distribution */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Error Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={errorData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                label={({ type, percentage }) => `${type}: ${percentage}%`}
              >
                {errorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={theme.palette.error.main} fillOpacity={0.8 - index * 0.15} />
                ))}
              </Pie>
              <RechartsTooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Provider Statistics */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Provider Statistics
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Provider</TableCell>
                  <TableCell align="right">Endpoints</TableCell>
                  <TableCell align="right">Requests</TableCell>
                  <TableCell align="right">Monthly Cost</TableCell>
                  <TableCell align="right">Avg Response Time</TableCell>
                  <TableCell align="right">Cost Per Request</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {providerStats.map((provider) => (
                  <TableRow key={provider.provider}>
                    <TableCell component="th" scope="row">
                      {provider.provider}
                    </TableCell>
                    <TableCell align="right">{provider.endpoints}</TableCell>
                    <TableCell align="right">{provider.requests.toLocaleString()}</TableCell>
                    <TableCell align="right">${provider.cost.toLocaleString()}</TableCell>
                    <TableCell align="right">{provider.responseTime}ms</TableCell>
                    <TableCell align="right">${(provider.cost / provider.requests * 1000).toFixed(4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  // Main render
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          API Management & External Service Integration
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive API and service integration management platform
        </Typography>
      </Box>

      {/* Header Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search endpoints..."
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
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="threat-intel">Threat Intel</MenuItem>
                <MenuItem value="siem">SIEM</MenuItem>
                <MenuItem value="soar">SOAR</MenuItem>
                <MenuItem value="vulnerability">Vulnerability</MenuItem>
                <MenuItem value="forensics">Forensics</MenuItem>
                <MenuItem value="compliance">Compliance</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Method</InputLabel>
              <Select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                label="Method"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="GET">GET</MenuItem>
                <MenuItem value="POST">POST</MenuItem>
                <MenuItem value="PUT">PUT</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
                <MenuItem value="PATCH">PATCH</MenuItem>
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
                <MenuItem value="deprecated">Deprecated</MenuItem>
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
              onClick={() => setCreateEndpointOpen(true)}
            >
              Add Endpoint
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="API Endpoints" />
          <Tab label="Service Integrations" />
          <Tab label="Analytics" />
          <Tab label="Documentation" />
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
              {viewMode === 'grid' ? renderEndpointGrid() : (
                <Typography variant="h6">Table View - Coming Soon</Typography>
              )}
            </>
          )}
          {activeTab === 1 && (
            <Typography variant="h6">Service Integrations - Coming Soon</Typography>
          )}
          {activeTab === 2 && renderAnalyticsDashboard()}
          {activeTab === 3 && (
            <Typography variant="h6">Documentation - Coming Soon</Typography>
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
          tooltipTitle="Add Endpoint"
          onClick={() => setCreateEndpointOpen(true)}
        />
        <SpeedDialAction
          icon={<BugReport />}
          tooltipTitle="Test All Endpoints"
          onClick={() => {
            endpoints.forEach(endpoint => {
              if (endpoint.status === 'active') {
                testEndpoint(endpoint.id);
              }
            });
          }}
        />
        <SpeedDialAction
          icon={<Refresh />}
          tooltipTitle="Refresh Data"
          onClick={() => loadEndpoints()}
        />
      </SpeedDial>
    </Container>
  );
};

export default ApiManagementExternalService;
