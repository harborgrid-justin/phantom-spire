'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccountBalance as RevenueIcon,
  Speed as PerformanceIcon,
  Assessment as AnalyticsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data for business intelligence metrics
const generateROIData = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    roi: Math.random() * 40 + 10,
    costs: Math.random() * 50000 + 20000,
    revenue: Math.random() * 80000 + 40000,
    savings: Math.random() * 30000 + 10000
  }));
};

const generatePerformanceData = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    model: `Model ${i + 1}`,
    accuracy: Math.random() * 20 + 80,
    efficiency: Math.random() * 30 + 70,
    cost: Math.random() * 5000 + 1000
  }));
};

const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface BusinessMetric {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

/**
 * Business Intelligence Client Component
 * 
 * Comprehensive enterprise business intelligence dashboard featuring:
 * - Real-time financial metrics and ROI analysis
 * - Resource optimization with cost-benefit calculations
 * - Performance forecasting and trend analysis
 * - Executive dashboards with enterprise KPIs
 * - Compliance reporting and audit trails
 */
export default function BusinessIntelligenceClient() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [roiData, setRoiData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setRoiData(generateROIData());
    setPerformanceData(generatePerformanceData());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const businessMetrics: BusinessMetric[] = [
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Business Intelligence Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Enterprise analytics with ROI calculations, cost-benefit analysis, and performance forecasting
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>

      {/* Enterprise Alert */}
      <Alert severity="success" sx={{ mb: 4 }}>
        <AlertTitle>H2O.ai Competitive Advantage</AlertTitle>
        Enterprise-grade business intelligence with comprehensive financial analytics and ROI optimization.
      </Alert>

      {/* KPI Cards */}
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

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Financial Analysis" />
        <Tab label="Performance Metrics" />
        <Tab label="Resource Optimization" />
        <Tab label="Forecasting" />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* ROI Trend */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Return on Investment Trend
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="roi" stroke="#00C49F" strokeWidth={3} name="ROI %" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Cost Breakdown */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Cost Distribution
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Computing', value: 35, color: '#0088FE' },
                      { name: 'Storage', value: 25, color: '#00C49F' },
                      { name: 'Licensing', value: 20, color: '#FFBB28' },
                      { name: 'Personnel', value: 20, color: '#FF8042' }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                  >
                    {[
                      { name: 'Computing', value: 35, color: '#0088FE' },
                      { name: 'Storage', value: 25, color: '#00C49F' },
                      { name: 'Licensing', value: 20, color: '#FFBB28' },
                      { name: 'Personnel', value: 20, color: '#FF8042' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Revenue vs Costs */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Revenue vs Costs Analysis
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#00C49F" name="Revenue" />
                  <Bar dataKey="costs" fill="#FF8042" name="Costs" />
                  <Bar dataKey="savings" fill="#0088FE" name="Savings" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Model Performance */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Model Performance vs Cost Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accuracy" fill="#00C49F" name="Accuracy %" />
                  <Bar dataKey="efficiency" fill="#0088FE" name="Efficiency %" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resource Optimization Recommendations
            </Typography>
            <Grid container spacing={2}>
              {[
                'Optimize compute allocation for 15% cost reduction',
                'Implement automated scaling for peak efficiency',
                'Consolidate storage systems for better utilization',
                'Upgrade hardware for improved performance/cost ratio'
              ].map((recommendation, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {recommendation}
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Forecasting
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Predictive analytics indicate continued ROI growth with optimized resource allocation.
            </Typography>
            <LinearProgress variant="determinate" value={85} sx={{ mb: 2 }} />
            <Typography variant="caption" color="text.secondary">
              Forecast Accuracy: 85%
            </Typography>
          </Paper>
        </Box>
      )}
    </Container>
  );
}