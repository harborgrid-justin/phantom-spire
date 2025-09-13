import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Play as PlayIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Compare as CompareIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data for experiments
const mockExperiments = [
  {
    id: 1,
    name: 'Threat Detection Model v1',
    status: 'completed',
    accuracy: 0.924,
    f1Score: 0.891,
    auc: 0.956,
    algorithm: 'XGBoost',
    dataset: 'Security Logs 2024',
    createdAt: '2024-01-15T10:30:00Z',
    duration: '12m 34s',
    hyperparameters: { learning_rate: 0.1, max_depth: 6, n_estimators: 100 },
  },
  {
    id: 2,
    name: 'Network Anomaly Detection',
    status: 'running',
    accuracy: 0.0,
    f1Score: 0.0,
    auc: 0.0,
    algorithm: 'Random Forest',
    dataset: 'Network Traffic Analysis',
    createdAt: '2024-01-15T14:45:00Z',
    duration: '8m 12s (running)',
    hyperparameters: { n_estimators: 200, max_depth: 8, min_samples_split: 5 },
  },
  {
    id: 3,
    name: 'Malware Classification',
    status: 'failed',
    accuracy: 0.0,
    f1Score: 0.0,
    auc: 0.0,
    algorithm: 'Neural Network',
    dataset: 'Threat Intelligence Feed',
    createdAt: '2024-01-14T09:15:00Z',
    duration: '2m 45s',
    hyperparameters: { hidden_layers: 3, neurons: 128, dropout: 0.2 },
  },
  {
    id: 4,
    name: 'Phishing URL Detection',
    status: 'scheduled',
    accuracy: 0.0,
    f1Score: 0.0,
    auc: 0.0,
    algorithm: 'SVM',
    dataset: 'URL Analysis Dataset',
    createdAt: '2024-01-15T16:00:00Z',
    duration: 'Not started',
    hyperparameters: { C: 1.0, kernel: 'rbf', gamma: 'scale' },
  },
];

const mockTrainingHistory = [
  { epoch: 1, training_loss: 0.8, validation_loss: 0.75, accuracy: 0.72 },
  { epoch: 2, training_loss: 0.65, validation_loss: 0.62, accuracy: 0.78 },
  { epoch: 3, training_loss: 0.52, validation_loss: 0.48, accuracy: 0.84 },
  { epoch: 4, training_loss: 0.41, validation_loss: 0.38, accuracy: 0.87 },
  { epoch: 5, training_loss: 0.34, validation_loss: 0.31, accuracy: 0.89 },
  { epoch: 6, training_loss: 0.28, validation_loss: 0.26, accuracy: 0.92 },
];

const Experiments: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [newExperimentDialog, setNewExperimentDialog] = useState(false);
  const [compareDialog, setCompareDialog] = useState(false);
  const [selectedExperiments, setSelectedExperiments] = useState<number[]>([]);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'failed': return 'error';
      case 'scheduled': return 'warning';
      default: return 'default';
    }
  };

  const handleViewExperiment = (experiment: any) => {
    setSelectedExperiment(experiment);
    setViewDialog(true);
  };

  const renderExperimentsList = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Experiments
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<CompareIcon />}
              disabled={selectedExperiments.length < 2}
              onClick={() => setCompareDialog(true)}
              sx={{ mr: 1 }}
            >
              Compare ({selectedExperiments.length})
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setNewExperimentDialog(true)}
            >
              New Experiment
            </Button>
          </Box>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                {/* Checkbox header would go here */}
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Algorithm</TableCell>
              <TableCell>Dataset</TableCell>
              <TableCell>Accuracy</TableCell>
              <TableCell>F1 Score</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockExperiments.map((experiment) => (
              <TableRow key={experiment.id}>
                <TableCell padding="checkbox">
                  {/* Checkbox would go here */}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {experiment.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(experiment.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={experiment.status}
                    color={getStatusColor(experiment.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{experiment.algorithm}</TableCell>
                <TableCell>{experiment.dataset}</TableCell>
                <TableCell>
                  {experiment.status === 'completed' ? `${(experiment.accuracy * 100).toFixed(1)}%` : '-'}
                </TableCell>
                <TableCell>
                  {experiment.status === 'completed' ? experiment.f1Score.toFixed(3) : '-'}
                </TableCell>
                <TableCell>{experiment.duration}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewExperiment(experiment)}
                  >
                    <ViewIcon />
                  </IconButton>
                  {experiment.status === 'running' && (
                    <IconButton size="small" color="error">
                      <StopIcon />
                    </IconButton>
                  )}
                  {experiment.status === 'scheduled' && (
                    <IconButton size="small" color="primary">
                      <PlayIcon />
                    </IconButton>
                  )}
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {mockExperiments.some(exp => exp.status === 'running') && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Network Anomaly Detection - Training Progress
            </Typography>
            <LinearProgress variant="determinate" value={65} />
            <Typography variant="caption" color="text.secondary">
              Epoch 13/20 - 65% complete
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderMetrics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Training History - Threat Detection Model v1
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTrainingHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="training_loss" stroke="#ff7300" name="Training Loss" />
                  <Line type="monotone" dataKey="validation_loss" stroke="#387908" name="Validation Loss" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Accuracy Over Time
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTrainingHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="accuracy" stroke="#667eea" name="Accuracy" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Experiment Performance Comparison
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockExperiments.filter(exp => exp.status === 'completed')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#667eea" name="Accuracy" />
                  <Bar dataKey="f1Score" fill="#f093fb" name="F1 Score" />
                  <Bar dataKey="auc" fill="#4facfe" name="AUC" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderLogs = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Experiment Logs
        </Typography>
        <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', color: '#fff', fontFamily: 'monospace' }}>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Typography variant="body2" component="pre">
{`[2024-01-15 14:45:12] INFO: Starting experiment: Network Anomaly Detection
[2024-01-15 14:45:13] INFO: Loading dataset: Network Traffic Analysis (120,000 rows)
[2024-01-15 14:45:15] INFO: Preprocessing data...
[2024-01-15 14:45:16] INFO: Feature engineering completed: 45 features generated
[2024-01-15 14:45:17] INFO: Splitting data: 80% train, 20% test
[2024-01-15 14:45:18] INFO: Training Random Forest model...
[2024-01-15 14:45:20] INFO: Hyperparameters: n_estimators=200, max_depth=8, min_samples_split=5
[2024-01-15 14:46:01] INFO: Epoch 1/20 - Training accuracy: 0.721
[2024-01-15 14:46:42] INFO: Epoch 2/20 - Training accuracy: 0.784
[2024-01-15 14:47:23] INFO: Epoch 3/20 - Training accuracy: 0.832
[2024-01-15 14:48:04] INFO: Epoch 4/20 - Training accuracy: 0.865
[2024-01-15 14:48:45] INFO: Epoch 5/20 - Training accuracy: 0.891
[2024-01-15 14:49:26] INFO: Cross-validation started...
[2024-01-15 14:50:07] INFO: Cross-validation score: 0.887 ± 0.023
[2024-01-15 14:50:48] INFO: Feature importance analysis completed
[2024-01-15 14:51:29] INFO: Training in progress... Current epoch: 13/20`}
            </Typography>
          </Box>
        </Paper>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Experiments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage your machine learning experiments
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<AssessmentIcon />}>
            Generate Report
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export Results
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ pb: 1 }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            <Tab label="Experiments" />
            <Tab label="Metrics" />
            <Tab label="Logs" />
          </Tabs>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        {selectedTab === 0 && renderExperimentsList()}
        {selectedTab === 1 && renderMetrics()}
        {selectedTab === 2 && renderLogs()}
      </Box>

      {/* New Experiment Dialog */}
      <Dialog
        open={newExperimentDialog}
        onClose={() => setNewExperimentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Experiment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Experiment Name"
                placeholder="e.g., Advanced Threat Detection v2"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Dataset</InputLabel>
                <Select value="">
                  <MenuItem value="security_logs">Security Logs 2024</MenuItem>
                  <MenuItem value="network_traffic">Network Traffic Analysis</MenuItem>
                  <MenuItem value="threat_intel">Threat Intelligence Feed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Algorithm</InputLabel>
                <Select value="">
                  <MenuItem value="xgboost">XGBoost</MenuItem>
                  <MenuItem value="random_forest">Random Forest</MenuItem>
                  <MenuItem value="neural_network">Neural Network</MenuItem>
                  <MenuItem value="svm">Support Vector Machine</MenuItem>
                  <MenuItem value="automl">AutoML (Recommended)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                placeholder="Describe the purpose and goals of this experiment..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewExperimentDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setNewExperimentDialog(false)}>
            Create Experiment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Experiment Details Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedExperiment?.name}
          <Typography variant="body2" color="text.secondary">
            ID: {selectedExperiment?.id} | Status: {selectedExperiment?.status}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedExperiment && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Accuracy" secondary={`${(selectedExperiment.accuracy * 100).toFixed(1)}%`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="F1 Score" secondary={selectedExperiment.f1Score.toFixed(3)} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="AUC" secondary={selectedExperiment.auc.toFixed(3)} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Configuration</Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Algorithm" secondary={selectedExperiment.algorithm} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Dataset" secondary={selectedExperiment.dataset} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Duration" secondary={selectedExperiment.duration} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Hyperparameters</Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="body2" component="pre">
                    {JSON.stringify(selectedExperiment.hyperparameters, null, 2)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>
            Close
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Export Model
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Experiments;