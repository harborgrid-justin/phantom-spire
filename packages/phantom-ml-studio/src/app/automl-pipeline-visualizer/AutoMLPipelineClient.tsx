'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  LinearProgress,
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
  Stepper,
  Step,
  StepLabel,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Settings,
  TrendingUp,
  Assessment,
  Memory,
  Speed
} from '@mui/icons-material';

interface Pipeline {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'pending';
  progress: number;
  currentStep: string;
  algorithm: string;
  accuracy: number;
  startTime: Date;
  estimatedTime: number;
  datasetId: string;
}

interface PipelineStep {
  id: string;
  name: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  duration: number;
  metrics?: Record<string, number>;
}

interface AlgorithmPerformance {
  algorithm: string;
  accuracy: number;
  f1Score: number;
  precision: number;
  recall: number;
  trainingTime: number;
  status: 'completed' | 'running' | 'failed';
}

export default function AutoMLPipelineClient() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [algorithmPerformance, setAlgorithmPerformance] = useState<AlgorithmPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPipelineConfig, setNewPipelineConfig] = useState({
    name: '',
    datasetId: '',
    maxTrainingTime: 60,
    algorithms: [] as string[]
  });

  useEffect(() => {
    fetchPipelines();
    const interval = setInterval(fetchPipelines, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPipelines = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockPipelines: Pipeline[] = [
        {
          id: 'pipeline_1',
          name: 'Customer Churn Prediction',
          status: 'running',
          progress: 65,
          currentStep: 'Feature Engineering',
          algorithm: 'Random Forest',
          accuracy: 0.87,
          startTime: new Date(Date.now() - 1800000), // 30 minutes ago
          estimatedTime: 900000, // 15 minutes
          datasetId: 'dataset_customer_churn'
        },
        {
          id: 'pipeline_2',
          name: 'Fraud Detection Model',
          status: 'completed',
          progress: 100,
          currentStep: 'Model Validation',
          algorithm: 'Gradient Boosting',
          accuracy: 0.94,
          startTime: new Date(Date.now() - 3600000), // 1 hour ago
          estimatedTime: 0,
          datasetId: 'dataset_fraud'
        },
        {
          id: 'pipeline_3',
          name: 'Revenue Forecasting',
          status: 'failed',
          progress: 45,
          currentStep: 'Model Training',
          algorithm: 'XGBoost',
          accuracy: 0.0,
          startTime: new Date(Date.now() - 2400000), // 40 minutes ago
          estimatedTime: 0,
          datasetId: 'dataset_revenue'
        }
      ];

      const mockSteps: PipelineStep[] = [
        { id: 'step_1', name: 'Data Validation', status: 'completed', duration: 30000 },
        { id: 'step_2', name: 'Feature Engineering', status: 'running', duration: 0 },
        { id: 'step_3', name: 'Algorithm Selection', status: 'pending', duration: 0 },
        { id: 'step_4', name: 'Model Training', status: 'pending', duration: 0 },
        { id: 'step_5', name: 'Hyperparameter Tuning', status: 'pending', duration: 0 },
        { id: 'step_6', name: 'Model Validation', status: 'pending', duration: 0 }
      ];

      const mockAlgorithmPerformance: AlgorithmPerformance[] = [
        { algorithm: 'Random Forest', accuracy: 0.87, f1Score: 0.85, precision: 0.88, recall: 0.83, trainingTime: 45000, status: 'completed' },
        { algorithm: 'Gradient Boosting', accuracy: 0.89, f1Score: 0.87, precision: 0.90, recall: 0.85, trainingTime: 62000, status: 'completed' },
        { algorithm: 'XGBoost', accuracy: 0.91, f1Score: 0.89, precision: 0.92, recall: 0.87, trainingTime: 78000, status: 'running' },
        { algorithm: 'Neural Network', accuracy: 0.0, f1Score: 0.0, precision: 0.0, recall: 0.0, trainingTime: 0, status: 'pending' }
      ];

      setPipelines(mockPipelines);
      setPipelineSteps(mockSteps);
      setAlgorithmPerformance(mockAlgorithmPerformance);
      setSelectedPipeline(mockPipelines[0]);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch pipeline data');
      setLoading(false);
    }
  };

  const handlePipelineAction = async (pipelineId: string, action: 'start' | 'pause' | 'stop') => {
    try {
      // Mock API call
      console.log(`${action} pipeline ${pipelineId}`);
      await fetchPipelines();
    } catch (err) {
      setError(`Failed to ${action} pipeline`);
    }
  };

  const handleCreatePipeline = async () => {
    try {
      // Mock API call
      console.log('Creating pipeline:', newPipelineConfig);
      setCreateDialogOpen(false);
      setNewPipelineConfig({ name: '', datasetId: '', maxTrainingTime: 60, algorithms: [] });
      await fetchPipelines();
    } catch (err) {
      setError('Failed to create pipeline');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'primary';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'paused': return 'warning';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
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
          AutoML Pipeline Visualizer
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchPipelines}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Pipeline
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Pipeline Overview */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Pipelines
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Current Step</TableCell>
                      <TableCell>Algorithm</TableCell>
                      <TableCell>Accuracy</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pipelines.map((pipeline) => (
                      <TableRow
                        key={pipeline.id}
                        onClick={() => setSelectedPipeline(pipeline)}
                        sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                      >
                        <TableCell>{pipeline.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={pipeline.status}
                            color={getStatusColor(pipeline.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <LinearProgress
                              variant="determinate"
                              value={pipeline.progress}
                              sx={{ width: 100, mr: 1 }}
                            />
                            <Typography variant="body2">{pipeline.progress}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{pipeline.currentStep}</TableCell>
                        <TableCell>{pipeline.algorithm}</TableCell>
                        <TableCell>
                          {pipeline.accuracy > 0 ? `${(pipeline.accuracy * 100).toFixed(1)}%` : '-'}
                        </TableCell>
                        <TableCell>
                          <Box>
                            {pipeline.status === 'running' && (
                              <>
                                <Button
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePipelineAction(pipeline.id, 'pause');
                                  }}
                                >
                                  <Pause />
                                </Button>
                                <Button
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePipelineAction(pipeline.id, 'stop');
                                  }}
                                >
                                  <Stop />
                                </Button>
                              </>
                            )}
                            {pipeline.status === 'paused' && (
                              <Button
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePipelineAction(pipeline.id, 'start');
                                }}
                              >
                                <PlayArrow />
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Pipeline Details */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pipeline Details
              </Typography>
              {selectedPipeline ? (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    {selectedPipeline.name}
                  </Typography>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Status: <Chip label={selectedPipeline.status} color={getStatusColor(selectedPipeline.status) as any} size="small" />
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Started: {selectedPipeline.startTime.toLocaleString()}
                    </Typography>
                  </Box>
                  {selectedPipeline.estimatedTime > 0 && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Est. Remaining: {formatDuration(selectedPipeline.estimatedTime)}
                      </Typography>
                    </Box>
                  )}
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Dataset: {selectedPipeline.datasetId}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Select a pipeline to view details
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pipeline Steps */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pipeline Steps
              </Typography>
              <Stepper orientation="vertical">
                {pipelineSteps.map((step, index) => (
                  <Step key={step.id} active={step.status === 'running'} completed={step.status === 'completed'}>
                    <StepLabel
                      error={step.status === 'failed'}
                      StepIconProps={{
                        sx: {
                          color: step.status === 'running' ? 'primary.main' :
                                step.status === 'completed' ? 'success.main' :
                                step.status === 'failed' ? 'error.main' : 'grey.300'
                        }
                      }}
                    >
                      <Box>
                        <Typography variant="body1">{step.name}</Typography>
                        {step.duration > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            Duration: {formatDuration(step.duration)}
                          </Typography>
                        )}
                        {step.status === 'running' && (
                          <LinearProgress sx={{ mt: 1, width: 200 }} />
                        )}
                      </Box>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* Algorithm Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Algorithm Performance
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Algorithm</TableCell>
                      <TableCell>Accuracy</TableCell>
                      <TableCell>F1 Score</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {algorithmPerformance.map((algo) => (
                      <TableRow key={algo.algorithm}>
                        <TableCell>{algo.algorithm}</TableCell>
                        <TableCell>
                          {algo.accuracy > 0 ? `${(algo.accuracy * 100).toFixed(1)}%` : '-'}
                        </TableCell>
                        <TableCell>
                          {algo.f1Score > 0 ? algo.f1Score.toFixed(3) : '-'}
                        </TableCell>
                        <TableCell>
                          {algo.trainingTime > 0 ? formatDuration(algo.trainingTime) : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={algo.status}
                            color={getStatusColor(algo.status) as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Pipeline Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New AutoML Pipeline</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pipeline Name"
                  value={newPipelineConfig.name}
                  onChange={(e) => setNewPipelineConfig({ ...newPipelineConfig, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Dataset</InputLabel>
                  <Select
                    value={newPipelineConfig.datasetId}
                    onChange={(e) => setNewPipelineConfig({ ...newPipelineConfig, datasetId: e.target.value })}
                  >
                    <MenuItem value="dataset_customer_churn">Customer Churn Dataset</MenuItem>
                    <MenuItem value="dataset_fraud">Fraud Detection Dataset</MenuItem>
                    <MenuItem value="dataset_revenue">Revenue Forecasting Dataset</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Training Time (minutes)"
                  type="number"
                  value={newPipelineConfig.maxTrainingTime}
                  onChange={(e) => setNewPipelineConfig({ ...newPipelineConfig, maxTrainingTime: parseInt(e.target.value) })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreatePipeline}
            disabled={!newPipelineConfig.name || !newPipelineConfig.datasetId}
          >
            Create Pipeline
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}