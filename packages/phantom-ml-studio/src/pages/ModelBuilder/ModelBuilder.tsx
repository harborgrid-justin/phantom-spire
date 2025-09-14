import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Divider,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  AutoAwesome as AutoMLIcon,
  Settings as ConfigIcon,
  PlayArrow as TrainIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

// Improved TypeScript interfaces with proper typing
type TaskType = 'classification' | 'regression' | 'anomaly_detection' | 'security_threat_detection';
type OptimizationMetric = 'accuracy' | 'precision' | 'recall' | 'f1_score' | 'mse' | 'mae' | 'r2' | 'rmse';
type AlgorithmType = 'random_forest' | 'xgboost' | 'lightgbm' | 'logistic_regression' | 'neural_network' | 'support_vector_machine';

interface ModelConfig {
  taskType: TaskType;
  targetColumn: string;
  optimizationMetric: OptimizationMetric;
  timeBudget: number;
  algorithms: AlgorithmType[];
  featureEngineering: boolean;
  crossValidationFolds: number;
  ensembleMethods: boolean;
  maxModels: number;
}

interface ModelResult {
  modelId: string;
  algorithm: string;
  score: number;
  trainingTime: number;
  hyperparameters: Record<string, unknown>;
  crossValidationScores: number[];
}

interface FeatureImportance {
  featureName: string;
  importance: number;
  rank: number;
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
}

interface DataRow {
  [key: string]: string | number;
}

const ModelBuilder: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [dataPreview, setDataPreview] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [trainingResults, setTrainingResults] = useState<AutoMLResult | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    taskType: 'classification',
    targetColumn: '',
    optimizationMetric: 'accuracy',
    timeBudget: 10,
    algorithms: ['random_forest', 'xgboost', 'logistic_regression'],
    featureEngineering: true,
    crossValidationFolds: 5,
    ensembleMethods: true,
    maxModels: 10,
  });

  const steps = ['Upload Data', 'Configure Model', 'Train & Optimize', 'Results'];

  const taskTypes = [
    { value: 'classification', label: 'Classification' },
    { value: 'regression', label: 'Regression' },
    { value: 'anomaly_detection', label: 'Anomaly Detection' },
    { value: 'security_threat_detection', label: 'Security Threat Detection' },
  ];

  const algorithms = [
    { value: 'random_forest', label: 'Random Forest' },
    { value: 'xgboost', label: 'XGBoost' },
    { value: 'lightgbm', label: 'LightGBM' },
    { value: 'logistic_regression', label: 'Logistic Regression' },
    { value: 'neural_network', label: 'Neural Network' },
    { value: 'svm', label: 'Support Vector Machine' },
  ];

  const optimizationMetrics = {
    classification: ['accuracy', 'precision', 'recall', 'f1_score', 'auc'],
    regression: ['mse', 'mae', 'r2', 'rmse'],
    anomaly_detection: ['precision', 'recall', 'f1_score'],
    security_threat_detection: ['accuracy', 'precision', 'recall', 'f1_score'],
  };

  // Enhanced CSV parsing with proper error handling and validation
  const parseCSVFile = (file: File): Promise<{ headers: string[], data: DataRow[], errors: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const errors: string[] = [];
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          if (!text || text.trim().length === 0) {
            reject(new Error('File is empty or corrupted'));
            return;
          }

          const lines = text.split('\n').filter(line => line.trim().length > 0);
          if (lines.length < 2) {
            errors.push('File must contain at least header and one data row');
          }

          const headers = lines[0].split(',').map(h => h.trim());
          if (headers.length === 0) {
            errors.push('No headers found in CSV file');
          }

          // Parse data rows with type validation
          const data: DataRow[] = [];
          for (let i = 1; i < Math.min(lines.length, 21); i++) { // Limit preview to 20 rows
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length !== headers.length) {
              errors.push(`Row ${i} has ${values.length} columns, expected ${headers.length}`);
              continue;
            }

            const row: DataRow = {};
            headers.forEach((header, index) => {
              const value = values[index];
              // Try to convert to number if possible
              const numValue = Number(value);
              row[header] = !isNaN(numValue) && value !== '' ? numValue : value;
            });
            data.push(row);
          }

          resolve({ headers, data, errors });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Reset previous errors
    setValidationErrors([]);
    
    try {
      setDataFile(file);
      const { headers, data, errors } = await parseCSVFile(file);
      
      setColumns(headers);
      setDataPreview(data);
      
      if (errors.length > 0) {
        setValidationErrors(errors);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setValidationErrors([errorMessage]);
      setDataFile(null);
      setColumns([]);
      setDataPreview([]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
    maxFiles: 1,
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Enhanced training simulation with realistic progress and results
  const handleStartTraining = async (): Promise<void> => {
    if (!dataFile || !modelConfig.targetColumn) {
      setValidationErrors(['Please ensure data is uploaded and target column is selected']);
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setValidationErrors([]);
    
    // Simulate realistic AutoML training phases
    const phases = [
      { name: 'Data preprocessing', duration: 20, progress: 15 },
      { name: 'Feature engineering', duration: 25, progress: 25 },
      { name: 'Algorithm selection', duration: 30, progress: 40 },
      { name: 'Hyperparameter tuning', duration: 35, progress: 75 },
      { name: 'Cross-validation', duration: 20, progress: 90 },
      { name: 'Model ensemble', duration: 10, progress: 100 },
    ];

    try {
      for (const phase of phases) {
        await new Promise(resolve => {
          const phaseInterval = setInterval(() => {
            setTrainingProgress(currentProgress => {
              if (currentProgress >= phase.progress) {
                clearInterval(phaseInterval);
                resolve(void 0);
                return phase.progress;
              }
              return Math.min(currentProgress + Math.random() * 3, phase.progress);
            });
          }, 100);
        });
      }

      // Generate realistic training results
      const mockResults: AutoMLResult = {
        experimentId: `exp_${Date.now()}`,
        bestModelId: `model_${Date.now()}`,
        bestAlgorithm: 'XGBoost',
        bestScore: 0.89 + Math.random() * 0.1,
        leaderboard: [
          {
            modelId: 'xgb_001',
            algorithm: 'XGBoost',
            score: 0.94,
            trainingTime: 120,
            hyperparameters: { max_depth: 6, learning_rate: 0.1, n_estimators: 100 },
            crossValidationScores: [0.92, 0.95, 0.93, 0.94, 0.96]
          },
          {
            modelId: 'rf_001',
            algorithm: 'Random Forest',
            score: 0.91,
            trainingTime: 85,
            hyperparameters: { n_estimators: 200, max_depth: 10, min_samples_split: 5 },
            crossValidationScores: [0.89, 0.92, 0.90, 0.91, 0.93]
          },
          {
            modelId: 'lr_001',
            algorithm: 'Logistic Regression',
            score: 0.87,
            trainingTime: 12,
            hyperparameters: { C: 1.0, solver: 'liblinear', penalty: 'l2' },
            crossValidationScores: [0.85, 0.88, 0.86, 0.87, 0.89]
          }
        ],
        featureImportance: columns.filter(col => col !== modelConfig.targetColumn).map((feature, index) => ({
          featureName: feature,
          importance: Math.random() * 0.8 + 0.1,
          rank: index + 1
        })).sort((a, b) => b.importance - a.importance),
        trainingTimeSeconds: 217,
        totalModelsTrained: 3,
      };

      setTrainingResults(mockResults);
      setIsTraining(false);
      handleNext(); // Move to results step
      
    } catch (error) {
      setIsTraining(false);
      setValidationErrors(['Training failed: ' + (error instanceof Error ? error.message : 'Unknown error')]);
    }
  };


  const renderUploadStep = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Upload Your Dataset
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Upload a CSV or JSON file containing your training data. The first row should contain column headers.
        </Typography>
        
        <Box
          {...getRootProps()}
          className={`drag-drop-zone ${isDragActive ? 'drag-active' : ''}`}
          sx={{ mb: 3 }}
        >
          <input {...getInputProps()} />
          <UploadIcon sx={{ fontSize: 48, mb: 2, color: 'text.secondary' }} />
          {isDragActive ? (
            <Typography>Drop the file here...</Typography>
          ) : (
            <Typography>
              Drag & drop a file here, or <strong>click to select</strong>
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Supported formats: CSV, JSON
          </Typography>
        </Box>

        {/* Display validation errors */}
        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2" component="div">
              <strong>Data validation issues:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Typography>
          </Alert>
        )}

        {dataFile && validationErrors.length === 0 && (
          <Alert severity="success" sx={{ mb: 3 }}>
            File uploaded: {dataFile.name} ({(dataFile.size / 1024).toFixed(1)} KB)
          </Alert>
        )}

        {dataPreview.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Data Preview ({columns.length} columns, {dataPreview.length} sample rows)
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {columns.map((col, index) => (
                      <th key={index} style={{ 
                        padding: '8px', 
                        borderBottom: '2px solid #ddd',
                        textAlign: 'left',
                        backgroundColor: '#f5f5f5'
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataPreview.map((row, index) => (
                    <tr key={index}>
                      {columns.map((col, colIndex) => (
                        <td key={colIndex} style={{ 
                          padding: '8px', 
                          borderBottom: '1px solid #ddd' 
                        }}>
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderConfigStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Basic Configuration
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Task Type</InputLabel>
              <Select
                value={modelConfig.taskType}
                onChange={(e) => setModelConfig({ ...modelConfig, taskType: e.target.value })}
              >
                {taskTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Target Column</InputLabel>
              <Select
                value={modelConfig.targetColumn}
                onChange={(e) => setModelConfig({ ...modelConfig, targetColumn: e.target.value })}
              >
                {columns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Optimization Metric</InputLabel>
              <Select
                value={modelConfig.optimizationMetric}
                onChange={(e) => setModelConfig({ ...modelConfig, optimizationMetric: e.target.value })}
              >
                {(optimizationMetrics[modelConfig.taskType as keyof typeof optimizationMetrics] || []).map((metric) => (
                  <MenuItem key={metric} value={metric}>
                    {metric.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Time Budget (minutes)"
              type="number"
              value={modelConfig.timeBudget}
              onChange={(e) => setModelConfig({ ...modelConfig, timeBudget: parseInt(e.target.value) })}
              sx={{ mb: 3 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Advanced Settings
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Algorithms to Try
            </Typography>
            <Box sx={{ mb: 3 }}>
              {algorithms.map((algo) => (
                <Chip
                  key={algo.value}
                  label={algo.label}
                  clickable
                  color={modelConfig.algorithms.includes(algo.value) ? 'primary' : 'default'}
                  onClick={() => {
                    const updatedAlgos = modelConfig.algorithms.includes(algo.value)
                      ? modelConfig.algorithms.filter(a => a !== algo.value)
                      : [...modelConfig.algorithms, algo.value];
                    setModelConfig({ ...modelConfig, algorithms: updatedAlgos });
                  }}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>

            <TextField
              fullWidth
              label="Cross Validation Folds"
              type="number"
              value={modelConfig.crossValidationFolds}
              onChange={(e) => setModelConfig({ ...modelConfig, crossValidationFolds: parseInt(e.target.value) })}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Maximum Models"
              type="number"
              value={modelConfig.maxModels}
              onChange={(e) => setModelConfig({ ...modelConfig, maxModels: parseInt(e.target.value) })}
              sx={{ mb: 3 }}
            />

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <input
                  type="checkbox"
                  checked={modelConfig.featureEngineering}
                  onChange={(e) => setModelConfig({ ...modelConfig, featureEngineering: e.target.checked })}
                  style={{ marginRight: 8 }}
                />
                Enable Automatic Feature Engineering
              </Typography>
              <Typography variant="body2">
                <input
                  type="checkbox"
                  checked={modelConfig.ensembleMethods}
                  onChange={(e) => setModelConfig({ ...modelConfig, ensembleMethods: e.target.checked })}
                  style={{ marginRight: 8 }}
                />
                Enable Ensemble Methods
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTrainingStep = () => (
    <Card>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          {isTraining ? 'Training in Progress...' : 'Ready to Start Training'}
        </Typography>
        
        {!isTraining && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Click the button below to start AutoML training with your configuration.
              This will automatically try multiple algorithms and find the best model.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<TrainIcon />}
              onClick={handleStartTraining}
              sx={{ px: 4, py: 1.5 }}
            >
              Start AutoML Training
            </Button>
          </>
        )}

        {isTraining && (
          <Box sx={{ mt: 4 }}>
            <AutoMLIcon sx={{ fontSize: 64, mb: 2, color: 'primary.main' }} />
            <Typography variant="h6" gutterBottom>
              AutoML Training Progress
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={trainingProgress} 
              sx={{ height: 10, borderRadius: 5, mb: 2, width: '100%', maxWidth: 400, mx: 'auto' }}
            />
            <Typography variant="body1" sx={{ mb: 4 }}>
              {trainingProgress.toFixed(1)}% Complete
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Trying different algorithms, optimizing hyperparameters, and validating models...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderResultsStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SuccessIcon color="success" sx={{ mr: 2 }} />
              <Typography variant="h5">
                AutoML Training Completed Successfully!
              </Typography>
            </Box>
            
            {trainingResults && (
              <>
                {/* Summary Stats */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {(trainingResults.bestScore * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Best Accuracy
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {trainingResults.totalModelsTrained}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Models Trained
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {Math.round(trainingResults.trainingTimeSeconds / 60)}m
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Training Time
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {trainingResults.bestAlgorithm}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Best Algorithm
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  {/* Model Leaderboard */}
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" gutterBottom>
                      Model Leaderboard
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                      {trainingResults.leaderboard.map((model, index) => (
                        <Box
                          key={model.modelId}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            mb: 1,
                            backgroundColor: index === 0 ? 'primary.light' : 'background.default',
                            borderRadius: 1,
                            border: index === 0 ? '2px solid' : '1px solid',
                            borderColor: index === 0 ? 'primary.main' : 'divider'
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              #{index + 1} {model.algorithm}
                              {index === 0 && <Chip label="BEST" size="small" color="primary" sx={{ ml: 1 }} />}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Training: {model.trainingTime}s | CV Scores: {model.crossValidationScores.map(s => s.toFixed(2)).join(', ')}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" color={index === 0 ? 'primary.main' : 'text.primary'}>
                              {(model.score * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>

                  {/* Feature Importance */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" gutterBottom>
                      Feature Importance
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                      {trainingResults.featureImportance.slice(0, 5).map((feature, index) => (
                        <Box key={feature.featureName} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {feature.featureName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {(feature.importance * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={feature.importance * 100} 
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    startIcon={<DownloadIcon />}
                    onClick={() => alert('Deploy functionality coming soon!')}
                  >
                    Deploy to Production
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    startIcon={<ViewIcon />}
                    onClick={() => alert('Model analysis details coming soon!')}
                  >
                    View Full Analysis
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    onClick={() => {
                      // Reset to start over
                      setActiveStep(0);
                      setDataFile(null);
                      setDataPreview([]);
                      setColumns([]);
                      setTrainingResults(null);
                      setValidationErrors([]);
                    }}
                  >
                    Start New Experiment
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );



  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          AutoML Model Builder
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Build machine learning models automatically with zero code. Upload your data, configure settings, and let our AutoML engine find the best model for you.
        </Typography>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Box sx={{ mb: 4 }}>
        {activeStep === 0 && renderUploadStep()}
        {activeStep === 1 && renderConfigStep()}
        {activeStep === 2 && renderTrainingStep()}
        {activeStep === 3 && renderResultsStep()}
      </Box>

      {activeStep < 3 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && !dataFile) ||
              (activeStep === 1 && !modelConfig.targetColumn) ||
              (activeStep === 2 && isTraining)
            }
          >
            {activeStep === steps.length - 2 ? 'Start Training' : 'Next'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ModelBuilder;