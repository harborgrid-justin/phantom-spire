/**
 * Run Analysis Dialog Component
 * Modal dialog for configuring and running bias analysis
 */

import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Chip,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { RunAnalysisDialogProps } from '../types';

export function RunAnalysisDialog({
  open,
  config,
  onClose,
  onConfigChange,
  onRunAnalysis
}: RunAnalysisDialogProps) {
  const availableModels = [
    { id: 'model_hiring', name: 'Hiring Decision Model', type: 'Classification' },
    { id: 'model_credit', name: 'Credit Approval Model', type: 'Binary Classification' },
    { id: 'model_healthcare', name: 'Treatment Recommendation', type: 'Multi-class Classification' },
    { id: 'model_insurance', name: 'Insurance Risk Assessment', type: 'Regression' },
    { id: 'model_loan', name: 'Loan Default Prediction', type: 'Binary Classification' }
  ];

  const protectedAttributeOptions = [
    'gender', 'race', 'age', 'ethnicity', 'religion', 
    'disability', 'marital_status', 'sexual_orientation', 
    'income', 'education', 'geographic_location'
  ];

  const handleModelChange = (modelId: string) => {
    onConfigChange({
      ...config,
      modelId,
      // Reset protected attributes when model changes
      protectedAttributes: []
    });
  };

  const handleProtectedAttributeToggle = (attribute: string) => {
    const updatedAttributes = config.protectedAttributes.includes(attribute)
      ? config.protectedAttributes.filter(attr => attr !== attribute)
      : [...config.protectedAttributes, attribute];
    
    onConfigChange({
      ...config,
      protectedAttributes: updatedAttributes
    });
  };

  const handleSensitivityChange = (level: string) => {
    onConfigChange({
      ...config,
      sensitivityLevel: level as 'low' | 'medium' | 'high'
    });
  };

  const selectedModel = availableModels.find(m => m.id === config.modelId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          Run Bias Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure bias detection analysis for your model
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            {/* Model Selection */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Select Model</InputLabel>
                <Select
                  value={config.modelId}
                  onChange={(e) => handleModelChange(e.target.value)}
                  label="Select Model"
                  data-cy="model-selector"
                >
                  {availableModels.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      <Box>
                        <Typography variant="body2">{model.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {model.type}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedModel && (
                <Box mt={1}>
                  <Chip 
                    label={selectedModel.type} 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
              )}
            </Grid>

            {/* Protected Attributes */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Protected Attributes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select the attributes to analyze for potential bias (minimum 1 required)
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }} data-cy="protected-attributes">
                {protectedAttributeOptions.map((attribute) => (
                  <Chip
                    key={attribute}
                    label={attribute.replace('_', ' ')}
                    onClick={() => handleProtectedAttributeToggle(attribute)}
                    color={config.protectedAttributes.includes(attribute) ? 'primary' : 'default'}
                    variant={config.protectedAttributes.includes(attribute) ? 'filled' : 'outlined'}
                    size="small"
                    clickable
                    data-cy={`attribute-${attribute}`}
                  />
                ))}
              </Box>

              {config.protectedAttributes.length > 0 && (
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary">
                    Selected: {config.protectedAttributes.length} attribute{config.protectedAttributes.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Sensitivity Level */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Sensitivity Level</InputLabel>
                <Select
                  value={config.sensitivityLevel}
                  onChange={(e) => handleSensitivityChange(e.target.value)}
                  label="Sensitivity Level"
                >
                  <MenuItem value="low">
                    <Box>
                      <Typography variant="body2">Low Sensitivity</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Basic fairness checks, faster analysis
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="medium">
                    <Box>
                      <Typography variant="body2">Medium Sensitivity</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Comprehensive analysis with standard thresholds
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="high">
                    <Box>
                      <Typography variant="body2">High Sensitivity</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Strict fairness requirements, detailed analysis
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Configuration Summary */}
            {config.modelId && config.protectedAttributes.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Analysis Configuration:</strong>
                  </Typography>
                  <Typography variant="body2">
                    • Model: {selectedModel?.name}
                  </Typography>
                  <Typography variant="body2">
                    • Protected Attributes: {config.protectedAttributes.join(', ')}
                  </Typography>
                  <Typography variant="body2">
                    • Sensitivity: {config.sensitivityLevel.charAt(0).toUpperCase() + config.sensitivityLevel.slice(1)}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Analysis Metrics Preview */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Analysis Will Include:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Demographic Parity" size="small" variant="outlined" />
                <Chip label="Equalized Odds" size="small" variant="outlined" />
                <Chip label="Equal Opportunity" size="small" variant="outlined" />
                <Chip label="Calibration" size="small" variant="outlined" />
                {config.sensitivityLevel === 'high' && (
                  <>
                    <Chip label="Individual Fairness" size="small" variant="outlined" />
                    <Chip label="Counterfactual Fairness" size="small" variant="outlined" />
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onRunAnalysis}
          disabled={!config.modelId || config.protectedAttributes.length === 0}
          data-cy="start-analysis"
        >
          Run Analysis
        </Button>
      </DialogActions>
    </Dialog>
  );
}