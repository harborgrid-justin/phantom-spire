/**
 * Pipeline Steps Component
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  CheckCircle,
  PlayCircle,
  Schedule,
  Error
} from '@mui/icons-material';
import { PipelineStep } from '../../_lib/types';

interface PipelineStepsProps {
  steps: PipelineStep[];
}

const getStepIcon = (status: PipelineStep['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle color="success" />;
    case 'running':
      return <PlayCircle color="primary" />;
    case 'pending':
      return <Schedule color="disabled" />;
    case 'failed':
      return <Error color="error" />;
    default:
      return <Schedule color="disabled" />;
  }
};

const getStepColor = (status: PipelineStep['status']) => {
  switch (status) {
    case 'completed': return 'success';
    case 'running': return 'primary';
    case 'failed': return 'error';
    default: return 'default';
  }
};

const formatDuration = (milliseconds: number) => {
  if (milliseconds === 0) return '-';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

const getCurrentStepProgress = (step: PipelineStep) => {
  if (step.status === 'running') {
    // Simulate progress for running steps
    return Math.min(75, Math.random() * 100);
  }
  return step.status === 'completed' ? 100 : 0;
};

export default function PipelineSteps({ steps }: PipelineStepsProps) {
  const activeStep = steps.findIndex(step => step.status === 'running');
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pipeline Steps
        </Typography>
        <Stepper activeStep={activeStep} orientation="vertical" data-cy="step-status-list">
          {steps.map((step, index) => {
            // Map step names to test-friendly identifiers
            const stepTestId = step.name.toLowerCase()
              .replace(//s+/g, '-')
              .replace(/[^a-z0-9-]/g, '');
            
            return (
              <Step 
                key={step.id} 
                data-cy={`pipeline-step-${step.id}`}
                className={step.status === 'running' ? 'executing' : step.status}
              >
                <StepLabel 
                  icon={getStepIcon(step.status)}
                  data-cy={`step-${stepTestId}`}
                  className={step.status === 'running' ? 'executing' : step.status}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {step.name}
                    </Typography>
                    <Chip 
                      label={step.status} 
                      color={getStepColor(step.status)}
                      size="small" 
                    />
                  </Box>
                </StepLabel>
              <StepContent>
                <Box sx={{ pb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {formatDuration(step.duration)}
                    </Typography>
                    {step.status === 'running' && (
                      <Typography variant="body2" color="primary">
                        In Progress...
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Progress bar for running steps */}
                  {step.status === 'running' && (
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={getCurrentStepProgress(step)} 
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}
                  
                  {/* Step metrics if available */}
                  {step.metrics && Object.keys(step.metrics).length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Metrics:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {Object.entries(step.metrics).map(([key, value]) => (
                          <Chip 
                            key={key}
                            label={`${key}: ${typeof value === 'number' ? value.toFixed(3) : value}`}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {/* Step-specific content */}
                  {step.status === 'completed' && (
                    <Typography variant="body2" color="success.main">
                      ✓ Step completed successfully
                    </Typography>
                  )}
                  
                  {step.status === 'failed' && (
                    <Typography variant="body2" color="error.main">
                      ✗ Step failed - check logs for details
                    </Typography>
                  )}
                  
                  {step.status === 'pending' && (
                    <Typography variant="body2" color="text.secondary">
                      Waiting for previous steps to complete
                    </Typography>
                  )}
                </Box>
              </StepContent>
            </Step>
            );
          })}
        </Stepper>
        
        {steps.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No pipeline steps available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}