/**
 * Step 2: Choose Target Column - Target selection component
 */

import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Chip 
} from '@mui/material';
import { ViewColumn as ColumnIcon } from '@mui/icons-material';
import { Column } from '../../types';
import { sampleColumns } from '../../../_lib/data/sampleData';

interface ChooseTargetStepProps {
  selectedTargetColumn: string;
  onTargetSelect: (columnName: string) => void;
  onNext: () => void;
}

export function ChooseTargetStep({ 
  selectedTargetColumn, 
  onTargetSelect, 
  onNext 
}: ChooseTargetStepProps) {
  return (
    <Card elevation={3} data-cy="card-choose-target">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Choose Target Column
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Select the column you want to predict
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
          gap: 2, 
          mb: 3 
        }}>
          {sampleColumns.map((column) => (
            <Card 
              key={column.name}
              elevation={selectedTargetColumn === column.name ? 3 : 1}
              sx={{ 
                cursor: 'pointer',
                border: selectedTargetColumn === column.name ? 2 : 1,
                borderColor: selectedTargetColumn === column.name ? 'primary.main' : 'grey.300',
                '&:hover': { elevation: 2 }
              }}
              onClick={() => onTargetSelect(column.name)}
              data-cy={`column-${column.name}`}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ColumnIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">{column.name}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Type: {column.type}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={`${column.unique} unique`} size="small" />
                  {column.nullCount > 0 && (
                    <Chip label={`${column.nullCount} nulls`} size="small" color="warning" />
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Button
          variant="contained"
          onClick={onNext}
          disabled={!selectedTargetColumn}
          data-cy="next-step"
        >
          Next Step
        </Button>
      </CardContent>
    </Card>
  );
}
