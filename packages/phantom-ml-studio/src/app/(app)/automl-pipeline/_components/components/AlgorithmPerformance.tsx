/**
 * Algorithm Performance Component
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip
} from '@mui/material';
import { AlgorithmPerformance } from '../../_lib/types';

interface AlgorithmPerformanceProps {
  performance: AlgorithmPerformance[];
}

const getStatusColor = (status: AlgorithmPerformance['status']) => {
  switch (status) {
    case 'completed': return 'success';
    case 'running': return 'primary';
    case 'failed': return 'error';
    default: return 'default';
  }
};

const formatMetric = (value: number, isPercentage = false) => {
  if (value === 0) return 'N/A';
  return isPercentage ? `${(value * 100).toFixed(1)}%` : value.toFixed(3);
};

const formatTime = (milliseconds: number) => {
  if (milliseconds === 0) return 'N/A';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

const getPerformanceRank = (performance: AlgorithmPerformance[]) => {
  // Sort by accuracy descending, then by training time ascending
  return performance
    .filter(p => p.status === 'completed')
    .sort((a, b) => {
      if (b.accuracy !== a.accuracy) {
        return b.accuracy - a.accuracy;
      }
      return a.trainingTime - b.trainingTime;
    });
};

export default function AlgorithmPerformanceComponent({ performance }: AlgorithmPerformanceProps) {
  const rankedPerformance = getPerformanceRank(performance);
  const bestAlgorithm = rankedPerformance[0];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Algorithm Performance
        </Typography>
        
        {bestAlgorithm && (
          <Box sx={{ mb: 2, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="success.contrastText">
              🏆 Best Performing Algorithm: {bestAlgorithm.algorithm}
            </Typography>
            <Typography variant="body2" color="success.contrastText">
              Accuracy: {formatMetric(bestAlgorithm.accuracy, true)} | 
              Training Time: {formatTime(bestAlgorithm.trainingTime)}
            </Typography>
          </Box>
        )}
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Algorithm</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Accuracy</TableCell>
                <TableCell>F1 Score</TableCell>
                <TableCell>Precision</TableCell>
                <TableCell>Recall</TableCell>
                <TableCell>Training Time</TableCell>
                <TableCell>Rank</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performance.map((perf) => {
                const rank = rankedPerformance.findIndex(r => r.algorithm === perf.algorithm) + 1;
                const isRunning = perf.status === 'running';
                const isFailed = perf.status === 'failed';
                const isBest = bestAlgorithm?.algorithm === perf.algorithm;
                
                return (
                  <TableRow 
                    key={perf.algorithm}
                    data-cy={`algorithm-performance-${perf.algorithm.toLowerCase().replace(/\s+/g, '-')}`}
                    sx={{
                      backgroundColor: isBest ? 'success.light' : 'inherit',
                      opacity: isFailed ? 0.6 : 1
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {perf.algorithm}
                        </Typography>
                        {isBest && <Typography sx={{ fontSize: 16 }}>🏆</Typography>}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={perf.status} 
                        color={getStatusColor(perf.status)}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {isRunning ? (
                        <Box sx={{ width: 80 }}>
                          <LinearProgress />
                          <Typography variant="caption">Training...</Typography>
                        </Box>
                      ) : (
                        <Typography 
                          variant="body2"
                          color={isBest ? 'success.contrastText' : 'inherit'}
                          fontWeight={isBest ? 'bold' : 'normal'}
                        >
                          {formatMetric(perf.accuracy, true)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2"
                        color={isBest ? 'success.contrastText' : 'inherit'}
                      >
                        {formatMetric(perf.f1Score, true)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2"
                        color={isBest ? 'success.contrastText' : 'inherit'}
                      >
                        {formatMetric(perf.precision, true)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2"
                        color={isBest ? 'success.contrastText' : 'inherit'}
                      >
                        {formatMetric(perf.recall, true)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2"
                        color={isBest ? 'success.contrastText' : 'inherit'}
                      >
                        {formatTime(perf.trainingTime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {perf.status === 'completed' && rank > 0 ? (
                        <Chip 
                          label={`#${rank}`} 
                          color={rank === 1 ? 'success' : 'default'}
                          size="small"
                          variant={rank === 1 ? 'filled' : 'outlined'}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {performance.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No algorithm performance data available
            </Typography>
          </Box>
        )}
        
        {performance.some(p => p.status === 'running') && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.contrastText">
              ℹ️ Algorithms are still training. Performance metrics will update automatically.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}