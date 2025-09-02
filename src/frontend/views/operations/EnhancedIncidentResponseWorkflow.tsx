/**
 * Enhanced Incident Response Workflow Management Interface
 * Comprehensive incident response orchestration and collaboration platform
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
  ListSubheader
} from '@mui/material';

import {
  Security,
  Warning,
  Error,
  CheckCircle,
  Info,
  Assignment,
  PlayArrow,
  Pause,
  Stop,
  FastForward,
  SkipNext,
  Refresh,
  Edit,
  Delete,
  Add,
  Remove,
  ExpandMore,
  ExpandLess,
  ChevronRight,
  MoreVert,
  Launch,
  OpenInNew,
  Share,
  Download,
  Upload,
  Save,
  Print,
  Email,
  Notifications,
  Schedule,
  Person,
  Group,
  Business,
  Computer,
  Storage,
  NetworkCheck,
  Shield,
  BugReport,
  AccountTree,
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
  Search,
  Filter,
  Sort,
  ViewModule,
  ViewList,
  ViewComfy,
  GridView,
  Dashboard,
  AutoAwesome,
  Psychology,
  Flag,
  LocationOn,
  Memory,
  Speed,
  DataUsage,
  CloudDownload,
  Fullscreen,
  FullscreenExit,
  ColorLens,
  FormatPaint,
  FormatBold,
  FormatItalic,
  AccessTime,
  Event,
  CalendarToday,
  Timeline as TimelineIcon,
  TrendingUp,
  TrendingDown,
  ShowChart,
  BarChart,
  PieChart,
  DonutLarge,
  ScatterPlot,
  BubbleChart,
  Visibility,
  VisibilityOff,
  ThumbUp,
  ThumbDown,
  Star,
  StarBorder,
  Bookmark,
  BookmarkBorder,
  Label,
  LocalOffer,
  Category,
  Class,
  Comment,
  Forum,
  Chat,
  Message,
  SpeakerNotes,
  Announcement,
  CampaignIcon
} from '@mui/icons-material';

import { LineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, TreeMap } from 'recharts';
import { addUIUXEvaluation } from '../../services/ui-ux-evaluation/core/UIUXEvaluationService';

// Enhanced Interfaces for Incident Response
interface IncidentWorkflow {
  id: string;
  name: string;
  description: string;
  category: 'malware' | 'phishing' | 'data-breach' | 'apt' | 'insider-threat' | 'dos' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  assignedTo: string[];
  tags: string[];
  priority: number;
  estimatedDuration: number; // minutes
  actualDuration?: number;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  automation: AutomationConfig;
  compliance: ComplianceConfig;
  metrics: WorkflowMetrics;
  escalationRules: EscalationRule[];
  notifications: NotificationConfig;
  evidence: EvidenceCollection;
  timeline: WorkflowTimelineEvent[];
  resources: WorkflowResource[];
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'automated' | 'decision' | 'parallel' | 'conditional';
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  assignedTo?: string[];
  estimatedTime: number; // minutes
  actualTime?: number;
  dependencies: string[]; // step IDs
  conditions?: string[];
  actions: StepAction[];
  outputs?: any[];
  verification: VerificationConfig;
  rollback?: RollbackConfig;
}

interface StepAction {
  id: string;
  type: 'investigation' | 'containment' | 'eradication' | 'recovery' | 'notification' | 'documentation';
  name: string;
  description: string;
  automated: boolean;
  script?: string;
  parameters?: Record<string, any>;
  validation?: ValidationRule[];
}

interface WorkflowTrigger {
  id: string;
  name: string;
  type: 'ioc-detection' | 'alert-correlation' | 'threat-score' | 'manual' | 'scheduled' | 'api';
  conditions: TriggerCondition[];
  enabled: boolean;
}

interface TriggerCondition {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'matches';
  value: any;
  logic?: 'and' | 'or';
}

interface AutomationConfig {
  enabled: boolean;
  level: 'none' | 'partial' | 'full';
  approvalRequired: boolean;
  safetyChecks: string[];
  rollbackEnabled: boolean;
  maxExecutionTime: number; // minutes
}

interface ComplianceConfig {
  frameworks: string[]; // NIST, ISO27001, SOX, etc.
  requirements: string[];
  documentation: boolean;
  retention: number; // days
  approval: boolean;
  audit: boolean;
}

interface WorkflowMetrics {
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  slaCompliance: number;
  resourceUtilization: number;
  userSatisfaction: number;
  costEffectiveness: number;
  automationRate: number;
}

interface EscalationRule {
  id: string;
  name: string;
  conditions: EscalationCondition[];
  actions: EscalationAction[];
  delay: number; // minutes
  enabled: boolean;
}

interface EscalationCondition {
  type: 'time-based' | 'status-based' | 'severity-based' | 'resource-based';
  threshold: any;
  comparison: string;
}

interface EscalationAction {
  type: 'notify' | 'assign' | 'escalate' | 'automate';
  target: string;
  parameters: Record<string, any>;
}

interface NotificationConfig {
  channels: NotificationChannel[];
  templates: Record<string, string>;
  frequency: 'immediate' | 'digest' | 'scheduled';
  recipients: NotificationRecipient[];
}

interface NotificationChannel {
  type: 'email' | 'sms' | 'slack' | 'teams' | 'webhook' | 'in-app';
  enabled: boolean;
  config: Record<string, any>;
}

interface NotificationRecipient {
  id: string;
  name: string;
  role: string;
  conditions: string[];
  preferences: Record<string, any>;
}

interface EvidenceCollection {
  artifacts: EvidenceArtifact[];
  chainOfCustody: CustodyRecord[];
  integrity: IntegrityCheck[];
  retention: RetentionPolicy;
}

interface EvidenceArtifact {
  id: string;
  name: string;
  type: 'log' | 'file' | 'memory' | 'network' | 'registry' | 'database' | 'other';
  source: string;
  timestamp: Date;
  hash: string;
  size: number;
  location: string;
  metadata: Record<string, any>;
  tags: string[];
}

interface CustodyRecord {
  id: string;
  artifactId: string;
  action: 'collected' | 'transferred' | 'analyzed' | 'stored' | 'destroyed';
  user: string;
  timestamp: Date;
  details: string;
  signature: string;
}

interface IntegrityCheck {
  id: string;
  artifactId: string;
  timestamp: Date;
  method: string;
  result: 'valid' | 'invalid' | 'unknown';
  details: string;
}

interface RetentionPolicy {
  duration: number; // days
  conditions: string[];
  destruction: boolean;
  archival: boolean;
}

interface WorkflowTimelineEvent {
  id: string;
  timestamp: Date;
  type: 'step-started' | 'step-completed' | 'step-failed' | 'escalation' | 'notification' | 'evidence' | 'decision';
  user: string;
  stepId?: string;
  description: string;
  details?: any;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

interface WorkflowResource {
  id: string;
  type: 'human' | 'system' | 'tool' | 'infrastructure';
  name: string;
  availability: number; // percentage
  cost: number;
  capacity: number;
  utilization: number;
  skills?: string[];
}

interface VerificationConfig {
  required: boolean;
  methods: string[];
  criteria: string[];
  approvers: string[];
  timeout: number; // minutes
}

interface RollbackConfig {
  enabled: boolean;
  conditions: string[];
  steps: string[];
  automated: boolean;
}

interface ValidationRule {
  field: string;
  rule: string;
  message: string;
}

const EnhancedIncidentResponseWorkflow: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Workflow Management States
  const [workflows, setWorkflows] = useState<IncidentWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<IncidentWorkflow | null>(null);
  const [workflowDetailOpen, setWorkflowDetailOpen] = useState(false);
  const [createWorkflowOpen, setCreateWorkflowOpen] = useState(false);
  const [executeWorkflowOpen, setExecuteWorkflowOpen] = useState(false);
  
  // Filter and Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  
  // View States
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban' | 'timeline'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'priority' | 'severity'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Execution States
  const [executingWorkflow, setExecutingWorkflow] = useState<string | null>(null);
  const [executionProgress, setExecutionProgress] = useState<Record<string, number>>({});
  const [executionLogs, setExecutionLogs] = useState<Record<string, any[]>>({});
  
  // Template and Automation States
  const [workflowTemplates, setWorkflowTemplates] = useState<IncidentWorkflow[]>([]);
  const [automationRules, setAutomationRules] = useState<any[]>([]);
  const [escalationTemplates, setEscalationTemplates] = useState<any[]>([]);
  
  // Analytics States
  const [workflowMetrics, setWorkflowMetrics] = useState<any>({});
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [utilizationData, setUtilizationData] = useState<any[]>([]);

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('enhanced-incident-response-workflow', {
      continuous: true,
      position: 'bottom-right',
      minimized: true,
      interval: 200000
    });

    return () => evaluationController.remove();
  }, []);

  // Load workflow data
  useEffect(() => {
    loadWorkflows();
    loadWorkflowTemplates();
    loadAutomationRules();
    loadMetrics();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockWorkflows: IncidentWorkflow[] = generateMockWorkflows();
      setWorkflows(mockWorkflows);
      
    } catch (err) {
      setError('Failed to load incident response workflows');
      console.error('Error loading workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflowTemplates = async () => {
    try {
      const templates: IncidentWorkflow[] = generateWorkflowTemplates();
      setWorkflowTemplates(templates);
    } catch (err) {
      console.error('Error loading workflow templates:', err);
    }
  };

  const loadAutomationRules = async () => {
    try {
      const rules = generateAutomationRules();
      setAutomationRules(rules);
    } catch (err) {
      console.error('Error loading automation rules:', err);
    }
  };

  const loadMetrics = async () => {
    try {
      const metrics = generateWorkflowMetrics();
      setWorkflowMetrics(metrics);
      
      const performance = generatePerformanceData();
      setPerformanceData(performance);
      
      const utilization = generateUtilizationData();
      setUtilizationData(utilization);
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  };

  // Generate mock data
  const generateMockWorkflows = useCallback((): IncidentWorkflow[] => {
    const categories: IncidentWorkflow['category'][] = ['malware', 'phishing', 'data-breach', 'apt', 'insider-threat', 'dos'];
    const severities: IncidentWorkflow['severity'][] = ['critical', 'high', 'medium', 'low'];
    const statuses: IncidentWorkflow['status'][] = ['draft', 'active', 'paused', 'completed', 'cancelled'];
    
    return Array.from({ length: 25 }, (_, index) => ({
      id: `workflow-${index + 1}`,
      name: `IR Workflow ${index + 1}`,
      description: `Incident response workflow for ${categories[index % categories.length]} incidents`,
      category: categories[index % categories.length],
      severity: severities[index % severities.length],
      status: statuses[index % statuses.length],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      assignedTo: [`analyst-${(index % 5) + 1}`, `responder-${(index % 3) + 1}`],
      tags: [`tag-${index % 8 + 1}`, `category-${index % 6 + 1}`],
      priority: Math.floor(Math.random() * 10) + 1,
      estimatedDuration: Math.floor(Math.random() * 480) + 60,
      actualDuration: Math.random() > 0.3 ? Math.floor(Math.random() * 600) + 30 : undefined,
      steps: generateWorkflowSteps(),
      triggers: generateWorkflowTriggers(),
      automation: generateAutomationConfig(),
      compliance: generateComplianceConfig(),
      metrics: generateStepMetrics(),
      escalationRules: generateEscalationRules(),
      notifications: generateNotificationConfig(),
      evidence: generateEvidenceCollection(),
      timeline: generateTimelineEvents(),
      resources: generateWorkflowResources()
    }));
  }, []);

  const generateWorkflowSteps = (): WorkflowStep[] => {
    const stepTypes: WorkflowStep['type'][] = ['manual', 'automated', 'decision', 'parallel', 'conditional'];
    const stepStatuses: WorkflowStep['status'][] = ['pending', 'in-progress', 'completed', 'failed', 'skipped'];
    
    return Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, index) => ({
      id: `step-${index + 1}`,
      name: `Step ${index + 1}`,
      description: `Workflow step ${index + 1} description`,
      type: stepTypes[index % stepTypes.length],
      status: stepStatuses[index % stepStatuses.length],
      assignedTo: Math.random() > 0.5 ? [`user-${index % 3 + 1}`] : undefined,
      estimatedTime: Math.floor(Math.random() * 120) + 15,
      actualTime: Math.random() > 0.3 ? Math.floor(Math.random() * 150) + 10 : undefined,
      dependencies: index > 0 && Math.random() > 0.7 ? [`step-${index}`] : [],
      conditions: Math.random() > 0.8 ? [`condition-${index % 3 + 1}`] : undefined,
      actions: generateStepActions(),
      outputs: Math.random() > 0.6 ? [{ result: `output-${index}` }] : undefined,
      verification: generateVerificationConfig(),
      rollback: Math.random() > 0.8 ? generateRollbackConfig() : undefined
    }));
  };

  const generateStepActions = (): StepAction[] => {
    const actionTypes: StepAction['type'][] = ['investigation', 'containment', 'eradication', 'recovery', 'notification', 'documentation'];
    
    return Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, index) => ({
      id: `action-${index + 1}`,
      type: actionTypes[index % actionTypes.length],
      name: `Action ${index + 1}`,
      description: `Step action ${index + 1}`,
      automated: Math.random() > 0.5,
      script: Math.random() > 0.7 ? `script-${index}` : undefined,
      parameters: Math.random() > 0.6 ? { param1: 'value1' } : undefined,
      validation: Math.random() > 0.8 ? [{ field: 'field1', rule: 'required', message: 'Field is required' }] : undefined
    }));
  };

  const generateWorkflowTriggers = (): WorkflowTrigger[] => {
    const triggerTypes: WorkflowTrigger['type'][] = ['ioc-detection', 'alert-correlation', 'threat-score', 'manual', 'scheduled', 'api'];
    
    return Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, index) => ({
      id: `trigger-${index + 1}`,
      name: `Trigger ${index + 1}`,
      type: triggerTypes[index % triggerTypes.length],
      conditions: [
        {
          field: 'severity',
          operator: '>=',
          value: 'medium'
        }
      ],
      enabled: Math.random() > 0.2
    }));
  };

  const generateAutomationConfig = (): AutomationConfig => ({
    enabled: Math.random() > 0.3,
    level: ['none', 'partial', 'full'][Math.floor(Math.random() * 3)] as any,
    approvalRequired: Math.random() > 0.6,
    safetyChecks: ['check1', 'check2'],
    rollbackEnabled: Math.random() > 0.5,
    maxExecutionTime: Math.floor(Math.random() * 240) + 60
  });

  const generateComplianceConfig = (): ComplianceConfig => ({
    frameworks: ['NIST', 'ISO27001', 'SOX'].slice(0, Math.floor(Math.random() * 3) + 1),
    requirements: ['req1', 'req2'],
    documentation: Math.random() > 0.2,
    retention: Math.floor(Math.random() * 365) + 30,
    approval: Math.random() > 0.4,
    audit: Math.random() > 0.3
  });

  const generateStepMetrics = (): WorkflowMetrics => ({
    executionCount: Math.floor(Math.random() * 100) + 1,
    successRate: Math.random() * 0.4 + 0.6,
    averageExecutionTime: Math.floor(Math.random() * 300) + 60,
    slaCompliance: Math.random() * 0.3 + 0.7,
    resourceUtilization: Math.random() * 0.4 + 0.5,
    userSatisfaction: Math.random() * 0.3 + 0.7,
    costEffectiveness: Math.random() * 0.4 + 0.6,
    automationRate: Math.random() * 0.6 + 0.2
  });

  const generateEscalationRules = (): EscalationRule[] => {
    return Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, index) => ({
      id: `escalation-${index + 1}`,
      name: `Escalation Rule ${index + 1}`,
      conditions: [
        {
          type: 'time-based',
          threshold: 60,
          comparison: '>'
        }
      ],
      actions: [
        {
          type: 'notify',
          target: 'supervisor',
          parameters: { urgency: 'high' }
        }
      ],
      delay: Math.floor(Math.random() * 120) + 30,
      enabled: Math.random() > 0.2
    }));
  };

  const generateNotificationConfig = (): NotificationConfig => ({
    channels: [
      {
        type: 'email',
        enabled: true,
        config: { server: 'smtp.company.com' }
      },
      {
        type: 'slack',
        enabled: Math.random() > 0.4,
        config: { webhook: 'https://hooks.slack.com/...' }
      }
    ],
    templates: {
      started: 'Workflow started template',
      completed: 'Workflow completed template'
    },
    frequency: ['immediate', 'digest', 'scheduled'][Math.floor(Math.random() * 3)] as any,
    recipients: [
      {
        id: 'recipient-1',
        name: 'Security Team',
        role: 'analyst',
        conditions: ['severity >= high'],
        preferences: { email: true, sms: false }
      }
    ]
  });

  const generateEvidenceCollection = (): EvidenceCollection => ({
    artifacts: Array.from({ length: Math.floor(Math.random() * 8) + 2 }, (_, index) => ({
      id: `artifact-${index + 1}`,
      name: `Evidence ${index + 1}`,
      type: ['log', 'file', 'memory', 'network', 'registry'][index % 5] as any,
      source: `source-${index % 3 + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      hash: `sha256:${Math.random().toString(36).substring(2, 66)}`,
      size: Math.floor(Math.random() * 1000000) + 1024,
      location: `/evidence/artifact-${index + 1}`,
      metadata: { type: 'evidence', index: index + 1 },
      tags: [`tag-${index % 4 + 1}`]
    })),
    chainOfCustody: [],
    integrity: [],
    retention: {
      duration: 365,
      conditions: ['legal-hold'],
      destruction: true,
      archival: true
    }
  });

  const generateTimelineEvents = (): WorkflowTimelineEvent[] => {
    return Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, index) => ({
      id: `event-${index + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      type: ['step-started', 'step-completed', 'escalation', 'notification'][index % 4] as any,
      user: `user-${index % 3 + 1}`,
      stepId: `step-${index % 5 + 1}`,
      description: `Timeline event ${index + 1}`,
      details: { eventIndex: index + 1 },
      impact: ['low', 'medium', 'high', 'critical'][index % 4] as any
    }));
  };

  const generateWorkflowResources = (): WorkflowResource[] => {
    return Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, index) => ({
      id: `resource-${index + 1}`,
      type: ['human', 'system', 'tool', 'infrastructure'][index % 4] as any,
      name: `Resource ${index + 1}`,
      availability: Math.random() * 0.4 + 0.6,
      cost: Math.floor(Math.random() * 1000) + 100,
      capacity: Math.floor(Math.random() * 100) + 50,
      utilization: Math.random() * 0.6 + 0.2,
      skills: index % 4 === 0 ? [`skill-${index % 3 + 1}`] : undefined
    }));
  };

  const generateVerificationConfig = (): VerificationConfig => ({
    required: Math.random() > 0.5,
    methods: ['manual', 'automated'],
    criteria: ['criteria1', 'criteria2'],
    approvers: ['approver1'],
    timeout: Math.floor(Math.random() * 120) + 30
  });

  const generateRollbackConfig = (): RollbackConfig => ({
    enabled: true,
    conditions: ['failure', 'timeout'],
    steps: ['step-1', 'step-2'],
    automated: Math.random() > 0.5
  });

  const generateWorkflowTemplates = (): IncidentWorkflow[] => {
    // Generate predefined workflow templates for common incident types
    return [
      {
        id: 'template-malware',
        name: 'Malware Incident Response',
        description: 'Comprehensive workflow for malware incident response',
        category: 'malware',
        severity: 'high',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: [],
        tags: ['malware', 'template'],
        priority: 8,
        estimatedDuration: 240,
        steps: [],
        triggers: [],
        automation: generateAutomationConfig(),
        compliance: generateComplianceConfig(),
        metrics: generateStepMetrics(),
        escalationRules: [],
        notifications: generateNotificationConfig(),
        evidence: generateEvidenceCollection(),
        timeline: [],
        resources: []
      }
      // Add more templates as needed
    ];
  };

  const generateAutomationRules = () => {
    return [
      {
        id: 'rule-1',
        name: 'Auto-isolate Critical Malware',
        description: 'Automatically isolate systems when critical malware is detected',
        enabled: true,
        conditions: [
          { field: 'severity', operator: '=', value: 'critical' },
          { field: 'category', operator: '=', value: 'malware' }
        ],
        actions: [
          { type: 'isolate-system', parameters: { method: 'network' } },
          { type: 'notify-team', parameters: { urgency: 'immediate' } }
        ]
      }
    ];
  };

  const generateWorkflowMetrics = () => {
    return {
      totalWorkflows: 45,
      activeWorkflows: 12,
      completedWorkflows: 28,
      averageExecutionTime: 180,
      successRate: 0.92,
      automationRate: 0.65,
      slaCompliance: 0.88,
      resourceUtilization: 0.75
    };
  };

  const generatePerformanceData = () => {
    return Array.from({ length: 30 }, (_, index) => ({
      date: new Date(Date.now() - (29 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      executionTime: Math.floor(Math.random() * 100) + 120,
      successRate: Math.random() * 0.2 + 0.8,
      workflowsExecuted: Math.floor(Math.random() * 10) + 5
    }));
  };

  const generateUtilizationData = () => {
    return [
      { name: 'Security Analysts', utilization: 85, capacity: 100 },
      { name: 'Incident Responders', utilization: 72, capacity: 80 },
      { name: 'Forensic Tools', utilization: 45, capacity: 60 },
      { name: 'Automation Systems', utilization: 90, capacity: 100 }
    ];
  };

  // Filter and sort workflows
  const filteredWorkflows = useMemo(() => {
    let filtered = workflows.filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          workflow.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || workflow.category === categoryFilter;
      const matchesSeverity = severityFilter === 'all' || workflow.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
      const matchesAssignee = assigneeFilter === 'all' || workflow.assignedTo.includes(assigneeFilter);
      
      return matchesSearch && matchesCategory && matchesSeverity && matchesStatus && matchesAssignee;
    });

    // Sort workflows
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updated':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'priority':
          comparison = a.priority - b.priority;
          break;
        case 'severity':
          const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [workflows, searchTerm, categoryFilter, severityFilter, statusFilter, assigneeFilter, sortBy, sortOrder]);

  // Execute workflow
  const executeWorkflow = useCallback(async (workflowId: string) => {
    setExecutingWorkflow(workflowId);
    setExecutionProgress(prev => ({ ...prev, [workflowId]: 0 }));
    setExecutionLogs(prev => ({ ...prev, [workflowId]: [] }));

    try {
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) return;

      const steps = workflow.steps;
      const totalSteps = steps.length;

      for (let i = 0; i < totalSteps; i++) {
        const step = steps[i];
        
        // Log step start
        setExecutionLogs(prev => ({
          ...prev,
          [workflowId]: [...prev[workflowId], {
            timestamp: new Date(),
            type: 'step-start',
            message: `Starting step: ${step.name}`,
            step: step.name
          }]
        }));

        // Simulate step execution
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
        
        // Update progress
        setExecutionProgress(prev => ({
          ...prev,
          [workflowId]: Math.round(((i + 1) / totalSteps) * 100)
        }));

        // Log step completion
        setExecutionLogs(prev => ({
          ...prev,
          [workflowId]: [...prev[workflowId], {
            timestamp: new Date(),
            type: 'step-complete',
            message: `Completed step: ${step.name}`,
            step: step.name
          }]
        }));
      }

      // Final completion log
      setExecutionLogs(prev => ({
        ...prev,
        [workflowId]: [...prev[workflowId], {
          timestamp: new Date(),
          type: 'workflow-complete',
          message: 'Workflow execution completed successfully',
          step: 'Complete'
        }]
      }));

    } catch (error) {
      setExecutionLogs(prev => ({
        ...prev,
        [workflowId]: [...prev[workflowId], {
          timestamp: new Date(),
          type: 'error',
          message: `Workflow execution failed: ${error}`,
          step: 'Error'
        }]
      }));
    } finally {
      setExecutingWorkflow(null);
    }
  }, [workflows]);

  // Render severity chip
  const renderSeverityChip = (severity: IncidentWorkflow['severity']) => {
    const colors = {
      critical: { color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.1) },
      high: { color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) },
      medium: { color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.1) },
      low: { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) }
    };

    return (
      <Chip
        size="small"
        label={severity.toUpperCase()}
        sx={{
          color: colors[severity].color,
          backgroundColor: colors[severity].bg,
          fontWeight: 'bold'
        }}
      />
    );
  };

  // Render status chip
  const renderStatusChip = (status: IncidentWorkflow['status']) => {
    const colors = {
      draft: { color: theme.palette.grey[600], bg: alpha(theme.palette.grey[500], 0.1) },
      active: { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) },
      paused: { color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) },
      completed: { color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1) },
      cancelled: { color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.1) }
    };

    return (
      <Chip
        size="small"
        label={status.toUpperCase()}
        sx={{
          color: colors[status].color,
          backgroundColor: colors[status].bg
        }}
      />
    );
  };

  // Render workflow grid
  const renderWorkflowGrid = () => (
    <Grid container spacing={2}>
      {filteredWorkflows.map((workflow) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={workflow.id}>
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
              setSelectedWorkflow(workflow);
              setWorkflowDetailOpen(true);
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                <Typography variant="h6" fontWeight="bold" noWrap>
                  {workflow.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {renderSeverityChip(workflow.severity)}
                  {executingWorkflow === workflow.id && (
                    <CircularProgress size={16} />
                  )}
                </Box>
              </Box>
              
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }} noWrap>
                {workflow.description}
              </Typography>
              
              {renderStatusChip(workflow.status)}
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="textSecondary">
                  {workflow.steps.length} steps
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {Math.round(workflow.estimatedDuration / 60)}h estimated
                </Typography>
              </Box>
              
              {executingWorkflow === workflow.id && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={executionProgress[workflow.id] || 0} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {executionProgress[workflow.id] || 0}% complete
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render workflow list
  const renderWorkflowList = () => (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Steps</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWorkflows.map((workflow) => (
              <TableRow key={workflow.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {workflow.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {workflow.description}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={workflow.category} variant="outlined" />
                </TableCell>
                <TableCell>
                  {renderSeverityChip(workflow.severity)}
                </TableCell>
                <TableCell>
                  {renderStatusChip(workflow.status)}
                </TableCell>
                <TableCell>
                  {workflow.assignedTo.map(assignee => (
                    <Chip key={assignee} size="small" label={assignee} sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>{workflow.steps.length}</TableCell>
                <TableCell>{Math.round(workflow.estimatedDuration / 60)}h</TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => executeWorkflow(workflow.id)}
                    disabled={executingWorkflow === workflow.id}
                  >
                    <PlayArrow />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setSelectedWorkflow(workflow);
                      setWorkflowDetailOpen(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
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
              <Assignment sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6">Total Workflows</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {workflowMetrics.totalWorkflows}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PlayArrow sx={{ mr: 1, color: theme.palette.success.main }} />
              <Typography variant="h6">Active</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {workflowMetrics.activeWorkflows}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircle sx={{ mr: 1, color: theme.palette.info.main }} />
              <Typography variant="h6">Success Rate</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {Math.round(workflowMetrics.successRate * 100)}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AutoAwesome sx={{ mr: 1, color: theme.palette.warning.main }} />
              <Typography variant="h6">Automation Rate</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {Math.round(workflowMetrics.automationRate * 100)}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Chart */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Workflow Performance Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="executionTime" stroke={theme.palette.primary.main} name="Avg Execution Time (min)" />
              <Line type="monotone" dataKey="workflowsExecuted" stroke={theme.palette.secondary.main} name="Workflows Executed" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Resource Utilization */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Resource Utilization
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={utilizationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="utilization" fill={theme.palette.primary.main} name="Utilization %" />
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
          Enhanced Incident Response Workflow
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive incident response orchestration and collaboration platform
        </Typography>
      </Box>

      {/* Header Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search workflows..."
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
                <MenuItem value="malware">Malware</MenuItem>
                <MenuItem value="phishing">Phishing</MenuItem>
                <MenuItem value="data-breach">Data Breach</MenuItem>
                <MenuItem value="apt">APT</MenuItem>
                <MenuItem value="insider-threat">Insider Threat</MenuItem>
                <MenuItem value="dos">DoS</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                label="Severity"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
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
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
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
              <ToggleButton value="list">
                <ViewList />
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateWorkflowOpen(true)}
            >
              Create Workflow
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Workflows" />
          <Tab label="Templates" />
          <Tab label="Analytics" />
          <Tab label="Automation Rules" />
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
              {viewMode === 'grid' ? renderWorkflowGrid() : renderWorkflowList()}
            </>
          )}
          {activeTab === 1 && (
            <Typography variant="h6">Workflow Templates - Coming Soon</Typography>
          )}
          {activeTab === 2 && renderAnalyticsDashboard()}
          {activeTab === 3 && (
            <Typography variant="h6">Automation Rules - Coming Soon</Typography>
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
          tooltipTitle="Create Workflow"
          onClick={() => setCreateWorkflowOpen(true)}
        />
        <SpeedDialAction
          icon={<PlayArrow />}
          tooltipTitle="Execute Workflow"
          onClick={() => setExecuteWorkflowOpen(true)}
        />
        <SpeedDialAction
          icon={<Refresh />}
          tooltipTitle="Refresh Data"
          onClick={() => loadWorkflows()}
        />
      </SpeedDial>
    </Container>
  );
};

export default EnhancedIncidentResponseWorkflow;