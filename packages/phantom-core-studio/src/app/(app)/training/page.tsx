/**
 * Training Page - ML Model Training Wizard
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  PlayArrow as StartIcon
} from '@mui/icons-material';

// Import component types
import {
  Dataset,
  Algorithm,
  Feature,
  FeatureEngineering,
  TrainingJob,
  HyperparameterValue,
  TRAINING_STEPS
} from './_lib/types';

// Import step components
import DatasetSelection from './_components/components/DatasetSelection';
import AlgorithmSelection from './_components/components/AlgorithmSelection';
import FeatureConfiguration from './_components/components/FeatureConfiguration';
import ParameterTuning from './_components/components/ParameterTuning';
import ReviewAndTrain from './_components/components/ReviewAndTrain';

// Mock data - In a real app, this would come from API
const mockDatasets: Dataset[] = [
  {
    id: 'dataset-1',
    name: 'Customer Churn Dataset',
    description: 'Customer behavior and churn prediction data',
    size: 15000,
    rows: 15000,
    columns: 12,
    features: ['age', 'tenure', 'monthly_charges', 'total_charges', 'contract_type'],
    target: 'churn',
    type: 'classification',
    quality: 'high',
    lastModified: new Date('2024-01-15')
  },
  {
    id: 'dataset-2',
    name: 'House Prices Dataset',
    description: 'Real estate pricing prediction dataset',
    size: 8000,
    rows: 8000,
    columns: 20,
    features: ['sqft', 'bedrooms', 'bathrooms', 'location', 'age'],
    target: 'price',
    type: 'regression',
    quality: 'medium',
    lastModified: new Date('2024-01-20')
  }
];

const mockAlgorithms: Algorithm[] = [
  {
    name: 'random_forest',
    displayName: 'Random Forest',
    type: 'classification',
    description: 'Ensemble method using multiple decision trees for robust predictions',
    hyperparameters: [
      {
        name: 'n_estimators',
        displayName: 'Number of Trees',
        type: 'int',
        default: 100,
        min: 10,
        max: 500,
        step: 10,
        description: 'Number of decision trees in the forest',
        advanced: false
      },
      {
        name: 'max_depth',
        displayName: 'Maximum Depth',
        type: 'int',
        default: 10,
        min: 1,
        max: 50,
        description: 'Maximum depth of each tree',
        advanced: false
      }
    ],
    complexity: 'medium',
    interpretability: 'medium',
    trainingTime: 'medium'
  },
  {
    name: 'gradient_boosting',
    displayName: 'Gradient Boosting',
    type: 'classification',
    description: 'Sequential ensemble method that builds models iteratively',
    hyperparameters: [
      {
        name: 'learning_rate',
        displayName: 'Learning Rate',
        type: 'float',
        default: 0.1,
        min: 0.01,
        max: 1.0,
        step: 0.01,
        description: 'Step size for gradient descent',
        advanced: false
      },
      {
        name: 'n_estimators',
        displayName: 'Number of Estimators',
        type: 'int',
        default: 100,
        min: 50,
        max: 300,
        description: 'Number of boosting stages',
        advanced: false
      }
    ],
    complexity: 'high',
    interpretability: 'low',
    trainingTime: 'slow'
  }
];

const mockFeatures: Feature[] = [
  {
    id: 'feature-1',
    name: 'age',
    description: 'Customer age in years',
    type: 'numeric',
    importance: 0.85,
    missingPercentage: 0.02,
    dataType: 'integer',
    nullable: false,
    statistics: { min: 18, max: 95, mean: 45.2, std: 12.1 }
  },
  {
    id: 'feature-2',
    name: 'tenure',
    description: 'Months as customer',
    type: 'numeric',
    importance: 0.75,
    missingPercentage: 0.01,
    dataType: 'integer',
    nullable: false,
    statistics: { min: 1, max: 72, mean: 32.4, std: 24.3 }
  },
  {
    id: 'feature-3',
    name: 'contract_type',
    description: 'Type of service contract',
    type: 'categorical',
    importance: 0.65,
    missingPercentage: 0.00,
    dataType: 'string',
    nullable: false,
    statistics: { categories: ['Month-to-month', 'One year', 'Two year'] }
  }
];

export default function TrainingPage() {
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  
  // Training configuration state
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [hyperparameters, setHyperparameters] = useState<Record<string, HyperparameterValue>>({});
  
  // AutoML and feature options
  const [autoML, setAutoML] = useState(false);
  const [autoFeatureSelection, setAutoFeatureSelection] = useState(false);
  const [autoTuning, setAutoTuning] = useState(false);
  
  // Feature engineering
  const [featureEngineering, setFeatureEngineering] = useState<FeatureEngineering>({
    scaling: true,
    scalingMethod: 'standard',
    encoding: true,
    encodingMethod: 'onehot',
    polynomialFeatures: false,
    polynomialDegree: 2,
    pca: false,
    pcaComponents: 0.95
  });
  
  // Training settings
  const [crossValidation, setCrossValidation] = useState(true);
  const [cvFolds, setCvFolds] = useState(5);
  const [testSize, setTestSize] = useState(0.2);
  const [randomSeed, setRandomSeed] = useState(42);
  
  // Training job state
  const [trainingJob, setTrainingJob] = useState<TrainingJob | null>(null);

  // Initialize default hyperparameters when algorithm changes
  useEffect(() => {
    if (selectedAlgorithm) {
      const algorithm = mockAlgorithms.find(alg => alg.name === selectedAlgorithm);
      if (algorithm) {
        const defaultParams: Record<string, HyperparameterValue> = {};
        algorithm.hyperparameters.forEach(param => {
          defaultParams[param.name] = param.default;
        });
        setHyperparameters(defaultParams);
      }
    }
  }, [selectedAlgorithm]);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleHyperparameterChange = (name: string, value: HyperparameterValue) => {
    setHyperparameters(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureEngineeringChange = (config: Partial<FeatureEngineering>) => {
    setFeatureEngineering(prev => ({ ...prev, ...config }));
  };

  const handleStartTraining = () => {
    // Create a mock training job
    const newTrainingJob: TrainingJob = {
      id: `job-${Date.now()}`,
      name: `${selectedDataset?.name} - ${selectedAlgorithm || 'AutoML'}`,
      algorithm: selectedAlgorithm || 'AutoML',
      status: 'running',
      progress: 0,
      dataset: selectedDataset?.name || 'Unknown Dataset',
      target: selectedDataset?.target || 'target',
      features: selectedFeatures,
      hyperparameters
    };
    
    setTrainingJob(newTrainingJob);
    
    // Simulate training progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        setTrainingJob(prev => prev ? {
          ...prev,
          status: 'completed',
          progress,
          results: {
            accuracy: 0.89,
            precision: 0.85,
            recall: 0.92,
            f1Score: 0.88
          }
        } : null);
        clearInterval(interval);
      } else {
        setTrainingJob(prev => prev ? { ...prev, progress } : null);
      }
    }, 1000);
  };

  const handleStopTraining = () => {
    if (trainingJob) {
      setTrainingJob({
        ...trainingJob,
        status: 'stopped'
      });
    }
  };

  const canProceedToNext = (step: number) => {
    switch (step) {
      case 0: return selectedDataset !== null;
      case 1: return autoML || selectedAlgorithm !== '';
      case 2: return autoFeatureSelection || selectedFeatures.length > 0;
      case 3: return true; // Parameters are optional
      default: return true;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Train ML Model
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Create and train machine learning models with our guided wizard.
      </Typography>

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {TRAINING_STEPS.map((step, index) => (
              <Step key={step.id}>
                <StepLabel>
                  <Typography variant="subtitle1">{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>

                  {/* Step Content */}
                  <Box sx={{ mb: 2 }}>
                    {index === 0 && (
                      <DatasetSelection
                        datasets={mockDatasets}
                        selectedDataset={selectedDataset}
                        onDatasetSelect={setSelectedDataset}
                        onUploadDataset={() => {/* TODO: implement upload */}}
                      />
                    )}
                    
                    {index === 1 && (
                      <AlgorithmSelection
                        selectedAlgorithm={selectedAlgorithm}
                        onAlgorithmSelect={setSelectedAlgorithm}
                        selectedDataset={selectedDataset}
                        algorithms={mockAlgorithms}
                        autoML={autoML}
                        onAutoMLToggle={setAutoML}
                      />
                    )}
                    
                    {index === 2 && (
                      <FeatureConfiguration
                        selectedDataset={selectedDataset}
                        features={mockFeatures}
                        selectedFeatures={selectedFeatures}
                        onFeatureToggle={handleFeatureToggle}
                        featureEngineering={featureEngineering}
                        onFeatureEngineeringChange={handleFeatureEngineeringChange}
                        autoFeatureSelection={autoFeatureSelection}
                        onAutoFeatureSelectionToggle={setAutoFeatureSelection}
                      />
                    )}
                    
                    {index === 3 && (
                      <ParameterTuning
                        selectedAlgorithm={mockAlgorithms.find(alg => alg.name === selectedAlgorithm) || null}
                        hyperparameters={hyperparameters}
                        onHyperparameterChange={handleHyperparameterChange}
                        autoTuning={autoTuning}
                        onAutoTuningToggle={setAutoTuning}
                        crossValidation={crossValidation}
                        onCrossValidationToggle={setCrossValidation}
                        cvFolds={cvFolds}
                        onCvFoldsChange={setCvFolds}
                        testSize={testSize}
                        onTestSizeChange={setTestSize}
                        randomSeed={randomSeed}
                        onRandomSeedChange={setRandomSeed}
                      />
                    )}
                    
                    {index === 4 && (
                      <ReviewAndTrain
                        dataset={selectedDataset}
                        algorithm={mockAlgorithms.find(alg => alg.name === selectedAlgorithm) || null}
                        selectedFeatures={mockFeatures.filter(f => selectedFeatures.includes(f.id))}
                        featureEngineering={featureEngineering}
                        hyperparameters={hyperparameters}
                        autoML={autoML}
                        autoFeatureSelection={autoFeatureSelection}
                        autoTuning={autoTuning}
                        crossValidation={crossValidation}
                        cvFolds={cvFolds}
                        testSize={testSize}
                        trainingJob={trainingJob}
                        onStartTraining={handleStartTraining}
                        onStopTraining={handleStopTraining}
                      />
                    )}
                  </Box>

                  {/* Navigation Buttons */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      startIcon={<BackIcon />}
                    >
                      Back
                    </Button>
                    {index < TRAINING_STEPS.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<NextIcon />}
                        disabled={!canProceedToNext(index)}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<StartIcon />}
                        onClick={handleStartTraining}
                        disabled={!canProceedToNext(index) || trainingJob?.status === 'running'}
                      >
                        {trainingJob ? 'Restart Training' : 'Start Training'}
                      </Button>
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {trainingJob && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Training Job: {trainingJob.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status: {trainingJob.status} | Progress: {Math.round(trainingJob.progress)}%
          </Typography>
        </Paper>
      )}
    </Box>
  );
}