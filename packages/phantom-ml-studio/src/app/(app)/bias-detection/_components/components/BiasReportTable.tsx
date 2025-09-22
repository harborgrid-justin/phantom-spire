/**
 * Bias Report Table Component - CLIENT COMPONENT
 * Displays bias detection reports in a structured table format
 *
 * IMPORTANT: This component requires 'use client' due to interactive
 * elements (onClick handlers, event handling)
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { 
  MoreVert,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';
import { BiasReportTableProps, STATUS_COLORS } from '../../_lib/types';

export function BiasReportTable({
  reports,
  selectedReport,
  onReportSelect,
  loading = false
}: BiasReportTableProps) {
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

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-cy="bias-reports">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Bias Reports
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Model</TableCell>
                <TableCell>Overall Score</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Protected Attributes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow
                  key={report.id}
                  onClick={() => onReportSelect(report)}
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { backgroundColor: 'action.hover' },
                    backgroundColor: selectedReport?.id === report.id ? 'action.selected' : 'transparent'
                  }}
                  data-cy="completed-analysis"
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {report.modelName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {report.modelId}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <LinearProgress
                        variant="determinate"
                        value={report.overallScore * 100}
                        sx={{ width: 100, mr: 1 }}
                        color={getStatusColor(report.status) as 'success' | 'warning' | 'error'}
                      />
                      <Typography variant="body2" fontWeight="medium">
                        {(report.overallScore * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(report.status)}
                      label={report.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(report.status) as 'success' | 'warning' | 'error'}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {report.timestamp.toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {report.timestamp.toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      {report.protectedAttributes.slice(0, 3).map((attr) => (
                        <Chip 
                          key={attr} 
                          label={attr} 
                          size="small" 
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))}
                      {report.protectedAttributes.length > 3 && (
                        <Chip 
                          label={`+${report.protectedAttributes.length - 3} more`}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle action menu
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {reports.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              No bias reports available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}