/**
 * KPI Cards Component
 * Displays key performance indicators in card format
 */

import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccountBalance as RevenueIcon,
  Speed as PerformanceIcon,
  Assessment as AnalyticsIcon
} from '@mui/icons-material';
import { BusinessMetric } from '../_hooks/useBusinessIntelligenceState';

interface KPICardsProps {
  metrics?: BusinessMetric[];
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics }) => {
  const defaultMetrics: BusinessMetric[] = [
    {
      title: 'Total ROI',
      value: '285%',
      change: 12.5,
      icon: <TrendingUpIcon />,
      color: '#00C49F'
    },
    {
      title: 'Cost Savings',
      value: '$2.4M',
      change: 8.7,
      icon: <RevenueIcon />,
      color: '#0088FE'
    },
    {
      title: 'Efficiency Gain',
      value: '94%',
      change: 15.2,
      icon: <PerformanceIcon />,
      color: '#FFBB28'
    },
    {
      title: 'Model Performance',
      value: '92.8%',
      change: 3.1,
      icon: <AnalyticsIcon />,
      color: '#FF8042'
    }
  ];

  const businessMetrics = metrics || defaultMetrics;

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {businessMetrics.map((metric, index) => (
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                <Typography color="text.secondary" variant="body2">
                  {metric.title}
                </Typography>
                <Box sx={{ color: metric.color }}>
                  {metric.icon}
                </Box>
              </Box>
              <Typography variant="h4" component="h2" gutterBottom>
                {metric.value}
              </Typography>
              <Box display="flex" alignItems="center">
                <Chip
                  label={`+${metric.change}%`}
                  color="success"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  vs last quarter
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default KPICards;
