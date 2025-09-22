/**
 * Pipeline Execution Dialog Component
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { Pipeline } from '../../_lib/types';

interface ExecutionDialogProps {
  open: boolean;
  pipeline: Pipeline | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ExecutionDialog({ 
  open, 
  pipeline, 
  onClose, 
  onConfirm 
}: ExecutionDialogProps) {
  if (!pipeline) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      data-cy="execution-confirmation"
    >
      <DialogTitle>
        Confirm Pipeline Execution
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to execute the following pipeline?
        </DialogContentText>
        
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {pipeline.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Pipeline ID: {pipeline.id}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={`Dataset: ${pipeline.datasetId}`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`Algorithm: ${pipeline.algorithm}`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`Est. Time: ${pipeline.estimatedTime}min`} 
              size="small" 
              variant="outlined" 
            />
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This will start the AutoML pipeline execution and may take some time to complete.
          You can monitor the progress in real-time once execution begins.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={onConfirm}
          data-cy="confirm-execution"
        >
          Execute Pipeline
        </Button>
      </DialogActions>
    </Dialog>
  );
}