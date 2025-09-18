/**
 * Compliance Overview Cards Component
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Gavel as ComplianceIcon,
  Assessment as AuditIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { ComplianceFramework, SecurityMetrics } from '../types';

interface ComplianceOverviewCardsProps {
  frameworks: ComplianceFramework[];
  securityMetrics: SecurityMetrics | null;
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'compliant': return <CheckIcon color="success" />;
    case 'partial': return <WarningIcon color="warning" />;
    case 'non-compliant': return <ErrorIcon color="error" />;
    case 'in-progress': return <SecurityIcon color="info" />;
    default: return <SecurityIcon />;
  }
};

export default function ComplianceOverviewCards({ 
  frameworks, 
  securityMetrics 
}: ComplianceOverviewCardsProps) {
  const totalFrameworks = frameworks.length;
  const compliantFrameworks = frameworks.filter(f => f.status === 'compliant').length;
  const averageScore = frameworks.length > 0 
    ? frameworks.reduce((sum, f) => sum + f.overallScore, 0) / frameworks.length 
    : 0;
  const criticalRisks = frameworks.filter(f => f.riskLevel === 'critical').length;

  return (
    <Grid container spacing={3}>
      {/* Overall Compliance Score */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card data-cy="compliance-score-card">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ComplianceIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Overall Score</Typography>
            </Box>
            <Typography variant="h3" color="primary.main" sx={{ mb: 1 }}>
              {averageScore.toFixed(0)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={averageScore}
              sx={{ mb: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary">
              Across {totalFrameworks} frameworks
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Compliant Frameworks */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card data-cy="compliant-frameworks-card">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ShieldIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">Compliant</Typography>
            </Box>
            <Typography variant="h3" color="success.main" sx={{ mb: 1 }}>
              {compliantFrameworks}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              out of {totalFrameworks} frameworks
            </Typography>
            <Chip
              label={`${((compliantFrameworks / totalFrameworks) * 100).toFixed(0)}% compliant`}
              color="success"
              size="small"
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Security Score */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card data-cy="security-score-card">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6">Security Score</Typography>
            </Box>
            <Typography variant="h3" color="info.main" sx={{ mb: 1 }}>
              {securityMetrics?.overallSecurityScore || 0}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={securityMetrics?.overallSecurityScore || 0}
              sx={{ mb: 1, height: 8, borderRadius: 4 }}
              color="info"
            />
            <Typography variant="body2" color="text.secondary">
              Real-time security posture
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Critical Risks */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card data-cy="critical-risks-card">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AuditIcon sx={{ mr: 1, color: criticalRisks > 0 ? 'error.main' : 'success.main' }} />
              <Typography variant="h6">Critical Risks</Typography>
            </Box>
            <Typography 
              variant="h3" 
              color={criticalRisks > 0 ? 'error.main' : 'success.main'}
              sx={{ mb: 1 }}
            >
              {criticalRisks}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              requiring immediate attention
            </Typography>
            <Chip
              label={criticalRisks === 0 ? 'No critical risks' : `${criticalRisks} critical`}
              color={criticalRisks > 0 ? 'error' : 'success'}
              size="small"
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Vulnerability Summary */}
      {securityMetrics && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card data-cy="vulnerability-summary-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vulnerability Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="error.main">
                      {securityMetrics.vulnerabilities.critical}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Critical
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {securityMetrics.vulnerabilities.high}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      High
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {securityMetrics.vulnerabilities.medium}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Medium
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {securityMetrics.vulnerabilities.low}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Low
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Framework Status Overview */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card data-cy="framework-status-card">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Framework Status Overview
            </Typography>
            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
              {frameworks.map((framework) => (
                <Box 
                  key={framework.id} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getStatusIcon(framework.status)}
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="subtitle2">
                        {framework.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Score: {framework.overallScore}%
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={framework.status}
                    color={getStatusColor(framework.status)}
                    size="small"
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}