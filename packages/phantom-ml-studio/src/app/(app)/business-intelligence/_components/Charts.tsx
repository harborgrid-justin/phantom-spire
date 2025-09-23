/**
 * Chart Components
 * Reusable chart components for Business Intelligence dashboard
 */

import React from 'react';
import {
  Paper,
  Typography,
  Grid
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ROIDataPoint, PerformanceDataPoint } from '../_hooks/useBusinessIntelligenceState';

// Chart Colors
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// ROI Trend Chart Component
interface ROITrendChartProps {
  data: ROIDataPoint[];
}

export const ROITrendChart: React.FC<ROITrendChartProps> = ({ data }) => {
  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Return on Investment Trend
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="roi" stroke="#00C49F" strokeWidth={3} name="ROI %" />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

// Cost Distribution Pie Chart Component
export const CostDistributionChart: React.FC = () => {
  const costData = [
    { name: 'Computing', value: 35, color: '#0088FE' },
    { name: 'Storage', value: 25, color: '#00C49F' },
    { name: 'Licensing', value: 20, color: '#FFBB28' },
    { name: 'Personnel', value: 20, color: '#FF8042' }
  ];

  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Cost Distribution
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={costData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
          >
            {costData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

// Revenue vs Costs Chart Component
interface RevenueVsCostsChartProps {
  data: ROIDataPoint[];
}

export const RevenueVsCostsChart: React.FC<RevenueVsCostsChartProps> = ({ data }) => {
  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Revenue vs Costs Analysis
      </Typography>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
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
  );
};

// Model Performance Chart Component
interface ModelPerformanceChartProps {
  data: PerformanceDataPoint[];
}

export const ModelPerformanceChart: React.FC<ModelPerformanceChartProps> = ({ data }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Model Performance vs Cost Analysis
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
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
  );
};

// Financial Analysis Tab Component
interface FinancialAnalysisTabProps {
  roiData: ROIDataPoint[];
}

export const FinancialAnalysisTab: React.FC<FinancialAnalysisTabProps> = ({ roiData }) => {
  return (
    <Grid container spacing={3}>
      {/* ROI Trend */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <ROITrendChart data={roiData} />
      </Grid>

      {/* Cost Breakdown */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <CostDistributionChart />
      </Grid>

      {/* Revenue vs Costs */}
      <Grid size={{ xs: 12 }}>
        <RevenueVsCostsChart data={roiData} />
      </Grid>
    </Grid>
  );
};

// Performance Metrics Tab Component
interface PerformanceMetricsTabProps {
  performanceData: PerformanceDataPoint[];
}

export const PerformanceMetricsTab: React.FC<PerformanceMetricsTabProps> = ({ performanceData }) => {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <ModelPerformanceChart data={performanceData} />
      </Grid>
    </Grid>
  );
};

export default {
  ROITrendChart,
  CostDistributionChart,
  RevenueVsCostsChart,
  ModelPerformanceChart,
  FinancialAnalysisTab,
  PerformanceMetricsTab
};
