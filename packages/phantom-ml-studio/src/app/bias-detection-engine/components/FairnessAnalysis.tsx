/**
 * Fairness Analysis Component
 * Displays fairness analysis across protected attributes with group performance metrics
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { FairnessAnalysisProps } from '../types';

export function FairnessAnalysis({ analysis }: FairnessAnalysisProps) {
  const getDisparityColor = (value: number) => {
    if (value >= 0.8) return 'success';
    if (value >= 0.6) return 'warning';
    return 'error';
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <Box data-cy="fairness-metrics">
      <Typography variant="h6" gutterBottom>
        Fairness Analysis by Protected Attributes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Performance comparison across different demographic groups
      </Typography>

      {analysis.map((attr) => (
        <Card key={attr.attribute} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Analysis by {attr.attribute.charAt(0).toUpperCase() + attr.attribute.slice(1)}
            </Typography>

            <Grid container spacing={3}>
              {/* Group Performance Table */}
              <Grid size={{ xs: 12, lg: 8 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Group Performance Metrics
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Group</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Accuracy</TableCell>
                        <TableCell align="right">Precision</TableCell>
                        <TableCell align="right">Recall</TableCell>
                        <TableCell align="right">F1 Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attr.groups.map((group) => (
                        <TableRow key={group.group}>
                          <TableCell component="th" scope="row">
                            <Chip 
                              label={group.group} 
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {group.count.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="body2"
                              color={group.accuracy >= 0.8 ? 'success.main' : 
                                     group.accuracy >= 0.7 ? 'warning.main' : 'error.main'}
                              fontWeight="medium"
                            >
                              {formatPercentage(group.accuracy)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {formatPercentage(group.precision)}
                          </TableCell>
                          <TableCell align="right">
                            {formatPercentage(group.recall)}
                          </TableCell>
                          <TableCell align="right">
                            {formatPercentage(group.f1Score)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Disparity Metrics */}
              <Grid size={{ xs: 12, lg: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Disparity Metrics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Demographic Parity
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" 
                          color={getDisparityColor(attr.disparityMetrics.demographicParity)}
                        >
                          {formatPercentage(attr.disparityMetrics.demographicParity)}
                        </Typography>
                        <Chip 
                          size="small" 
                          color={getDisparityColor(attr.disparityMetrics.demographicParity) as 'success' | 'warning' | 'error'}
                          label={attr.disparityMetrics.demographicParity >= 0.8 ? 'Good' : 
                                 attr.disparityMetrics.demographicParity >= 0.6 ? 'Fair' : 'Poor'}
                        />
                      </Box>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Equalized Odds
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6"
                          color={getDisparityColor(attr.disparityMetrics.equalizedOdds)}
                        >
                          {formatPercentage(attr.disparityMetrics.equalizedOdds)}
                        </Typography>
                        <Chip 
                          size="small"
                          color={getDisparityColor(attr.disparityMetrics.equalizedOdds) as 'success' | 'warning' | 'error'}
                          label={attr.disparityMetrics.equalizedOdds >= 0.8 ? 'Good' : 
                                 attr.disparityMetrics.equalizedOdds >= 0.6 ? 'Fair' : 'Poor'}
                        />
                      </Box>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Equal Opportunity
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6"
                          color={getDisparityColor(attr.disparityMetrics.equalOpportunity)}
                        >
                          {formatPercentage(attr.disparityMetrics.equalOpportunity)}
                        </Typography>
                        <Chip 
                          size="small"
                          color={getDisparityColor(attr.disparityMetrics.equalOpportunity) as 'success' | 'warning' | 'error'}
                          label={attr.disparityMetrics.equalOpportunity >= 0.8 ? 'Good' : 
                                 attr.disparityMetrics.equalOpportunity >= 0.6 ? 'Fair' : 'Poor'}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            </Grid>

            {/* Performance Gap Analysis */}
            {attr.groups.length > 1 && (
              <Box mt={3} p={2} sx={{ backgroundColor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Performance Gap Analysis
                </Typography>
                {(() => {
                  const accuracies = attr.groups.map(g => g.accuracy);
                  const maxAccuracy = Math.max(...accuracies);
                  const minAccuracy = Math.min(...accuracies);
                  const gap = maxAccuracy - minAccuracy;
                  const gapPercentage = gap * 100;

                  return (
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body2">
                        Accuracy Gap: {gapPercentage.toFixed(1)}%
                      </Typography>
                      <Chip
                        size="small"
                        color={gap < 0.05 ? 'success' : gap < 0.1 ? 'warning' : 'error'}
                        label={gap < 0.05 ? 'Low Gap' : gap < 0.1 ? 'Moderate Gap' : 'High Gap'}
                      />
                    </Box>
                  );
                })()}
              </Box>
            )}
          </CardContent>
        </Card>
      ))}

      {analysis.length === 0 && (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                No fairness analysis data available
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}