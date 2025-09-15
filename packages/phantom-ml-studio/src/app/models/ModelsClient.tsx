'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
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
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Badge,
  Avatar,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Refresh,
  MoreVert,
  Star,
  StarBorder,
  Download,
  Share,
  Delete,
  Edit,
  Visibility,
  CloudUpload,
  Assessment,
  Memory,
  Speed,
  Security,
  TrendingUp,
  CheckCircle,
  Warning,
  Error,
  Info
} from '@mui/icons-material';

interface Model {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'anomaly_detection' | 'nlp' | 'computer_vision';
  algorithm: string;
  version: string;
  status: 'training' | 'ready' | 'deployed' | 'archived' | 'failed';
  accuracy: number;
  f1Score: number;
  precision: number;
  recall: number;
  size: string;
  framework: string;
  createdAt: Date;
  lastTrained: Date;
  deployments: number;
  predictions: number;
  starred: boolean;
  tags: string[];
  creator: string;
  description: string;
  performanceScore: number;
  securityScore: number;
  features: string[];
}

interface ModelMetrics {
  totalModels: number;
  readyModels: number;
  deployedModels: number;
  trainingModels: number;
  averageAccuracy: number;
  totalPredictions: number;
}

export default function ModelsClient() {
  const [activeTab, setActiveTab] = useState(0);
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    fetchModels();
    fetchMetrics();
  }, []);

  useEffect(() => {
    filterAndSortModels();
  }, [models, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  const fetchModels = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockModels: Model[] = [
        {
          id: 'model_1',
          name: 'Customer Churn Predictor',
          type: 'classification',
          algorithm: 'Random Forest',
          version: '1.2.3',
          status: 'deployed',
          accuracy: 0.924,
          f1Score: 0.891,
          precision: 0.912,
          recall: 0.878,
          size: '15.2 MB',
          framework: 'phantom-ml-core',
          createdAt: new Date('2024-01-15T10:30:00Z'),
          lastTrained: new Date('2024-01-15T10:30:00Z'),
          deployments: 3,
          predictions: 125000,
          starred: true,
          tags: ['customer', 'churn', 'production'],
          creator: 'Alice Johnson',
          description: 'Predicts customer churn probability based on usage patterns and demographics',
          performanceScore: 87,
          securityScore: 95,
          features: ['usage_frequency', 'account_age', 'support_tickets', 'billing_amount']
        },
        {
          id: 'model_2',
          name: 'Fraud Detection Engine',
          type: 'anomaly_detection',
          algorithm: 'Isolation Forest',
          version: '2.1.0',
          status: 'ready',
          accuracy: 0.956,
          f1Score: 0.941,
          precision: 0.951,
          recall: 0.932,
          size: '42.1 MB',
          framework: 'phantom-ml-core',
          createdAt: new Date('2024-01-13T09:15:00Z'),
          lastTrained: new Date('2024-01-13T09:15:00Z'),
          deployments: 0,
          predictions: 0,
          starred: true,
          tags: ['fraud', 'security', 'finance'],
          creator: 'Bob Smith',
          description: 'Real-time fraud detection for financial transactions',
          performanceScore: 98,
          securityScore: 92,
          features: ['transaction_amount', 'merchant_category', 'location', 'time_of_day']
        },
        {
          id: 'model_3',
          name: 'Revenue Forecasting',
          type: 'regression',
          algorithm: 'XGBoost',
          version: '1.0.1',
          status: 'training',
          accuracy: 0.0,
          f1Score: 0.0,
          precision: 0.0,
          recall: 0.0,
          size: '0 MB',
          framework: 'phantom-ml-core',
          createdAt: new Date('2024-01-16T14:20:00Z'),
          lastTrained: new Date('2024-01-16T14:20:00Z'),
          deployments: 0,
          predictions: 0,
          starred: false,
          tags: ['revenue', 'forecasting', 'finance'],
          creator: 'Carol Davis',
          description: 'Quarterly revenue forecasting model',
          performanceScore: 0,
          securityScore: 85,
          features: ['historical_revenue', 'market_conditions', 'seasonal_factors']
        },
        {
          id: 'model_4',
          name: 'Sentiment Analysis API',
          type: 'nlp',
          algorithm: 'BERT',
          version: '3.2.1',
          status: 'deployed',
          accuracy: 0.889,
          f1Score: 0.876,
          precision: 0.883,
          recall: 0.869,
          size: '438 MB',
          framework: 'transformers',
          createdAt: new Date('2024-01-12T11:45:00Z'),
          lastTrained: new Date('2024-01-14T16:30:00Z'),
          deployments: 2,
          predictions: 89000,
          starred: false,
          tags: ['nlp', 'sentiment', 'social'],
          creator: 'David Wilson',
          description: 'Multi-language sentiment analysis for social media content',
          performanceScore: 91,
          securityScore: 88,
          features: ['text_content', 'language', 'source_platform']
        },
        {
          id: 'model_5',
          name: 'Image Classification',
          type: 'computer_vision',
          algorithm: 'ResNet-50',
          version: '1.5.0',
          status: 'failed',
          accuracy: 0.0,
          f1Score: 0.0,
          precision: 0.0,
          recall: 0.0,
          size: '0 MB',
          framework: 'pytorch',
          createdAt: new Date('2024-01-14T08:00:00Z'),
          lastTrained: new Date('2024-01-14T08:00:00Z'),
          deployments: 0,
          predictions: 0,
          starred: false,
          tags: ['cv', 'classification', 'images'],
          creator: 'Eva Brown',
          description: 'Product image classification for e-commerce',
          performanceScore: 0,
          securityScore: 90,
          features: ['image_features', 'color_histogram', 'texture_features']
        }
      ];

      setModels(mockModels);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch models');
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const mockMetrics: ModelMetrics = {
        totalModels: 5,
        readyModels: 1,
        deployedModels: 2,
        trainingModels: 1,
        averageAccuracy: 0.892,
        totalPredictions: 214000
      };

      setMetrics(mockMetrics);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  const filterAndSortModels = () => {
    let filtered = models.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || model.type === filterType;
      const matchesStatus = filterStatus === 'all' || model.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Model];
      let bValue: any = b[sortBy as keyof Model];

      if (sortBy === 'createdAt' || sortBy === 'lastTrained') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredModels(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'success';
      case 'ready': return 'info';
      case 'training': return 'warning';
      case 'failed': return 'error';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <CheckCircle />;
      case 'ready': return <Info />;
      case 'training': return <CircularProgress size={16} />;
      case 'failed': return <Error />;
      default: return <Info />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: any } = {
      'classification': 'primary',
      'regression': 'secondary',
      'clustering': 'success',
      'anomaly_detection': 'warning',
      'nlp': 'info',
      'computer_vision': 'error'
    };
    return colors[type] || 'default';
  };

  const handleStarToggle = async (modelId: string) => {
    try {
      setModels(models.map(model =>
        model.id === modelId ? { ...model, starred: !model.starred } : model
      ));
    } catch (err) {
      setError('Failed to update model');
    }
  };

  const handleModelAction = (action: string, model: Model) => {
    console.log(`${action} model:`, model.id);
    setMenuAnchor(null);
    setSelectedModel(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Model Registry
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Upload Model
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Model
          </Button>
        </Box>
      </Box>

      {/* Metrics Cards */}
      {metrics && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">{metrics.totalModels}</Typography>
                <Typography variant="body2" color="text.secondary">Total Models</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">{metrics.deployedModels}</Typography>
                <Typography variant="body2" color="text.secondary">Deployed</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">{metrics.readyModels}</Typography>
                <Typography variant="body2" color="text.secondary">Ready</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">{metrics.trainingModels}</Typography>
                <Typography variant="body2" color="text.secondary">Training</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary.main">
                  {(metrics.averageAccuracy * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">Avg Accuracy</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="text.primary">
                  {(metrics.totalPredictions / 1000).toFixed(0)}K
                </Typography>
                <Typography variant="body2" color="text.secondary">Predictions</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="classification">Classification</MenuItem>
                  <MenuItem value="regression">Regression</MenuItem>
                  <MenuItem value="clustering">Clustering</MenuItem>
                  <MenuItem value="anomaly_detection">Anomaly Detection</MenuItem>
                  <MenuItem value="nlp">NLP</MenuItem>
                  <MenuItem value="computer_vision">Computer Vision</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="training">Training</MenuItem>
                  <MenuItem value="ready">Ready</MenuItem>
                  <MenuItem value="deployed">Deployed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <MenuItem value="createdAt">Created Date</MenuItem>
                  <MenuItem value="lastTrained">Last Trained</MenuItem>
                  <MenuItem value="accuracy">Accuracy</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="predictions">Predictions</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Order</InputLabel>
                <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}>
                  <MenuItem value="desc">Descending</MenuItem>
                  <MenuItem value="asc">Ascending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Models Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Accuracy</TableCell>
                  <TableCell>Framework</TableCell>
                  <TableCell>Deployments</TableCell>
                  <TableCell>Predictions</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredModels.map((model) => (
                  <TableRow key={model.id} hover>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleStarToggle(model.id)}
                      >
                        {model.starred ? <Star color="warning" /> : <StarBorder />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {model.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          v{model.version} • {model.algorithm}
                        </Typography>
                        <Box mt={0.5}>
                          {model.tags.slice(0, 2).map((tag) => (
                            <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                          ))}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={model.type.replace('_', ' ')}
                        color={getTypeColor(model.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(model.status)}
                        label={model.status}
                        color={getStatusColor(model.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {model.accuracy > 0 ? (
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {(model.accuracy * 100).toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={model.accuracy * 100}
                            sx={{ width: 60, height: 4 }}
                            color={model.accuracy > 0.9 ? 'success' : model.accuracy > 0.8 ? 'primary' : 'warning'}
                          />
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip label={model.framework} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Badge badgeContent={model.deployments} color="primary">
                        <Typography variant="body2">{model.deployments}</Typography>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {model.predictions > 0 ? `${(model.predictions / 1000).toFixed(0)}K` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {model.createdAt.toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setMenuAnchor(e.currentTarget);
                          setSelectedModel(model);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItemComponent onClick={() => handleModelAction('view', selectedModel!)}>
          <ListItemIcon><Visibility /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItemComponent>
        <MenuItemComponent onClick={() => handleModelAction('edit', selectedModel!)}>
          <ListItemIcon><Edit /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItemComponent>
        <MenuItemComponent onClick={() => handleModelAction('download', selectedModel!)}>
          <ListItemIcon><Download /></ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItemComponent>
        <MenuItemComponent onClick={() => handleModelAction('share', selectedModel!)}>
          <ListItemIcon><Share /></ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItemComponent>
        <Divider />
        <MenuItemComponent onClick={() => handleModelAction('delete', selectedModel!)}>
          <ListItemIcon><Delete color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItemComponent>
      </Menu>
    </Box>
  );
}