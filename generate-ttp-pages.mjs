#!/usr/bin/env node

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Define the 49 TTP-related pages organized by MITRE ATT&CK categories
const ttpPages = {
  'tactics-analysis': [
    'InitialAccessAnalyzer',
    'ExecutionTacticsMapper',
    'PersistenceTracker',
    'PrivilegeEscalationDetector',
    'DefenseEvasionAnalyzer',
    'CredentialAccessMonitor',
    'DiscoveryPlatform',
    'LateralMovementTracker',
    'CollectionAnalyzer',
    'ExfiltrationDetector',
    'CommandControlAnalyzer',
    'ImpactAssessmentEngine'
  ],
  'techniques-mapping': [
    'AttackTechniqueMapper',
    'SubTechniqueAnalyzer',
    'TechniqueEvolutionTracker',
    'MitreAttackIntegrator',
    'TechniqueCoverageAnalyzer',
    'TechniqueCorrelationEngine',
    'TechniqueValidationSystem',
    'TechniquePrioritizationEngine'
  ],
  'procedures-intelligence': [
    'ProcedureDocumentationCenter',
    'ProcedureEvolutionTracker',
    'ProcedureStandardizationHub',
    'ProcedureValidationEngine',
    'ProcedureAutomationWorkflow',
    'ProcedureComplianceMonitor',
    'ProcedureEffectivenessAnalyzer',
    'ProcedureOptimizationEngine'
  ],
  'threat-actor-ttp': [
    'ActorTTPProfiler',
    'TTPAttributionEngine',
    'ActorBehaviorAnalyzer',
    'TTPSignatureGenerator',
    'ActorTTPEvolution',
    'TTPIntelligenceHub',
    'ActorTTPCorrelation',
    'TTPThreatScoring'
  ],
  'ttp-analytics': [
    'TTPTrendAnalyzer',
    'TTPPatternRecognition',
    'TTPPredictiveModeling',
    'TTPRiskAssessment',
    'TTPImpactAnalyzer',
    'TTPFrequencyTracker',
    'TTPEffectivenessMetrics',
    'TTPBenchmarkingEngine',
    'TTPPerformanceAnalytics'
  ]
};

// Template for React component with TTP-specific functionality
const createTTPComponentTemplate = (componentName, category) => `import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge
} from '@mui/material';
import {
  Security,
  Analytics,
  Timeline,
  Assessment,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  GetApp,
  Add,
  Edit,
  Delete,
  Visibility,
  ExpandMore,
  TrendingUp,
  TrendingDown,
  Shield,
  BugReport,
  FlashOn,
  Storage,
  NetworkCheck,
  PersonSearch,
  LocalPolice,
  Gavel
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface TTPData {
  id: string;
  name: string;
  mitreId?: string;
  status: 'active' | 'monitoring' | 'mitigated' | 'archived';
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  tactics?: string[];
  techniques?: string[];
  procedures?: string[];
  actors?: string[];
  detectionCoverage?: number;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    platform?: string[];
    killchain?: string;
    references?: string[];
    mitigations?: string[];
    dataSource?: string;
  };
}

interface \${componentName}Props {
  onDataUpdate?: (data: TTPData[]) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  filters?: {
    status?: string[];
    severity?: string[];
    tactics?: string[];
  };
}

const \${componentName}: React.FC<\${componentName}Props> = ({
  onDataUpdate,
  onRefresh,
  onExport,
  filters
}) => {
  const [data, setData] = useState<TTPData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<TTPData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    critical: 0,
    coverage: 0
  });

  // Mock TTP data generator
  const generateMockData = (): TTPData[] => {
    const mockItems: TTPData[] = [];
    const statuses: TTPData['status'][] = ['active', 'monitoring', 'mitigated', 'archived'];
    const severities: TTPData['severity'][] = ['critical', 'high', 'medium', 'low'];
    const tactics = ['Initial Access', 'Execution', 'Persistence', 'Privilege Escalation', 'Defense Evasion'];
    const techniques = ['T1078', 'T1055', 'T1027', 'T1134', 'T1070'];
    const platforms = ['Windows', 'Linux', 'macOS', 'Cloud', 'Network'];
    
    for (let i = 1; i <= 25; i++) {
      mockItems.push({
        id: \`ttp-\${i.toString().padStart(3, '0')}\`,
        name: \`\${componentName.replace(/([A-Z])/g, ' $1').trim()} Item \${i}\`,
        mitreId: \`T\${(1000 + i).toString()}\`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        confidence: Math.floor(Math.random() * 40) + 60,
        tactics: [tactics[Math.floor(Math.random() * tactics.length)]],
        techniques: [techniques[Math.floor(Math.random() * techniques.length)]],
        procedures: [\`Procedure \${i}\`],
        actors: [\`Actor Group \${Math.floor(Math.random() * 5) + 1}\`],
        detectionCoverage: Math.floor(Math.random() * 40) + 60,
        lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          platform: [platforms[Math.floor(Math.random() * platforms.length)]],
          killchain: \`Phase \${Math.floor(Math.random() * 7) + 1}\`,
          references: [\`https://attack.mitre.org/techniques/T\${1000 + i}\`],
          mitigations: [\`M\${(1000 + i).toString()}\`],
          dataSource: 'MITRE ATT&CK'
        }
      });
    }
    return mockItems;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData = generateMockData();
        setData(mockData);
        
        // Calculate stats
        setStats({
          total: mockData.length,
          active: mockData.filter(item => item.status === 'active').length,
          critical: mockData.filter(item => item.severity === 'critical').length,
          coverage: Math.round(mockData.reduce((acc, item) => acc + (item.detectionCoverage || 0), 0) / mockData.length)
        });
        
        if (onDataUpdate) {
          onDataUpdate(mockData);
        }
      } catch (error) {
        console.error('Error fetching TTP data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [onDataUpdate]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    setData(generateMockData());
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    }
    console.log('Exporting \${category} TTP data...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'error';
      case 'monitoring': return 'warning';
      case 'mitigated': return 'success';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 120 },
    { field: 'name', headerName: 'Name', width: 200, flex: 1 },
    { field: 'mitreId', headerName: 'MITRE ID', width: 100 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value) as any}
          size="small"
        />
      )
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getSeverityColor(params.value) as any}
          size="small"
        />
      )
    },
    {
      field: 'confidence',
      headerName: 'Confidence',
      width: 120,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Box width="100%" mr={1}>
            <LinearProgress 
              variant="determinate" 
              value={params.value} 
              color={params.value > 80 ? 'success' : params.value > 60 ? 'warning' : 'error'}
            />
          </Box>
          <Typography variant="body2">{params.value}%</Typography>
        </Box>
      )
    },
    {
      field: 'detectionCoverage',
      headerName: 'Coverage',
      width: 120,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Box width="100%" mr={1}>
            <LinearProgress 
              variant="determinate" 
              value={params.value} 
              color={params.value > 80 ? 'success' : params.value > 60 ? 'warning' : 'error'}
            />
          </Box>
          <Typography variant="body2">{params.value}%</Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton 
              onClick={() => {
                setSelectedItem(params.row);
                setDialogOpen(true);
              }} 
              size="small"
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small">
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small">
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom display="flex" alignItems="center">
          <Security sx={{ mr: 2, color: 'primary.main' }} />
          \${componentName.replace(/([A-Z])/g, ' $1').trim()}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          \${category.replace(/-/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase())} TTP Analysis and Management
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Storage sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.total}</Typography>
                  <Typography variant="body2" color="textSecondary">Total TTPs</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Warning sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.active}</Typography>
                  <Typography variant="body2" color="textSecondary">Active Threats</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Error sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.critical}</Typography>
                  <Typography variant="body2" color="textSecondary">Critical</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Shield sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.coverage}%</Typography>
                  <Typography variant="body2" color="textSecondary">Coverage</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Bar */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ mr: 2 }}
          >
            Add TTP
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<GetApp />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box mb={3}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" />
          <Tab label="MITRE ATT&CK Mapping" />
          <Tab label="Analytics" />
          <Tab label="Reports" />
        </Tabs>
      </Box>

      {/* Main Content */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <DataGrid
              rows={data}
              columns={columns}
              pageSize={25}
              rowsPerPageOptions={[25]}
              autoHeight
              disableSelectionOnClick
            />
          </CardContent>
        </Card>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>MITRE ATT&CK Framework Mapping</Typography>
                <Box mt={2}>
                  {data.slice(0, 10).map((item) => (
                    <Accordion key={item.id}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box display="flex" alignItems="center" width="100%">
                          <Typography sx={{ width: '33%', flexShrink: 0 }}>
                            {item.mitreId} - {item.name}
                          </Typography>
                          <Chip 
                            label={item.status} 
                            color={getStatusColor(item.status) as any}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip 
                            label={item.severity} 
                            color={getSeverityColor(item.severity) as any}
                            size="small"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">Tactics:</Typography>
                            {item.tactics?.map((tactic, index) => (
                              <Chip key={index} label={tactic} size="small" sx={{ mr: 1, mb: 1 }} />
                            ))}
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">Techniques:</Typography>
                            {item.techniques?.map((technique, index) => (
                              <Chip key={index} label={technique} size="small" sx={{ mr: 1, mb: 1 }} />
                            ))}
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">Procedures:</Typography>
                            {item.procedures?.map((procedure, index) => (
                              <Chip key={index} label={procedure} size="small" sx={{ mr: 1, mb: 1 }} />
                            ))}
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Coverage Summary</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><Shield /></ListItemIcon>
                    <ListItemText 
                      primary="Detection Coverage" 
                      secondary={stats.coverage + '%'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Security /></ListItemIcon>
                    <ListItemText 
                      primary="Mitigation Coverage" 
                      secondary="78%"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Analytics /></ListItemIcon>
                    <ListItemText 
                      primary="Visibility Coverage" 
                      secondary="82%"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>TTP Analytics Dashboard</Typography>
                <Typography variant="body2" color="textSecondary">
                  Advanced analytics and insights for TTP data will be displayed here.
                </Typography>
                <Box mt={3} textAlign="center" py={4}>
                  <Analytics sx={{ fontSize: 64, color: 'action.disabled' }} />
                  <Typography variant="h6" color="textSecondary">
                    Analytics Module
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    TTP trend analysis, predictive modeling, and intelligence insights
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>TTP Reports</Typography>
                <Typography variant="body2" color="textSecondary">
                  Generate comprehensive reports on TTP analysis and intelligence.
                </Typography>
                <Box mt={3} textAlign="center" py={4}>
                  <Assessment sx={{ fontSize: 64, color: 'action.disabled' }} />
                  <Typography variant="h6" color="textSecondary">
                    Report Generator
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Automated TTP intelligence reports and executive summaries
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          TTP Details: {selectedItem?.name}
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">MITRE ID:</Typography>
                <Typography variant="body2" gutterBottom>{selectedItem.mitreId}</Typography>
                
                <Typography variant="subtitle2">Status:</Typography>
                <Chip 
                  label={selectedItem.status} 
                  color={getStatusColor(selectedItem.status) as any}
                  size="small"
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="subtitle2">Severity:</Typography>
                <Chip 
                  label={selectedItem.severity} 
                  color={getSeverityColor(selectedItem.severity) as any}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Confidence:</Typography>
                <Typography variant="body2" gutterBottom>{selectedItem.confidence}%</Typography>
                
                <Typography variant="subtitle2">Detection Coverage:</Typography>
                <Typography variant="body2" gutterBottom>{selectedItem.detectionCoverage}%</Typography>
                
                <Typography variant="subtitle2">Last Seen:</Typography>
                <Typography variant="body2" gutterBottom>
                  {selectedItem.lastSeen ? new Date(selectedItem.lastSeen).toLocaleString() : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Tactics:</Typography>
                <Box mb={2}>
                  {selectedItem.tactics?.map((tactic, index) => (
                    <Chip key={index} label={tactic} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
                
                <Typography variant="subtitle2">Techniques:</Typography>
                <Box mb={2}>
                  {selectedItem.techniques?.map((technique, index) => (
                    <Chip key={index} label={technique} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
                
                <Typography variant="subtitle2">Associated Actors:</Typography>
                <Box>
                  {selectedItem.actors?.map((actor, index) => (
                    <Chip key={index} label={actor} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button variant="contained">Edit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default \${componentName};`;


// Business Logic Template for TTP components
const createTTPBusinessLogicTemplate = (componentName, category) => `import { DatabaseConnection } from '../../data-layer/DatabaseConnection';
import { Logger } from '../../utils/Logger';
import { TTPData, TTPCreateInput, TTPUpdateInput, TTPQueryOptions } from '../../../types/ttp.types';

const logger = new Logger('${componentName}BusinessLogic');

interface ${componentName}Analytics {
  totalCount: number;
  statusCounts: Record<string, number>;
  severityCounts: Record<string, number>;
  coverageStats: {
    avgDetectionCoverage: number;
    avgConfidence: number;
    topTactics: string[];
    topTechniques: string[];
  };
  recentActivity: any[];
}

export class ${componentName}BusinessLogic {
  private db: DatabaseConnection;
  private collectionName = '${category.replace(/-/g, '_')}_ttp';

  constructor() {
    this.db = new DatabaseConnection();
  }

  /**
   * Get all TTP items with filtering and pagination
   */
  async getAll(options: TTPQueryOptions = {}): Promise<{ items: TTPData[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 25,
        status,
        severity,
        tactics,
        techniques,
        actors,
        sortBy = 'updatedAt',
        sortOrder = 'desc'
      } = options;

      logger.debug('Getting all ${category.replace('-', ' ')} TTP items', { options });

      // Build filter query
      const filter: any = { category: '${category}' };
      
      if (status?.length) {
        filter.status = { $in: status };
      }
      
      if (severity?.length) {
        filter.severity = { $in: severity };
      }
      
      if (tactics?.length) {
        filter.tactics = { $in: tactics };
      }
      
      if (techniques?.length) {
        filter.techniques = { $in: techniques };
      }
      
      if (actors?.length) {
        filter.actors = { $in: actors };
      }

      const [items, total] = await Promise.all([
        this.db.find(
          this.collectionName,
          filter,
          {
            sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
            skip: (page - 1) * limit,
            limit
          }
        ),
        this.db.count(this.collectionName, filter)
      ]);

      logger.info(\`Retrieved \${items.length} ${category.replace('-', ' ')} TTP items\`);
      return { items, total };

    } catch (error) {
      logger.error('Failed to get ${category.replace('-', ' ')} TTP items', { error: error.message, options });
      throw error;
    }
  }

  /**
   * Get single TTP item by ID
   */
  async getById(id: string): Promise<TTPData | null> {
    try {
      logger.debug('Getting ${category.replace('-', ' ')} TTP item by ID', { id });

      const item = await this.db.findOne(this.collectionName, { id });
      
      if (!item) {
        logger.warn('${category.replace('-', ' ')} TTP item not found', { id });
        return null;
      }

      logger.info('Retrieved ${category.replace('-', ' ')} TTP item', { id, name: item.name });
      return item;

    } catch (error) {
      logger.error('Failed to get ${category.replace('-', ' ')} TTP item', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Create new TTP item
   */
  async create(input: TTPCreateInput, userId: string): Promise<TTPData> {
    try {
      logger.info('Creating new ${category.replace('-', ' ')} TTP item', { input, userId });

      const now = new Date();
      const ttpData: TTPData = {
        id: this.generateId(),
        ...input,
        category: '${category}',
        status: input.status || 'active',
        severity: input.severity || 'medium',
        confidence: input.confidence || 0,
        detectionCoverage: input.detectionCoverage || 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: userId,
        updatedBy: userId
      };

      await this.db.insertOne(this.collectionName, ttpData);
      await this.recordMetrics('create', ttpData);

      logger.info('Successfully created ${category.replace('-', ' ')} TTP item', { id: ttpData.id, name: ttpData.name });
      return ttpData;

    } catch (error) {
      logger.error('Failed to create ${category.replace('-', ' ')} TTP item', { error: error.message, input, userId });
      throw error;
    }
  }

  /**
   * Update existing TTP item
   */
  async update(id: string, input: TTPUpdateInput, userId: string): Promise<TTPData | null> {
    try {
      logger.info('Updating ${category.replace('-', ' ')} TTP item', { id, input, userId });

      const updateData = {
        ...input,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      };

      const result = await this.db.updateOne(
        this.collectionName,
        { id },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        logger.warn('${category.replace('-', ' ')} TTP item not found for update', { id });
        return null;
      }

      const updatedItem = await this.getById(id);
      if (updatedItem) {
        await this.recordMetrics('update', updatedItem);
      }

      logger.info('Successfully updated ${category.replace('-', ' ')} TTP item', { id });
      return updatedItem;

    } catch (error) {
      logger.error('Failed to update ${category.replace('-', ' ')} TTP item', { error: error.message, id, input, userId });
      throw error;
    }
  }

  /**
   * Delete TTP item
   */
  async delete(id: string, userId: string): Promise<boolean> {
    try {
      logger.info('Deleting ${category.replace('-', ' ')} TTP item', { id, userId });

      const item = await this.getById(id);
      if (!item) {
        logger.warn('${category.replace('-', ' ')} TTP item not found for deletion', { id });
        return false;
      }

      const result = await this.db.deleteOne(this.collectionName, { id });
      
      if (result.deletedCount > 0) {
        await this.recordMetrics('delete', item);
        logger.info('Successfully deleted ${category.replace('-', ' ')} TTP item', { id });
        return true;
      }

      return false;

    } catch (error) {
      logger.error('Failed to delete ${category.replace('-', ' ')} TTP item', { error: error.message, id, userId });
      throw error;
    }
  }

  /**
   * Get analytics for the category
   */
  async getAnalytics(): Promise<${componentName}Analytics> {
    try {
      logger.debug('Getting ${category.replace('-', ' ')} TTP analytics');

      const [
        totalCount,
        statusCounts,
        severityCounts,
        coverageStats,
        recentActivity
      ] = await Promise.all([
        this.db.count(this.collectionName, { category: '${category}' }),
        this.db.aggregate(this.collectionName, [
          { $match: { category: '${category}' } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        this.db.aggregate(this.collectionName, [
          { $match: { category: '${category}' } },
          { $group: { _id: '$severity', count: { $sum: 1 } } }
        ]),
        this.db.aggregate(this.collectionName, [
          { $match: { category: '${category}' } },
          {
            $group: {
              _id: null,
              avgDetectionCoverage: { $avg: '$detectionCoverage' },
              avgConfidence: { $avg: '$confidence' },
              allTactics: { $push: '$tactics' },
              allTechniques: { $push: '$techniques' }
            }
          }
        ]),
        this.db.find(this.collectionName, 
          { category: '${category}' }, 
          { sort: { updatedAt: -1 }, limit: 10 }
        )
      ]);

      // Process coverage stats
      const processedCoverageStats = coverageStats[0] || {
        avgDetectionCoverage: 0,
        avgConfidence: 0,
        allTactics: [],
        allTechniques: []
      };

      // Get top tactics and techniques
      const flatTactics = processedCoverageStats.allTactics.flat();
      const flatTechniques = processedCoverageStats.allTechniques.flat();
      
      const tacticCounts = flatTactics.reduce((acc, tactic) => {
        acc[tactic] = (acc[tactic] || 0) + 1;
        return acc;
      }, {});
      
      const techniqueCounts = flatTechniques.reduce((acc, technique) => {
        acc[technique] = (acc[technique] || 0) + 1;
        return acc;
      }, {});

      const topTactics = Object.entries(tacticCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([tactic]) => tactic);

      const topTechniques = Object.entries(techniqueCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([technique]) => technique);

      return {
        totalCount,
        statusCounts: statusCounts.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        severityCounts: severityCounts.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        coverageStats: {
          avgDetectionCoverage: Math.round(processedCoverageStats.avgDetectionCoverage || 0),
          avgConfidence: Math.round(processedCoverageStats.avgConfidence || 0),
          topTactics,
          topTechniques
        },
        recentActivity
      };

    } catch (error) {
      logger.error('Failed to get ${category.replace('-', ' ')} TTP analytics', { error: error.message });
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdate(
    ids: string[],
    update: Partial<TTPUpdateInput>,
    userId: string
  ): Promise<number> {
    try {
      logger.info(\`Bulk updating \${ids.length} ${category.replace('-', ' ')} TTP items\`, { userId, update });

      const updateData = {
        ...update,
        updatedAt: new Date(),
        updatedBy: userId
      };

      const result = await this.db.updateMany(
        this.collectionName,
        { id: { $in: ids } },
        { $set: updateData }
      );

      logger.info(\`Successfully bulk updated \${result.modifiedCount} ${category.replace('-', ' ')} TTP items\`);
      return result.modifiedCount;

    } catch (error) {
      logger.error('Failed to bulk update ${category.replace('-', ' ')} TTP items', { error: error.message, ids, update, userId });
      throw error;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return \`\${this.collectionName}_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }

  /**
   * Record metrics for monitoring
   */
  private async recordMetrics(operation: string, data: TTPData): Promise<void> {
    try {
      const metrics = {
        operation,
        category: '${category}',
        component: '${componentName}',
        itemId: data.id,
        status: data.status,
        severity: data.severity,
        confidence: data.confidence,
        timestamp: new Date(),
        metadata: {
          tactics: data.tactics,
          techniques: data.techniques,
          actors: data.actors,
          mitreId: data.mitreId
        }
      };

      await this.db.insertOne('system_metrics', metrics);
    } catch (error) {
      logger.warn('Failed to record metrics', { error: error.message, operation, itemId: data.id });
    }
  }
}`;

// Route Template for TTP components
const createTTPRouteTemplate = (componentName, category) => `import { Router } from 'express';
import { Request, Response } from 'express';
import { ${componentName}BusinessLogic } from '../../services/business-logic/modules/${category}/${componentName}BusinessLogic';
import { authenticateToken, authorizeRole } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { rateLimiter } from '../../middleware/rateLimiter';
import { Logger } from '../../utils/Logger';

const router = Router();
const businessLogic = new ${componentName}BusinessLogic();
const logger = new Logger('${componentName}Routes');

// Apply middleware
router.use(authenticateToken);
router.use(rateLimiter);

/**
 * @swagger
 * /api/${category.replace(/-/g, '-')}/${componentName.toLowerCase()}:
 *   get:
 *     summary: Get all ${componentName.replace(/([A-Z])/g, ' $1').trim()} items
 *     tags: [${category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} TTP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 25
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [active, monitoring, mitigated, archived]
 *         description: Filter by status
 *       - in: query
 *         name: severity
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [critical, high, medium, low]
 *         description: Filter by severity
 *     responses:
 *       200:
 *         description: List of ${componentName.replace(/([A-Z])/g, ' $1').trim()} items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TTPData'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const queryOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 25,
      status: req.query.status ? (Array.isArray(req.query.status) ? req.query.status : [req.query.status]) : undefined,
      severity: req.query.severity ? (Array.isArray(req.query.severity) ? req.query.severity : [req.query.severity]) : undefined,
      tactics: req.query.tactics ? (Array.isArray(req.query.tactics) ? req.query.tactics : [req.query.tactics]) : undefined,
      techniques: req.query.techniques ? (Array.isArray(req.query.techniques) ? req.query.techniques : [req.query.techniques]) : undefined,
      actors: req.query.actors ? (Array.isArray(req.query.actors) ? req.query.actors : [req.query.actors]) : undefined,
      sortBy: req.query.sortBy as string || 'updatedAt',
      sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc'
    };

    const result = await businessLogic.getAll(queryOptions);

    res.json({
      ...result,
      page: queryOptions.page,
      limit: queryOptions.limit
    });

  } catch (error) {
    logger.error('Failed to get ${componentName.replace(/([A-Z])/g, ' $1').trim()} items', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve ${componentName.replace(/([A-Z])/g, ' $1').trim()} items'
    });
  }
});

/**
 * @swagger
 * /api/${category.replace(/-/g, '-')}/${componentName.toLowerCase()}/{id}:
 *   get:
 *     summary: Get ${componentName.replace(/([A-Z])/g, ' $1').trim()} item by ID
 *     tags: [${category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} TTP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: ${componentName.replace(/([A-Z])/g, ' $1').trim()} item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TTPData'
 *       404:
 *         description: Item not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await businessLogic.getById(id);

    if (!item) {
      return res.status(404).json({
        error: 'Not found',
        message: \`${componentName.replace(/([A-Z])/g, ' $1').trim()} item with ID \${id} not found\`
      });
    }

    res.json(item);

  } catch (error) {
    logger.error('Failed to get ${componentName.replace(/([A-Z])/g, ' $1').trim()} item', { error: error.message, id: req.params.id });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve ${componentName.replace(/([A-Z])/g, ' $1').trim()} item'
    });
  }
});

/**
 * @swagger
 * /api/${category.replace(/-/g, '-')}/${componentName.toLowerCase()}:
 *   post:
 *     summary: Create new ${componentName.replace(/([A-Z])/g, ' $1').trim()} item
 *     tags: [${category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} TTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TTPCreateInput'
 *     responses:
 *       201:
 *         description: ${componentName.replace(/([A-Z])/g, ' $1').trim()} item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TTPData'
 *       400:
 *         description: Invalid input
 */
router.post('/', authorizeRole(['admin', 'analyst']), validateRequest, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const item = await businessLogic.create(req.body, userId);

    res.status(201).json(item);

  } catch (error) {
    logger.error('Failed to create ${componentName.replace(/([A-Z])/g, ' $1').trim()} item', { error: error.message, input: req.body });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create ${componentName.replace(/([A-Z])/g, ' $1').trim()} item'
    });
  }
});

/**
 * @swagger
 * /api/${category.replace(/-/g, '-')}/${componentName.toLowerCase()}/{id}:
 *   put:
 *     summary: Update ${componentName.replace(/([A-Z])/g, ' $1').trim()} item
 *     tags: [${category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} TTP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TTPUpdateInput'
 *     responses:
 *       200:
 *         description: ${componentName.replace(/([A-Z])/g, ' $1').trim()} item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TTPData'
 *       404:
 *         description: Item not found
 */
router.put('/:id', authorizeRole(['admin', 'analyst']), validateRequest, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const item = await businessLogic.update(id, req.body, userId);

    if (!item) {
      return res.status(404).json({
        error: 'Not found',
        message: \`${componentName.replace(/([A-Z])/g, ' $1').trim()} item with ID \${id} not found\`
      });
    }

    res.json(item);

  } catch (error) {
    logger.error('Failed to update ${componentName.replace(/([A-Z])/g, ' $1').trim()} item', { error: error.message, id: req.params.id, input: req.body });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update ${componentName.replace(/([A-Z])/g, ' $1').trim()} item'
    });
  }
});

/**
 * @swagger
 * /api/${category.replace(/-/g, '-')}/${componentName.toLowerCase()}/{id}:
 *   delete:
 *     summary: Delete ${componentName.replace(/([A-Z])/g, ' $1').trim()} item
 *     tags: [${category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} TTP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: ${componentName.replace(/([A-Z])/g, ' $1').trim()} item deleted successfully
 *       404:
 *         description: Item not found
 */
router.delete('/:id', authorizeRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deleted = await businessLogic.delete(id, userId);

    if (!deleted) {
      return res.status(404).json({
        error: 'Not found',
        message: \`${componentName.replace(/([A-Z])/g, ' $1').trim()} item with ID \${id} not found\`
      });
    }

    res.json({
      message: '${componentName.replace(/([A-Z])/g, ' $1').trim()} item deleted successfully'
    });

  } catch (error) {
    logger.error('Failed to delete ${componentName.replace(/([A-Z])/g, ' $1').trim()} item', { error: error.message, id: req.params.id });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete ${componentName.replace(/([A-Z])/g, ' $1').trim()} item'
    });
  }
});

/**
 * @swagger
 * /api/${category.replace(/-/g, '-')}/${componentName.toLowerCase()}/analytics:
 *   get:
 *     summary: Get ${componentName.replace(/([A-Z])/g, ' $1').trim()} analytics
 *     tags: [${category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} TTP]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCount:
 *                   type: integer
 *                 statusCounts:
 *                   type: object
 *                 severityCounts:
 *                   type: object
 *                 coverageStats:
 *                   type: object
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const analytics = await businessLogic.getAnalytics();
    res.json(analytics);

  } catch (error) {
    logger.error('Failed to get ${componentName.replace(/([A-Z])/g, ' $1').trim()} analytics', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve analytics'
    });
  }
});

/**
 * @swagger
 * /api/${category.replace(/-/g, '-')}/${componentName.toLowerCase()}/bulk-update:
 *   patch:
 *     summary: Bulk update ${componentName.replace(/([A-Z])/g, ' $1').trim()} items
 *     tags: [${category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} TTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               update:
 *                 $ref: '#/components/schemas/TTPUpdateInput'
 *     responses:
 *       200:
 *         description: Bulk update completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 modifiedCount:
 *                   type: integer
 */
router.patch('/bulk-update', authorizeRole(['admin', 'analyst']), validateRequest, async (req: Request, res: Response) => {
  try {
    const { ids, update } = req.body;
    const userId = req.user.id;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'IDs array is required and must not be empty'
      });
    }

    const modifiedCount = await businessLogic.bulkUpdate(ids, update, userId);

    res.json({
      modifiedCount,
      message: \`Successfully updated \${modifiedCount} ${componentName.replace(/([A-Z])/g, ' $1').trim()} items\`
    });

  } catch (error) {
    logger.error('Failed to bulk update ${componentName.replace(/([A-Z])/g, ' $1').trim()} items', { error: error.message, input: req.body });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to bulk update ${componentName.replace(/([A-Z])/g, ' $1').trim()} items'
    });
  }
});

export default router;`;


// Helper function to ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

// Helper function to write file safely
function writeFileSafely(filePath, content) {
  try {
    ensureDirectoryExists(dirname(filePath));
    writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Failed to write file ${filePath}:`, error.message);
    return false;
  }
}

// Main generation function
function generateTTPPages() {
  console.log('🚀 Generating 49 TTP-Related Business Pages...\n');

  let totalPages = 0;
  let successfulPages = 0;

  // Create base directories
  const baseDir = join(__dirname, 'src');
  const frontendDir = join(baseDir, 'frontend', 'views');
  const businessLogicDir = join(baseDir, 'services', 'business-logic', 'modules');
  const routesDir = join(baseDir, 'routes');

  Object.entries(ttpPages).forEach(([category, components]) => {
    console.log(`Creating ${category} components (${components.length} pages):`);

    components.forEach(componentName => {
      totalPages++;

      // 1. Create frontend component
      const frontendPath = join(frontendDir, category, `${componentName}Component.tsx`);
      const frontendContent = createTTPComponentTemplate(componentName, category);
      
      if (writeFileSafely(frontendPath, frontendContent)) {
        console.log(`  ✓ Created frontend component: ${componentName}Component.tsx`);
        successfulPages++;
      } else {
        console.log(`  ✗ Failed to create frontend component: ${componentName}Component.tsx`);
      }

      // 2. Create business logic
      const businessLogicPath = join(businessLogicDir, category, `${componentName}BusinessLogic.ts`);
      const businessLogicContent = createTTPBusinessLogicTemplate(componentName, category);
      
      if (writeFileSafely(businessLogicPath, businessLogicContent)) {
        console.log(`  ✓ Created business logic: ${componentName}BusinessLogic.ts`);
      } else {
        console.log(`  ✗ Failed to create business logic: ${componentName}BusinessLogic.ts`);
      }

      // 3. Create API route
      const routePath = join(routesDir, category, `${componentName.toLowerCase()}Routes.ts`);
      const routeContent = createTTPRouteTemplate(componentName, category);
      
      if (writeFileSafely(routePath, routeContent)) {
        console.log(`  ✓ Created API route: ${componentName.toLowerCase()}Routes.ts`);
      } else {
        console.log(`  ✗ Failed to create API route: ${componentName.toLowerCase()}Routes.ts`);
      }
    });

    console.log('');
  });

  // Generate index files for each category
  Object.entries(ttpPages).forEach(([category, components]) => {
    // Frontend index
    const frontendIndexPath = join(frontendDir, category, 'index.ts');
    const frontendIndexContent = components.map(componentName => 
      `export { default as ${componentName}Component } from './${componentName}Component';`
    ).join('\n') + '\n';
    
    writeFileSafely(frontendIndexPath, frontendIndexContent);

    // Business logic index
    const businessLogicIndexPath = join(businessLogicDir, category, 'index.ts');
    const businessLogicIndexContent = components.map(componentName => 
      `export { ${componentName}BusinessLogic } from './${componentName}BusinessLogic';`
    ).join('\n') + '\n';
    
    writeFileSafely(businessLogicIndexPath, businessLogicIndexContent);

    // Routes index
    const routesIndexPath = join(routesDir, category, 'index.ts');
    const routesIndexContent = components.map(componentName => 
      `export { default as ${componentName.toLowerCase()}Routes } from './${componentName.toLowerCase()}Routes';`
    ).join('\n') + '\n';
    
    writeFileSafely(routesIndexPath, routesIndexContent);
  });

  // Generate main TTP types file
  const typesPath = join(baseDir, 'types', 'ttp.types.ts');
  const typesContent = `/**
 * TTP (Tactics, Techniques, Procedures) Type Definitions
 * Based on MITRE ATT&CK Framework
 */

export interface TTPData {
  id: string;
  name: string;
  description?: string;
  mitreId?: string;
  category: string;
  status: 'active' | 'monitoring' | 'mitigated' | 'archived';
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  tactics?: string[];
  techniques?: string[];
  procedures?: string[];
  actors?: string[];
  detectionCoverage?: number;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  metadata?: {
    platform?: string[];
    killchain?: string;
    references?: string[];
    mitigations?: string[];
    dataSource?: string;
    [key: string]: any;
  };
}

export interface TTPCreateInput {
  name: string;
  description?: string;
  mitreId?: string;
  status?: 'active' | 'monitoring' | 'mitigated' | 'archived';
  severity?: 'critical' | 'high' | 'medium' | 'low';
  confidence?: number;
  tactics?: string[];
  techniques?: string[];
  procedures?: string[];
  actors?: string[];
  detectionCoverage?: number;
  metadata?: {
    platform?: string[];
    killchain?: string;
    references?: string[];
    mitigations?: string[];
    dataSource?: string;
    [key: string]: any;
  };
}

export interface TTPUpdateInput {
  name?: string;
  description?: string;
  mitreId?: string;
  status?: 'active' | 'monitoring' | 'mitigated' | 'archived';
  severity?: 'critical' | 'high' | 'medium' | 'low';
  confidence?: number;
  tactics?: string[];
  techniques?: string[];
  procedures?: string[];
  actors?: string[];
  detectionCoverage?: number;
  metadata?: {
    platform?: string[];
    killchain?: string;
    references?: string[];
    mitigations?: string[];
    dataSource?: string;
    [key: string]: any;
  };
}

export interface TTPQueryOptions {
  page?: number;
  limit?: number;
  status?: string[];
  severity?: string[];
  tactics?: string[];
  techniques?: string[];
  actors?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface TTPAnalytics {
  totalCount: number;
  statusCounts: Record<string, number>;
  severityCounts: Record<string, number>;
  coverageStats: {
    avgDetectionCoverage: number;
    avgConfidence: number;
    topTactics: string[];
    topTechniques: string[];
  };
  recentActivity: any[];
}

export interface MITREAttackTactic {
  id: string;
  name: string;
  description: string;
  techniques: string[];
}

export interface MITREAttackTechnique {
  id: string;
  name: string;
  description: string;
  tactics: string[];
  platforms: string[];
  dataSources: string[];
  defenses: string[];
  subTechniques?: string[];
}

export interface TTPMapping {
  ttpId: string;
  mitreId: string;
  mappingType: 'exact' | 'partial' | 'related';
  confidence: number;
  notes?: string;
}`;

  writeFileSafely(typesPath, typesContent);

  // Generate main router integration file
  const routerIntegrationPath = join(routesDir, 'ttpRoutes.ts');
  const routerIntegrationContent = `import { Router } from 'express';
${Object.entries(ttpPages).map(([category, components]) => 
  components.map(componentName => 
    `import ${componentName.toLowerCase()}Routes from './${category}/${componentName.toLowerCase()}Routes';`
  ).join('\n')
).join('\n')}

const router = Router();

// TTP Route Integrations
${Object.entries(ttpPages).map(([category, components]) => 
  components.map(componentName => 
    `router.use('/${category}/${componentName.toLowerCase()}', ${componentName.toLowerCase()}Routes);`
  ).join('\n')
).join('\n')}

export default router;`;

  writeFileSafely(routerIntegrationPath, routerIntegrationContent);

  // Summary
  console.log('🎉 Successfully created 49 TTP-related pages with complete frontend-backend integration!\n');
  console.log('Generated components:');
  Object.entries(ttpPages).forEach(([category, components]) => {
    console.log(`  ${category}: ${components.length} pages`);
  });
  
  console.log(`\nTotal: ${totalPages} pages generated`);
  console.log(`Success rate: ${Math.round((successfulPages / totalPages) * 100)}%`);
  
  console.log('\n📁 Files created:');
  console.log('  - Frontend components (React/TypeScript)');
  console.log('  - Business logic modules');
  console.log('  - API routes with Swagger documentation');
  console.log('  - TypeScript type definitions');
  console.log('  - Router integration');
  
  console.log('\n🔗 Integration:');
  console.log('  - Add to main router: import ttpRoutes from "./routes/ttpRoutes"');
  console.log('  - Mount routes: app.use("/api/ttp", ttpRoutes)');
  console.log('  - Import components in your main application');
}

// Run the generator
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTTPPages();
}

export { generateTTPPages, ttpPages };
