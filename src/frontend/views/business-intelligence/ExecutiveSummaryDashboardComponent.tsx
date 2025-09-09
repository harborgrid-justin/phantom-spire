/**
 * Executive Summary Dashboard Component
 * Advanced executive summary dashboard reporting and analytics interface
 */

import React, { useState, useEffect } from 'react';
import { Status, Priority } from '../../types/index';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

interface ExecutiveSummaryDashboardData {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  metadata?: {
    category: string;
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ExecutiveSummaryDashboardComponent: React.FC = () => {
  const [data, setData] = useState<ExecutiveSummaryDashboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ExecutiveSummaryDashboardData | null>(null);
    const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: 'active' | 'pending' | 'completed' | 'archived';
    metadata: {
      category: string;
      tags: string[];
      priority: 'low' | 'medium' | 'high' | 'critical';
    };
  }>({
    title: '',
    description: '',
    status: 'active',
    metadata: {
      category: 'advanced-analytics',
      tags: ['advanced-analytics', 'analytics'],
      priority: 'medium'
    }
  });

  // Mock data for demonstration
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockData: ExecutiveSummaryDashboardData[] = [
          {
            id: '1',
            title: 'Sample Executive Summary Dashboard Report',
            description: 'Comprehensive executive summary dashboard analysis and insights',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: {
              category: 'business-intelligence',
              tags: ['business-intelligence', 'analytics'],
              priority: 'high'
            }
          },
          {
            id: '2',
            title: 'Monthly Executive Summary Dashboard Summary',
            description: 'Monthly overview of executive summary dashboard metrics',
            status: 'pending',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString(),
            metadata: {
              category: 'business-intelligence',
              tags: ['business-intelligence', 'monthly'],
              priority: 'medium'
            }
          }
        ];
        setData(mockData);
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      status: 'active' as Status,
      metadata: {
        category: 'business-intelligence',
        tags: ['business-intelligence', 'analytics'],
        priority: 'medium'
      }
    });
    setOpenDialog(true);
  };

  const handleEdit = (item: ExecutiveSummaryDashboardData) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      status: item.status as Status,
      metadata: item.metadata || {
        category: 'business-intelligence',
        tags: ['business-intelligence', 'analytics'],
        priority: 'medium'
      }
    });
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (editingItem) {
      // Update existing item
      setData(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData, updatedAt: new Date().toISOString() }
          : item
      ));
    } else {
      // Add new item
      const newItem: ExecutiveSummaryDashboardData = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setData(prev => [...prev, newItem]);
    }
    setOpenDialog(false);
  };

  const handleDelete = (id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
  };

  const filteredData = filterStatus 
    ? data.filter(item => item.status === filterStatus)
    : data;

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
      case 'low': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Executive Summary Dashboard
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Executive Summary Dashboard
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" icon={<AssessmentIcon />} />
          <Tab label="Reports" icon={<AnalyticsIcon />} />
          <Tab label="Analytics" icon={<TrendingUpIcon />} />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Reports
                </Typography>
                <Typography variant="h4">
                  {data.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Reports
                </Typography>
                <Typography variant="h4" color="success.main">
                  {data.filter(item => item.status === 'active').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Reports
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {data.filter(item => item.status === 'pending').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completed Reports
                </Typography>
                <Typography variant="h4" color="info.main">
                  {data.filter(item => item.status === 'completed').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 3 }}>
          Welcome to the Executive Summary Dashboard module. This comprehensive dashboard provides 
          advanced reporting and analytics capabilities for executive summary dashboard.
        </Alert>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
          >
            Add New Report
          </Button>
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Filter Status</InputLabel>
            <Select
              value={filterStatus}
              label="Filter Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Refresh Data">
            <IconButton onClick={() => window.location.reload()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export Data">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Chip 
                      label={item.status} 
                      color={getStatusColor(item.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={item.metadata?.priority || 'medium'} 
                      color={getPriorityColor(item.metadata?.priority || 'medium') as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEdit(item)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Average Processing Time
                  </Typography>
                  <Typography variant="h4">2.3s</Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Success Rate
                  </Typography>
                  <Typography variant="h4" color="success.main">98.5%</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Usage Statistics
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Daily Active Users
                  </Typography>
                  <Typography variant="h4">1,234</Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Reports Generated Today
                  </Typography>
                  <Typography variant="h4" color="info.main">567</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Report' : 'Add New Report'}
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
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
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

export default ExecutiveSummaryDashboardComponent;
