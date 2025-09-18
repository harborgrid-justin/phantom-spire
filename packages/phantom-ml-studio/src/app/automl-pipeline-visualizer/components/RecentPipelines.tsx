/**
 * Recent Pipelines Component
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  MoreVert
} from '@mui/icons-material';
import { Pipeline } from '../types';

interface RecentPipelinesProps {
  pipelines: Pipeline[];
  selectedPipeline: Pipeline | null;
  onPipelineSelect: (pipeline: Pipeline) => void;
  onPipelineAction: (pipeline: Pipeline, action: 'start' | 'pause' | 'stop' | 'clone') => void;
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

const getEstimatedTimeRemaining = (pipeline: Pipeline) => {
  if (pipeline.status !== 'running' || pipeline.estimatedTime === 0) return null;
  
  const elapsed = Date.now() - pipeline.startTime.getTime();
  const remaining = pipeline.estimatedTime - elapsed;
  
  return remaining > 0 ? formatDuration(remaining) : 'Calculating...';
};

export default function RecentPipelines({
  pipelines,
  selectedPipeline,
  onPipelineSelect,
  onPipelineAction
}: RecentPipelinesProps) {
  return (
    <Card data-cy="recent-pipelines">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Pipelines
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Algorithm</TableCell>
                <TableCell>Accuracy</TableCell>
                <TableCell>Time Remaining</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pipelines.map((pipeline) => (
                <TableRow 
                  key={pipeline.id}
                  hover
                  selected={selectedPipeline?.id === pipeline.id}
                  onClick={() => onPipelineSelect(pipeline)}
                  sx={{ cursor: 'pointer' }}
                  data-cy={`pipeline-row-${pipeline.id}`}
                >
                  <TableCell>
                    <Typography variant="subtitle2">
                      {pipeline.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {pipeline.currentStep}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={pipeline.status} 
                      color={getStatusColor(pipeline.status)}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: 100 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={pipeline.progress} 
                        sx={{ mb: 0.5 }}
                      />
                      <Typography variant="caption">
                        {pipeline.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {pipeline.algorithm !== 'Not Selected' ? (
                      <Chip 
                        label={pipeline.algorithm} 
                        variant="outlined" 
                        size="small" 
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not Selected
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {pipeline.accuracy > 0 ? (
                      <Typography variant="body2">
                        {(pipeline.accuracy * 100).toFixed(1)}%
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {pipeline.status === 'running' && getEstimatedTimeRemaining(pipeline) ? (
                      <Typography variant="body2">
                        {getEstimatedTimeRemaining(pipeline)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {pipeline.status === 'pending' && (
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPipelineAction(pipeline, 'start');
                          }}
                          data-cy={`start-pipeline-${pipeline.id}`}
                        >
                          <PlayArrow />
                        </IconButton>
                      )}
                      {pipeline.status === 'running' && (
                        <>
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPipelineAction(pipeline, 'pause');
                            }}
                            data-cy={`pause-pipeline-${pipeline.id}`}
                          >
                            <Pause />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPipelineAction(pipeline, 'stop');
                            }}
                            data-cy={`stop-pipeline-${pipeline.id}`}
                          >
                            <Stop />
                          </IconButton>
                        </>
                      )}
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPipelineAction(pipeline, 'clone');
                        }}
                        data-cy={`clone-pipeline-${pipeline.id}`}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {pipelines.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No pipelines found. Create your first pipeline to get started.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}