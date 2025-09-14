import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Engineering as EngineeringIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Psychology as AIIcon,
  TrendingUp as TrendingUpIcon,
  Code as CodeIcon,
  DataObject as DataIcon,
  Transform as TransformIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Scatter } from 'recharts';

interface Feature {
  id: string;
  name: string;
  type: 'numerical' | 'categorical' | 'temporal' | 'text' | 'security' | 'derived';
  source: string;
  transformation?: string;
  securityRelevance: number;
  importance?: number;
  description: string;
  threatIntelligence?: boolean;
  biasRisk: 'low' | 'medium' | 'high';
  complianceFlags?: string[];
}

interface FeatureTransformation {
  id: string;
  name: string;
  type: 'aggregation' | 'encoding' | 'scaling' | 'extraction' | 'security_enrichment';
  inputFeatures: string[];
  outputFeature: string;
  configuration: any;
  securityImpact: string;
  code: string;
  validation: {
    passed: boolean;
    issues: string[];
  };
}

interface FeatureEngineeringPipeline {
  id: string;
  name: string;
  features: Feature[];
  transformations: FeatureTransformation[];
  securityScore: number;
  complianceScore: number;
  status: 'draft' | 'validated' | 'deployed';
}

const InteractiveFeatureEngineering: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [pipeline, setPipeline] = useState<FeatureEngineeringPipeline | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [showTransformDialog, setShowTransformDialog] = useState(false);
  const [newFeature, setNewFeature] = useState<Partial<Feature>>({});
  const [availableTransforms, setAvailableTransforms] = useState<any[]>([]);

  useEffect(() => {
    // Initialize with mock feature engineering pipeline
    const mockPipeline: FeatureEngineeringPipeline = {
      id: 'fe-security-pipeline-001',
      name: 'Security Threat Detection Feature Pipeline',
      securityScore: 94.2,
      complianceScore: 91.8,
      status: 'validated',
      features: [
        {
          id: 'network_entropy',
          name: 'Network Traffic Entropy',
          type: 'numerical',
          source: 'network_logs',
          transformation: 'entropy_calculation',
          securityRelevance: 95,
          importance: 0.87,
          description: 'Statistical entropy of network packet sizes indicating potential data exfiltration',
          threatIntelligence: true,
          biasRisk: 'low',
          complianceFlags: ['PCI-DSS', 'SOC2']
        },
        {
          id: 'temporal_anomaly_score',
          name: 'Temporal Anomaly Score',
          type: 'temporal',
          source: 'security_events',
          transformation: 'time_series_analysis',
          securityRelevance: 92,
          importance: 0.84,
          description: 'Time-based anomaly detection score for unusual activity patterns',
          threatIntelligence: true,
          biasRisk: 'medium',
          complianceFlags: ['GDPR', 'SOC2']
        },
        {
          id: 'threat_intel_score',
          name: 'Threat Intelligence Score',
          type: 'security',
          source: 'threat_feeds',
          transformation: 'threat_aggregation',
          securityRelevance: 98,
          importance: 0.91,
          description: 'Aggregated threat intelligence score from multiple external feeds',
          threatIntelligence: true,
          biasRisk: 'low',
          complianceFlags: ['NIST', 'ISO27001']
        },
        {
          id: 'user_behavior_vector',
          name: 'User Behavior Vector',
          type: 'derived',
          source: 'user_activity',
          transformation: 'behavioral_embedding',
          securityRelevance: 89,
          importance: 0.78,
          description: 'Multi-dimensional vector representing user behavioral patterns',
          threatIntelligence: false,
          biasRisk: 'high',
          complianceFlags: ['GDPR', 'CCPA']
        },
        {
          id: 'network_topology_features',
          name: 'Network Topology Features',
          type: 'categorical',
          source: 'network_topology',
          transformation: 'graph_features',
          securityRelevance: 85,
          importance: 0.72,
          description: 'Graph-based features extracted from network topology',
          threatIntelligence: false,
          biasRisk: 'medium',
          complianceFlags: ['SOC2']
        }
      ],
      transformations: [
        {
          id: 'entropy-calc',
          name: 'Network Entropy Calculation',
          type: 'security_enrichment',
          inputFeatures: ['packet_sizes', 'flow_duration'],
          outputFeature: 'network_entropy',
          securityImpact: 'High - Critical for detecting data exfiltration patterns',
          code: `
def calculate_network_entropy(packet_sizes, flow_duration):
    import numpy as np
    from scipy.stats import entropy
    
    # Calculate Shannon entropy of packet sizes
    unique, counts = np.unique(packet_sizes, return_counts=True)
    packet_entropy = entropy(counts, base=2)
    
    # Weight by flow duration for temporal context
    weighted_entropy = packet_entropy * np.log(1 + flow_duration)
    
    # Normalize to security score (0-100)
    security_score = min(100, weighted_entropy * 10)
    
    return {
        'network_entropy': security_score,
        'security_relevance': 95,
        'threat_indicator': security_score > 70
    }
          `,
          configuration: {
            entropy_base: 2,
            normalization_factor: 10,
            threat_threshold: 70
          },
          validation: {
            passed: true,
            issues: []
          }
        },
        {
          id: 'threat-aggregation',
          name: 'Threat Intelligence Aggregation',
          type: 'security_enrichment',
          inputFeatures: ['virustotal_score', 'misp_indicators', 'crowdstrike_intel'],
          outputFeature: 'threat_intel_score',
          securityImpact: 'Critical - Primary threat detection mechanism',
          code: `
def aggregate_threat_intelligence(vt_score, misp_indicators, cs_intel):
    # Weighted aggregation of multiple threat sources
    weights = {'virustotal': 0.4, 'misp': 0.35, 'crowdstrike': 0.25}
    
    # Normalize all scores to 0-100 scale
    normalized_vt = min(100, vt_score * 10)
    normalized_misp = len([i for i in misp_indicators if i['threat_level'] > 3]) * 20
    normalized_cs = cs_intel.get('malware_confidence', 0)
    
    # Calculate weighted average
    aggregated_score = (
        normalized_vt * weights['virustotal'] +
        normalized_misp * weights['misp'] + 
        normalized_cs * weights['crowdstrike']
    )
    
    return {
        'threat_intel_score': aggregated_score,
        'confidence': min(1.0, aggregated_score / 100),
        'threat_sources': ['virustotal', 'misp', 'crowdstrike']
    }
          `,
          configuration: {
            weights: { virustotal: 0.4, misp: 0.35, crowdstrike: 0.25 },
            threat_threshold: 60,
            confidence_threshold: 0.7
          },
          validation: {
            passed: true,
            issues: []
          }
        }
      ]
    };

    const transforms = [
      { id: 'log_transform', name: 'Logarithmic Transform', type: 'scaling', securityRelevant: false },
      { id: 'one_hot_encode', name: 'One-Hot Encoding', type: 'encoding', securityRelevant: false },
      { id: 'threat_enrichment', name: 'Threat Intelligence Enrichment', type: 'security_enrichment', securityRelevant: true },
      { id: 'behavioral_analysis', name: 'Behavioral Pattern Analysis', type: 'extraction', securityRelevant: true },
      { id: 'temporal_features', name: 'Temporal Feature Extraction', type: 'extraction', securityRelevant: true },
      { id: 'network_graph', name: 'Network Graph Features', type: 'extraction', securityRelevant: true },
    ];

    setPipeline(mockPipeline);
    setAvailableTransforms(transforms);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || !pipeline) return;
    
    const items = Array.from(pipeline.features);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPipeline({
      ...pipeline,
      features: items
    });
  };

  const getFeatureTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <SecurityIcon color="error" />;
      case 'temporal': return <TrendingUpIcon color="primary" />;
      case 'derived': return <AIIcon color="secondary" />;
      case 'numerical': return <DataIcon color="info" />;
      case 'categorical': return <CodeIcon color="success" />;
      default: return <DataIcon />;
    }
  };

  const getBiasRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const handleAddFeature = () => {
    if (!pipeline) return;
    
    const feature: Feature = {
      id: `feature_${Date.now()}`,
      name: newFeature.name || 'New Feature',
      type: newFeature.type || 'numerical',
      source: newFeature.source || 'manual',
      securityRelevance: newFeature.securityRelevance || 50,
      description: newFeature.description || '',
      threatIntelligence: newFeature.threatIntelligence || false,
      biasRisk: newFeature.biasRisk || 'medium',
      complianceFlags: newFeature.complianceFlags || []
    };

    setPipeline({
      ...pipeline,
      features: [...pipeline.features, feature]
    });

    setNewFeature({});
    setShowFeatureDialog(false);
  };

  const featureImportanceData = pipeline ? pipeline.features
    .filter(f => f.importance)
    .map(f => ({
      name: f.name.substring(0, 15) + '...',
      importance: f.importance! * 100,
      security: f.securityRelevance
    })) : [];

  if (!pipeline) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🔧 Interactive Feature Engineering Studio
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Security-first feature engineering with threat intelligence integration
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowFeatureDialog(true)}
          >
            Add Feature
          </Button>
          <Button variant="outlined" startIcon={<PlayIcon />}>
            Validate Pipeline
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export
          </Button>
        </Box>
      </Box>

      <Alert severity="success" sx={{ mb: 3 }}>
        <AlertTitle>🚀 H2O.ai Competitive Edge</AlertTitle>
        <Typography variant="body2">
          <strong>Security-optimized feature engineering:</strong> Interactive studio with threat intelligence integration, 
          bias risk assessment, compliance validation, and drag-and-drop pipeline builder - capabilities H2O.ai lacks!
        </Typography>
      </Alert>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main" gutterBottom>
                Security Score: {pipeline.securityScore}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall security relevance of feature pipeline
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary.main" gutterBottom>
                Compliance Score: {pipeline.complianceScore}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Regulatory compliance assessment
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main" gutterBottom>
                Features: {pipeline.features.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total engineered features in pipeline
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Feature Pipeline" />
        <Tab label="Transformations" />
        <Tab label="Security Analysis" />
        <Tab label="Compliance Check" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Feature Pipeline (Drag to reorder)
                </Typography>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="features">
                    {(provided) => (
                      <List {...provided.droppableProps} ref={provided.innerRef}>
                        {pipeline.features.map((feature, index) => (
                          <Draggable key={feature.id} draggableId={feature.id} index={index}>
                            {(provided) => (
                              <ListItem
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{ 
                                  mb: 1, 
                                  bgcolor: 'background.paper',
                                  border: 1,
                                  borderColor: 'divider',
                                  borderRadius: 1
                                }}
                              >
                                <ListItemIcon>
                                  {getFeatureTypeIcon(feature.type)}
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="subtitle1">{feature.name}</Typography>
                                      {feature.threatIntelligence && (
                                        <Chip label="Threat Intel" color="error" size="small" />
                                      )}
                                      <Chip 
                                        label={`Security: ${feature.securityRelevance}%`} 
                                        color="primary" 
                                        size="small" 
                                      />
                                      <Chip 
                                        label={`Bias: ${feature.biasRisk}`} 
                                        color={getBiasRiskColor(feature.biasRisk) as any}
                                        size="small" 
                                      />
                                    </Box>
                                  }
                                  secondary={
                                    <Box>
                                      <Typography variant="body2" sx={{ mb: 1 }}>
                                        {feature.description}
                                      </Typography>
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        {feature.complianceFlags?.map((flag) => (
                                          <Chip key={flag} label={flag} size="small" variant="outlined" />
                                        ))}
                                      </Box>
                                    </Box>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <IconButton
                                    onClick={() => {
                                      setSelectedFeature(feature);
                                      setShowFeatureDialog(true);
                                    }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton color="error">
                                    <DeleteIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </List>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Feature Importance vs Security Relevance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={featureImportanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <ChartTooltip />
                    <Line type="monotone" dataKey="importance" stroke="#2196f3" name="Importance %" />
                    <Line type="monotone" dataKey="security" stroke="#f44336" name="Security %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Feature Transformations
                </Typography>
                <List>
                  {pipeline.transformations.map((transform) => (
                    <Accordion key={transform.id}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <TransformIcon color="primary" />
                          <Typography variant="subtitle1">{transform.name}</Typography>
                          <Chip 
                            label={transform.type.replace('_', ' ').toUpperCase()} 
                            size="small" 
                            color={transform.type === 'security_enrichment' ? 'error' : 'default'}
                          />
                          {transform.validation.passed ? (
                            <CheckIcon color="success" />
                          ) : (
                            <WarningIcon color="warning" />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Configuration:
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                              <Typography variant="body2" component="pre">
                                {JSON.stringify(transform.configuration, null, 2)}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Security Impact:
                            </Typography>
                            <Alert severity="info">
                              <Typography variant="body2">
                                {transform.securityImpact}
                              </Typography>
                            </Alert>
                            <Typography variant="subtitle2" sx={{ mt: 2 }}>
                              Input → Output:
                            </Typography>
                            <Typography variant="body2">
                              {transform.inputFeatures.join(', ')} → {transform.outputFeature}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              Code:
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'white', overflow: 'auto' }}>
                              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                                {transform.code}
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </List>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setShowTransformDialog(true)}
                  sx={{ mt: 2 }}
                >
                  Add Transformation
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Security Analysis Summary
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Threat Intelligence Features"
                      secondary={`${pipeline.features.filter(f => f.threatIntelligence).length} of ${pipeline.features.length} features include threat intelligence`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="High Bias Risk Features"
                      secondary={`${pipeline.features.filter(f => f.biasRisk === 'high').length} features require bias monitoring`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Security Transformations"
                      secondary={`${pipeline.transformations.filter(t => t.type === 'security_enrichment').length} security-specific transformations active`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Feature Security Scoring
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Feature</TableCell>
                        <TableCell>Security Score</TableCell>
                        <TableCell>Threat Intel</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pipeline.features
                        .sort((a, b) => b.securityRelevance - a.securityRelevance)
                        .slice(0, 10)
                        .map((feature) => (
                        <TableRow key={feature.id}>
                          <TableCell>{feature.name}</TableCell>
                          <TableCell>
                            <Chip 
                              label={`${feature.securityRelevance}%`}
                              color={feature.securityRelevance > 90 ? 'success' : feature.securityRelevance > 70 ? 'primary' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {feature.threatIntelligence ? <CheckIcon color="success" /> : '-'}
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
                  Compliance Assessment
                </Typography>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <AlertTitle>Overall Compliance Score: {pipeline.complianceScore}%</AlertTitle>
                  Feature pipeline meets regulatory requirements with minor recommendations.
                </Alert>
                
                <Typography variant="subtitle1" gutterBottom>
                  Compliance Flags by Feature:
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Feature</TableCell>
                        <TableCell>Compliance Flags</TableCell>
                        <TableCell>Bias Risk</TableCell>
                        <TableCell>Recommendations</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pipeline.features.map((feature) => (
                        <TableRow key={feature.id}>
                          <TableCell>{feature.name}</TableCell>
                          <TableCell>
                            {feature.complianceFlags?.map((flag) => (
                              <Chip key={flag} label={flag} size="small" sx={{ mr: 1 }} />
                            ))}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={feature.biasRisk}
                              color={getBiasRiskColor(feature.biasRisk) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {feature.biasRisk === 'high' ? 'Implement bias monitoring' :
                             feature.biasRisk === 'medium' ? 'Regular bias checks' : 'Continue monitoring'}
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

      {/* Feature Dialog */}
      <Dialog open={showFeatureDialog} onClose={() => setShowFeatureDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedFeature ? 'Edit Feature' : 'Add New Feature'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Feature Name"
                value={newFeature.name || selectedFeature?.name || ''}
                onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Feature Type</InputLabel>
                <Select
                  value={newFeature.type || selectedFeature?.type || 'numerical'}
                  onChange={(e) => setNewFeature({ ...newFeature, type: e.target.value as any })}
                >
                  <MenuItem value="numerical">Numerical</MenuItem>
                  <MenuItem value="categorical">Categorical</MenuItem>
                  <MenuItem value="temporal">Temporal</MenuItem>
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                  <MenuItem value="derived">Derived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newFeature.description || selectedFeature?.description || ''}
                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Security Relevance (0-100)"
                value={newFeature.securityRelevance || selectedFeature?.securityRelevance || 50}
                onChange={(e) => setNewFeature({ ...newFeature, securityRelevance: parseInt(e.target.value) })}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Bias Risk</InputLabel>
                <Select
                  value={newFeature.biasRisk || selectedFeature?.biasRisk || 'medium'}
                  onChange={(e) => setNewFeature({ ...newFeature, biasRisk: e.target.value as any })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newFeature.threatIntelligence || selectedFeature?.threatIntelligence || false}
                    onChange={(e) => setNewFeature({ ...newFeature, threatIntelligence: e.target.checked })}
                  />
                }
                label="Includes Threat Intelligence"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFeatureDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddFeature}>
            {selectedFeature ? 'Update' : 'Add'} Feature
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InteractiveFeatureEngineering;