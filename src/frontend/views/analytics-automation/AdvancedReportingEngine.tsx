/**
 * Advanced Reporting Engine with Customizable Templates
 * Enterprise-grade threat intelligence reporting platform
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
  Snackbar
} from '@mui/material';

import {
  Report,
  Assessment,
  Analytics,
  PictureAsPdf,
  Description,
  TableChart,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  TrendingUp,
  TrendingDown,
  Download,
  Share,
  Print,
  Email,
  Schedule,
  Visibility,
  VisibilityOff,
  Edit,
  Delete,
  Add,
  ContentCopy,
  ContentPaste,
  Save,
  SaveAs,
  FolderOpen,
  Refresh,
  Settings,
  FilterList,
  Search,
  Sort,
  ViewModule,
  ViewList,
  ViewComfy,
  GridView,
  Dashboard,
  AutoAwesome,
  Psychology,
  Security,
  Warning,  Error as ErrorIcon,
  CheckCircle,
  Info,
  Flag,
  LocationOn,
  Person,
  Business,
  Computer,
  NetworkCheck,
  Storage,
  Memory,
  Speed,
  DataUsage,
  CloudDownload,
  BugReport,
  Shield,
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
  ExpandMore,
  ExpandLess,
  ChevronRight,
  MoreVert,
  Launch,
  OpenInNew,
  PlayArrow,
  Pause,
  Stop,
  FastForward,
  FastRewind,
  SkipNext,
  SkipPrevious,
  Fullscreen,
  FullscreenExit,
  ColorLens,
  FormatPaint,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatSize,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatListBulleted,
  FormatListNumbered,
  Image,
  InsertChart,
  InsertDriveFile,
  InsertLink,
  InsertPhoto,
  History,
  Star,
  ContentCopy as Copy
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
  Treemap,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';


// Report template interfaces
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'tactical' | 'operational' | 'strategic' | 'technical';
  type: 'threat_landscape' | 'incident_analysis' | 'ioc_analysis' | 'actor_profile' | 'campaign_analysis' | 'custom';
  format: 'pdf' | 'html' | 'word' | 'excel' | 'powerpoint' | 'json' | 'csv';
  sections: ReportSection[];
  parameters: ReportParameter[];
  schedule?: ReportSchedule;
  recipients: string[];
  branding: {
    logo?: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts: {
      heading: string;
      body: string;
      monospace: string;
    };
    classification?: 'unclassified' | 'confidential' | 'secret' | 'top_secret';
  };
  metadata: {
    author: string;
    version: string;
    created: Date;
    modified: Date;
    usageCount: number;
    rating: number;
    isPublic: boolean;
    tags: string[];
  };
  preview: string;
  estimatedGenerationTime: number;
}

interface ReportSection {
  id: string;
  name: string;
  type: 'cover' | 'executive_summary' | 'methodology' | 'findings' | 'charts' | 'tables' | 'recommendations' | 'appendix' | 'custom';
  order: number;
  enabled: boolean;
  configuration: {
    title: string;
    description?: string;
    dataSource?: string;
    visualizations?: string[];
    filters?: Record<string, any>;
    customContent?: string;
    pageBreakBefore?: boolean;
    pageBreakAfter?: boolean;
  };
  template: string;
  dependencies: string[];
  estimatedSize: number;
}

interface ReportParameter {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'dateRange' | 'select' | 'multiSelect' | 'boolean' | 'file';
  label: string;
  description: string;
  required: boolean;
  defaultValue: any;
  options?: { label: string; value: any }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    allowedTypes?: string[];
  };
  dependsOn?: string[];
}

interface ReportSchedule {
  id: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  enabled: boolean;
  nextRun?: Date;
  lastRun?: Date;
  parameters: Record<string, any>;
}

interface ReportGeneration {
  id: string;
  templateId: string;
  templateName: string;
  parameters: Record<string, any>;
  status: 'queued' | 'generating' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentSection?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  outputPath?: string;
  outputSize?: number;
  errorMessage?: string;
  warnings: string[];
  statistics: {
    sectionsGenerated: number;
    chartsCreated: number;
    tablesCreated: number;
    pagesGenerated: number;
    dataPointsProcessed: number;
  };
  metadata: {
    requestedBy: string;
    format: string;
    classification: string;
    distributionList: string[];
  };
}

interface ReportData {
  threatLandscape: {
    totalThreats: number;
    newThreats: number;
    activeCampaigns: number;
    topActors: string[];
    riskTrend: { date: Date; score: number }[];
  };
  incidentMetrics: {
    totalIncidents: number;
    resolvedIncidents: number;
    avgResolutionTime: number;
    severityBreakdown: Record<string, number>;
    topIncidentTypes: { type: string; count: number }[];
  };
  iocAnalysis: {
    totalIOCs: number;
    newIOCs: number;
    validatedIOCs: number;
    falsePositives: number;
    topSources: { source: string; count: number }[];
    typeDistribution: Record<string, number>;
  };
  performance: {
    detectionRate: number;
    meanTimeToDetection: number;
    meanTimeToResponse: number;
    alertVolume: number;
    analystEfficiency: number;
  };
}

const AdvancedReportingEngine: React.FC = () => {
  const theme = useTheme();
  const previewRef = useRef<HTMLDivElement>(null);
  
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
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [reportGenerations, setReportGenerations] = useState<ReportGeneration[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [selectedGeneration, setSelectedGeneration] = useState<ReportGeneration | null>(null);
  const [templateDetailsOpen, setTemplateDetailsOpen] = useState(false);
  const [generationDetailsOpen, setGenerationDetailsOpen] = useState(false);
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  
  // Template builder states
  const [editingTemplate, setEditingTemplate] = useState<Partial<ReportTemplate> | null>(null);
  const [templateSections, setTemplateSections] = useState<ReportSection[]>([]);
  const [templateParameters, setTemplateParameters] = useState<ReportParameter[]>([]);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'print'>('desktop');
  
  // Generation states
  const [generatingReports, setGeneratingReports] = useState<Record<string, boolean>>({});
  const [generationProgress, setGenerationProgress] = useState<Record<string, number>>({});
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [authorFilter, setAuthorFilter] = useState<string>('all');

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('advanced-reporting-engine', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 160000
    });

    return () => evaluationController.remove();
  }, []);

  // Business logic operations
  const handleGenerateReport = async (templateId: string, parameters: any) => {
    try {
      await businessLogic.execute('generate-report', { templateId, parameters }, 'medium');
      addNotification('info', 'Report generation started');
    } catch (error) {
      addNotification('error', 'Failed to generate report');
    }
  };

  const handleExportReport = async (reportId: string, format: string) => {
    try {
      await businessLogic.execute('export-report', { reportId, format }, 'medium');
      addNotification('success', `Report exported in ${format} format`);
    } catch (error) {
      addNotification('error', 'Failed to export report');
    }
  };

  const handleScheduleReport = async (templateId: string, schedule: any) => {
    try {
      await businessLogic.execute('schedule-report', { templateId, schedule }, 'medium');
      addNotification('success', 'Report scheduled successfully');
    } catch (error) {
      addNotification('error', 'Failed to schedule report');
    }
  };

  const handleRefreshReportingEngine = async () => {
    try {
      await refresh();
      addNotification('success', 'Reporting engine data refreshed');
    } catch (error) {
      addNotification('error', 'Failed to refresh reporting engine');
    }
  };


  // Generate mock report templates
  const generateMockTemplates = useCallback((): ReportTemplate[] => {
    const categories = ['executive', 'tactical', 'operational', 'strategic', 'technical'] as const;
    const types = ['threat_landscape', 'incident_analysis', 'ioc_analysis', 'actor_profile', 'campaign_analysis'] as const;
    const formats = ['pdf', 'html', 'word', 'excel', 'powerpoint'] as const;
    
    const templates: ReportTemplate[] = [];
    
    for (let i = 0; i < 20; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const format = formats[Math.floor(Math.random() * formats.length)];
      
      templates.push({
        id: `template-${i}`,
        name: `${category.replace('_', ' ')} ${type.replace('_', ' ')} Report`,
        description: `Comprehensive ${category} analysis report focusing on ${type.replace('_', ' ')}`,
        category,
        type,
        format,
        sections: [
          {
            id: 'cover',
            name: 'Cover Page',
            type: 'cover',
            order: 1,
            enabled: true,
            configuration: {
              title: 'Threat Intelligence Report',
              description: 'Executive briefing on current threat landscape'
            },
            template: 'cover-template',
            dependencies: [],
            estimatedSize: 1
          },
          {
            id: 'executive-summary',
            name: 'Executive Summary',
            type: 'executive_summary',
            order: 2,
            enabled: true,
            configuration: {
              title: 'Executive Summary',
              description: 'High-level overview for leadership'
            },
            template: 'executive-summary-template',
            dependencies: [],
            estimatedSize: 2
          },
          {
            id: 'threat-analysis',
            name: 'Threat Analysis',
            type: 'findings',
            order: 3,
            enabled: true,
            configuration: {
              title: 'Detailed Threat Analysis',
              dataSource: 'threat-intelligence-db',
              visualizations: ['threat-timeline', 'actor-attribution', 'ioc-correlation']
            },
            template: 'threat-analysis-template',
            dependencies: ['threat-data'],
            estimatedSize: 5
          }
        ],
        parameters: [
          {
            id: 'timeRange',
            name: 'timeRange',
            type: 'dateRange',
            label: 'Analysis Time Range',
            description: 'Date range for the analysis period',
            required: true,
            defaultValue: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              end: new Date()
            }
          },
          {
            id: 'threatTypes',
            name: 'threatTypes',
            type: 'multiSelect',
            label: 'Threat Types',
            description: 'Types of threats to include in analysis',
            required: false,
            defaultValue: ['malware', 'phishing', 'apt'],
            options: [
              { label: 'Malware', value: 'malware' },
              { label: 'Phishing', value: 'phishing' },
              { label: 'APT', value: 'apt' },
              { label: 'Ransomware', value: 'ransomware' },
              { label: 'DDoS', value: 'ddos' }
            ]
          },
          {
            id: 'classification',
            name: 'classification',
            type: 'select',
            label: 'Classification Level',
            description: 'Security classification of the report',
            required: true,
            defaultValue: 'confidential',
            options: [
              { label: 'Unclassified', value: 'unclassified' },
              { label: 'Confidential', value: 'confidential' },
              { label: 'Secret', value: 'secret' },
              { label: 'Top Secret', value: 'top_secret' }
            ]
          }
        ],
        recipients: ['ciso@company.com', 'threat-team@company.com'],
        branding: {
          colors: {
            primary: theme.palette.primary.main,
            secondary: theme.palette.secondary.main,
            accent: theme.palette.info.main
          },
          fonts: {
            heading: 'Roboto',
            body: 'Open Sans',
            monospace: 'Courier New'
          },
          classification: 'confidential'
        },
        metadata: {
          author: 'threat-analyst@company.com',
          version: '1.0',
          created: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          modified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          usageCount: Math.floor(Math.random() * 50),
          rating: Math.floor(Math.random() * 2) + 3,
          isPublic: Math.random() > 0.5,
          tags: ['threat-intelligence', category, type]
        },
        preview: `Mock preview for ${category} ${type} report template`,
        estimatedGenerationTime: Math.floor(Math.random() * 300) + 30
      });
    }
    
    return templates.sort((a, b) => b.metadata.usageCount - a.metadata.usageCount);
  }, [theme]);

  // Generate mock report generations
  const generateMockGenerations = useCallback((): ReportGeneration[] => {
    const generations: ReportGeneration[] = [];
    const templates = generateMockTemplates();
    const statuses = ['completed', 'generating', 'failed', 'queued'] as const;
    
    for (let i = 0; i < 25; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const duration = Math.floor(Math.random() * 300000) + 30000;
      
      generations.push({
        id: `generation-${i}`,
        templateId: template.id,
        templateName: template.name,
        parameters: {
          timeRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
          },
          threatTypes: ['malware', 'phishing'],
          classification: 'confidential'
        },
        status,
        progress: status === 'completed' ? 100 : 
                 status === 'generating' ? Math.floor(Math.random() * 80) + 10 :
                 status === 'failed' ? 0 : 0,
        currentSection: status === 'generating' ? 'threat-analysis' : undefined,
        startTime,
        endTime: status === 'completed' ? new Date(startTime.getTime() + duration) : undefined,
        duration: status === 'completed' ? duration : undefined,
        outputPath: status === 'completed' ? `/reports/output-${i}.${template.format}` : undefined,
        outputSize: status === 'completed' ? Math.floor(Math.random() * 10000000) + 1000000 : undefined,
        errorMessage: status === 'failed' ? 'Data source connection timeout' : undefined,
        warnings: status === 'completed' && Math.random() > 0.7 ? ['Some data sources were unavailable'] : [],
        statistics: {
          sectionsGenerated: status === 'completed' ? template.sections.length : Math.floor(Math.random() * template.sections.length),
          chartsCreated: Math.floor(Math.random() * 15),
          tablesCreated: Math.floor(Math.random() * 10),
          pagesGenerated: Math.floor(Math.random() * 50) + 10,
          dataPointsProcessed: Math.floor(Math.random() * 1000000) + 100000
        },
        metadata: {
          requestedBy: 'analyst@company.com',
          format: template.format,
          classification: 'confidential',
          distributionList: template.recipients
        }
      });
    }
    
    return generations.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }, [generateMockTemplates]);

  // Generate mock report data
  const generateMockReportData = useCallback((): ReportData => {
    return {
      threatLandscape: {
        totalThreats: 45678,
        newThreats: 1234,
        activeCampaigns: 23,
        topActors: ['APT28', 'Lazarus Group', 'FIN7', 'Carbanak', 'APT1'],
        riskTrend: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
          score: Math.floor(Math.random() * 20) + 70
        }))
      },
      incidentMetrics: {
        totalIncidents: 156,
        resolvedIncidents: 142,
        avgResolutionTime: 4.2,
        severityBreakdown: {
          critical: 12,
          high: 34,
          medium: 67,
          low: 43
        },
        topIncidentTypes: [
          { type: 'Malware', count: 45 },
          { type: 'Phishing', count: 38 },
          { type: 'Data Breach', count: 28 },
          { type: 'DDoS', count: 22 },
          { type: 'Insider Threat', count: 18 }
        ]
      },
      iocAnalysis: {
        totalIOCs: 12456,
        newIOCs: 567,
        validatedIOCs: 11234,
        falsePositives: 345,
        topSources: [
          { source: 'VirusTotal', count: 3456 },
          { source: 'Internal Analysis', count: 2134 },
          { source: 'Partner Feeds', count: 1897 },
          { source: 'OSINT', count: 1654 },
          { source: 'Commercial Feeds', count: 1432 }
        ],
        typeDistribution: {
          ip: 4567,
          domain: 3234,
          hash: 2345,
          url: 1456,
          email: 854
        }
      },
      performance: {
        detectionRate: 94.5,
        meanTimeToDetection: 2.3,
        meanTimeToResponse: 6.7,
        alertVolume: 2345,
        analystEfficiency: 87.2
      }
    };
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setReportTemplates(generateMockTemplates());
        setReportGenerations(generateMockGenerations());
        setReportData(generateMockReportData());
        
      } catch (err) {
        setError('Failed to load reporting data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockTemplates, generateMockGenerations, generateMockReportData]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return reportTemplates.filter(template => {
      if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !template.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !template.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      if (categoryFilter !== 'all' && template.category !== categoryFilter) {
        return false;
      }
      if (formatFilter !== 'all' && template.format !== formatFilter) {
        return false;
      }
      return true;
    });
  }, [reportTemplates, searchTerm, categoryFilter, formatFilter]);

  // Filter generations
  const filteredGenerations = useMemo(() => {
    return reportGenerations.filter(generation => {
      if (statusFilter !== 'all' && generation.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [reportGenerations, statusFilter]);

  // Generate report
  const generateReport = useCallback(async (template: ReportTemplate, parameters: Record<string, any>) => {
    const generationId = `generation-${Date.now()}`;
    
    const newGeneration: ReportGeneration = {
      id: generationId,
      templateId: template.id,
      templateName: template.name,
      parameters,
      status: 'generating',
      progress: 0,
      startTime: new Date(),
      warnings: [],
      statistics: {
        sectionsGenerated: 0,
        chartsCreated: 0,
        tablesCreated: 0,
        pagesGenerated: 0,
        dataPointsProcessed: 0
      },
      metadata: {
        requestedBy: 'analyst@company.com',
        format: template.format,
        classification: parameters.classification || 'confidential',
        distributionList: template.recipients
      }
    };

    setReportGenerations(prev => [newGeneration, ...prev]);
    setGeneratingReports(prev => ({ ...prev, [generationId]: true }));

    // Simulate report generation with progress updates
    const totalSteps = template.sections.length;
    for (let step = 0; step < totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const progress = ((step + 1) / totalSteps) * 100;
      setGenerationProgress(prev => ({ ...prev, [generationId]: progress }));
      
      setReportGenerations(prev => prev.map(gen =>
        gen.id === generationId 
          ? { 
              ...gen, 
              progress,
              currentSection: template.sections[step].name,
              statistics: {
                ...gen.statistics,
                sectionsGenerated: step + 1,
                chartsCreated: Math.floor(Math.random() * 3),
                tablesCreated: Math.floor(Math.random() * 2),
                pagesGenerated: Math.floor((step + 1) * 2.5),
                dataPointsProcessed: Math.floor(Math.random() * 100000)
              }
            }
          : gen
      ));
    }

    // Complete generation
    const completedGeneration: ReportGeneration = {
      ...newGeneration,
      status: 'completed',
      progress: 100,
      endTime: new Date(),
      duration: Date.now() - newGeneration.startTime.getTime(),
      outputPath: `/reports/${generationId}.${template.format}`,
      outputSize: Math.floor(Math.random() * 5000000) + 1000000,
      statistics: {
        sectionsGenerated: template.sections.length,
        chartsCreated: Math.floor(Math.random() * 15) + 5,
        tablesCreated: Math.floor(Math.random() * 10) + 3,
        pagesGenerated: Math.floor(Math.random() * 30) + 15,
        dataPointsProcessed: Math.floor(Math.random() * 1000000) + 500000
      }
    };

    setReportGenerations(prev => prev.map(gen =>
      gen.id === generationId ? completedGeneration : gen
    ));
    setGeneratingReports(prev => ({ ...prev, [generationId]: false }));
  }, []);

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'generating': return theme.palette.info.main;
      case 'failed': return theme.palette.error.main;
      case 'queued': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  // Get format icon
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <PictureAsPdf />;
      case 'html': return <Description />;
      case 'word': return <Description />;
      case 'excel': return <TableChart />;
      case 'powerpoint': return <PictureAsPdf />;
      default: return <InsertDriveFile />;
    }
  };

  // Render template library
  const renderTemplateLibrary = () => (
    <Grid container spacing={3}>
      {filteredTemplates.map(template => (
        <Grid item xs={12} sm={6} lg={4} key={template.id}>
          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8],
              }
            }}
            onClick={() => {
              setSelectedTemplate(template);
              setTemplateDetailsOpen(true);
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    {getFormatIcon(template.format)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" noWrap>
                      {template.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {template.category.replace('_', ' ')} • {template.format.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Chip
                    size="small"
                    label={template.type.replace('_', ' ')}
                    color="primary"
                    variant="outlined"
                  />
                  {template.metadata.isPublic && (
                    <Chip
                      size="small"
                      label="Public"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>

              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {template.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {template.metadata.tags.slice(0, 3).map(tag => (
                  <Chip
                    key={tag}
                    size="small"
                    label={tag}
                    variant="outlined"
                  />
                ))}
                {template.metadata.tags.length > 3 && (
                  <Chip
                    size="small"
                    label={`+${template.metadata.tags.length - 3} more`}
                    variant="outlined"
                  />
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Sections
                    </Typography>
                    <Typography variant="body2">
                      {template.sections.length}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Est. Time
                    </Typography>
                    <Typography variant="body2">
                      {Math.floor(template.estimatedGenerationTime / 60)}m {template.estimatedGenerationTime % 60}s
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Usage Count
                    </Typography>
                    <Typography variant="body2">
                      {template.metadata.usageCount}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2">
                        {template.metadata.rating.toFixed(1)}
                      </Typography>
                      <Box sx={{ display: 'flex' }}>
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            sx={{
                              fontSize: 16,
                              color: index < template.metadata.rating ? 
                                theme.palette.warning.main : theme.palette.grey[300]
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Modified: {template.metadata.modified.toLocaleDateString()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Start generation with default parameters
                      generateReport(template, {
                        timeRange: {
                          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                          end: new Date()
                        }
                      });
                    }}
                    color="primary"
                  >
                    <PlayArrow fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template);
                      setEditingTemplate(template);
                      setCreateTemplateOpen(true);
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Copy template
                    }}
                  >
                    <Copy fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render generation history
  const renderGenerationHistory = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Template</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Progress</TableCell>
            <TableCell>Started</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Output Size</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredGenerations.map(generation => (
            <TableRow
              key={generation.id}
              hover
              onClick={() => {
                setSelectedGeneration(generation);
                setGenerationDetailsOpen(true);
              }}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {generation.templateName}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {generation.metadata.format.toUpperCase()} • {generation.metadata.classification}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={generation.status}
                  color={
                    generation.status === 'completed' ? 'success' :
                    generation.status === 'generating' ? 'info' :
                    generation.status === 'failed' ? 'error' : 'warning'
                  }
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    {generation.progress}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={generation.progress}
                    sx={{ width: 80 }}
                  />
                </Box>
                {generation.currentSection && (
                  <Typography variant="caption" color="textSecondary">
                    {generation.currentSection}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {generation.startTime.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                {generation.duration ? (
                  <Typography variant="body2">
                    {Math.floor(generation.duration / 1000)}s
                  </Typography>
                ) : (
                  <Typography variant="caption" color="textSecondary">
                    Running...
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {generation.outputSize ? (
                  <Typography variant="body2">
                    {(generation.outputSize / 1024 / 1024).toFixed(1)} MB
                  </Typography>
                ) : (
                  <Typography variant="caption" color="textSecondary">
                    N/A
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {generation.status === 'completed' && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Download report
                      }}
                    >
                      <Download fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGeneration(generation);
                      setGenerationDetailsOpen(true);
                    }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                  {generation.status === 'generating' && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Cancel generation
                        setReportGenerations(prev => prev.map(gen =>
                          gen.id === generation.id ? { ...gen, status: 'cancelled' } : gen
                        ));
                      }}
                    >
                      <Stop fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render analytics dashboard
  const renderAnalyticsDashboard = () => {
    if (!reportData) return null;

    return (
      <Grid container spacing={3}>
        {/* Key Metrics Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <Report />
                    </Avatar>
                    <Box>
                      <Typography variant="h5">
                        {reportTemplates.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Templates
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
                        {reportGenerations.filter(g => g.status === 'completed').length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Completed
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
                      <PlayArrow />
                    </Avatar>
                    <Box>
                      <Typography variant="h5">
                        {reportGenerations.filter(g => g.status === 'generating').length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Generating
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
                      <Schedule />
                    </Avatar>
                    <Box>
                      <Typography variant="h5">
                        {reportTemplates.filter(t => t.schedule?.enabled).length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Scheduled
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Usage Trends */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Generation Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={Array.from({ length: 30 }, (_, i) => ({
                    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
                    reports: Math.floor(Math.random() * 20) + 5,
                    templates: Math.floor(Math.random() * 5) + 1
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="reports"
                    stackId="1"
                    stroke={theme.palette.primary.main}
                    fill={alpha(theme.palette.primary.main, 0.7)}
                    name="Reports Generated"
                  />
                  <Area
                    type="monotone"
                    dataKey="templates"
                    stackId="1"
                    stroke={theme.palette.secondary.main}
                    fill={alpha(theme.palette.secondary.main, 0.7)}
                    name="Templates Created"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Template Categories */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Template Categories
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={[
                      { name: 'Executive', value: reportTemplates.filter(t => t.category === 'executive').length, fill: theme.palette.primary.main },
                      { name: 'Tactical', value: reportTemplates.filter(t => t.category === 'tactical').length, fill: theme.palette.secondary.main },
                      { name: 'Operational', value: reportTemplates.filter(t => t.category === 'operational').length, fill: theme.palette.info.main },
                      { name: 'Strategic', value: reportTemplates.filter(t => t.category === 'strategic').length, fill: theme.palette.warning.main },
                      { name: 'Technical', value: reportTemplates.filter(t => t.category === 'technical').length, fill: theme.palette.success.main }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({name, value}) => `${name}: ${value}`}
                  >
                    {[
                      { fill: theme.palette.primary.main },
                      { fill: theme.palette.secondary.main },
                      { fill: theme.palette.info.main },
                      { fill: theme.palette.warning.main },
                      { fill: theme.palette.success.main }
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

        {/* Most Used Templates */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Most Popular Templates
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={reportTemplates
                    .sort((a, b) => b.metadata.usageCount - a.metadata.usageCount)
                    .slice(0, 10)
                    .map(t => ({
                      name: t.name.length > 20 ? t.name.substring(0, 17) + '...' : t.name,
                      usage: t.metadata.usageCount,
                      rating: t.metadata.rating
                    }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="usage" fill={theme.palette.primary.main} name="Usage Count" />
                  <Bar dataKey="rating" fill={theme.palette.secondary.main} name="Rating (x10)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Advanced Reporting Engine
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Customizable threat intelligence reporting with enterprise templates
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search templates..."
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
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="executive">Executive</MenuItem>
                <MenuItem value="tactical">Tactical</MenuItem>
                <MenuItem value="operational">Operational</MenuItem>
                <MenuItem value="strategic">Strategic</MenuItem>
                <MenuItem value="technical">Technical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Format</InputLabel>
              <Select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                label="Format"
              >
                <MenuItem value="all">All Formats</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="html">HTML</MenuItem>
                <MenuItem value="word">Word</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="powerpoint">PowerPoint</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="generating">Generating</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="queued">Queued</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingTemplate(null);
                  setCreateTemplateOpen(true);
                }}
              >
                New Template
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Paper>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Templates" icon={<Report />} />
          <Tab label="Generation History" icon={<History />} />
          <Tab label="Analytics" icon={<Analytics />} />
          <Tab label="Scheduled Reports" icon={<Schedule />} />
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
            {activeTab === 0 && renderTemplateLibrary()}
            {activeTab === 1 && renderGenerationHistory()}
            {activeTab === 2 && renderAnalyticsDashboard()}
            {activeTab === 3 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Scheduled Reports</Typography>
                <Typography variant="body2" color="textSecondary">
                  Scheduled reporting functionality coming soon...
                </Typography>
              </Paper>
            )}
          </>
        )}
      </Box>

      {/* Template Details Dialog */}
      {selectedTemplate && (
        <Dialog
          open={templateDetailsOpen}
          onClose={() => setTemplateDetailsOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                {getFormatIcon(selectedTemplate.format)}
              </Avatar>
              <Box>
                <Typography variant="h5">
                  {selectedTemplate.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedTemplate.category} • {selectedTemplate.format.toUpperCase()}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {selectedTemplate.description}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Template Sections
                </Typography>
                <List>
                  {selectedTemplate.sections.map((section, index) => (
                    <ListItem key={section.id}>
                      <ListItemIcon>
                        <Badge badgeContent={section.order} color="primary">
                          <Description />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary={section.name}
                        secondary={section.configuration.description}
                      />
                      <Switch
                        checked={section.enabled}
                        disabled
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Parameters
                </Typography>
                <List>
                  {selectedTemplate.parameters.map(param => (
                    <ListItem key={param.id}>
                      <ListItemText
                        primary={param.label}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {param.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                              <Chip size="small" label={param.type} variant="outlined" />
                              {param.required && (
                                <Chip size="small" label="Required" color="error" variant="outlined" />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTemplateDetailsOpen(false)}>
              Close
            </Button>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => {
                setEditingTemplate(selectedTemplate);
                setCreateTemplateOpen(true);
                setTemplateDetailsOpen(false);
              }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={() => {
                generateReport(selectedTemplate, {
                  timeRange: {
                    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    end: new Date()
                  }
                });
                setTemplateDetailsOpen(false);
              }}
            >
              Generate Report
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Reporting Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Add />}
          tooltipTitle="New Template"
          onClick={() => setCreateTemplateOpen(true)}
        />
        <SpeedDialAction
          icon={<Report />}
          tooltipTitle="Quick Report"
          onClick={() => {/* Quick report */}}
        />
        <SpeedDialAction
          icon={<Schedule />}
          tooltipTitle="Schedule Report"
          onClick={() => setScheduleOpen(true)}
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

export default AdvancedReportingEngine;
