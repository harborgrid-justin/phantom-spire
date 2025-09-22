/**
 * Pipeline Overview Component
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  LinearProgress,
  Button
} from '@mui/material';
import { PlayArrow, Pause, Stop, Replay } from '@mui/icons-material';
import Grid from '@mui/material/Grid2';
import { Pipeline } from '../types';

interface PipelineOverviewProps {
  pipeline: Pipeline | null;
  onExecute?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
}

const getStatusColor = (status: Pipeline['status']) => {
  switch (status) {
    case 'running': return 'primary';
    case 'completed': return 'success';
    case 'failed': return 'error';
    case 'paused': return 'warning';
    case 'pending': return 'default';
    default: return 'default';
  }
};

const formatDuration = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

const getElapsedTime = (startTime: Date) => {
  return formatDuration(Date.now() - startTime.getTime());
};

const getEstimatedTimeRemaining = (pipeline: Pipeline) => {
  if (pipeline.status !== 'running' || pipeline.estimatedTime === 0) return null;
  
  const elapsed = Date.now() - pipeline.startTime.getTime();
  const remaining = pipeline.estimatedTime - elapsed;
  
  return remaining > 0 ? formatDuration(remaining) : 'Calculating...';
};

export default function PipelineOverview({ 
  pipeline, 
  onExecute, 
  onPause, 
  onResume, 
  onStop 
}: PipelineOverviewProps) {
  if (!pipeline) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pipeline Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a pipeline to view details
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pipeline Overview
        </Typography>
        
        {/* Execution Status Indicators */}
        {pipeline.status === 'running' && (
          <Box sx={{ mb: 2 }} data-cy="pipeline-executing">
            <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
              🔄 Pipeline Executing
            </Typography>
          </Box>
        )}
        
        {pipeline.status === 'paused' && (
          <Box sx={{ mb: 2 }} data-cy="execution-paused">
            <Typography variant="body2" color="warning.main" sx={{ fontWeight: 'bold' }}>
              ⏸️ Execution Paused
            </Typography>
            <Typography variant="caption" color="text.secondary" data-cy="pause-reason">
              Manual pause requested by user
            </Typography>
          </Box>
        )}
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box data-cy="pipeline-basic-info">
              <Typography variant="subtitle2" gutterBottom>
                {pipeline.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2">Status:</Typography>
                <Chip 
                  label={pipeline.status} 
                  color={getStatusColor(pipeline.status)}
                  size="small" 
                />
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }} data-cy="current-step">
                Current Step: {pipeline.currentStep}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Algorithm: {pipeline.algorithm}
              </Typography>
              {pipeline.accuracy > 0 && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Accuracy: {(pipeline.accuracy * 100).toFixed(1)}%
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box data-cy="pipeline-timing-info">
              <Typography variant="subtitle2" gutterBottom>
                Timing Information
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Started: {pipeline.startTime.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Elapsed Time: {getElapsedTime(pipeline.startTime)}
              </Typography>
              {getEstimatedTimeRemaining(pipeline) && (
                <Typography variant="body2" sx={{ mb: 1 }} data-cy="estimated-time-remaining">
                  Estimated Remaining: {getEstimatedTimeRemaining(pipeline)}
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box data-cy="pipeline-progress-info">
              <Typography variant="subtitle2" gutterBottom>
                Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} data-cy="execution-progress">
                <LinearProgress 
                  variant="determinate" 
                  value={pipeline.progress} 
                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  data-cy="progress-bar"
                />
                <Typography variant="body2" sx={{ minWidth: 40 }}>
                  {pipeline.progress}%
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
        {pipeline.status === 'pending' && onExecute && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrow />}
            data-cy="execute-pipeline"
            size="small"
            onClick={onExecute}
          >
            Execute Pipeline
          </Button>
        )}
        
        {pipeline.status === 'running' && onPause && (
          <Button
            variant="outlined"
            startIcon={<Pause />}
            data-cy="pause-execution"
            size="small"
            onClick={onPause}
          >
            Pause
          </Button>
        )}
        
        {pipeline.status === 'running' && onStop && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Stop />}
            data-cy="cancel-execution"
            size="small"
            onClick={onStop}
            sx={{ ml: 1 }}
          >
            Cancel
          </Button>
        )}
        
        {pipeline.status === 'paused' && onResume && (
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            data-cy="resume-execution"
            size="small"
            onClick={onResume}
          >
            Resume
          </Button>
        )}
      </CardActions>
    </Card>
  );
}