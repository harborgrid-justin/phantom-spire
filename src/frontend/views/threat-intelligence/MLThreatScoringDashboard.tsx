/**
 * Machine Learning-driven Threat Scoring Dashboard
 * AI-powered threat assessment competing with enterprise-grade threat intelligence platforms
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Tooltip,
  useTheme,
  alpha,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';

import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';

import {
  Psychology,
  AutoAwesome,
  TrendingUp,
  TrendingDown,
  Analytics,
  Assessment,
  Memory,
  Speed,
  Visibility,
  VisibilityOff,
  FilterList,
  Download,
  Share,
  Settings,
  Refresh,
  PlayArrow,
  Pause,
  Stop,
  Tune,
  ModelTraining,
  Science,
  BugReport,
  Security,
  Warning,
  Error,
  CheckCircle,
  Info,
  Timeline as TimelineIcon,
  BarChart,
  PieChart,
  ShowChart,
  DonutLarge,
  Radar,
  ScatterPlot,
  BubbleChart,
  DataUsage,
  Storage,
  CloudDownload,
  Computer,
  NetworkCheck,
  DeviceHub,
  Transform,
  Functions,
  Code,
  AutoGraph,
  SmartToy,
  Insights,
  Calculate,
  Schema,
  AccountTree,
  Hub,
  GroupWork,
  CompareArrows,
  Search,
  ExpandMore,
  Edit,
  Delete,
  Add,
  Remove,
  Star,
  StarBorder,
  Bookmark,
  BookmarkBorder,
  Flag,
  LocationOn,
  Schedule,
  Person,
  Business
} from '@mui/icons-material';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  ReferenceLine
} from 'recharts';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';

// Enhanced interfaces for ML threat scoring
interface ThreatScore {
  id: string;
  entityId: string;
  entityType: 'ioc' | 'actor' | 'campaign' | 'malware' | 'technique';
  entityValue: string;
  score: number;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskLevel: number;
  prediction: {
    likelihood: number;
    timeframe: string;
    impactScore: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  };
  features: {
    behavioral: number;
    temporal: number;
    contextual: number;
    reputation: number;
    frequency: number;
    anomaly: number;
    pattern: number;
    network: number;
  };
  modelMetadata: {
    modelName: string;
    modelVersion: string;
    algorithm: string;
    accuracy: number;
    lastTrained: Date;
    dataPoints: number;
  };
  explanations: {
    topFeatures: {
      name: string;
      impact: number;
      description: string;
    }[];
    riskFactors: string[];
    mitigatingFactors: string[];
    similarEntities: string[];
  };
  historicalTrend: {
    date: Date;
    score: number;
    confidence: number;
  }[];
  timestamp: Date;
  analystFeedback?: {
    rating: 'accurate' | 'mostly_accurate' | 'somewhat_accurate' | 'inaccurate';
    comments: string;
    analystId: string;
    timestamp: Date;
  };
}

interface MLModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'anomaly_detection' | 'recommendation';
  algorithm: string;
  version: string;
  status: 'training' | 'ready' | 'error' | 'deprecated';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: Date;
  trainingData: {
    samples: number;
    features: number;
    positiveExamples: number;
    negativeExamples: number;
  };
  hyperparameters: Record<string, any>;
  performance: {
    trainingTime: number;
    inferenceTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  deployment: {
    environment: 'development' | 'staging' | 'production';
    scalingFactor: number;
    maxConcurrentRequests: number;
  };
  description: string;
  features: string[];
  outputs: string[];
}

interface MLPipeline {
  id: string;
  name: string;
  description: string;
  stages: {
    name: string;
    type: 'preprocessing' | 'feature_extraction' | 'model_inference' | 'postprocessing';
    status: 'pending' | 'running' | 'completed' | 'error';
    duration?: number;
    error?: string;
  }[];
  inputData: {
    type: string;
    count: number;
    source: string;
  };
  outputData: {
    scores: number;
    predictions: number;
    confidence: number;
  };
  performance: {
    totalTime: number;
    throughput: number;
    accuracy: number;
  };
  isRunning: boolean;
  lastRun: Date;
  nextScheduledRun?: Date;
}

const MLThreatScoringDashboard: React.FC = () => {
  const theme = useTheme();
  
  // Core data states
  const [threatScores, setThreatScores] = useState<ThreatScore[]>([]);
  const [mlModels, setMLModels] = useState<MLModel[]>([]);
  const [mlPipelines, setMLPipelines] = useState<MLPipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [selectedScore, setSelectedScore] = useState<ThreatScore | null>(null);
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [modelDetailsOpen, setModelDetailsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Filter states
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [scoreThreshold, setScoreThreshold] = useState([0, 100]);
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d' | '90d'>('24h');
  
  // Real-time states
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('ml-threat-scoring-dashboard', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 180000
    });

    return () => evaluationController.remove();
  }, []);

  // Generate mock ML models
  const generateMockModels = useCallback((): MLModel[] => {
    const algorithms = ['Random Forest', 'XGBoost', 'Neural Network', 'SVM', 'Logistic Regression'];
    const types = ['classification', 'regression', 'anomaly_detection'] as const;
    
    return [
      {
        id: 'model-ioc-classifier',
        name: 'IOC Risk Classifier',
        type: 'classification',
        algorithm: 'Random Forest',
        version: '2.1.3',
        status: 'ready',
        accuracy: 94.5,
        precision: 92.1,
        recall: 96.8,
        f1Score: 94.4,
        lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        trainingData: {
          samples: 125000,
          features: 47,
          positiveExamples: 62500,
          negativeExamples: 62500
        },
        hyperparameters: {
          n_estimators: 100,
          max_depth: 15,
          min_samples_split: 2,
          min_samples_leaf: 1
        },
        performance: {
          trainingTime: 245,
          inferenceTime: 12,
          memoryUsage: 512,
          cpuUsage: 85
        },
        deployment: {
          environment: 'production',
          scalingFactor: 3,
          maxConcurrentRequests: 1000
        },
        description: 'Advanced IOC risk classification using behavioral and contextual features',
        features: ['Reputation Score', 'Frequency', 'Geolocation', 'Network Context', 'Temporal Patterns'],
        outputs: ['Risk Score', 'Severity Level', 'Confidence Score']
      },
      {
        id: 'model-anomaly-detector',
        name: 'Behavioral Anomaly Detector',
        type: 'anomaly_detection',
        algorithm: 'Isolation Forest',
        version: '1.8.2',
        status: 'ready',
        accuracy: 91.2,
        precision: 88.7,
        recall: 93.5,
        f1Score: 91.0,
        lastTrained: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        trainingData: {
          samples: 85000,
          features: 32,
          positiveExamples: 8500,
          negativeExamples: 76500
        },
        hyperparameters: {
          n_estimators: 150,
          contamination: 0.1,
          max_samples: 256
        },
        performance: {
          trainingTime: 180,
          inferenceTime: 8,
          memoryUsage: 256,
          cpuUsage: 65
        },
        deployment: {
          environment: 'production',
          scalingFactor: 2,
          maxConcurrentRequests: 500
        },
        description: 'Detects anomalous behavior patterns in threat data',
        features: ['Behavior Vectors', 'Temporal Signatures', 'Network Patterns'],
        outputs: ['Anomaly Score', 'Outlier Flag', 'Pattern Classification']
      },
      {
        id: 'model-actor-attribution',
        name: 'Threat Actor Attribution Engine',
        type: 'classification',
        algorithm: 'Deep Neural Network',
        version: '3.2.1',
        status: 'training',
        accuracy: 87.3,
        precision: 89.1,
        recall: 85.6,
        f1Score: 87.3,
        lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        trainingData: {
          samples: 200000,
          features: 128,
          positiveExamples: 50000,
          negativeExamples: 150000
        },
        hyperparameters: {
          layers: [128, 64, 32, 16],
          activation: 'relu',
          optimizer: 'adam',
          learning_rate: 0.001
        },
        performance: {
          trainingTime: 3600,
          inferenceTime: 15,
          memoryUsage: 1024,
          cpuUsage: 95
        },
        deployment: {
          environment: 'staging',
          scalingFactor: 1,
          maxConcurrentRequests: 100
        },
        description: 'Advanced attribution engine using behavioral fingerprinting',
        features: ['TTPs', 'Infrastructure Patterns', 'Linguistic Analysis', 'Temporal Behaviors'],
        outputs: ['Actor Likelihood', 'Attribution Confidence', 'Alternative Candidates']
      }
    ];
  }, []);

  // Generate mock threat scores
  const generateMockScores = useCallback((): ThreatScore[] => {
    const entityTypes = ['ioc', 'actor', 'campaign', 'malware', 'technique'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    const urgencies = ['low', 'medium', 'high', 'critical'] as const;
    const models = generateMockModels();
    
    const scores: ThreatScore[] = [];
    
    for (let i = 0; i < 150; i++) {
      const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const score = Math.floor(Math.random() * 100);
      const confidence = Math.floor(Math.random() * 50) + 50;
      const model = models[Math.floor(Math.random() * models.length)];
      
      // Generate historical trend
      const historicalTrend = [];
      for (let j = 30; j >= 0; j--) {
        historicalTrend.push({
          date: new Date(Date.now() - j * 24 * 60 * 60 * 1000),
          score: Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 20)),
          confidence: Math.max(50, Math.min(100, confidence + (Math.random() - 0.5) * 10))
        });
      }
      
      scores.push({
        id: `score-${i}`,
        entityId: `entity-${i}`,
        entityType,
        entityValue: entityType === 'ioc' ? `192.168.1.${i}` : 
                    entityType === 'actor' ? `APT-${i}` :
                    entityType === 'campaign' ? `Campaign-${i}` :
                    entityType === 'malware' ? `Malware-${i}` :
                    `T${1000 + i}`,
        score,
        confidence,
        severity,
        riskLevel: Math.floor(score * (confidence / 100)),
        prediction: {
          likelihood: Math.floor(Math.random() * 100),
          timeframe: ['1-7 days', '1-2 weeks', '2-4 weeks', '1-3 months'][Math.floor(Math.random() * 4)],
          impactScore: Math.floor(Math.random() * 100),
          urgency: urgencies[Math.floor(Math.random() * urgencies.length)]
        },
        features: {
          behavioral: Math.floor(Math.random() * 100),
          temporal: Math.floor(Math.random() * 100),
          contextual: Math.floor(Math.random() * 100),
          reputation: Math.floor(Math.random() * 100),
          frequency: Math.floor(Math.random() * 100),
          anomaly: Math.floor(Math.random() * 100),
          pattern: Math.floor(Math.random() * 100),
          network: Math.floor(Math.random() * 100)
        },
        modelMetadata: {
          modelName: model.name,
          modelVersion: model.version,
          algorithm: model.algorithm,
          accuracy: model.accuracy,
          lastTrained: model.lastTrained,
          dataPoints: model.trainingData.samples
        },
        explanations: {
          topFeatures: [
            { name: 'Reputation Score', impact: 0.85, description: 'Historical reputation data' },
            { name: 'Behavioral Pattern', impact: 0.72, description: 'Observed behavior patterns' },
            { name: 'Network Context', impact: 0.68, description: 'Network infrastructure analysis' }
          ],
          riskFactors: ['High frequency appearance', 'Associated with known campaigns', 'Geographic anomaly'],
          mitigatingFactors: ['Low confidence indicators', 'Limited historical data'],
          similarEntities: [`Similar-${i}-1`, `Similar-${i}-2`, `Similar-${i}-3`]
        },
        historicalTrend,
        timestamp: new Date(),
        analystFeedback: Math.random() > 0.7 ? {
          rating: ['accurate', 'mostly_accurate', 'somewhat_accurate', 'inaccurate'][Math.floor(Math.random() * 4)] as any,
          comments: 'Analysis appears consistent with our observations',
          analystId: 'analyst@company.com',
          timestamp: new Date()
        } : undefined
      });
    }
    
    return scores.sort((a, b) => b.score - a.score);
  }, [generateMockModels]);

  // Generate mock ML pipelines
  const generateMockPipelines = useCallback((): MLPipeline[] => {
    return [
      {
        id: 'pipeline-real-time',
        name: 'Real-time Threat Scoring Pipeline',
        description: 'Continuous threat scoring for incoming IOCs and events',
        stages: [
          { name: 'Data Ingestion', type: 'preprocessing', status: 'completed', duration: 1.2 },
          { name: 'Feature Extraction', type: 'feature_extraction', status: 'completed', duration: 3.4 },
          { name: 'Model Inference', type: 'model_inference', status: 'running' },
          { name: 'Score Normalization', type: 'postprocessing', status: 'pending' }
        ],
        inputData: {
          type: 'IOCs',
          count: 1247,
          source: 'Real-time feeds'
        },
        outputData: {
          scores: 1247,
          predictions: 1247,
          confidence: 89.3
        },
        performance: {
          totalTime: 45.2,
          throughput: 27.6,
          accuracy: 94.1
        },
        isRunning: true,
        lastRun: new Date(Date.now() - 5 * 60 * 1000),
        nextScheduledRun: new Date(Date.now() + 25 * 60 * 1000)
      },
      {
        id: 'pipeline-batch',
        name: 'Batch Analysis Pipeline',
        description: 'Daily batch analysis of accumulated threat data',
        stages: [
          { name: 'Data Collection', type: 'preprocessing', status: 'completed', duration: 15.6 },
          { name: 'Feature Engineering', type: 'feature_extraction', status: 'completed', duration: 28.3 },
          { name: 'Ensemble Scoring', type: 'model_inference', status: 'completed', duration: 42.1 },
          { name: 'Report Generation', type: 'postprocessing', status: 'completed', duration: 8.7 }
        ],
        inputData: {
          type: 'Mixed Entities',
          count: 15670,
          source: 'Data warehouse'
        },
        outputData: {
          scores: 15670,
          predictions: 15670,
          confidence: 92.7
        },
        performance: {
          totalTime: 94.7,
          throughput: 165.4,
          accuracy: 96.2
        },
        isRunning: false,
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
        nextScheduledRun: new Date(Date.now() + 22 * 60 * 60 * 1000)
      }
    ];
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setThreatScores(generateMockScores());
        setMLModels(generateMockModels());
        setMLPipelines(generateMockPipelines());
        
      } catch (err) {
        setError('Failed to load ML threat scoring data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockScores, generateMockModels, generateMockPipelines]);

  // Filter threat scores
  const filteredScores = useMemo(() => {
    return threatScores.filter(score => {
      if (entityTypeFilter !== 'all' && score.entityType !== entityTypeFilter) {
        return false;
      }
      if (severityFilter !== 'all' && score.severity !== severityFilter) {
        return false;
      }
      if (score.score < scoreThreshold[0] || score.score > scoreThreshold[1]) {
        return false;
      }
      if (score.confidence < confidenceThreshold) {
        return false;
      }
      return true;
    });
  }, [threatScores, entityTypeFilter, severityFilter, scoreThreshold, confidenceThreshold]);

  // Calculate dashboard statistics
  const dashboardStats = useMemo(() => {
    const totalScores = filteredScores.length;
    const avgScore = totalScores > 0 ? 
      Math.round(filteredScores.reduce((sum, s) => sum + s.score, 0) / totalScores) : 0;
    const avgConfidence = totalScores > 0 ?
      Math.round(filteredScores.reduce((sum, s) => sum + s.confidence, 0) / totalScores) : 0;
    const highRiskCount = filteredScores.filter(s => s.severity === 'critical' || s.severity === 'high').length;
    const activeModels = mlModels.filter(m => m.status === 'ready').length;
    const runningPipelines = mlPipelines.filter(p => p.isRunning).length;
    
    return {
      totalScores,
      avgScore,
      avgConfidence,
      highRiskCount,
      activeModels,
      runningPipelines
    };
  }, [filteredScores, mlModels, mlPipelines]);

  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return theme.palette.error.main;
    if (score >= 60) return theme.palette.warning.main;
    if (score >= 40) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  // Render score trend chart
  const renderScoreTrendChart = () => {
    const trendData = filteredScores.slice(0, 10).map(score => ({
      name: score.entityValue.length > 15 ? score.entityValue.substring(0, 12) + '...' : score.entityValue,
      score: score.score,
      confidence: score.confidence,
      risk: score.riskLevel
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey="score" fill={theme.palette.primary.main} name="Threat Score" />
          <Line type="monotone" dataKey="confidence" stroke={theme.palette.secondary.main} name="Confidence" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  // Render feature importance chart
  const renderFeatureImportanceChart = () => {
    if (!selectedScore) return null;
    
    const features = Object.entries(selectedScore.features).map(([name, value]) => ({
      name: name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value,
      importance: value / 100
    }));

    return (
      <ResponsiveContainer width="100%" height={250}>
        <RechartsBarChart data={features} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="name" type="category" width={100} />
          <RechartsTooltip />
          <Bar dataKey="value" fill={theme.palette.info.main} />
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  };

  // Render historical trend chart
  const renderHistoricalTrendChart = () => {
    if (!selectedScore) return null;
    
    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={selectedScore.historicalTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <YAxis domain={[0, 100]} />
          <RechartsTooltip 
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke={theme.palette.primary.main} 
            strokeWidth={2}
            name="Threat Score"
          />
          <Line 
            type="monotone" 
            dataKey="confidence" 
            stroke={theme.palette.secondary.main} 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Confidence"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Render main dashboard
  const renderDashboard = () => (
    <Grid container spacing={3}>
      {/* Stats Cards */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <Psychology />
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {dashboardStats.totalScores.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Scores
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {dashboardStats.avgScore}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg Score
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                    <Assessment />
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {dashboardStats.avgConfidence}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Avg Confidence
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                    <Error />
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {dashboardStats.highRiskCount}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      High Risk
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                    <ModelTraining />
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {dashboardStats.activeModels}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Models
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                    <PlayArrow />
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {dashboardStats.runningPipelines}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Running
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Trend Chart */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Threat Scores Trend
            </Typography>
            {renderScoreTrendChart()}
          </CardContent>
        </Card>
      </Grid>

      {/* Score Distribution */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Score Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  dataKey="value"
                  data={[
                    { name: 'Critical (80-100)', value: filteredScores.filter(s => s.score >= 80).length, fill: theme.palette.error.main },
                    { name: 'High (60-79)', value: filteredScores.filter(s => s.score >= 60 && s.score < 80).length, fill: theme.palette.warning.main },
                    { name: 'Medium (40-59)', value: filteredScores.filter(s => s.score >= 40 && s.score < 60).length, fill: theme.palette.info.main },
                    { name: 'Low (0-39)', value: filteredScores.filter(s => s.score < 40).length, fill: theme.palette.success.main }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({name, value}) => `${name}: ${value}`}
                >
                  {[
                    { fill: theme.palette.error.main },
                    { fill: theme.palette.warning.main },
                    { fill: theme.palette.info.main },
                    { fill: theme.palette.success.main }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Threat Scores Table */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Threat Scores
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Entity</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Risk Level</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredScores.slice(0, 10).map((score) => (
                    <TableRow
                      key={score.id}
                      hover
                      onClick={() => {
                        setSelectedScore(score);
                        setDetailsOpen(true);
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {score.entityValue}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ID: {score.entityId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={score.entityType.toUpperCase()}
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{ color: getScoreColor(score.score) }}
                          >
                            {score.score}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={score.score}
                            sx={{
                              width: 60,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: getScoreColor(score.score)
                              }
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {score.confidence}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={score.severity.toUpperCase()}
                          color={
                            score.severity === 'critical' ? 'error' :
                            score.severity === 'high' ? 'warning' :
                            score.severity === 'medium' ? 'info' : 'success'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {score.modelMetadata.modelName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          v{score.modelMetadata.modelVersion}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedScore(score);
                              setDetailsOpen(true);
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Export individual score
                            }}
                          >
                            <Download fontSize="small" />
                          </IconButton>
                        </Box>
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
  );

  // Render models tab
  const renderModelsTab = () => (
    <Grid container spacing={3}>
      {mlModels.map((model) => (
        <Grid item xs={12} md={6} lg={4} key={model.id}>
          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
              }
            }}
            onClick={() => {
              setSelectedModel(model);
              setModelDetailsOpen(true);
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {model.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {model.algorithm} • v{model.version}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={model.status}
                  color={
                    model.status === 'ready' ? 'success' :
                    model.status === 'training' ? 'warning' :
                    model.status === 'error' ? 'error' : 'default'
                  }
                />
              </Box>

              <Typography variant="body2" sx={{ mb: 2 }}>
                {model.description}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Accuracy
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {model.accuracy.toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      F1 Score
                    </Typography>
                    <Typography variant="h6" color="info.main">
                      {model.f1Score.toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Training Samples
                    </Typography>
                    <Typography variant="body2">
                      {model.trainingData.samples.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Features
                    </Typography>
                    <Typography variant="body2">
                      {model.trainingData.features}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {model.features.slice(0, 3).map((feature) => (
                  <Chip
                    key={feature}
                    size="small"
                    label={feature}
                    variant="outlined"
                  />
                ))}
                {model.features.length > 3 && (
                  <Chip
                    size="small"
                    label={`+${model.features.length - 3} more`}
                    variant="outlined"
                  />
                )}
              </Box>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="textSecondary">
                  Last trained: {model.lastTrained.toLocaleDateString()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small">
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <Download fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render pipelines tab
  const renderPipelinesTab = () => (
    <Grid container spacing={3}>
      {mlPipelines.map((pipeline) => (
        <Grid item xs={12} lg={6} key={pipeline.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {pipeline.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {pipeline.description}
                  </Typography>
                </Box>
                <Badge
                  badgeContent={pipeline.isRunning ? 'Running' : 'Idle'}
                  color={pipeline.isRunning ? 'success' : 'default'}
                  variant="dot"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Pipeline Stages
                </Typography>
                <Stepper orientation="vertical">
                  {pipeline.stages.map((stage, index) => (
                    <Step key={stage.name} active={stage.status === 'running'} completed={stage.status === 'completed'}>
                      <StepLabel
                        optional={
                          stage.duration && (
                            <Typography variant="caption">
                              {stage.duration}s
                            </Typography>
                          )
                        }
                        error={stage.status === 'error'}
                      >
                        {stage.name}
                      </StepLabel>
                      <StepContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {stage.status === 'running' && <CircularProgress size={16} />}
                          <Typography variant="body2" color="textSecondary">
                            {stage.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Typography>
                        </Box>
                        {stage.error && (
                          <Alert severity="error" sx={{ mt: 1 }}>
                            {stage.error}
                          </Alert>
                        )}
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Input Data
                    </Typography>
                    <Typography variant="body2">
                      {pipeline.inputData.count.toLocaleString()} {pipeline.inputData.type}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Throughput
                    </Typography>
                    <Typography variant="body2">
                      {pipeline.performance.throughput}/min
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Accuracy
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      {pipeline.performance.accuracy.toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="textSecondary">
                  Last run: {pipeline.lastRun.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    color={pipeline.isRunning ? 'error' : 'success'}
                    onClick={() => {
                      // Toggle pipeline
                      setMLPipelines(prev => prev.map(p =>
                        p.id === pipeline.id ? { ...p, isRunning: !p.isRunning } : p
                      ));
                    }}
                  >
                    {pipeline.isRunning ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                  </IconButton>
                  <IconButton size="small">
                    <Settings fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          ML Threat Scoring Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Machine learning-driven threat assessment and prediction engine
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search entities..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Entity Type</InputLabel>
              <Select
                value={entityTypeFilter}
                onChange={(e) => setEntityTypeFilter(e.target.value)}
                label="Entity Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="ioc">IOCs</MenuItem>
                <MenuItem value="actor">Actors</MenuItem>
                <MenuItem value="campaign">Campaigns</MenuItem>
                <MenuItem value="malware">Malware</MenuItem>
                <MenuItem value="technique">Techniques</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                label="Severity"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                label="Time Range"
              >
                <MenuItem value="1h">Last Hour</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={realTimeEnabled}
                    onChange={(e) => setRealTimeEnabled(e.target.checked)}
                  />
                }
                label="Real-time"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                }
                label="Auto-refresh"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Dashboard" icon={<Analytics />} />
          <Tab label="Models" icon={<ModelTraining />} />
          <Tab label="Pipelines" icon={<Hub />} />
          <Tab label="Analysis" icon={<Science />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            {activeTab === 0 && renderDashboard()}
            {activeTab === 1 && renderModelsTab()}
            {activeTab === 2 && renderPipelinesTab()}
            {activeTab === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Feature Importance Analysis
                      </Typography>
                      {selectedScore ? renderFeatureImportanceChart() : (
                        <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body2" color="textSecondary">
                            Select a threat score to view feature analysis
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Historical Trend
                      </Typography>
                      {selectedScore ? renderHistoricalTrendChart() : (
                        <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body2" color="textSecondary">
                            Select a threat score to view trend
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </Box>

      {/* Score Details Dialog */}
      {selectedScore && (
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: getScoreColor(selectedScore.score),
                  width: 40,
                  height: 40
                }}
              >
                <Psychology />
              </Avatar>
              <Box>
                <Typography variant="h5">
                  Threat Score Analysis
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedScore.entityValue} ({selectedScore.entityType.toUpperCase()})
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Score Breakdown
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography
                        variant="h3"
                        sx={{ color: getScoreColor(selectedScore.score) }}
                      >
                        {selectedScore.score}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          Threat Score
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={selectedScore.score}
                          sx={{
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getScoreColor(selectedScore.score)
                            }
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Confidence:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {selectedScore.confidence}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Risk Level:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {selectedScore.riskLevel}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Severity:</Typography>
                        <Chip
                          size="small"
                          label={selectedScore.severity.toUpperCase()}
                          color={
                            selectedScore.severity === 'critical' ? 'error' :
                            selectedScore.severity === 'high' ? 'warning' :
                            selectedScore.severity === 'medium' ? 'info' : 'success'
                          }
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Model Explanation
                    </Typography>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Top Contributing Features
                    </Typography>
                    <List dense>
                      {selectedScore.explanations.topFeatures.map((feature, index) => (
                        <ListItem key={feature.name}>
                          <ListItemIcon>
                            <Badge badgeContent={index + 1} color="primary">
                              <Assessment />
                            </Badge>
                          </ListItemIcon>
                          <ListItemText
                            primary={feature.name}
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  {feature.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                  <Typography variant="caption">
                                    Impact: {(feature.impact * 100).toFixed(1)}%
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={feature.impact * 100}
                                    sx={{ width: 100 }}
                                  />
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Risk Factors
                        </Typography>
                        <List dense>
                          {selectedScore.explanations.riskFactors.map((factor, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <Warning color="warning" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={factor} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Mitigating Factors
                        </Typography>
                        <List dense>
                          {selectedScore.explanations.mitigatingFactors.map((factor, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <CheckCircle color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={factor} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
            <Button variant="contained">
              Generate Report
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="ML Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<ModelTraining />}
          tooltipTitle="Train Models"
          onClick={() => {/* Train models */}}
        />
        <SpeedDialAction
          icon={<Analytics />}
          tooltipTitle="Run Analysis"
          onClick={() => {/* Run analysis */}}
        />
        <SpeedDialAction
          icon={<Download />}
          tooltipTitle="Export Results"
          onClick={() => {/* Export */}}
        />
        <SpeedDialAction
          icon={<Settings />}
          tooltipTitle="Settings"
          onClick={() => setSettingsOpen(true)}
        />
      </SpeedDial>
    </Box>
  );
};

export default MLThreatScoringDashboard;
