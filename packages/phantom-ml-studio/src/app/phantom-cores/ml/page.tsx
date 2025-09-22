'use client';

// Phantom ML Core Management - Machine Learning Security Analytics
// Provides comprehensive GUI for ML-powered security analytics and threat detection

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  AutoAwesome as MLIcon,
  Psychology as AIIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as PredictiveIcon,
  BugReport as AnomalyIcon,
  Assessment as ModelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Speed as RealtimeIcon,
  Verified as AccuracyIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces
interface MLStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      active_models: number;
      model_accuracy: number;
      predictions_per_second: number;
      anomaly_detection_rate: number;
    };
  };
}

interface MLAnalysis {
  analysis_id: string;
  ml_profile: {
    model_name: string;
    algorithm_type: string;
    confidence_score: number;
    prediction_accuracy: number;
  };
  security_insights: any;
  anomaly_detection: any;
  recommendations: string[];
}

// API functions
const fetchMLStatus = async (): Promise<MLStatus> => {
  const response = await fetch('/api/phantom-cores/ml?operation=status');
  return response.json();
};

const runMLAnalysis = async (mlData: any) => {
  const response = await fetch('/api/phantom-cores/ml', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'run-analysis',
      mlData
    })
  });
  return response.json();
};

const trainModel = async (trainingData: any) => {
  const response = await fetch('/api/phantom-cores/ml', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'train-model',
      trainingData
    })
  });
  return response.json();
};

const detectAnomalies = async (anomalyData: any) => {
  const response = await fetch('/api/phantom-cores/ml', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'detect-anomalies',
      anomalyData
    })
  });
  return response.json();
};

const generateMLReport = async (reportData: any) => {
  const response = await fetch('/api/phantom-cores/ml', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'generate-ml-report',
      reportData
    })
  });
  return response.json();
};

// Component: ML Overview
const MLOverview: React.FC<{ status: MLStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">ML system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  // Add null check for metrics
  if (!metrics) {
    return (
      <Alert severity="info">ML metrics are currently being initialized...</Alert>
    );
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.95) return 'success';
    if (accuracy >= 0.85) return 'warning';
    return 'error';
  };

  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>System Status</Typography>
            <Chip
              icon={status.data.status === 'operational' ? <CheckCircleIcon /> : <WarningIcon />}
              label={status.data.status}
              color={status.data.status === 'operational' ? 'success' : 'warning'}
            />
            <Typography variant="body2" color="textSecondary" mt={1}>
              Uptime: {metrics.uptime}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active Models</Typography>
            <Typography variant="h3" color="primary">
              {metrics.active_models}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              ML models deployed
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Model Accuracy</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.model_accuracy * 100}
                size={60}
                color={getAccuracyColor(metrics.model_accuracy)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getAccuracyColor(metrics.model_accuracy)}>
                  {(metrics.model_accuracy * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg Accuracy
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Predictions/sec</Typography>
            <Typography variant="h3" color="secondary">
              {metrics.predictions_per_second.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Real-time processing
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

// Component: ML Analysis Panel
const MLAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<MLAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelType, setModelType] = useState('anomaly_detection');
  const [dataSource, setDataSource] = useState('network_traffic');

  const modelTypes = [
    'anomaly_detection', 'threat_classification', 'behavioral_analysis',
    'predictive_modeling', 'clustering', 'time_series_analysis'
  ];

  const dataSources = [
    'network_traffic', 'system_logs', 'user_behavior', 'file_activity',
    'endpoint_data', 'threat_intelligence'
  ];

  const runMLSecurityAnalysis = async () => {
    setLoading(true);
    try {
      const result = await runMLAnalysis({
        model_type: modelType,
        data_source: dataSource,
        analysis_window: '1_hour',
        confidence_threshold: 0.8,
        include_feature_importance: true,
        real_time_processing: true
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('ML analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">ML Security Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Model Type</InputLabel>
              <Select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                label="Model Type"
              >
                {modelTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Data Source</InputLabel>
              <Select
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value)}
                label="Data Source"
              >
                {dataSources.map((source) => (
                  <MenuItem key={source} value={source}>
                    {source.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<MLIcon />}
              onClick={runMLSecurityAnalysis}
              disabled={loading}
            >
              Analyze
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {analysis && (
          <Box>
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>ML Model Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Model Name:</strong> {analysis.ml_profile.model_name}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Algorithm:</strong> {analysis.ml_profile.algorithm_type}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" mr={1}>
                      <strong>Prediction Accuracy:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.ml_profile.prediction_accuracy * 100).toFixed(1)}%`}
                      color={analysis.ml_profile.prediction_accuracy >= 0.9 ? 'success' :
                             analysis.ml_profile.prediction_accuracy >= 0.8 ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" mr={1}>
                      <strong>Confidence Score:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.ml_profile.confidence_score * 100).toFixed(1)}%`}
                      color={analysis.ml_profile.confidence_score >= 0.8 ? 'success' :
                             analysis.ml_profile.confidence_score >= 0.6 ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2">
                    <strong>Analysis ID:</strong> {analysis.analysis_id}
                  </Typography>
                </Paper>
              </Box>

              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>ML Insights</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <AnomalyIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Anomalous behavior patterns detected"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PredictiveIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Predictive threat indicators identified"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <RealtimeIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Real-time threat scoring active"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AccuracyIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="High confidence threat classification"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>ML Security Recommendations</Typography>
              <List dense>
                {analysis.recommendations?.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={recommendation}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Component: ML Operations Panel
const MLOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'train',
      title: 'Model Training',
      description: 'Train ML models with latest security data',
      icon: <ModelIcon />,
      action: async () => {
        const result = await trainModel({
          model_type: 'threat_detection',
          training_data: 'security_events_30_days',
          algorithm: 'ensemble_methods',
          validation_split: 0.2,
          hyperparameter_tuning: true
        });
        return result.data;
      }
    },
    {
      id: 'anomaly',
      title: 'Anomaly Detection',
      description: 'Detect security anomalies using ML algorithms',
      icon: <AnomalyIcon />,
      action: async () => {
        const result = await detectAnomalies({
          detection_algorithms: ['isolation_forest', 'one_class_svm', 'autoencoder'],
          sensitivity_level: 'high',
          time_window: '24_hours',
          feature_selection: 'automated'
        });
        return result.data;
      }
    },
    {
      id: 'report',
      title: 'ML Report',
      description: 'Generate comprehensive ML analytics report',
      icon: <AnalyticsIcon />,
      action: async () => {
        const result = await generateMLReport({
          report_type: 'ML Security Analytics Report',
          include_model_performance: true,
          include_threat_predictions: true,
          include_anomaly_analysis: true,
          time_period: '7_days'
        });
        return result.data;
      }
    }
  ];

  const runOperation = async (operation: any) => {
    setLoading(true);
    setActiveOperation(operation.id);
    try {
      const result = await operation.action();
      setOperationResult(result);
    } catch (error) {
      console.error(`${operation.title} failed:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>ML Operations</Typography>

        <Box display="flex" flexWrap="wrap" gap={2}>
          {operations.map((operation) => (
            <Box flex="1 1 300px" minWidth="300px" key={operation.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    {operation.icon}
                    <Typography variant="subtitle1" sx={{ ml: 1 }}>
                      {operation.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    {operation.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => runOperation(operation)}
                    disabled={loading && activeOperation === operation.id}
                  >
                    {loading && activeOperation === operation.id ? 'Running...' : 'Execute'}
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {loading && (
          <Box mt={2}>
            <LinearProgress />
            <Typography variant="body2" color="textSecondary" mt={1}>
              Executing {operations.find(op => op.id === activeOperation)?.title}...
            </Typography>
          </Box>
        )}

        {operationResult && (
          <Box mt={2}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Operation Results</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '400px' }}>
                  {JSON.stringify(operationResult, null, 2)}
                </pre>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Main Component: ML Management Dashboard
const MLManagementDashboard: React.FC = () => {
  const { data: mlStatus, isLoading, error } = useQuery({
    queryKey: ['ml-status'],
    queryFn: fetchMLStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading ML Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !mlStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load ML system status. Please ensure the ML core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <MLIcon sx={{ mr: 2, fontSize: 32, color: '#00bcd4' }} />
        <Box>
          <Typography variant="h4" component="h1">
            ML Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Machine Learning Security Analytics Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <MLOverview status={mlStatus} />
        <MLAnalysisPanel />
        <MLOperationsPanel />
      </Box>
    </Box>
  );
};

export default MLManagementDashboard;
