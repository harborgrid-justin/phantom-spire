/**
 * IOC Performance Metrics - Detection performance metrics dashboard
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  LinearProgress,
  Chip
} from '@mui/material';
import { Speed, Analytics, Timeline, Assessment } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const IOCPerformanceMetrics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [granularity, setGranularity] = useState('daily');
  const [metricsData, setMetricsData] = useState<any>(null);

  useEffect(() => {
    loadMetricsData();
  }, [granularity]);

  const loadMetricsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/iocs/analytics/performance?granularity=${granularity}`);
      const data = await response.json();
      setMetricsData(data.data);
    } catch (error) {
      console.error('Failed to load metrics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const performanceData = [
    { timestamp: '2024-01-01', detections: 87, accuracy: 0.94, responseTime: 2.1 },
    { timestamp: '2024-01-02', detections: 92, accuracy: 0.91, responseTime: 2.3 },
    { timestamp: '2024-01-03', detections: 78, accuracy: 0.96, responseTime: 1.9 },
    { timestamp: '2024-01-04', detections: 105, accuracy: 0.89, responseTime: 2.7 },
    { timestamp: '2024-01-05', detections: 93, accuracy: 0.93, responseTime: 2.2 },
  ];

  const metricCards = [
    {
      title: 'Detection Rate',
      value: '94%',
      change: '+2.3%',
      color: 'success',
      icon: <Assessment />
    },
    {
      title: 'False Positive Rate',
      value: '12%',
      change: '-1.5%',
      color: 'warning',
      icon: <Speed />
    },
    {
      title: 'Avg Response Time',
      value: '2.3s',
      change: '-0.2s',
      color: 'info',
      icon: <Timeline />
    },
    {
      title: 'Throughput',
      value: '1,250/h',
      change: '+5.2%',
      color: 'primary',
      icon: <Analytics />
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Speed />
        IOC Performance Metrics
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Monitor detection performance, accuracy, and response times for IOC processing systems.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Time Granularity</InputLabel>
            <Select value={granularity} onChange={(e) => setGranularity(e.target.value)}>
              <MenuItem value="hourly">Hourly</MenuItem>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metricCards.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {metric.icon}
                  <Typography variant="h6">{metric.title}</Typography>
                </Box>
                <Typography variant="h3" color={`${metric.color}.main`}>
                  {metric.value}
                </Typography>
                <Chip 
                  label={metric.change}
                  color={metric.change.startsWith('+') ? 'success' : 'info'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Performance Charts */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Detection Accuracy" />
            <Tab label="Response Times" />
            <Tab label="Throughput Analysis" />
            <Tab label="System Health" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Detection Accuracy Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis domain={[0.8, 1]} />
              <Tooltip formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Accuracy']} />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#4caf50" 
                strokeWidth={3}
                dot={{ fill: '#4caf50', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Target accuracy: 95% | Current trend: Stable with minor fluctuations
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Average Response Times
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${value}s`, 'Response Time']} />
              <Bar dataKey="responseTime" fill="#2196f3" />
            </BarChart>
          </ResponsiveContainer>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Target response time: &lt;2.0s | Current average: 2.3s
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Detection Throughput
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${value}`, 'Detections']} />
              <Area 
                type="monotone" 
                dataKey="detections" 
                stroke="#ff9800" 
                fill="#ff9800" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Peak capacity: 150/hour | Current utilization: 62%
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            System Health Indicators
          </Typography>
          <Grid container spacing={3}>
            {[
              { name: 'CPU Usage', value: 68, color: 'success' },
              { name: 'Memory Usage', value: 74, color: 'warning' },
              { name: 'Disk I/O', value: 45, color: 'success' },
              { name: 'Network Latency', value: 23, color: 'success' },
              { name: 'Queue Depth', value: 82, color: 'error' },
              { name: 'Error Rate', value: 3, color: 'success' }
            ].map((indicator, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{indicator.name}</Typography>
                    <Typography variant="body2">{indicator.value}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={indicator.value}
                    color={indicator.color as any}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Card>
    </Box>
  );
};