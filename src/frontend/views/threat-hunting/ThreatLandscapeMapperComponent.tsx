import React, { useState, useEffect } from 'react';
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

interface ThreatLandscapeMapperData {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

interface ThreatLandscapeMapperProps {
  onRefresh?: () => void;
  onExport?: () => void;
}

const ThreatLandscapeMapper: React.FC<ThreatLandscapeMapperProps> = ({ 
  onRefresh, 
  onExport 
}) => {
  const [data, setData] = useState<ThreatLandscapeMapperData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ThreatLandscapeMapperData | null>(null);

  // Mock data for demonstration
  const mockData: ThreatLandscapeMapperData[] = [
    {
      id: '1',
      name: 'Sample threat hunting Item 1',
      status: 'active',
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: { category: 'threat-hunting', tags: ['secops', 'security'], owner: 'Security Team' }
    },
    {
      id: '2',
      name: 'Sample threat hunting Item 2',
      status: 'pending',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: { category: 'threat-hunting', tags: ['security', 'monitoring'], owner: 'SOC Team' }
    },
    {
      id: '3',
      name: 'Sample threat hunting Item 3',
      status: 'completed',
      priority: 'low',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: { category: 'threat-hunting', tags: ['compliance', 'audit'], owner: 'Compliance Team' }
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
        setError('Failed to fetch threat hunting data');
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
    console.log('Exporting threat-hunting data...');
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
          Threat Landscape Mapper
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
               
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 }
          }
        }}
        pageSizeOptions={[10, 25, 50]}
                checkboxSelection
                disableRowSelectionOnClick
              
      />
            </Box>
          )}
          
          {selectedTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                threat hunting Analytics
              </Typography>
              <Typography color="textSecondary">
                Analytics and metrics for threat hunting operations will be displayed here.
              </Typography>
            </Box>
          )}
          
          {selectedTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Configuration Settings
              </Typography>
              <Typography color="textSecondary">
                Configuration options for threat hunting settings will be displayed here.
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
        <DialogTitle>Add New threat hunting Item</DialogTitle>
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

export default ThreatLandscapeMapper;
