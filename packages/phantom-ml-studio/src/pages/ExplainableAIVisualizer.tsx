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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Psychology as AIIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Treemap,
  Scatter,
} from 'recharts';

interface FeatureImportance {
  feature: string;
  importance: number;
  category: 'behavioral' | 'network' | 'temporal' | 'threat_intel' | 'contextual';
  securityRelevance: number;
  description: string;
  impactDirection: 'positive' | 'negative';
}

interface SHAPExplanation {
  feature: string;
  shapValue: number;
  baseValue: number;
  featureValue: string | number;
  category: string;
  confidence: number;
  threatContext?: string;
}

interface ModelExplanation {
  modelId: string;
  modelName: string;
  predictionId: string;
  prediction: string;
  confidence: number;
  threatType: string;
  securityScore: number;
  timestamp: string;
  globalExplanations: {
    featureImportance: FeatureImportance[];
    modelBehavior: string;
    threatPatterns: string[];
  };
  localExplanations: {
    shapValues: SHAPExplanation[];
    decisionPath: string[];
    alternativeOutcomes: Array<{ outcome: string; probability: number; requiredChanges: string[] }>;
  };
  securityContext: {
    threatIntelligenceUsed: string[];
    complianceImplications: string[];
    riskAssessment: 'low' | 'medium' | 'high' | 'critical';
    biasAnalysis: {
      detected: boolean;
      areas: string[];
      mitigation: string[];
    };
  };
}

const ExplainableAIVisualizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedExplanation, setSelectedExplanation] = useState<ModelExplanation | null>(null);
  const [explanations, setExplanations] = useState<ModelExplanation[]>([]);
  const [selectedModel, setSelectedModel] = useState('threat-detector-v3');
  const [explanationType, setExplanationType] = useState('global');
  const [showAdvancedDialog, setShowAdvancedDialog] = useState(false);
  const [importanceThreshold, setImportanceThreshold] = useState(0.1);
  const [showOnlySecurityFeatures, setShowOnlySecurityFeatures] = useState(false);

  useEffect(() => {
    // Initialize with mock explainable AI data
    const mockExplanations: ModelExplanation[] = [
      {
        modelId: 'threat-detector-v3',
        modelName: 'Advanced Threat Detection v3.1',
        predictionId: 'pred-2024-001',
        prediction: 'Malicious Activity Detected',
        confidence: 0.92,
        threatType: 'Advanced Persistent Threat',
        securityScore: 94.5,
        timestamp: new Date().toISOString(),
        globalExplanations: {
          featureImportance: [
            {
              feature: 'network_entropy_score',
              importance: 0.34,
              category: 'network',
              securityRelevance: 95,
              description: 'Statistical entropy of network traffic patterns indicating data exfiltration',
              impactDirection: 'positive'
            },
            {
              feature: 'behavioral_anomaly_score',
              importance: 0.28,
              category: 'behavioral',
              securityRelevance: 92,
              description: 'Deviation from normal user behavior patterns',
              impactDirection: 'positive'
            },
            {
              feature: 'threat_intel_matches',
              importance: 0.25,
              category: 'threat_intel',
              securityRelevance: 98,
              description: 'Number of matches with known threat intelligence indicators',
              impactDirection: 'positive'
            },
            {
              feature: 'temporal_pattern_score',
              importance: 0.18,
              category: 'temporal',
              securityRelevance: 87,
              description: 'Unusual timing patterns in system activities',
              impactDirection: 'positive'
            },
            {
              feature: 'privilege_escalation_indicators',
              importance: 0.16,
              category: 'behavioral',
              securityRelevance: 94,
              description: 'Signs of unauthorized privilege escalation attempts',
              impactDirection: 'positive'
            },
            {
              feature: 'geolocation_risk_score',
              importance: 0.12,
              category: 'contextual',
              securityRelevance: 78,
              description: 'Geographic location risk assessment based on threat intelligence',
              impactDirection: 'positive'
            },
            {
              feature: 'file_hash_reputation',
              importance: 0.11,
              category: 'threat_intel',
              securityRelevance: 96,
              description: 'Reputation score of file hashes from threat intelligence feeds',
              impactDirection: 'negative'
            },
            {
              feature: 'network_communication_patterns',
              importance: 0.09,
              category: 'network',
              securityRelevance: 89,
              description: 'Unusual network communication patterns and protocols',
              impactDirection: 'positive'
            }
          ],
          modelBehavior: 'The model primarily relies on network entropy analysis and behavioral anomaly detection, with strong support from threat intelligence matching. The decision-making process emphasizes security-relevant features with high confidence.',
          threatPatterns: [
            'Multi-stage attack progression detected',
            'Command and control communication patterns',
            'Data exfiltration behavioral signatures',
            'Privilege escalation sequence identified'
          ]
        },
        localExplanations: {
          shapValues: [
            {
              feature: 'network_entropy_score',
              shapValue: 0.15,
              baseValue: 0.12,
              featureValue: 7.8,
              category: 'network',
              confidence: 0.94,
              threatContext: 'High entropy indicates potential data exfiltration'
            },
            {
              feature: 'behavioral_anomaly_score',
              shapValue: 0.12,
              baseValue: 0.08,
              featureValue: 8.2,
              category: 'behavioral',
              confidence: 0.89,
              threatContext: 'Significant deviation from user baseline behavior'
            },
            {
              feature: 'threat_intel_matches',
              shapValue: 0.18,
              baseValue: 0.05,
              featureValue: 5,
              category: 'threat_intel',
              confidence: 0.97,
              threatContext: 'Multiple IOCs match known APT signatures'
            },
            {
              feature: 'temporal_pattern_score',
              shapValue: 0.08,
              baseValue: 0.04,
              featureValue: 6.1,
              category: 'temporal',
              confidence: 0.83,
              threatContext: 'Activity during non-business hours'
            }
          ],
          decisionPath: [
            'Initial data ingestion and preprocessing',
            'Network entropy analysis reveals high entropy score (7.8)',
            'Behavioral analysis detects significant anomaly (8.2)',
            'Threat intelligence matching finds 5 IOC matches',
            'Temporal analysis confirms suspicious timing',
            'Model aggregates evidence with weighted scoring',
            'Final prediction: Malicious Activity (92% confidence)'
          ],
          alternativeOutcomes: [
            {
              outcome: 'Benign Activity',
              probability: 0.08,
              requiredChanges: [
                'Reduce network entropy score below 4.0',
                'Decrease behavioral anomaly score below 3.0',
                'Remove threat intelligence matches'
              ]
            }
          ]
        },
        securityContext: {
          threatIntelligenceUsed: [
            'MITRE ATT&CK Framework',
            'VirusTotal IOC Database',
            'CrowdStrike Threat Intelligence',
            'Internal threat hunting data'
          ],
          complianceImplications: [
            'GDPR: User behavior analysis requires privacy consideration',
            'SOC2: Audit trail maintained for security decisions',
            'NIST: Threat intelligence integration meets framework requirements'
          ],
          riskAssessment: 'high',
          biasAnalysis: {
            detected: false,
            areas: [],
            mitigation: ['Regular bias auditing scheduled', 'Diverse training data maintained']
          }
        }
      }
    ];

    setExplanations(mockExplanations);
    setSelectedExplanation(mockExplanations[0]);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      behavioral: '#2196f3',
      network: '#4caf50',
      temporal: '#ff9800',
      threat_intel: '#f44336',
      contextual: '#9c27b0'
    };
    return colors[category] || '#757575';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const filteredFeatures = selectedExplanation 
    ? selectedExplanation.globalExplanations.featureImportance.filter(feature => {
        if (feature.importance < importanceThreshold) return false;
        if (showOnlySecurityFeatures && feature.securityRelevance < 90) return false;
        return true;
      })
    : [];

  if (!selectedExplanation) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🔍 Explainable AI Visualization Engine
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Security-focused AI explainability with threat context and bias analysis
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowAdvancedDialog(true)}
          >
            Filters
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export Report
          </Button>
          <Button variant="contained" startIcon={<RefreshIcon />}>
            Generate Explanation
          </Button>
        </Box>
      </Box>

      <Alert severity="success" sx={{ mb: 3 }}>
        <AlertTitle>🏆 H2O.ai Competitive Edge</AlertTitle>
        <Typography variant="body2">
          <strong>Security-focused explainable AI:</strong> SHAP values with threat context, security-relevant feature importance, 
          bias detection, compliance analysis, and decision path visualization - specialized capabilities H2O.ai lacks!
        </Typography>
      </Alert>

      {/* Model Selection and Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Model Prediction Summary</Typography>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Select Model</InputLabel>
                  <Select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    label="Select Model"
                  >
                    <MenuItem value="threat-detector-v3">Threat Detector v3.1</MenuItem>
                    <MenuItem value="anomaly-detector">Anomaly Detector</MenuItem>
                    <MenuItem value="malware-classifier">Malware Classifier</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" color="error.main">
                    {selectedExplanation.prediction}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Threat Type: {selectedExplanation.threatType}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Confidence</Typography>
                      <Typography variant="h5">{(selectedExplanation.confidence * 100).toFixed(1)}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Security Score</Typography>
                      <Typography variant="h5" color="primary">{selectedExplanation.securityScore}%</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Risk Assessment</Typography>
              <Chip
                label={selectedExplanation.securityContext.riskAssessment.toUpperCase()}
                color={getRiskColor(selectedExplanation.securityContext.riskAssessment) as any}
                size="medium"
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Based on threat intelligence analysis and behavioral patterns
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Feature Importance" />
        <Tab label="SHAP Analysis" />
        <Tab label="Decision Path" />
        <Tab label="Security Context" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Global Feature Importance Chart */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Global Feature Importance
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={filteredFeatures} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="feature" type="category" width={200} />
                    <ChartTooltip />
                    <Bar 
                      dataKey="importance" 
                      fill="#2196f3" 
                      name="Feature Importance"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature Categories */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Feature Categories
                </Typography>
                <List>
                  {['behavioral', 'network', 'temporal', 'threat_intel', 'contextual'].map((category) => {
                    const categoryFeatures = filteredFeatures.filter(f => f.category === category);
                    const totalImportance = categoryFeatures.reduce((sum, f) => sum + f.importance, 0);
                    
                    return (
                      <ListItem key={category}>
                        <ListItemIcon>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              bgcolor: getCategoryColor(category),
                              borderRadius: '50%'
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={category.replace('_', ' ').toUpperCase()}
                          secondary={`${(totalImportance * 100).toFixed(1)}% total importance`}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature Details Table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Detailed Feature Analysis
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Feature</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Importance</TableCell>
                        <TableCell>Security Relevance</TableCell>
                        <TableCell>Impact</TableCell>
                        <TableCell>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredFeatures.map((feature, index) => (
                        <TableRow key={index}>
                          <TableCell>{feature.feature.replace(/_/g, ' ')}</TableCell>
                          <TableCell>
                            <Chip 
                              label={feature.category} 
                              size="small"
                              style={{ backgroundColor: getCategoryColor(feature.category), color: 'white' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={feature.importance * 100}
                                sx={{ width: 60, height: 6 }}
                              />
                              <Typography variant="body2">
                                {(feature.importance * 100).toFixed(1)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`${feature.securityRelevance}%`}
                              color={feature.securityRelevance > 90 ? 'error' : 'primary'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={feature.impactDirection === 'positive' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                              label={feature.impactDirection}
                              color={feature.impactDirection === 'positive' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 300 }}>
                            <Typography variant="body2">
                              {feature.description}
                            </Typography>
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

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  SHAP Values Analysis
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={selectedExplanation.localExplanations.shapValues}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" angle={-45} textAnchor="end" height={120} />
                    <YAxis />
                    <ChartTooltip />
                    <Bar dataKey="shapValue" fill="#4caf50" name="SHAP Value" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  SHAP Explanation
                </Typography>
                <Typography variant="body2" paragraph>
                  SHAP (SHapley Additive exPlanations) values show how much each feature 
                  contributed to this specific prediction compared to the average prediction.
                </Typography>
                <List dense>
                  {selectedExplanation.localExplanations.shapValues.map((shap, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            bgcolor: getCategoryColor(shap.category),
                            borderRadius: '50%'
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={shap.feature.replace(/_/g, ' ')}
                        secondary={
                          <Box>
                            <Typography variant="caption">
                              SHAP: {shap.shapValue.toFixed(3)} | 
                              Value: {shap.featureValue} | 
                              Confidence: {(shap.confidence * 100).toFixed(1)}%
                            </Typography>
                            {shap.threatContext && (
                              <Typography variant="caption" display="block" color="error">
                                {shap.threatContext}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Alternative Outcomes Analysis
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Alternative Outcome</TableCell>
                        <TableCell>Probability</TableCell>
                        <TableCell>Required Changes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedExplanation.localExplanations.alternativeOutcomes.map((outcome, index) => (
                        <TableRow key={index}>
                          <TableCell>{outcome.outcome}</TableCell>
                          <TableCell>{(outcome.probability * 100).toFixed(1)}%</TableCell>
                          <TableCell>
                            <List dense>
                              {outcome.requiredChanges.map((change, changeIndex) => (
                                <ListItem key={changeIndex} sx={{ py: 0 }}>
                                  <Typography variant="body2">• {change}</Typography>
                                </ListItem>
                              ))}
                            </List>
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

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Model Decision Path
                </Typography>
                <Box sx={{ position: 'relative' }}>
                  {selectedExplanation.localExplanations.decisionPath.map((step, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          flexShrink: 0
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Paper sx={{ p: 2, flexGrow: 1 }}>
                        <Typography variant="body1">
                          {step}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Threat Intelligence Sources
                </Typography>
                <List>
                  {selectedExplanation.securityContext.threatIntelligenceUsed.map((source, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <SecurityIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={source} />
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
                  Compliance Implications
                </Typography>
                <List>
                  {selectedExplanation.securityContext.complianceImplications.map((implication, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <InfoIcon color="info" />
                      </ListItemIcon>
                      <ListItemText primary={implication} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bias Analysis Report
                </Typography>
                <Alert severity={selectedExplanation.securityContext.biasAnalysis.detected ? 'warning' : 'success'}>
                  <Typography variant="body1">
                    <strong>Bias Detection Status:</strong>{' '}
                    {selectedExplanation.securityContext.biasAnalysis.detected ? 'Bias detected' : 'No bias detected'}
                  </Typography>
                  {selectedExplanation.securityContext.biasAnalysis.areas.length > 0 && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Areas of concern:</strong> {selectedExplanation.securityContext.biasAnalysis.areas.join(', ')}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Mitigation measures:</strong> {selectedExplanation.securityContext.biasAnalysis.mitigation.join('; ')}
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Advanced Filters Dialog */}
      <Dialog open={showAdvancedDialog} onClose={() => setShowAdvancedDialog(false)}>
        <DialogTitle>Advanced Filtering Options</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography gutterBottom>
              Minimum Feature Importance: {importanceThreshold.toFixed(2)}
            </Typography>
            <Slider
              value={importanceThreshold}
              onChange={(e, value) => setImportanceThreshold(value as number)}
              min={0}
              max={1}
              step={0.01}
              sx={{ mb: 3 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={showOnlySecurityFeatures}
                  onChange={(e) => setShowOnlySecurityFeatures(e.target.checked)}
                />
              }
              label="Show only high security relevance features (90%+)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAdvancedDialog(false)}>Close</Button>
          <Button variant="contained" onClick={() => setShowAdvancedDialog(false)}>
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExplainableAIVisualizer;