'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useModels, useStarModel } from '../../hooks/useMLCore';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
import Grid from '@mui/material/Grid2';
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
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // React Query hooks
  const { data: models = [], isLoading: loading, error } = useModels({
    refetchInterval: 60000 // 1 minute
  });
  const starModelMutation = useStarModel();

  // Calculate metrics from models data
  const calculatedMetrics = useMemo((): ModelMetrics => {
    if (!models.length) {
      return {
        totalModels: 0,
        readyModels: 0,
        deployedModels: 0,
        trainingModels: 0,
        averageAccuracy: 0,
        totalPredictions: 0
      }
    }

    const readyModels = models.filter(m => m.status === 'ready').length
    const deployedModels = models.filter(m => m.status === 'deployed').length
    const trainingModels = models.filter(m => m.status === 'training').length
    const totalPredictions = models.reduce((sum, m) => sum + (m.predictions || 0), 0)
    const avgAccuracy = models.reduce((sum, m) => sum + (m.accuracy || 0), 0) / models.length

    return {
      totalModels: models.length,
      readyModels,
      deployedModels,
      trainingModels,
      averageAccuracy: avgAccuracy,
      totalPredictions
    }
  }, [models])

  // Use calculated metrics or fallback to state
  const displayMetrics = metrics || calculatedMetrics


  // Memoized filtering and sorting
  const filteredAndSortedModels = useMemo(() => {
    const filtered = models.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || model.type === filterType;
      const matchesStatus = filterStatus === 'all' || model.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });

    return filtered.sort((a, b) => {
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
  }, [models, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'deployed': return 'success';
      case 'ready': return 'info';
      case 'training': return 'warning';
      case 'failed': return 'error';
      case 'archived': return 'default';
      default: return 'default';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'deployed': return <CheckCircle />;
      case 'ready': return <Info />;
      case 'training': return <CircularProgress size={16} />;
      case 'failed': return <Error />;
      default: return <Info />;
    }
  }, []);

  const getTypeColor = useCallback((type: string) => {
    const colors: { [key: string]: any } = {
      'classification': 'primary',
      'regression': 'secondary',
      'clustering': 'success',
      'anomaly_detection': 'warning',
      'nlp': 'info',
      'computer_vision': 'error'
    };
    return colors[type] || 'default';
  }, []);

  const handleStarToggle = useCallback(async (_modelId: string) => {
    const model = models.find(m => m.id === modelId)
    if (!model) return

    starModelMutation.mutate({
      modelId,
      starred: !model.starred
    })
  }, [models, starModelMutation]);

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
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'Failed to load models'}
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
      <Grid container spacing={3} mb={3}>
        <Grid xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{displayMetrics.totalModels}</Typography>
              <Typography variant="body2" color="text.secondary">Total Models</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">{displayMetrics.deployedModels}</Typography>
              <Typography variant="body2" color="text.secondary">Deployed</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">{displayMetrics.readyModels}</Typography>
              <Typography variant="body2" color="text.secondary">Ready</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">{displayMetrics.trainingModels}</Typography>
              <Typography variant="body2" color="text.secondary">Training</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary.main">
                {(displayMetrics.averageAccuracy * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">Avg Accuracy</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="text.primary">
                {(displayMetrics.totalPredictions / 1000).toFixed(0)}K
              </Typography>
              <Typography variant="body2" color="text.secondary">Predictions</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} md={4}>
              <TextField
                fullWidth
                label="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid xs={12} md={2}>
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
            <Grid xs={12} md={2}>
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
            <Grid xs={12} md={2}>
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
            <Grid xs={12} md={2}>
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
      <Card component="section" aria-labelledby="models-table-title">
        <CardContent>
          <Typography
            id="models-table-title"
            variant="h6"
            component="h2"
            className="sr-only"
          >
            Models List
          </Typography>
          <TableContainer>
            <Table aria-label="Machine learning models table">
              <TableHead>
                <TableRow>
                  <TableCell aria-label="Star toggle column"></TableCell>
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
                {filteredAndSortedModels.map((model) => (
                  <TableRow key={model.id} hover>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleStarToggle(model.id)}
                        aria-label={model.starred ? `Remove ${model.name} from favorites` : `Add ${model.name} to favorites`}
                        title={model.starred ? 'Remove from favorites' : 'Add to favorites'}
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
                        color={getStatusColor($1) as 'primary' | 'success' | 'error' | 'warning' | 'default'}
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
                        aria-label={`More actions for ${model.name}`}
                        aria-haspopup="menu"
                        title="More actions"
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
        aria-label={`Actions for ${selectedModel?.name || 'selected model'}`}
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