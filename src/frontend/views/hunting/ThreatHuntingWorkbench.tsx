/**
 * Threat Hunting Workbench
 * Advanced threat hunting and investigation workspace
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  LinearProgress,
  Tooltip,
  Badge,
  alpha,
  useTheme,
  Snackbar
} from '@mui/material';
import {
  Search,
  Add,
  PlayArrow,
  Save,
  Share,
  Download,
  History,
  Bookmark,
  Code,
  Timeline,
  Analytics,
  Security,
  Visibility,
  Warning,
  CheckCircle,  Error as ErrorIcon,
  Info,
  ExpandMore,
  FilterList,
  Refresh,
  Delete,
  Edit,
  Launch,
  QueryStats,
  DataObject,
  StorageOutlined
} from '@mui/icons-material';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

interface HuntingQuery {
  id: string;
  name: string;
  description: string;
  query: string;
  language: 'kql' | 'sql' | 'sigma' | 'yara';
  tags: string[];
  author: string;
  createdAt: Date;
  lastModified: Date;
  executionCount: number;
  avgExecutionTime: number;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dataSource: string[];
  isFavorite: boolean;
}

interface HuntingResult {
  id: string;
  queryId: string;
  executedAt: Date;
  resultCount: number;
  executionTime: number;
  status: 'success' | 'error' | 'timeout';
  data: Record<string, any>[];
  errorMessage?: string;
}

interface HuntingSession {
  id: string;
  name: string;
  description: string;
  queries: string[];
  results: string[];
  createdAt: Date;
  updatedAt: Date;
  collaborators: string[];
  status: 'active' | 'completed' | 'archived';
}

export const ThreatHuntingWorkbench: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
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
  } = useServicePage('hunting');
  
  const [activeTab, setActiveTab] = useState(0);
  const [queries, setQueries] = useState<HuntingQuery[]>([]);
  const [results, setResults] = useState<HuntingResult[]>([]);
  const [sessions, setSessions] = useState<HuntingSession[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<HuntingQuery | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [queryLanguage, setQueryLanguage] = useState<'kql' | 'sql' | 'sigma' | 'yara'>('kql');
  const [isExecuting, setIsExecuting] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('threat-hunting-workbench', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 150000
    });

    return () => evaluationController.remove();
  }, []);

  // Load initial data
  useEffect(() => {
    loadQueries();
    loadSessions();
    loadRecentResults();
  }, []);

  const loadQueries = async () => {
    setLoading(true);
    try {
      const mockQueries: HuntingQuery[] = generateMockQueries();
      setQueries(mockQueries);
    } catch (error) {
      console.error('Failed to load queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    const mockSessions: HuntingSession[] = [
      {
        id: 'session-1',
        name: 'APT29 Investigation',
        description: 'Hunting for Cozy Bear indicators and TTPs',
        queries: ['query-1', 'query-2'],
        results: ['result-1', 'result-2'],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 3600000),
        collaborators: ['analyst1', 'analyst2'],
        status: 'active'
      },
      {
        id: 'session-2',
        name: 'Ransomware Hunt',
        description: 'Proactive hunting for ransomware indicators',
        queries: ['query-3', 'query-4'],
        results: ['result-3'],
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 7200000),
        collaborators: ['analyst1'],
        status: 'completed'
      }
    ];
    setSessions(mockSessions);
  };

  const loadRecentResults = async () => {
    // Mock recent results
    const mockResults: HuntingResult[] = [
      {
        id: 'result-1',
        queryId: 'query-1',
        executedAt: new Date(Date.now() - 3600000),
        resultCount: 156,
        executionTime: 2.3,
        status: 'success',
        data: generateMockResultData(156)
      },
      {
        id: 'result-2',
        queryId: 'query-2',
        executedAt: new Date(Date.now() - 7200000),
        resultCount: 23,
        executionTime: 1.8,
        status: 'success',
        data: generateMockResultData(23)
      }
    ];
    setResults(mockResults);
  };

  // Business logic operations
  const handleExecuteQuery = async (query: string, language: string) => {
    try {
      setIsExecuting(true);
      await businessLogic.execute('execute-hunt-query', { query, language }, 'medium');
      addNotification('info', 'Hunt query execution started');
      // Simulate result loading
      setTimeout(() => {
        setIsExecuting(false);
        addNotification('success', 'Hunt query completed successfully');
      }, 3000);
    } catch (error) {
      setIsExecuting(false);
      addNotification('error', 'Failed to execute hunt query');
    }
  };

  const handleSaveQuery = async (queryData: any) => {
    try {
      await businessLogic.execute('save-hunt-query', queryData);
      addNotification('success', 'Hunt query saved successfully');
      await loadQueries();
      setShowSaveDialog(false);
    } catch (error) {
      addNotification('error', 'Failed to save hunt query');
    }
  };

  const handleCreateSession = async (sessionData: any) => {
    try {
      await businessLogic.execute('create-hunt-session', sessionData);
      addNotification('success', 'Hunt session created successfully');
      await loadSessions();
      setShowSessionDialog(false);
    } catch (error) {
      addNotification('error', 'Failed to create hunt session');
    }
  };

  const handleExportResults = async (resultId: string, format: string) => {
    try {
      await businessLogic.execute('export-hunt-results', { resultId, format });
      addNotification('info', `Exporting results in ${format} format`);
    } catch (error) {
      addNotification('error', 'Failed to export hunt results');
    }
  };

  const handleRefreshHuntingData = async () => {
    try {
      await refresh();
      await Promise.all([loadQueries(), loadSessions(), loadRecentResults()]);
      addNotification('success', 'Hunting data refreshed');
    } catch (error) {
      addNotification('error', 'Failed to refresh hunting data');
    }
  };

  const generateMockQueries = (): HuntingQuery[] => {
    const categories = ['Network', 'Endpoint', 'Email', 'Web', 'DNS', 'Process'];
    const dataSources = ['Windows Logs', 'Sysmon', 'Network Flow', 'DNS Logs', 'Proxy Logs', 'Email Logs'];
    const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
    
    const sampleQueries = [
      {
        name: 'Suspicious PowerShell Execution',
        description: 'Detect encoded or obfuscated PowerShell commands',
        query: `Event
| where EventID == 4688
| where ProcessCommandLine contains "powershell" or ProcessCommandLine contains "pwsh"
| where ProcessCommandLine contains "-enc" or ProcessCommandLine contains "::FromBase64String"
| project TimeGenerated, Computer, Account, ProcessCommandLine`,
        category: 'Endpoint',
        severity: 'high' as const,
        tags: ['powershell', 'obfuscation', 'encoding']
      },
      {
        name: 'Lateral Movement via WMI',
        description: 'Detect lateral movement using WMI process creation',
        query: `Event
| where EventID == 4688
| where ProcessCommandLine contains "wmic" and ProcessCommandLine contains "process"
| where ProcessCommandLine contains "call" and ProcessCommandLine contains "create"
| project TimeGenerated, Computer, Account, ProcessCommandLine, ParentProcessName`,
        category: 'Endpoint',
        severity: 'medium' as const,
        tags: ['lateral-movement', 'wmi', 'process-creation']
      },
      {
        name: 'DNS Tunneling Detection',
        description: 'Identify potential DNS tunneling activity',
        query: `DnsEvents
| summarize count() by ClientIP, QueryName
| where count_ > 100
| where strlen(QueryName) > 50
| project ClientIP, QueryName, QueryCount=count_`,
        category: 'Network',
        severity: 'medium' as const,
        tags: ['dns', 'tunneling', 'exfiltration']
      },
      {
        name: 'Failed Logon Brute Force',
        description: 'Detect brute force login attempts',
        query: `SecurityEvent
| where EventID == 4625
| summarize FailedAttempts=count() by Account, WorkstationName, IpAddress, bin(TimeGenerated, 5m)
| where FailedAttempts >= 5
| order by TimeGenerated desc`,
        category: 'Endpoint',
        severity: 'high' as const,
        tags: ['brute-force', 'authentication', 'failed-logon']
      },
      {
        name: 'Suspicious File Downloads',
        description: 'Detect downloads of potentially malicious file types',
        query: `W3CIISLog
| where csUriStem endswith ".exe" or csUriStem endswith ".scr" or csUriStem endswith ".bat"
| where scStatus == 200
| project TimeGenerated, cIP, csUriStem, csUserAgent, scBytes`,
        category: 'Web',
        severity: 'medium' as const,
        tags: ['download', 'malware', 'web']
      }
    ];

    return sampleQueries.map((query, index) => ({
      id: `query-${index + 1}`,
      name: query.name,
      description: query.description,
      query: query.query,
      language: 'kql' as const,
      tags: query.tags,
      author: 'Threat Hunter',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      lastModified: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      executionCount: Math.floor(Math.random() * 50) + 1,
      avgExecutionTime: Math.random() * 10 + 0.5,
      category: query.category,
      severity: query.severity,
      dataSource: [dataSources[Math.floor(Math.random() * dataSources.length)]],
      isFavorite: Math.random() > 0.7
    }));
  };

  const generateMockResultData = (count: number) => {
    const results = [];
    for (let i = 0; i < Math.min(count, 10); i++) { // Show max 10 sample rows
      results.push({
        TimeGenerated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        Computer: `PC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        Account: `user${Math.floor(Math.random() * 100)}`,
        EventID: [4624, 4625, 4688, 4689][Math.floor(Math.random() * 4)],
        ProcessName: ['powershell.exe', 'cmd.exe', 'wmic.exe', 'rundll32.exe'][Math.floor(Math.random() * 4)]
      });
    }
    return results;
  };

  const executeQuery = async () => {
    if (!currentQuery.trim()) return;
    
    setIsExecuting(true);
    try {
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const resultCount = Math.floor(Math.random() * 500);
      const newResult: HuntingResult = {
        id: `result-${Date.now()}`,
        queryId: selectedQuery?.id || 'ad-hoc',
        executedAt: new Date(),
        resultCount,
        executionTime: Math.random() * 5 + 0.5,
        status: 'success',
        data: generateMockResultData(resultCount)
      };
      
      setResults([newResult, ...results]);
    } catch (error) {
      console.error('Query execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const filteredQueries = useMemo(() => {
    return queries.filter(query =>
      query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [queries, searchTerm]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const renderQueryCard = (query: HuntingQuery) => (
    <Card
      key={query.id}
      elevation={2}
      sx={{
        mb: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          elevation: 4,
          transform: 'translateY(-2px)'
        },
        borderLeft: `4px solid ${getSeverityColor(query.severity)}`
      }}
      onClick={() => {
        setSelectedQuery(query);
        setCurrentQuery(query.query);
        setQueryLanguage(query.language);
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            {query.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {query.isFavorite && (
              <Bookmark sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
            )}
            <Chip
              size="small"
              label={query.language.toUpperCase()}
              variant="outlined"
              color="primary"
            />
          </Box>
        </Box>
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {query.description}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
          {query.tags.slice(0, 3).map(tag => (
            <Chip key={tag} size="small" label={tag} variant="outlined" />
          ))}
          {query.tags.length > 3 && (
            <Chip size="small" label={`+${query.tags.length - 3}`} variant="outlined" />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              Category: {query.category}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Runs: {query.executionCount}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Avg: {query.avgExecutionTime.toFixed(1)}s
            </Typography>
          </Box>
          
          <Chip
            size="small"
            label={query.severity.toUpperCase()}
            sx={{
              bgcolor: alpha(getSeverityColor(query.severity), 0.1),
              color: getSeverityColor(query.severity)
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  const renderResultTable = (result: HuntingResult) => (
    <Box key={result.id} sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Query Results ({result.resultCount} records)
        </Typography>
        <Box>
          <Chip
            size="small"
            label={`${result.executionTime.toFixed(1)}s`}
            icon={<QueryStats />}
            variant="outlined"
          />
          <Chip
            size="small"
            label={result.status}
            color={result.status === 'success' ? 'success' : 'error'}
            sx={{ ml: 1 }}
          />
        </Box>
      </Box>
      
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              {result.data.length > 0 && Object.keys(result.data[0]).map(column => (
                <TableCell key={column} sx={{ fontWeight: 'bold' }}>
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {result.data.map((row, index) => (
              <TableRow key={index}>
                {Object.values(row).map((value, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {String(value)}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            🔍 Threat Hunting Workbench
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setShowSessionDialog(true)}
            >
              New Session
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={() => setShowSaveDialog(true)}
              disabled={!currentQuery}
            >
              Save Query
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={<Badge badgeContent={filteredQueries.length} color="primary" max={999}>Query Library</Badge>} />
          <Tab label={<Badge badgeContent={sessions.filter(s => s.status === 'active').length} color="warning" max={999}>Active Sessions</Badge>} />
          <Tab label={<Badge badgeContent={results.length} color="info" max={999}>Recent Results</Badge>} />
          <Tab label="Hunt Analytics" />
        </Tabs>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3} sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Left Panel - Library/Sessions */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {activeTab === 0 && (
              <>
                {/* Query Search */}
                <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search queries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Box>
                
                {/* Query List */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Hunting Queries ({filteredQueries.length})
                  </Typography>
                  {filteredQueries.map(renderQueryCard)}
                </Box>
              </>
            )}

            {activeTab === 1 && (
              <Box sx={{ p: 2, overflow: 'auto' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Hunting Sessions ({sessions.length})
                </Typography>
                {sessions.map((session) => (
                  <Card key={session.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {session.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={session.status}
                          color={session.status === 'active' ? 'success' : 'default'}
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {session.description}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {session.queries.length} queries • {session.collaborators.length} collaborators
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small">Open</Button>
                      <Button size="small">Share</Button>
                    </CardActions>
                  </Card>
                ))}
              </Box>
            )}

            {activeTab === 2 && (
              <Box sx={{ p: 2, overflow: 'auto' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Recent Results ({results.length})
                </Typography>
                {results.map((result) => (
                  <Card key={result.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="subtitle2">
                          Query Result
                        </Typography>
                        <Chip
                          size="small"
                          label={result.status}
                          color={result.status === 'success' ? 'success' : 'error'}
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {result.resultCount} records in {result.executionTime.toFixed(1)}s
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {result.executedAt.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Panel - Query Editor and Results */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Query Editor */}
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Query Editor
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Select
                      value={queryLanguage}
                      onChange={(e) => setQueryLanguage(e.target.value as any)}
                    >
                      <MenuItem value="kql">KQL</MenuItem>
                      <MenuItem value="sql">SQL</MenuItem>
                      <MenuItem value="sigma">Sigma</MenuItem>
                      <MenuItem value="yara">YARA</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    startIcon={isExecuting ? <LinearProgress sx={{ width: 20 }} /> : <PlayArrow />}
                    onClick={executeQuery}
                    disabled={isExecuting || !currentQuery.trim()}
                  >
                    {isExecuting ? 'Running...' : 'Execute'}
                  </Button>
                </Box>
              </Box>

              {selectedQuery && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>{selectedQuery.name}</strong> - {selectedQuery.description}
                  </Typography>
                </Alert>
              )}

              <TextField
                fullWidth
                multiline
                rows={8}
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
                placeholder="Enter your hunting query here..."
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'Monaco, monospace',
                    fontSize: '0.875rem'
                  }
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" startIcon={<Code />}>
                    Format
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<History />}>
                    History
                  </Button>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Lines: {currentQuery.split('\n').length} • Characters: {currentQuery.length}
                </Typography>
              </Box>
            </Paper>

            {/* Results */}
            <Paper elevation={2} sx={{ flex: 1, overflow: 'auto' }}>
              <Box sx={{ p: 2 }}>
                {results.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <QueryStats sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      No Results Yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Execute a query to see results here.
                    </Typography>
                  </Box>
                ) : (
                  results.slice(0, 3).map(renderResultTable)
                )}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Save Query Dialog */}
      <Dialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Hunting Query</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Query Name"
                placeholder="Enter a descriptive name for this query..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                placeholder="Describe what this query detects..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select defaultValue="">
                  <MenuItem value="Network">Network</MenuItem>
                  <MenuItem value="Endpoint">Endpoint</MenuItem>
                  <MenuItem value="Email">Email</MenuItem>
                  <MenuItem value="Web">Web</MenuItem>
                  <MenuItem value="DNS">DNS</MenuItem>
                  <MenuItem value="Process">Process</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select defaultValue="medium">
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags"
                placeholder="malware, lateral-movement, persistence (comma-separated)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Save Query
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Session Dialog */}
      <Dialog
        open={showSessionDialog}
        onClose={() => setShowSessionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Hunting Session</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Session Name"
                placeholder="Enter a name for this hunting session..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                placeholder="Describe the hunting objectives..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Collaborators"
                placeholder="Enter email addresses (comma-separated)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSessionDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Create Session
          </Button>
        </DialogActions>
      </Dialog>

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

      <Routes>
        <Route path="/workspace" element={<div>Hunting Workspace Component</div>} />
        <Route path="/queries" element={<div>Saved Queries Component</div>} />
        <Route path="/campaigns" element={<div>Hunt Campaigns Component</div>} />
      </Routes>
    </Box>
  );
};
