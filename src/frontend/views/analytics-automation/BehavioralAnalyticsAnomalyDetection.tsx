/**
 * Behavioral Analytics and Anomaly Detection Interface
 * Advanced behavioral analysis and machine learning-powered anomaly detection
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  AppBar,
  Toolbar,
  Drawer,
  ButtonGroup,
  RadioGroup,
  Radio,
  FormLabel,
  Checkbox,
  FormGroup,
  Autocomplete
} from '@mui/material';

import {
  Psychology,
  AutoAwesome,
  TrendingUp,
  TrendingDown,
  Analytics,
  Assessment,
  Timeline as TimelineIcon,
  Visibility,
  VisibilityOff,
  BugReport,
  Security,
  Warning,
  Error,
  CheckCircle,
  Info,
  FilterList,
  Download,
  Share,
  Settings,
  Refresh,
  PlayArrow,
  Pause,
  Stop,
  Search,
  Edit,
  Delete,
  Add,
  Remove,
  Save,
  SaveAs,
  FolderOpen,
  Schedule,
  Flag,
  LocationOn,
  Person,
  Business,
  Computer,
  NetworkCheck,
  Storage,
  Memory,
  Speed,
  DataUsage,
  CloudDownload,
  Shield,
  AccountTree,
  Hub,
  DeviceHub,
  Transform,
  Functions,
  AutoGraph,
  Insights,
  Calculate,
  Schema,
  GroupWork,
  CompareArrows,
  ExpandMore,
  ExpandLess,
  ChevronRight,
  MoreVert,
  Launch,
  OpenInNew,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  Layers,
  ViewModule,
  FormatListBulleted,
  GridOn,
  Scatter,
  BubbleChart,
  ShowChart,
  DonutLarge,
  Radar,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Code,
  Extension,
  Api,
  Sync,
  Cloud,
  Notifications,
  Email,
  Sms,
  ModelTraining,
  Science,
  SmartToy,
  FlashOn,
  FlashOff,
  Lightbulb,
  Explore,
  FindInPage,
  FindReplace,
  Bookmark,
  BookmarkBorder,
  Star,
  StarBorder
} from '@mui/icons-material';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
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
  ReferenceLine,
  Brush,
  FunnelChart,
  Funnel,
  Treemap,
  Sankey
} from 'recharts';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/core/UIUXEvaluationService';

// Behavioral analytics interfaces
interface BehaviorProfile {
  id: string;
  entityId: string;
  entityType: 'user' | 'host' | 'network' | 'application' | 'service';
  entityName: string;
  baseline: {
    established: Date;
    dataPoints: number;
    confidence: number;
    features: Record<string, {
      mean: number;
      stdDev: number;
      min: number;
      max: number;
      distribution: 'normal' | 'skewed' | 'multimodal' | 'uniform';
    }>;
    patterns: {
      temporal: string[];
      volumetric: string[];
      sequential: string[];
      contextual: string[];
    };
  };
  currentBehavior: {
    timestamp: Date;
    features: Record<string, number>;
    patterns: string[];
    riskScore: number;
    confidence: number;
  };
  deviations: {
    id: string;
    feature: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    zscore: number;
    percentileRank: number;
    description: string;
    firstObserved: Date;
    lastObserved: Date;
    frequency: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
  anomalies: Anomaly[];
  riskAssessment: {
    currentRisk: number;
    riskTrend: 'increasing' | 'decreasing' | 'stable';
    riskFactors: string[];
    mitigatingFactors: string[];
    recommendation: string;
  };
  metadata: {
    created: Date;
    lastUpdated: Date;
    updateFrequency: number;
    analystReviewed: boolean;
    tags: string[];
  };
}

interface Anomaly {
  id: string;
  profileId: string;
  entityId: string;
  entityType: string;
  type: 'point' | 'contextual' | 'collective' | 'temporal' | 'spatial';
  subtype: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  confidence: number;
  description: string;
  evidence: {
    feature: string;
    expectedValue: number;
    observedValue: number;
    deviation: number;
    significance: number;
  }[];
  context: {
    timeframe: { start: Date; end: Date };
    relatedEntities: string[];
    environmentalFactors: string[];
    precedingEvents: string[];
    followingEvents: string[];
  };
  detection: {
    algorithm: string;
    model: string;
    version: string;
    threshold: number;
    sensitivity: number;
    detectedAt: Date;
  };
  investigation: {
    status: 'new' | 'investigating' | 'confirmed' | 'false_positive' | 'closed';
    assignedTo?: string;
    findings: string[];
    actions: {
      timestamp: Date;
      action: string;
      performedBy: string;
      notes?: string;
    }[];
    resolution?: {
      type: 'benign' | 'malicious' | 'suspicious' | 'inconclusive';
      confidence: number;
      description: string;
      remediation?: string[];
    };
  };
  correlation: {
    relatedAnomalies: string[];
    campaigns: string[];
    actors: string[];
    techniques: string[];
    iocs: string[];
  };
  impact: {
    scope: 'local' | 'departmental' | 'organizational' | 'external';
    affected: string[];
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
    dataImpact: 'none' | 'minimal' | 'moderate' | 'significant' | 'severe';
  };
}

interface DetectionModel {
  id: string;
  name: string;
  description: string;
  type: 'statistical' | 'machine_learning' | 'rule_based' | 'ensemble' | 'deep_learning';
  algorithm: string;
  version: string;
  status: 'active' | 'training' | 'testing' | 'deprecated' | 'error';
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
    auc: number;
  };
  training: {
    lastTrained: Date;
    trainingDuration: number;
    datasetSize: number;
    features: string[];
    hyperparameters: Record<string, any>;
    validationResults: {
      crossValidation: number;
      holdoutValidation: number;
      temporalValidation: number;
    };
  };
  deployment: {
    environment: 'development' | 'staging' | 'production';
    scalingPolicy: 'auto' | 'manual';
    instances: number;
    cpuLimit: number;
    memoryLimit: number;
  };
  configuration: {
    threshold: number;
    sensitivity: number;
    windowSize: number;
    features: string[];
    preprocessing: string[];
    postprocessing: string[];
  };
  monitoring: {
    drift: {
      detected: boolean;
      score: number;
      threshold: number;
      lastChecked: Date;
    };
    performance: {
      latency: number;
      throughput: number;
      errorRate: number;
      resourceUtilization: number;
    };
  };
}

interface BehaviorAnalytics {
  timestamp: Date;
  profileId: string;
  entityId: string;
  metrics: {
    normalityScore: number;
    riskScore: number;
    confidenceScore: number;
    anomalyScore: number;
    deviationScore: number;
    patternScore: number;
  };
  features: Record<string, number>;
  patterns: {
    detected: string[];
    emerging: string[];
    disappearing: string[];
  };
  comparisons: {
    peerGroup: {
      average: number;
      percentile: number;
      ranking: number;
    };
    historical: {
      compared: 'hour' | 'day' | 'week' | 'month';
      deviation: number;
      trend: 'improving' | 'degrading' | 'stable';
    };
  };
}

const BehavioralAnalyticsAnomalyDetection: React.FC = () => {
  const theme = useTheme();
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Core data states
  const [behaviorProfiles, setBehaviorProfiles] = useState<BehaviorProfile[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [detectionModels, setDetectionModels] = useState<DetectionModel[]>([]);
  const [analyticsData, setAnalyticsData] = useState<BehaviorAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<BehaviorProfile | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [selectedModel, setSelectedModel] = useState<DetectionModel | null>(null);
  const [profileDetailsOpen, setProfileDetailsOpen] = useState(false);
  const [anomalyDetailsOpen, setAnomalyDetailsOpen] = useState(false);
  const [modelDetailsOpen, setModelDetailsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [investigationOpen, setInvestigationOpen] = useState(false);
  
  // Analysis states
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(true);
  const [anomalyDetection, setAnomalyDetection] = useState(true);
  const [behaviorProfiling, setBehaviorProfiling] = useState(true);
  const [patternLearning, setPatternLearning] = useState(true);
  const [alertingEnabled, setAlertingEnabled] = useState(true);
  
  // Visualization states
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [viewMode, setViewMode] = useState<'timeline' | 'distribution' | 'correlation' | 'patterns'>('timeline');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'scatter' | 'heatmap'>('line');
  const [aggregation, setAggregation] = useState<'none' | 'hourly' | 'daily' | 'weekly'>('hourly');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [anomalyThreshold, setAnomalyThreshold] = useState(80);

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('behavioral-analytics-anomaly-detection', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 200000
    });

    return () => evaluationController.remove();
  }, []);

  // Generate mock behavior profiles
  const generateMockProfiles = useCallback((): BehaviorProfile[] => {
    const entityTypes = ['user', 'host', 'network', 'application', 'service'] as const;
    const features = ['loginFrequency', 'dataAccess', 'networkTraffic', 'processExecution', 'fileActivity'];
    
    const profiles: BehaviorProfile[] = [];
    
    for (let i = 0; i < 25; i++) {
      const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
      const riskScore = Math.floor(Math.random() * 100);
      
      // Generate baseline features
      const baselineFeatures: Record<string, any> = {};
      features.forEach(feature => {
        const mean = Math.random() * 100;
        baselineFeatures[feature] = {
          mean,
          stdDev: Math.random() * 20,
          min: Math.max(0, mean - 30),
          max: mean + 30,
          distribution: ['normal', 'skewed', 'multimodal'][Math.floor(Math.random() * 3)]
        };
      });
      
      // Generate current features
      const currentFeatures: Record<string, number> = {};
      features.forEach(feature => {
        const baseline = baselineFeatures[feature];
        currentFeatures[feature] = baseline.mean + (Math.random() - 0.5) * baseline.stdDev * 2;
      });
      
      // Generate deviations
      const deviations = features.slice(0, Math.floor(Math.random() * 3) + 1).map((feature, devIndex) => ({
        id: `deviation-${i}-${devIndex}`,
        feature,
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
        zscore: (Math.random() - 0.5) * 6,
        percentileRank: Math.random() * 100,
        description: `Unusual ${feature} pattern detected`,
        firstObserved: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        lastObserved: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        frequency: Math.floor(Math.random() * 20) + 1,
        trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any
      }));
      
      profiles.push({
        id: `profile-${i}`,
        entityId: `entity-${i}`,
        entityType,
        entityName: entityType === 'user' ? `user${i}@company.com` :
                   entityType === 'host' ? `WORKSTATION-${i.toString().padStart(3, '0')}` :
                   entityType === 'network' ? `subnet-${i}` :
                   entityType === 'application' ? `app-${i}` :
                   `service-${i}`,
        baseline: {
          established: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          dataPoints: Math.floor(Math.random() * 10000) + 1000,
          confidence: Math.floor(Math.random() * 30) + 70,
          features: baselineFeatures,
          patterns: {
            temporal: ['peak_morning', 'low_weekend'],
            volumetric: ['burst_activity', 'steady_state'],
            sequential: ['login_sequence', 'file_access_pattern'],
            contextual: ['department_typical', 'role_appropriate']
          }
        },
        currentBehavior: {
          timestamp: new Date(),
          features: currentFeatures,
          patterns: ['peak_morning', 'burst_activity'],
          riskScore,
          confidence: Math.floor(Math.random() * 30) + 70
        },
        deviations,
        anomalies: [],
        riskAssessment: {
          currentRisk: riskScore,
          riskTrend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
          riskFactors: ['Unusual access patterns', 'Off-hours activity', 'Elevated privileges'],
          mitigatingFactors: ['Known user behavior', 'Business justified', 'Within normal variance'],
          recommendation: riskScore > 70 ? 'Investigate immediately' : 
                         riskScore > 50 ? 'Monitor closely' : 'No action required'
        },
        metadata: {
          created: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
          updateFrequency: Math.floor(Math.random() * 60) + 5,
          analystReviewed: Math.random() > 0.6,
          tags: [entityType, 'behavioral_analysis']
        }
      });
    }
    
    return profiles.sort((a, b) => b.currentBehavior.riskScore - a.currentBehavior.riskScore);
  }, []);

  // Generate mock anomalies
  const generateMockAnomalies = useCallback((): Anomaly[] => {
    const anomalyTypes = ['point', 'contextual', 'collective', 'temporal', 'spatial'] as const;
    const subtypes = ['volume_spike', 'pattern_change', 'outlier_behavior', 'time_anomaly', 'location_anomaly'];
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    const statuses = ['new', 'investigating', 'confirmed', 'false_positive', 'closed'] as const;
    const algorithms = ['Isolation Forest', 'One-Class SVM', 'LSTM Autoencoder', 'Statistical Z-Score', 'Ensemble'];
    
    const anomalies: Anomaly[] = [];
    
    for (let i = 0; i < 40; i++) {
      const type = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const detectedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      anomalies.push({
        id: `anomaly-${i}`,
        profileId: `profile-${Math.floor(Math.random() * 25)}`,
        entityId: `entity-${Math.floor(Math.random() * 25)}`,
        entityType: ['user', 'host', 'network', 'application'][Math.floor(Math.random() * 4)],
        type,
        subtype: subtypes[Math.floor(Math.random() * subtypes.length)],
        severity,
        score: Math.floor(Math.random() * 100),
        confidence: Math.floor(Math.random() * 40) + 60,
        description: `Detected ${type} anomaly in ${subtypes[Math.floor(Math.random() * subtypes.length)].replace('_', ' ')}`,
        evidence: [
          {
            feature: 'loginFrequency',
            expectedValue: 8.5,
            observedValue: 23.2,
            deviation: 2.73,
            significance: 0.95
          },
          {
            feature: 'dataAccess',
            expectedValue: 145.2,
            observedValue: 502.1,
            deviation: 3.46,
            significance: 0.98
          }
        ],
        context: {
          timeframe: {
            start: new Date(detectedAt.getTime() - 3600000),
            end: detectedAt
          },
          relatedEntities: [`entity-${Math.floor(Math.random() * 25)}`, `entity-${Math.floor(Math.random() * 25)}`],
          environmentalFactors: ['Weekend activity', 'System maintenance window'],
          precedingEvents: ['User login', 'VPN connection'],
          followingEvents: ['File access', 'Data download']
        },
        detection: {
          algorithm: algorithms[Math.floor(Math.random() * algorithms.length)],
          model: `model-v${Math.floor(Math.random() * 5) + 1}`,
          version: '2.1.3',
          threshold: Math.random(),
          sensitivity: Math.random(),
          detectedAt
        },
        investigation: {
          status,
          assignedTo: status !== 'new' ? `analyst${Math.floor(Math.random() * 5)}@company.com` : undefined,
          findings: status !== 'new' ? ['Behavioral pattern analysis completed', 'No malicious indicators found'] : [],
          actions: status !== 'new' ? [
            {
              timestamp: new Date(detectedAt.getTime() + 1800000),
              action: 'Investigation initiated',
              performedBy: 'analyst@company.com'
            }
          ] : [],
          resolution: status === 'closed' ? {
            type: ['benign', 'malicious', 'suspicious'][Math.floor(Math.random() * 3)] as any,
            confidence: Math.floor(Math.random() * 30) + 70,
            description: 'Analysis completed with high confidence',
            remediation: ['Monitor user activity', 'Update access controls']
          } : undefined
        },
        correlation: {
          relatedAnomalies: [`anomaly-${Math.max(0, i - 1)}`, `anomaly-${Math.max(0, i - 2)}`],
          campaigns: [`Campaign-${Math.floor(Math.random() * 10)}`],
          actors: [`APT-${Math.floor(Math.random() * 50)}`],
          techniques: ['T1078', 'T1083', 'T1005'],
          iocs: [`IOC-${Math.floor(Math.random() * 100)}`]
        },
        impact: {
          scope: ['local', 'departmental', 'organizational'][Math.floor(Math.random() * 3)] as any,
          affected: [`entity-${Math.floor(Math.random() * 25)}`],
          businessImpact: severity,
          dataImpact: ['none', 'minimal', 'moderate', 'significant'][Math.floor(Math.random() * 4)] as any
        }
      });
    }
    
    return anomalies.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }, []);

  // Generate mock detection models
  const generateMockModels = useCallback((): DetectionModel[] => {
    const modelTypes = ['statistical', 'machine_learning', 'rule_based', 'ensemble', 'deep_learning'] as const;
    const algorithms = ['Isolation Forest', 'One-Class SVM', 'LSTM', 'Statistical Z-Score', 'Random Forest'];
    const statuses = ['active', 'training', 'testing', 'error'] as const;
    
    return modelTypes.map((type, index) => ({
      id: `model-${index}`,
      name: `${type.replace('_', ' ')} Detection Model`,
      description: `Advanced ${type.replace('_', ' ')} model for anomaly detection`,
      type,
      algorithm: algorithms[index] || algorithms[0],
      version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      performance: {
        accuracy: Math.random() * 15 + 85,
        precision: Math.random() * 15 + 80,
        recall: Math.random() * 20 + 75,
        f1Score: Math.random() * 15 + 82,
        falsePositiveRate: Math.random() * 10 + 2,
        falseNegativeRate: Math.random() * 8 + 1,
        auc: Math.random() * 10 + 90
      },
      training: {
        lastTrained: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        trainingDuration: Math.floor(Math.random() * 7200) + 600,
        datasetSize: Math.floor(Math.random() * 1000000) + 100000,
        features: ['loginFrequency', 'dataAccess', 'networkTraffic', 'processExecution'],
        hyperparameters: {
          learningRate: 0.001,
          batchSize: 32,
          epochs: 100,
          regularization: 0.01
        },
        validationResults: {
          crossValidation: Math.random() * 10 + 85,
          holdoutValidation: Math.random() * 10 + 82,
          temporalValidation: Math.random() * 15 + 80
        }
      },
      deployment: {
        environment: ['development', 'staging', 'production'][Math.floor(Math.random() * 3)] as any,
        scalingPolicy: 'auto',
        instances: Math.floor(Math.random() * 5) + 1,
        cpuLimit: Math.floor(Math.random() * 4) + 1,
        memoryLimit: Math.floor(Math.random() * 8) + 2
      },
      configuration: {
        threshold: Math.random() * 0.5 + 0.5,
        sensitivity: Math.random() * 0.8 + 0.2,
        windowSize: Math.floor(Math.random() * 60) + 10,
        features: ['loginFrequency', 'dataAccess', 'networkTraffic'],
        preprocessing: ['normalization', 'outlier_removal'],
        postprocessing: ['confidence_scoring', 'risk_assessment']
      },
      monitoring: {
        drift: {
          detected: Math.random() > 0.8,
          score: Math.random() * 0.5,
          threshold: 0.3,
          lastChecked: new Date(Date.now() - Math.random() * 3600000)
        },
        performance: {
          latency: Math.random() * 100 + 20,
          throughput: Math.floor(Math.random() * 1000) + 100,
          errorRate: Math.random() * 5,
          resourceUtilization: Math.random() * 80 + 10
        }
      }
    }));
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setBehaviorProfiles(generateMockProfiles());
        setAnomalies(generateMockAnomalies());
        setDetectionModels(generateMockModels());
        
        // Generate analytics data
        const analytics: BehaviorAnalytics[] = [];
        for (let i = 0; i < 100; i++) {
          analytics.push({
            timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
            profileId: `profile-${Math.floor(Math.random() * 25)}`,
            entityId: `entity-${Math.floor(Math.random() * 25)}`,
            metrics: {
              normalityScore: Math.random() * 100,
              riskScore: Math.random() * 100,
              confidenceScore: Math.random() * 40 + 60,
              anomalyScore: Math.random() * 100,
              deviationScore: Math.random() * 100,
              patternScore: Math.random() * 100
            },
            features: {
              loginFrequency: Math.random() * 100,
              dataAccess: Math.random() * 100,
              networkTraffic: Math.random() * 100,
              processExecution: Math.random() * 100
            },
            patterns: {
              detected: ['peak_morning', 'burst_activity'],
              emerging: ['new_pattern_1'],
              disappearing: ['old_pattern_1']
            },
            comparisons: {
              peerGroup: {
                average: Math.random() * 100,
                percentile: Math.random() * 100,
                ranking: Math.floor(Math.random() * 100) + 1
              },
              historical: {
                compared: ['hour', 'day', 'week'][Math.floor(Math.random() * 3)] as any,
                deviation: (Math.random() - 0.5) * 50,
                trend: ['improving', 'degrading', 'stable'][Math.floor(Math.random() * 3)] as any
              }
            }
          });
        }
        setAnalyticsData(analytics);
        
      } catch (err) {
        setError('Failed to load behavioral analytics data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockProfiles, generateMockAnomalies, generateMockModels]);

  // Filter data
  const filteredProfiles = useMemo(() => {
    return behaviorProfiles.filter(profile => {
      if (searchTerm && !profile.entityName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !profile.entityType.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (entityTypeFilter !== 'all' && profile.entityType !== entityTypeFilter) {
        return false;
      }
      if (profile.baseline.confidence < confidenceThreshold) {
        return false;
      }
      return true;
    });
  }, [behaviorProfiles, searchTerm, entityTypeFilter, confidenceThreshold]);

  const filteredAnomalies = useMemo(() => {
    return anomalies.filter(anomaly => {
      if (severityFilter !== 'all' && anomaly.severity !== severityFilter) {
        return false;
      }
      if (statusFilter !== 'all' && anomaly.investigation.status !== statusFilter) {
        return false;
      }
      if (anomaly.score < anomalyThreshold) {
        return false;
      }
      return true;
    });
  }, [anomalies, severityFilter, statusFilter, anomalyThreshold]);

  // Calculate dashboard statistics
  const dashboardStats = useMemo(() => {
    const totalProfiles = filteredProfiles.length;
    const totalAnomalies = filteredAnomalies.length;
    const criticalAnomalies = filteredAnomalies.filter(a => a.severity === 'critical').length;
    const newAnomalies = filteredAnomalies.filter(a => a.investigation.status === 'new').length;
    const activeModels = detectionModels.filter(m => m.status === 'active').length;
    const avgRiskScore = totalProfiles > 0 ?
      Math.round(filteredProfiles.reduce((sum, p) => sum + p.currentBehavior.riskScore, 0) / totalProfiles) : 0;
    
    return {
      totalProfiles,
      totalAnomalies,
      criticalAnomalies,
      newAnomalies,
      activeModels,
      avgRiskScore
    };
  }, [filteredProfiles, filteredAnomalies, detectionModels]);

  // Get risk color
  const getRiskColor = (score: number): string => {
    if (score >= 80) return theme.palette.error.main;
    if (score >= 60) return theme.palette.warning.main;
    if (score >= 40) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  // Render behavior profiles
  const renderBehaviorProfiles = () => (
    <Grid container spacing={3}>
      {filteredProfiles.map(profile => (
        <Grid item xs={12} sm={6} lg={4} key={profile.id}>
          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8],
              }
            }}
            onClick={() => {
              setSelectedProfile(profile);
              setProfileDetailsOpen(true);
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: getRiskColor(profile.currentBehavior.riskScore),
                      width: 32,
                      height: 32
                    }}
                  >
                    {profile.entityType === 'user' ? <Person fontSize="small" /> :
                     profile.entityType === 'host' ? <Computer fontSize="small" /> :
                     profile.entityType === 'network' ? <NetworkCheck fontSize="small" /> :
                     <Business fontSize="small" />}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" noWrap>
                      {profile.entityName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {profile.entityType.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  size="small"
                  label={`Risk: ${profile.currentBehavior.riskScore}`}
                  sx={{
                    bgcolor: alpha(getRiskColor(profile.currentBehavior.riskScore), 0.1),
                    color: getRiskColor(profile.currentBehavior.riskScore)
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Baseline Confidence
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    {profile.baseline.confidence}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={profile.baseline.confidence}
                    sx={{ flexGrow: 1 }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`${profile.deviations.length} deviations`}
                  color={profile.deviations.length > 3 ? 'error' : profile.deviations.length > 1 ? 'warning' : 'success'}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`${(profile.baseline.dataPoints / 1000).toFixed(1)}K samples`}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={profile.riskAssessment.riskTrend}
                  color={
                    profile.riskAssessment.riskTrend === 'increasing' ? 'error' :
                    profile.riskAssessment.riskTrend === 'decreasing' ? 'success' : 'info'
                  }
                  variant="outlined"
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="textSecondary">
                  Updated: {profile.metadata.lastUpdated.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    color={profile.metadata.analystReviewed ? 'success' : 'default'}
                  >
                    {profile.metadata.analystReviewed ? <CheckCircle fontSize="small" /> : <Schedule fontSize="small" />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Export profile
                    }}
                  >
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

  // Render anomaly timeline
  const renderAnomalyTimeline = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Anomaly Detection Timeline
        </Typography>
        <Timeline>
          {filteredAnomalies.slice(0, 20).map((anomaly, index) => (
            <TimelineItem key={anomaly.id}>
              <TimelineOppositeContent sx={{ minWidth: 120 }}>
                <Typography variant="caption" color="textSecondary">
                  {anomaly.detectedAt.toLocaleString()}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot
                  sx={{
                    bgcolor: anomaly.severity === 'critical' ? theme.palette.error.main :
                            anomaly.severity === 'high' ? theme.palette.warning.main :
                            anomaly.severity === 'medium' ? theme.palette.info.main :
                            theme.palette.success.main
                  }}
                >
                  {anomaly.severity === 'critical' ? <Error fontSize="small" /> :
                   anomaly.severity === 'high' ? <Warning fontSize="small" /> :
                   <Info fontSize="small" />}
                </TimelineDot>
                {index < filteredAnomalies.slice(0, 20).length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Box
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedAnomaly(anomaly);
                    setAnomalyDetailsOpen(true);
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {anomaly.description}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Entity: {anomaly.entityId} • Type: {anomaly.type}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                    <Chip
                      size="small"
                      label={anomaly.severity}
                      color={
                        anomaly.severity === 'critical' ? 'error' :
                        anomaly.severity === 'high' ? 'warning' :
                        anomaly.severity === 'medium' ? 'info' : 'success'
                      }
                    />
                    <Chip
                      size="small"
                      label={anomaly.investigation.status}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={`Score: ${anomaly.score}`}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );

  // Render analytics dashboard
  const renderAnalyticsDashboard = () => (
    <Grid container spacing={3}>
      {/* Real-time Metrics */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Real-time Behavioral Analytics
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart
                data={analyticsData.slice(0, 24).reverse().map(data => ({
                  time: data.timestamp.toLocaleTimeString(),
                  normalityScore: data.metrics.normalityScore,
                  riskScore: data.metrics.riskScore,
                  anomalyScore: data.metrics.anomalyScore,
                  confidenceScore: data.metrics.confidenceScore
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="normalityScore"
                  stackId="1"
                  stroke={theme.palette.success.main}
                  fill={alpha(theme.palette.success.main, 0.3)}
                  name="Normality Score"
                />
                <Area
                  type="monotone"
                  dataKey="anomalyScore"
                  stackId="2"
                  stroke={theme.palette.error.main}
                  fill={alpha(theme.palette.error.main, 0.3)}
                  name="Anomaly Score"
                />
                <Line
                  type="monotone"
                  dataKey="riskScore"
                  stroke={theme.palette.warning.main}
                  strokeWidth={2}
                  name="Risk Score"
                />
                <Line
                  type="monotone"
                  dataKey="confidenceScore"
                  stroke={theme.palette.info.main}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Confidence"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Detection Models Status */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Detection Models
            </Typography>
            <List>
              {detectionModels.map(model => (
                <ListItem
                  key={model.id}
                  button
                  onClick={() => {
                    setSelectedModel(model);
                    setModelDetailsOpen(true);
                  }}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: model.status === 'active' ? theme.palette.success.main :
                               model.status === 'training' ? theme.palette.info.main :
                               model.status === 'error' ? theme.palette.error.main :
                               theme.palette.grey[500],
                        width: 24,
                        height: 24
                      }}
                    >
                      {model.status === 'active' ? <CheckCircle fontSize="small" /> :
                       model.status === 'training' ? <Psychology fontSize="small" /> :
                       model.status === 'error' ? <Error fontSize="small" /> :
                       <Pause fontSize="small" />}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={model.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {model.algorithm} • Accuracy: {model.performance.accuracy.toFixed(1)}%
                        </Typography>
                      </Box>
                    }
                  />
                  <Switch
                    checked={model.status === 'active'}
                    size="small"
                    onClick={(e) => e.stopPropagation()}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Behavioral Analytics & Anomaly Detection
        </Typography>
        <Typography variant="body1" color="textSecondary">
          AI-powered behavioral analysis and advanced anomaly detection engine
        </Typography>
      </Box>

      {/* Dashboard Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <Psychology />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {dashboardStats.totalProfiles}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Profiles
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
                  <BugReport />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {dashboardStats.totalAnomalies}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Anomalies
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
                  <Error />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {dashboardStats.criticalAnomalies}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Critical
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
                  <Info />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {dashboardStats.newAnomalies}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    New
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
                    Models
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
                <Avatar sx={{ bgcolor: getRiskColor(dashboardStats.avgRiskScore) }}>
                  <Assessment />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {dashboardStats.avgRiskScore}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Risk
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search entities, patterns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                <MenuItem value="user">Users</MenuItem>
                <MenuItem value="host">Hosts</MenuItem>
                <MenuItem value="network">Network</MenuItem>
                <MenuItem value="application">Applications</MenuItem>
                <MenuItem value="service">Services</MenuItem>
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
                <MenuItem value="6h">Last 6 Hours</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={realTimeAnalysis}
                    onChange={(e) => setRealTimeAnalysis(e.target.checked)}
                  />
                }
                label="Real-time"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={anomalyDetection}
                    onChange={(e) => setAnomalyDetection(e.target.checked)}
                  />
                }
                label="Detection"
              />
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" gutterBottom>
            Confidence Threshold: {confidenceThreshold}%
          </Typography>
          <Slider
            value={confidenceThreshold}
            onChange={(_, value) => setConfidenceThreshold(value as number)}
            min={0}
            max={100}
            step={5}
            size="small"
            sx={{ mb: 1 }}
          />
          <Typography variant="caption" gutterBottom>
            Anomaly Score Threshold: {anomalyThreshold}%
          </Typography>
          <Slider
            value={anomalyThreshold}
            onChange={(_, value) => setAnomalyThreshold(value as number)}
            min={0}
            max={100}
            step={5}
            size="small"
          />
        </Box>
      </Paper>

      {/* Main Content */}
      <Paper>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Behavior Profiles" icon={<Psychology />} />
          <Tab label="Anomalies" icon={<BugReport />} />
          <Tab label="Analytics Dashboard" icon={<Analytics />} />
          <Tab label="Detection Models" icon={<ModelTraining />} />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
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
            {activeTab === 0 && renderBehaviorProfiles()}
            {activeTab === 1 && renderAnomalyTimeline()}
            {activeTab === 2 && renderAnalyticsDashboard()}
            {activeTab === 3 && (
              <Grid container spacing={3}>
                {detectionModels.map(model => (
                  <Grid item xs={12} md={6} key={model.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { boxShadow: theme.shadows[4] }
                      }}
                      onClick={() => {
                        setSelectedModel(model);
                        setModelDetailsOpen(true);
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6">
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
                              model.status === 'active' ? 'success' :
                              model.status === 'training' ? 'info' :
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
                                {model.performance.accuracy.toFixed(1)}%
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                F1 Score
                              </Typography>
                              <Typography variant="h6" color="info.main">
                                {model.performance.f1Score.toFixed(1)}%
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                False Positive Rate
                              </Typography>
                              <Typography variant="body2" color="warning.main">
                                {model.performance.falsePositiveRate.toFixed(2)}%
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                Instances
                              </Typography>
                              <Typography variant="body2">
                                {model.deployment.instances}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Behavioral Analytics Actions"
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

export default BehavioralAnalyticsAnomalyDetection;