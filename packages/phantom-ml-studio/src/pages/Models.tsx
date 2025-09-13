import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Alert,
  LinearProgress,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  ModelTraining,
  MoreVert,
  Download,
  Delete,
  PlayArrow,
  Compare,
  Assessment,
  Timeline,
  Memory,
  Speed,
  CheckCircle,
  Error,
  Warning,
  Info,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface Model {
  id: string;
  name: string;
  algorithm: string;
  status: 'trained' | 'training' | 'failed' | 'deployed';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingTime: number;
  createdAt: Date;
  lastUsed: Date;
  size: number; // in MB
  version: string;
  tags: string[];
  experimentId: string;
}

interface ModelComparison {
  models: string[];
  metrics: {
    accuracy: number[];
    precision: number[];
    recall: number[];
    f1Score: number[];
  };
}

const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ModelComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [filterAlgorithm, setFilterAlgorithm] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockModels: Model[] = [
        {
          id: '1',
          name: 'Security Threat Classifier v2.1',
          algorithm: 'XGBoost',
          status: 'deployed',
          accuracy: 0.952,
          precision: 0.948,
          recall: 0.941,
          f1Score: 0.944,
          trainingTime: 45,
          createdAt: new Date(Date.now() - 86400000),
          lastUsed: new Date(Date.now() - 3600000),
          size: 25.3,
          version: '2.1.0',
          tags: ['security', 'threat-detection', 'production'],
          experimentId: 'exp-001',
        },
        {
          id: '2',
          name: 'Anomaly Detection Model',
          algorithm: 'Isolation Forest',
          status: 'trained',
          accuracy: 0.887,
          precision: 0.892,
          recall: 0.876,
          f1Score: 0.884,
          trainingTime: 28,
          createdAt: new Date(Date.now() - 172800000),
          lastUsed: new Date(Date.now() - 7200000),
          size: 12.8,
          version: '1.0.0',
          tags: ['anomaly', 'network-traffic'],
          experimentId: 'exp-002',
        },
        {
          id: '3',
          name: 'Risk Assessment Predictor',
          algorithm: 'Random Forest',
          status: 'training',
          accuracy: 0.0,
          precision: 0.0,
          recall: 0.0,
          f1Score: 0.0,
          trainingTime: 0,
          createdAt: new Date(),
          lastUsed: new Date(),
          size: 0,
          version: '1.0.0',
          tags: ['risk', 'assessment'],
          experimentId: 'exp-003',
        },
        {
          id: '4',
          name: 'Malware Classification Model',
          algorithm: 'Neural Network',
          status: 'failed',
          accuracy: 0.0,
          precision: 0.0,
          recall: 0.0,
          f1Score: 0.0,
          trainingTime: 120,
          createdAt: new Date(Date.now() - 259200000),
          lastUsed: new Date(Date.now() - 259200000),
          size: 0,
          version: '1.0.0',
          tags: ['malware', 'classification'],
          experimentId: 'exp-004',
        },
      ];

      setModels(mockModels);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, model: Model) => {
    setAnchorEl(event.currentTarget);
    setSelectedModel(model);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedModel(null);
  };

  const handleDeleteModel = async () => {
    if (!selectedModel) return;

    try {
      // Mock API call
      setModels(models.filter(m => m.id !== selectedModel.id));
      setDeleteDialogOpen(false);
      handleMenuClose();
    } catch (error) {
      console.error('Failed to delete model:', error);
    }
  };

  const handleDeployModel = async () => {
    if (!selectedModel) return;

    try {
      // Mock API call
      setModels(models.map(m =>
        m.id === selectedModel.id ? { ...m, status: 'deployed' as const } : m
      ));
      setDeployDialogOpen(false);
      handleMenuClose();
    } catch (error) {
      console.error('Failed to deploy model:', error);
    }
  };

  const handleDownloadModel = async (model: Model) => {
    try {
      // Mock download
      const blob = new Blob(['Mock model data'], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${model.name.replace(/\s+/g, '_')}.model`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download model:', error);
    }
  };

  const handleCompareModels = () => {
    if (selectedModels.length < 2) {
      alert('Please select at least 2 models to compare');
      return;
    }

    const selectedModelData = models.filter(m => selectedModels.includes(m.id));
    const comparison: ModelComparison = {
      models: selectedModelData.map(m => m.name),
      metrics: {
        accuracy: selectedModelData.map(m => m.accuracy),
        precision: selectedModelData.map(m => m.precision),
        recall: selectedModelData.map(m => m.recall),
        f1Score: selectedModelData.map(m => m.f1Score),
      },
    };

    setComparisonData(comparison);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'trained': return <CheckCircle color="success" />;
      case 'training': return <PlayArrow color="primary" />;
      case 'deployed': return <CheckCircle color="success" />;
      case 'failed': return <Error color="error" />;
      default: return <Info color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trained': return 'success';
      case 'training': return 'primary';
      case 'deployed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const filteredModels = models.filter(model => {
    const matchesAlgorithm = filterAlgorithm === 'all' || model.algorithm === filterAlgorithm;
    const matchesStatus = filterStatus === 'all' || model.status === filterStatus;
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.algorithm.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesAlgorithm && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Loading Models...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ModelTraining />
        Models
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Manage and monitor your trained machine learning models
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Search Models"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, algorithm, or tags..."
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Algorithm</InputLabel>
            <Select
              value={filterAlgorithm}
              label="Algorithm"
              onChange={(e: SelectChangeEvent) => setFilterAlgorithm(e.target.value)}
            >
              <MenuItem value="all">All Algorithms</MenuItem>
              <MenuItem value="XGBoost">XGBoost</MenuItem>
              <MenuItem value="Random Forest">Random Forest</MenuItem>
              <MenuItem value="Neural Network">Neural Network</MenuItem>
              <MenuItem value="Isolation Forest">Isolation Forest</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e: SelectChangeEvent) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="trained">Trained</MenuItem>
              <MenuItem value="training">Training</MenuItem>
              <MenuItem value="deployed">Deployed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Model Comparison */}
      {selectedModels.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            {selectedModels.length} model{selectedModels.length > 1 ? 's' : ''} selected for comparison
          </Alert>
          <Button
            variant="contained"
            startIcon={<Compare />}
            onClick={handleCompareModels}
            disabled={selectedModels.length < 2}
          >
            Compare Selected Models
          </Button>
        </Box>
      )}

      {/* Comparison Chart */}
      {comparisonData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Model Comparison
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={comparisonData.models.map((name, index) => ({
                  name: name.length > 20 ? name.substring(0, 20) + '...' : name,
                  accuracy: comparisonData.metrics.accuracy[index],
                  precision: comparisonData.metrics.precision[index],
                  recall: comparisonData.metrics.recall[index],
                  f1Score: comparisonData.metrics.f1Score[index],
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 1]} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="accuracy" fill="#8884d8" name="Accuracy" />
                  <Bar dataKey="precision" fill="#82ca9d" name="Precision" />
                  <Bar dataKey="recall" fill="#ffc658" name="Recall" />
                  <Bar dataKey="f1Score" fill="#ff7300" name="F1 Score" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
          <CardActions>
            <Button onClick={() => setComparisonData(null)}>Close Comparison</Button>
          </CardActions>
        </Card>
      )}

      {/* Models Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedModels(filteredModels.map(m => m.id));
                    } else {
                      setSelectedModels([]);
                    }
                  }}
                  checked={selectedModels.length === filteredModels.length && filteredModels.length > 0}
                />
              </TableCell>
              <TableCell>Model Name</TableCell>
              <TableCell>Algorithm</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Accuracy</TableCell>
              <TableCell align="right">Precision</TableCell>
              <TableCell align="right">Recall</TableCell>
              <TableCell align="right">F1 Score</TableCell>
              <TableCell align="right">Size (MB)</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredModels.map((model) => (
              <TableRow key={model.id} hover>
                <TableCell padding="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(model.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedModels([...selectedModels, model.id]);
                      } else {
                        setSelectedModels(selectedModels.filter(id => id !== model.id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                      <ModelTraining fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {model.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        v{model.version}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{model.algorithm}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(model.status)}
                    <Chip
                      size="small"
                      label={model.status.toUpperCase()}
                      color={getStatusColor(model.status) as any}
                    />
                  </Box>
                </TableCell>
                <TableCell align="right">
                  {model.status === 'trained' || model.status === 'deployed'
                    ? `${(model.accuracy * 100).toFixed(1)}%`
                    : '-'
                  }
                </TableCell>
                <TableCell align="right">
                  {model.status === 'trained' || model.status === 'deployed'
                    ? `${(model.precision * 100).toFixed(1)}%`
                    : '-'
                  }
                </TableCell>
                <TableCell align="right">
                  {model.status === 'trained' || model.status === 'deployed'
                    ? `${(model.recall * 100).toFixed(1)}%`
                    : '-'
                  }
                </TableCell>
                <TableCell align="right">
                  {model.status === 'trained' || model.status === 'deployed'
                    ? `${(model.f1Score * 100).toFixed(1)}%`
                    : '-'
                  }
                </TableCell>
                <TableCell align="right">
                  {model.status === 'trained' || model.status === 'deployed'
                    ? model.size.toFixed(1)
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {model.createdAt.toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {model.createdAt.toLocaleTimeString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => handleMenuClick(e, model)}
                    size="small"
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedModel && handleDownloadModel(selectedModel)}>
          <Download fontSize="small" sx={{ mr: 1 }} />
          Download
        </MenuItem>
        {selectedModel?.status === 'trained' && (
          <MenuItem onClick={() => setDeployDialogOpen(true)}>
            <PlayArrow fontSize="small" sx={{ mr: 1 }} />
            Deploy
          </MenuItem>
        )}
        <MenuItem onClick={() => setDeleteDialogOpen(true)}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Model</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedModel?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteModel} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deploy Confirmation Dialog */}
      <Dialog open={deployDialogOpen} onClose={() => setDeployDialogOpen(false)}>
        <DialogTitle>Deploy Model</DialogTitle>
        <DialogContent>
          <Typography>
            Deploy "{selectedModel?.name}" to production? This will make the model available for predictions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeployDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeployModel} color="primary" variant="contained">
            Deploy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModelsPage;