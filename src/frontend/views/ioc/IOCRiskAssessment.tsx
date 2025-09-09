/**
 * IOC Risk Assessment - Comprehensive risk assessment dashboard
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Divider
} from '@mui/material';
import { Warning, Security, Assessment, TrendingUp } from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Status, Priority } from '../../types/index';

export const IOCRiskAssessment: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState<any>(null);

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/iocs/analytics/risk-assessment');
      const data = await response.json();
      setRiskData(data.data);
    } catch (error) {
      console.error('Failed to load risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const riskDistribution = [
    { name: 'Critical', value: 25, color: '#f44336' },
    { name: 'High', value: 45, color: '#ff9800' },
    { name: 'Medium', value: 80, color: '#ffeb3b' },
    { name: 'Low', value: 120, color: '#4caf50' }
  ];

  const riskFactors = [
    { factor: 'Recent Activity', weight: 0.35, score: 0.8 },
    { factor: 'Source Reputation', weight: 0.25, score: 0.7 },
    { factor: 'Threat Attribution', weight: 0.20, score: 0.6 },
    { factor: 'Geographic Distribution', weight: 0.20, score: 0.9 }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Assessment />
        IOC Risk Assessment
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Comprehensive risk assessment dashboard for indicators of compromise.
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>High Risk Alert:</strong> 25 critical IOCs detected in the last 24 hours requiring immediate attention.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Risk Overview Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security color="error" />
                <Typography variant="h6">Critical Risk</Typography>
              </Box>
              <Typography variant="h3" color="error.main" sx={{ mt: 1 }}>
                25
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Immediate action required
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning color="warning" />
                <Typography variant="h6">High Risk</Typography>
              </Box>
              <Typography variant="h3" color="warning.main" sx={{ mt: 1 }}>
                45
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Priority monitoring
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="info" />
                <Typography variant="h6">Medium Risk</Typography>
              </Box>
              <Typography variant="h3" color="info.main" sx={{ mt: 1 }}>
                80
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Standard monitoring
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security color="success" />
                <Typography variant="h6">Low Risk</Typography>
              </Box>
              <Typography variant="h3" color="success.main" sx={{ mt: 1 }}>
                120
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Baseline monitoring
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Risk Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Factors */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Risk Factors Analysis
              </Typography>
              {riskFactors.map((factor, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">
                      {factor.factor}
                    </Typography>
                    <Typography variant="body2">
                      {(factor.score * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={factor.score * 100} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    Weight: {(factor.weight * 100).toFixed(0)}%
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent High-Risk IOCs */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent High-Risk IOCs
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>IOC Value</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Risk Level</TableCell>
                      <TableCell>Confidence</TableCell>
                      <TableCell>First Seen</TableCell>
                      <TableCell>Threat Attribution</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      {
                        value: '192.168.100.50',
                        type: 'IP',
                        risk: 'critical',
                        confidence: 95,
                        firstSeen: '2024-01-15',
                        attribution: 'APT29'
                      },
                      {
                        value: 'malicious-site.com',
                        type: 'Domain',
                        risk: 'high',
                        confidence: 87,
                        firstSeen: '2024-01-14',
                        attribution: 'Lazarus Group'
                      },
                      {
                        value: 'sha256:abc123...',
                        type: 'Hash',
                        risk: 'critical',
                        confidence: 98,
                        firstSeen: '2024-01-13',
                        attribution: 'Unknown'
                      }
                    ].map((ioc, index) => (
                      <TableRow key={index}>
                        <TableCell>{ioc.value}</TableCell>
                        <TableCell>{ioc.type}</TableCell>
                        <TableCell>
                          <Chip 
                            label={ioc.risk.toUpperCase()} 
                            color={getSeverityColor(ioc.risk) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{ioc.confidence}%</TableCell>
                        <TableCell>{ioc.firstSeen}</TableCell>
                        <TableCell>{ioc.attribution}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Risk Mitigation Recommendations
              </Typography>
              <Grid container spacing={2}>
                {[
                  'Monitor high-risk IOCs more frequently',
                  'Implement automated blocking for critical threats',
                  'Enhance threat intelligence feeds',
                  'Improve attribution confidence through OSINT',
                  'Deploy additional monitoring in high-risk regions'
                ].map((recommendation, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Alert severity="info">
                      {recommendation}
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};