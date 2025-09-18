/**
 * Pipeline Templates Component
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
  Chip
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { PipelineTemplate } from '../types';

interface PipelineTemplatesProps {
  onCreatePipeline: () => void;
  onTemplateSelect: (template: PipelineTemplate) => void;
  onShowTemplateDetails: (template: PipelineTemplate) => void;
}

const templates: PipelineTemplate[] = [
  {
    id: 'classification',
    name: 'Classification',
    description: 'Predict categorical outcomes',
    category: 'supervised',
    algorithms: ['Random Forest', 'SVM', 'Neural Network'],
    defaultConfig: {
      optimizationMetric: 'accuracy',
      modelComplexity: 'medium',
      interpretabilityLevel: 'high'
    }
  },
  {
    id: 'regression',
    name: 'Regression',
    description: 'Predict continuous values',
    category: 'supervised',
    algorithms: ['Linear Regression', 'Random Forest', 'Gradient Boosting'],
    defaultConfig: {
      optimizationMetric: 'r2_score',
      modelComplexity: 'medium',
      interpretabilityLevel: 'high'
    }
  },
  {
    id: 'time-series',
    name: 'Time Series',
    description: 'Forecast time-based data',
    category: 'temporal',
    algorithms: ['ARIMA', 'Prophet', 'LSTM'],
    defaultConfig: {
      optimizationMetric: 'mape',
      modelComplexity: 'high',
      interpretabilityLevel: 'medium'
    }
  }
];

export default function PipelineTemplates({
  onCreatePipeline,
  onTemplateSelect,
  onShowTemplateDetails
}: PipelineTemplatesProps) {
  return (
    <Card data-cy="pipeline-templates">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Quick Start Templates
        </Typography>
        <Grid container spacing={2}>
          {templates.map((template) => (
            <Grid size={{ xs: 12, sm: 4 }} key={template.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  '&:hover': { backgroundColor: 'action.hover' } 
                }}
                onClick={() => onTemplateSelect(template)}
                data-cy={`template-${template.id}`}
              >
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {template.description}
                  </Typography>
                  <Chip 
                    label={template.category} 
                    size="small" 
                    sx={{ mb: 1 }} 
                  />
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="text"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowTemplateDetails(template);
                      }}
                      data-cy={`template-details-${template.id}`}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            onClick={onCreatePipeline}
            data-cy="create-custom-pipeline"
          >
            Create Custom Pipeline
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export { templates as pipelineTemplates };