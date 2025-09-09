/**
 * Standardized React Component Pattern
 * Enterprise-grade component implementation demonstrating architecture standards
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Pagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { 
  StandardFormData, 
  Status, 
  Priority, 
  createFormData,
  BaseEntity,
  ApiResponse 
} from '../types/common';

/**
 * Component-specific interfaces extending base types
 */
interface StandardComponentData extends BaseEntity {
  category: string;
  priority: Priority;
  tags: string[];
}

interface ComponentProps {
  title?: string;
  subtitle?: string;
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableExport?: boolean;
}

/**
 * Custom hooks demonstrating standardized patterns
 */
const useDataManagement = () => {
  const [data, setData] = useState<StandardComponentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  // Mock data for demonstration
  const mockData: StandardComponentData[] = [
    {
      id: '1',
      title: 'Sample Security Analysis',
      description: 'Comprehensive security assessment and threat analysis',
      status: 'active',
      category: 'security',
      priority: 'high',
      tags: ['security', 'analysis', 'threat-intel'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        category: 'security',
        tags: ['security', 'analysis'],
        priority: 'high'
      }
    },
    {
      id: '2',
      title: 'Network Monitoring Setup',
      description: 'Configure real-time network monitoring and alerting',
      status: 'pending',
      category: 'network',
      priority: 'medium',
      tags: ['network', 'monitoring', 'infrastructure'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        category: 'network',
        tags: ['network', 'monitoring'],
        priority: 'medium'
      }
    }
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredData = [...mockData];
      
      // Apply search filter
      if (searchQuery) {
        filteredData = filteredData.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filteredData = filteredData.filter(item => item.status === statusFilter);
      }
      
      // Apply priority filter
      if (priorityFilter !== 'all') {
        filteredData = filteredData.filter(item => item.priority === priorityFilter);
      }
      
      setData(filteredData);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    refetch: fetchData
  };
};

/**
 * Main component demonstrating standardized patterns
 */
export const StandardizedComponent: React.FC<ComponentProps> = ({
  title = 'Enterprise Data Management',
  subtitle = 'Standardized component implementation',
  enableSearch = true,
  enableFilters = true,
  enableExport = true
}) => {
  const {
    data,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    refetch
  } = useDataManagement();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<StandardComponentData | null>(null);
  const [formData, setFormData] = useState<StandardFormData>(createFormData());
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Event handlers following standardized patterns
  const handleAddNew = useCallback(() => {
    setEditingItem(null);
    setFormData(createFormData());
    setOpenDialog(true);
  }, []);

  const handleEdit = useCallback((item: StandardComponentData) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      status: item.status,
      metadata: item.metadata || {
        category: item.category,
        tags: item.tags,
        priority: item.priority
      }
    });
    setOpenDialog(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      console.log('Deleting item:', id);
      refetch();
    }
  }, [refetch]);

  const handleSave = useCallback(async () => {
    try {
      if (editingItem) {
        console.log('Updating item:', editingItem.id, formData);
      } else {
        console.log('Creating new item:', formData);
      }
      
      setOpenDialog(false);
      refetch();
    } catch (error) {
      console.error('Save failed:', error);
    }
  }, [editingItem, formData, refetch]);

  const handleExport = useCallback(() => {
    const csvContent = [
      ['ID', 'Title', 'Status', 'Priority', 'Created'],
      ...data.map(item => [
        item.id,
        item.title,
        item.status,
        item.priority,
        new Date(item.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  // Utility functions
  const getStatusColor = (status: Status): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: Priority): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  // DataGrid columns configuration
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'title', headerName: 'Title', width: 250 },
    { field: 'category', headerName: 'Category', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value as Status)}
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
          color={getPriorityColor(params.value as Priority)}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEdit(params.row)} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(params.row.id)} size="small">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={refetch}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 2 }}>
        <CardHeader
          title={title}
          subtitle={subtitle}
          action={
            <Box display="flex" gap={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={refetch}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              {enableExport && (
                <Button 
                  variant="outlined" 
                  onClick={handleExport}
                  size="small"
                >
                  Export
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
              >
                Add New
              </Button>
            </Box>
          }
        />
      </Card>

      {/* Filters */}
      {(enableSearch || enableFilters) && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              {enableSearch && (
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon color="action" />
                    }}
                  />
                </Grid>
              )}
              {enableFilters && (
                <>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="archived">Archived</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={priorityFilter}
                        label="Priority"
                        onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="critical">Critical</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardContent>
          <DataGrid
            rows={data}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: pageSize, page: 0 }
              }
            }}
            pageSizeOptions={[5, 10, 20, 50]}
            checkboxSelection
            disableRowSelectionOnClick
            autoHeight
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Item' : 'Create New Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Status }))}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.metadata.priority}
                  label="Priority"
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, priority: e.target.value as Priority }
                  }))}
                >
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StandardizedComponent;