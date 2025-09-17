'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  Assessment,
  Security,
  Balance,
  BugReport,
  MoreVert
} from '@mui/icons-material';

interface BiasMetric {
  metric: string;
  value: number;
  threshold: number;
  status: 'pass' | 'warning' | 'fail';
  description: string;
}

interface BiasReport {
  id: string;
  modelId: string;
  modelName: string;
  timestamp: Date;
  overallScore: number;
  status: 'good' | 'moderate' | 'high_bias';
  metrics: BiasMetric[];
  protectedAttributes: string[];
  recommendations: string[];
}

interface FairnessAnalysis {
  attribute: string;
  groups: Array<{
    group: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    count: number;
  }>;
  disparityMetrics: {
    demographicParity: number;
    equalizedOdds: number;
    equalOpportunity: number;
  };
}

export default function BiasDetectionClient() {
  const [activeTab, setActiveTab] = useState(0);
  const [biasReports, setBiasReports] = useState<BiasReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<BiasReport | null>(null);
  const [fairnessAnalysis, setFairnessAnalysis] = useState<FairnessAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runAnalysisDialogOpen, setRunAnalysisDialogOpen] = useState(false);
  const [analysisConfig, setAnalysisConfig] = useState({
    modelId: '',
    protectedAttributes: [] as string[],
    sensitivityLevel: 'medium'
  });

  useEffect(() => {
    fetchBiasReports();
    fetchFairnessAnalysis();
  }, []);

  const fetchBiasReports = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockReports: BiasReport[] = [
        {
          id: 'report_1',
          modelId: 'model_hiring',
          modelName: 'Hiring Decision Model',
          timestamp: new Date(Date.now() - 3600000),
          overallScore: 0.72,
          status: 'moderate',
          metrics: [
            { metric: 'Demographic Parity', value: 0.85, threshold: 0.8, status: 'pass', description: 'Selection rate difference between groups' },
            { metric: 'Equalized Odds', value: 0.75, threshold: 0.8, status: 'warning', description: 'TPR and FPR equality across groups' },
            { metric: 'Equal Opportunity', value: 0.65, threshold: 0.8, status: 'fail', description: 'TPR equality for positive outcomes' },
            { metric: 'Calibration', value: 0.88, threshold: 0.8, status: 'pass', description: 'Prediction accuracy across groups' }
          ],
          protectedAttributes: ['gender', 'race', 'age'],
          recommendations: [
            'Retrain model with balanced dataset',
            'Apply post-processing bias mitigation',
            'Review feature selection for gender bias'
          ]
        },
        {
          id: 'report_2',
          modelId: 'model_credit',
          modelName: 'Credit Approval Model',
          timestamp: new Date(Date.now() - 7200000),
          overallScore: 0.91,
          status: 'good',
          metrics: [
            { metric: 'Demographic Parity', value: 0.92, threshold: 0.8, status: 'pass', description: 'Selection rate difference between groups' },
            { metric: 'Equalized Odds', value: 0.89, threshold: 0.8, status: 'pass', description: 'TPR and FPR equality across groups' },
            { metric: 'Equal Opportunity', value: 0.91, threshold: 0.8, status: 'pass', description: 'TPR equality for positive outcomes' },
            { metric: 'Calibration', value: 0.93, threshold: 0.8, status: 'pass', description: 'Prediction accuracy across groups' }
          ],
          protectedAttributes: ['race', 'gender'],
          recommendations: [
            'Continue monitoring model performance',
            'Regular bias audits recommended'
          ]
        },
        {
          id: 'report_3',
          modelId: 'model_healthcare',
          modelName: 'Treatment Recommendation',
          timestamp: new Date(Date.now() - 10800000),
          overallScore: 0.58,
          status: 'high_bias',
          metrics: [
            { metric: 'Demographic Parity', value: 0.45, threshold: 0.8, status: 'fail', description: 'Selection rate difference between groups' },
            { metric: 'Equalized Odds', value: 0.52, threshold: 0.8, status: 'fail', description: 'TPR and FPR equality across groups' },
            { metric: 'Equal Opportunity', value: 0.68, threshold: 0.8, status: 'warning', description: 'TPR equality for positive outcomes' },
            { metric: 'Calibration', value: 0.71, threshold: 0.8, status: 'warning', description: 'Prediction accuracy across groups' }
          ],
          protectedAttributes: ['race', 'gender', 'age', 'income'],
          recommendations: [
            'URGENT: Immediate bias mitigation required',
            'Collect more representative training data',
            'Apply algorithmic fairness constraints',
            'Consider removing biased features'
          ]
        }
      ];

      setBiasReports(mockReports);
      setSelectedReport(mockReports[0]);
      setLoading(false);
    } catch (_err) {
      setError('Failed to fetch bias reports');
      setLoading(false);
    }
  };

  const fetchFairnessAnalysis = async () => {
    try {
      const mockAnalysis: FairnessAnalysis[] = [
        {
          attribute: 'gender',
          groups: [
            { group: 'male', accuracy: 0.87, precision: 0.85, recall: 0.89, f1Score: 0.87, count: 5240 },
            { group: 'female', accuracy: 0.82, precision: 0.79, recall: 0.85, f1Score: 0.82, count: 4760 },
            { group: 'non-binary', accuracy: 0.78, precision: 0.76, recall: 0.80, f1Score: 0.78, count: 150 }
          ],
          disparityMetrics: {
            demographicParity: 0.85,
            equalizedOdds: 0.75,
            equalOpportunity: 0.65
          }
        },
        {
          attribute: 'race',
          groups: [
            { group: 'white', accuracy: 0.88, precision: 0.86, recall: 0.90, f1Score: 0.88, count: 6200 },
            { group: 'black', accuracy: 0.81, precision: 0.78, recall: 0.84, f1Score: 0.81, count: 2100 },
            { group: 'hispanic', accuracy: 0.83, precision: 0.80, recall: 0.86, f1Score: 0.83, count: 1500 },
            { group: 'asian', accuracy: 0.85, precision: 0.83, recall: 0.87, f1Score: 0.85, count: 1200 }
          ],
          disparityMetrics: {
            demographicParity: 0.78,
            equalizedOdds: 0.72,
            equalOpportunity: 0.69
          }
        }
      ];

      setFairnessAnalysis(mockAnalysis);
    } catch (_err) {
      console.error('Failed to fetch fairness analysis:', _err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': case 'good': return 'success';
      case 'warning': case 'moderate': return 'warning';
      case 'fail': case 'high_bias': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': case 'good': return <CheckCircle color="success" />;
      case 'warning': case 'moderate': return <Warning color="warning" />;
      case 'fail': case 'high_bias': return <Error color="error" />;
      default: return <Info />;
    }
  };

  const handleRunAnalysis = async () => {
    try {
      console.log('Running bias analysis:', analysisConfig);
      setRunAnalysisDialogOpen(false);
      setAnalysisConfig({ modelId: '', protectedAttributes: [], sensitivityLevel: 'medium' });
      await fetchBiasReports();
    } catch (_err) {
      setError('Failed to run bias analysis');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Bias Detection Engine
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchBiasReports}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Assessment />}
            onClick={() => setRunAnalysisDialogOpen(true)}
          >
            Run Analysis
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Bias Reports" icon={<BugReport />} />
          <Tab label="Fairness Analysis" icon={<Balance />} />
          <Tab label="Recommendations" icon={<Security />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Reports List */}
          <Grid xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Bias Reports
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Model</TableCell>
                        <TableCell>Overall Score</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Protected Attributes</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {biasReports.map((report) => (
                        <TableRow
                          key={report.id}
                          onClick={() => setSelectedReport(report)}
                          sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                        >
                          <TableCell>{report.modelName}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <LinearProgress
                                variant="determinate"
                                value={report.overallScore * 100}
                                sx={{ width: 100, mr: 1 }}
                                color={getStatusColor(report.status) as 'success' | 'warning' | 'error'}
                              />
                              <Typography variant="body2">
                                {(report.overallScore * 100).toFixed(0)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(report.status)}
                              label={report.status.replace('_', ' ')}
                              color={getStatusColor(report.status) as 'success' | 'warning' | 'error' | 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{report.timestamp.toLocaleString()}</TableCell>
                          <TableCell>
                            <Box>
                              {report.protectedAttributes.map((attr) => (
                                <Chip key={attr} label={attr} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <MoreVert />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Report Details */}
          <Grid xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Report Details
                </Typography>
                {selectedReport ? (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {selectedReport.modelName}
                    </Typography>
                    <Box mb={2}>
                      <Chip
                        icon={getStatusIcon(selectedReport.status)}
                        label={selectedReport.status.replace('_', ' ')}
                        color={getStatusColor(selectedReport.status) as 'success' | 'warning' | 'error' | 'default'}
                      />
                    </Box>
                    <Typography variant="h4" gutterBottom>
                      {(selectedReport.overallScore * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Overall Fairness Score
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      Bias Metrics:
                    </Typography>
                    {selectedReport.metrics.map((metric) => (
                      <Box key={metric.metric} mb={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">{metric.metric}</Typography>
                          <Chip
                            label={metric.status}
                            color={getStatusColor(metric.status) as 'success' | 'warning' | 'error' | 'default'}
                            size="small"
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(metric.value / metric.threshold) * 100}
                          color={getStatusColor(metric.status) as 'success' | 'warning' | 'error'}
                          sx={{ mt: 0.5 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {metric.value.toFixed(2)} / {metric.threshold.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Select a report to view details
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {fairnessAnalysis.map((analysis) => (
            <Grid xs={12} md={6} key={analysis.attribute}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {analysis.attribute.charAt(0).toUpperCase() + analysis.attribute.slice(1)} Analysis
                  </Typography>

                  {/* Group Performance */}
                  <Typography variant="subtitle2" gutterBottom>
                    Group Performance
                  </Typography>
                  <TableContainer sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Group</TableCell>
                          <TableCell>Accuracy</TableCell>
                          <TableCell>Precision</TableCell>
                          <TableCell>Recall</TableCell>
                          <TableCell>Count</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analysis.groups.map((group) => (
                          <TableRow key={group.group}>
                            <TableCell>{group.group}</TableCell>
                            <TableCell>{(group.accuracy * 100).toFixed(1)}%</TableCell>
                            <TableCell>{(group.precision * 100).toFixed(1)}%</TableCell>
                            <TableCell>{(group.recall * 100).toFixed(1)}%</TableCell>
                            <TableCell>{group.count.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Disparity Metrics */}
                  <Typography variant="subtitle2" gutterBottom>
                    Disparity Metrics
                  </Typography>
                  <Box>
                    {Object.entries(analysis.disparityMetrics).map(([metric, value]) => (
                      <Box key={metric} mb={1}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">
                            {metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Typography>
                          <Typography variant="body2">{value.toFixed(2)}</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={value * 100}
                          color={value >= 0.8 ? 'success' : value >= 0.6 ? 'warning' : 'error'}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bias Mitigation Recommendations
                </Typography>
                {selectedReport && (
                  <List>
                    {selectedReport.recommendations.map((recommendation, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {selectedReport.status === 'high_bias' ?
                            <Error color="error" /> :
                            selectedReport.status === 'moderate' ?
                            <Warning color="warning" /> :
                            <CheckCircle color="success" />
                          }
                        </ListItemIcon>
                        <ListItemText primary={recommendation} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Run Analysis Dialog */}
      <Dialog open={runAnalysisDialogOpen} onClose={() => setRunAnalysisDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Run Bias Analysis</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Model</InputLabel>
                  <Select
                    value={analysisConfig.modelId}
                    onChange={(e) => setAnalysisConfig({ ...analysisConfig, modelId: e.target.value })}
                  >
                    <MenuItem value="model_hiring">Hiring Decision Model</MenuItem>
                    <MenuItem value="model_credit">Credit Approval Model</MenuItem>
                    <MenuItem value="model_healthcare">Treatment Recommendation</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Sensitivity Level</InputLabel>
                  <Select
                    value={analysisConfig.sensitivityLevel}
                    onChange={(e) => setAnalysisConfig({ ...analysisConfig, sensitivityLevel: e.target.value })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRunAnalysisDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRunAnalysis}
            disabled={!analysisConfig.modelId}
          >
            Run Analysis
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}