'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  CloudUpload as UploadIcon,
  DatasetLinked as DatasetIcon,
  ModelTraining as TrainingIcon,
  Assessment as MetricsIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import { useMLCoreStatus, useModels } from '../../components/providers/MLCoreProvider'

interface TrainingJob {
  id: string
  name: string
  algorithm: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped'
  progress: number
  dataset: string
  target: string
  features: string[]
  hyperparameters: Record<string, any>
  metrics?: {
    accuracy?: number
    f1Score?: number
    precision?: number
    recall?: number
    rmse?: number
    mae?: number
  }
  startTime?: Date
  endTime?: Date
  estimatedDuration?: number
  logs: string[]
}

interface Dataset {
  id: string
  name: string
  size: string
  rows: number
  columns: number
  target?: string
  features: string[]
  type: 'tabular' | 'text' | 'image' | 'time_series'
  description: string
}

const algorithms = [
  {
    name: 'Random Forest',
    type: 'classification',
    description: 'Ensemble method using multiple decision trees',
    hyperparameters: {
      n_estimators: { min: 10, max: 1000, default: 100 },
      max_depth: { min: 1, max: 50, default: 10 },
      min_samples_split: { min: 2, max: 20, default: 2 }
    }
  },
  {
    name: 'XGBoost',
    type: 'regression',
    description: 'Gradient boosting framework optimized for speed and performance',
    hyperparameters: {
      learning_rate: { min: 0.01, max: 1, default: 0.1 },
      max_depth: { min: 1, max: 20, default: 6 },
      n_estimators: { min: 10, max: 1000, default: 100 }
    }
  },
  {
    name: 'Logistic Regression',
    type: 'classification',
    description: 'Linear model for binary and multiclass classification',
    hyperparameters: {
      C: { min: 0.001, max: 100, default: 1.0 },
      max_iter: { min: 100, max: 10000, default: 1000 }
    }
  },
  {
    name: 'SVM',
    type: 'classification',
    description: 'Support Vector Machine for classification tasks',
    hyperparameters: {
      C: { min: 0.1, max: 100, default: 1.0 },
      gamma: { min: 0.001, max: 10, default: 0.1 }
    }
  }
]

const mockDatasets: Dataset[] = [
  {
    id: 'dataset_1',
    name: 'Customer Data',
    size: '2.3 MB',
    rows: 10000,
    columns: 15,
    target: 'churn',
    features: ['age', 'income', 'usage_frequency', 'support_tickets', 'contract_length'],
    type: 'tabular',
    description: 'Customer behavior and churn prediction dataset'
  },
  {
    id: 'dataset_2',
    name: 'Financial Transactions',
    size: '45.1 MB',
    rows: 250000,
    columns: 22,
    target: 'is_fraud',
    features: ['amount', 'merchant_category', 'time_of_day', 'location_risk'],
    type: 'tabular',
    description: 'Financial transaction fraud detection dataset'
  }
]

export default function TrainingPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('')
  const [modelName, setModelName] = useState('')
  const [targetColumn, setTargetColumn] = useState('')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [hyperparameters, setHyperparameters] = useState<Record<string, any>>({})
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([])
  const [currentJob, setCurrentJob] = useState<TrainingJob | null>(null)
  const [autoML, setAutoML] = useState(false)
  const [crossValidation, setCrossValidation] = useState(true)
  const [testSize, setTestSize] = useState(0.2)
  const [randomState, setRandomState] = useState(42)

  const { isInitialized, error } = useMLCoreStatus()
  const { models, refreshModels } = useModels()

  useEffect(() => {
    if (selectedDataset) {
      setTargetColumn(selectedDataset.target || '')
      setSelectedFeatures(selectedDataset.features)
    }
  }, [selectedDataset])

  useEffect(() => {
    const algorithm = algorithms.find(a => a.name === selectedAlgorithm)
    if (algorithm) {
      const defaultParams: Record<string, any> = {}
      Object.entries(algorithm.hyperparameters).forEach(([key, config]) => {
        defaultParams[key] = config.default
      })
      setHyperparameters(defaultParams)
    }
  }, [selectedAlgorithm])

  const steps = [
    'Select Dataset',
    'Choose Algorithm',
    'Configure Training',
    'Monitor Progress'
  ]

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const handleStartTraining = async () => {
    if (!selectedDataset || !selectedAlgorithm || !modelName) {
      return
    }

    const newJob: TrainingJob = {
      id: `job_${Date.now()}`,
      name: modelName,
      algorithm: selectedAlgorithm,
      status: 'running',
      progress: 0,
      dataset: selectedDataset.name,
      target: targetColumn,
      features: selectedFeatures,
      hyperparameters,
      startTime: new Date(),
      estimatedDuration: 300000, // 5 minutes
      logs: [
        'Training job started',
        'Loading dataset...',
        'Preprocessing data...',
        'Splitting train/test sets...'
      ]
    }

    setTrainingJobs([...trainingJobs, newJob])
    setCurrentJob(newJob)
    handleNext()

    // Simulate training progress
    simulateTraining(newJob)
  }

  const simulateTraining = (_job: TrainingJob) => {
    const interval = setInterval(() => {
      setTrainingJobs(jobs =>
        jobs.map(j => {
          if (j.id === job.id) {
            const newProgress = Math.min(j.progress + Math.random() * 15, 100)
            const newLogs = [...j.logs]

            if (newProgress > 25 && j.logs.length === 4) {
              newLogs.push('Training model...')
            }
            if (newProgress > 50 && j.logs.length === 5) {
              newLogs.push('Validating model...')
            }
            if (newProgress > 75 && j.logs.length === 6) {
              newLogs.push('Computing metrics...')
            }
            if (newProgress >= 100) {
              newLogs.push('Training completed successfully!')
              clearInterval(interval)

              const finalJob = {
                ...j,
                status: 'completed' as const,
                progress: 100,
                endTime: new Date(),
                logs: newLogs,
                metrics: {
                  accuracy: 0.85 + Math.random() * 0.1,
                  f1Score: 0.82 + Math.random() * 0.1,
                  precision: 0.84 + Math.random() * 0.1,
                  recall: 0.83 + Math.random() * 0.1
                }
              }

              setTimeout(() => {
                refreshModels()
              }, 1000)

              return finalJob
            }

            return { ...j, progress: newProgress, logs: newLogs }
          }
          return j
        })
      )
    }, 2000)
  }

  const handleStopTraining = () => {
    if (currentJob) {
      setTrainingJobs(jobs =>
        jobs.map(j =>
          j.id === currentJob.id
            ? { ...j, status: 'stopped' as const, endTime: new Date() }
            : j
        )
      )
      setCurrentJob(null)
    }
  }

  const getStepContent = (_step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Training Dataset
            </Typography>
            <Grid container spacing={2}>
              {mockDatasets.map((dataset) => (
                <Grid size={{ xs: 12, md: 6 }} key={dataset.id}>
                  <Card
                    variant={selectedDataset?.id === dataset.id ? "outlined" : "elevation"}
                    sx={{
                      cursor: 'pointer',
                      borderColor: selectedDataset?.id === dataset.id ? 'primary.main' : undefined,
                      borderWidth: selectedDataset?.id === dataset.id ? 2 : undefined
                    }}
                    onClick={() => setSelectedDataset(dataset)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <DatasetIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">{dataset.name}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {dataset.description}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Size</Typography>
                          <Typography variant="body2">{dataset.size}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Rows</Typography>
                          <Typography variant="body2">{dataset.rows.toLocaleString()}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Columns</Typography>
                          <Typography variant="body2">{dataset.columns}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Type</Typography>
                          <Chip label={dataset.type} size="small" />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box mt={3}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                size="large"
              >
                Upload New Dataset
              </Button>
            </Box>
          </Box>
        )

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose ML Algorithm
            </Typography>
            <Grid container spacing={2}>
              {algorithms.map((algorithm) => (
                <Grid size={{ xs: 12, md: 6 }} key={algorithm.name}>
                  <Card
                    variant={selectedAlgorithm === algorithm.name ? "outlined" : "elevation"}
                    sx={{
                      cursor: 'pointer',
                      borderColor: selectedAlgorithm === algorithm.name ? 'primary.main' : undefined,
                      borderWidth: selectedAlgorithm === algorithm.name ? 2 : undefined
                    }}
                    onClick={() => setSelectedAlgorithm(algorithm.name)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <TrainingIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">{algorithm.name}</Typography>
                      </Box>
                      <Chip label={algorithm.type} size="small" color="secondary" sx={{ mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        {algorithm.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box mt={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoML}
                    onChange={(e) => setAutoML(e.target.checked)}
                  />
                }
                label="Enable AutoML (Automatic hyperparameter optimization)"
              />
            </Box>
          </Box>
        )

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure Training Parameters
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Model Configuration
                    </Typography>

                    <TextField
                      fullWidth
                      label="Model Name"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      margin="normal"
                      required
                    />

                    <FormControl fullWidth margin="normal">
                      <InputLabel>Target Column</InputLabel>
                      <Select
                        value={targetColumn}
                        onChange={(e) => setTargetColumn(e.target.value)}
                      >
                        {selectedDataset?.features.map((feature) => (
                          <MenuItem key={feature} value={feature}>{feature}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                      Test Split Size: {testSize * 100}%
                    </Typography>
                    <Slider
                      value={testSize}
                      onChange={(e, value) => setTestSize(value as number)}
                      min={0.1}
                      max={0.5}
                      step={0.05}
                      marks
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={crossValidation}
                          onChange={(e) => setCrossValidation(e.target.checked)}
                        />
                      }
                      label="Cross Validation"
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Hyperparameters
                    </Typography>

                    {selectedAlgorithm && algorithms.find(a => a.name === selectedAlgorithm) && (
                      <Box>
                        {Object.entries(algorithms.find(a => a.name === selectedAlgorithm)!.hyperparameters).map(([key, config]) => (
                          <Box key={key} sx={{ mb: 2 }}>
                            <Typography variant="body2" gutterBottom>
                              {key}: {hyperparameters[key]}
                            </Typography>
                            <Slider
                              value={hyperparameters[key] || config.default}
                              onChange={(e, value) => setHyperparameters({
                                ...hyperparameters,
                                [key]: value
                              })}
                              min={config.min}
                              max={config.max}
                              step={key.includes('rate') ? 0.01 : 1}
                              disabled={autoML}
                            />
                          </Box>
                        ))}

                        {autoML && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            AutoML is enabled. Hyperparameters will be optimized automatically.
                          </Alert>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Training Progress
            </Typography>

            {currentJob && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">{currentJob.name}</Typography>
                    <Box display="flex" gap={1}>
                      <Chip
                        label={currentJob.status}
                        color={currentJob.status === 'completed' ? 'success' : 'primary'}
                        icon={currentJob.status === 'running' ? <CircularProgress size={16} /> : undefined}
                      />
                      {currentJob.status === 'running' && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<StopIcon />}
                          onClick={handleStopTraining}
                        >
                          Stop
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Progress: {currentJob.progress.toFixed(1)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={currentJob.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Grid container spacing={2} mb={2}>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="caption" color="text.secondary">Algorithm</Typography>
                      <Typography variant="body2">{currentJob.algorithm}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="caption" color="text.secondary">Dataset</Typography>
                      <Typography variant="body2">{currentJob.dataset}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="caption" color="text.secondary">Target</Typography>
                      <Typography variant="body2">{currentJob.target}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="caption" color="text.secondary">Features</Typography>
                      <Typography variant="body2">{currentJob.features.length}</Typography>
                    </Grid>
                  </Grid>

                  {currentJob.metrics && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Training Metrics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6, md: 3 }}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" color="primary">
                              {(currentJob.metrics.accuracy! * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="caption">Accuracy</Typography>
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" color="secondary">
                              {(currentJob.metrics.f1Score! * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="caption">F1 Score</Typography>
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" color="success.main">
                              {(currentJob.metrics.precision! * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="caption">Precision</Typography>
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" color="warning.main">
                              {(currentJob.metrics.recall! * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="caption">Recall</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandIcon />}>
                      <Typography variant="subtitle2">Training Logs</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                        {currentJob.logs.map((log, index) => (
                          <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace' }}>
                            [{new Date().toLocaleTimeString()}] {log}
                          </Typography>
                        ))}
                      </Paper>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {trainingJobs.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Training History
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Model Name</TableCell>
                          <TableCell>Algorithm</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Progress</TableCell>
                          <TableCell>Accuracy</TableCell>
                          <TableCell>Started</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {trainingJobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell>{job.name}</TableCell>
                            <TableCell>{job.algorithm}</TableCell>
                            <TableCell>
                              <Chip
                                label={job.status}
                                size="small"
                                color={
                                  job.status === 'completed' ? 'success' :
                                  job.status === 'running' ? 'primary' :
                                  job.status === 'failed' ? 'error' : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>{job.progress.toFixed(0)}%</TableCell>
                            <TableCell>
                              {job.metrics?.accuracy ? `${(job.metrics.accuracy * 100).toFixed(1)}%` : '-'}
                            </TableCell>
                            <TableCell>
                              {job.startTime?.toLocaleTimeString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
          </Box>
        )

      default:
        return 'Unknown step'
    }
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          ML Core is not available. Training functionality is running in mock mode.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        Model Training
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Train new machine learning models using your datasets with automated hyperparameter optimization.
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              {getStepContent(index)}
              <Box sx={{ mb: 2, mt: 3 }}>
                <div>
                  {index === steps.length - 1 ? (
                    currentJob?.status !== 'running' && (
                      <Button
                        variant="contained"
                        onClick={() => setActiveStep(0)}
                        sx={{ mr: 1 }}
                      >
                        Train Another Model
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="contained"
                      onClick={index === 2 ? handleStartTraining : handleNext}
                      sx={{ mr: 1 }}
                      disabled={
                        (index === 0 && !selectedDataset) ||
                        (index === 1 && !selectedAlgorithm) ||
                        (index === 2 && !modelName)
                      }
                    >
                      {index === 2 ? 'Start Training' : 'Continue'}
                    </Button>
                  )}
                  {index > 0 && index < 3 && (
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                  )}
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  )
}