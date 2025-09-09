/**
 * IOC Management Console - Standardized Implementation
 * Follows StandardizedComponent pattern for enterprise-grade IOC management
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Pagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Grid,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { 
  BaseEntity,
  Status,
  Priority,
  ApiResponse,
  PaginatedResponse,
  createApiResponse
} from '../../types/common';

/**
 * IOC-specific interfaces extending base types
 */
interface IOC extends BaseEntity {
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email';
  value: string;
  severity: Priority;
  confidence: number;
  source: string;
  tags: string[];
  lastSeen?: Date;
  enrichmentData?: any;
  analysisResult?: any;
}

interface IOCFilters {
  search?: string;
  type?: IOC['type'] | 'all';
  severity?: Priority | 'all';
  status?: Status | 'all';
  dateFrom?: string;
  dateTo?: string;
  source?: string;
}

interface IOCManagementProps {
  title?: string;
  subtitle?: string;
  onEdit?: (ioc: IOC) => void;
  onDelete?: (id: string) => void;
  onAnalyze?: (ioc: IOC) => void;
  onEnrich?: (ioc: IOC) => void;
  initialFilters?: IOCFilters;
  enableBulkOperations?: boolean;
  showAnalytics?: boolean;
}

/**
 * Custom hook for IOC data management
 */
const useIOCData = (initialFilters: IOCFilters = {}) => {
  const [iocs, setIOCs] = useState<IOC[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IOCFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIOCs, setSelectedIOCs] = useState<string[]>([]);

  const fetchIOCs = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(filters.search && { search: filters.search }),
        ...(filters.type && filters.type !== 'all' && { type: filters.type }),
        ...(filters.severity && filters.severity !== 'all' && { severity: filters.severity }),
        ...(filters.status && filters.status !== 'all' && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.source && { source: filters.source })
      });

      const response = await fetch(`/api/v1/iocs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<PaginatedResponse<IOC>> = await response.json();

      if (data.success && data.data) {
        setIOCs(data.data.data);
        setTotalPages(data.data.totalPages);
        setTotalCount(data.data.total);
        setCurrentPage(page);
      } else {
        setError(data.error || 'Failed to fetch IOCs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchIOCs(1);
  }, [fetchIOCs]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIOCs(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIOCs(iocs.map(ioc => ioc.id));
  }, [iocs]);

  const clearSelection = useCallback(() => {
    setSelectedIOCs([]);
  }, []);

  return {
    iocs,
    loading,
    error,
    filters,
    setFilters,
    currentPage,
    totalPages,
    totalCount,
    selectedIOCs,
    fetchIOCs,
    refetch: () => fetchIOCs(currentPage),
    toggleSelection,
    selectAll,
    clearSelection
  };
};

/**
 * Main IOC Management Console Component
 */
export const IOCManagementConsole: React.FC<IOCManagementProps> = ({
  title = 'IOC Management Console',
  subtitle = 'Indicators of Compromise management and analysis',
  onEdit,
  onDelete,
  onAnalyze,
  onEnrich,
  initialFilters = {},
  enableBulkOperations = true,
  showAnalytics = true
}) => {
  const {
    iocs,
    loading,
    error,
    filters,
    setFilters,
    currentPage,
    totalPages,
    totalCount,
    selectedIOCs,
    fetchIOCs,
    refetch,
    toggleSelection,
    selectAll,
    clearSelection
  } = useIOCData(initialFilters);

  // Local state for filters
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [typeFilter, setTypeFilter] = useState<IOC['type'] | 'all'>(filters.type || 'all');
  const [severityFilter, setSeverityFilter] = useState<Priority | 'all'>(filters.severity || 'all');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>(filters.status || 'all');
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleSearch = useCallback(() => {
    setFilters({
      ...filters,
      search: searchQuery || undefined,
      type: typeFilter === 'all' ? undefined : typeFilter,
      severity: severityFilter === 'all' ? undefined : severityFilter,
      status: statusFilter === 'all' ? undefined : statusFilter
    });
  }, [searchQuery, typeFilter, severityFilter, statusFilter, filters, setFilters]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    fetchIOCs(page);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete && onDelete) {
      onDelete(itemToDelete);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      refetch();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const getTypeColor = (type: IOC['type']) => {
    const colors = {
      ip: 'primary',
      domain: 'secondary',
      url: 'info',
      hash: 'success',
      email: 'warning'
    } as const;
    return colors[type] || 'default';
  };

  const getSeverityColor = (severity: Priority) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    } as const;
    return colors[severity] || 'default';
  };

  const getStatusColor = (status: Status) => {
    const colors = {
      active: 'success',
      pending: 'warning',
      completed: 'info',
      archived: 'default'
    } as const;
    return colors[status] || 'default';
  };

  // Error boundary
  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={refetch}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Main card */}
      <Card>
        <CardHeader
          title={title}
          subheader={subtitle}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {showAnalytics && (
                <Tooltip title="Analytics Dashboard">
                  <IconButton>
                    <AnalyticsIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Refresh">
                <IconButton onClick={refetch}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <CardContent>
          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search IOCs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as IOC['type'] | 'all')}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="ip">IP Address</MenuItem>
                  <MenuItem value="domain">Domain</MenuItem>
                  <MenuItem value="url">URL</MenuItem>
                  <MenuItem value="hash">Hash</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Severity</InputLabel>
                <Select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as Priority | 'all')}
                  label="Severity"
                >
                  <MenuItem value="all">All Severities</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button 
                fullWidth 
                variant="outlined" 
                onClick={handleSearch}
                sx={{ height: '40px' }}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>

          {/* Bulk operations */}
          {enableBulkOperations && selectedIOCs.length > 0 && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {selectedIOCs.length} IOCs selected
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" onClick={clearSelection}>
                  Clear Selection
                </Button>
                <Button size="small" variant="outlined" color="error">
                  Delete Selected
                </Button>
                <Button size="small" variant="outlined">
                  Bulk Analyze
                </Button>
                <Button size="small" variant="outlined">
                  Export Selected
                </Button>
              </Box>
            </Box>
          )}

          {/* Loading state */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Data table */}
          {!loading && (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      {enableBulkOperations && (
                        <TableCell padding="checkbox">
                          <Button size="small" onClick={selectAll}>
                            Select All
                          </Button>
                        </TableCell>
                      )}
                      <TableCell>Type</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Confidence</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {iocs.length === 0 ? (
                      <TableRow>
                        <TableCell 
                          colSpan={enableBulkOperations ? 9 : 8} 
                          align="center" 
                          sx={{ py: 4 }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No IOCs found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      iocs.map((ioc) => (
                        <TableRow key={ioc.id} hover>
                          {enableBulkOperations && (
                            <TableCell padding="checkbox">
                              <IconButton
                                size="small"
                                onClick={() => toggleSelection(ioc.id)}
                                color={selectedIOCs.includes(ioc.id) ? 'primary' : 'default'}
                              >
                                {selectedIOCs.includes(ioc.id) ? '✓' : '○'}
                              </IconButton>
                            </TableCell>
                          )}
                          <TableCell>
                            <Chip
                              label={ioc.type.toUpperCase()}
                              color={getTypeColor(ioc.type)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                              {ioc.value}
                            </Typography>
                            {ioc.description && (
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {ioc.description}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={ioc.severity}
                              color={getSeverityColor(ioc.severity)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={ioc.status}
                              color={getStatusColor(ioc.status)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {ioc.confidence}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap>
                              {ioc.source}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(ioc.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="View Details">
                                <IconButton size="small">
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              {onEdit && (
                                <Tooltip title="Edit">
                                  <IconButton size="small" onClick={() => onEdit(ioc)}>
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {onAnalyze && (
                                <Tooltip title="Analyze">
                                  <IconButton size="small" onClick={() => onAnalyze(ioc)}>
                                    <SecurityIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {onEnrich && (
                                <Tooltip title="Enrich">
                                  <IconButton size="small" onClick={() => onEnrich(ioc)}>
                                    <AnalyticsIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {onDelete && (
                                <Tooltip title="Delete">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleDeleteClick(ioc.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Showing {iocs.length} of {totalCount} IOCs
              </Typography>
            </>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this IOC? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IOCManagementConsole;