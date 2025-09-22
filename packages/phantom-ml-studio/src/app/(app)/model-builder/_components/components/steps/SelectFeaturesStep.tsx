/**
 * Step 3: Select Features - Feature selection component
 */

import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Checkbox 
} from '@mui/material';
import { sampleColumns } from '../../data/sampleData';

interface SelectFeaturesStepProps {
  selectedFeatures: string[];
  selectedTargetColumn: string;
  onFeaturesChange: (features: string[]) => void;
  onNext: () => void;
}

export function SelectFeaturesStep({ 
  selectedFeatures, 
  selectedTargetColumn, 
  onFeaturesChange, 
  onNext 
}: SelectFeaturesStepProps) {
  const handleSelectAll = () => {
    const allFeatures = sampleColumns
      .filter(col => col.name !== selectedTargetColumn)
      .map(col => col.name);
    onFeaturesChange(allFeatures);
  };

  const handleFeatureToggle = (columnName: string) => {
    if (selectedFeatures.includes(columnName)) {
      onFeaturesChange(selectedFeatures.filter(f => f !== columnName));
    } else {
      onFeaturesChange([...selectedFeatures, columnName]);
    }
  };

  return (
    <Card elevation={3} data-cy="card-select-features">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Select Features
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Choose which columns to use as features for your model
        </Typography>
        
        <Button
          variant="outlined"
          onClick={handleSelectAll}
          sx={{ mb: 3 }}
          data-cy="select-all-features"
        >
          Select All Features
        </Button>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
          gap: 2, 
          mb: 3 
        }}>
          {sampleColumns.filter(col => col.name !== selectedTargetColumn).map((column) => (
            <Card 
              key={column.name}
              elevation={selectedFeatures.includes(column.name) ? 3 : 1}
              sx={{ 
                cursor: 'pointer',
                border: selectedFeatures.includes(column.name) ? 2 : 1,
                borderColor: selectedFeatures.includes(column.name) ? 'primary.main' : 'grey.300',
                '&:hover': { elevation: 2 }
              }}
              onClick={() => handleFeatureToggle(column.name)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Checkbox
                    checked={selectedFeatures.includes(column.name)}
                    sx={{ p: 0, mr: 1 }}
                  />
                  <Typography variant="h6">{column.name}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Type: {column.type}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Button
          variant="contained"
          onClick={onNext}
          disabled={selectedFeatures.length === 0}
          data-cy="next-step"
        >
          Next Step
        </Button>
      </CardContent>
    </Card>
  );
}
