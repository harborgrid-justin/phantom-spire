/**
 * IOC Management Console
 * Comprehensive Indicator of Compromise management system
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
  useTheme
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
  Launch
} from '@mui/icons-material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { DataGrid, GridColDef, GridRowSelectionModel, GridActionsCellItem } from '@mui/x-data-grid';
import { ThreatIndicator, IOCType, ConfidenceLevel, ThreatSeverity, TLPLevel } from '../../types/common';
import { addUIUXEvaluation } from '../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';

interface IOCFilter {
  type?: IOCType;
  severity?: ThreatSeverity;
  confidence?: ConfidenceLevel;
  tlpLevel?: TLPLevel;
  source?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  status?: 'active' | 'archived' | 'false_positive';
}

interface IOCSearchResult {
  indicators: ThreatIndicator[];
  total: number;
  page: number;
  pageSize: number;
  aggregations: {
    types: Record<IOCType, number>;
    severities: Record<ThreatSeverity, number>;
    sources: Record<string, number>;
    confidence: Record<ConfidenceLevel, number>;
  };
}

interface IOCBulkAction {
  action: 'archive' | 'delete' | 'export' | 'tag' | 'confidence' | 'severity';
  parameters?: Record<string, any>;
}

export const IOCManagementConsole: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [indicators, setIndicators] = useState<ThreatIndicator[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<IOCFilter>({});
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<IOCSearchResult | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [activeTab, setActiveTab] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(null);

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('ioc-management-console', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 120000 // 2 minutes
    });

    return () => evaluationController.remove();
  }, []);

  // Load IOCs
  useEffect(() => {
    loadIOCs();
  }, [searchQuery, filters, page, pageSize]);

  const loadIOCs = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with real API
      const mockIOCs: ThreatIndicator[] = generateMockIOCs();
      const filteredIOCs = applyFilters(mockIOCs);
      
      setSearchResults({
        indicators: filteredIOCs.slice(page * pageSize, (page + 1) * pageSize),
        total: filteredIOCs.length,
        page,
        pageSize,
        aggregations: generateAggregations(filteredIOCs)
      });
      
      setIndicators(filteredIOCs.slice(page * pageSize, (page + 1) * pageSize));
    } catch (error) {
      console.error('Failed to load IOCs:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockIOCs = (): ThreatIndicator[] => {
    const mockData: ThreatIndicator[] = [];
    const types: IOCType[] = ['ip', 'domain', 'url', 'hash_sha256', 'email', 'file_name'];
    const severities: ThreatSeverity[] = ['low', 'medium', 'high', 'critical'];
    const confidences: ConfidenceLevel[] = ['low', 'medium', 'high', 'very_high'];
    const sources = ['VirusTotal', 'AlienVault', 'Internal', 'MISP', 'Commercial Feed'];
    
    for (let i = 0; i < 500; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const confidence = confidences[Math.floor(Math.random() * confidences.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      
      let value = '';
      switch (type) {
        case 'ip':
          value = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
          break;
        case 'domain':
          value = `malicious-${Math.random().toString(36).substring(7)}.com`;
          break;
        case 'url':
          value = `https://malicious-${Math.random().toString(36).substring(7)}.com/path`;
          break;
        case 'hash_sha256':
          value = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
          break;
        case 'email':
          value = `malicious${Math.floor(Math.random() * 1000)}@evil.com`;
          break;
        case 'file_name':
          value = `malware_${Math.random().toString(36).substring(7)}.exe`;
          break;
      }

      mockData.push({
        id: `ioc-${i + 1}`,
        type,
        value,
        confidence,
        severity,
        tags: [`tag${Math.floor(Math.random() * 5) + 1}`, 'malware'],
        source,
        firstSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        description: `${type} indicator with ${severity} severity`,
        tlpLevel: 'amber',
        context: {
          geolocation: {
            country: 'Unknown',
            countryCode: 'XX',
            region: 'Unknown',
            city: 'Unknown',
            latitude: 0,
            longitude: 0,
            timezone: 'UTC'
          }
        }
      });
    }
    
    return mockData;
  };

  const applyFilters = (iocs: ThreatIndicator[]): ThreatIndicator[] => {
    let filtered = [...iocs];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ioc =>
        ioc.value.toLowerCase().includes(query) ||
        ioc.description?.toLowerCase().includes(query) ||
        ioc.tags.some(tag => tag.toLowerCase().includes(query)) ||
        ioc.source.toLowerCase().includes(query)
      );
    }
    
    // Apply filters
    if (filters.type) {
      filtered = filtered.filter(ioc => ioc.type === filters.type);
    }
    
    if (filters.severity) {
      filtered = filtered.filter(ioc => ioc.severity === filters.severity);
    }
    
    if (filters.confidence) {
      filtered = filtered.filter(ioc => ioc.confidence === filters.confidence);
    }
    
    if (filters.source) {
      filtered = filtered.filter(ioc => ioc.source === filters.source);
    }
    
    return filtered;
  };

  const generateAggregations = (iocs: ThreatIndicator[]) => {
    const aggregations = {
      types: {} as Record<IOCType, number>,
      severities: {} as Record<ThreatSeverity, number>,
      sources: {} as Record<string, number>,
      confidence: {} as Record<ConfidenceLevel, number>
    };
    
    iocs.forEach(ioc => {
      aggregations.types[ioc.type] = (aggregations.types[ioc.type] || 0) + 1;
      aggregations.severities[ioc.severity] = (aggregations.severities[ioc.severity] || 0) + 1;
      aggregations.sources[ioc.source] = (aggregations.sources[ioc.source] || 0) + 1;
      aggregations.confidence[ioc.confidence] = (aggregations.confidence[ioc.confidence] || 0) + 1;
    });
    
    return aggregations;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0);
  };

  const handleFilterChange = (newFilters: Partial<IOCFilter>) => {
    setFilters({ ...filters, ...newFilters });
    setPage(0);
  };

  const handleBulkAction = (action: IOCBulkAction) => {
    console.log('Bulk action:', action, 'on rows:', selectedRows);
    setBulkMenuAnchor(null);
    // Implement bulk action logic
  };

  const getSeverityColor = (severity: ThreatSeverity) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getConfidenceColor = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'very_high': return theme.palette.success.main;
      case 'high': return theme.palette.info.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  // DataGrid columns configuration
  const columns: GridColDef[] = [
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value.toUpperCase()}
          variant="outlined"
          color="primary"
        />
      )
    },
    {
      field: 'value',
      headerName: 'Indicator Value',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
            {params.value.length > 50 ? `${params.value.substring(0, 50)}...` : params.value}
          </Typography>
          <IconButton size="small" onClick={() => navigator.clipboard.writeText(params.value)}>
            <Launch sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      )
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 100,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
          sx={{
            bgcolor: alpha(getSeverityColor(params.value), 0.1),
            color: getSeverityColor(params.value),
            border: `1px solid ${getSeverityColor(params.value)}`
          }}
        />
      )
    },
    {
      field: 'confidence',
      headerName: 'Confidence',
      width: 120,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value.replace('_', ' ').toUpperCase()}
          sx={{
            bgcolor: alpha(getConfidenceColor(params.value), 0.1),
            color: getConfidenceColor(params.value)
          }}
        />
      )
    },
    {
      field: 'source',
      headerName: 'Source',
      width: 130
    },
    {
      field: 'firstSeen',
      headerName: 'First Seen',
      width: 130,
      renderCell: (params) => (
        <Typography variant="caption">
          {params.value.toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.value.slice(0, 2).map((tag: string) => (
            <Chip key={tag} size="small" label={tag} variant="outlined" />
          ))}
          {params.value.length > 2 && (
            <Chip size="small" label={`+${params.value.length - 2}`} variant="outlined" />
          )}
        </Box>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Visibility />}
          label="View Details"
          onClick={() => navigate(`/ioc/details/${params.id}`)}
        />,
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => console.log('Edit', params.id)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => console.log('Delete', params.id)}
        />
      ]
    }
  ];

  const tabLabels = [
    'All IOCs',
    'Active Investigations',
    'Recently Added',
    'High Confidence',
    'Archived'
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            🛡️ IOC Management Console
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowAddDialog(true)}
            >
              Add IOC
            </Button>
            <Button
              variant="outlined"
              startIcon={<Upload />}
            >
              Import
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              disabled={selectedRows.length === 0}
            >
              Export ({selectedRows.length})
            </Button>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search IOCs by value, tags, source, or description..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange({ type: e.target.value as IOCType })}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="ip">IP Address</MenuItem>
                <MenuItem value="domain">Domain</MenuItem>
                <MenuItem value="url">URL</MenuItem>
                <MenuItem value="hash_sha256">SHA256 Hash</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="file_name">File Name</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select
                value={filters.severity || ''}
                onChange={(e) => handleFilterChange({ severity: e.target.value as ThreatSeverity })}
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
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              fullWidth
            >
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper elevation={1} sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabLabels.map((label, index) => (
            <Tab
              key={index}
              label={
                <Badge
                  badgeContent={index === 0 ? searchResults?.total : Math.floor(Math.random() * 50)}
                  color="primary"
                  max={999}
                >
                  {label}
                </Badge>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
              >
                Bulk Actions
              </Button>
              <Button
                size="small"
                onClick={() => setSelectedRows([])}
              >
                Clear Selection
              </Button>
            </Box>
          }
        >
          {selectedRows.length} IOC{selectedRows.length !== 1 ? 's' : ''} selected
        </Alert>
      )}

      {/* Data Grid */}
      <Paper elevation={2} sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={indicators}
          columns={columns}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={setSelectedRows}
          pagination
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderColor: theme.palette.divider
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              borderColor: theme.palette.divider
            }
          }}
        />
      </Paper>

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={bulkMenuAnchor}
        open={Boolean(bulkMenuAnchor)}
        onClose={() => setBulkMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleBulkAction({ action: 'archive' })}>
          <ListItemIcon><Storage /></ListItemIcon>
          <ListItemText>Archive Selected</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction({ action: 'tag' })}>
          <ListItemIcon><Flag /></ListItemIcon>
          <ListItemText>Add Tags</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction({ action: 'confidence' })}>
          <ListItemIcon><ThumbUp /></ListItemIcon>
          <ListItemText>Update Confidence</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction({ action: 'severity' })}>
          <ListItemIcon><Warning /></ListItemIcon>
          <ListItemText>Update Severity</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleBulkAction({ action: 'export' })}>
          <ListItemIcon><Download /></ListItemIcon>
          <ListItemText>Export as STIX</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction({ action: 'delete' })}>
          <ListItemIcon><Delete /></ListItemIcon>
          <ListItemText>Delete Selected</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add IOC Dialog */}
      <Dialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New IOC</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>IOC Type</InputLabel>
                <Select defaultValue="">
                  <MenuItem value="ip">IP Address</MenuItem>
                  <MenuItem value="domain">Domain</MenuItem>
                  <MenuItem value="url">URL</MenuItem>
                  <MenuItem value="hash_sha256">SHA256 Hash</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="file_name">File Name</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select defaultValue="medium">
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                placeholder="Describe the threat context..."
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Source"
                placeholder="e.g., VirusTotal, Internal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tags"
                placeholder="malware, apt, phishing (comma-separated)"
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

      <Routes>
        <Route path="/search" element={<div>IOC Search Component</div>} />
        <Route path="/analysis" element={<div>IOC Analysis Component</div>} />
        <Route path="/enrichment" element={<div>IOC Enrichment Component</div>} />
        <Route path="/details/:id" element={<div>IOC Details Component</div>} />
      </Routes>
    </Box>
  );
};