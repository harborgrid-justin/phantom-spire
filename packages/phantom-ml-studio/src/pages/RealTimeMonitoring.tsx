import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  Switch,
  FormControlLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ModelMetrics {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  accuracy: number;
  latency: number;
  throughput: number;
  errorRate: number;
  securityScore: number;
  lastUpdated: string;
}

interface RealTimeEvent {
  id: string;
  timestamp: string;
  type: 'prediction' | 'alert' | 'drift' | 'security';
  model: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
}

interface PerformanceDataPoint {
  time: string;
  accuracy: number;
  throughput: number;
  latency: number;
}

const RealTimeMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [models, setModels] = useState<ModelMetrics[]>([]);
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);

  // Simulate real-time data updates
  useEffect(() => {
    const generateMockData = () => {
      const mockModels: ModelMetrics[] = [
        {
          id: 'threat-detector-v3',
          name: 'Threat Detection v3.1',
          status: 'healthy',
          accuracy: 96.8,
          latency: 1.2,
          throughput: 2400,
          errorRate: 0.02,
          securityScore: 98.5,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 'anomaly-detector',
          name: 'Network Anomaly Detector',
          status: 'warning',
          accuracy: 89.2,
          latency: 2.1,
          throughput: 1800,
          errorRate: 0.15,
          securityScore: 94.2,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 'malware-classifier',
          name: 'Malware Classification Engine',
          status: 'healthy',
          accuracy: 98.1,
          latency: 0.8,
          throughput: 3200,
          errorRate: 0.01,
          securityScore: 99.1,
          lastUpdated: new Date().toISOString(),
        },
      ];

      const mockEvents: RealTimeEvent[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 1000 * 30).toISOString(),
          type: 'prediction',
          model: 'threat-detector-v3',
          message: 'High-confidence threat detected in network traffic',
          severity: 'high',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000 * 120).toISOString(),
          type: 'alert',
          model: 'anomaly-detector',
          message: 'Model accuracy dropped below threshold',
          severity: 'medium',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 1000 * 300).toISOString(),
          type: 'security',
          model: 'malware-classifier',
          message: 'Potential adversarial attack detected',
          severity: 'critical',
        },
      ];

      const mockPerformance = Array.from({ length: 20 }, (_, i) => ({
        time: new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString(),
        accuracy: 90 + Math.random() * 8,
        latency: 1 + Math.random() * 2,
        throughput: 2000 + Math.random() * 1000,
      }));

      setModels(mockModels);
      setEvents(mockEvents);
      setPerformanceData(mockPerformance);
    };

    generateMockData();

    if (autoRefresh) {
      const interval = setInterval(generateMockData, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <TrendingUpIcon />;
      case 'alert': return <WarningIcon />;
      case 'drift': return <TimelineIcon />;
      case 'security': return <SecurityIcon />;
      default: return <CheckCircleIcon />;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🚀 Real-Time Model Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Advanced monitoring with security-first design and threat intelligence integration
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                color="primary"
              />
            }
            label="Auto Refresh"
          />
          <Tooltip title="Refresh Now">
            <IconButton onClick={() => window.location.reload()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>🔥 H2O.ai Competitive Advantage</AlertTitle>
        <Typography variant="body2">
          <strong>Real-time monitoring with security intelligence:</strong> Threat detection alerts, 
          adversarial attack detection, model drift monitoring, and security scoring - features H2O.ai lacks!
        </Typography>
      </Alert>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Live Metrics" />
        <Tab label="Performance Trends" />
        <Tab label="Security Events" />
        <Tab label="Alert Management" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Model Status Cards */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Model Health Status
            </Typography>
            <Grid container spacing={2}>
              {models.map((model) => (
                <Grid item xs={12} md={4} key={model.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">{model.name}</Typography>
                        <Chip
                          label={model.status.toUpperCase()}
                          color={getStatusColor(model.status)}
                          size="small"
                        />
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Accuracy</Typography>
                          <Typography variant="h6">{model.accuracy}%</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Latency</Typography>
                          <Typography variant="h6">{model.latency}ms</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Throughput</Typography>
                          <Typography variant="h6">{model.throughput}/s</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Security Score</Typography>
                          <Typography variant="h6" color="primary">{model.securityScore}%</Typography>
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Error Rate: {(model.errorRate * 100).toFixed(2)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={model.errorRate * 100}
                          color={model.errorRate > 0.1 ? 'warning' : 'success'}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Real-time Events */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Real-Time Events Stream
                </Typography>
                <List>
                  {events.map((event) => (
                    <ListItem key={event.id}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: getSeverityColor(event.severity) + '.main' }}>
                          {getEventIcon(event.type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={event.message}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                            <Chip label={event.model} size="small" />
                            <Chip label={event.type} size="small" variant="outlined" />
                            <Typography variant="caption">
                              {new Date(event.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                  View All Events
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Trends
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip />
                    <Area type="monotone" dataKey="accuracy" stackId="1" stroke="#8884d8" fill="#8884d8" name="Accuracy %" />
                    <Area type="monotone" dataKey="latency" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Latency (ms)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Throughput Monitoring
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip />
                    <Line type="monotone" dataKey="throughput" stroke="#ff7300" strokeWidth={2} name="Requests/sec" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Events & Threat Intelligence
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Event Type</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.filter(e => e.type === 'security').map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={event.type} size="small" />
                      </TableCell>
                      <TableCell>{event.model}</TableCell>
                      <TableCell>
                        <Chip 
                          label={event.severity.toUpperCase()}
                          color={getSeverityColor(event.severity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{event.message}</TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          Investigate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Alert Configuration
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Accuracy Threshold"
                      secondary="Alert when model accuracy drops below 90%"
                    />
                    <Switch defaultChecked />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Latency Alert"
                      secondary="Alert when response time exceeds 5ms"
                    />
                    <Switch defaultChecked />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Security Threats"
                      secondary="Alert on potential adversarial attacks"
                    />
                    <Switch defaultChecked />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Model Drift"
                      secondary="Alert when data drift is detected"
                    />
                    <Switch defaultChecked />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Channels
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="security-team@company.com"
                    />
                    <Switch defaultChecked />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="SIEM Integration"
                      secondary="Forward security events to SIEM"
                    />
                    <Switch defaultChecked />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default RealTimeMonitoring;