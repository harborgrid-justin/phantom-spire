/**
 * Threat Actor Metrics Portal Component
 * Advanced metrics and KPIs dashboard
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  CircularProgress,
  useTheme,
  alpha,
  Tabs,
  Tab,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

import {
  Dashboard,
  TrendingUp,
  Analytics,
  Assessment,
  BarChart,
  PieChart,
  Timeline,
  Security,
  Warning,
  CheckCircle,
  Download,
  Refresh
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

interface MetricData {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  category: 'actor' | 'campaign' | 'ioc' | 'threat_level' | 'attribution';
}

interface KPICard {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'positive' | 'negative' | 'neutral';
  description: string;
  target?: number;
}

const ThreatActorMetricsPortal: React.FC = () => {
  const theme = useTheme();
  
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('threat-intelligence-metrics');

  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');
  const [kpis, setKPIs] = useState<KPICard[]>([]);
  const [metrics, setMetrics] = useState<MetricData[]>([]);

  const generateMockData = useCallback(() => {
    const mockKPIs: KPICard[] = [
      {
        id: 'total-actors',
        title: 'Total Threat Actors',
        value: '247',
        change: 12.5,
        trend: 'positive',
        description: 'Active threat actors tracked',
        target: 300
      },
      {
        id: 'active-campaigns',
        title: 'Active Campaigns',
        value: '43',
        change: -8.2,
        trend: 'negative',
        description: 'Currently active campaigns',
        target: 50
      },
      {
        id: 'attribution-confidence',
        title: 'Attribution Accuracy',
        value: '87.3%',
        change: 5.1,
        trend: 'positive',
        description: 'Average attribution confidence',
        target: 90
      },
      {
        id: 'response-time',
        title: 'Avg Response Time',
        value: '2.4h',
        change: -15.3,
        trend: 'positive',
        description: 'Time to initial response',
        target: 2
      }
    ];

    const mockMetrics: MetricData[] = [
      {
        id: 'new-actors',
        name: 'New Actors Discovered',
        value: 23,
        change: 15.2,
        trend: 'up',
        unit: 'count',
        category: 'actor'
      },
      {
        id: 'campaign-duration',
        name: 'Average Campaign Duration',
        value: 45.2,
        change: -8.7,
        trend: 'down',
        unit: 'days',
        category: 'campaign'
      },
      {
        id: 'ioc-correlation',
        name: 'IOC Correlation Rate',
        value: 78.5,
        change: 3.2,
        trend: 'up',
        unit: 'percentage',
        category: 'ioc'
      }
    ];

    setKPIs(mockKPIs);
    setMetrics(mockMetrics);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        generateMockData();
        addUIUXEvaluation('metrics-portal-loaded', 'success', {
          loadTime: 1000
        });
      } catch (error) {
        console.error('Error loading metrics data:', error);
        addNotification('error', 'Failed to load metrics data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockData, addNotification, timeRange]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Dashboard color="primary" />
            Threat Actor Metrics Portal
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Advanced metrics and KPIs for threat intelligence operations
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="7d">7 Days</MenuItem>
              <MenuItem value="30d">30 Days</MenuItem>
              <MenuItem value="90d">90 Days</MenuItem>
              <MenuItem value="1y">1 Year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Refresh />}>
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<Download />}>
            Export
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {kpis.map((kpi) => (
          <Grid item xs={12} md={3} key={kpi.id}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary" gutterBottom>
                  {kpi.value}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  {kpi.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {kpi.trend === 'positive' ? (
                    <TrendingUp color="success" fontSize="small" />
                  ) : kpi.trend === 'negative' ? (
                    <TrendingUp color="error" fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
                  ) : (
                    <BarChart color="info" fontSize="small" />
                  )}
                  <Typography 
                    variant="caption" 
                    color={kpi.trend === 'positive' ? 'success.main' : kpi.trend === 'negative' ? 'error.main' : 'text.secondary'}
                  >
                    {kpi.change > 0 ? '+' : ''}{kpi.change}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {kpi.description}
                </Typography>
                {kpi.target && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      Target: {kpi.target}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((parseInt(kpi.value) / kpi.target) * 100, 100)} 
                      sx={{ mt: 0.5, height: 4 }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Card>
        <CardContent>
          <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)} sx={{ mb: 3 }}>
            <Tab label="Overview" icon={<Analytics />} />
            <Tab label="Trends" icon={<Timeline />} />
            <Tab label="Performance" icon={<Assessment />} />
            <Tab label="Comparison" icon={<BarChart />} />
          </Tabs>

          {selectedTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: 400 }}>
                  <Typography variant="h6" gutterBottom>
                    Threat Actor Distribution
                  </Typography>
                  <Box
                    sx={{
                      height: 300,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 1
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <PieChart sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.5), mb: 2 }} />
                      <Typography variant="h6" color="textSecondary">
                        Actor Type Distribution
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        APT: 45% • Cybercriminal: 35% • Hacktivist: 20%
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: 400 }}>
                  <Typography variant="h6" gutterBottom>
                    Attribution Confidence Trends
                  </Typography>
                  <Box
                    sx={{
                      height: 300,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.success.main, 0.05),
                      borderRadius: 1
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <TrendingUp sx={{ fontSize: 60, color: alpha(theme.palette.success.main, 0.5), mb: 2 }} />
                      <Typography variant="h6" color="textSecondary">
                        Confidence Over Time
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Average confidence: 87.3% (+5.1% this month)
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell>Current Value</TableCell>
                        <TableCell>Change</TableCell>
                        <TableCell>Trend</TableCell>
                        <TableCell>Category</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {metrics.map((metric) => (
                        <TableRow key={metric.id}>
                          <TableCell>{metric.name}</TableCell>
                          <TableCell>
                            {metric.value} {metric.unit}
                          </TableCell>
                          <TableCell>
                            <Typography 
                              color={metric.change > 0 ? 'success.main' : metric.change < 0 ? 'error.main' : 'text.secondary'}
                            >
                              {metric.change > 0 ? '+' : ''}{metric.change}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {metric.trend === 'up' ? (
                              <TrendingUp color="success" />
                            ) : metric.trend === 'down' ? (
                              <TrendingUp color="error" sx={{ transform: 'rotate(180deg)' }} />
                            ) : (
                              <BarChart color="info" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip label={metric.category} size="small" variant="outlined" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}

          {selectedTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Trend Analysis</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: 300 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Actor Discovery Rate
                    </Typography>
                    <Box
                      sx={{
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.info.main, 0.05),
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        Line Chart: New actors discovered per week
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: 300 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Campaign Activity
                    </Typography>
                    <Box
                      sx={{
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.warning.main, 0.05),
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        Bar Chart: Campaign activity over time
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {selectedTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
              <Grid container spacing={3}>
                {[
                  { title: 'Detection Speed', value: '2.4 hours', status: 'good' },
                  { title: 'Attribution Accuracy', value: '87.3%', status: 'excellent' },
                  { title: 'False Positive Rate', value: '3.2%', status: 'good' },
                  { title: 'Data Quality Score', value: '94.1%', status: 'excellent' }
                ].map((perf, idx) => (
                  <Grid item xs={12} md={3} key={idx}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" color="primary">
                        {perf.value}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        {perf.title}
                      </Typography>
                      <Chip 
                        label={perf.status} 
                        size="small" 
                        color={perf.status === 'excellent' ? 'success' : 'info'}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {selectedTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Comparative Analysis</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell>Current Period</TableCell>
                      <TableCell>Previous Period</TableCell>
                      <TableCell>Change</TableCell>
                      <TableCell>Industry Benchmark</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { metric: 'Detection Speed', current: '2.4h', previous: '2.8h', change: '-14.3%', benchmark: '3.2h' },
                      { metric: 'Attribution Rate', current: '87.3%', previous: '82.8%', change: '+5.4%', benchmark: '78.5%' },
                      { metric: 'Data Coverage', current: '94.1%', previous: '91.2%', change: '+3.2%', benchmark: '89.7%' }
                    ].map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.metric}</TableCell>
                        <TableCell>{row.current}</TableCell>
                        <TableCell>{row.previous}</TableCell>
                        <TableCell>
                          <Typography color={row.change.startsWith('+') ? 'success.main' : 'error.main'}>
                            {row.change}
                          </Typography>
                        </TableCell>
                        <TableCell>{row.benchmark}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ThreatActorMetricsPortal;