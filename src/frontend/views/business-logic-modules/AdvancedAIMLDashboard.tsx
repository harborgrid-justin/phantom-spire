/**
 * Advanced AI/ML Integration Engine Dashboard
 * Real-time monitoring and management of AI/ML models and pipelines
 */

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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Tab,
  Avatar,
  Badge
} from '@mui/material';
import {
  Psychology,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  TrendingUp,
  ShowChart,
  Settings,
  CloudUpload,
  Assessment,
  Memory,
  Speed,
  CheckCircle,
  Warning,  Error as ErrorIcon,
  AutoGraph,
  DataUsage,
  ModelTraining
} from '@mui/icons-material';

interface AIMLModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'anomaly_detection' | 'nlp' | 'computer_vision';
  version: string;
  status: 'training' | 'ready' | 'deployed' | 'retired';
  accuracy: number;
  lastTrained: Date;
  predictions: number;
  averageConfidence: number;
}

interface MLPipeline {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'error' | 'completed';
  progress: number;
  stages: number;
  completedStages: number;
  estimatedCompletion: Date;
  lastRun: Date;
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
      id={`aiml-tabpanel-${index}`}
      aria-labelledby={`aiml-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdvancedAIMLDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [models, setModels] = useState<AIMLModel[]>([]);
  const [pipelines, setPipelines] = useState<MLPipeline[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIMLModel | null>(null);
  const [predictionDialogOpen, setPredictionDialogOpen] = useState(false);
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);

  useEffect(() => {
    // Simulate loading AI/ML models
    const mockModels: AIMLModel[] = [
      {
        id: '1',
        name: 'Threat Classification Model',
        type: 'classification',
        version: '1.0.0',
        status: 'deployed',
        accuracy: 0.94,
        lastTrained: new Date(Date.now() - 86400000),
        predictions: 15420,
        averageConfidence: 0.89
      },
      {
        id: '2',
        name: 'Anomaly Detection Engine',
        type: 'anomaly_detection',
        version: '1.2.0',
        status: 'deployed',
        accuracy: 0.89,
        lastTrained: new Date(Date.now() - 172800000),
        predictions: 8945,
        averageConfidence: 0.92
      },
      {
        id: '3',
        name: 'Incident Severity Predictor',
        type: 'regression',
        version: '1.1.0',
        status: 'training',
        accuracy: 0.87,
        lastTrained: new Date(Date.now() - 259200000),
        predictions: 5673,
        averageConfidence: 0.85
      },
      {
        id: '4',
        name: 'Malware Behavior Classifier',
        type: 'classification',
        version: '2.1.0',
        status: 'ready',
        accuracy: 0.96,
        lastTrained: new Date(Date.now() - 43200000),
        predictions: 12890,
        averageConfidence: 0.93
      }
    ];

    const mockPipelines: MLPipeline[] = [
      {
        id: '1',
        name: 'Threat Intelligence Pipeline',
        status: 'active',
        progress: 75,
        stages: 6,
        completedStages: 4,
        estimatedCompletion: new Date(Date.now() + 1800000),
        lastRun: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        name: 'Behavioral Analysis Pipeline',
        status: 'completed',
        progress: 100,
        stages: 5,
        completedStages: 5,
        estimatedCompletion: new Date(Date.now() - 300000),
        lastRun: new Date(Date.now() - 7200000)
      },
      {
        id: '3',
        name: 'Real-time Scoring Pipeline',
        status: 'paused',
        progress: 45,
        stages: 4,
        completedStages: 2,
        estimatedCompletion: new Date(Date.now() + 3600000),
        lastRun: new Date(Date.now() - 10800000)
      }
    ];

    setModels(mockModels);
    setPipelines(mockPipelines);
  }, []);

  const getStatusChip = (status: string) => {
    const configs = {
      deployed: { color: 'success' as const, icon: <CheckCircle /> },
      training: { color: 'warning' as const, icon: <ModelTraining /> },
      ready: { color: 'info' as const, icon: <Psychology /> },
      retired: { color: 'default' as const, icon: <Stop /> },
      active: { color: 'success' as const, icon: <PlayArrow /> },
      paused: { color: 'warning' as const, icon: <Pause /> },
      error: { color: 'error' as const, icon: <ErrorIcon /> },
      completed: { color: 'success' as const, icon: <CheckCircle /> }
    };
    const config = configs[status as keyof typeof configs] || configs.ready;
    return (
      <Chip
        label={status.toUpperCase()}
        color={config.color}
        size="small"
        icon={config.icon}
      />
    );
  };

  const formatAccuracy = (accuracy: number) => `${(accuracy * 100).toFixed(1)}%`;
  const formatDate = (date: Date) => date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <Psychology />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Advanced AI/ML Integration Engine
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Intelligent automation and machine learning integration platform
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Psychology />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {models.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Models
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <DataUsage />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {pipelines.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ML Pipelines
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {models.reduce((sum, m) => sum + m.predictions, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Predictions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Assessment />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {formatAccuracy(models.reduce((sum, m) => sum + m.accuracy, 0) / models.length)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg. Accuracy
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Models" icon={<Psychology />} />
          <Tab label="Pipelines" icon={<DataUsage />} />
          <Tab label="Predictions" icon={<AutoGraph />} />
          <Tab label="Performance" icon={<ShowChart />} />
        </Tabs>
      </Paper>

      {/* Models Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'between', mb: 2 }}>
          <Typography variant="h6">AI/ML Models</Typography>
          <Button variant="contained" startIcon={<CloudUpload />} onClick={() => setTrainingDialogOpen(true)}>
            Train New Model
          </Button>
        </Box>
        
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Model Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Accuracy</TableCell>
                <TableCell>Predictions</TableCell>
                <TableCell>Last Trained</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Psychology color="primary" />
                      <Typography fontWeight="medium">{model.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={model.type.replace('_', ' ')} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{model.version}</TableCell>
                  <TableCell>{getStatusChip(model.status)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>{formatAccuracy(model.accuracy)}</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={model.accuracy * 100} 
                        sx={{ width: 50, height: 4 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{model.predictions.toLocaleString()}</TableCell>
                  <TableCell>{formatDate(model.lastTrained)}</TableCell>
                  <TableCell>
                    <Tooltip title="Make Prediction">
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSelectedModel(model);
                          setPredictionDialogOpen(true);
                        }}
                      >
                        <PlayArrow />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Model Settings">
                      <IconButton size="small">
                        <Settings />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Pipelines Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" sx={{ mb: 2 }}>ML Pipelines</Typography>
        
        <Grid container spacing={3}>
          {pipelines.map((pipeline) => (
            <Grid item xs={12} md={6} lg={4} key={pipeline.id}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" noWrap>{pipeline.name}</Typography>
                    {getStatusChip(pipeline.status)}
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="body2">{pipeline.progress}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={pipeline.progress} />
                  </Box>

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Stages: {pipeline.completedStages}/{pipeline.stages}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Last Run: {formatDate(pipeline.lastRun)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<PlayArrow />}>
                    Run
                  </Button>
                  <Button size="small" startIcon={<Settings />}>
                    Configure
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Predictions Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" sx={{ mb: 2 }}>Prediction History</Typography>
        <Typography variant="body2" color="textSecondary">
          Recent prediction results and performance metrics will be displayed here.
        </Typography>
      </TabPanel>

      {/* Performance Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" sx={{ mb: 2 }}>Performance Metrics</Typography>
        <Typography variant="body2" color="textSecondary">
          Model performance analytics and system resource utilization will be displayed here.
        </Typography>
      </TabPanel>

      {/* Prediction Dialog */}
      <Dialog open={predictionDialogOpen} onClose={() => setPredictionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Make Prediction - {selectedModel?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Input Data (JSON)"
              placeholder='{"feature1": "value1", "feature2": "value2"}'
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Confidence Threshold"
              defaultValue={0.7}
              inputProps={{ min: 0, max: 1, step: 0.1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPredictionDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<PlayArrow />}>
            Make Prediction
          </Button>
        </DialogActions>
      </Dialog>

      {/* Training Dialog */}
      <Dialog open={trainingDialogOpen} onClose={() => setTrainingDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Train New Model</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField fullWidth label="Model Name" sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Model Type</InputLabel>
              <Select defaultValue="">
                <MenuItem value="classification">Classification</MenuItem>
                <MenuItem value="regression">Regression</MenuItem>
                <MenuItem value="anomaly_detection">Anomaly Detection</MenuItem>
                <MenuItem value="nlp">Natural Language Processing</MenuItem>
                <MenuItem value="computer_vision">Computer Vision</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Training Data Source"
              placeholder="Specify data source or upload path"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrainingDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<ModelTraining />}>
            Start Training
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedAIMLDashboard;