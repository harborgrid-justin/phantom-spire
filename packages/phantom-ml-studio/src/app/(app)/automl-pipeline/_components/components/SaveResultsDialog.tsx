/**
 * Save Results Dialog Component
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Chip,
  Alert
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { Pipeline } from '../../_lib/types';

interface SaveResultsDialogProps {
  open: boolean;
  pipeline: Pipeline | null;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function SaveResultsDialog({
  open,
  pipeline,
  onClose,
  onSave
}: SaveResultsDialogProps) {
  const [resultsName, setResultsName] = useState('');
  
  const handleSave = () => {
    if (resultsName.trim()) {
      onSave(resultsName.trim());
      setResultsName('');
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Save color="primary" />
          Save Execution Results
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {pipeline && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Save results for completed pipeline:
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {pipeline.name}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={`Accuracy: ${(pipeline.accuracy * 100).toFixed(1)}%`}
                color="success"
                size="small"
              />
              <Chip 
                label={`Algorithm: ${pipeline.algorithm}`}
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
        )}
        
        <TextField
          autoFocus
          margin="dense"
          label="Results Name"
          fullWidth
          variant="outlined"
          value={resultsName}
          onChange={(e) => setResultsName(e.target.value)}
          placeholder="e.g., AutoML Results - Employee Performance"
          data-cy="results-name"
          helperText="Enter a descriptive name for these results"
        />
        
        <Alert severity="info" sx={{ mt: 2 }}>
          Results will include model artifacts, performance metrics, and execution logs.
        </Alert>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={!resultsName.trim()}
          data-cy="save-results-confirm"
        >
          Save Results
        </Button>
      </DialogActions>
    </Dialog>
  );
}