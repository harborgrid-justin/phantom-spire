/**
 * Framework Summary Component
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
  Chip,
  LinearProgress,
  IconButton,
  Button
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { ComplianceFramework } from '../../_lib/types';

interface FrameworkSummaryProps {
  frameworks: ComplianceFramework[];
  onFrameworkSelect: (framework: ComplianceFramework) => void;
  onRefreshData: () => void;
  onGenerateReport: (frameworkId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'compliant': return 'success';
    case 'partial': return 'warning';
    case 'non-compliant': return 'error';
    case 'in-progress': return 'info';
    default: return 'default';
  }
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'low': return 'success';
    case 'medium': return 'info';
    case 'high': return 'warning';
    case 'critical': return 'error';
    default: return 'default';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function FrameworkSummary({
  frameworks,
  onFrameworkSelect,
  onRefreshData,
  onGenerateReport
}: FrameworkSummaryProps) {
  return (
    <Card data-cy="framework-summary">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Framework Summary
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={onRefreshData}
            variant="outlined"
            size="small"
            data-cy="refresh-frameworks"
          >
            Refresh
          </Button>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Framework</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Risk Level</TableCell>
                <TableCell>Last Audit</TableCell>
                <TableCell>Next Audit</TableCell>
                <TableCell>Remediation</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {frameworks.map((framework) => (
                <TableRow 
                  key={framework.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => onFrameworkSelect(framework)}
                  data-cy={`framework-row-${framework.id}`}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {framework.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {framework.fullName} v{framework.version}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={framework.status.replace('-', ' ')} 
                      color={getStatusColor(framework.status)}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 80 }}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {framework.overallScore}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={framework.overallScore}
                        sx={{ height: 4, borderRadius: 2 }}
                        color={framework.overallScore >= 80 ? 'success' : 
                               framework.overallScore >= 60 ? 'warning' : 'error'}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={framework.riskLevel}
                      color={getRiskColor(framework.riskLevel)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(framework.lastAudit)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(framework.nextAudit)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Required: {framework.remediation.required}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="info.main">
                        In Progress: {framework.remediation.inProgress}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="success.main">
                        Completed: {framework.remediation.completed}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFrameworkSelect(framework);
                        }}
                        title="View Details"
                        data-cy={`view-framework-${framework.id}`}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenerateReport(framework.id);
                        }}
                        title="Generate Report"
                        data-cy={`generate-report-${framework.id}`}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {frameworks.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No compliance frameworks configured
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}