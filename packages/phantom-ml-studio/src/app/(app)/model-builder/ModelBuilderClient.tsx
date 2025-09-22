'use client';

import React from 'react';
import {
  Container,
  Typography,
  Alert,
  Box,
  CircularProgress,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Download as DownloadIcon, PlayArrow as StartIcon } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { BarChart } from '@mui/x-charts/BarChart';

import { useModelBuilder } from './_lib/hooks/useModelBuilder';
import { ModelBuilderErrorBoundary } from './_components/components/ErrorBoundary';
import { 
  CreateModelStep, 
  SelectDatasetStep, 
  ChooseTargetStep, 
  SelectFeaturesStep 
} from './_components/components/steps';
import { wizardSteps } from './_lib/data/sampleData';

export default function ModelBuilderClient() {
  const {
    // State
    activeStep,
    selectedDataset,
    selectedFeatures,
    selectedTargetColumn,
    selectedAlgorithmCategory,
    selectedAlgorithms,
    selectedAlgorithm,
    showRecommendations,
    complexityFilter,
    showAlgorithmConfig,
    validationError,
    uploadedData,
    modelConfig,
    trainingResult,
    isLoading,
    error,
    progress,
    trainingStatus,
    availableAlgorithms,

    // Actions
    updateState,
    handleConfigChange,
    handleAlgorithmChange,
    handleDatasetSelect,
    handleTargetSelect,
    handleFeaturesChange,
    handleStepChange,
    handleStartTraining,
    handleMockDatasetSelect,
    setError,

    // Dropzone
    getRootProps,
    getInputProps,
    isDragActive,
  } = useModelBuilder();

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

  const renderCurrentStep = () => {
    switch (activeStep) {
      case 0:
        return <CreateModelStep onNext={() => handleStepChange(1)} />;
      
      case 1:
        return (
          <SelectDatasetStep
            selectedDataset={selectedDataset}
            onDatasetSelect={(dataset) => {
              handleDatasetSelect(dataset);
              handleMockDatasetSelect(dataset);
            }}
            onNext={() => handleStepChange(2)}
          />
        );
      
      case 2:
        return (
          <ChooseTargetStep
            selectedTargetColumn={selectedTargetColumn}
            onTargetSelect={handleTargetSelect}
            onNext={() => handleStepChange(3)}
          />
        );
      
      case 3:
        return (
          <SelectFeaturesStep
            selectedFeatures={selectedFeatures}
            selectedTargetColumn={selectedTargetColumn}
            onFeaturesChange={handleFeaturesChange}
            onNext={() => handleStepChange(4)}
          />
        );
      
      case 4:
        return (
          <Card elevation={3} data-cy="card-algorithm-selection">
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Algorithm Selection
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Choose the type of algorithm for your model
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                This step would contain the algorithm selection interface from the original component.
                For brevity, showing placeholder content.
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleStepChange(5)}
                data-cy="next-step"
              >
                Next Step
              </Button>
            </CardContent>
          </Card>
        );
      
      case 5:
        return (
          <Card elevation={3} data-cy="card-configure-train">
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Configure & Train Model
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Final configuration and start training
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Selected Configuration:</Typography>
                <Typography><strong>Dataset:</strong> {selectedDataset?.name}</Typography>
                <Typography><strong>Target:</strong> {selectedTargetColumn}</Typography>
                <Typography><strong>Features:</strong> {selectedFeatures.length} selected</Typography>
                <Typography><strong>Algorithms:</strong> {selectedAlgorithms.map(a => a.name).join(', ')}</Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                onClick={handleStartTraining}
                disabled={isLoading}
                size="large"
                startIcon={<StartIcon />}
                data-cy="btn-start-training"
              >
                Start Training
              </Button>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

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
        <Box sx={{ mb: 4 }} data-cy="model-builder-stepper">
          <Stepper activeStep={activeStep} alternativeLabel>
            {wizardSteps.map((label, index) => (
              <Step key={label} completed={activeStep > index} data-cy={`step-${index}-${label.toLowerCase().replace(//s+/g, '-')}`}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)} data-cy="alert-error">
            {error}
          </Alert>
        )}

        {/* Validation Error */}
        {validationError && (
          <Alert severity="error" sx={{ mb: 3 }} data-cy="validation-error">
            <Typography data-cy="error-message">{validationError}</Typography>
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
          {/* Render Current Step */}
          {renderCurrentStep()}

          {/* Loading State */}
          {isLoading && !trainingResult && (
            <Card data-cy="card-loading">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }} data-cy="loading-container">
                  <CircularProgress size={20} sx={{ mr: 2 }} data-cy="loading-spinner" />
                  <Typography data-cy="loading-status">{trainingStatus || 'Processing...'}</Typography>
                </Box>
                {progress > 0 && (
                  <Box sx={{ mt: 2 }} data-cy="progress-container">
                    <LinearProgress variant="determinate" value={progress} data-cy="progress-bar" />
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }} data-cy="progress-text">
                      {Math.round(progress)}% complete
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Data Preview */}
          {uploadedData && (
            <Card elevation={activeStep === 1 ? 3 : 1} data-cy="card-configure-model">
              <CardContent>
                <Typography variant="h6" gutterBottom data-cy="data-preview-title">
                  Data Preview
                </Typography>
                <Box sx={{ height: 400, width: '100%' }} data-cy="data-preview-container">
                  <DataGrid
                    rows={dataGridRows}
                    columns={dataGridCols}
                    pageSizeOptions={[5, 10, 25]}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } }
                    }}
                    density="compact"
                    data-cy="table-data-preview"
                  />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Training Results */}
          {trainingResult && (
            <Card elevation={3} data-cy="card-training-results">
              <CardContent>
                <Typography variant="h5" gutterBottom data-cy="training-complete-title">
                  Training Complete
                </Typography>

                <Alert severity="success" sx={{ mb: 3 }} data-cy="alert-best-model">
                  <Typography variant="h6" data-cy="best-model-name">
                    Best Model: <strong>{trainingResult.bestAlgorithm}</strong>
                  </Typography>
                  <Typography data-cy="best-model-score">
                    Score: <strong>{trainingResult.bestScore.toFixed(4)}</strong>
                  </Typography>
                </Alert>

                <Typography variant="h6" gutterBottom data-cy="leaderboard-title">
                  Model Leaderboard
                </Typography>
                <Box sx={{ height: 400, width: '100%', mb: 3 }} data-cy="leaderboard-container">
                  <DataGrid
                    rows={trainingResult.leaderboard.map(r => ({ ...r, id: r.modelId }))}
                    columns={[
                      {
                        field: 'algorithm',
                        headerName: 'Algorithm',
                        width: 200,
                        valueFormatter: (params: any) =>
                          params.value.replace(/_/g, ' ').replace(//b/w/g, (l: string) => l.toUpperCase())
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
                    data-cy="table-model-leaderboard"
                  />
                </Box>

                <Typography variant="h6" gutterBottom data-cy="feature-importance-title">
                  Feature Importance
                </Typography>
                <Box sx={{ height: 400 }} data-cy="feature-importance-container">
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
                    data-cy="chart-feature-importance"
                  />
                </Box>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }} data-cy="training-actions">
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    disabled
                    data-cy="btn-download-model"
                  >
                    Download Model (Coming Soon)
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      handleStepChange(0);
                      // Reset other states would go here
                    }}
                    data-cy="btn-start-new-model"
                  >
                    Start New Model
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Algorithm Configuration Dialog */}
        <Dialog
          open={showAlgorithmConfig}
          onClose={() => updateState({ showAlgorithmConfig: false })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Algorithm Configuration</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }} data-cy="algorithm-parameters">
              <Typography variant="h6" gutterBottom>
                Configure Algorithm Parameters
              </Typography>
              
              <TextField
                fullWidth
                label="Number of Estimators"
                type="number"
                defaultValue={100}
                sx={{ mb: 2 }}
                data-cy="parameter-n_estimators"
              />
              
              <TextField
                fullWidth
                label="Max Depth"
                type="number"
                defaultValue={10}
                sx={{ mb: 2 }}
                data-cy="parameter-max_depth"
              />
              
              <TextField
                fullWidth
                label="Learning Rate"
                type="number"
                defaultValue={0.1}
                inputProps={{ step: "0.01" }}
                sx={{ mb: 2 }}
                data-cy="parameter-learning_rate"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => updateState({ showAlgorithmConfig: false })}>Cancel</Button>
            <Button variant="contained" onClick={() => updateState({ showAlgorithmConfig: false })}>
              Save Configuration
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ModelBuilderErrorBoundary>
  );
}
