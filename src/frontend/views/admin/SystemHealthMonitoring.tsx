/**
 * System Health Monitoring and Performance Metrics Dashboard
 * Comprehensive enterprise system monitoring and observability platform
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
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
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
  MonitorHeart,
  Dashboard,
  Analytics,
  Assessment,
  TrendingUp,
  TrendingDown,
  Speed,
  Memory,
  Storage,
  NetworkCheck,
  Computer,
  CloudSync,
  Cloud,
  Database,
  Router,
  Server,
  DeviceHub,
  Hub,
  Security,
  Shield,
  Warning,
  Error,
  CheckCircle,
  Info,
  Schedule,
  Timer,
  AccessTime,
  Event,
  CalendarToday,
  History,
  Timeline as TimelineIcon,
  Insights,
  Calculate,
  Schema,
  GroupWork,
  CompareArrows,
  Search,
  FilterList,
  Sort,
  ViewModule,
  ViewList,
  ViewComfy,
  GridView,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Download,
  Upload,
  Share,
  Launch,
  OpenInNew,
  Settings,
  MoreVert,
  ExpandMore,
  ExpandLess,
  ChevronRight,
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
  ScatterPlot,
  BubbleChart,
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
  Visibility,
  VisibilityOff,
  PowerSettingsNew,
  FlashOn,
  FlashOff,
  SignalCellular4Bar,
  SignalWifi4Bar,
  SignalWifiOff,
  DataUsage,
  CloudDone,
  CloudOff,
  SyncProblem,
  Sync
} from '@mui/icons-material';

import { LineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, TreeMap, ComposedChart, Pie } from 'recharts';
import { addUIUXEvaluation } from '../../services/ui-ux-evaluation/core/UIUXEvaluationService';

// Enhanced Interfaces for System Health Monitoring
interface SystemComponent {
  id: string;
  name: string;
  type: 'application' | 'database' | 'cache' | 'queue' | 'api' | 'service' | 'infrastructure';
  category: 'core' | 'integration' | 'analytics' | 'security' | 'storage' | 'network' | 'monitoring';
  status: 'healthy' | 'warning' | 'critical' | 'offline' | 'maintenance';
  health: HealthStatus;
  performance: PerformanceMetrics;
  resources: ResourceUtilization;
  dependencies: ComponentDependency[];
  alerts: SystemAlert[];
  configuration: ComponentConfig;
  metadata: ComponentMetadata;
  monitoring: MonitoringConfig;
  lastCheck: Date;
  uptime: number;
  version: string;
  environment: 'production' | 'staging' | 'development' | 'test';
  region: string;
  availability: number;
  reliability: number;
}

interface HealthStatus {
  score: number; // 0-100
  checks: HealthCheck[];
  trends: HealthTrend[];
  incidents: IncidentRecord[];
  maintenanceWindows: MaintenanceWindow[];
  degradedFeatures: string[];
}

interface HealthCheck {
  id: string;
  name: string;
  type: 'endpoint' | 'database' | 'service' | 'resource' | 'custom';
  status: 'pass' | 'fail' | 'warning';
  message: string;
  lastRun: Date;
  duration: number;
  threshold: HealthThreshold;
  frequency: number; // seconds
  enabled: boolean;
  retries: number;
  timeout: number;
}

interface HealthThreshold {
  warning: number;
  critical: number;
  unit: string;
  operator: '>' | '<' | '>=' | '<=' | '=' | '!=';
}

interface HealthTrend {
  timestamp: Date;
  score: number;
  status: string;
  details: Record<string, any>;
}

interface IncidentRecord {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  createdAt: Date;
  resolvedAt?: Date;
  duration?: number;
  impact: ImpactAssessment;
  timeline: IncidentEvent[];
  postMortem?: PostMortemInfo;
}

interface ImpactAssessment {
  affectedComponents: string[];
  affectedUsers: number;
  businessImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  financialImpact: number;
  reputationImpact: 'none' | 'low' | 'medium' | 'high';
}

interface IncidentEvent {
  timestamp: Date;
  type: 'detection' | 'investigation' | 'mitigation' | 'resolution' | 'communication';
  description: string;
  user: string;
  automated: boolean;
}

interface PostMortemInfo {
  rootCause: string;
  timeline: IncidentEvent[];
  lessonsLearned: string[];
  actionItems: ActionItem[];
  preventionMeasures: string[];
}

interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate: Date;
  status: 'open' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  type: 'planned' | 'emergency' | 'routine';
  impact: 'none' | 'low' | 'medium' | 'high';
  affectedComponents: string[];
  notifications: NotificationConfig[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface NotificationConfig {
  type: 'email' | 'sms' | 'slack' | 'webhook';
  recipients: string[];
  template: string;
  schedule: string[];
}

interface PerformanceMetrics {
  responseTime: MetricSeries;
  throughput: MetricSeries;
  errorRate: MetricSeries;
  availability: MetricSeries;
  customMetrics: CustomMetric[];
  benchmarks: PerformanceBenchmark[];
  sla: SLAMetrics;
}

interface MetricSeries {
  current: number;
  previous: number;
  average: number;
  percentile95: number;
  percentile99: number;
  min: number;
  max: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  history: MetricPoint[];
}

interface MetricPoint {
  timestamp: Date;
  value: number;
  tags: Record<string, string>;
}

interface CustomMetric {
  name: string;
  value: number;
  unit: string;
  description: string;
  threshold: HealthThreshold;
  status: 'normal' | 'warning' | 'critical';
}

interface PerformanceBenchmark {
  name: string;
  target: number;
  actual: number;
  unit: string;
  status: 'met' | 'missed' | 'exceeded';
  trend: 'improving' | 'degrading' | 'stable';
}

interface SLAMetrics {
  availability: SLATarget;
  responseTime: SLATarget;
  throughput: SLATarget;
  errorRate: SLATarget;
  uptime: SLATarget;
}

interface SLATarget {
  target: number;
  actual: number;
  unit: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  status: 'met' | 'at_risk' | 'breached';
  buffer: number;
}

interface ResourceUtilization {
  cpu: ResourceMetric;
  memory: ResourceMetric;
  disk: ResourceMetric;
  network: NetworkMetric;
  connections: ConnectionMetric;
  threads: ResourceMetric;
  fileDescriptors: ResourceMetric;
}

interface ResourceMetric {
  used: number;
  total: number;
  percentage: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  history: MetricPoint[];
  threshold: ResourceThreshold;
}

interface ResourceThreshold {
  warning: number;
  critical: number;
  unit: string;
}

interface NetworkMetric extends ResourceMetric {
  inbound: number;
  outbound: number;
  packets: number;
  errors: number;
}

interface ConnectionMetric extends ResourceMetric {
  active: number;
  idle: number;
  waiting: number;
  poolSize: number;
}

interface ComponentDependency {
  id: string;
  name: string;
  type: 'hard' | 'soft' | 'optional';
  status: 'healthy' | 'degraded' | 'failed';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  latency: number;
  availability: number;
  lastCheck: Date;
}

interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  type: 'performance' | 'availability' | 'security' | 'capacity' | 'dependency' | 'custom';
  component: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  escalated: boolean;
  escalationLevel: number;
  tags: string[];
  metrics: Record<string, number>;
  actions: AlertAction[];
}

interface AlertAction {
  type: 'notification' | 'escalation' | 'automation' | 'ticket';
  status: 'pending' | 'executed' | 'failed';
  timestamp: Date;
  details: Record<string, any>;
}

interface ComponentConfig {
  enabled: boolean;
  autoRestart: boolean;
  healthCheckInterval: number;
  alertThresholds: Record<string, HealthThreshold>;
  scalingPolicy: ScalingPolicy;
  backup: BackupConfig;
  security: SecurityConfig;
  logging: LoggingConfig;
}

interface ScalingPolicy {
  enabled: boolean;
  minReplicas: number;
  maxReplicas: number;
  targetUtilization: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
}

interface BackupConfig {
  enabled: boolean;
  frequency: string;
  retention: number;
  location: string;
  encryption: boolean;
}

interface SecurityConfig {
  authentication: boolean;
  encryption: boolean;
  firewall: boolean;
  monitoring: boolean;
  compliance: string[];
}

interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  rotation: boolean;
  retention: number;
  aggregation: boolean;
}

interface ComponentMetadata {
  owner: string;
  team: string;
  contact: string;
  documentation: string;
  repository: string;
  runbook: string;
  costCenter: string;
  budget: number;
  actualCost: number;
  tags: Record<string, string>;
}

interface MonitoringConfig {
  enabled: boolean;
  dashboards: DashboardConfig[];
  alerts: AlertRule[];
  metrics: MetricConfig[];
  tracing: TracingConfig;
  logging: LoggingConfig;
}

interface DashboardConfig {
  name: string;
  url: string;
  type: 'grafana' | 'kibana' | 'custom';
  widgets: string[];
}

interface AlertRule {
  name: string;
  condition: string;
  threshold: number;
  duration: number;
  severity: string;
  enabled: boolean;
}

interface MetricConfig {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  labels: string[];
  enabled: boolean;
}

interface TracingConfig {
  enabled: boolean;
  samplingRate: number;
  jaegerUrl?: string;
  zipkinUrl?: string;
}

const SystemHealthMonitoring: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // System Monitoring States
  const [components, setComponents] = useState<SystemComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<SystemComponent | null>(null);
  const [componentDetailOpen, setComponentDetailOpen] = useState(false);
  const [alertDetailOpen, setAlertDetailOpen] = useState(false);
  const [incidentDetailOpen, setIncidentDetailOpen] = useState(false);
  
  // Filter and Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  
  // View States
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'topology'>('grid');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  
  // Analytics States
  const [systemMetrics, setSystemMetrics] = useState<any>({});
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [alertTrends, setAlertTrends] = useState<any[]>([]);
  const [resourceData, setResourceData] = useState<any[]>([]);
  const [availabilityData, setAvailabilityData] = useState<any[]>([]);
  const [topologyData, setTopologyData] = useState<any>({});
  
  // Real-time data
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('system-health-monitoring', {
      continuous: true,
      position: 'bottom-right',
      minimized: true,
      interval: 220000
    });

    return () => evaluationController.remove();
  }, []);

  // Load data
  useEffect(() => {
    loadComponents();
    loadSystemMetrics();
    loadPerformanceData();
    loadAlertTrends();
    loadResourceData();
    loadAvailabilityData();
  }, [timeRange]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadComponents();
        loadSystemMetrics();
      }, refreshInterval * 1000);
    } else if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  const loadComponents = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockComponents: SystemComponent[] = generateMockComponents();
      setComponents(mockComponents);
      
    } catch (err) {
      setError('Failed to load system components');
      console.error('Error loading components:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemMetrics = async () => {
    try {
      const metrics = generateSystemMetrics();
      setSystemMetrics(metrics);
    } catch (err) {
      console.error('Error loading system metrics:', err);
    }
  };

  const loadPerformanceData = async () => {
    try {
      const data = generatePerformanceData(timeRange);
      setPerformanceData(data);
    } catch (err) {
      console.error('Error loading performance data:', err);
    }
  };

  const loadAlertTrends = async () => {
    try {
      const trends = generateAlertTrends(timeRange);
      setAlertTrends(trends);
    } catch (err) {
      console.error('Error loading alert trends:', err);
    }
  };

  const loadResourceData = async () => {
    try {
      const data = generateResourceData();
      setResourceData(data);
    } catch (err) {
      console.error('Error loading resource data:', err);
    }
  };

  const loadAvailabilityData = async () => {
    try {
      const data = generateAvailabilityData();
      setAvailabilityData(data);
    } catch (err) {
      console.error('Error loading availability data:', err);
    }
  };

  // Generate mock data
  const generateMockComponents = useCallback((): SystemComponent[] => {
    const types: SystemComponent['type'][] = ['application', 'database', 'cache', 'queue', 'api', 'service', 'infrastructure'];
    const categories: SystemComponent['category'][] = ['core', 'integration', 'analytics', 'security', 'storage', 'network', 'monitoring'];
    const statuses: SystemComponent['status'][] = ['healthy', 'warning', 'critical', 'offline', 'maintenance'];
    const environments: SystemComponent['environment'][] = ['production', 'staging', 'development', 'test'];
    
    return Array.from({ length: 30 }, (_, index) => ({
      id: `component-${index + 1}`,
      name: `Component ${index + 1}`,
      type: types[index % types.length],
      category: categories[index % categories.length],
      status: statuses[index % statuses.length],
      health: {
        score: Math.floor(Math.random() * 40) + 60,
        checks: [],
        trends: [],
        incidents: [],
        maintenanceWindows: [],
        degradedFeatures: []
      },
      performance: {
        responseTime: {
          current: Math.floor(Math.random() * 1000) + 100,
          previous: Math.floor(Math.random() * 1000) + 100,
          average: Math.floor(Math.random() * 800) + 200,
          percentile95: Math.floor(Math.random() * 1500) + 500,
          percentile99: Math.floor(Math.random() * 2000) + 1000,
          min: Math.floor(Math.random() * 100) + 50,
          max: Math.floor(Math.random() * 3000) + 2000,
          trend: ['up', 'down', 'stable'][index % 3] as any,
          unit: 'ms',
          history: []
        },
        throughput: {
          current: Math.floor(Math.random() * 1000) + 100,
          previous: Math.floor(Math.random() * 1000) + 100,
          average: Math.floor(Math.random() * 800) + 200,
          percentile95: Math.floor(Math.random() * 1200) + 300,
          percentile99: Math.floor(Math.random() * 1500) + 500,
          min: Math.floor(Math.random() * 50) + 10,
          max: Math.floor(Math.random() * 2000) + 1000,
          trend: ['up', 'down', 'stable'][index % 3] as any,
          unit: 'req/s',
          history: []
        },
        errorRate: {
          current: Math.random() * 0.05,
          previous: Math.random() * 0.05,
          average: Math.random() * 0.03 + 0.01,
          percentile95: Math.random() * 0.08 + 0.02,
          percentile99: Math.random() * 0.1 + 0.05,
          min: 0,
          max: Math.random() * 0.15 + 0.05,
          trend: ['up', 'down', 'stable'][index % 3] as any,
          unit: '%',
          history: []
        },
        availability: {
          current: Math.random() * 0.05 + 0.95,
          previous: Math.random() * 0.05 + 0.95,
          average: Math.random() * 0.03 + 0.97,
          percentile95: Math.random() * 0.02 + 0.98,
          percentile99: Math.random() * 0.01 + 0.99,
          min: Math.random() * 0.1 + 0.9,
          max: 1.0,
          trend: ['up', 'down', 'stable'][index % 3] as any,
          unit: '%',
          history: []
        },
        customMetrics: [],
        benchmarks: [],
        sla: {
          availability: {
            target: 99.9,
            actual: Math.random() * 0.2 + 99.8,
            unit: '%',
            period: 'monthly',
            status: ['met', 'at_risk', 'breached'][index % 3] as any,
            buffer: 0.1
          },
          responseTime: {
            target: 500,
            actual: Math.floor(Math.random() * 200) + 400,
            unit: 'ms',
            period: 'monthly',
            status: ['met', 'at_risk', 'breached'][index % 3] as any,
            buffer: 50
          },
          throughput: {
            target: 1000,
            actual: Math.floor(Math.random() * 200) + 900,
            unit: 'req/s',
            period: 'monthly',
            status: ['met', 'at_risk', 'breached'][index % 3] as any,
            buffer: 100
          },
          errorRate: {
            target: 0.01,
            actual: Math.random() * 0.02,
            unit: '%',
            period: 'monthly',
            status: ['met', 'at_risk', 'breached'][index % 3] as any,
            buffer: 0.005
          },
          uptime: {
            target: 99.95,
            actual: Math.random() * 0.1 + 99.9,
            unit: '%',
            period: 'monthly',
            status: ['met', 'at_risk', 'breached'][index % 3] as any,
            buffer: 0.05
          }
        }
      },
      resources: {
        cpu: {
          used: Math.floor(Math.random() * 80) + 10,
          total: 100,
          percentage: Math.floor(Math.random() * 80) + 10,
          unit: '%',
          trend: ['up', 'down', 'stable'][index % 3] as any,
          history: [],
          threshold: { warning: 75, critical: 90, unit: '%' }
        },
        memory: {
          used: Math.floor(Math.random() * 12) + 2,
          total: 16,
          percentage: Math.floor(Math.random() * 75) + 10,
          unit: 'GB',
          trend: ['up', 'down', 'stable'][index % 3] as any,
          history: [],
          threshold: { warning: 80, critical: 95, unit: '%' }
        },
        disk: {
          used: Math.floor(Math.random() * 400) + 100,
          total: 500,
          percentage: Math.floor(Math.random() * 80) + 20,
          unit: 'GB',
          trend: ['up', 'down', 'stable'][index % 3] as any,
          history: [],
          threshold: { warning: 85, critical: 95, unit: '%' }
        },
        network: {
          used: Math.floor(Math.random() * 500) + 100,
          total: 1000,
          percentage: Math.floor(Math.random() * 60) + 10,
          unit: 'Mbps',
          trend: ['up', 'down', 'stable'][index % 3] as any,
          history: [],
          threshold: { warning: 80, critical: 90, unit: '%' },
          inbound: Math.floor(Math.random() * 300) + 50,
          outbound: Math.floor(Math.random() * 200) + 50,
          packets: Math.floor(Math.random() * 10000) + 1000,
          errors: Math.floor(Math.random() * 10)
        },
        connections: {
          used: Math.floor(Math.random() * 800) + 100,
          total: 1000,
          percentage: Math.floor(Math.random() * 80) + 10,
          unit: 'connections',
          trend: ['up', 'down', 'stable'][index % 3] as any,
          history: [],
          threshold: { warning: 80, critical: 90, unit: '%' },
          active: Math.floor(Math.random() * 600) + 50,
          idle: Math.floor(Math.random() * 200) + 50,
          waiting: Math.floor(Math.random() * 50) + 5,
          poolSize: Math.floor(Math.random() * 100) + 50
        },
        threads: {
          used: Math.floor(Math.random() * 180) + 20,
          total: 200,
          percentage: Math.floor(Math.random() * 90) + 10,
          unit: 'threads',
          trend: ['up', 'down', 'stable'][index % 3] as any,
          history: [],
          threshold: { warning: 85, critical: 95, unit: '%' }
        },
        fileDescriptors: {
          used: Math.floor(Math.random() * 8000) + 1000,
          total: 10000,
          percentage: Math.floor(Math.random() * 80) + 10,
          unit: 'FDs',
          trend: ['up', 'down', 'stable'][index % 3] as any,
          history: [],
          threshold: { warning: 85, critical: 95, unit: '%' }
        }
      },
      dependencies: [],
      alerts: [],
      configuration: {
        enabled: Math.random() > 0.05,
        autoRestart: Math.random() > 0.3,
        healthCheckInterval: Math.floor(Math.random() * 300) + 30,
        alertThresholds: {},
        scalingPolicy: {
          enabled: Math.random() > 0.5,
          minReplicas: Math.floor(Math.random() * 2) + 1,
          maxReplicas: Math.floor(Math.random() * 8) + 3,
          targetUtilization: Math.floor(Math.random() * 20) + 70,
          scaleUpCooldown: 300,
          scaleDownCooldown: 600
        },
        backup: {
          enabled: Math.random() > 0.2,
          frequency: '0 2 * * *',
          retention: Math.floor(Math.random() * 30) + 7,
          location: 's3://backups/',
          encryption: Math.random() > 0.1
        },
        security: {
          authentication: Math.random() > 0.1,
          encryption: Math.random() > 0.2,
          firewall: Math.random() > 0.3,
          monitoring: Math.random() > 0.05,
          compliance: ['SOC2', 'ISO27001'].slice(0, Math.floor(Math.random() * 2) + 1)
        },
        logging: {
          level: ['debug', 'info', 'warn', 'error'][Math.floor(Math.random() * 4)] as any,
          rotation: Math.random() > 0.2,
          retention: Math.floor(Math.random() * 30) + 7,
          aggregation: Math.random() > 0.3
        }
      },
      metadata: {
        owner: `team-${index % 5 + 1}`,
        team: `Team ${index % 5 + 1}`,
        contact: `team${index % 5 + 1}@company.com`,
        documentation: `https://docs.company.com/component-${index + 1}`,
        repository: `https://github.com/company/component-${index + 1}`,
        runbook: `https://runbooks.company.com/component-${index + 1}`,
        costCenter: `CC-${index % 3 + 1}`,
        budget: Math.floor(Math.random() * 10000) + 1000,
        actualCost: Math.floor(Math.random() * 12000) + 800,
        tags: { environment: environments[index % environments.length] }
      },
      monitoring: {
        enabled: Math.random() > 0.05,
        dashboards: [],
        alerts: [],
        metrics: [],
        tracing: {
          enabled: Math.random() > 0.4,
          samplingRate: Math.random() * 0.1 + 0.01,
          jaegerUrl: 'http://jaeger:14268'
        },
        logging: {
          level: 'info',
          rotation: true,
          retention: 30,
          aggregation: true
        }
      },
      lastCheck: new Date(Date.now() - Math.random() * 5 * 60 * 1000),
      uptime: Math.random() * 0.05 + 0.95,
      version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 20)}`,
      environment: environments[index % environments.length],
      region: ['us-east-1', 'us-west-2', 'eu-west-1'][index % 3],
      availability: Math.random() * 0.05 + 0.95,
      reliability: Math.random() * 0.05 + 0.95
    }));
  }, []);

  const generateSystemMetrics = () => ({
    totalComponents: 30,
    healthyComponents: 25,
    warningComponents: 3,
    criticalComponents: 1,
    offlineComponents: 1,
    overallHealth: 87,
    availability: 99.5,
    responseTime: 245,
    throughput: 2450,
    errorRate: 0.012,
    activeAlerts: 8,
    totalIncidents: 15,
    resolvedIncidents: 12
  });

  const generatePerformanceData = (range: string) => {
    const points = range === '1h' ? 12 : range === '6h' ? 24 : range === '24h' ? 48 : 168;
    
    return Array.from({ length: points }, (_, index) => ({
      timestamp: new Date(Date.now() - (points - index) * (range === '1h' ? 5 * 60 * 1000 : range === '6h' ? 15 * 60 * 1000 : range === '24h' ? 30 * 60 * 1000 : 60 * 60 * 1000)),
      responseTime: Math.floor(Math.random() * 300) + 150,
      throughput: Math.floor(Math.random() * 500) + 2000,
      errorRate: Math.random() * 0.03,
      availability: Math.random() * 0.02 + 0.98,
      cpuUsage: Math.floor(Math.random() * 30) + 45,
      memoryUsage: Math.floor(Math.random() * 25) + 60,
      diskUsage: Math.floor(Math.random() * 20) + 70
    }));
  };

  const generateAlertTrends = (range: string) => {
    const points = range === '1h' ? 6 : range === '6h' ? 12 : range === '24h' ? 24 : 168;
    
    return Array.from({ length: points }, (_, index) => ({
      timestamp: new Date(Date.now() - (points - index) * (range === '1h' ? 10 * 60 * 1000 : range === '6h' ? 30 * 60 * 1000 : range === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)),
      critical: Math.floor(Math.random() * 3),
      warning: Math.floor(Math.random() * 8) + 2,
      info: Math.floor(Math.random() * 15) + 5,
      resolved: Math.floor(Math.random() * 10) + 3
    }));
  };

  const generateResourceData = () => {
    return [
      { name: 'API Gateway', cpu: 45, memory: 67, disk: 23, network: 34 },
      { name: 'Database Cluster', cpu: 78, memory: 89, disk: 56, network: 67 },
      { name: 'Cache Layer', cpu: 23, memory: 45, disk: 12, network: 78 },
      { name: 'Message Queue', cpu: 34, memory: 56, disk: 34, network: 45 },
      { name: 'Analytics Engine', cpu: 89, memory: 78, disk: 67, network: 56 },
      { name: 'Security Service', cpu: 12, memory: 34, disk: 45, network: 23 }
    ];
  };

  const generateAvailabilityData = () => {
    return [
      { component: 'Core API', availability: 99.95, sla: 99.9, incidents: 1 },
      { component: 'Database', availability: 99.87, sla: 99.5, incidents: 2 },
      { component: 'Cache', availability: 99.99, sla: 99.0, incidents: 0 },
      { component: 'Queue', availability: 99.92, sla: 99.5, incidents: 1 },
      { component: 'Analytics', availability: 99.76, sla: 99.0, incidents: 3 },
      { component: 'Frontend', availability: 99.98, sla: 99.9, incidents: 0 }
    ];
  };

  // Filter and sort components
  const filteredComponents = useMemo(() => {
    let filtered = components.filter(component => {
      const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          component.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          component.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || component.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || component.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || component.category === categoryFilter;
      const matchesEnvironment = environmentFilter === 'all' || component.environment === environmentFilter;
      
      return matchesSearch && matchesType && matchesStatus && matchesCategory && matchesEnvironment;
    });

    return filtered;
  }, [components, searchTerm, typeFilter, statusFilter, categoryFilter, environmentFilter]);

  // Render status chip
  const renderStatusChip = (status: SystemComponent['status']) => {
    const colors = {
      healthy: { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1), icon: <CheckCircle sx={{ fontSize: 16 }} /> },
      warning: { color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1), icon: <Warning sx={{ fontSize: 16 }} /> },
      critical: { color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.1), icon: <Error sx={{ fontSize: 16 }} /> },
      offline: { color: theme.palette.grey[600], bg: alpha(theme.palette.grey[500], 0.1), icon: <PowerSettingsNew sx={{ fontSize: 16 }} /> },
      maintenance: { color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.1), icon: <Build sx={{ fontSize: 16 }} /> }
    };

    return (
      <Chip
        size="small"
        icon={colors[status].icon}
        label={status.toUpperCase()}
        sx={{
          color: colors[status].color,
          backgroundColor: colors[status].bg
        }}
      />
    );
  };

  // Render health score
  const renderHealthScore = (score: number) => {
    let color = theme.palette.success.main;
    if (score < 50) color = theme.palette.error.main;
    else if (score < 80) color = theme.palette.warning.main;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress
          variant="determinate"
          value={score}
          size={24}
          sx={{ color }}
        />
        <Typography variant="body2" fontWeight="bold">
          {score}
        </Typography>
      </Box>
    );
  };

  // Render components grid
  const renderComponentsGrid = () => (
    <Grid container spacing={2}>
      {filteredComponents.map((component) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={component.id}>
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
              setSelectedComponent(component);
              setComponentDetailOpen(true);
            }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <Computer />
                </Avatar>
              }
              title={
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                  {component.name}
                </Typography>
              }
              subheader={`${component.type} • ${component.environment}`}
              action={
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {renderStatusChip(component.status)}
                </Box>
              }
            />
            
            <CardContent sx={{ pt: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Health Score
                </Typography>
                {renderHealthScore(component.health.score)}
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    CPU: {component.resources.cpu.percentage}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Memory: {component.resources.memory.percentage}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={component.resources.cpu.percentage}
                    sx={{ flex: 1, height: 4 }}
                    color={component.resources.cpu.percentage > 80 ? 'error' : component.resources.cpu.percentage > 60 ? 'warning' : 'primary'}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={component.resources.memory.percentage}
                    sx={{ flex: 1, height: 4 }}
                    color={component.resources.memory.percentage > 80 ? 'error' : component.resources.memory.percentage > 60 ? 'warning' : 'primary'}
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Response: {component.performance.responseTime.current}ms
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Uptime: {(component.uptime * 100).toFixed(1)}%
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="textSecondary">
                  Version: {component.version}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {component.region}
                </Typography>
              </Box>
            </CardContent>
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
              <MonitorHeart sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6">System Health</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {systemMetrics.overallHealth}%
            </Typography>
            <Typography variant="body2" color="success.main">
              {systemMetrics.healthyComponents} healthy
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Speed sx={{ mr: 1, color: theme.palette.info.main }} />
              <Typography variant="h6">Avg Response</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {systemMetrics.responseTime}ms
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
              {systemMetrics.availability}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Warning sx={{ mr: 1, color: theme.palette.warning.main }} />
              <Typography variant="h6">Active Alerts</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {systemMetrics.activeAlerts}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Chart */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            System Performance ({timeRange})
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
              />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="responseTime" 
                stroke={theme.palette.primary.main}
                fill={alpha(theme.palette.primary.main, 0.3)}
                name="Response Time (ms)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="throughput" 
                stroke={theme.palette.secondary.main}
                name="Throughput (req/s)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Alert Trends */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Alert Trends ({timeRange})
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={alertTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp"
                tickFormatter={(value) => timeRange === '1h' || timeRange === '6h' 
                  ? new Date(value).toLocaleTimeString() 
                  : new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <RechartsTooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
              />
              <Legend />
              <Bar dataKey="critical" stackId="alerts" fill={theme.palette.error.main} name="Critical" />
              <Bar dataKey="warning" stackId="alerts" fill={theme.palette.warning.main} name="Warning" />
              <Bar dataKey="info" stackId="alerts" fill={theme.palette.info.main} name="Info" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Resource Utilization */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Resource Utilization by Component
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={resourceData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="cpu" fill={theme.palette.primary.main} name="CPU %" />
              <Bar dataKey="memory" fill={theme.palette.secondary.main} name="Memory %" />
              <Bar dataKey="disk" fill={theme.palette.info.main} name="Disk %" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* SLA Compliance */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            SLA Compliance vs Availability
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={availabilityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sla" name="SLA Target" unit="%" />
              <YAxis dataKey="availability" name="Actual Availability" unit="%" />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter 
                dataKey="availability" 
                fill={theme.palette.primary.main}
                name="Components"
              />
            </ScatterChart>
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
          System Health Monitoring & Performance Metrics
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive enterprise system monitoring and observability platform
        </Typography>
      </Box>

      {/* Header Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search components..."
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
                <MenuItem value="application">Application</MenuItem>
                <MenuItem value="database">Database</MenuItem>
                <MenuItem value="cache">Cache</MenuItem>
                <MenuItem value="queue">Queue</MenuItem>
                <MenuItem value="api">API</MenuItem>
                <MenuItem value="service">Service</MenuItem>
                <MenuItem value="infrastructure">Infrastructure</MenuItem>
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
                <MenuItem value="healthy">Healthy</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Environment</InputLabel>
              <Select
                value={environmentFilter}
                onChange={(e) => setEnvironmentFilter(e.target.value)}
                label="Environment"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="production">Production</MenuItem>
                <MenuItem value="staging">Staging</MenuItem>
                <MenuItem value="development">Development</MenuItem>
                <MenuItem value="test">Test</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                label="Time Range"
              >
                <MenuItem value="1h">1 Hour</MenuItem>
                <MenuItem value="6h">6 Hours</MenuItem>
                <MenuItem value="24h">24 Hours</MenuItem>
                <MenuItem value="7d">7 Days</MenuItem>
                <MenuItem value="30d">30 Days</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
              }
              label="Auto Refresh"
            />
            
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
            >
              <ToggleButton value="grid">
                <GridView />
              </ToggleButton>
              <ToggleButton value="list">
                <ViewList />
              </ToggleButton>
              <ToggleButton value="topology">
                <Hub />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Overview" />
          <Tab label="Components" />
          <Tab label="Alerts" />
          <Tab label="Incidents" />
          <Tab label="Performance" />
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
          {activeTab === 0 && renderAnalyticsDashboard()}
          {activeTab === 1 && (
            <>
              {viewMode === 'grid' && renderComponentsGrid()}
              {viewMode === 'list' && (
                <Typography variant="h6">List View - Coming Soon</Typography>
              )}
              {viewMode === 'topology' && (
                <Typography variant="h6">Topology View - Coming Soon</Typography>
              )}
            </>
          )}
          {activeTab === 2 && (
            <Typography variant="h6">Alerts Management - Coming Soon</Typography>
          )}
          {activeTab === 3 && (
            <Typography variant="h6">Incident Management - Coming Soon</Typography>
          )}
          {activeTab === 4 && renderAnalyticsDashboard()}
        </Box>
      )}

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Refresh />}
          tooltipTitle="Refresh Data"
          onClick={() => {
            loadComponents();
            loadSystemMetrics();
          }}
        />
        <SpeedDialAction
          icon={<Dashboard />}
          tooltipTitle="Open Dashboard"
          onClick={() => window.open('/monitoring/dashboard', '_blank')}
        />
        <SpeedDialAction
          icon={<BugReport />}
          tooltipTitle="Report Issue"
          onClick={() => window.open('/support/report', '_blank')}
        />
      </SpeedDial>
    </Container>
  );
};

export default SystemHealthMonitoring;