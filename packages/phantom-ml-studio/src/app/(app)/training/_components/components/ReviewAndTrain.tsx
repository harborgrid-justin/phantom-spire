/**
 * Review and Train Step Component
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Dataset as DatasetIcon,
  Psychology as AlgorithmIcon,
  Tune as ParametersIcon,
  ViewColumn as FeaturesIcon,
  ExpandMore as ExpandIcon,
  Schedule as TimeIcon,
  Memory as ResourceIcon
} from '@mui/icons-material';
import { Dataset, Algorithm, Feature, FeatureEngineering, TrainingJob, HyperparameterValue } from '../types';

interface ReviewAndTrainProps {
  dataset: Dataset | null;
  algorithm: Algorithm | null;
  selectedFeatures: Feature[];
  featureEngineering: FeatureEngineering;
  hyperparameters: Record<string, HyperparameterValue>;
  autoML: boolean;
  autoFeatureSelection: boolean;
  autoTuning: boolean;
  crossValidation: boolean;
  cvFolds: number;
  testSize: number;
  trainingJob: TrainingJob | null;
  onStartTraining: () => void;
  onStopTraining: () => void;
}

export default function ReviewAndTrain({
  dataset,
  algorithm,
  selectedFeatures,
  featureEngineering,
  hyperparameters,
  autoML,
  autoFeatureSelection,
  autoTuning,
  crossValidation,
  cvFolds,
  testSize,
  trainingJob,
  onStartTraining,
  onStopTraining
}: ReviewAndTrainProps) {
  const canStartTraining = dataset && (autoML || algorithm) && selectedFeatures.length > 0;
  const isTraining = trainingJob?.status === 'running';
  const hasError = trainingJob?.status === 'failed';
  const isComplete = trainingJob?.status === 'completed';

  const getStatusColor = () => {
    if (hasError) return 'error';
    if (isComplete) return 'success';
    if (isTraining) return 'primary';
    return 'default';
  };

  const getStatusIcon = () => {
    if (hasError) return <ErrorIcon />;
    if (isComplete) return <SuccessIcon />;
    if (isTraining) return <CircularProgress size={20} />;
    return null;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review & Train
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your configuration and start training your machine learning model.
      </Typography>

      {/* Training Status */}
      {trainingJob && (
        <Card sx={{ mb: 3 }} data-cy="training-status-card">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusIcon()}
                <Typography variant="h6">
                  Training Status: {trainingJob.status}
                </Typography>
              </Box>
              <Chip
                label={trainingJob.status}
                color={getStatusColor()}
                variant={isTraining ? 'filled' : 'outlined'}
              />
            </Box>
            
            {isTraining && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Progress: {Math.round(trainingJob.progress)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {trainingJob.duration ? `${Math.floor(trainingJob.duration / 60)}:${String(trainingJob.duration % 60).padStart(2, '0')}` : ''}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={trainingJob.progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            )}

            {trainingJob.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {trainingJob.error}
              </Alert>
            )}

            {trainingJob.results && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {trainingJob.results.accuracy && (
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="success.main">
                        {(trainingJob.results.accuracy * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Accuracy
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {trainingJob.results.f1Score && (
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="success.main">
                        {(trainingJob.results.f1Score * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        F1 Score
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {trainingJob.results.rmse && (
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary.main">
                        {trainingJob.results.rmse.toFixed(3)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        RMSE
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {trainingJob.results.r2Score && (
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary.main">
                        {(trainingJob.results.r2Score * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        R² Score
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
              {isTraining ? (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={onStopTraining}
                  data-cy="stop-training-button"
                >
                  Stop Training
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<StartIcon />}
                  onClick={onStartTraining}
                  disabled={!canStartTraining}
                  data-cy="start-training-button"
                >
                  {trainingJob ? 'Restart Training' : 'Start Training'}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Configuration Review */}
      <Card sx={{ mb: 3 }} data-cy="config-review-card">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Configuration Review
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            {/* Dataset Configuration */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <DatasetIcon />
                <Typography variant="subtitle1" fontWeight="medium">
                  Dataset
                </Typography>
              </Box>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary={dataset?.name || 'No dataset selected'}
                    secondary={dataset ? `${dataset.rows.toLocaleString()} rows, ${dataset.columns} columns` : ''}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Type"
                    secondary={dataset?.type || 'Unknown'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Test Split"
                    secondary={`${Math.round(testSize * 100)}% for testing`}
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Algorithm Configuration */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AlgorithmIcon />
                <Typography variant="subtitle1" fontWeight="medium">
                  Algorithm
                </Typography>
              </Box>
              <List dense>
                {autoML ? (
                  <ListItem>
                    <ListItemText
                      primary="AutoML Enabled"
                      secondary="System will automatically select the best algorithm"
                    />
                  </ListItem>
                ) : (
                  <>
                    <ListItem>
                      <ListItemText
                        primary={algorithm?.displayName || 'No algorithm selected'}
                        secondary={algorithm?.description}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Complexity"
                        secondary={algorithm?.complexity}
                      />
                    </ListItem>
                  </>
                )}
                <ListItem>
                  <ListItemText
                    primary="Cross Validation"
                    secondary={crossValidation ? `${cvFolds}-fold enabled` : 'Disabled'}
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Features Configuration */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FeaturesIcon />
                <Typography variant="subtitle1" fontWeight="medium">
                  Features
                </Typography>
              </Box>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Selected Features"
                    secondary={autoFeatureSelection ? 'Auto-selected' : `${selectedFeatures.length} features`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Feature Engineering"
                    secondary={
                      [
                        featureEngineering.scaling && 'Scaling',
                        featureEngineering.encoding && 'Encoding',
                        featureEngineering.polynomialFeatures && 'Polynomial',
                        featureEngineering.pca && 'PCA'
                      ].filter(Boolean).join(', ') || 'None'
                    }
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Parameters Configuration */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ParametersIcon />
                <Typography variant="subtitle1" fontWeight="medium">
                  Parameters
                </Typography>
              </Box>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Hyperparameter Tuning"
                    secondary={autoTuning ? 'Auto-tuning enabled' : 'Manual configuration'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Parameters Count"
                    secondary={`${Object.keys(hyperparameters).length} configured`}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Detailed Configuration */}
      {!trainingJob && (
        <Accordion sx={{ mb: 3 }} data-cy="detailed-config-accordion">
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Typography variant="h6">
              Detailed Configuration
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Feature Details */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Features ({selectedFeatures.length})
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {selectedFeatures.slice(0, 10).map((feature) => (
                    <Box key={feature.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{feature.name}</Typography>
                      <Chip
                        label={feature.type}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  ))}
                  {selectedFeatures.length > 10 && (
                    <Typography variant="caption" color="primary">
                      +{selectedFeatures.length - 10} more features
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Hyperparameter Details */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Hyperparameters ({Object.keys(hyperparameters).length})
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {Object.entries(hyperparameters).slice(0, 8).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{key}:</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {String(value)}
                      </Typography>
                    </Box>
                  ))}
                  {Object.keys(hyperparameters).length > 8 && (
                    <Typography variant="caption" color="primary">
                      +{Object.keys(hyperparameters).length - 8} more parameters
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Training Estimates */}
      {!trainingJob && canStartTraining && (
        <Card sx={{ mb: 3 }} data-cy="training-estimates-card">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Training Estimates
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TimeIcon />
                  <Typography variant="subtitle2">
                    Estimated Time
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {algorithm?.trainingTime === 'fast' && '5-15 minutes'}
                  {algorithm?.trainingTime === 'medium' && '15-45 minutes'}
                  {algorithm?.trainingTime === 'slow' && '45+ minutes'}
                  {autoML && '30-120 minutes (multiple algorithms)'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ResourceIcon />
                  <Typography variant="subtitle2">
                    Resource Usage
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {algorithm?.complexity === 'low' && 'Low CPU/Memory usage'}
                  {algorithm?.complexity === 'medium' && 'Moderate resource usage'}
                  {algorithm?.complexity === 'high' && 'High resource usage'}
                  {autoML && 'Variable (depends on algorithms)'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SuccessIcon />
                  <Typography variant="subtitle2">
                    Expected Performance
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Based on dataset size and complexity, expect good results with proper validation.
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Validation Warnings */}
      {!canStartTraining && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Please complete the following before starting training:
          </Typography>
          <List dense>
            {!dataset && (
              <ListItem>
                <ListItemIcon>
                  <ErrorIcon color="warning" />
                </ListItemIcon>
                <ListItemText primary="Select a dataset" />
              </ListItem>
            )}
            {!autoML && !algorithm && (
              <ListItem>
                <ListItemIcon>
                  <ErrorIcon color="warning" />
                </ListItemIcon>
                <ListItemText primary="Select an algorithm or enable AutoML" />
              </ListItem>
            )}
            {selectedFeatures.length === 0 && (
              <ListItem>
                <ListItemIcon>
                  <ErrorIcon color="warning" />
                </ListItemIcon>
                <ListItemText primary="Select features or enable auto feature selection" />
              </ListItem>
            )}
          </List>
        </Alert>
      )}

      {/* Start Training Button */}
      {!trainingJob && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<StartIcon />}
            onClick={onStartTraining}
            disabled={!canStartTraining}
            data-cy="main-start-training-button"
            sx={{ px: 4, py: 1.5 }}
          >
            Start Training
          </Button>
        </Box>
      )}
    </Box>
  );
}