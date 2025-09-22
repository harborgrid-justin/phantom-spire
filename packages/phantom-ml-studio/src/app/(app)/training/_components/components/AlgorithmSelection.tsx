/**
 * Algorithm Selection Step Component
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
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  Psychology as ComplexityIcon,
  Visibility as InterpretabilityIcon,
  Timer as TimerIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Algorithm, Dataset } from '../types';

interface AlgorithmSelectionProps {
  selectedAlgorithm: string;
  onAlgorithmSelect: (algorithm: string) => void;
  selectedDataset: Dataset | null;
  algorithms: Algorithm[];
  autoML: boolean;
  onAutoMLToggle: (enabled: boolean) => void;
}

const getComplexityColor = (complexity: Algorithm['complexity']) => {
  switch (complexity) {
    case 'low': return 'success' as const;
    case 'medium': return 'warning' as const;
    case 'high': return 'error' as const;
    default: return 'default' as const;
  }
};

const getInterpretabilityColor = (interpretability: Algorithm['interpretability']) => {
  switch (interpretability) {
    case 'high': return 'success' as const;
    case 'medium': return 'warning' as const;
    case 'low': return 'error' as const;
    default: return 'default' as const;
  }
};

const getTrainingTimeColor = (trainingTime: Algorithm['trainingTime']) => {
  switch (trainingTime) {
    case 'fast': return 'success' as const;
    case 'medium': return 'warning' as const;
    case 'slow': return 'error' as const;
    default: return 'default' as const;
  }
};

export default function AlgorithmSelection({
  selectedAlgorithm,
  onAlgorithmSelect,
  selectedDataset,
  algorithms,
  autoML,
  onAutoMLToggle
}: AlgorithmSelectionProps) {
  // Filter algorithms based on dataset type
  const compatibleAlgorithms = selectedDataset 
    ? algorithms.filter(alg => alg.type === selectedDataset.type)
    : algorithms;

  const selectedAlgorithmDetails = algorithms.find(alg => alg.name === selectedAlgorithm);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Choose Algorithm
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select a machine learning algorithm for your training task. The choice depends on your data type, 
        problem complexity, and performance requirements.
      </Typography>

      {!selectedDataset && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please select a dataset first to see compatible algorithms.
        </Alert>
      )}

      {/* AutoML Option */}
      <Card sx={{ mb: 3 }} data-cy="automl-option-card">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Automated ML (AutoML)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Let the system automatically select and optimize the best algorithm for your dataset
              </Typography>
            </Box>
            <Button
              variant={autoML ? 'contained' : 'outlined'}
              onClick={() => onAutoMLToggle(!autoML)}
              data-cy="automl-toggle"
            >
              {autoML ? 'Disable AutoML' : 'Enable AutoML'}
            </Button>
          </Box>
          {autoML && (
            <Alert severity="info" sx={{ mt: 2 }}>
              AutoML enabled. The system will test multiple algorithms and select the best performing one.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Manual Algorithm Selection */}
      {!autoML && selectedDataset && (
        <Card data-cy="algorithm-selection-card">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Available Algorithms for {selectedDataset.type}
            </Typography>
            
            <RadioGroup 
              value={selectedAlgorithm} 
              onChange={(e) => onAlgorithmSelect(e.target.value)}
            >
              {compatibleAlgorithms.map((algorithm) => (
                <Card 
                  key={algorithm.name}
                  variant="outlined"
                  sx={{ 
                    mb: 2,
                    '&:hover': { backgroundColor: 'action.hover' },
                    ...(selectedAlgorithm === algorithm.name && {
                      backgroundColor: 'primary.light',
                      borderColor: 'primary.main'
                    })
                  }}
                  data-cy={`algorithm-${algorithm.name}`}
                >
                  <CardContent>
                    <FormControlLabel
                      value={algorithm.name}
                      control={<Radio />}
                      sx={{ width: '100%', alignItems: 'flex-start' }}
                      label={
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6">
                              {algorithm.displayName}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip
                                icon={<ComplexityIcon />}
                                label={`${algorithm.complexity} complexity`}
                                color={getComplexityColor(algorithm.complexity)}
                                size="small"
                              />
                              <Chip
                                icon={<InterpretabilityIcon />}
                                label={`${algorithm.interpretability} interpretability`}
                                color={getInterpretabilityColor(algorithm.interpretability)}
                                size="small"
                              />
                              <Chip
                                icon={<TimerIcon />}
                                label={`${algorithm.trainingTime} training`}
                                color={getTrainingTimeColor(algorithm.trainingTime)}
                                size="small"
                              />
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {algorithm.description}
                          </Typography>
                          
                          {/* Algorithm Details Accordion */}
                          <Accordion 
                            sx={{ 
                              '&:before': { display: 'none' },
                              boxShadow: 'none',
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            <AccordionSummary expandIcon={<ExpandIcon />}>
                              <Typography variant="subtitle2">
                                View Algorithm Details
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Characteristics
                                  </Typography>
                                  <List dense>
                                    <ListItem>
                                      <ListItemIcon>
                                        <ComplexityIcon />
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary="Complexity" 
                                        secondary={algorithm.complexity}
                                      />
                                    </ListItem>
                                    <ListItem>
                                      <ListItemIcon>
                                        <InterpretabilityIcon />
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary="Interpretability" 
                                        secondary={algorithm.interpretability}
                                      />
                                    </ListItem>
                                    <ListItem>
                                      <ListItemIcon>
                                        <TimerIcon />
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary="Training Time" 
                                        secondary={algorithm.trainingTime}
                                      />
                                    </ListItem>
                                  </List>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Hyperparameters ({algorithm.hyperparameters.length})
                                  </Typography>
                                  <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                                    {algorithm.hyperparameters.slice(0, 5).map((param) => (
                                      <Box key={param.name} sx={{ mb: 1 }}>
                                        <Typography variant="caption" fontWeight="medium">
                                          {param.displayName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          {param.description}
                                        </Typography>
                                      </Box>
                                    ))}
                                    {algorithm.hyperparameters.length > 5 && (
                                      <Typography variant="caption" color="primary">
                                        +{algorithm.hyperparameters.length - 5} more parameters
                                      </Typography>
                                    )}
                                  </Box>
                                </Grid>
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>

            {compatibleAlgorithms.length === 0 && (
              <Alert severity="warning">
                No compatible algorithms found for the selected dataset type.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Algorithm Summary */}
      {selectedAlgorithmDetails && !autoML && (
        <Card sx={{ mt: 3 }} data-cy="selected-algorithm-summary">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Selected: {selectedAlgorithmDetails.displayName}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedAlgorithmDetails.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`${selectedAlgorithmDetails.complexity} complexity`}
                color={getComplexityColor(selectedAlgorithmDetails.complexity)}
                size="small"
              />
              <Chip
                label={`${selectedAlgorithmDetails.interpretability} interpretability`}
                color={getInterpretabilityColor(selectedAlgorithmDetails.interpretability)}
                size="small"
              />
              <Chip
                label={`${selectedAlgorithmDetails.trainingTime} training time`}
                color={getTrainingTimeColor(selectedAlgorithmDetails.trainingTime)}
                size="small"
              />
              <Chip
                label={`${selectedAlgorithmDetails.hyperparameters.length} parameters`}
                variant="outlined"
                size="small"
              />
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}