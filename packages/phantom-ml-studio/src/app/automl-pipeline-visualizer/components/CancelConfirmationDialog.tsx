/**
 * Cancel Confirmation Dialog Component
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Alert,
  Box
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import { Pipeline } from '../types';

interface CancelConfirmationDialogProps {
  open: boolean;
  pipeline: Pipeline | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CancelConfirmationDialog({
  open,
  pipeline,
  onClose,
  onConfirm
}: CancelConfirmationDialogProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      data-cy="cancel-confirmation"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          Cancel Pipeline Execution
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone. All progress will be lost.
        </Alert>
        
        {pipeline && (
          <Box>
            <Typography variant="body2" gutterBottom>
              Are you sure you want to cancel the execution of:
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {pipeline.name}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Current progress: {pipeline.progress}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current step: {pipeline.currentStep}
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Keep Running
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error"
          data-cy="confirm-cancel"
        >
          Cancel Execution
        </Button>
      </DialogActions>
    </Dialog>
  );
}