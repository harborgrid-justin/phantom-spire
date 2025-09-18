/**
 * Parameter Tuning Step Component
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  Info as InfoIcon,
  AutoFixHigh as AutoTuneIcon,
  Tune as ManualTuneIcon,
  Psychology as AdvancedIcon,
  Speed as PerformanceIcon
} from '@mui/icons-material';
import { Algorithm, HyperparameterConfig, HyperparameterValue } from '../types';

interface ParameterTuningProps {
  selectedAlgorithm: Algorithm | null;
  hyperparameters: Record<string, HyperparameterValue>;
  onHyperparameterChange: (name: string, value: HyperparameterValue) => void;
  autoTuning: boolean;
  onAutoTuningToggle: (enabled: boolean) => void;
  crossValidation: boolean;
  onCrossValidationToggle: (enabled: boolean) => void;
  cvFolds: number;
  onCvFoldsChange: (folds: number) => void;
  testSize: number;
  onTestSizeChange: (size: number) => void;
  randomSeed: number;
  onRandomSeedChange: (seed: number) => void;
}

export default function ParameterTuning({
  selectedAlgorithm,
  hyperparameters,
  onHyperparameterChange,
  autoTuning,
  onAutoTuningToggle,
  crossValidation,
  onCrossValidationToggle,
  cvFolds,
  onCvFoldsChange,
  testSize,
  onTestSizeChange,
  randomSeed,
  onRandomSeedChange
}: ParameterTuningProps) {
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('basic');

  if (!selectedAlgorithm) {
    return (
      <Alert severity="warning">
        Please select an algorithm first to configure parameters.
      </Alert>
    );
  }

  const basicParams = selectedAlgorithm.hyperparameters.filter(p => !p.advanced);
  const advancedParams = selectedAlgorithm.hyperparameters.filter(p => p.advanced);

  const renderHyperparameter = (param: HyperparameterConfig) => {
    const value = hyperparameters[param.name] || param.default;

    switch (param.type) {
      case 'int':
      case 'float':
        if (param.min !== undefined && param.max !== undefined) {
          // Render as slider for ranged numeric parameters
          return (
            <Box key={param.name} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">
                  {param.displayName}
                </Typography>
                <Tooltip title={param.description}>
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={typeof value === 'number' ? value : param.default as number}
                  min={param.min}
                  max={param.max}
                  step={param.type === 'float' ? (param.step || 0.01) : (param.step || 1)}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, newValue) => onHyperparameterChange(param.name, newValue as number)}
                  disabled={autoTuning}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Min: {param.min}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Current: {value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Max: {param.max}
                </Typography>
              </Box>
            </Box>
          );
        } else {
          // Render as text field for numeric parameters without range
          return (
            <TextField
              key={param.name}
              fullWidth
              label={param.displayName}
              type="number"
              value={value}
              onChange={(e) => onHyperparameterChange(
                param.name,
                param.type === 'int' ? parseInt(e.target.value) : parseFloat(e.target.value)
              )}
              helperText={param.description}
              disabled={autoTuning}
              sx={{ mb: 2 }}
            />
          );
        }

      case 'select':
        return (
          <FormControl key={param.name} fullWidth sx={{ mb: 2 }}>
            <InputLabel>{param.displayName}</InputLabel>
            <Select
              value={value}
              label={param.displayName}
              onChange={(e) => onHyperparameterChange(param.name, e.target.value)}
              disabled={autoTuning}
            >
              {param.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {param.description}
            </Typography>
          </FormControl>
        );

      case 'bool':
        return (
          <Box key={param.name} sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(value)}
                  onChange={(e) => onHyperparameterChange(param.name, e.target.checked)}
                  disabled={autoTuning}
                />
              }
              label={param.displayName}
            />
            <Typography variant="caption" color="text.secondary" display="block">
              {param.description}
            </Typography>
          </Box>
        );

      case 'string':
        return (
          <TextField
            key={param.name}
            fullWidth
            label={param.displayName}
            value={value}
            onChange={(e) => onHyperparameterChange(param.name, e.target.value)}
            helperText={param.description}
            disabled={autoTuning}
            sx={{ mb: 2 }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configure Parameters
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Fine-tune hyperparameters and training settings for optimal model performance.
      </Typography>

      {/* Auto-tuning Option */}
      <Card sx={{ mb: 3 }} data-cy="auto-tuning-card">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoTuneIcon />
              <Typography variant="h6">
                Automatic Hyperparameter Tuning
              </Typography>
            </Box>
            <Switch
              checked={autoTuning}
              onChange={(e) => onAutoTuningToggle(e.target.checked)}
              data-cy="auto-tuning-toggle"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Automatically search for the best hyperparameter combination using grid search or random search.
          </Typography>
          {autoTuning && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Auto-tuning enabled. The system will automatically optimize hyperparameters during training.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Algorithm Information */}
      <Card sx={{ mb: 3 }} data-cy="algorithm-info-card">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {selectedAlgorithm.displayName} Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedAlgorithm.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<PerformanceIcon />}
              label={`${selectedAlgorithm.complexity} complexity`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${selectedAlgorithm.hyperparameters.length} parameters`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${basicParams.length} basic, ${advancedParams.length} advanced`}
              size="small"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Hyperparameters */}
      {!autoTuning && (
        <>
          {/* Basic Parameters */}
          <Accordion 
            expanded={expandedAccordion === 'basic'}
            onChange={(_, isExpanded) => setExpandedAccordion(isExpanded ? 'basic' : false)}
            sx={{ mb: 2 }}
            data-cy="basic-params-accordion"
          >
            <AccordionSummary expandIcon={<ExpandIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ManualTuneIcon />
                <Typography variant="h6">
                  Basic Parameters ({basicParams.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {basicParams.map((param) => (
                  <Grid size={{ xs: 12, md: 6 }} key={param.name}>
                    {renderHyperparameter(param)}
                  </Grid>
                ))}
              </Grid>
              {basicParams.length === 0 && (
                <Alert severity="info">
                  This algorithm has no basic parameters to configure.
                </Alert>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Advanced Parameters */}
          {advancedParams.length > 0 && (
            <Accordion 
              expanded={expandedAccordion === 'advanced'}
              onChange={(_, isExpanded) => setExpandedAccordion(isExpanded ? 'advanced' : false)}
              sx={{ mb: 2 }}
              data-cy="advanced-params-accordion"
            >
              <AccordionSummary expandIcon={<ExpandIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AdvancedIcon />
                  <Typography variant="h6">
                    Advanced Parameters ({advancedParams.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Advanced parameters should only be modified by experienced users.
                </Alert>
                <Grid container spacing={2}>
                  {advancedParams.map((param) => (
                    <Grid size={{ xs: 12, md: 6 }} key={param.name}>
                      {renderHyperparameter(param)}
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
        </>
      )}

      {/* Training Configuration */}
      <Accordion 
        expanded={expandedAccordion === 'training'}
        onChange={(_, isExpanded) => setExpandedAccordion(isExpanded ? 'training' : false)}
        sx={{ mb: 2 }}
        data-cy="training-config-accordion"
      >
        <AccordionSummary expandIcon={<ExpandIcon />}>
          <Typography variant="h6">
            Training Configuration
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Data Split
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      Test Size: {Math.round(testSize * 100)}%
                    </Typography>
                    <Slider
                      value={testSize}
                      min={0.1}
                      max={0.5}
                      step={0.05}
                      marks={[
                        { value: 0.1, label: '10%' },
                        { value: 0.2, label: '20%' },
                        { value: 0.3, label: '30%' }
                      ]}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                      onChange={(_, value) => onTestSizeChange(value as number)}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    type="number"
                    label="Random Seed"
                    value={randomSeed}
                    onChange={(e) => onRandomSeedChange(parseInt(e.target.value))}
                    helperText="Set for reproducible results"
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Cross Validation
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={crossValidation}
                        onChange={(e) => onCrossValidationToggle(e.target.checked)}
                      />
                    }
                    label="Enable Cross Validation"
                    sx={{ mb: 2 }}
                  />
                  {crossValidation && (
                    <TextField
                      fullWidth
                      type="number"
                      label="Number of Folds"
                      value={cvFolds}
                      onChange={(e) => onCvFoldsChange(parseInt(e.target.value))}
                      inputProps={{ min: 3, max: 10 }}
                      helperText="Typically 5 or 10 folds"
                    />
                  )}
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Cross validation provides more robust performance estimates
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Current Configuration Summary */}
      <Card data-cy="config-summary-card">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Configuration Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                Algorithm Settings
              </Typography>
              {autoTuning ? (
                <Alert severity="info" sx={{ mb: 1 }}>
                  Auto-tuning enabled - parameters will be optimized automatically
                </Alert>
              ) : (
                <Box>
                  {Object.entries(hyperparameters).slice(0, 3).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {key}:
                      </Typography>
                      <Typography variant="body2">
                        {String(value)}
                      </Typography>
                    </Box>
                  ))}
                  {Object.keys(hyperparameters).length > 3 && (
                    <Typography variant="caption" color="primary">
                      +{Object.keys(hyperparameters).length - 3} more parameters
                    </Typography>
                  )}
                </Box>
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                Training Settings
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Test Size:
                </Typography>
                <Typography variant="body2">
                  {Math.round(testSize * 100)}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Cross Validation:
                </Typography>
                <Typography variant="body2">
                  {crossValidation ? `${cvFolds}-fold` : 'Disabled'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Random Seed:
                </Typography>
                <Typography variant="body2">
                  {randomSeed}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}