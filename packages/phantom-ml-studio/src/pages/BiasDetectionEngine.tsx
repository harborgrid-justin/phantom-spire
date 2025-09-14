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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Assessment as AssessmentIcon,
  Shield as ShieldIcon,
  Report as ReportIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';

interface BiasMetric {
  category: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  complianceImpact: string;
}

interface ModelBiasAnalysis {
  modelId: string;
  modelName: string;
  algorithm: string;
  overallBiasScore: number;
  complianceStatus: 'compliant' | 'warning' | 'non-compliant';
  biasMetrics: BiasMetric[];
  protectedAttributes: string[];
  securityImpact: string;
  lastAnalyzed: string;
}

interface FairnessReport {
  id: string;
  timestamp: string;
  modelName: string;
  reportType: 'automated' | 'regulatory' | 'audit';
  findings: string[];
  recommendations: string[];
  complianceScore: number;
}

const BiasDetectionEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedModel, setSelectedModel] = useState<ModelBiasAnalysis | null>(null);
  const [models, setModels] = useState<ModelBiasAnalysis[]>([]);
  const [reports, setReports] = useState<FairnessReport[]>([]);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedBiasMetric, setSelectedBiasMetric] = useState<BiasMetric | null>(null);

  useEffect(() => {
    // Initialize with mock bias analysis data
    const mockModels: ModelBiasAnalysis[] = [
      {
        modelId: 'threat-detector-v3',
        modelName: 'Advanced Threat Detection',
        algorithm: 'XGBoost-Security',
        overallBiasScore: 87.5,
        complianceStatus: 'compliant',
        protectedAttributes: ['geographic_region', 'organization_size', 'industry_sector'],
        securityImpact: 'Low risk - bias detection shows minimal security implications',
        lastAnalyzed: new Date().toISOString(),
        biasMetrics: [
          {
            category: 'Demographic Parity',
            metric: 'Geographic Bias',
            value: 0.12,
            threshold: 0.15,
            severity: 'low',
            description: 'Slight variation in threat detection across geographic regions',
            recommendation: 'Continue monitoring, implement region-specific calibration',
            complianceImpact: 'Compliant with GDPR geographic fairness requirements'
          },
          {
            category: 'Equalized Odds',
            metric: 'Organization Size Fairness',
            value: 0.08,
            threshold: 0.10,
            severity: 'low',
            description: 'Model performs consistently across different organization sizes',
            recommendation: 'Maintain current feature engineering approach',
            complianceImpact: 'Meets SOC2 fairness compliance standards'
          },
          {
            category: 'Predictive Parity',
            metric: 'Industry Sector Bias',
            value: 0.18,
            threshold: 0.15,
            severity: 'medium',
            description: 'Higher false positive rates in financial sector',
            recommendation: 'Implement sector-specific thresholds and recalibration',
            complianceImpact: 'May require additional documentation for financial regulations'
          }
        ]
      },
      {
        modelId: 'anomaly-detector-v2',
        modelName: 'Network Anomaly Detector',
        algorithm: 'Neural-Security',
        overallBiasScore: 72.3,
        complianceStatus: 'warning',
        protectedAttributes: ['network_segment', 'user_privilege_level', 'time_zone'],
        securityImpact: 'Medium risk - bias may create security blind spots',
        lastAnalyzed: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        biasMetrics: [
          {
            category: 'Statistical Parity',
            metric: 'Network Segment Bias',
            value: 0.22,
            threshold: 0.15,
            severity: 'high',
            description: 'Significant bias against DMZ network segments',
            recommendation: 'Urgent: Rebalance training data, implement segment-aware features',
            complianceImpact: 'Risk of non-compliance with network security audit requirements'
          },
          {
            category: 'Individual Fairness',
            metric: 'User Privilege Bias',
            value: 0.19,
            threshold: 0.12,
            severity: 'medium',
            description: 'Higher anomaly detection rates for admin users',
            recommendation: 'Implement privilege-aware anomaly thresholds',
            complianceImpact: 'May impact privileged access compliance monitoring'
          }
        ]
      },
      {
        modelId: 'malware-classifier-v4',
        modelName: 'Malware Classification Engine',
        algorithm: 'RandomForest-Threat',
        overallBiasScore: 94.1,
        complianceStatus: 'compliant',
        protectedAttributes: ['file_source', 'submission_method', 'analysis_environment'],
        securityImpact: 'Very low risk - excellent fairness across all attributes',
        lastAnalyzed: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        biasMetrics: [
          {
            category: 'Calibration',
            metric: 'Source Attribution Fairness',
            value: 0.05,
            threshold: 0.10,
            severity: 'low',
            description: 'Excellent calibration across different malware sources',
            recommendation: 'Continue current approach, model serves as bias detection benchmark',
            complianceImpact: 'Exceeds all regulatory fairness requirements'
          }
        ]
      }
    ];

    const mockReports: FairnessReport[] = [
      {
        id: 'report-001',
        timestamp: new Date().toISOString(),
        modelName: 'Network Anomaly Detector',
        reportType: 'automated',
        findings: [
          'Network segment bias exceeds threshold',
          'Privilege level bias detected',
          'Time zone fairness within acceptable range'
        ],
        recommendations: [
          'Implement segment-aware feature engineering',
          'Rebalance training data for network segments',
          'Deploy privilege-aware anomaly thresholds',
          'Increase monitoring frequency for DMZ segments'
        ],
        complianceScore: 72.3
      },
      {
        id: 'report-002',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        modelName: 'Advanced Threat Detection',
        reportType: 'regulatory',
        findings: [
          'All bias metrics within regulatory thresholds',
          'Geographic fairness compliant with GDPR',
          'Industry sector bias requires monitoring'
        ],
        recommendations: [
          'Continue current monitoring schedule',
          'Implement industry-specific calibration',
          'Document compliance procedures for audit trail'
        ],
        complianceScore: 87.5
      }
    ];

    setModels(mockModels);
    setReports(mockReports);
    setSelectedModel(mockModels[0]);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getComplianceColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'compliant': return 'success';
      case 'warning': return 'warning';
      case 'non-compliant': return 'error';
      default: return 'default';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const radarData = selectedModel ? selectedModel.biasMetrics.map(metric => ({
    subject: metric.metric,
    fairness: 100 - (metric.value * 100),
    threshold: 100 - (metric.threshold * 100),
  })) : [];

  const biasDistributionData = models.map(model => ({
    name: model.modelName,
    biasScore: model.overallBiasScore,
    complianceImpact: model.complianceStatus === 'compliant' ? 90 : 
                     model.complianceStatus === 'warning' ? 70 : 40,
  }));

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🛡️ Security-First Bias Detection Engine
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI fairness analysis with security impact assessment and regulatory compliance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Analysis">
            <IconButton>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Generate Report">
            <IconButton>
              <ReportIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Results">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Alert severity="success" sx={{ mb: 3 }}>
        <AlertTitle>🏆 H2O.ai Competitive Advantage</AlertTitle>
        <Typography variant="body2">
          <strong>Security-focused bias detection:</strong> Unique combination of AI fairness analysis with security impact assessment, 
          regulatory compliance monitoring, and threat intelligence integration - capabilities H2O.ai lacks!
        </Typography>
      </Alert>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Bias Overview" />
        <Tab label="Detailed Analysis" />
        <Tab label="Compliance Reports" />
        <Tab label="Mitigation Actions" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Model Selection and Overview */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Model Selection
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Model</InputLabel>
                  <Select
                    value={selectedModel?.modelId || ''}
                    onChange={(e) => {
                      const model = models.find(m => m.modelId === e.target.value);
                      setSelectedModel(model || null);
                    }}
                  >
                    {models.map((model) => (
                      <MenuItem key={model.modelId} value={model.modelId}>
                        {model.modelName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {selectedModel && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Overall Bias Score
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={selectedModel.overallBiasScore}
                        sx={{ flexGrow: 1, height: 12, borderRadius: 6 }}
                        color={selectedModel.overallBiasScore > 85 ? 'success' : 'warning'}
                      />
                      <Typography variant="h6">
                        {selectedModel.overallBiasScore.toFixed(1)}%
                      </Typography>
                    </Box>
                    
                    <Chip
                      label={`Compliance: ${selectedModel.complianceStatus.toUpperCase()}`}
                      color={getComplianceColor(selectedModel.complianceStatus)}
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary">
                      <strong>Security Impact:</strong> {selectedModel.securityImpact}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Bias Metrics Radar Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Fairness Radar Analysis
                </Typography>
                {selectedModel && (
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis />
                      <Radar
                        name="Fairness Score"
                        dataKey="fairness"
                        stroke="#2196f3"
                        fill="#2196f3"
                        fillOpacity={0.3}
                      />
                      <Radar
                        name="Threshold"
                        dataKey="threshold"
                        stroke="#ff9800"
                        fill="transparent"
                        strokeDasharray="5 5"
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Model Comparison Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Model Bias Comparison
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={biasDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip />
                    <Bar dataKey="biasScore" fill="#4caf50" name="Bias Score %" />
                    <Bar dataKey="complianceImpact" fill="#2196f3" name="Compliance Impact %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Protected Attributes */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Protected Attributes Monitored
                </Typography>
                {selectedModel && (
                  <List>
                    {selectedModel.protectedAttributes.map((attr, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ShieldIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={attr.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          secondary="Actively monitored for bias"
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Security Impact Assessment */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Security Impact Assessment
                </Typography>
                {selectedModel && (
                  <Alert 
                    severity={selectedModel.complianceStatus === 'compliant' ? 'success' : 'warning'}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="body2">
                      {selectedModel.securityImpact}
                    </Typography>
                  </Alert>
                )}
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Threat Detection Integrity"
                      secondary="Bias analysis ensures consistent threat identification"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AssessmentIcon color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Risk Assessment Fairness"
                      secondary="Equal risk evaluation across all protected attributes"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && selectedModel && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Detailed Bias Metrics: {selectedModel.modelName}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell>Metric</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Threshold</TableCell>
                        <TableCell>Severity</TableCell>
                        <TableCell>Security Impact</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedModel.biasMetrics.map((metric, index) => (
                        <TableRow key={index}>
                          <TableCell>{metric.category}</TableCell>
                          <TableCell>{metric.metric}</TableCell>
                          <TableCell>{metric.value.toFixed(3)}</TableCell>
                          <TableCell>{metric.threshold.toFixed(3)}</TableCell>
                          <TableCell>
                            <Chip
                              label={metric.severity.toUpperCase()}
                              color={getSeverityColor(metric.severity) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200 }}>
                              {metric.complianceImpact}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedBiasMetric(metric);
                                setShowDetailDialog(true);
                              }}
                            >
                              Details
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

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Compliance & Fairness Reports
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Model</TableCell>
                        <TableCell>Report Type</TableCell>
                        <TableCell>Compliance Score</TableCell>
                        <TableCell>Key Findings</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{new Date(report.timestamp).toLocaleDateString()}</TableCell>
                          <TableCell>{report.modelName}</TableCell>
                          <TableCell>
                            <Chip 
                              label={report.reportType.toUpperCase()} 
                              color={report.reportType === 'regulatory' ? 'error' : 'primary'}
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={report.complianceScore}
                                sx={{ width: 100, height: 8 }}
                                color={report.complianceScore > 85 ? 'success' : 'warning'}
                              />
                              <Typography variant="body2">
                                {report.complianceScore.toFixed(1)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 300 }}>
                              {report.findings.slice(0, 2).join('; ')}
                              {report.findings.length > 2 && '...'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined">
                              View Report
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

      {activeTab === 3 && selectedModel && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bias Mitigation Action Plan: {selectedModel.modelName}
                </Typography>
                <List>
                  {selectedModel.biasMetrics
                    .filter(metric => metric.severity !== 'low')
                    .map((metric, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: getSeverityColor(metric.severity) + '.main' }}>
                          {metric.severity === 'critical' ? <ErrorIcon /> : <WarningIcon />}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={`${metric.category}: ${metric.metric}`}
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.primary">
                              <strong>Issue:</strong> {metric.description}
                            </Typography>
                            <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                              <strong>Recommended Action:</strong> {metric.recommendation}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              <strong>Compliance Impact:</strong> {metric.complianceImpact}
                            </Typography>
                          </Box>
                        }
                      />
                      <Button variant="contained" color="primary">
                        Apply Fix
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onClose={() => setShowDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bias Metric Details</DialogTitle>
        <DialogContent>
          {selectedBiasMetric && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedBiasMetric.category}: {selectedBiasMetric.metric}
              </Typography>
              
              <Alert severity={getSeverityColor(selectedBiasMetric.severity) as any} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Severity:</strong> {selectedBiasMetric.severity.toUpperCase()} 
                  (Value: {selectedBiasMetric.value.toFixed(3)}, Threshold: {selectedBiasMetric.threshold.toFixed(3)})
                </Typography>
              </Alert>

              <Typography variant="subtitle1" gutterBottom>
                Description:
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedBiasMetric.description}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                Recommended Actions:
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedBiasMetric.recommendation}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                Compliance Impact:
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedBiasMetric.complianceImpact}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailDialog(false)}>Close</Button>
          <Button variant="contained">Export Analysis</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BiasDetectionEngine;