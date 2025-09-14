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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import {
  Dashboard,
  ModelTraining,
  Assessment,
  Timeline,
  TrendingUp,
  PlayArrow,
  Stop,
  Delete,
  Visibility,
  Download,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Experiment {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'stopped';
  startTime: Date;
  endTime?: Date;
  bestScore: number;
  bestModel: string;
  totalModels: number;
  config: any;
}

interface Model {
  id: string;
  name: string;
  algorithm: string;
  score: number;
  trainingTime: number;
  status: 'active' | 'archived' | 'failed';
  createdAt: Date;
  size: number;
}

const ExperimentsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [showExperimentDialog, setShowExperimentDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiments();
    loadModels();
  }, []);

  const loadExperiments = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockExperiments: Experiment[] = [
        {
          id: 'exp_001',
          name: 'Security Threat Detection v1',
          status: 'completed',
          startTime: new Date(Date.now() - 3600000),
          endTime: new Date(Date.now() - 1800000),
          bestScore: 0.95,
          bestModel: 'XGBoost Classifier',
          totalModels: 12,
          config: { taskType: 'classification', timeBudget: 300 },
        },
        {
          id: 'exp_002',
          name: 'Anomaly Detection Pipeline',
          status: 'running',
          startTime: new Date(Date.now() - 600000),
          bestScore: 0.87,
          bestModel: 'Isolation Forest',
          totalModels: 8,
          config: { taskType: 'anomaly_detection', timeBudget: 600 },
        },
        {
          id: 'exp_003',
          name: 'Network Traffic Analysis',
          status: 'failed',
          startTime: new Date(Date.now() - 7200000),
          endTime: new Date(Date.now() - 7100000),
          bestScore: 0.0,
          bestModel: '',
          totalModels: 0,
          config: { taskType: 'classification', timeBudget: 300 },
        },
      ];
      setExperiments(mockExperiments);
    } catch (error) {
      console.error('Failed to load experiments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async () => {
    try {
      const mockModels: Model[] = [
        {
          id: 'model_001',
          name: 'XGBoost Security Classifier',
          algorithm: 'XGBoost',
          score: 0.95,
          trainingTime: 45,
          status: 'active',
          createdAt: new Date(Date.now() - 3600000),
          size: 2457600, // bytes
        },
        {
          id: 'model_002',
          name: 'Random Forest Anomaly Detector',
          algorithm: 'Random Forest',
          score: 0.87,
          trainingTime: 32,
          status: 'active',
          createdAt: new Date(Date.now() - 7200000),
          size: 1894400,
        },
        {
          id: 'model_003',
          name: 'Neural Network Classifier',
          algorithm: 'Neural Network',
          score: 0.92,
          trainingTime: 120,
          status: 'archived',
          createdAt: new Date(Date.now() - 86400000),
          size: 5678900,
        },
      ];
      setModels(mockModels);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'primary';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'stopped': return 'warning';
      case 'active': return 'success';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <PlayArrow />;
      case 'completed': return <Assessment />;
      case 'failed': return <Stop />;
      default: return <Timeline />;
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const duration = Math.floor((endTime.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderExperimentCard = (experiment: Experiment) => (
    <Card key={experiment.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6">{experiment.name}</Typography>
          <Chip
            icon={getStatusIcon(experiment.status)}
            label={experiment.status.toUpperCase()}
            color={getStatusColor(experiment.status) as any}
            size="small"
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Best Score
            </Typography>
            <Typography variant="h6" color="primary">
              {(experiment.bestScore * 100).toFixed(1)}%
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Best Model
            </Typography>
            <Typography variant="body2">
              {experiment.bestModel || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Duration
            </Typography>
            <Typography variant="body2">
              {formatDuration(experiment.startTime, experiment.endTime)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Models Trained
            </Typography>
            <Typography variant="body2">
              {experiment.totalModels}
            </Typography>
          </Grid>
        </Grid>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Started: {experiment.startTime.toLocaleString()}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => {
          setSelectedExperiment(experiment);
          setShowExperimentDialog(true);
        }}>
          View Details
        </Button>
        <Button size="small" color="primary">
          Deploy Model
        </Button>
        <Button size="small" color="error">
          Delete
        </Button>
      </CardActions>
    </Card>
  );

  const renderModelCard = (model: Model) => (
    <Card key={model.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6">{model.name}</Typography>
          <Chip
            label={model.status.toUpperCase()}
            color={getStatusColor(model.status) as any}
            size="small"
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Algorithm
            </Typography>
            <Typography variant="body2">
              {model.algorithm}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Score
            </Typography>
            <Typography variant="h6" color="primary">
              {(model.score * 100).toFixed(1)}%
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Training Time
            </Typography>
            <Typography variant="body2">
              {model.trainingTime}s
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Size
            </Typography>
            <Typography variant="body2">
              {formatFileSize(model.size)}
            </Typography>
          </Grid>
        </Grid>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Created: {model.createdAt.toLocaleString()}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" startIcon={<Visibility />}>
          View
        </Button>
        <Button size="small" startIcon={<Download />}>
          Download
        </Button>
        <Button size="small" color="primary">
          Deploy
        </Button>
        <Button size="small" color="error" startIcon={<Delete />}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Loading Experiments & Models...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Dashboard />
        Experiments & Models
      </Typography>

      <Grid container spacing={3}>
        {/* Experiments Section */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Experiments
            </Typography>
            {experiments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No experiments found. Start your first AutoML experiment!
              </Typography>
            ) : (
              experiments.map(renderExperimentCard)
            )}
          </Paper>
        </Grid>

        {/* Models Section */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Trained Models
            </Typography>
            {models.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No models found. Train your first model!
              </Typography>
            ) : (
              models.map(renderModelCard)
            )}
          </Paper>
        </Grid>

        {/* Performance Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={experiments.filter(e => e.status === 'completed')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="bestScore"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Best Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={models}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="algorithm" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" fill="#82ca9d" name="Model Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Experiment Details Dialog */}
      <Dialog
        open={showExperimentDialog}
        onClose={() => setShowExperimentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Experiment Details: {selectedExperiment?.name}
        </DialogTitle>
        <DialogContent>
          {selectedExperiment && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedExperiment.status)}
                    label={selectedExperiment.status.toUpperCase()}
                    color={getStatusColor(selectedExperiment.status) as any}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {formatDuration(selectedExperiment.startTime, selectedExperiment.endTime)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Best Score
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {(selectedExperiment.bestScore * 100).toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Models Trained
                  </Typography>
                  <Typography variant="body1">
                    {selectedExperiment.totalModels}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Configuration
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                    {JSON.stringify(selectedExperiment.config, null, 2)}
                  </pre>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExperimentDialog(false)}>Close</Button>
          <Button variant="contained" color="primary">
            Deploy Best Model
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExperimentsPage;