import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Security as SecurityIcon,
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface PipelineStep {
  id: string;
  name: string;
  type: 'data_ingestion' | 'preprocessing' | 'feature_engineering' | 'algorithm_selection' | 'training' | 'validation' | 'deployment';
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  progress?: number;
  details?: Record<string, unknown>;
  securityScore?: number;
}

interface AutoMLExperiment {
  id: string;
  name: string;
  status: 'configuring' | 'running' | 'completed' | 'failed';
  startTime: string;
  duration?: number;
  pipeline: PipelineStep[];
  bestModel?: {
    algorithm: string;
    accuracy: number;
    securityScore: number;
    explainabilityScore: number;
  };
}

const AutoMLPipelineVisualizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedExperiment, setSelectedExperiment] = useState<AutoMLExperiment | null>(null);
  const [showPipelineDetails, setShowPipelineDetails] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize with mock data
  useEffect(() => {
    const mockExperiment: AutoMLExperiment = {
      id: 'exp-security-ml-001',
      name: 'Security Threat Detection AutoML',
      status: 'running',
      startTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      pipeline: [
        {
          id: 'data-ingestion',
          name: 'Data Ingestion',
          type: 'data_ingestion',
          status: 'completed',
          duration: 45,
          securityScore: 98,
          details: {
            sourceType: 'Multi-database (PostgreSQL, MongoDB, Elasticsearch)',
            recordsProcessed: 2500000,
            dataSources: ['network_logs', 'security_events', 'threat_intel']
          }
        },
        {
          id: 'preprocessing',
          name: 'Security-First Preprocessing',
          type: 'preprocessing',
          status: 'completed',
          duration: 120,
          securityScore: 96,
          details: {
            stepsCompleted: ['PII detection', 'Sensitive data masking', 'Anomaly detection', 'Data validation'],
            featuresExtracted: 847,
            securityFeaturesAdded: 23
          }
        },
        {
          id: 'feature-engineering',
          name: 'Threat Intelligence Feature Engineering',
          type: 'feature_engineering',
          status: 'completed',
          duration: 90,
          securityScore: 99,
          details: {
            engineeringMethods: ['Temporal features', 'Network topology features', 'Behavioral patterns', 'Threat signatures'],
            finalFeatureCount: 1247,
            threatIntelFeaturesAdded: 156
          }
        },
        {
          id: 'algorithm-selection',
          name: 'Security-Optimized Algorithm Selection',
          type: 'algorithm_selection',
          status: 'completed',
          duration: 30,
          securityScore: 97,
          details: {
            algorithmsEvaluated: ['XGBoost-Security', 'RandomForest-Threat', 'Neural-Security', 'SVM-Anomaly'],
            selectedAlgorithms: ['XGBoost-Security', 'RandomForest-Threat', 'Neural-Security'],
            selectionCriteria: ['Accuracy', 'Security score', 'Explainability', 'Adversarial robustness']
          }
        },
        {
          id: 'training',
          name: 'Multi-Model Training with Security Validation',
          type: 'training',
          status: 'running',
          progress: 75,
          securityScore: 95,
          details: {
            modelsTraining: 8,
            currentModel: 'Neural-Security v2.1',
            adversarialTestingEnabled: true,
            biasDetectionActive: true
          }
        },
        {
          id: 'validation',
          name: 'Security & Explainability Validation',
          type: 'validation',
          status: 'pending',
          securityScore: null,
          details: {
            validationTypes: ['Adversarial testing', 'Bias detection', 'Explainability analysis', 'Security compliance']
          }
        },
        {
          id: 'deployment',
          name: 'Secure Model Deployment',
          type: 'deployment',
          status: 'pending',
          securityScore: null,
          details: {
            deploymentTargets: ['Production API', 'Edge devices', 'SIEM integration'],
            securityFeatures: ['Model encryption', 'Access control', 'Audit logging']
          }
        }
      ]
    };

    setSelectedExperiment(mockExperiment);

    // Simulate pipeline progress
    const interval = setInterval(() => {
      setSelectedExperiment(prev => {
        if (!prev) return prev;
        
        const updatedPipeline = prev.pipeline.map(step => {
          if (step.status === 'running' && step.progress !== undefined) {
            return {
              ...step,
              progress: Math.min(100, step.progress + Math.random() * 10)
            };
          }
          return step;
        });

        return {
          ...prev,
          pipeline: updatedPipeline
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Draw pipeline visualization on canvas
  useEffect(() => {
    if (!canvasRef.current || !selectedExperiment) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const steps = selectedExperiment.pipeline;
    const stepWidth = 120;
    const stepHeight = 80;
    const spacing = 40;
    const startX = 50;
    const startY = 50;

    steps.forEach((step, index) => {
      const x = startX + (stepWidth + spacing) * index;
      const y = startY;

      // Draw step box
      ctx.fillStyle = getStepColor(step.status);
      ctx.fillRect(x, y, stepWidth, stepHeight);

      // Draw step text
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(step.name, x + stepWidth / 2, y + 20);

      if (step.securityScore) {
        ctx.fillText(`Security: ${step.securityScore}%`, x + stepWidth / 2, y + 40);
      }

      if (step.progress !== undefined) {
        ctx.fillText(`${step.progress.toFixed(0)}%`, x + stepWidth / 2, y + 60);
      }

      // Draw arrows
      if (index < steps.length - 1) {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + stepWidth, y + stepHeight / 2);
        ctx.lineTo(x + stepWidth + spacing, y + stepHeight / 2);
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(x + stepWidth + spacing - 10, y + stepHeight / 2 - 5);
        ctx.lineTo(x + stepWidth + spacing, y + stepHeight / 2);
        ctx.lineTo(x + stepWidth + spacing - 10, y + stepHeight / 2 + 5);
        ctx.stroke();
      }
    });
  }, [selectedExperiment]);

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'running': return '#2196f3';
      case 'failed': return '#f44336';
      case 'pending': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckIcon color="success" />;
      case 'running': return <PlayIcon color="primary" />;
      case 'failed': return <ErrorIcon color="error" />;
      case 'pending': return <WarningIcon color="disabled" />;
      default: return <WarningIcon />;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (!selectedExperiment) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🔬 AutoML Pipeline Visualizer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visual pipeline with security-first design and threat intelligence integration
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Export Pipeline">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share Pipeline">
            <IconButton>
              <ShareIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Pipeline Settings">
            <IconButton onClick={() => setShowPipelineDetails(true)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Alert severity="success" sx={{ mb: 3 }}>
        <AlertTitle>🚀 H2O.ai Competitive Edge</AlertTitle>
        <Typography variant="body2">
          <strong>Advanced pipeline visualization:</strong> Security scoring at each step, threat intelligence integration, 
          bias detection, adversarial testing, and real-time security compliance monitoring - features H2O.ai doesn't offer!
        </Typography>
      </Alert>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Pipeline Overview" />
        <Tab label="Security Analysis" />
        <Tab label="Performance Metrics" />
        <Tab label="Model Comparison" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Pipeline Canvas */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Security-First AutoML Pipeline
                </Typography>
                <Box sx={{ overflow: 'auto', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <canvas
                    ref={canvasRef}
                    width={1200}
                    height={200}
                    style={{ border: '1px solid #ddd', backgroundColor: 'white' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Pipeline Steps Detail */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pipeline Steps Detail
                </Typography>
                <Stepper orientation="vertical">
                  {selectedExperiment.pipeline.map((step) => (
                    <Step key={step.id} active={step.status === 'running'} completed={step.status === 'completed'}>
                      <StepLabel
                        icon={getStatusIcon(step.status)}
                        error={step.status === 'failed'}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{step.name}</Typography>
                          {step.securityScore && (
                            <Chip 
                              label={`Security: ${step.securityScore}%`}
                              color="primary"
                              size="small"
                            />
                          )}
                          <Chip 
                            label={step.status.toUpperCase()}
                            color={step.status === 'completed' ? 'success' : step.status === 'running' ? 'primary' : 'default'}
                            size="small"
                          />
                        </Box>
                      </StepLabel>
                      <StepContent>
                        {step.progress !== undefined && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Progress: {step.progress.toFixed(0)}%
                            </Typography>
                            <LinearProgress variant="determinate" value={step.progress} />
                          </Box>
                        )}
                        {step.details && (
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Details:</strong>
                            </Typography>
                            <ul>
                              {Object.entries(step.details).map(([key, value]) => (
                                <li key={key}>
                                  <Typography variant="body2">
                                    <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {
                                      Array.isArray(value) ? value.join(', ') : String(value)
                                    }
                                  </Typography>
                                </li>
                              ))}
                            </ul>
                          </Box>
                        )}
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Security Scoring by Pipeline Step
                </Typography>
                <List>
                  {selectedExperiment.pipeline.filter(step => step.securityScore).map((step) => (
                    <ListItem key={step.id}>
                      <ListItemIcon>
                        <SecurityIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={step.name}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={step.securityScore} 
                              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                              color={step.securityScore! > 95 ? 'success' : step.securityScore! > 90 ? 'primary' : 'warning'}
                            />
                            <Typography variant="body2" sx={{ minWidth: 45 }}>
                              {step.securityScore}%
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Security Compliance Checklist
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary="PII Detection & Masking" secondary="Sensitive data automatically detected and masked" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Adversarial Testing" secondary="Models tested against adversarial attacks" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Bias Detection" secondary="Algorithmic bias automatically detected and mitigated" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Threat Intelligence Integration" secondary="External threat feeds incorporated into training" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pipeline Performance Metrics
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Step</TableCell>
                        <TableCell>Duration (seconds)</TableCell>
                        <TableCell>Security Score</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedExperiment.pipeline.map((step) => (
                        <TableRow key={step.id}>
                          <TableCell>{step.name}</TableCell>
                          <TableCell>{step.duration || 'In Progress'}</TableCell>
                          <TableCell>
                            {step.securityScore ? (
                              <Chip 
                                label={`${step.securityScore}%`}
                                color={step.securityScore > 95 ? 'success' : 'primary'}
                                size="small"
                              />
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={step.status}
                              color={step.status === 'completed' ? 'success' : step.status === 'running' ? 'primary' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button size="small" onClick={() => setShowPipelineDetails(true)}>
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Model Comparison (Security-Optimized)
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Model</TableCell>
                        <TableCell>Accuracy</TableCell>
                        <TableCell>Security Score</TableCell>
                        <TableCell>Explainability</TableCell>
                        <TableCell>Adversarial Robustness</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>XGBoost-Security v2.1</TableCell>
                        <TableCell>96.8%</TableCell>
                        <TableCell>98.2%</TableCell>
                        <TableCell>94.1%</TableCell>
                        <TableCell>91.5%</TableCell>
                        <TableCell><Chip label="Best Model" color="success" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>RandomForest-Threat v1.3</TableCell>
                        <TableCell>94.2%</TableCell>
                        <TableCell>95.7%</TableCell>
                        <TableCell>97.2%</TableCell>
                        <TableCell>88.3%</TableCell>
                        <TableCell><Chip label="High Explainability" color="primary" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Neural-Security v2.0</TableCell>
                        <TableCell>97.1%</TableCell>
                        <TableCell>96.8%</TableCell>
                        <TableCell>85.4%</TableCell>
                        <TableCell>93.2%</TableCell>
                        <TableCell><Chip label="High Accuracy" color="info" /></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Pipeline Details Dialog */}
      <Dialog 
        open={showPipelineDetails} 
        onClose={() => setShowPipelineDetails(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Pipeline Configuration Details</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Experiment: {selectedExperiment.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            This AutoML pipeline is optimized for cybersecurity use cases with built-in threat intelligence integration,
            adversarial testing, bias detection, and security compliance monitoring.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Security-First Configuration</AlertTitle>
            All pipeline steps include security validation, PII protection, and compliance checking.
          </Alert>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Key Features:
            </Typography>
            <ul>
              <li>Multi-database data ingestion (PostgreSQL, MongoDB, Elasticsearch)</li>
              <li>Automated PII detection and masking</li>
              <li>Threat intelligence feature engineering</li>
              <li>Security-optimized algorithm selection</li>
              <li>Adversarial robustness testing</li>
              <li>Bias detection and mitigation</li>
              <li>Explainable AI analysis</li>
              <li>Secure model deployment with encryption</li>
            </ul>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPipelineDetails(false)}>Close</Button>
          <Button variant="contained">Export Configuration</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutoMLPipelineVisualizer;