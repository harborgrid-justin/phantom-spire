/**
 * Advanced Threat Hunting Query Builder and Results Visualization
 * Enterprise-grade hunting platform competing with leading SIEM and hunting tools
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Autocomplete,
  FormGroup,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
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
  ListItemButton,
  Collapse,
  Breadcrumbs,
  Link,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList,
  MenuItem as MenuItemComponent
} from '@mui/material';

import {
  Search,
  Code,
  PlayArrow,
  Pause,
  Stop,
  Save,
  SaveAs,
  FolderOpen,
  History,
  Analytics,
  Assessment,
  Visibility,
  VisibilityOff,
  FilterList,
  Download,
  Share,
  Settings,
  Refresh,
  Edit,
  Delete,
  Add,
  Remove,
  Copy,
  Paste,
  Undo,
  Redo,
  FormatIndentIncrease,
  FormatIndentDecrease,
  FindInPage,
  FindReplace,
  BugReport,
  Security,
  Warning,
  Error,
  CheckCircle,
  Info,
  Timeline as TimelineIcon,
  TrendingUp,
  TrendingDown,
  ExpandMore,
  ExpandLess,
  ChevronRight,
  MoreVert,
  Launch,
  OpenInNew,
  Map,
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
  DataUsage,
  CloudDownload,
  Storage,
  Memory,
  Speed,
  NetworkCheck,
  Computer,
  Psychology,
  Shield,
  AccountTree,
  Category,
  Extension,
  Build,
  Engineering,
  Handyman,
  Construction,
  Architecture,
  AutoAwesome,
  Lightbulb,
  BookmarkBorder,
  Bookmark,
  Star,
  StarBorder,
  Flag,
  LocationOn,
  Schedule,
  Person,
  Business,
  Dashboard,
  ViewModule,
  FormatListBulleted,
  Layers,
  GridOn
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
  ComposedChart,
  ReferenceLine,
  Brush,
  ResponsiveContainer as RCContainer
} from 'recharts';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/core/UIUXEvaluationService';

// Query builder interfaces
interface QueryField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'ip' | 'hash' | 'enum';
  description: string;
  examples: string[];
  operators: string[];
  category: string;
  popularity: number;
}

interface QueryOperator {
  name: string;
  symbol: string;
  description: string;
  supportedTypes: string[];
  examples: string[];
}

interface QueryTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  query: string;
  language: 'kql' | 'sql' | 'sigma' | 'yara' | 'splunk';
  platforms: string[];
  use_cases: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  author: string;
  created: Date;
  modified: Date;
  usage_count: number;
  rating: number;
  isFavorite: boolean;
  isPublic: boolean;
  variables: {
    name: string;
    type: string;
    defaultValue: any;
    description: string;
  }[];
}

interface QueryExecution {
  id: string;
  query: string;
  language: string;
  status: 'running' | 'completed' | 'error' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  resultCount: number;
  errorMessage?: string;
  dataSource: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  statistics: {
    rowsProcessed: number;
    bytesProcessed: number;
    cacheMisses: number;
    cacheHits: number;
    cpuTime: number;
    memoryUsage: number;
  };
  results: QueryResult[];
}

interface QueryResult {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  fields: Record<string, any>;
  enrichment: {
    iocs: string[];
    actors: string[];
    campaigns: string[];
    techniques: string[];
    geolocation?: {
      country: string;
      city: string;
      coordinates: [number, number];
    };
    reputation: number;
    context: string[];
  };
  alerts: {
    id: string;
    rule: string;
    description: string;
    severity: string;
  }[];
  annotations: {
    id: string;
    analyst: string;
    note: string;
    timestamp: Date;
    type: 'false_positive' | 'true_positive' | 'investigation_required' | 'escalated';
  }[];
}

interface HuntingSession {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  scope: {
    timeRange: { start: Date; end: Date };
    dataSources: string[];
    targets: string[];
    techniques: string[];
  };
  queries: QueryExecution[];
  findings: {
    id: string;
    title: string;
    description: string;
    severity: string;
    confidence: number;
    evidence: string[];
    iocs: string[];
    recommendations: string[];
  }[];
  collaborators: string[];
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  created: Date;
  lastActivity: Date;
  createdBy: string;
  tags: string[];
}

const AdvancedThreatHuntingQueryBuilder: React.FC = () => {
  const theme = useTheme();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  // Core states
  const [currentQuery, setCurrentQuery] = useState('');
  const [queryLanguage, setQueryLanguage] = useState<'kql' | 'sql' | 'sigma' | 'yara' | 'splunk'>('kql');
  const [queryFields, setQueryFields] = useState<QueryField[]>([]);
  const [queryOperators, setQueryOperators] = useState<QueryOperator[]>([]);
  const [queryTemplates, setQueryTemplates] = useState<QueryTemplate[]>([]);
  const [executions, setExecutions] = useState<QueryExecution[]>([]);
  const [currentExecution, setCurrentExecution] = useState<QueryExecution | null>(null);
  const [huntingSessions, setHuntingSessions] = useState<HuntingSession[]>([]);
  const [currentSession, setCurrentSession] = useState<HuntingSession | null>(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Editor states
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');
  const [syntaxHighlighting, setSyntaxHighlighting] = useState(true);
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);
  const [autoExecute, setAutoExecute] = useState(false);
  const [queryValidation, setQueryValidation] = useState(true);
  
  // Visual query builder states
  const [visualFilters, setVisualFilters] = useState<{
    field: string;
    operator: string;
    value: string;
    logic: 'AND' | 'OR';
  }[]>([]);
  
  // Results states
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [resultViewMode, setResultViewMode] = useState<'table' | 'timeline' | 'map' | 'chart'>('table');
  const [resultGroupBy, setResultGroupBy] = useState<string>('');
  const [resultsPerPage, setResultsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('advanced-threat-hunting-query-builder', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 120000
    });

    return () => evaluationController.remove();
  }, []);

  // Generate mock query fields
  const generateQueryFields = useCallback((): QueryField[] => {
    return [
      {
        name: 'ProcessName',
        type: 'string',
        description: 'Name of the process',
        examples: ['powershell.exe', 'cmd.exe', 'svchost.exe'],
        operators: ['==', '!=', 'contains', 'startswith', 'endswith', 'matches'],
        category: 'Process',
        popularity: 95
      },
      {
        name: 'CommandLine',
        type: 'string',
        description: 'Process command line arguments',
        examples: ['powershell -enc', 'cmd /c', 'net user'],
        operators: ['==', '!=', 'contains', 'startswith', 'endswith', 'matches'],
        category: 'Process',
        popularity: 90
      },
      {
        name: 'SourceIP',
        type: 'ip',
        description: 'Source IP address',
        examples: ['192.168.1.1', '10.0.0.0/8', '172.16.0.0/12'],
        operators: ['==', '!=', 'in', 'not_in', 'between'],
        category: 'Network',
        popularity: 88
      },
      {
        name: 'DestinationIP',
        type: 'ip',
        description: 'Destination IP address',
        examples: ['8.8.8.8', '1.1.1.1', '208.67.222.222'],
        operators: ['==', '!=', 'in', 'not_in', 'between'],
        category: 'Network',
        popularity: 85
      },
      {
        name: 'EventTime',
        type: 'date',
        description: 'Timestamp of the event',
        examples: ['now()', 'ago(1h)', 'datetime(2024-01-01)'],
        operators: ['==', '!=', '>', '<', '>=', '<=', 'between'],
        category: 'Temporal',
        popularity: 92
      },
      {
        name: 'UserName',
        type: 'string',
        description: 'Username associated with the event',
        examples: ['administrator', 'system', 'guest'],
        operators: ['==', '!=', 'contains', 'startswith', 'endswith'],
        category: 'Identity',
        popularity: 87
      },
      {
        name: 'FileHash',
        type: 'hash',
        description: 'File hash (MD5, SHA1, SHA256)',
        examples: ['d41d8cd98f00b204e9800998ecf8427e', 'adc83b19e793491b1c6ea0fd8b46cd9f32e592fc'],
        operators: ['==', '!=', 'in', 'not_in'],
        category: 'File',
        popularity: 82
      },
      {
        name: 'DomainName',
        type: 'string',
        description: 'Domain name in network traffic',
        examples: ['example.com', 'malicious.net', 'suspicious.org'],
        operators: ['==', '!=', 'contains', 'startswith', 'endswith', 'matches'],
        category: 'Network',
        popularity: 80
      }
    ];
  }, []);

  // Generate mock query templates
  const generateQueryTemplates = useCallback((): QueryTemplate[] => {
    const categories = ['Malware Detection', 'Lateral Movement', 'Data Exfiltration', 'Privilege Escalation', 'Command & Control'];
    const languages = ['kql', 'sql', 'sigma', 'splunk'] as const;
    const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
    
    const templates: QueryTemplate[] = [];
    
    for (let i = 0; i < 25; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const language = languages[Math.floor(Math.random() * languages.length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      
      const kqlQuery = `Event
| where TimeGenerated > ago(24h)
| where ProcessName contains "powershell"
| where CommandLine contains "encoded"
| project TimeGenerated, Computer, ProcessName, CommandLine, User
| order by TimeGenerated desc`;

      const sqlQuery = `SELECT 
  timestamp,
  hostname,
  process_name,
  command_line,
  username
FROM security_events 
WHERE timestamp >= NOW() - INTERVAL 24 HOUR
  AND process_name LIKE '%powershell%'
  AND command_line LIKE '%encoded%'
ORDER BY timestamp DESC`;

      const sigmaQuery = `title: Suspicious PowerShell Execution
status: experimental
description: Detects suspicious PowerShell execution with encoded commands
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|endswith: '\\powershell.exe'
    CommandLine|contains: 'encoded'
  condition: selection
falsepositives:
  - Administrative scripts
level: medium`;

      templates.push({
        id: `template-${i}`,
        name: `${category} Detection ${i + 1}`,
        description: `Advanced hunting query for detecting ${category.toLowerCase()} activities`,
        category,
        query: language === 'kql' ? kqlQuery : 
               language === 'sql' ? sqlQuery :
               language === 'sigma' ? sigmaQuery : kqlQuery,
        language,
        platforms: ['Windows', 'Linux', 'Network'],
        use_cases: [category, 'Threat Hunting', 'Investigation'],
        difficulty,
        tags: ['hunting', 'detection', category.toLowerCase().replace(' ', '-')],
        author: 'threat-hunter@company.com',
        created: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        modified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        usage_count: Math.floor(Math.random() * 500),
        rating: Math.floor(Math.random() * 2) + 3,
        isFavorite: Math.random() > 0.7,
        isPublic: Math.random() > 0.3,
        variables: [
          {
            name: 'timeRange',
            type: 'timespan',
            defaultValue: '24h',
            description: 'Time range for the query'
          },
          {
            name: 'processName',
            type: 'string',
            defaultValue: 'powershell',
            description: 'Process name to search for'
          }
        ]
      });
    }
    
    return templates.sort((a, b) => b.usage_count - a.usage_count);
  }, []);

  // Generate mock executions
  const generateMockExecutions = useCallback((): QueryExecution[] => {
    const executions: QueryExecution[] = [];
    
    for (let i = 0; i < 15; i++) {
      const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const duration = Math.floor(Math.random() * 30000) + 1000;
      const endTime = new Date(startTime.getTime() + duration);
      const resultCount = Math.floor(Math.random() * 1000);
      
      // Generate mock results
      const results: QueryResult[] = [];
      for (let j = 0; j < Math.min(resultCount, 100); j++) {
        results.push({
          id: `result-${i}-${j}`,
          timestamp: new Date(startTime.getTime() + Math.random() * duration),
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
          confidence: Math.floor(Math.random() * 40) + 60,
          fields: {
            ProcessName: ['powershell.exe', 'cmd.exe', 'svchost.exe'][Math.floor(Math.random() * 3)],
            CommandLine: `powershell -enc ${Math.random().toString(36).substring(2, 15)}`,
            SourceIP: `192.168.1.${Math.floor(Math.random() * 255)}`,
            UserName: ['administrator', 'system', 'user'][Math.floor(Math.random() * 3)],
            Computer: `DESKTOP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
          },
          enrichment: {
            iocs: [`IOC-${j}-1`, `IOC-${j}-2`],
            actors: [`APT-${Math.floor(Math.random() * 50)}`],
            campaigns: [`Campaign-${Math.floor(Math.random() * 20)}`],
            techniques: ['T1059', 'T1027', 'T1055'],
            geolocation: {
              country: ['US', 'CN', 'RU', 'DE', 'FR'][Math.floor(Math.random() * 5)],
              city: 'Unknown',
              coordinates: [Math.random() * 180 - 90, Math.random() * 360 - 180]
            },
            reputation: Math.floor(Math.random() * 100),
            context: ['Malware execution', 'Lateral movement', 'Data exfiltration']
          },
          alerts: [
            {
              id: `alert-${j}`,
              rule: 'Suspicious PowerShell Execution',
              description: 'Detected encoded PowerShell command execution',
              severity: 'high'
            }
          ],
          annotations: []
        });
      }
      
      executions.push({
        id: `execution-${i}`,
        query: `Event | where TimeGenerated > ago(24h) | where ProcessName contains "powershell"`,
        language: 'kql',
        status: ['completed', 'error', 'running'][Math.floor(Math.random() * 3)] as any,
        startTime,
        endTime: endTime,
        duration,
        resultCount,
        errorMessage: Math.random() > 0.8 ? 'Query timeout after 30 seconds' : undefined,
        dataSource: ['Azure Sentinel', 'Splunk', 'Elastic', 'QRadar'][Math.floor(Math.random() * 4)],
        timeRange: {
          start: new Date(startTime.getTime() - 24 * 60 * 60 * 1000),
          end: startTime
        },
        statistics: {
          rowsProcessed: Math.floor(Math.random() * 1000000),
          bytesProcessed: Math.floor(Math.random() * 1000000000),
          cacheMisses: Math.floor(Math.random() * 100),
          cacheHits: Math.floor(Math.random() * 500),
          cpuTime: Math.floor(Math.random() * 10000),
          memoryUsage: Math.floor(Math.random() * 1000)
        },
        results
      });
    }
    
    return executions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        setQueryFields(generateQueryFields());
        setQueryTemplates(generateQueryTemplates());
        setExecutions(generateMockExecutions());
        
        // Set default query
        setCurrentQuery(`Event
| where TimeGenerated > ago(24h)
| where ProcessName in ("powershell.exe", "cmd.exe")
| where CommandLine contains "encoded" or CommandLine contains "base64"
| project TimeGenerated, Computer, ProcessName, CommandLine, User
| order by TimeGenerated desc`);
        
      } catch (err) {
        setError('Failed to load hunting data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateQueryFields, generateQueryTemplates, generateMockExecutions]);

  // Execute query
  const executeQuery = useCallback(async () => {
    if (!currentQuery.trim()) {
      setError('Please enter a query to execute');
      return;
    }

    setIsExecuting(true);
    setError(null);

    try {
      // Simulate query execution
      const execution: QueryExecution = {
        id: `execution-${Date.now()}`,
        query: currentQuery,
        language: queryLanguage,
        status: 'running',
        startTime: new Date(),
        resultCount: 0,
        dataSource: 'Azure Sentinel',
        timeRange: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: new Date()
        },
        statistics: {
          rowsProcessed: 0,
          bytesProcessed: 0,
          cacheMisses: 0,
          cacheHits: 0,
          cpuTime: 0,
          memoryUsage: 0
        },
        results: []
      };

      setCurrentExecution(execution);
      setExecutions(prev => [execution, ...prev]);

      // Simulate execution time
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

      // Complete execution
      const resultCount = Math.floor(Math.random() * 500);
      const completedExecution: QueryExecution = {
        ...execution,
        status: 'completed',
        endTime: new Date(),
        duration: Date.now() - execution.startTime.getTime(),
        resultCount,
        statistics: {
          rowsProcessed: Math.floor(Math.random() * 1000000),
          bytesProcessed: Math.floor(Math.random() * 1000000000),
          cacheMisses: Math.floor(Math.random() * 100),
          cacheHits: Math.floor(Math.random() * 500),
          cpuTime: Math.floor(Math.random() * 10000),
          memoryUsage: Math.floor(Math.random() * 1000)
        },
        results: []
      };

      setCurrentExecution(completedExecution);
      setExecutions(prev => prev.map(e => e.id === execution.id ? completedExecution : e));
      setResultsOpen(true);

    } catch (err) {
      setError('Query execution failed');
      console.error('Execution error:', err);
    } finally {
      setIsExecuting(false);
    }
  }, [currentQuery, queryLanguage]);

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'running': return theme.palette.info.main;
      case 'error': return theme.palette.error.main;
      case 'cancelled': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  // Render query editor
  const renderQueryEditor = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Query Editor
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={editorMode}
              exclusive
              onChange={(_, value) => value && setEditorMode(value)}
              size="small"
            >
              <ToggleButton value="visual">Visual</ToggleButton>
              <ToggleButton value="code">Code</ToggleButton>
            </ToggleButtonGroup>
            
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={queryLanguage}
                onChange={(e) => setQueryLanguage(e.target.value as any)}
                label="Language"
              >
                <MenuItem value="kql">KQL</MenuItem>
                <MenuItem value="sql">SQL</MenuItem>
                <MenuItem value="sigma">Sigma</MenuItem>
                <MenuItem value="splunk">Splunk</MenuItem>
                <MenuItem value="yara">YARA</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {editorMode === 'code' ? (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <TextField
              ref={editorRef}
              multiline
              rows={12}
              fullWidth
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              placeholder={`Enter your ${queryLanguage.toUpperCase()} query here...`}
              variant="outlined"
              sx={{
                flexGrow: 1,
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '13px'
                }
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={isExecuting ? <CircularProgress size={16} /> : <PlayArrow />}
                  onClick={executeQuery}
                  disabled={isExecuting}
                >
                  {isExecuting ? 'Executing...' : 'Execute'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={() => {/* Save query */}}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FolderOpen />}
                  onClick={() => setTemplatesOpen(true)}
                >
                  Templates
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" title="Format Query">
                  <FormatIndentIncrease />
                </IconButton>
                <IconButton size="small" title="Validate Query">
                  <CheckCircle />
                </IconButton>
                <IconButton size="small" title="Query History">
                  <History />
                </IconButton>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Visual Query Builder
            </Typography>
            
            {visualFilters.map((filter, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3}>
                    <Autocomplete
                      size="small"
                      options={queryFields}
                      getOptionLabel={(option) => option.name}
                      value={queryFields.find(f => f.name === filter.field) || null}
                      onChange={(_, newValue) => {
                        setVisualFilters(prev => prev.map((f, i) => 
                          i === index ? { ...f, field: newValue?.name || '' } : f
                        ));
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Field" />
                      )}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Operator</InputLabel>
                      <Select
                        value={filter.operator}
                        onChange={(e) => {
                          setVisualFilters(prev => prev.map((f, i) => 
                            i === index ? { ...f, operator: e.target.value } : f
                          ));
                        }}
                        label="Operator"
                      >
                        <MenuItem value="==">=</MenuItem>
                        <MenuItem value="!=">!=</MenuItem>
                        <MenuItem value="contains">contains</MenuItem>
                        <MenuItem value=">">&gt;</MenuItem>
                        <MenuItem value="<">&lt;</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Value"
                      value={filter.value}
                      onChange={(e) => {
                        setVisualFilters(prev => prev.map((f, i) => 
                          i === index ? { ...f, value: e.target.value } : f
                        ));
                      }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Logic</InputLabel>
                      <Select
                        value={filter.logic}
                        onChange={(e) => {
                          setVisualFilters(prev => prev.map((f, i) => 
                            i === index ? { ...f, logic: e.target.value as any } : f
                          ));
                        }}
                        label="Logic"
                      >
                        <MenuItem value="AND">AND</MenuItem>
                        <MenuItem value="OR">OR</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton
                      onClick={() => {
                        setVisualFilters(prev => prev.filter((_, i) => i !== index));
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}
            
            <Button
              startIcon={<Add />}
              onClick={() => {
                setVisualFilters(prev => [...prev, {
                  field: '',
                  operator: '==',
                  value: '',
                  logic: 'AND'
                }]);
              }}
              sx={{ mb: 2 }}
            >
              Add Filter
            </Button>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={executeQuery}
                disabled={isExecuting}
              >
                Execute Query
              </Button>
              <Button
                variant="outlined"
                startIcon={<Code />}
                onClick={() => setEditorMode('code')}
              >
                View Code
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Render execution history
  const renderExecutionHistory = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Execution History
        </Typography>
        <List>
          {executions.slice(0, 10).map(execution => (
            <ListItem
              key={execution.id}
              button
              onClick={() => {
                setCurrentExecution(execution);
                setResultsOpen(true);
              }}
            >
              <ListItemIcon>
                <Avatar
                  sx={{
                    bgcolor: getStatusColor(execution.status),
                    width: 32,
                    height: 32
                  }}
                >
                  {execution.status === 'running' ? (
                    <CircularProgress size={16} />
                  ) : execution.status === 'completed' ? (
                    <CheckCircle fontSize="small" />
                  ) : execution.status === 'error' ? (
                    <Error fontSize="small" />
                  ) : (
                    <Pause fontSize="small" />
                  )}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" noWrap>
                    {execution.query.length > 50 ? 
                      execution.query.substring(0, 47) + '...' : 
                      execution.query}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                    <Chip
                      size="small"
                      label={execution.language.toUpperCase()}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={`${execution.resultCount} results`}
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="textSecondary">
                      {execution.startTime.toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small">
                  <Copy fontSize="small" />
                </IconButton>
                <IconButton size="small">
                  <Download fontSize="small" />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  // Render results visualization
  const renderResultsVisualization = () => {
    if (!currentExecution || currentExecution.results.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Typography variant="body2" color="textSecondary">
            No results to display
          </Typography>
        </Box>
      );
    }

    const timeSeriesData = currentExecution.results
      .reduce((acc, result) => {
        const hour = new Date(result.timestamp).getHours();
        const existing = acc.find(item => item.hour === hour);
        if (existing) {
          existing.count++;
          existing.critical += result.severity === 'critical' ? 1 : 0;
          existing.high += result.severity === 'high' ? 1 : 0;
          existing.medium += result.severity === 'medium' ? 1 : 0;
          existing.low += result.severity === 'low' ? 1 : 0;
        } else {
          acc.push({
            hour,
            count: 1,
            critical: result.severity === 'critical' ? 1 : 0,
            high: result.severity === 'high' ? 1 : 0,
            medium: result.severity === 'medium' ? 1 : 0,
            low: result.severity === 'low' ? 1 : 0
          });
        }
        return acc;
      }, [] as any[])
      .sort((a, b) => a.hour - b.hour);

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Results Timeline
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="critical" stackId="a" fill={theme.palette.error.main} name="Critical" />
                  <Bar dataKey="high" stackId="a" fill={theme.palette.warning.main} name="High" />
                  <Bar dataKey="medium" stackId="a" fill={theme.palette.info.main} name="Medium" />
                  <Bar dataKey="low" stackId="a" fill={theme.palette.success.main} name="Low" />
                  <Line type="monotone" dataKey="count" stroke={theme.palette.primary.main} name="Total" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Severity Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={[
                      { name: 'Critical', value: currentExecution.results.filter(r => r.severity === 'critical').length, fill: theme.palette.error.main },
                      { name: 'High', value: currentExecution.results.filter(r => r.severity === 'high').length, fill: theme.palette.warning.main },
                      { name: 'Medium', value: currentExecution.results.filter(r => r.severity === 'medium').length, fill: theme.palette.info.main },
                      { name: 'Low', value: currentExecution.results.filter(r => r.severity === 'low').length, fill: theme.palette.success.main }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({name, value}) => `${name}: ${value}`}
                  >
                    {[
                      { fill: theme.palette.error.main },
                      { fill: theme.palette.warning.main },
                      { fill: theme.palette.info.main },
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
      </Grid>
    );
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
        sx={{
          width: 320,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
            position: 'relative'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Threat Hunting Workbench
          </Typography>
          
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab label="Fields" />
            <Tab label="Templates" />
            <Tab label="History" />
          </Tabs>
          
          {activeTab === 0 && (
            <Box>
              <TextField
                fullWidth
                size="small"
                placeholder="Search fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />
              
              <List dense>
                {queryFields
                  .filter(field => 
                    !searchTerm || 
                    field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    field.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(field => (
                    <ListItem
                      key={field.name}
                      button
                      onClick={() => {
                        // Insert field into query
                        const currentPos = editorRef.current?.selectionStart || 0;
                        const newQuery = currentQuery.substring(0, currentPos) + 
                                        field.name + 
                                        currentQuery.substring(currentPos);
                        setCurrentQuery(newQuery);
                      }}
                    >
                      <ListItemIcon>
                        <Chip
                          size="small"
                          label={field.type}
                          color="primary"
                          variant="outlined"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={field.name}
                        secondary={field.description}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="textSecondary">
                          {field.popularity}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={field.popularity}
                          sx={{ width: 40 }}
                        />
                      </Box>
                    </ListItem>
                  ))}
              </List>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <TextField
                fullWidth
                size="small"
                placeholder="Search templates..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />
              
              <List dense>
                {queryTemplates.slice(0, 10).map(template => (
                  <ListItem
                    key={template.id}
                    button
                    onClick={() => {
                      setCurrentQuery(template.query);
                      setQueryLanguage(template.language);
                    }}
                  >
                    <ListItemIcon>
                      {template.isFavorite ? (
                        <Star color="warning" />
                      ) : (
                        <StarBorder />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={template.name}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {template.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            <Chip
                              size="small"
                              label={template.language.toUpperCase()}
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              label={template.difficulty}
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {activeTab === 2 && renderExecutionHistory()}
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <MenuItemComponent />
            </IconButton>
            
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Advanced Threat Hunting Query Builder
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FolderOpen />}
                onClick={() => setSessionOpen(true)}
              >
                Sessions
              </Button>
              <Button
                variant="outlined"
                startIcon={<Analytics />}
                onClick={() => setResultsOpen(true)}
              >
                Results
              </Button>
              <IconButton onClick={() => setSettingsOpen(true)}>
                <Settings />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Editor and Results */}
        <Box sx={{ flexGrow: 1, p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress size={60} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <Grid container spacing={3} sx={{ height: '100%' }}>
              <Grid item xs={12} md={6}>
                {renderQueryEditor()}
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Query Results
                    </Typography>
                    {currentExecution ? (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip
                              size="small"
                              label={currentExecution.status}
                              color={
                                currentExecution.status === 'completed' ? 'success' :
                                currentExecution.status === 'running' ? 'info' :
                                currentExecution.status === 'error' ? 'error' : 'default'
                              }
                            />
                            <Typography variant="body2">
                              {currentExecution.resultCount.toLocaleString()} results
                            </Typography>
                            {currentExecution.duration && (
                              <Typography variant="caption" color="textSecondary">
                                ({(currentExecution.duration / 1000).toFixed(2)}s)
                              </Typography>
                            )}
                          </Box>
                          
                          <ToggleButtonGroup
                            value={resultViewMode}
                            exclusive
                            onChange={(_, value) => value && setResultViewMode(value)}
                            size="small"
                          >
                            <ToggleButton value="table">Table</ToggleButton>
                            <ToggleButton value="timeline">Timeline</ToggleButton>
                            <ToggleButton value="chart">Chart</ToggleButton>
                          </ToggleButtonGroup>
                        </Box>
                        
                        {resultViewMode === 'chart' && renderResultsVisualization()}
                        
                        {resultViewMode === 'table' && (
                          <TableContainer sx={{ maxHeight: 400 }}>
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Timestamp</TableCell>
                                  <TableCell>Severity</TableCell>
                                  <TableCell>Process</TableCell>
                                  <TableCell>Command</TableCell>
                                  <TableCell>Source IP</TableCell>
                                  <TableCell>Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {currentExecution.results.slice(0, 50).map(result => (
                                  <TableRow key={result.id} hover>
                                    <TableCell>
                                      <Typography variant="caption">
                                        {result.timestamp.toLocaleString()}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        size="small"
                                        label={result.severity}
                                        color={
                                          result.severity === 'critical' ? 'error' :
                                          result.severity === 'high' ? 'warning' :
                                          result.severity === 'medium' ? 'info' : 'success'
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {result.fields.ProcessName || 'N/A'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography 
                                        variant="body2" 
                                        noWrap 
                                        sx={{ maxWidth: 200 }}
                                        title={result.fields.CommandLine}
                                      >
                                        {result.fields.CommandLine || 'N/A'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {result.fields.SourceIP || 'N/A'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton size="small">
                                          <Visibility fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small">
                                          <Analytics fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <Typography variant="body2" color="textSecondary">
                          Execute a query to see results
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Hunting Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Add />}
          tooltipTitle="New Query"
          onClick={() => setCurrentQuery('')}
        />
        <SpeedDialAction
          icon={<Save />}
          tooltipTitle="Save Query"
          onClick={() => {/* Save */}}
        />
        <SpeedDialAction
          icon={<Download />}
          tooltipTitle="Export Results"
          onClick={() => {/* Export */}}
        />
        <SpeedDialAction
          icon={<Share />}
          tooltipTitle="Share Hunt"
          onClick={() => {/* Share */}}
        />
      </SpeedDial>
    </Box>
  );
};

export default AdvancedThreatHuntingQueryBuilder;