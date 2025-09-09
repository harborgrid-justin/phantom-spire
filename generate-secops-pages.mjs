#!/usr/bin/env node

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Define the 49 SecOps pages with their categories
const secopsPages = {
  'incident-response': [
    'AdvancedPlaybookOrchestrator',
    'AutomatedResponseWorkflow', 
    'EscalationManagementSystem',
    'ForensicTimelineAnalyzer',
    'EvidenceCollectionManager',
    'ContainmentProcedureEngine',
    'RecoveryPlanningCenter',
    'PostIncidentAnalysisHub',
    'LessonsLearnedRepository',
    'ComplianceReportGenerator'
  ],
  'threat-hunting': [
    'AdvancedHuntingQueryBuilder',
    'IOCTrackingDashboard',
    'BehavioralAnalysisEngine',
    'ThreatActorProfilingCenter',
    'CampaignTrackingSystem',
    'TTaPsAnalysisPlatform',
    'ThreatLandscapeMapper',
    'HuntingMetricsDashboard'
  ],
  'security-monitoring': [
    'RealTimeSecurityDashboard',
    'AlertCorrelationEngine',
    'SIEMIntegrationHub',
    'LogAnalysisWorkbench',
    'AnomalyDetectionCenter',
    'BaselineMonitoringSystem',
    'ComplianceMonitoringDashboard',
    'SecurityKPIDashboard'
  ],
  'vulnerability-management': [
    'AssetDiscoveryPlatform',
    'VulnerabilityScanningOrchestrator',
    'RiskScoringEngine',
    'PatchManagementCenter',
    'RemediationTrackingSystem',
    'ComplianceValidationHub',
    'ThreatCorrelationAnalyzer',
    'VulnerabilityAnalyticsDashboard'
  ],
  'digital-forensics': [
    'EvidenceAcquisitionWorkflow',
    'ForensicImagingPlatform',
    'TimelineAnalysisWorkbench',
    'MalwareAnalysisLab',
    'NetworkForensicsCenter',
    'MobileForensicsWorkbench',
    'CloudForensicsAnalyzer'
  ],
  'compliance-audit': [
    'FrameworkMappingCenter',
    'ControlValidationSystem',
    'AuditTrailAnalyzer',
    'ComplianceReportingHub',
    'RiskAssessmentPlatform',
    'PolicyManagementCenter',
    'CertificationTrackingSystem',
    'RemediationPlanningWorkbench'
  ]
};

// Template for React component
const createComponentTemplate = (componentName, category) => `import React, { useState, useEffect } from 'react';
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
  Tab
} from '@mui/material';
import {
  Security,
  Dashboard,
  Assessment,
  Timeline,
  Report,
  Settings,
  Refresh,
  Add,
  Edit,
  Delete,
  Download,
  Upload,
  Visibility,
  VisibilityOff,
  Warning,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';

interface ${componentName}Data {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

interface ${componentName}Props {
  onRefresh?: () => void;
  onExport?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ 
  onRefresh, 
  onExport 
}) => {
  const [data, setData] = useState<${componentName}Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<${componentName}Data | null>(null);

  // Mock data for demonstration
  const mockData: ${componentName}Data[] = [
    {
      id: '1',
      name: 'Sample ${category.replace('-', ' ')} Item 1',
      status: 'active',
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: { category: '${category}', tags: ['secops', 'security'], owner: 'Security Team' }
    },
    {
      id: '2',
      name: 'Sample ${category.replace('-', ' ')} Item 2',
      status: 'pending',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: { category: '${category}', tags: ['security', 'monitoring'], owner: 'SOC Team' }
    },
    {
      id: '3',
      name: 'Sample ${category.replace('-', ' ')} Item 3',
      status: 'completed',
      priority: 'low',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: { category: '${category}', tags: ['compliance', 'audit'], owner: 'Compliance Team' }
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setData(mockData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch ${category.replace('-', ' ')} data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    // Refetch data
    setData(mockData);
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    }
    // Export logic here
    console.log('Exporting ${category} data...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Name', width: 250, flex: 1 },
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
      field: 'priority',
      headerName: 'Priority',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getPriorityColor(params.value) as any}
          size="small"
        />
      )
    },
    { field: 'createdAt', headerName: 'Created', width: 180, type: 'dateTime' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton onClick={() => setSelectedItem(params.row)} size="small">
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

  if (error) {
    return (
      <Alert severity="error" action={
        <Button onClick={handleRefresh}>Retry</Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
          ${componentName.replace(/([A-Z])/g, ' $1').trim()}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Add New
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Items
              </Typography>
              <Typography variant="h4">
                {data.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active
              </Typography>
              <Typography variant="h4" color="success.main">
                {data.filter(item => item.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {data.filter(item => item.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Critical Priority
              </Typography>
              <Typography variant="h4" color="error.main">
                {data.filter(item => item.priority === 'critical').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="Analytics" />
          <Tab label="Configuration" />
        </Tabs>
        
        <CardContent>
          {selectedTab === 0 && (
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={data}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                checkboxSelection
                disableSelectionOnClick
              />
            </Box>
          )}
          
          {selectedTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                ${category.replace('-', ' ')} Analytics
              </Typography>
              <Typography color="textSecondary">
                Analytics and metrics for ${category.replace('-', ' ')} operations will be displayed here.
              </Typography>
            </Box>
          )}
          
          {selectedTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Configuration Settings
              </Typography>
              <Typography color="textSecondary">
                Configuration options for ${category.replace('-', ' ')} settings will be displayed here.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedItem} onClose={() => setSelectedItem(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem?.name}
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={selectedItem.name}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Status"
                  value={selectedItem.status}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Priority"
                  value={selectedItem.priority}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Created At"
                  value={new Date(selectedItem.createdAt).toLocaleString()}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Metadata"
                  value={JSON.stringify(selectedItem.metadata, null, 2)}
                  multiline
                  rows={4}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedItem(null)}>Close</Button>
          <Button variant="contained">Edit</Button>
        </DialogActions>
      </Dialog>

      {/* Add New Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New ${category.replace('-', ' ')} Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                placeholder="Enter item name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select defaultValue="pending">
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
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
                label="Description"
                multiline
                rows={3}
                placeholder="Enter description"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ${componentName};
`;

// Template for business logic module
const createBusinessLogicTemplate = (componentName, category) => `import { logger } from '../../../utils/logger.js';
import { DatabaseService } from '../../../data-layer/DatabaseService.js';
import { ValidationError, NotFoundError, ConflictError } from '../../../utils/errors.js';

export interface ${componentName}Data {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  metadata: Record<string, any>;
  tags: string[];
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface ${componentName}CreateInput {
  name: string;
  status?: 'active' | 'pending' | 'completed' | 'failed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  tags?: string[];
  owner?: string;
}

export interface ${componentName}UpdateInput {
  name?: string;
  status?: 'active' | 'pending' | 'completed' | 'failed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  tags?: string[];
  owner?: string;
}

export interface ${componentName}FilterOptions {
  status?: string[];
  priority?: string[];
  tags?: string[];
  owner?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  searchTerm?: string;
}

export interface ${componentName}SortOptions {
  field: 'name' | 'status' | 'priority' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface ${componentName}PaginationOptions {
  page: number;
  limit: number;
}

export interface ${componentName}ListResult {
  items: ${componentName}Data[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ${componentName}BusinessLogic {
  private db: DatabaseService;
  private collectionName = '${category.replace('-', '_')}_${componentName.toLowerCase()}';

  constructor() {
    this.db = DatabaseService.getInstance();
    logger.info(\`Initialized \${this.constructor.name} with collection: \${this.collectionName}\`);
  }

  /**
   * Create a new ${category.replace('-', ' ')} item
   */
  async create(
    input: ${componentName}CreateInput,
    userId: string
  ): Promise<${componentName}Data> {
    try {
      logger.info(\`Creating new ${category.replace('-', ' ')} item: \${input.name}\`, { userId, input });

      // Validation
      if (!input.name || input.name.trim().length === 0) {
        throw new ValidationError('Name is required');
      }

      if (input.name.length > 255) {
        throw new ValidationError('Name must be less than 255 characters');
      }

      // Check for duplicate name
      const existingItem = await this.db.findOne(this.collectionName, { name: input.name });
      if (existingItem) {
        throw new ConflictError(\`${category.replace('-', ' ')} item with name '\${input.name}' already exists\`);
      }

      // Prepare data
      const now = new Date();
      const itemData: ${componentName}Data = {
        id: this.generateId(),
        name: input.name.trim(),
        status: input.status || 'pending',
        priority: input.priority || 'medium',
        category: '${category}',
        metadata: input.metadata || {},
        tags: input.tags || [],
        owner: input.owner || userId,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId
      };

      // Store in database
      await this.db.insertOne(this.collectionName, itemData);

      // Log metrics
      await this.recordMetrics('create', itemData);

      logger.info(\`Successfully created ${category.replace('-', ' ')} item: \${itemData.id}\`, { itemId: itemData.id });
      return itemData;

    } catch (error) {
      logger.error(\`Failed to create ${category.replace('-', ' ')} item\`, { error: error.message, input, userId });
      throw error;
    }
  }

  /**
   * Get ${category.replace('-', ' ')} item by ID
   */
  async getById(id: string): Promise<${componentName}Data | null> {
    try {
      logger.debug(\`Fetching ${category.replace('-', ' ')} item by ID: \${id}\`);

      const item = await this.db.findOne(this.collectionName, { id });
      
      if (!item) {
        logger.warn(\`${category.replace('-', ' ')} item not found: \${id}\`);
        return null;
      }

      return item as ${componentName}Data;

    } catch (error) {
      logger.error(\`Failed to fetch ${category.replace('-', ' ')} item by ID\`, { error: error.message, id });
      throw error;
    }
  }

  /**
   * Update ${category.replace('-', ' ')} item
   */
  async update(
    id: string,
    input: ${componentName}UpdateInput,
    userId: string
  ): Promise<${componentName}Data> {
    try {
      logger.info(\`Updating ${category.replace('-', ' ')} item: \${id}\`, { userId, input });

      // Get existing item
      const existingItem = await this.getById(id);
      if (!existingItem) {
        throw new NotFoundError(\`${category.replace('-', ' ')} item not found: \${id}\`);
      }

      // Validation
      if (input.name !== undefined) {
        if (!input.name || input.name.trim().length === 0) {
          throw new ValidationError('Name is required');
        }
        if (input.name.length > 255) {
          throw new ValidationError('Name must be less than 255 characters');
        }

        // Check for duplicate name (excluding current item)
        const duplicateItem = await this.db.findOne(this.collectionName, { 
          name: input.name,
          id: { $ne: id }
        });
        if (duplicateItem) {
          throw new ConflictError(\`${category.replace('-', ' ')} item with name '\${input.name}' already exists\`);
        }
      }

      // Prepare update data
      const updateData: Partial<${componentName}Data> = {
        ...input,
        updatedAt: new Date(),
        updatedBy: userId
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof ${componentName}Data] === undefined) {
          delete updateData[key as keyof ${componentName}Data];
        }
      });

      // Update in database
      await this.db.updateOne(this.collectionName, { id }, { $set: updateData });

      // Get updated item
      const updatedItem = await this.getById(id);
      if (!updatedItem) {
        throw new Error('Failed to retrieve updated item');
      }

      // Log metrics
      await this.recordMetrics('update', updatedItem);

      logger.info(\`Successfully updated ${category.replace('-', ' ')} item: \${id}\`);
      return updatedItem;

    } catch (error) {
      logger.error(\`Failed to update ${category.replace('-', ' ')} item\`, { error: error.message, id, input, userId });
      throw error;
    }
  }

  /**
   * Delete ${category.replace('-', ' ')} item
   */
  async delete(id: string, userId: string): Promise<void> {
    try {
      logger.info(\`Deleting ${category.replace('-', ' ')} item: \${id}\`, { userId });

      // Check if item exists
      const existingItem = await this.getById(id);
      if (!existingItem) {
        throw new NotFoundError(\`${category.replace('-', ' ')} item not found: \${id}\`);
      }

      // Delete from database
      await this.db.deleteOne(this.collectionName, { id });

      // Log metrics
      await this.recordMetrics('delete', existingItem);

      logger.info(\`Successfully deleted ${category.replace('-', ' ')} item: \${id}\`);

    } catch (error) {
      logger.error(\`Failed to delete ${category.replace('-', ' ')} item\`, { error: error.message, id, userId });
      throw error;
    }
  }

  /**
   * List ${category.replace('-', ' ')} items with filtering, sorting, and pagination
   */
  async list(
    filters?: ${componentName}FilterOptions,
    sort?: ${componentName}SortOptions,
    pagination?: ${componentName}PaginationOptions
  ): Promise<${componentName}ListResult> {
    try {
      logger.debug('Listing ${category.replace('-', ' ')} items', { filters, sort, pagination });

      // Build query
      const query: any = { category: '${category}' };

      if (filters) {
        if (filters.status && filters.status.length > 0) {
          query.status = { $in: filters.status };
        }
        if (filters.priority && filters.priority.length > 0) {
          query.priority = { $in: filters.priority };
        }
        if (filters.tags && filters.tags.length > 0) {
          query.tags = { $in: filters.tags };
        }
        if (filters.owner) {
          query.owner = filters.owner;
        }
        if (filters.createdAfter || filters.createdBefore) {
          query.createdAt = {};
          if (filters.createdAfter) {
            query.createdAt.$gte = filters.createdAfter;
          }
          if (filters.createdBefore) {
            query.createdAt.$lte = filters.createdBefore;
          }
        }
        if (filters.searchTerm) {
          query.$or = [
            { name: { $regex: filters.searchTerm, $options: 'i' } },
            { 'metadata.description': { $regex: filters.searchTerm, $options: 'i' } }
          ];
        }
      }

      // Build sort
      const sortOptions: any = {};
      if (sort) {
        sortOptions[sort.field] = sort.direction === 'asc' ? 1 : -1;
      } else {
        sortOptions.createdAt = -1; // Default sort by created date desc
      }

      // Pagination
      const page = pagination?.page || 1;
      const limit = Math.min(pagination?.limit || 25, 100); // Max 100 items per page
      const skip = (page - 1) * limit;

      // Execute queries
      const [items, total] = await Promise.all([
        this.db.find(this.collectionName, query, { sort: sortOptions, skip, limit }),
        this.db.count(this.collectionName, query)
      ]);

      const totalPages = Math.ceil(total / limit);

      const result: ${componentName}ListResult = {
        items: items as ${componentName}Data[],
        total,
        page,
        limit,
        totalPages
      };

      logger.debug(\`Retrieved \${items.length} ${category.replace('-', ' ')} items\`, { total, page, totalPages });
      return result;

    } catch (error) {
      logger.error('Failed to list ${category.replace('-', ' ')} items', { error: error.message, filters, sort, pagination });
      throw error;
    }
  }

  /**
   * Get analytics and metrics
   */
  async getAnalytics(): Promise<any> {
    try {
      logger.debug('Getting ${category.replace('-', ' ')} analytics');

      const [
        totalCount,
        statusCounts,
        priorityCounts,
        recentActivity
      ] = await Promise.all([
        this.db.count(this.collectionName, { category: '${category}' }),
        this.db.aggregate(this.collectionName, [
          { $match: { category: '${category}' } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        this.db.aggregate(this.collectionName, [
          { $match: { category: '${category}' } },
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]),
        this.db.find(this.collectionName, 
          { category: '${category}' }, 
          { sort: { updatedAt: -1 }, limit: 10 }
        )
      ]);

      return {
        totalCount,
        statusCounts: statusCounts.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        priorityCounts: priorityCounts.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentActivity
      };

    } catch (error) {
      logger.error('Failed to get ${category.replace('-', ' ')} analytics', { error: error.message });
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdate(
    ids: string[],
    update: Partial<${componentName}UpdateInput>,
    userId: string
  ): Promise<number> {
    try {
      logger.info(\`Bulk updating \${ids.length} ${category.replace('-', ' ')} items\`, { userId, update });

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

      logger.info(\`Successfully bulk updated \${result.modifiedCount} ${category.replace('-', ' ')} items\`);
      return result.modifiedCount;

    } catch (error) {
      logger.error('Failed to bulk update ${category.replace('-', ' ')} items', { error: error.message, ids, update, userId });
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
  private async recordMetrics(operation: string, data: ${componentName}Data): Promise<void> {
    try {
      const metrics = {
        operation,
        category: '${category}',
        component: '${componentName}',
        itemId: data.id,
        status: data.status,
        priority: data.priority,
        timestamp: new Date(),
        metadata: {
          tags: data.tags,
          owner: data.owner
        }
      };

      await this.db.insertOne('system_metrics', metrics);
    } catch (error) {
      // Don't throw on metrics failure
      logger.warn('Failed to record metrics', { error: error.message, operation, itemId: data.id });
    }
  }
}

export default ${componentName}BusinessLogic;
`;

// Template for API routes
const createRouteTemplate = (componentName, category) => `import { Router } from 'express';
import { ${componentName}BusinessLogic } from '../services/business-logic/modules/${category}/${componentName}BusinessLogic.js';
import { authMiddleware } from '../middleware/auth.js';
import { validationMiddleware } from '../middleware/validation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

const router = Router();
const businessLogic = new ${componentName}BusinessLogic();

/**
 * @swagger
 * /api/v1/${category}/${componentName.toLowerCase()}:
 *   get:
 *     summary: List ${category.replace('-', ' ')} items
 *     tags: [${category}]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [active, pending, completed, failed]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [low, medium, high, critical]
 *         description: Filter by priority
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of ${category.replace('-', ' ')} items
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { page, limit, status, priority, search, sortField, sortDirection } = req.query;

  const filters = {
    status: status ? (Array.isArray(status) ? status : [status]) : undefined,
    priority: priority ? (Array.isArray(priority) ? priority : [priority]) : undefined,
    searchTerm: search as string
  };

  const sort = sortField ? {
    field: sortField as any,
    direction: (sortDirection as 'asc' | 'desc') || 'desc'
  } : undefined;

  const pagination = {
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 25
  };

  const result = await businessLogic.list(filters, sort, pagination);
  
  res.json({
    success: true,
    data: result
  });
}));

/**
 * @swagger
 * /api/v1/${category}/${componentName.toLowerCase()}:
 *   post:
 *     summary: Create new ${category.replace('-', ' ')} item
 *     tags: [${category}]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Item name
 *               status:
 *                 type: string
 *                 enum: [active, pending, completed, failed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               metadata:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               owner:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Item already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, validationMiddleware, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const item = await businessLogic.create(req.body, userId);
  
  res.status(201).json({
    success: true,
    data: item
  });
}));

/**
 * @swagger
 * /api/v1/${category}/${componentName.toLowerCase()}/{id}:
 *   get:
 *     summary: Get ${category.replace('-', ' ')} item by ID
 *     tags: [${category}]
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
 *         description: Item details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await businessLogic.getById(id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }
  
  res.json({
    success: true,
    data: item
  });
}));

/**
 * @swagger
 * /api/v1/${category}/${componentName.toLowerCase()}/{id}:
 *   put:
 *     summary: Update ${category.replace('-', ' ')} item
 *     tags: [${category}]
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, pending, completed, failed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               metadata:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               owner:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 *       409:
 *         description: Conflict
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authMiddleware, validationMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const item = await businessLogic.update(id, req.body, userId);
  
  res.json({
    success: true,
    data: item
  });
}));

/**
 * @swagger
 * /api/v1/${category}/${componentName.toLowerCase()}/{id}:
 *   delete:
 *     summary: Delete ${category.replace('-', ' ')} item
 *     tags: [${category}]
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
 *         description: Item deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  await businessLogic.delete(id, userId);
  
  res.json({
    success: true,
    message: 'Item deleted successfully'
  });
}));

/**
 * @swagger
 * /api/v1/${category}/${componentName.toLowerCase()}/analytics:
 *   get:
 *     summary: Get ${category.replace('-', ' ')} analytics
 *     tags: [${category}]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/analytics', authMiddleware, asyncHandler(async (req, res) => {
  const analytics = await businessLogic.getAnalytics();
  
  res.json({
    success: true,
    data: analytics
  });
}));

/**
 * @swagger
 * /api/v1/${category}/${componentName.toLowerCase()}/bulk:
 *   put:
 *     summary: Bulk update ${category.replace('-', ' ')} items
 *     tags: [${category}]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *               - update
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               update:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [active, pending, completed, failed]
 *                   priority:
 *                     type: string
 *                     enum: [low, medium, high, critical]
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Bulk update completed
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/bulk', authMiddleware, validationMiddleware, asyncHandler(async (req, res) => {
  const { ids, update } = req.body;
  const userId = req.user?.id;
  const updatedCount = await businessLogic.bulkUpdate(ids, update, userId);
  
  res.json({
    success: true,
    data: {
      updatedCount
    }
  });
}));

export default router;
`;

// Function to create all files
function createSecOpsPages() {
  let totalPages = 0;
  
  Object.entries(secopsPages).forEach(([category, components]) => {
    console.log(`\nCreating ${category} components (${components.length} pages):`);
    
    components.forEach(component => {
      // Create frontend component
      const frontendDir = join(__dirname, 'src', 'frontend', 'views', category);
      if (!existsSync(frontendDir)) {
        mkdirSync(frontendDir, { recursive: true });
      }
      
      const componentPath = join(frontendDir, `${component}Component.tsx`);
      writeFileSync(componentPath, createComponentTemplate(component, category));
      console.log(`  ✓ Created frontend component: ${component}Component.tsx`);
      
      // Create business logic
      const businessLogicDir = join(__dirname, 'src', 'services', 'business-logic', 'modules', category);
      if (!existsSync(businessLogicDir)) {
        mkdirSync(businessLogicDir, { recursive: true });
      }
      
      const businessLogicPath = join(businessLogicDir, `${component}BusinessLogic.ts`);
      writeFileSync(businessLogicPath, createBusinessLogicTemplate(component, category));
      console.log(`  ✓ Created business logic: ${component}BusinessLogic.ts`);
      
      // Create API route
      const routesDir = join(__dirname, 'src', 'routes', category);
      if (!existsSync(routesDir)) {
        mkdirSync(routesDir, { recursive: true });
      }
      
      const routePath = join(routesDir, `${component.toLowerCase()}Routes.ts`);
      writeFileSync(routePath, createRouteTemplate(component, category));
      console.log(`  ✓ Created API route: ${component.toLowerCase()}Routes.ts`);
      
      totalPages++;
    });
    
    // Create category index files
    const frontendIndexPath = join(__dirname, 'src', 'frontend', 'views', category, 'index.ts');
    const frontendIndexContent = components.map(comp => 
      `export { default as ${comp}Component } from './${comp}Component';`
    ).join('\n') + '\n';
    writeFileSync(frontendIndexPath, frontendIndexContent);
    
    const businessLogicIndexPath = join(__dirname, 'src', 'services', 'business-logic', 'modules', category, 'index.ts');
    const businessLogicIndexContent = components.map(comp => 
      `export { ${comp}BusinessLogic } from './${comp}BusinessLogic';`
    ).join('\n') + '\n';
    writeFileSync(businessLogicIndexPath, businessLogicIndexContent);
  });
  
  console.log(`\n🎉 Successfully created ${totalPages} SecOps pages with complete frontend-backend integration!`);
  console.log('\nGenerated components:');
  Object.entries(secopsPages).forEach(([category, components]) => {
    console.log(`  ${category}: ${components.length} pages`);
  });
  
  return totalPages;
}

// Run the generation
createSecOpsPages();