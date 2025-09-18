/**
 * Compliance Charts Component
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer
} from 'recharts';
import { ComplianceFramework } from '../types';

interface ComplianceChartsProps {
  frameworks: ComplianceFramework[];
}

export default function ComplianceCharts({ frameworks }: ComplianceChartsProps) {
  const STATUS_COLORS = {
    compliant: '#4caf50',
    partial: '#ff9800',
    'non-compliant': '#f44336',
    'in-progress': '#2196f3'
  };

  // Compliance status distribution data
  const statusDistribution = Object.entries(
    frameworks.reduce((acc, framework) => {
      acc[framework.status] = (acc[framework.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({
    name: status.replace('-', ' ').toUpperCase(),
    value: count,
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#grey'
  }));

  // Framework scores for bar chart
  const frameworkScores = frameworks.map(framework => ({
    name: framework.name,
    score: framework.overallScore,
    riskLevel: framework.riskLevel
  }));

  // Risk level distribution
  const riskDistribution = Object.entries(
    frameworks.reduce((acc, framework) => {
      acc[framework.riskLevel] = (acc[framework.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([risk, count]) => ({
    name: risk.toUpperCase(),
    value: count,
    color: risk === 'critical' ? '#f44336' : 
           risk === 'high' ? '#ff9800' :
           risk === 'medium' ? '#ff9800' : '#4caf50'
  }));

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ 
          backgroundColor: 'background.paper', 
          p: 1, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 1
        }}>
          <Typography variant="body2">
            {`${label}: ${payload[0].value}`}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Grid container spacing={3}>
      {/* Compliance Status Chart */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card data-cy="compliance-status-chart">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Compliance Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Risk Level Distribution */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card data-cy="risk-distribution-chart">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Risk Level Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Framework Scores Bar Chart */}
      <Grid size={{ xs: 12 }}>
        <Card data-cy="framework-scores-chart">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Framework Compliance Scores
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={frameworkScores}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <ChartTooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="score" 
                  fill="#2196f3"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}