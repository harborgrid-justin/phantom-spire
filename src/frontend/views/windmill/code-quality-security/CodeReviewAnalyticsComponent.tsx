import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  CircularProgress,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Analytics as AnalyticsIcon,
  GitHub as GitHubIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface CodeReviewAnalyticsComponentProps {
  onNavigate?: (path: string) => void;
}

interface WindmillData {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending' | 'completed';
  type: string;
  category: string;
  created: string;
  updated: string;
  metadata: {
    version: string;
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
}

const CodeReviewAnalyticsComponent: React.FC<CodeReviewAnalyticsComponentProps> = ({ onNavigate }) => {
  const [data, setData] = useState<WindmillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<WindmillData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    status: 'active' as const,
    metadata: {
      version: '1.0.0',
      tags: ['windmill'],
      priority: 'medium' as const
    }
  });
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchData();
    fetchAnalytics();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const mockData: WindmillData[] = [
        {
          id: '1',
          name: 'Production Code Review Analytics',
          status: 'active',
          type: 'windmill-feature',
          category: 'code-quality-security',
          created: new Date('2024-01-01').toISOString(),
          updated: new Date().toISOString(),
          metadata: {
            version: '2.1.0',
            tags: ['windmill', 'production', 'code-quality-security'],
            priority: 'high'
          }
        },
        {
          id: '2',
          name: 'Development Code Review Analytics',
          status: 'pending',
          type: 'windmill-feature',
          category: 'code-quality-security',
          created: new Date('2024-01-15').toISOString(),
          updated: new Date().toISOString(),
          metadata: {
            version: '1.5.0',
            tags: ['windmill', 'development', 'code-quality-security'],
            priority: 'medium'
          }
        }
      ];
      setData(mockData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const mockAnalytics = {
        total: 2,
        byStatus: { active: 1, pending: 1 },
        insights: {
          performance: 'optimized',
          recommendations: ['Enable automated workflows', 'Configure alerts'],
          metrics: {
            efficiency: 0.92,
            reliability: 0.98,
            cost_savings: 0.85
          }
        }
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setFormData({
      name: '',
      status: 'active',
      metadata: {
        version: '1.0.0',
        tags: ['windmill'],
        priority: 'medium'
      }
    });
    setDialogOpen(true);
  };

  const handleEdit = (item: WindmillData) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      status: item.status,
      metadata: item.metadata
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedItem) {
        const updatedData = data.map(item =>
          item.id === selectedItem.id
            ? { ...item, ...formData, updated: new Date().toISOString() }
            : item
        );
        setData(updatedData);
      } else {
        const newItem: WindmillData = {
          id: String(data.length + 1),
          ...formData,
          type: 'windmill-feature',
          category: 'code-quality-security',
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        };
        setData([...data, newItem]);
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setData(data.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'inactive': return 'default';
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

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Code Review Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Code review process analytics and optimization insights
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<AnalyticsIcon />}
            onClick={fetchAnalytics}
            sx={{ mr: 1 }}
          >
            Analytics
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Add New
          </Button>
        </Box>
      </Box>

      {analytics && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">Total Items</Typography>
                <Typography variant="h4">{analytics.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">Efficiency</Typography>
                <Typography variant="h4">
                  {Math.round(analytics.insights.metrics.efficiency * 100)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Version</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.category}
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
                          label={item.metadata.priority}
                          color={getPriorityColor(item.metadata.priority) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.metadata.version}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(item)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(item.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit' : 'Create'} Code Review Analytics
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.metadata.priority}
                  label="Priority"
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, priority: e.target.value as any }
                  })}
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
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleCreate}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default CodeReviewAnalyticsComponent;
