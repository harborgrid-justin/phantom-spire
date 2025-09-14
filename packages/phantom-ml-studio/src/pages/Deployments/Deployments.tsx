import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Alert,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Monitor as MonitorIcon,
  Warning as WarningIcon,
  CheckCircle as HealthyIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock deployment data
const mockDeployments = [
  {
    id: 1,
    name: 'threat-detection-prod',
    modelName: 'Threat Detection Model v1',
    modelVersion: '1.2.3',
    status: 'running',
    environment: 'Production',
    endpoint: 'https://api.phantom.ml/v1/threat-detection',
    instances: 3,
    cpu: 45,
    memory: 67,
    requestsPerMinute: 1247,
    totalRequests: 2156789,
    uptime: '99.9%',
    avgResponseTime: 23,
    errorRate: 0.02,
    deployedAt: '2024-01-10T14:30:00Z',
    lastUpdated: '2024-01-15T10:45:00Z',
    health: 'healthy',
    autoScaling: true,
    minInstances: 2,
    maxInstances: 10,
  },
  {
    id: 2,
    name: 'anomaly-detection-staging',
    modelName: 'Network Anomaly Detection',
    modelVersion: '0.9.1',
    status: 'running',
    environment: 'Staging',
    endpoint: 'https://staging-api.phantom.ml/v1/anomaly-detection',
    instances: 1,
    cpu: 32,
    memory: 41,
    requestsPerMinute: 145,
    totalRequests: 45892,
    uptime: '98.7%',
    avgResponseTime: 18,
    errorRate: 0.01,
    deployedAt: '2024-01-14T09:15:00Z',
    lastUpdated: '2024-01-15T08:30:00Z',
    health: 'healthy',
    autoScaling: false,
    minInstances: 1,
    maxInstances: 3,
  },
  {
    id: 3,
    name: 'malware-classifier-dev',
    modelName: 'Malware Classification',
    modelVersion: '2.1.0-beta',
    status: 'stopped',
    environment: 'Development',
    endpoint: 'https://dev-api.phantom.ml/v1/malware-classification',
    instances: 0,
    cpu: 0,
    memory: 0,
    requestsPerMinute: 0,
    totalRequests: 1234,
    uptime: '95.2%',
    avgResponseTime: 0,
    errorRate: 0.05,
    deployedAt: '2024-01-13T16:20:00Z',
    lastUpdated: '2024-01-14T12:00:00Z',
    health: 'stopped',
    autoScaling: false,
    minInstances: 1,
    maxInstances: 2,
  },
];

const mockMetricsData = [
  { time: '00:00', requests: 850, responseTime: 22, errors: 2 },
  { time: '04:00', requests: 620, responseTime: 19, errors: 1 },
  { time: '08:00', requests: 1420, responseTime: 25, errors: 3 },
  { time: '12:00', requests: 1890, responseTime: 28, errors: 5 },
  { time: '16:00', requests: 2150, responseTime: 31, errors: 4 },
  { time: '20:00', requests: 1750, responseTime: 26, errors: 2 },
];

const Deployments: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<any>(null);
  const [configDialog, setConfigDialog] = useState(false);
  const [deployDialog, setDeployDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'starting': return 'info';
      case 'stopped': return 'error';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <HealthyIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'stopped': return <StopIcon color="disabled" />;
      default: return <WarningIcon />;
    }
  };

  const handleViewDeployment = (deployment: any) => {
    setSelectedDeployment(deployment);
    setViewDialog(true);
  };

  const handleConfigureDeployment = (deployment: any) => {
    setSelectedDeployment(deployment);
    setConfigDialog(true);
  };

  const renderDeploymentCards = () => (
    <Grid container spacing={3}>
      {mockDeployments.map((deployment) => (
        <Grid item xs={12} md={6} lg={4} key={deployment.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" noWrap>
                    {deployment.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {deployment.modelName}
                  </Typography>
                </Box>
                {getHealthIcon(deployment.health)}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={deployment.status}
                  color={getStatusColor(deployment.status) as any}
                  size="small"
                />
                <Chip
                  label={deployment.environment}
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Performance
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption">CPU Usage</Typography>
                  <Typography variant="caption">{deployment.cpu}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={deployment.cpu} 
                  sx={{ mb: 1, height: 6, borderRadius: 3 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption">Memory Usage</Typography>
                  <Typography variant="caption">{deployment.memory}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={deployment.memory} 
                  sx={{ mb: 1, height: 6, borderRadius: 3 }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  <strong>{deployment.requestsPerMinute}</strong> req/min
                </Typography>
                <Typography variant="body2">
                  <strong>{deployment.avgResponseTime}ms</strong> avg
                </Typography>
              </Box>

              <Typography variant="caption" color="text.secondary">
                Uptime: {deployment.uptime} • {deployment.instances} instances
              </Typography>
            </CardContent>
            
            <CardActions>
              <Button size="small" onClick={() => handleViewDeployment(deployment)}>
                Monitor
              </Button>
              <Button size="small" onClick={() => handleConfigureDeployment(deployment)}>
                Configure
              </Button>
              {deployment.status === 'running' ? (
                <IconButton size="small" color="error">
                  <StopIcon />
                </IconButton>
              ) : (
                <IconButton size="small" color="primary">
                  <StartIcon />
                </IconButton>
              )}
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderDeploymentTable = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Active Deployments
          </Typography>
          <Button
            variant="contained"
            onClick={() => setDeployDialog(true)}
          >
            New Deployment
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Environment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Health</TableCell>
              <TableCell>Instances</TableCell>
              <TableCell>Req/Min</TableCell>
              <TableCell>Avg Response</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockDeployments.map((deployment) => (
              <TableRow key={deployment.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {deployment.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    v{deployment.modelVersion}
                  </Typography>
                </TableCell>
                <TableCell>{deployment.modelName}</TableCell>
                <TableCell>{deployment.environment}</TableCell>
                <TableCell>
                  <Chip
                    label={deployment.status}
                    color={getStatusColor(deployment.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{getHealthIcon(deployment.health)}</TableCell>
                <TableCell>{deployment.instances}</TableCell>
                <TableCell>{deployment.requestsPerMinute.toLocaleString()}</TableCell>
                <TableCell>{deployment.avgResponseTime}ms</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleViewDeployment(deployment)}>
                    <MonitorIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleConfigureDeployment(deployment)}>
                    <SettingsIcon />
                  </IconButton>
                  {deployment.status === 'running' ? (
                    <IconButton size="small" color="error">
                      <StopIcon />
                    </IconButton>
                  ) : (
                    <IconButton size="small" color="primary">
                      <StartIcon />
                    </IconButton>
                  )}
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderMetrics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Real-time monitoring data for all active deployments. Metrics update every minute.
        </Alert>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Requests per Hour
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="requests" stroke="#667eea" fill="#667eea" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Response Time & Errors
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="responseTime" stroke="#667eea" name="Response Time (ms)" />
                  <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#f093fb" name="Errors" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Overall Health
            </Typography>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" color="success.main">
                99.9%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                System Uptime
              </Typography>
            </Box>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Healthy Deployments" 
                  secondary={`${mockDeployments.filter(d => d.health === 'healthy').length}/${mockDeployments.length}`} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Total Requests Today" 
                  secondary="2.1M" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Average Error Rate" 
                  secondary="0.02%" 
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Deployment Status Summary
            </Typography>
            <Grid container spacing={2}>
              {mockDeployments.map((deployment) => (
                <Grid item xs={12} md={6} key={deployment.id}>
                  <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="subtitle2" noWrap>
                        {deployment.name}
                      </Typography>
                      {getHealthIcon(deployment.health)}
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {deployment.environment} • {deployment.instances} instances
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption">
                        CPU: {deployment.cpu}%
                      </Typography>
                      <Typography variant="caption">
                        RAM: {deployment.memory}%
                      </Typography>
                      <Typography variant="caption">
                        {deployment.requestsPerMinute} req/min
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Deployments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor and manage your model deployments in production
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setDeployDialog(true)}
        >
          Deploy Model
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ pb: 1 }}>
          <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
            <Tab label="Overview" />
            <Tab label="Deployments" />
            <Tab label="Metrics" />
          </Tabs>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        {selectedTab === 0 && renderDeploymentCards()}
        {selectedTab === 1 && renderDeploymentTable()}
        {selectedTab === 2 && renderMetrics()}
      </Box>

      {/* Deployment Details Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedDeployment?.name}
          <Typography variant="body2" color="text.secondary">
            Monitoring Dashboard
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedDeployment && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Configuration</Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Model" 
                      secondary={`${selectedDeployment.modelName} v${selectedDeployment.modelVersion}`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Environment" 
                      secondary={selectedDeployment.environment} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Endpoint" 
                      secondary={selectedDeployment.endpoint} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Auto Scaling" 
                      secondary={selectedDeployment.autoScaling ? 'Enabled' : 'Disabled'} 
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Current Status</Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Status" 
                      secondary={
                        <Chip 
                          label={selectedDeployment.status} 
                          color={getStatusColor(selectedDeployment.status) as any}
                          size="small"
                        />
                      } 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Instances" 
                      secondary={`${selectedDeployment.instances} (${selectedDeployment.minInstances}-${selectedDeployment.maxInstances})`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Uptime" 
                      secondary={selectedDeployment.uptime} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Total Requests" 
                      secondary={selectedDeployment.totalRequests.toLocaleString()} 
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>
            Close
          </Button>
          <Button variant="outlined" startIcon={<SettingsIcon />}>
            Configure
          </Button>
        </DialogActions>
      </Dialog>

      {/* Configuration Dialog */}
      <Dialog
        open={configDialog}
        onClose={() => setConfigDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Configure Deployment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Min Instances"
                type="number"
                value={selectedDeployment?.minInstances || 1}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Instances"
                type="number"
                value={selectedDeployment?.maxInstances || 10}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Auto Scaling</InputLabel>
                <Select value={selectedDeployment?.autoScaling ? 'enabled' : 'disabled'}>
                  <MenuItem value="enabled">Enabled</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setConfigDialog(false)}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Deployment Dialog */}
      <Dialog
        open={deployDialog}
        onClose={() => setDeployDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Deploy New Model</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Deploy a model to make it available via API endpoint
          </Alert>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Model</InputLabel>
                <Select value="">
                  <MenuItem value="threat-detection">Threat Detection Model v1</MenuItem>
                  <MenuItem value="anomaly-detection">Network Anomaly Detection</MenuItem>
                  <MenuItem value="malware-classification">Malware Classification</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Deployment Name"
                placeholder="e.g., threat-detection-v2"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Environment</InputLabel>
                <Select value="staging">
                  <MenuItem value="development">Development</MenuItem>
                  <MenuItem value="staging">Staging</MenuItem>
                  <MenuItem value="production">Production</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeployDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setDeployDialog(false)}>
            Deploy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Deployments;