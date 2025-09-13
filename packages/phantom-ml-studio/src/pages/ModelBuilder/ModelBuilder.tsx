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

interface ModelConfig {
  taskType: string;
  targetColumn: string;
  optimizationMetric: string;
  timeBudget: number;
  algorithms: string[];
  featureEngineering: boolean;
  crossValidationFolds: number;
  ensembleMethods: boolean;
  maxModels: number;
}

interface AutoMLResult {
  experimentId: string;
  bestModelId: string;
  bestAlgorithm: string;
  bestScore: number;
  leaderboard: any[];
  featureImportance: any[];
  trainingTimeSeconds: number;
  totalModelsTrained: number;
}

const ModelBuilder: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingResults, setTrainingResults] = useState<AutoMLResult | null>(null);
  const [showResults, setShowResults] = useState(false);

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

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setDataFile(file);
      // Simulate CSV parsing and preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').slice(0, 6); // First 5 rows + header
        const headers = lines[0].split(',');
        setColumns(headers);
        
        const preview = lines.slice(1).map(line => {
          const values = line.split(',');
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          return row;
        });
        setDataPreview(preview);
      };
      reader.readAsText(file);
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

  const handleStartTraining = async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    // Simulate AutoML training progress
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          // Simulate training results
          setTrainingResults({
            experimentId: 'exp_' + Date.now(),
            bestModelId: 'model_' + Date.now(),
            bestAlgorithm: 'XGBoost',
            bestScore: 0.924,
            leaderboard: [
              { algorithm: 'XGBoost', score: 0.924, training_time: 45 },
              { algorithm: 'Random Forest', score: 0.918, training_time: 32 },
              { algorithm: 'Neural Network', score: 0.912, training_time: 67 },
              { algorithm: 'Logistic Regression', score: 0.887, training_time: 12 },
            ],
            featureImportance: [
              { feature: 'ip_reputation', importance: 0.245 },
              { feature: 'request_frequency', importance: 0.189 },
              { feature: 'domain_age', importance: 0.156 },
              { feature: 'payload_entropy', importance: 0.134 },
              { feature: 'time_of_day', importance: 0.098 },
            ],
            trainingTimeSeconds: 156,
            totalModelsTrained: 4,
          });
          handleNext();
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 1000);
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

        {dataFile && (
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
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Best Model
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1"><strong>Algorithm:</strong> {trainingResults.bestAlgorithm}</Typography>
                    <Typography variant="body1"><strong>Score:</strong> {(trainingResults.bestScore * 100).toFixed(1)}%</Typography>
                    <Typography variant="body1"><strong>Training Time:</strong> {trainingResults.trainingTimeSeconds}s</Typography>
                    <Typography variant="body1"><strong>Models Trained:</strong> {trainingResults.totalModelsTrained}</Typography>
                  </Box>
                  
                  <Button variant="contained" startIcon={<DownloadIcon />} sx={{ mr: 2, mb: 2 }}>
                    Deploy Model
                  </Button>
                  <Button variant="outlined" startIcon={<ViewIcon />}>
                    View Details
                  </Button>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Feature Importance
                  </Typography>
                  <List>
                    {trainingResults.featureImportance.map((feature, index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={feature.feature}
                          secondary={
                            <LinearProgress 
                              variant="determinate" 
                              value={feature.importance * 100} 
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          }
                        />
                        <Typography variant="body2" sx={{ ml: 2, minWidth: 50 }}>
                          {(feature.importance * 100).toFixed(1)}%
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Model Leaderboard
                  </Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Rank</th>
                          <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Algorithm</th>
                          <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Score</th>
                          <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Training Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trainingResults.leaderboard.map((model, index) => (
                          <tr key={index}>
                            <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{index + 1}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{model.algorithm}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{(model.score * 100).toFixed(1)}%</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{model.training_time}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Grid>
              </Grid>
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