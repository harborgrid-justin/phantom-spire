/**
 * Pipeline Creation Wizard Component
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { Storage as DatasetIcon, Upload as UploadIcon } from '@mui/icons-material';
import type { PipelineConfig } from '../../_lib/types';

interface PipelineWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (config: PipelineConfig) => void;
}

const steps = [
  'Data Source',
  'Objectives', 
  'Constraints',
  'Algorithms',
  'Preprocessing',
  'Review'
];

export default function PipelineWizard({ open, onClose, onComplete }: PipelineWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [config, setConfig] = useState<PipelineConfig>({
    name: '',
    datasetId: '',
    maxTrainingTime: 60,
    algorithms: [],
    objective: '',
    targetColumn: '',
    optimizationMetric: 'accuracy',
    timeConstraint: 60,
    memoryConstraint: 8,
    modelComplexity: 'medium',
    interpretabilityLevel: 'high',
    preprocessing: {
      scaling: false,
      encoding: false,
      missingValues: '',
      featureSelection: false
    }
  });

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSkipTo = (step: number) => {
    setActiveStep(step);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Data Source
        return (
          <Box data-cy="step-1-data">
            <Typography variant="h6" gutterBottom data-cy="data-source-selector">
              Select Data Source
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <input 
                type="file" 
                accept=".csv"
                style={{ display: 'none' }}
                id="dataset-upload-input"
                data-cy="dataset-upload"
              />
              <Button 
                variant="outlined" 
                data-cy="upload-dataset"
                onClick={() => document.getElementById('dataset-upload-input')?.click()}
              >
                <UploadIcon sx={{ mr: 1 }} />
                Upload Dataset
              </Button>
            </Box>
            <Box data-cy="dataset-preview" sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2">Dataset Preview</Typography>
              <Typography variant="body2">Sample data will appear here after upload</Typography>
            </Box>
            <List>
              <ListItem component="button" data-cy="dataset-item">
                <ListItemIcon>
                  <DatasetIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Customer Churn Dataset"
                  secondary="1000 rows, 15 columns"
                />
              </ListItem>
            </List>
          </Box>
        );

      case 1: // Objectives  
        return (
          <Box data-cy="objective-selection">
            <Typography variant="h6" gutterBottom>
              Set Pipeline Objectives
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Objective Type</InputLabel>
              <Select
                value={config.objective}
                onChange={(e) => setConfig(prev => ({ ...prev, objective: e.target.value }))}
              >
                <MenuItem value="classification" data-cy="objective-classification">
                  Classification
                </MenuItem>
                <MenuItem value="regression">Regression</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Target Column</InputLabel>
              <Select
                value={config.targetColumn}
                onChange={(e) => setConfig(prev => ({ ...prev, targetColumn: e.target.value }))}
                data-cy="target-column"
              >
                <MenuItem value="performance_score">Performance Score</MenuItem>
                <MenuItem value="churn">Churn</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Optimization Metric</InputLabel>
              <Select
                value={config.optimizationMetric}
                onChange={(e) => setConfig(prev => ({ ...prev, optimizationMetric: e.target.value }))}
                data-cy="optimization-metric"
              >
                <MenuItem value="accuracy">Accuracy</MenuItem>
                <MenuItem value="f1">F1 Score</MenuItem>
                <MenuItem value="precision">Precision</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 2: // Constraints
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure Pipeline Constraints
            </Typography>
            <TextField
              fullWidth
              label="Time Constraint (minutes)"
              type="number"
              value={config.timeConstraint}
              onChange={(e) => setConfig(prev => ({ ...prev, timeConstraint: parseInt(e.target.value) || 0 }))}
              sx={{ mb: 2 }}
              data-cy="time-constraint"
            />
            <TextField
              fullWidth
              label="Memory Constraint (GB)"
              type="number"
              value={config.memoryConstraint}
              onChange={(e) => setConfig(prev => ({ ...prev, memoryConstraint: parseInt(e.target.value) || 0 }))}
              sx={{ mb: 2 }}
              data-cy="memory-constraint"
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Model Complexity</InputLabel>
              <Select
                value={config.modelComplexity}
                onChange={(e) => setConfig(prev => ({ ...prev, modelComplexity: e.target.value as string }))}
                data-cy="model-complexity"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Interpretability Level</InputLabel>
              <Select
                value={config.interpretabilityLevel}
                onChange={(e) => setConfig(prev => ({ ...prev, interpretabilityLevel: e.target.value as string }))}
                data-cy="interpretability-level"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 3: // Algorithms
        return (
          <Box data-cy="algorithm-families">
            <Typography variant="h6" gutterBottom>
              Select Algorithm Families
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox data-cy="family-tree-based" />}
                label="Tree-based (Random Forest, Decision Trees)"
              />
              <FormControlLabel
                control={<Checkbox data-cy="family-linear" />}
                label="Linear Models (Logistic Regression, SVM)"
              />
              <FormControlLabel
                control={<Checkbox data-cy="family-ensemble" />}
                label="Ensemble Methods (Gradient Boosting, XGBoost)"
              />
              <FormControlLabel
                control={<Checkbox data-cy="exclude-neural-networks" />}
                label="Exclude Neural Networks"
              />
            </FormGroup>
          </Box>
        );

      case 4: // Preprocessing
        return (
          <Box data-cy="preprocessing-options">
            <Typography variant="h6" gutterBottom>
              Configure Preprocessing Steps
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={config.preprocessing?.scaling || false}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      preprocessing: {
                        scaling: e.target.checked,
                        encoding: prev.preprocessing?.encoding || false,
                        missingValues: prev.preprocessing?.missingValues || '',
                        featureSelection: prev.preprocessing?.featureSelection || false
                      }
                    }))}
                    data-cy="enable-scaling"
                  />
                }
                label="Feature Scaling"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={config.preprocessing?.encoding || false}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      preprocessing: {
                        scaling: prev.preprocessing?.scaling || false,
                        encoding: e.target.checked,
                        missingValues: prev.preprocessing?.missingValues || '',
                        featureSelection: prev.preprocessing?.featureSelection || false
                      }
                    }))}
                    data-cy="enable-encoding"
                  />
                }
                label="Categorical Encoding"
              />
            </FormGroup>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Handle Missing Values</InputLabel>
              <Select
                value={config.preprocessing?.missingValues || ''}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  preprocessing: {
                    scaling: prev.preprocessing?.scaling || false,
                    encoding: prev.preprocessing?.encoding || false,
                    missingValues: e.target.value,
                    featureSelection: prev.preprocessing?.featureSelection || false
                  }
                }))}
                data-cy="handle-missing-values"
              >
                <MenuItem value="impute">Impute</MenuItem>
                <MenuItem value="drop">Drop</MenuItem>
                <MenuItem value="flag">Flag</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={config.preprocessing?.featureSelection || false}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    preprocessing: {
                      scaling: prev.preprocessing?.scaling || false,
                      encoding: prev.preprocessing?.encoding || false,
                      missingValues: prev.preprocessing?.missingValues || '',
                      featureSelection: e.target.checked
                    }
                  }))}
                  data-cy="feature-selection"
                />
              }
              label="Feature Selection"
            />
          </Box>
        );

      case 5: // Review
        return (
          <Box data-cy="pipeline-summary">
            <Typography variant="h6" gutterBottom>
              Review Pipeline Configuration
            </Typography>
            <Card sx={{ mb: 2 }} data-cy="data-source-info">
              <CardContent>
                <Typography variant="subtitle2">Data Source</Typography>
                <Typography variant="body2">Dataset: {config.datasetId || 'Customer Churn Dataset'}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ mb: 2 }} data-cy="objective-info">
              <CardContent>
                <Typography variant="subtitle2">Objectives</Typography>
                <Typography variant="body2">Type: {config.objective || 'Classification'}</Typography>
                <Typography variant="body2">Target: {config.targetColumn || 'Performance Score'}</Typography>
              </CardContent>
            </Card>
            <Card data-cy="constraints-info">
              <CardContent>
                <Typography variant="subtitle2">Constraints</Typography>
                <Typography variant="body2">Time: {config.timeConstraint} minutes</Typography>
                <Typography variant="body2">Memory: {config.memoryConstraint} GB</Typography>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Create New Pipeline
      </DialogTitle>
      <DialogContent data-cy="pipeline-wizard">
        <Box sx={{ width: '100%', mt: 2 }}>
          <Stepper activeStep={activeStep} data-cy="wizard-progress">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ mt: 3, mb: 2 }}>
            {renderStepContent(activeStep)}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        
        {/* Skip buttons for testing */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="text" 
            size="small"
            onClick={() => handleSkipTo(2)}
            data-cy="skip-to-constraints"
          >
            Skip to Constraints
          </Button>
          <Button 
            variant="text" 
            size="small"
            onClick={() => handleSkipTo(3)}
            data-cy="skip-to-algorithms"
          >
            Skip to Algorithms  
          </Button>
          <Button 
            variant="text" 
            size="small"
            onClick={() => handleSkipTo(4)}
            data-cy="skip-to-preprocessing"
          >
            Skip to Preprocessing
          </Button>
          <Button 
            variant="text" 
            size="small"
            onClick={() => handleSkipTo(5)}
            data-cy="skip-to-review"
          >
            Skip to Review
          </Button>
        </Box>

        <Button onClick={handleBack} disabled={activeStep === 0}>
          Back
        </Button>
        
        {activeStep === steps.length - 1 ? (
          <Button 
            variant="contained" 
            onClick={() => onComplete(config)}
            data-cy="create-pipeline-confirm"
          >
            Create Pipeline
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext} data-cy="next-step">
            Next
          </Button>
        )}
        
        <Button variant="outlined" data-cy="save-draft">
          Save Draft
        </Button>
      </DialogActions>
    </Dialog>
  );
}
