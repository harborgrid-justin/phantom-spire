import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Button,
  Paper,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Mock data for demonstrations
const performanceData = [
  { time: '00:00', accuracy: 85, throughput: 120 },
  { time: '04:00', accuracy: 87, throughput: 150 },
  { time: '08:00', accuracy: 89, throughput: 180 },
  { time: '12:00', accuracy: 91, throughput: 200 },
  { time: '16:00', accuracy: 88, throughput: 175 },
  { time: '20:00', accuracy: 90, throughput: 165 },
];

const threatTypes = [
  { name: 'Malware', value: 35, color: '#f5576c' },
  { name: 'Phishing', value: 25, color: '#ff9800' },
  { name: 'Intrusion', value: 20, color: '#667eea' },
  { name: 'Anomaly', value: 20, color: '#4caf50' },
];

const recentActivities = [
  { id: 1, type: 'model_trained', message: 'Threat Detection Model v2.1 completed training', time: '2 minutes ago', severity: 'success' },
  { id: 2, type: 'alert', message: 'High CPU usage detected on ML inference cluster', time: '15 minutes ago', severity: 'warning' },
  { id: 3, type: 'deployment', message: 'AutoML experiment deployed to production', time: '1 hour ago', severity: 'success' },
  { id: 4, type: 'error', message: 'Feature engineering pipeline failed', time: '2 hours ago', severity: 'error' },
];

const Dashboard: React.FC = () => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <CheckCircleIcon />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* H2O.ai Competitive Banner */}
      <Alert severity="success" sx={{ mb: 3 }}>
        <AlertTitle>🏆 H2O.ai Competitive ML Studio</AlertTitle>
        <Typography variant="body2">
          <strong>Phantom ML Studio vs H2O.ai:</strong> Security-first AutoML with threat intelligence integration, 
          Rust performance (3x faster), bias detection, explainable AI, and cybersecurity-specialized models.
        </Typography>
      </Alert>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          ML Operations Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor your machine learning models and security analytics in real-time
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Key Metrics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="model-card">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Active Models
                  </Typography>
                  <Typography variant="h4">
                    24
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +3 this week
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <SecurityIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="model-card">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Avg Accuracy
                  </Typography>
                  <Typography variant="h4">
                    91.2%
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +2.1% from last month
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="model-card">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Inference Speed
                  </Typography>
                  <Typography variant="h4">
                    1.2ms
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    -0.3ms improved
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <SpeedIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="model-card">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Threats Detected
                  </Typography>
                  <Typography variant="h4">
                    1,247
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    +89 today
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <SecurityIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Model Performance Over Time
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#667eea" 
                      strokeWidth={3}
                      name="Accuracy (%)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="throughput" 
                      stroke="#4caf50" 
                      strokeWidth={3}
                      name="Throughput (req/min)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Threat Types Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Threat Types Distribution
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={threatTypes}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {threatTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Training Progress */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Training Jobs
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Advanced Threat Detection</Typography>
                    <Typography variant="body2" color="text.secondary">78%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={78} sx={{ height: 8, borderRadius: 5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Estimated completion: 12 minutes
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Anomaly Detection v3</Typography>
                    <Typography variant="body2" color="text.secondary">45%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={45} sx={{ height: 8, borderRadius: 5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Estimated completion: 28 minutes
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Network Intrusion Model</Typography>
                    <Typography variant="body2" color="text.secondary">92%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={92} sx={{ height: 8, borderRadius: 5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Estimated completion: 3 minutes
                  </Typography>
                </Box>

                <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                  View All Training Jobs
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recentActivities.map((activity) => (
                  <ListItem key={activity.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {getSeverityIcon(activity.severity)}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.message}
                      secondary={activity.time}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <Chip 
                      size="small" 
                      label={activity.type.replace('_', ' ')}
                      color={getSeverityColor(activity.severity) as any}
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                View Activity Log
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ py: 2 }}
                  onClick={() => window.location.href = '/build'}
                >
                  Start AutoML Training
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ py: 2 }}
                  onClick={() => window.location.href = '/data'}
                >
                  Upload New Dataset
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ py: 2 }}
                  onClick={() => window.location.href = '/models'}
                >
                  Deploy Model
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ py: 2 }}
                  onClick={() => window.location.href = '/experiments'}
                >
                  View Experiments
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;