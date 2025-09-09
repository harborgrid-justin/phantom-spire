/**
 * Chat Support Interface
 * Real-time chat support with customers
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Divider,
  Stack
} from '@mui/material';
import { 
  Refresh,
  Settings,
  TrendingUp,
  CheckCircle,
  Warning,
  Info,
  Add,
  Edit,
  Delete,
  Visibility,
  Download,
  Upload,
  Search,
  FilterList,
  Sort,
  MoreVert,
  Dashboard as DashboardIcon,
  Analytics,
  Support,
  Help,
  ContactSupport
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';
import { Status, Priority } from '../../../types/index';

interface ChatSupportInterfaceData {
  id: string;
  title: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'help-desk';
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

interface ChatSupportInterfaceMetrics {
  totalItems: number;
  activeItems: number;
  completedItems: number;
  averageProcessingTime: number;
  successRate: number;
}

const ChatSupportInterface: React.FC = () => {
  const [data, setData] = useState<ChatSupportInterfaceData[]>([]);
  const [metrics, setMetrics] = useState<ChatSupportInterfaceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ChatSupportInterfaceData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { addNotification } = useServicePage();

  // Add UI/UX evaluation
  useEffect(() => {
    addUIUXEvaluation({
      componentName: 'ChatSupportInterface',
      category: 'help-desk',
      metrics: {
        loadTime: performance.now(),
        interactivityTime: performance.now(),
        renderComplexity: 'medium'
      },
      accessibility: {
        hasAriaLabels: true,
        hasKeyboardNavigation: true,
        colorContrastCompliant: true
      }
    });
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/v1/support/chat-support-interface');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const result = await response.json();
        setData(result.data);
        setMetrics(result.metrics);
        
        addNotification('success', 'Data loaded successfully');
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load data');
        addNotification('error', 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [addNotification]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      
      const response = await fetch('/api/v1/support/chat-support-interface');
      if (!response.ok) {
        throw new Error('Failed to refresh data');
      }
      
      const result = await response.json();
      setData(result.data);
      setMetrics(result.metrics);
      
      addNotification('success', 'Data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      addNotification('error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [addNotification]);

  const handleCreateItem = useCallback(async (itemData: Partial<ChatSupportInterfaceData>) => {
    try {
      const response = await fetch('/api/v1/support/chat-support-interface', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create item');
      }
      
      const newItem = await response.json();
      setData(prevData => [...prevData, newItem]);
      
      addNotification('success', 'Item created successfully');
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to create item:', error);
      addNotification('error', 'Failed to create item');
    }
  }, [addNotification]);

  const handleUpdateItem = useCallback(async (id: string, updates: Partial<ChatSupportInterfaceData>) => {
    try {
      const response = await fetch(`/api/v1/support/chat-support-interface/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      
      const updatedItem = await response.json();
      setData(prevData => 
        prevData.map(item => item.id === id ? updatedItem : item)
      );
      
      addNotification('success', 'Item updated successfully');
    } catch (error) {
      console.error('Failed to update item:', error);
      addNotification('error', 'Failed to update item');
    }
  }, [addNotification]);

  const handleDeleteItem = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/v1/support/chat-support-interface/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      setData(prevData => prevData.filter(item => item.id !== id));
      
      addNotification('success', 'Item deleted successfully');
    } catch (error) {
      console.error('Failed to delete item:', error);
      addNotification('error', 'Failed to delete item');
    }
  }, [addNotification]);

  const filteredData = data.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'archived': return 'default';
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Chat Support Interface
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Real-time chat support with customers
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <DashboardIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{metrics.totalItems}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Items
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Analytics color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{metrics.activeItems}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Items
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <CheckCircle color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{metrics.completedItems}</Typography>
                    <Typography variant="body2" color="text.secondary">
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
                <Box display="flex" alignItems="center">
                  <TrendingUp color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{metrics.successRate.toFixed(1)}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Add New
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status Filter"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Data Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {item.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.status}
                    color={getStatusColor(item.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.priority}
                    color={getPriorityColor(item.priority) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View">
                    <IconButton size="small" onClick={() => setSelectedItem(item)}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => {
                      setSelectedItem(item);
                      setDialogOpen(true);
                    }}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteItem(item.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit Item' : 'Create New Item'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  defaultValue={selectedItem?.title || ''}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    defaultValue={selectedItem?.status || 'pending'}
                    label="Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    defaultValue={selectedItem?.priority || 'medium'}
                    label="Priority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogOpen(false);
            setSelectedItem(null);
          }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => {
            // Handle save logic here
            setDialogOpen(false);
            setSelectedItem(null);
          }}>
            {selectedItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatSupportInterface;
