/**
 * Report Details Component
 * Shows detailed information about a selected bias report
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';
import { ReportDetailsProps, STATUS_COLORS, METRIC_STATUS_COLORS } from '../../_lib/types';

export function ReportDetails({ report }: ReportDetailsProps) {
  const getStatusColor = (status: string) => {
    return (STATUS_COLORS as Record<string, string>)[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle />;
      case 'moderate':
        return <Warning />;
      case 'high_bias':
        return <Error />;
      default:
        return <CheckCircle />;
    }
  };

  const getMetricStatusColor = (status: string) => {
    return (METRIC_STATUS_COLORS as Record<string, string>)[status] || 'default';
  };

  if (!report) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Report Details
          </Typography>
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              Select a report to view details
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Report Details
        </Typography>
        
        {/* Model Information */}
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom fontWeight="medium">
            {report.modelName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Model ID: {report.modelId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generated: {report.timestamp.toLocaleString()}
          </Typography>
        </Box>

        {/* Status Badge */}
        <Box mb={3}>
          <Chip
            icon={getStatusIcon(report.status)}
            label={report.status.replace('_', ' ').toUpperCase()}
            color={getStatusColor(report.status) as 'success' | 'warning' | 'error'}
            size="medium"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        {/* Overall Score */}
        <Box mb={3}>
          <Typography variant="h3" gutterBottom color={getStatusColor(report.status)}>
            {(report.overallScore * 100).toFixed(0)}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overall Fairness Score
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Protected Attributes */}
        <Box mb={3}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Protected Attributes:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {report.protectedAttributes.map((attr) => (
              <Chip 
                key={attr} 
                label={attr} 
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Bias Metrics */}
        <Box mb={3}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Bias Metrics:
          </Typography>
          {report.metrics.map((metric) => (
            <Box key={metric.metric} mb={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="body2" fontWeight="medium">
                  {metric.metric}
                </Typography>
                <Chip
                  label={metric.status.toUpperCase()}
                  size="small"
                  color={getMetricStatusColor(metric.status) as 'success' | 'warning' | 'error'}
                />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Score: {metric.value.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Threshold: {metric.threshold.toFixed(2)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {metric.description}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Recommendations */}
        <Box>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Recommendations ({report.recommendations.length}):
          </Typography>
          <Box>
            {report.recommendations.slice(0, 3).map((recommendation, index) => (
              <Typography 
                key={index}
                variant="body2" 
                color="text.secondary"
                sx={{ mb: 1, fontSize: '0.875rem' }}
              >
                • {recommendation}
              </Typography>
            ))}
            {report.recommendations.length > 3 && (
              <Typography variant="caption" color="primary">
                +{report.recommendations.length - 3} more recommendations
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}