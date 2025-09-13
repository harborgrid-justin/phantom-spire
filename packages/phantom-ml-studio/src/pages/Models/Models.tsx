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
  ListItemIcon,
  Divider,
  Paper,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Publish as DeployIcon,
  Assessment as MetricsIcon,
  Security as SecurityIcon,
  Speed as PerformanceIcon,
  ModelTraining as ModelIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

// Mock model data
const mockModels = [
  {
    id: 1,
    name: 'Threat Detection Model v1',
    type: 'Classification',
    algorithm: 'XGBoost',
    accuracy: 0.924,
    f1Score: 0.891,
    auc: 0.956,
    status: 'Production',
    version: '1.2.3',
    size: '15.2 MB',
    createdAt: '2024-01-15T10:30:00Z',
    lastTrained: '2024-01-15T10:30:00Z',
    deployments: 3,
    predictions: 125000,
    starred: true,
    framework: 'phantom-ml-core',
    features: ['source_ip', 'destination_ip', 'port', 'protocol', 'bytes_sent', 'payload_entropy'],
    metrics: {
      precision: 0.912,
      recall: 0.878,
      specificity: 0.945,
      roc_auc: 0.956,
    },
    securityScore: 95,
    performanceScore: 87,
  },
  {
    id: 2,
    name: 'Network Anomaly Detection',
    type: 'Anomaly Detection',
    algorithm: 'Isolation Forest',
    accuracy: 0.881,
    f1Score: 0.834,
    auc: 0.892,
    status: 'Staging',
    version: '0.9.1',
    size: '8.7 MB',
    createdAt: '2024-01-14T14:45:00Z',
    lastTrained: '2024-01-14T14:45:00Z',
    deployments: 1,
    predictions: 45000,
    starred: false,
    framework: 'phantom-ml-core',
    features: ['packet_size', 'frequency', 'protocol_dist', 'time_features'],
    metrics: {
      precision: 0.867,
      recall: 0.801,
      specificity: 0.923,
      roc_auc: 0.892,
    },
    securityScore: 88,
    performanceScore: 92,
  },
  {
    id: 3,
    name: 'Malware Classification',
    type: 'Multi-class Classification',
    algorithm: 'Neural Network',
    accuracy: 0.956,
    f1Score: 0.941,
    auc: 0.978,
    status: 'Development',
    version: '2.1.0-beta',
    size: '42.1 MB',
    createdAt: '2024-01-13T09:15:00Z',
    lastTrained: '2024-01-13T09:15:00Z',
    deployments: 0,
    predictions: 0,
    starred: true,
    framework: 'phantom-ml-core',
    features: ['file_hash', 'file_size', 'pe_features', 'entropy', 'api_calls'],
    metrics: {
      precision: 0.951,
      recall: 0.932,
      specificity: 0.967,
      roc_auc: 0.978,
    },
    securityScore: 98,
    performanceScore: 79,
  },
];

const Models: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [deployDialog, setDeployDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Production': return 'success';
      case 'Staging': return 'warning';
      case 'Development': return 'info';
      default: return 'default';
    }
  };

  const handleViewModel = (model: any) => {
    setSelectedModel(model);
    setViewDialog(true);
  };

  const handleDeployModel = (model: any) => {
    setSelectedModel(model);
    setDeployDialog(true);
  };

  const filteredModels = filterStatus === 'All' 
    ? mockModels 
    : mockModels.filter(model => model.status === filterStatus);

  const renderModelCards = () => (
    <Grid container spacing={3}>
      {filteredModels.map((model) => (
        <Grid item xs={12} md={6} lg={4} key={model.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" noWrap>
                    {model.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {model.algorithm} • v{model.version}
                  </Typography>
                </Box>
                <IconButton size="small">
                  {model.starred ? <StarIcon color="primary" /> : <StarBorderIcon />}
                </IconButton>
              </Box>

              <Chip
                label={model.status}
                color={getStatusColor(model.status) as any}
                size="small"
                sx={{ mb: 2 }}
              />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Performance
                </Typography>
                <Typography variant="body1">
                  Accuracy: <strong>{(model.accuracy * 100).toFixed(1)}%</strong>
                </Typography>
                <Typography variant="body1">
                  F1 Score: <strong>{model.f1Score.toFixed(3)}</strong>
                </Typography>
                <Typography variant="body1">
                  AUC: <strong>{model.auc.toFixed(3)}</strong>
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">
                    Security: {model.securityScore}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PerformanceIcon fontSize="small" color="secondary" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">
                    Performance: {model.performanceScore}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="caption" color="text.secondary">
                {model.predictions.toLocaleString()} predictions • {model.size}
              </Typography>
            </CardContent>
            
            <CardActions>
              <Button size="small" onClick={() => handleViewModel(model)}>
                View Details
              </Button>
              <Button
                size="small"
                color="primary"
                onClick={() => handleDeployModel(model)}
                disabled={model.status === 'Production'}
              >
                Deploy
              </Button>
              <IconButton size="small">
                <ShareIcon />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderModelTable = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Model Registry
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Algorithm</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Accuracy</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Last Trained</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredModels.map((model) => (
              <TableRow key={model.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {model.starred && <StarIcon color="primary" fontSize="small" sx={{ mr: 1 }} />}
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {model.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {model.predictions.toLocaleString()} predictions
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{model.type}</TableCell>
                <TableCell>{model.algorithm}</TableCell>
                <TableCell>
                  <Chip
                    label={model.status}
                    color={getStatusColor(model.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{(model.accuracy * 100).toFixed(1)}%</TableCell>
                <TableCell>{model.version}</TableCell>
                <TableCell>{new Date(model.lastTrained).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleViewModel(model)}>
                    <ViewIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeployModel(model)}>
                    <DeployIcon />
                  </IconButton>
                  <IconButton size="small">
                    <DownloadIcon />
                  </IconButton>
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

  const renderComparison = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Model Performance Comparison
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          Compare models side-by-side to make informed deployment decisions
        </Alert>
        
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Model</TableCell>
              <TableCell>Accuracy</TableCell>
              <TableCell>Precision</TableCell>
              <TableCell>Recall</TableCell>
              <TableCell>F1 Score</TableCell>
              <TableCell>AUC</TableCell>
              <TableCell>Security Score</TableCell>
              <TableCell>Performance Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockModels.map((model) => (
              <TableRow key={model.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {model.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {model.algorithm}
                  </Typography>
                </TableCell>
                <TableCell>{(model.accuracy * 100).toFixed(1)}%</TableCell>
                <TableCell>{model.metrics.precision.toFixed(3)}</TableCell>
                <TableCell>{model.metrics.recall.toFixed(3)}</TableCell>
                <TableCell>{model.f1Score.toFixed(3)}</TableCell>
                <TableCell>{model.auc.toFixed(3)}</TableCell>
                <TableCell>
                  <Chip 
                    label={model.securityScore}
                    color={model.securityScore >= 95 ? 'success' : model.securityScore >= 85 ? 'warning' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={model.performanceScore}
                    color={model.performanceScore >= 90 ? 'success' : model.performanceScore >= 80 ? 'warning' : 'error'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Models
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your trained models and deployments
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as string)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Production">Production</MenuItem>
              <MenuItem value="Staging">Staging</MenuItem>
              <MenuItem value="Development">Development</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ pb: 1 }}>
          <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
            <Tab label="Cards View" />
            <Tab label="Table View" />
            <Tab label="Comparison" />
          </Tabs>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        {selectedTab === 0 && renderModelCards()}
        {selectedTab === 1 && renderModelTable()}
        {selectedTab === 2 && renderComparison()}
      </Box>

      {/* Model Details Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedModel?.name}
          <Typography variant="body2" color="text.secondary">
            {selectedModel?.algorithm} • Version {selectedModel?.version}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedModel && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Model Information</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <ModelIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Algorithm" 
                      secondary={selectedModel.algorithm} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Type" 
                      secondary={selectedModel.type} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Framework" 
                      secondary={selectedModel.framework} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Model Size" 
                      secondary={selectedModel.size} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Created" 
                      secondary={new Date(selectedModel.createdAt).toLocaleString()} 
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Accuracy" 
                      secondary={`${(selectedModel.accuracy * 100).toFixed(1)}%`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Precision" 
                      secondary={selectedModel.metrics.precision.toFixed(3)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Recall" 
                      secondary={selectedModel.metrics.recall.toFixed(3)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="F1 Score" 
                      secondary={selectedModel.f1Score.toFixed(3)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="AUC-ROC" 
                      secondary={selectedModel.auc.toFixed(3)} 
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Features</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedModel.features.map((feature: string, index: number) => (
                    <Chip key={index} label={feature} size="small" variant="outlined" />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Deployment Status</Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={selectedModel.status} 
                        color={getStatusColor(selectedModel.status) as any}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Active Deployments</Typography>
                      <Typography variant="body1">{selectedModel.deployments}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Total Predictions</Typography>
                      <Typography variant="body1">{selectedModel.predictions.toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>
            Close
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Download
          </Button>
          <Button variant="contained" startIcon={<DeployIcon />}>
            Deploy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deploy Model Dialog */}
      <Dialog
        open={deployDialog}
        onClose={() => setDeployDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Deploy Model</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Deploy your model to make it available for predictions
          </Alert>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Deployment Name"
                value={selectedModel?.name || ''}
                placeholder="e.g., threat-detection-prod"
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
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Instance Type</InputLabel>
                <Select value="standard">
                  <MenuItem value="small">Small (1 CPU, 2GB RAM)</MenuItem>
                  <MenuItem value="standard">Standard (2 CPU, 4GB RAM)</MenuItem>
                  <MenuItem value="large">Large (4 CPU, 8GB RAM)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeployDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            startIcon={<DeployIcon />}
            onClick={() => setDeployDialog(false)}
          >
            Deploy Model
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Models;