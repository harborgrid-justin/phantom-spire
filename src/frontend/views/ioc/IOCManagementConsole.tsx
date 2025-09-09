/**
 * IOC Management Console
 * Comprehensive Indicator of Compromise management system with interactive business logic
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  Tooltip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Badge,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha,
  useTheme,
  Snackbar,
  CircularProgress,
  FormControlLabel,
  Switch,
  InputAdornment
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  Download,
  Upload,
  Refresh,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  Security,
  Warning,
  CheckCircle,
  Schedule,
  Language,
  Storage,
  Timeline,
  Analytics,
  Share,
  Flag,
  Block,
  ThumbUp,
  ThumbDown,
  Info,
  Launch,
  NotificationsActive,
  ErrorOutline,
  TrendingUp,
  Speed
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRowSelectionModel, GridActionsCellItem } from '@mui/x-data-grid';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

interface IOCFilter {
  type?: string;
  severity?: string;
  confidence?: string;
  source?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  status?: 'active' | 'archived' | 'false_positive';
}

interface ThreatIndicator {
  id: string;
  value: string;
  type: string;
  severity: string;
  confidence: number;
  source: string;
  createdAt: Date;
  lastSeen: Date;
  tags: string[];
  status: string;
  validated: boolean;
}

export const IOCManagementConsole: React.FC = () => {
  const theme = useTheme();
  
  // Enhanced business logic integration
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    refresh
  } = useServicePage('ioc-management');

  // State management
  const [indicators, setIndicators] = useState<ThreatIndicator[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<IOCFilter>({});
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [activeTab, setActiveTab] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationIOC, setValidationIOC] = useState<ThreatIndicator | null>(null);

  // UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('ioc-management-console', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 120000 // 2 minutes
    });

    return () => evaluationController.remove();
  }, []);

  // Real-time IOC data
  const iocData = useMemo(() => {
    if (!realTimeData.data) {
      return {
        newIOCs: 0,
        validatedIOCs: 0,
        flaggedIOCs: 0,
        enrichmentQueue: 0,
        confidence: { high: 0, medium: 0, low: 0 }
      };
    }
    return realTimeData.data;
  }, [realTimeData.data]);

  // Load IOCs with business logic
  const loadIOCs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await businessLogic.execute('search-iocs', {
        query: searchQuery,
        filters,
        page,
        pageSize
      });

      if (result.success) {
        setIndicators(result.data.indicators || generateMockIOCs());
      }
    } catch (error) {
      addNotification('error', 'Failed to load IOCs');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, page, pageSize, businessLogic, addNotification]);

  // Business logic operations
  const handleValidateIOC = async (ioc: ThreatIndicator) => {
    try {
      const result = await businessLogic.execute('validate-ioc', {
        iocId: ioc.id,
        value: ioc.value,
        type: ioc.type
      }, 'high');

      if (result.success) {
        setIndicators(prev => 
          prev.map(i => i.id === ioc.id ? { ...i, validated: true } : i)
        );
        addNotification('success', `IOC ${ioc.value} validated successfully`);
      }
    } catch (error) {
      addNotification('error', `Failed to validate IOC ${ioc.value}`);
    }
  };

  const handleEnrichIOC = async (ioc: ThreatIndicator) => {
    try {
      const result = await businessLogic.execute('enrich-ioc', {
        iocId: ioc.id,
        value: ioc.value,
        type: ioc.type,
        sources: ['virustotal', 'shodan', 'alienvault']
      }, 'medium');

      if (result.success) {
        addNotification('success', `IOC enrichment started for ${ioc.value}`);
        
        // Update IOC with enrichment data
        setIndicators(prev =>
          prev.map(i => i.id === ioc.id ? {
            ...i,
            tags: [...i.tags, ...result.data.additionalTags],
            confidence: Math.max(i.confidence, result.data.confidence || i.confidence)
          } : i)
        );
      }
    } catch (error) {
      addNotification('error', `Failed to enrich IOC ${ioc.value}`);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedRows.length === 0) {
      addNotification('warning', 'No IOCs selected for bulk action');
      return;
    }

    try {
      const result = await businessLogic.execute('bulk-ioc-action', {
        action,
        iocIds: selectedRows,
        count: selectedRows.length
      }, 'high');

      if (result.success) {
        addNotification('success', `Bulk ${action} completed for ${selectedRows.length} IOCs`);
        setSelectedRows([]);
        setBulkMenuAnchor(null);
        await loadIOCs(); // Reload data
      }
    } catch (error) {
      addNotification('error', `Bulk ${action} failed`);
    }
  };

  const handleExportIOCs = async () => {
    try {
      const result = await businessLogic.execute('export-iocs', {
        filters,
        selectedIds: selectedRows.length > 0 ? selectedRows : undefined,
        format: 'csv'
      });

      if (result.success) {
        addNotification('success', 'IOC export initiated');
      }
    } catch (error) {
      addNotification('error', 'IOC export failed');
    }
  };

  // Load IOCs when component mounts or filters change
  useEffect(() => {
    loadIOCs();
  }, [loadIOCs]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!loading) {
        loadIOCs();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, loading, loadIOCs]);

  // Get severity chip configuration
  const getSeverityChip = (severity: string) => {
    const config = {
      critical: { color: 'error' as const, icon: '🚨' },
      high: { color: 'warning' as const, icon: '⚠️' },
      medium: { color: 'info' as const, icon: 'ℹ️' },
      low: { color: 'success' as const, icon: '💡' }
    };

    const severityConfig = config[severity as keyof typeof config] || config.low;
    return (
      <Chip
        label={`${severityConfig.icon} ${severity.toUpperCase()}`}
        color={severityConfig.color}
        size="small"
      />
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with real-time metrics */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🛡️ IOC Management Console
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" color="textSecondary">
              Comprehensive indicator management with real-time validation and enrichment
            </Typography>
            {realTimeData.isConnected ? (
              <Chip icon={<Security />} label="IOC Feed Active" color="success" size="small" />
            ) : (
              <Chip icon={<ErrorOutline />} label="Feed Disconnected" color="error" size="small" />
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Badge badgeContent={notifications.length} color="error">
            <IconButton color={notifications.length > 0 ? 'warning' : 'default'}>
              <NotificationsActive />
            </IconButton>
          </Badge>
          
          <Tooltip title="Refresh IOCs">
            <IconButton onClick={refresh} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowAddDialog(true)}
          >
            Add IOC
          </Button>
        </Box>
      </Box>

      {/* Real-time metrics dashboard */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {iocData.newIOCs?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    New IOCs (24h)
                  </Typography>
                </Box>
                <Add color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {iocData.validatedIOCs || '0'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Validated IOCs
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {iocData.flaggedIOCs || '0'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Flagged for Review
                  </Typography>
                </Box>
                <Flag color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {iocData.enrichmentQueue || '0'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Enrichment Queue
                  </Typography>
                </Box>
                <Speed color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search IOCs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>IOC Type</InputLabel>
              <Select
                value={filters.type || ''}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                label="IOC Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="ip">IP Address</MenuItem>
                <MenuItem value="domain">Domain</MenuItem>
                <MenuItem value="hash">File Hash</MenuItem>
                <MenuItem value="url">URL</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                value={filters.severity || ''}
                onChange={(e) => setFilters({...filters, severity: e.target.value})}
                label="Severity"
              >
                <MenuItem value="">All Severities</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
              }
              label="Auto Refresh"
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportIOCs}
                disabled={loading}
              >
                Export
              </Button>
              {selectedRows.length > 0 && (
                <Button
                  variant="contained"
                  onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                >
                  Bulk ({selectedRows.length})
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* IOC Table */}
      <Paper elevation={2}>
        {loading && <LinearProgress />}
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedRows.length === indicators.length && indicators.length > 0}
                    indeterminate={selectedRows.length > 0 && selectedRows.length < indicators.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(indicators.map(i => i.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell>IOC Value</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Confidence</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {indicators.map((ioc) => (
                <TableRow key={ioc.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRows.includes(ioc.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows([...selectedRows, ioc.id]);
                        } else {
                          setSelectedRows(selectedRows.filter(id => id !== ioc.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontFamily="monospace">
                        {ioc.value}
                      </Typography>
                      {ioc.tags.length > 0 && (
                        <Box sx={{ mt: 0.5 }}>
                          {ioc.tags.slice(0, 3).map(tag => (
                            <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                          ))}
                          {ioc.tags.length > 3 && (
                            <Chip label={`+${ioc.tags.length - 3}`} size="small" />
                          )}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={ioc.type.toUpperCase()} size="small" />
                  </TableCell>
                  <TableCell>
                    {getSeverityChip(ioc.severity)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={ioc.confidence}
                        color={getConfidenceColor(ioc.confidence)}
                        sx={{ width: 60, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="body2">
                        {ioc.confidence}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {ioc.source}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {ioc.validated && (
                        <CheckCircle color="success" fontSize="small" />
                      )}
                      <Chip
                        label={ioc.status}
                        size="small"
                        color={ioc.status === 'active' ? 'success' : 'default'}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Validate IOC">
                        <IconButton
                          size="small"
                          onClick={() => handleValidateIOC(ioc)}
                          disabled={ioc.validated}
                        >
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Enrich IOC">
                        <IconButton
                          size="small"
                          onClick={() => handleEnrichIOC(ioc)}
                        >
                          <TrendingUp />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More actions">
                        <IconButton size="small">
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          pageSizeOptions={[10, 25, 50, 100]}
          component="div"
          count={indicators.length}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => setPageSize(parseInt(e.target.value))}
        />
      </Paper>

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={bulkMenuAnchor}
        open={Boolean(bulkMenuAnchor)}
        onClose={() => setBulkMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleBulkAction('validate')}>
          <ListItemIcon><CheckCircle /></ListItemIcon>
          <ListItemText>Validate Selected</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('enrich')}>
          <ListItemIcon><TrendingUp /></ListItemIcon>
          <ListItemText>Enrich Selected</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleBulkAction('archive')}>
          <ListItemIcon><Storage /></ListItemIcon>
          <ListItemText>Archive Selected</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('delete')} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete color="error" /></ListItemIcon>
          <ListItemText>Delete Selected</ListItemText>
        </MenuItem>
      </Menu>

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

// Mock data generator
function generateMockIOCs(): ThreatIndicator[] {
  const types = ['ip', 'domain', 'hash', 'url'];
  const severities = ['critical', 'high', 'medium', 'low'];
  const sources = ['VirusTotal', 'AlienVault', 'Internal', 'Partner Feed'];
  const tags = ['malware', 'phishing', 'botnet', 'apt', 'ransomware', 'trojan'];

  return Array.from({ length: 50 }, (_, i) => ({
    id: `ioc-${i + 1}`,
    value: generateMockIOCValue(types[i % types.length]),
    type: types[i % types.length],
    severity: severities[i % severities.length],
    confidence: Math.floor(Math.random() * 40) + 60, // 60-100
    source: sources[i % sources.length],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    tags: tags.slice(0, Math.floor(Math.random() * 3) + 1),
    status: Math.random() > 0.1 ? 'active' : 'archived',
    validated: Math.random() > 0.3
  }));
}

function generateMockIOCValue(type: string): string {
  switch (type) {
    case 'ip':
      return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    case 'domain':
      const domains = ['malicious-site.com', 'evil-domain.net', 'bad-actor.org', 'threat-source.info'];
      return domains[Math.floor(Math.random() * domains.length)];
    case 'hash':
      return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    case 'url':
      return `https://malicious-site.com/path/${Math.random().toString(36).substr(2, 9)}`;
    default:
      return 'unknown-ioc-value';
  }
}

const IOCManagementConsole: React.FC = () => {
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
  } = useServicePage('ioc-management');

  // Local state
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCriteria, setFilterCriteria] = useState<IOCFilter>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [iocs, setIocs] = useState<ThreatIndicator[]>([]);

  // UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('ioc-management-console', {
      continuous: true,
      position: 'bottom-right',
      minimized: true,
      interval: 200000
    });

    return () => evaluationController.remove();
  }, []);

  // Load initial data
  useEffect(() => {
    loadIOCs();
  }, []);

  const loadIOCs = async () => {
    setIsLoading(true);
    try {
      // Generate mock data for demo
      const mockIOCs = generateMockIOCs();
      setIocs(mockIOCs);
    } catch (error) {
      addNotification('error', 'Failed to load IOCs');
    } finally {
      setIsLoading(false);
    }
  };

  // Business logic operations
  const handleValidateIOC = async (iocId: string) => {
    try {
      await businessLogic.execute('validate-ioc', { iocId });
      setIocs(prev => 
        prev.map(ioc => 
          ioc.id === iocId ? { ...ioc, validated: true } : ioc
        )
      );
      addNotification('success', 'IOC validation completed');
    } catch (error) {
      addNotification('error', 'IOC validation failed');
    }
  };

  const handleBulkOperation = async (operation: string, iocIds: string[]) => {
    try {
      await businessLogic.execute('bulk-ioc-operation', { operation, iocIds }, 'medium');
      addNotification('info', `Bulk ${operation} initiated for ${iocIds.length} IOCs`);
      loadIOCs(); // Refresh data
    } catch (error) {
      addNotification('error', `Bulk ${operation} failed`);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        IOC Management Console
      </Typography>

      {/* Action Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowAddDialog(true)}
        >
          Add IOC
        </Button>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={refresh}
          disabled={!isFullyLoaded}
        >
          Refresh
        </Button>
        <Button
          variant="outlined"
          startIcon={<Upload />}
          onClick={() => businessLogic.execute('bulk-upload')}
        >
          Bulk Upload
        </Button>
      </Box>

      {/* IOCs Table/Grid */}
      <Paper sx={{ p: 2, mb: 3 }}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <DataGrid
            rows={iocs}
            columns={[
              { field: 'value', headerName: 'IOC Value', width: 200 },
              { field: 'type', headerName: 'Type', width: 120 },
              { field: 'severity', headerName: 'Severity', width: 120 },
              { field: 'confidence', headerName: 'Confidence', width: 120 },
              { 
                field: 'actions', 
                headerName: 'Actions', 
                width: 200,
                renderCell: (params) => (
                  <Button
                    size="small"
                    onClick={() => handleValidateIOC(params.row.id)}
                  >
                    Validate
                  </Button>
                )
              }
            ]}
            checkboxSelection
            disableRowSelectionOnClick
            autoHeight
          />
        )}
      </Paper>

      {/* Add IOC Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New IOC</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>IOC Type</InputLabel>
                <Select>
                  <MenuItem value="ip">IP Address</MenuItem>
                  <MenuItem value="domain">Domain</MenuItem>
                  <MenuItem value="hash">File Hash</MenuItem>
                  <MenuItem value="url">URL</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="IOC Value"
                placeholder="Enter the indicator value..."
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Add IOC
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

export default IOCManagementConsole;
