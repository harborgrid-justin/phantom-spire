/**
 * Step 1: Select Dataset - Dataset selection component
 */

import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  Box, 
  Chip 
} from '@mui/material';
import { Dataset as DatasetIcon } from '@mui/icons-material';
import { Dataset } from '../../types';
import { sampleDatasets } from '../../../_lib/data/sampleData';

interface SelectDatasetStepProps {
  selectedDataset: Dataset | null;
  onDatasetSelect: (dataset: Dataset) => void;
  onNext: () => void;
}

export function SelectDatasetStep({ 
  selectedDataset, 
  onDatasetSelect, 
  onNext 
}: SelectDatasetStepProps) {
  return (
    <Card elevation={3} data-cy="card-select-dataset">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Select Dataset
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Choose a sample dataset or upload your own
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
          gap: 3, 
          mb: 3 
        }}>
          {sampleDatasets.map((dataset) => (
            <Card 
              key={dataset.id}
              elevation={selectedDataset?.id === dataset.id ? 3 : 1}
              sx={{ 
                cursor: 'pointer',
                border: selectedDataset?.id === dataset.id ? 2 : 1,
                borderColor: selectedDataset?.id === dataset.id ? 'primary.main' : 'grey.300',
                '&:hover': { elevation: 2 }
              }}
              onClick={() => onDatasetSelect(dataset)}
              data-cy="dataset-item"
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DatasetIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">{dataset.name}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {dataset.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`${dataset.rows.toLocaleString()} rows`} size="small" />
                  <Chip label={`${dataset.columns} columns`} size="small" />
                  <Chip label={dataset.size} size="small" />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Button
          variant="contained"
          onClick={onNext}
          disabled={!selectedDataset}
          data-cy="next-step"
        >
          Next Step
        </Button>
      </CardContent>
    </Card>
  );
}
