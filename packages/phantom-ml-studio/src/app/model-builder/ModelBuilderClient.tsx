'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Box,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
  SelectChangeEvent,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  PlayArrow as StartIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { BarChart } from '@mui/x-charts/BarChart';

import { modelBuilderService } from '@/services/model-builder';
import { UploadedData, ModelConfig, AutoMLResult, AlgorithmType } from '@/services/model-builder';

const availableAlgorithms: AlgorithmType[] = ['simple_linear_regression', 'random_forest_regression'];

const steps = ['Upload Data', 'Configure Model', 'Train & Evaluate'];

// Error boundary component
class ModelBuilderErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Model Builder Error:', error, errorInfo);
    // In production, send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            }
          >
            Something went wrong with the model builder. Please try refreshing the page.
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default function ModelBuilderClient() {
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);
  const [modelConfig, setModelConfig] = useState<Partial<ModelConfig>>({
    taskType: 'regression',
    algorithms: ['simple_linear_regression'],
    featureEngineering: true,
    crossValidationFolds: 5,
    ensembleMethods: true,
  });
  const [trainingResult, setTrainingResult] = useState<AutoMLResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState('');

  // Auto-clear errors after 10 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsLoading(true);
      setError(null);
      setUploadedData(null);
      setTrainingResult(null);
      setActiveStep(0);

      try {
        const file = acceptedFiles[0];
        setTrainingStatus('Parsing uploaded file...');

        const response = await modelBuilderService.parseData({
          id: 'parse_req',
          type: 'parseData',
          data: { file }
        } as any, {
          requestId: `req-${Date.now()}`,
          startTime: new Date(),
          timeout: 30000,
          permissions: [],
          metadata: {},
          trace: {
            traceId: `trace-${Date.now()}`,
            spanId: `span-${Date.now()}`,
            sampled: true,
            baggage: {},
          }
        });

        if (response.success && response.data) {
          setUploadedData(response.data);
          setModelConfig(prev => ({
            ...prev,
            targetColumn: response.data?.headers[response.data.headers.length - 1]
          }));
          setActiveStep(1);
        } else {
          setError(response.error?.message || 'Failed to parse uploaded file.');
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to process file';
        setError(errorMessage);
        console.error('File upload error:', e);
      } finally {
        setIsLoading(false);
        setTrainingStatus('');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB limit
  });

  const handleConfigChange = useCallback((event: SelectChangeEvent<any>) => {
    const { name, value } = event.target;
    setModelConfig(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleAlgorithmChange = useCallback((event: SelectChangeEvent<any>) => {
    const { target: { value } } = event;
    setModelConfig(prev => ({
      ...prev,
      algorithms: typeof value === 'string' ? value.split(',') : value as AlgorithmType[]
    }));
  }, []);

  const handleStartTraining = useCallback(async () => {
    if (!uploadedData || !modelConfig.targetColumn) {
      setError('Please upload data and select a target column.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTrainingResult(null);
    setProgress(0);
    setActiveStep(2);

    try {
      const fullConfig: ModelConfig = {
        ...modelConfig,
        targetColumn: modelConfig.targetColumn,
        optimizationMetric: 'r2',
        timeBudget: 3600,
        maxModels: 10,
      } as ModelConfig;

      setTrainingStatus('Initializing training pipeline...');

      const progressCallback = (newProgress: number) => {
        setProgress(newProgress);
        if (newProgress < 25) {
          setTrainingStatus('Preprocessing data...');
        } else if (newProgress < 50) {
          setTrainingStatus('Training models...');
        } else if (newProgress < 75) {
          setTrainingStatus('Evaluating performance...');
        } else {
          setTrainingStatus('Finalizing results...');
        }
      };

      const response = await modelBuilderService.startTraining({
        id: 'train_req',
        type: 'startTraining',
        data: {
          config: fullConfig,
          columns: uploadedData.headers,
          data: uploadedData.data
        }
      } as any, {
        requestId: `req-${Date.now()}`,
        startTime: new Date(),
        timeout: 300000, // 5 minute timeout
        permissions: [],
        metadata: {},
        trace: {
          traceId: `trace-${Date.now()}`,
          spanId: `span-${Date.now()}`,
          sampled: true,
          baggage: {},
        }
      }, progressCallback);

      if (response.success && response.data) {
        setTrainingResult(response.data);
        setTrainingStatus('Training completed successfully!');
      } else {
        setError(response.error?.message || 'Training failed.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Training process failed';
      setError(errorMessage);
      console.error('Training error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [uploadedData, modelConfig]);

  const dataGridCols: GridColDef[] = uploadedData
    ? uploadedData.headers.map(h => ({
        field: h,
        headerName: h,
        width: 150,
        sortable: true,
        filterable: true
      }))
    : [];

  const dataGridRows = uploadedData
    ? uploadedData.data.map((row, i) => ({ id: i, ...row }))
    : [];

  return (
    <ModelBuilderErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            AutoML Model Builder
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Build machine learning models with automated feature engineering and hyperparameter optimization
          </Typography>
        </Box>

        {/* Progress Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label} completed={activeStep > index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
          {/* Step 1: Upload Data */}
          <Card elevation={activeStep === 0 ? 3 : 1}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Step 1: Upload Training Data
              </Typography>
              <Paper
                {...getRootProps()}
                sx={{
                  p: 4,
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.400',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragActive ? 'action.hover' : 'inherit',
                  transition: 'all 0.3s ease'
                }}
              >
                <input {...getInputProps()} />
                <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? 'Drop the CSV file here' : 'Drag & drop a CSV file here, or click to select'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Maximum file size: 50MB
                </Typography>
              </Paper>
            </CardContent>
          </Card>

          {isLoading && !trainingResult && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CircularProgress size={20} sx={{ mr: 2 }} />
                  <Typography>{trainingStatus || 'Processing...'}</Typography>
                </Box>
                {progress > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={progress} />
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      {Math.round(progress)}% complete
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Configure & Preview */}
          {uploadedData && (
            <Card elevation={activeStep === 1 ? 3 : 1}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Step 2: Configure Training Parameters
                </Typography>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                  gap: 2,
                  alignItems: 'center',
                  mb: 3
                }}>
                  <FormControl fullWidth>
                    <InputLabel>Target Column</InputLabel>
                    <Select
                      name="targetColumn"
                      value={modelConfig.targetColumn || ''}
                      onChange={handleConfigChange}
                    >
                      {uploadedData.headers.map(h => (
                        <MenuItem key={h} value={h}>{h}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Algorithms</InputLabel>
                    <Select
                      name="algorithms"
                      multiple
                      value={modelConfig.algorithms || []}
                      onChange={handleAlgorithmChange}
                      input={<OutlinedInput label="Algorithms" />}
                      renderValue={(selected) => (selected as string[]).join(', ')}
                    >
                      {availableAlgorithms.map((alg) => (
                        <MenuItem key={alg} value={alg}>
                          <Checkbox checked={(modelConfig.algorithms || []).indexOf(alg) > -1} />
                          <ListItemText primary={alg.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleStartTraining}
                    disabled={isLoading || !modelConfig.targetColumn}
                    fullWidth
                    size="large"
                    startIcon={<StartIcon />}
                  >
                    Start Training
                  </Button>
                </Box>

                <Typography variant="h6" gutterBottom>
                  Data Preview
                </Typography>
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={dataGridRows}
                    columns={dataGridCols}
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } }
                    }}
                    density="compact"
                  />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Training Results */}
          {trainingResult && (
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Training Complete
                </Typography>

                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="h6">
                    Best Model: <strong>{trainingResult.bestAlgorithm}</strong>
                  </Typography>
                  <Typography>
                    Score: <strong>{trainingResult.bestScore.toFixed(4)}</strong>
                  </Typography>
                </Alert>

                <Typography variant="h6" gutterBottom>
                  Model Leaderboard
                </Typography>
                <Box sx={{ height: 400, width: '100%', mb: 3 }}>
                  <DataGrid
                    rows={trainingResult.leaderboard.map(r => ({ ...r, id: r.modelId }))}
                    columns={[
                      {
                        field: 'algorithm',
                        headerName: 'Algorithm',
                        width: 200,
                        valueFormatter: (params: any) =>
                          params.value.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                      },
                      {
                        field: 'score',
                        headerName: 'Score',
                        width: 150,
                        valueFormatter: (params: any) => params.value.toFixed(4)
                      },
                      {
                        field: 'trainingTime',
                        headerName: 'Training Time (s)',
                        width: 150
                      },
                      {
                        field: 'hyperparameters',
                        headerName: 'Hyperparameters',
                        width: 300,
                        valueFormatter: (params: any) => JSON.stringify(params.value)
                      },
                    ]}
                    density="compact"
                  />
                </Box>

                <Typography variant="h6" gutterBottom>
                  Feature Importance
                </Typography>
                <Box sx={{ height: 400 }}>
                  <BarChart
                    dataset={trainingResult.featureImportance as any}
                    yAxis={[{ scaleType: 'band', dataKey: 'featureName' }]}
                    series={[{
                      dataKey: 'importance',
                      label: 'Importance',
                      color: '#667eea'
                    }]}
                    layout="horizontal"
                    margin={{ left: 100, right: 40, top: 40, bottom: 40 }}
                  />
                </Box>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    disabled
                  >
                    Download Model (Coming Soon)
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setActiveStep(0);
                      setUploadedData(null);
                      setTrainingResult(null);
                      setModelConfig({
                        taskType: 'regression',
                        algorithms: ['simple_linear_regression'],
                        featureEngineering: true,
                        crossValidationFolds: 5,
                        ensembleMethods: true,
                      });
                    }}
                  >
                    Start New Model
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Container>
    </ModelBuilderErrorBoundary>
  );
}