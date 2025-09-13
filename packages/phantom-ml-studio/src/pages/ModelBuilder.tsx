import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  Assessment,
  Timeline,
  TrendingUp,
  Security,
  ModelTraining,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AutoMLConfig {
  taskType: 'classification' | 'regression' | 'anomaly_detection' | 'security_threat_detection';
  targetColumn: string;
  timeBudget: number;
  algorithms: string[];
  featureEngineering: boolean;
  crossValidation: boolean;
  ensembleMethods: boolean;
}

interface AutoMLResult {
  experimentId: string;
  bestModelId: string;
  bestAlgorithm: string;
  bestScore: number;
  leaderboard: ModelResult[];
  featureImportance: FeatureImportance[];
  trainingTimeSeconds: number;
  totalModelsTrained: number;
  dataInsights: DataInsights;
}

interface ModelResult {
  modelId: string;
  algorithm: string;
  score: number;
  trainingTime: number;
  hyperparameters: Record<string, any>;
  crossValidationScores: number[];
}

interface FeatureImportance {
  featureName: string;
  importanceScore: number;
  featureType: string;
}

interface DataInsights {
  totalRows: number;
  totalFeatures: number;
  missingValuesPercentage: number;
  categoricalFeatures: string[];
  numericalFeatures: string[];
  dataQualityScore: number;
  recommendedPreprocessing: string[];
}

const AutoMLBuilder: React.FC = () => {
  const [config, setConfig] = useState<AutoMLConfig>({
    taskType: 'classification',
    targetColumn: '',
    timeBudget: 300,
    algorithms: ['random_forest', 'xgboost', 'logistic_regression'],
    featureEngineering: true,
    crossValidation: true,
    ensembleMethods: false,
  });

  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [result, setResult] = useState<AutoMLResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setData(results.data);
          setColumns(Object.keys(results.data[0] || {}));
          if (results.errors.length > 0) {
            setError(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`);
          }
        },
        error: (error) => {
          setError(`Failed to parse CSV: ${error.message}`);
        },
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: false,
  });

  const handleStartAutoML = async () => {
    if (!data.length || !config.targetColumn) {
      setError('Please upload data and select a target column');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setError(null);

    try {
      // Simulate training progress
      const progressInterval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      // Call AutoML API
      const response = await fetch('/api/auto_train_model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...config,
          data: data.slice(0, 1000), // Limit for demo
        }),
      });

      if (!response.ok) {
        throw new Error(`AutoML failed: ${response.statusText}`);
      }

      const resultData = await response.json();
      setResult(resultData);
      setTrainingProgress(100);

      clearInterval(progressInterval);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AutoML training failed');
    } finally {
      setIsTraining(false);
    }
  };

  const handleStopTraining = () => {
    setIsTraining(false);
    setTrainingProgress(0);
  };

  const renderDataInsights = (insights: DataInsights) => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Data Overview
            </Typography>
            <Typography variant="body2">
              Total Rows: {insights.totalRows.toLocaleString()}
            </Typography>
            <Typography variant="body2">
              Total Features: {insights.totalFeatures}
            </Typography>
            <Typography variant="body2">
              Missing Values: {insights.missingValuesPercentage.toFixed(1)}%
            </Typography>
            <Typography variant="body2">
              Data Quality Score: {insights.dataQualityScore.toFixed(1)}/100
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Feature Types
            </Typography>
            <Typography variant="body2">
              Numerical: {insights.numericalFeatures.length}
            </Typography>
            <Typography variant="body2">
              Categorical: {insights.categoricalFeatures.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recommended Preprocessing
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {insights.recommendedPreprocessing.map((step, index) => (
                <Chip key={index} label={step} size="small" />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderLeaderboard = (leaderboard: ModelResult[]) => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Model Leaderboard
        </Typography>
        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer>
            <LineChart data={leaderboard}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="algorithm" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8884d8"
                strokeWidth={2}
                name="Accuracy Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ mt: 2 }}>
          {leaderboard.map((model, index) => (
            <Card key={model.modelId} sx={{ mb: 1 }}>
              <CardContent sx={{ py: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {index + 1}. {model.algorithm}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`${(model.score * 100).toFixed(1)}%`}
                      color={index === 0 ? 'success' : 'default'}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {model.trainingTime}s
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const renderFeatureImportance = (features: FeatureImportance[]) => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Feature Importance
        </Typography>
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {features
            .sort((a, b) => b.importanceScore - a.importanceScore)
            .map((feature, index) => (
              <Box key={feature.featureName} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2">
                    {index + 1}. {feature.featureName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={feature.featureType} size="small" variant="outlined" />
                    <Typography variant="caption">
                      {(feature.importanceScore * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={feature.importanceScore * 100}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            ))}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ModelTraining />
        AutoML Builder
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Automatically build and optimize machine learning models with advanced algorithms and feature engineering
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Data Upload Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Upload
              </Typography>
              <Box
                {...getRootProps()}
                className={`drag-drop-zone ${isDragActive ? 'drag-active' : ''}`}
                sx={{ mb: 2 }}
              >
                <input {...getInputProps()} />
                <Typography variant="body2" color="text.secondary">
                  {isDragActive
                    ? 'Drop the CSV file here...'
                    : 'Drag & drop a CSV file here, or click to select'}
                </Typography>
              </Box>
              {data.length > 0 && (
                <Typography variant="body2" color="success.main">
                  ✓ Loaded {data.length.toLocaleString()} rows, {columns.length} columns
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Configuration Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AutoML Configuration
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Task Type</InputLabel>
                  <Select
                    value={config.taskType}
                    label="Task Type"
                    onChange={(e) => setConfig(prev => ({ ...prev, taskType: e.target.value as any }))}
                  >
                    <MenuItem value="classification">Classification</MenuItem>
                    <MenuItem value="regression">Regression</MenuItem>
                    <MenuItem value="anomaly_detection">Anomaly Detection</MenuItem>
                    <MenuItem value="security_threat_detection">Security Threat Detection</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Target Column</InputLabel>
                  <Select
                    value={config.targetColumn}
                    label="Target Column"
                    onChange={(e) => setConfig(prev => ({ ...prev, targetColumn: e.target.value }))}
                  >
                    {columns.map(col => (
                      <MenuItem key={col} value={col}>{col}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box>
                  <Typography variant="body2" gutterBottom>
                    Time Budget: {config.timeBudget} seconds
                  </Typography>
                  <Slider
                    value={config.timeBudget}
                    onChange={(_, value) => setConfig(prev => ({ ...prev, timeBudget: value as number }))}
                    min={60}
                    max={3600}
                    step={60}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.featureEngineering}
                        onChange={(e) => setConfig(prev => ({ ...prev, featureEngineering: e.target.checked }))}
                      />
                    }
                    label="Enable Feature Engineering"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.crossValidation}
                        onChange={(e) => setConfig(prev => ({ ...prev, crossValidation: e.target.checked }))}
                      />
                    }
                    label="Enable Cross-Validation"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.ensembleMethods}
                        onChange={(e) => setConfig(prev => ({ ...prev, ensembleMethods: e.target.checked }))}
                      />
                    }
                    label="Enable Ensemble Methods"
                  />
                </Box>
              </Box>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                onClick={() => setShowConfigDialog(true)}
                fullWidth
              >
                Advanced Settings
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Training Controls */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  AutoML Training
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {!isTraining ? (
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={handleStartAutoML}
                      disabled={!data.length || !config.targetColumn}
                    >
                      Start AutoML
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Stop />}
                      onClick={handleStopTraining}
                    >
                      Stop Training
                    </Button>
                  )}
                </Box>
              </Box>

              {isTraining && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Training Progress: {trainingProgress.toFixed(1)}%
                  </Typography>
                  <LinearProgress variant="determinate" value={trainingProgress} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        {result && (
          <>
            {/* Summary */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'success.contrastText' }}>
                    🎉 AutoML Complete!
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'success.contrastText' }}>
                    Best Model: {result.bestAlgorithm} | Score: {(result.bestScore * 100).toFixed(1)}% | Training Time: {result.trainingTimeSeconds}s
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Data Insights */}
            <Grid item xs={12}>
              {renderDataInsights(result.dataInsights)}
            </Grid>

            {/* Leaderboard */}
            <Grid item xs={12} md={6}>
              {renderLeaderboard(result.leaderboard)}
            </Grid>

            {/* Feature Importance */}
            <Grid item xs={12} md={6}>
              {renderFeatureImportance(result.featureImportance)}
            </Grid>
          </>
        )}
      </Grid>

      {/* Advanced Configuration Dialog */}
      <Dialog open={showConfigDialog} onClose={() => setShowConfigDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Advanced AutoML Configuration</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="h6">Algorithm Selection</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['random_forest', 'xgboost', 'lightgbm', 'logistic_regression', 'neural_network', 'svm'].map(algo => (
                <Chip
                  key={algo}
                  label={algo.replace('_', ' ').toUpperCase()}
                  onClick={() => {
                    const newAlgorithms = config.algorithms.includes(algo)
                      ? config.algorithms.filter(a => a !== algo)
                      : [...config.algorithms, algo];
                    setConfig(prev => ({ ...prev, algorithms: newAlgorithms }));
                  }}
                  color={config.algorithms.includes(algo) ? 'primary' : 'default'}
                  variant={config.algorithms.includes(algo) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>

            <Typography variant="h6" sx={{ mt: 2 }}>Hyperparameter Ranges</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max Models"
                  type="number"
                  defaultValue={10}
                  helperText="Maximum number of models to train"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Early Stopping Rounds"
                  type="number"
                  defaultValue={10}
                  helperText="Early stopping patience"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfigDialog(false)}>Cancel</Button>
          <Button onClick={() => setShowConfigDialog(false)} variant="contained">
            Apply Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutoMLBuilder;