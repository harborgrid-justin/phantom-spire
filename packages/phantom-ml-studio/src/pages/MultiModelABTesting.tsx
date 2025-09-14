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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Timer as TimerIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';

interface ModelVariant {
  id: string;
  name: string;
  version: string;
  algorithm: string;
  trafficAllocation: number;
  status: 'active' | 'paused' | 'stopped' | 'failed';
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    falsePositiveRate: number;
    latency: number;
    throughput: number;
    securityScore: number;
  };
  securityMetrics: {
    threatDetectionRate: number;
    adversarialRobustness: number;
    biasScore: number;
    complianceScore: number;
  };
  businessMetrics: {
    costPerPrediction: number;
    resourceUtilization: number;
    userSatisfaction: number;
  };
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'failed' | 'paused';
  startDate: string;
  endDate?: string;
  duration: number; // days
  testType: 'accuracy' | 'security' | 'performance' | 'comprehensive';
  variants: ModelVariant[];
  trafficSplit: { [variantId: string]: number };
  hypothesis: string;
  successCriteria: {
    primaryMetric: string;
    minimumImprovement: number;
    statisticalSignificance: number;
    minimumSampleSize: number;
  };
  currentResults: {
    samplesCollected: number;
    statisticalPower: number;
    confidenceLevel: number;
    currentWinner?: string;
    significanceReached: boolean;
  };
  securityAnalysis: {
    threatCoverage: number;
    vulnerabilityExposure: number;
    complianceRisk: string;
    biasAssessment: string;
  };
}

const MultiModelABTesting: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [newTest, setNewTest] = useState<Partial<ABTest>>({});

  useEffect(() => {
    // Initialize with mock A/B test data
    const mockTests: ABTest[] = [
      {
        id: 'ab-test-threat-detection-001',
        name: 'Threat Detection Algorithm Comparison',
        description: 'Comparing XGBoost vs Neural Network for advanced threat detection',
        status: 'running',
        startDate: '2024-01-10',
        duration: 14,
        testType: 'comprehensive',
        hypothesis: 'Neural Network model will achieve 3% higher accuracy than XGBoost while maintaining security score above 95%',
        successCriteria: {
          primaryMetric: 'accuracy',
          minimumImprovement: 0.03,
          statisticalSignificance: 0.95,
          minimumSampleSize: 10000
        },
        variants: [
          {
            id: 'variant-xgboost-baseline',
            name: 'XGBoost Baseline',
            version: '2.1.0',
            algorithm: 'XGBoost with Security Features',
            trafficAllocation: 50,
            status: 'active',
            metrics: {
              accuracy: 94.2,
              precision: 93.8,
              recall: 94.6,
              f1Score: 94.2,
              falsePositiveRate: 0.058,
              latency: 1.2,
              throughput: 2400,
              securityScore: 96.1
            },
            securityMetrics: {
              threatDetectionRate: 92.7,
              adversarialRobustness: 88.3,
              biasScore: 91.2,
              complianceScore: 95.4
            },
            businessMetrics: {
              costPerPrediction: 0.002,
              resourceUtilization: 67.5,
              userSatisfaction: 4.2
            }
          },
          {
            id: 'variant-neural-challenger',
            name: 'Neural Network Challenger',
            version: '3.0.1',
            algorithm: 'Deep Neural Network with Attention',
            trafficAllocation: 50,
            status: 'active',
            metrics: {
              accuracy: 96.8,
              precision: 96.4,
              recall: 97.2,
              f1Score: 96.8,
              falsePositiveRate: 0.032,
              latency: 2.1,
              throughput: 1800,
              securityScore: 97.3
            },
            securityMetrics: {
              threatDetectionRate: 95.2,
              adversarialRobustness: 91.7,
              biasScore: 89.8,
              complianceScore: 97.1
            },
            businessMetrics: {
              costPerPrediction: 0.005,
              resourceUtilization: 82.3,
              userSatisfaction: 4.6
            }
          }
        ],
        trafficSplit: {
          'variant-xgboost-baseline': 50,
          'variant-neural-challenger': 50
        },
        currentResults: {
          samplesCollected: 8743,
          statisticalPower: 0.87,
          confidenceLevel: 0.94,
          currentWinner: 'variant-neural-challenger',
          significanceReached: false
        },
        securityAnalysis: {
          threatCoverage: 94.6,
          vulnerabilityExposure: 5.4,
          complianceRisk: 'low',
          biasAssessment: 'acceptable'
        }
      },
      {
        id: 'ab-test-anomaly-detection-002',
        name: 'Network Anomaly Detection Speed Test',
        description: 'Testing latency optimization vs accuracy trade-off',
        status: 'completed',
        startDate: '2023-12-20',
        endDate: '2024-01-05',
        duration: 16,
        testType: 'performance',
        hypothesis: 'Optimized model will achieve 50% latency improvement with less than 2% accuracy loss',
        successCriteria: {
          primaryMetric: 'latency',
          minimumImprovement: 0.50,
          statisticalSignificance: 0.95,
          minimumSampleSize: 15000
        },
        variants: [
          {
            id: 'variant-standard-model',
            name: 'Standard Model',
            version: '1.8.2',
            algorithm: 'Random Forest Standard',
            trafficAllocation: 30,
            status: 'stopped',
            metrics: {
              accuracy: 91.5,
              precision: 90.8,
              recall: 92.2,
              f1Score: 91.5,
              falsePositiveRate: 0.085,
              latency: 3.4,
              throughput: 1200,
              securityScore: 93.2
            },
            securityMetrics: {
              threatDetectionRate: 89.3,
              adversarialRobustness: 85.6,
              biasScore: 92.1,
              complianceScore: 91.8
            },
            businessMetrics: {
              costPerPrediction: 0.003,
              resourceUtilization: 55.2,
              userSatisfaction: 3.8
            }
          },
          {
            id: 'variant-optimized-model',
            name: 'Optimized Model',
            version: '1.9.0',
            algorithm: 'Random Forest Optimized',
            trafficAllocation: 70,
            status: 'stopped',
            metrics: {
              accuracy: 89.8,
              precision: 89.1,
              recall: 90.5,
              f1Score: 89.8,
              falsePositiveRate: 0.102,
              latency: 1.7,
              throughput: 2100,
              securityScore: 91.4
            },
            securityMetrics: {
              threatDetectionRate: 87.6,
              adversarialRobustness: 83.2,
              biasScore: 90.7,
              complianceScore: 89.3
            },
            businessMetrics: {
              costPerPrediction: 0.002,
              resourceUtilization: 48.7,
              userSatisfaction: 4.1
            }
          }
        ],
        trafficSplit: {
          'variant-standard-model': 30,
          'variant-optimized-model': 70
        },
        currentResults: {
          samplesCollected: 18652,
          statisticalPower: 0.98,
          confidenceLevel: 0.99,
          currentWinner: 'variant-optimized-model',
          significanceReached: true
        },
        securityAnalysis: {
          threatCoverage: 88.5,
          vulnerabilityExposure: 11.5,
          complianceRisk: 'medium',
          biasAssessment: 'good'
        }
      }
    ];

    setTests(mockTests);
    setSelectedTest(mockTests[0]);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'completed': return 'info';
      case 'paused': return 'warning';
      case 'failed': return 'error';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <PlayIcon />;
      case 'completed': return <CheckIcon />;
      case 'paused': return <PauseIcon />;
      case 'failed': return <ErrorIcon />;
      case 'draft': return <EditIcon />;
      default: return <TimerIcon />;
    }
  };

  const performanceData = selectedTest ? 
    selectedTest.variants.map((variant, index) => ({
      name: variant.name.substring(0, 15),
      accuracy: variant.metrics.accuracy,
      latency: variant.metrics.latency,
      securityScore: variant.metrics.securityScore,
      throughput: variant.metrics.throughput / 100, // Scale for chart
    })) : [];

  const timeSeriesData = Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    baseline: 94.2 + (Math.random() - 0.5) * 2,
    challenger: 96.8 + (Math.random() - 0.5) * 1.5,
  }));

  if (!selectedTest) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            ⚖️ Multi-Model A/B Testing Framework
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Security-focused A/B testing with statistical significance and threat analysis
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setShowTestDialog(true)}
          >
            Create Test
          </Button>
          <Button variant="contained" startIcon={<AssessmentIcon />}>
            View Reports
          </Button>
        </Box>
      </Box>

      <Alert severity="success" sx={{ mb: 3 }}>
        <AlertTitle>🏆 H2O.ai Competitive Edge</AlertTitle>
        <Typography variant="body2">
          <strong>Security-aware A/B testing:</strong> Statistical significance testing with security metrics, 
          threat coverage analysis, bias assessment, and compliance risk evaluation - specialized testing H2O.ai doesn't provide!
        </Typography>
      </Alert>

      {/* Test Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary.main">
                {tests.filter(t => t.status === 'running').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {tests.filter(t => t.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {selectedTest.currentResults.samplesCollected.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Samples Collected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {(selectedTest.currentResults.statisticalPower * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Statistical Power
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Test Overview" />
        <Tab label="Performance Analysis" />
        <Tab label="Security Metrics" />
        <Tab label="Statistical Results" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Test Selection */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Tests
                </Typography>
                <List>
                  {tests.map((test) => (
                    <ListItem
                      key={test.id}
                      button
                      selected={selectedTest?.id === test.id}
                      onClick={() => setSelectedTest(test)}
                    >
                      <ListItemIcon>
                        {getStatusIcon(test.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={test.name}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {test.variants.length} variants • {test.duration} days
                            </Typography>
                            <Chip 
                              label={test.status.toUpperCase()}
                              color={getStatusColor(test.status) as any}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Test Details */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {selectedTest.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {selectedTest.status === 'running' && (
                      <Button size="small" startIcon={<PauseIcon />}>
                        Pause
                      </Button>
                    )}
                    {selectedTest.status === 'paused' && (
                      <Button size="small" startIcon={<PlayIcon />}>
                        Resume
                      </Button>
                    )}
                    <Button size="small" startIcon={<StopIcon />} color="error">
                      Stop
                    </Button>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {selectedTest.description}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Hypothesis
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {selectedTest.hypothesis}
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Success Criteria
                    </Typography>
                    <List dense>
                      <ListItem>
                        <Typography variant="body2">
                          Primary Metric: {selectedTest.successCriteria.primaryMetric}
                        </Typography>
                      </ListItem>
                      <ListItem>
                        <Typography variant="body2">
                          Min Improvement: {(selectedTest.successCriteria.minimumImprovement * 100).toFixed(1)}%
                        </Typography>
                      </ListItem>
                      <ListItem>
                        <Typography variant="body2">
                          Significance: {(selectedTest.successCriteria.statisticalSignificance * 100).toFixed(0)}%
                        </Typography>
                      </ListItem>
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Current Status
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Samples: {selectedTest.currentResults.samplesCollected.toLocaleString()} / {selectedTest.successCriteria.minimumSampleSize.toLocaleString()}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(selectedTest.currentResults.samplesCollected / selectedTest.successCriteria.minimumSampleSize) * 100}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    
                    <Typography variant="body2">
                      Statistical Power: {(selectedTest.currentResults.statisticalPower * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2">
                      Confidence: {(selectedTest.currentResults.confidenceLevel * 100).toFixed(1)}%
                    </Typography>
                    
                    {selectedTest.currentResults.currentWinner && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Current Leader:</strong> {selectedTest.variants.find(v => v.id === selectedTest.currentResults.currentWinner)?.name}
                        </Typography>
                      </Alert>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Variants Comparison */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Model Variants Comparison
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Variant</TableCell>
                        <TableCell>Traffic %</TableCell>
                        <TableCell>Accuracy</TableCell>
                        <TableCell>Latency</TableCell>
                        <TableCell>Security Score</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedTest.variants.map((variant) => (
                        <TableRow key={variant.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2">{variant.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {variant.algorithm}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{variant.trafficAllocation}%</TableCell>
                          <TableCell>{variant.metrics.accuracy}%</TableCell>
                          <TableCell>{variant.metrics.latency}ms</TableCell>
                          <TableCell>
                            <Chip
                              label={`${variant.metrics.securityScore}%`}
                              color={variant.metrics.securityScore > 95 ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={variant.status.toUpperCase()}
                              color={getStatusColor(variant.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton size="small">
                              <EditIcon />
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
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics Comparison
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip />
                    <Bar dataKey="accuracy" fill="#2196f3" name="Accuracy %" />
                    <Bar dataKey="securityScore" fill="#4caf50" name="Security Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Performance Indicators
                </Typography>
                <List>
                  {selectedTest.variants.map((variant, index) => (
                    <ListItem key={variant.id}>
                      <ListItemText
                        primary={variant.name}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              Accuracy: {variant.metrics.accuracy}%
                            </Typography>
                            <Typography variant="body2">
                              F1-Score: {variant.metrics.f1Score}%
                            </Typography>
                            <Typography variant="body2">
                              Throughput: {variant.metrics.throughput} req/s
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

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Trend Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip />
                    <Line 
                      type="monotone" 
                      dataKey="baseline" 
                      stroke="#ff7300" 
                      name="Baseline Model"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="challenger" 
                      stroke="#2196f3" 
                      name="Challenger Model"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
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
                  Security Metrics Analysis
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell>Baseline</TableCell>
                        <TableCell>Challenger</TableCell>
                        <TableCell>Difference</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Threat Detection Rate</TableCell>
                        <TableCell>{selectedTest.variants[0].securityMetrics.threatDetectionRate}%</TableCell>
                        <TableCell>{selectedTest.variants[1].securityMetrics.threatDetectionRate}%</TableCell>
                        <TableCell>
                          <Chip
                            label={`+${(selectedTest.variants[1].securityMetrics.threatDetectionRate - selectedTest.variants[0].securityMetrics.threatDetectionRate).toFixed(1)}%`}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Adversarial Robustness</TableCell>
                        <TableCell>{selectedTest.variants[0].securityMetrics.adversarialRobustness}%</TableCell>
                        <TableCell>{selectedTest.variants[1].securityMetrics.adversarialRobustness}%</TableCell>
                        <TableCell>
                          <Chip
                            label={`+${(selectedTest.variants[1].securityMetrics.adversarialRobustness - selectedTest.variants[0].securityMetrics.adversarialRobustness).toFixed(1)}%`}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Bias Score</TableCell>
                        <TableCell>{selectedTest.variants[0].securityMetrics.biasScore}%</TableCell>
                        <TableCell>{selectedTest.variants[1].securityMetrics.biasScore}%</TableCell>
                        <TableCell>
                          <Chip
                            label={`${(selectedTest.variants[1].securityMetrics.biasScore - selectedTest.variants[0].securityMetrics.biasScore).toFixed(1)}%`}
                            color="warning"
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Compliance Score</TableCell>
                        <TableCell>{selectedTest.variants[0].securityMetrics.complianceScore}%</TableCell>
                        <TableCell>{selectedTest.variants[1].securityMetrics.complianceScore}%</TableCell>
                        <TableCell>
                          <Chip
                            label={`+${(selectedTest.variants[1].securityMetrics.complianceScore - selectedTest.variants[0].securityMetrics.complianceScore).toFixed(1)}%`}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Security Analysis Summary
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Threat Coverage"
                      secondary={`${selectedTest.securityAnalysis.threatCoverage}% - Comprehensive coverage across attack vectors`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Vulnerability Exposure"
                      secondary={`${selectedTest.securityAnalysis.vulnerabilityExposure}% - Low risk exposure maintained`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Compliance Risk"
                      secondary={`${selectedTest.securityAnalysis.complianceRisk.toUpperCase()} - Regulatory requirements met`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AnalyticsIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Bias Assessment"
                      secondary={`${selectedTest.securityAnalysis.biasAssessment.toUpperCase()} - Algorithmic fairness maintained`}
                    />
                  </ListItem>
                </List>
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
                  Statistical Significance Analysis
                </Typography>
                <Alert 
                  severity={selectedTest.currentResults.significanceReached ? 'success' : 'info'}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="body2">
                    <strong>Statistical Significance:</strong>{' '}
                    {selectedTest.currentResults.significanceReached 
                      ? 'ACHIEVED - Results are statistically significant'
                      : 'IN PROGRESS - Continue collecting samples'
                    }
                  </Typography>
                </Alert>

                <Typography variant="body1" gutterBottom>
                  Current Results:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Samples Collected"
                      secondary={`${selectedTest.currentResults.samplesCollected.toLocaleString()} / ${selectedTest.successCriteria.minimumSampleSize.toLocaleString()}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Statistical Power"
                      secondary={`${(selectedTest.currentResults.statisticalPower * 100).toFixed(1)}%`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Confidence Level"
                      secondary={`${(selectedTest.currentResults.confidenceLevel * 100).toFixed(1)}%`}
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
                  Test Recommendations
                </Typography>
                {selectedTest.currentResults.significanceReached ? (
                  <Alert severity="success">
                    <Typography variant="body2">
                      ✅ Test has reached statistical significance. 
                      Recommend deploying the challenger model to production.
                    </Typography>
                  </Alert>
                ) : (
                  <Alert severity="info">
                    <Typography variant="body2">
                      ⏳ Test is still collecting samples. 
                      Estimated completion: {Math.ceil((selectedTest.successCriteria.minimumSampleSize - selectedTest.currentResults.samplesCollected) / 500)} days
                    </Typography>
                  </Alert>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Next Steps:
                </Typography>
                <List dense>
                  <ListItem>
                    <Typography variant="body2">
                      • Continue monitoring security metrics
                    </Typography>
                  </ListItem>
                  <ListItem>
                    <Typography variant="body2">
                      • Validate compliance requirements
                    </Typography>
                  </ListItem>
                  <ListItem>
                    <Typography variant="body2">
                      • Prepare deployment plan for winner
                    </Typography>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Create Test Dialog */}
      <Dialog open={showTestDialog} onClose={() => setShowTestDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New A/B Test</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Test Name"
                value={newTest.name || ''}
                onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newTest.description || ''}
                onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Test Type</InputLabel>
                <Select
                  value={newTest.testType || 'accuracy'}
                  onChange={(e) => setNewTest({ ...newTest, testType: e.target.value as any })}
                >
                  <MenuItem value="accuracy">Accuracy Test</MenuItem>
                  <MenuItem value="security">Security Test</MenuItem>
                  <MenuItem value="performance">Performance Test</MenuItem>
                  <MenuItem value="comprehensive">Comprehensive Test</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Duration (days)"
                value={newTest.duration || 14}
                onChange={(e) => setNewTest({ ...newTest, duration: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Test Hypothesis"
                value={newTest.hypothesis || ''}
                onChange={(e) => setNewTest({ ...newTest, hypothesis: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTestDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setShowTestDialog(false)}>
            Create Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MultiModelABTesting;