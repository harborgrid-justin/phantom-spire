/**
 * Step 0: Create New Model - Initial step component
 */

import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface CreateModelStepProps {
  onNext: () => void;
}

export function CreateModelStep({ onNext }: CreateModelStepProps) {
  return (
    <Card elevation={3} data-cy="card-create-model">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Create New Model
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Start building your machine learning model by selecting a dataset
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddIcon />}
          onClick={onNext}
          data-cy="create-new-model"
        >
          Create New Model
        </Button>
      </CardContent>
    </Card>
  );
}
