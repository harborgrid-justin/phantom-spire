/**
 * Advanced IOC Correlation and Clustering Visualization
 * Sophisticated IOC analysis competing with Anomali's correlation engine
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Drawer,
  AppBar,
  Toolbar,
  ListItemButton,
  Collapse,
} from '@mui/material';

import {
  Hub,
  AccountTree,
  BubbleChart,
  Timeline,
  NetworkCheck,
  Security,
  Psychology,
  Analytics,
  Assessment,
  Visibility,
  FilterList,
  Download,
  Share,
  Settings,
  Refresh,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  Layers,
  GridOn,
  ViewModule,
  FormatListBulleted,
  Search,
  CompareArrows,
  Link,
  LinkOff,
  GroupWork,
  DeviceHub,
  Transform,
  TrendingUp,
  Warning,  Error as ErrorIcon,
  CheckCircle,
  Info,
  BookmarkBorder,
  Bookmark,
  Star,
  StarBorder,
  Flag,
  LocationOn,
  Schedule,
  DataUsage,
  Storage,
  CloudDownload,
  Memory,
  Speed,
  SignalCellularAlt,
  ExpandMore,
  ExpandLess,
  ChevronRight,
  MoreVert,
  Edit,
  Delete,
  Add,
  Remove,
  PlayArrow,
  Pause,
  Stop,
  FastForward,
  FastRewind,
  Menu
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';

// Enhanced interfaces for IOC correlation
interface IOCNode {
  id: string;
  value: string;
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'file' | 'registry' | 'yara' | 'mitre';
  subtype?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  source: string;
  firstSeen: Date;
  lastSeen: Date;
  occurrences: number;
  associatedCampaigns: string[];
  associatedActors: string[];
  geolocation?: {
    country: string;
    region: string;
    city?: string;
    coordinates?: [number, number];
  };
  enrichment: {
    reputation: number;
    malwareFamily?: string;
    classification: string;
    tags: string[];
    whoisData?: any;
    dnsRecords?: any;
    certificates?: any;
  };
  relationships: {
    parentNodes: string[];
    childNodes: string[];
    siblingNodes: string[];
    strength: number;
  };
  analysis: {
    riskScore: number;
    behaviorScore: number;
    anomalyScore: number;
    contextScore: number;
  };
  visualization: {
    x: number;
    y: number;
    size: number;
    color: string;
    cluster?: string;
    highlighted: boolean;
    selected: boolean;
  };
}

interface IOCCluster {
  id: string;
  name: string;
  iocs: string[];
  centroid: IOCNode;
  size: number;
  density: number;
  cohesion: number;
  avgRiskScore: number;
  dominantType: string;
  campaign?: string;
  actor?: string;
  timeframe: {
    start: Date;
    end: Date;
  };
  characteristics: {
    commonTags: string[];
    commonSources: string[];
    commonGeolocations: string[];
    behaviorPatterns: string[];
  };
  color: string;
  visible: boolean;
}

interface CorrelationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  weight: number;
  conditions: {
    type: 'temporal' | 'spatial' | 'behavioral' | 'contextual' | 'semantic';
    parameters: Record<string, any>;
  }[];
  threshold: number;
  lastExecuted?: Date;
  matchCount: number;
}

interface VisualizationSettings {
  layout: 'force' | 'circular' | 'hierarchical' | 'grid' | 'clustering';
  colorScheme: 'severity' | 'type' | 'cluster' | 'source' | 'timeline';
  nodeSize: 'fixed' | 'occurrences' | 'risk' | 'connections';
  edgeThickness: 'fixed' | 'strength' | 'frequency';
  showLabels: boolean;
  showClusters: boolean;
  animationEnabled: boolean;
  filterThreshold: number;
  timeRange: [Date, Date];
}

const IOCCorrelationVisualization: React.FC = () => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Core data states
  const [iocNodes, setIocNodes] = useState<IOCNode[]>([]);
  const [clusters, setClusters] = useState<IOCCluster[]>([]);
  const [correlationRules, setCorrelationRules] = useState<CorrelationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Visualization states
  const [visualizationSettings, setVisualizationSettings] = useState<VisualizationSettings>({
    layout: 'force',
    colorScheme: 'severity',
    nodeSize: 'risk',
    edgeThickness: 'strength',
    showLabels: true,
    showClusters: true,
    animationEnabled: true,
    filterThreshold: 0.5,
    timeRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()]
  });
  
  // Selection and interaction states
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  
  // UI states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  const [riskThreshold, setRiskThreshold] = useState(30);
  
  // Animation and rendering states
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('ioc-correlation-visualization', {
      continuous: true,
      position: 'top-left',
      minimized: true,
      interval: 120000
    });

    return () => evaluationController.remove();
  }, []);

  // Generate mock IOC data with relationships
  const generateMockIOCData = useCallback((): { nodes: IOCNode[], clusters: IOCCluster[] } => {
    const iocTypes = ['ip', 'domain', 'url', 'hash', 'email', 'file'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    const sources = ['VirusTotal', 'Hybrid Analysis', 'Internal', 'OSINT', 'Partner Feed'];
    const campaigns = ['Operation Aurora', 'APT28 Campaign', 'Lazarus Group', 'Carbanak'];
    const actors = ['APT28', 'APT29', 'Lazarus', 'Carbanak', 'FIN7'];
    
    const nodes: IOCNode[] = [];
    const nodeCount = 200;
    
    // Generate IOC nodes
    for (let i = 0; i < nodeCount; i++) {
      const type = iocTypes[Math.floor(Math.random() * iocTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      
      let value = '';
      switch (type) {
        case 'ip':
          value = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
          break;
        case 'domain':
          value = `malicious${i}.example.com`;
          break;
        case 'url':
          value = `https://malicious${i}.example.com/path`;
          break;
        case 'hash':
          value = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
          break;
        case 'email':
          value = `malicious${i}@badactor.com`;
          break;
        case 'file':
          value = `malicious_file_${i}.exe`;
          break;
      }
      
      const riskScore = Math.floor(Math.random() * 100);
      const confidence = Math.floor(Math.random() * 50) + 50;
      
      nodes.push({
        id: `ioc-${i}`,
        value,
        type,
        severity,
        confidence,
        source: sources[Math.floor(Math.random() * sources.length)],
        firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        occurrences: Math.floor(Math.random() * 100) + 1,
        associatedCampaigns: campaigns.slice(0, Math.floor(Math.random() * 2) + 1),
        associatedActors: actors.slice(0, Math.floor(Math.random() * 2) + 1),
        geolocation: {
          country: ['US', 'CN', 'RU', 'KP', 'IR'][Math.floor(Math.random() * 5)],
          region: 'Unknown',
          coordinates: [Math.random() * 180 - 90, Math.random() * 360 - 180]
        },
        enrichment: {
          reputation: Math.floor(Math.random() * 100),
          classification: severity,
          tags: ['malware', 'botnet', 'apt'].slice(0, Math.floor(Math.random() * 3) + 1),
        },
        relationships: {
          parentNodes: [],
          childNodes: [],
          siblingNodes: [],
          strength: Math.random()
        },
        analysis: {
          riskScore,
          behaviorScore: Math.floor(Math.random() * 100),
          anomalyScore: Math.floor(Math.random() * 100),
          contextScore: Math.floor(Math.random() * 100)
        },
        visualization: {
          x: Math.random() * 800,
          y: Math.random() * 600,
          size: Math.max(5, riskScore / 10),
          color: severity === 'critical' ? theme.palette.error.main :
                 severity === 'high' ? theme.palette.warning.main :
                 severity === 'medium' ? theme.palette.info.main :
                 theme.palette.success.main,
          highlighted: false,
          selected: false
        }
      });
    }

    // Generate relationships between nodes
    nodes.forEach(node => {
      const relationshipCount = Math.floor(Math.random() * 5);
      for (let i = 0; i < relationshipCount; i++) {
        const targetNode = nodes[Math.floor(Math.random() * nodes.length)];
        if (targetNode.id !== node.id && !node.relationships.siblingNodes.includes(targetNode.id)) {
          node.relationships.siblingNodes.push(targetNode.id);
          node.relationships.strength = Math.random();
        }
      }
    });

    // Generate clusters
    const clusterCount = 8;
    const clusters: IOCCluster[] = [];
    
    for (let i = 0; i < clusterCount; i++) {
      const clusterNodes = nodes.filter(() => Math.random() < 0.3).slice(0, 15);
      const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
      const actor = actors[Math.floor(Math.random() * actors.length)];
      
      clusters.push({
        id: `cluster-${i}`,
        name: `Cluster ${i + 1} - ${campaign}`,
        iocs: clusterNodes.map(n => n.id),
        centroid: clusterNodes[0] || nodes[0],
        size: clusterNodes.length,
        density: Math.random(),
        cohesion: Math.random(),
        avgRiskScore: Math.floor(clusterNodes.reduce((sum, n) => sum + n.analysis.riskScore, 0) / clusterNodes.length) || 50,
        dominantType: iocTypes[Math.floor(Math.random() * iocTypes.length)],
        campaign,
        actor,
        timeframe: {
          start: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          end: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        },
        characteristics: {
          commonTags: ['malware', 'apt'],
          commonSources: sources.slice(0, 2),
          commonGeolocations: ['CN', 'RU'],
          behaviorPatterns: ['Command & Control', 'Data Exfiltration']
        },
        color: `hsl(${i * 45}, 70%, 60%)`,
        visible: true
      });
      
      // Assign cluster to nodes
      clusterNodes.forEach(node => {
        node.visualization.cluster = clusters[i].id;
      });
    }

    return { nodes, clusters };
  }, [theme]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const { nodes, clusters: generatedClusters } = generateMockIOCData();
        setIocNodes(nodes);
        setClusters(generatedClusters);
        
        // Generate correlation rules
        setCorrelationRules([
          {
            id: 'temporal-proximity',
            name: 'Temporal Proximity Rule',
            description: 'Correlates IOCs appearing within 24 hours of each other',
            enabled: true,
            weight: 0.8,
            conditions: [
              {
                type: 'temporal',
                parameters: { maxTimeDistance: 86400000 }
              }
            ],
            threshold: 0.7,
            matchCount: 45
          },
          {
            id: 'geolocation-clustering',
            name: 'Geolocation Clustering',
            description: 'Groups IOCs from same geographic regions',
            enabled: true,
            weight: 0.6,
            conditions: [
              {
                type: 'spatial',
                parameters: { maxDistance: 1000 }
              }
            ],
            threshold: 0.5,
            matchCount: 32
          },
          {
            id: 'behavioral-similarity',
            name: 'Behavioral Similarity',
            description: 'Correlates IOCs with similar behavior patterns',
            enabled: true,
            weight: 0.9,
            conditions: [
              {
                type: 'behavioral',
                parameters: { similarityThreshold: 0.8 }
              }
            ],
            threshold: 0.8,
            matchCount: 28
          }
        ]);
        
      } catch (err) {
        setError('Failed to load IOC correlation data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockIOCData]);

  // Filter IOCs based on current filters
  const filteredIOCs = useMemo(() => {
    return iocNodes.filter(ioc => {
      // Search filter
      if (searchTerm && !ioc.value.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !ioc.enrichment.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      
      // Type filter
      if (typeFilter !== 'all' && ioc.type !== typeFilter) {
        return false;
      }
      
      // Severity filter
      if (severityFilter !== 'all' && ioc.severity !== severityFilter) {
        return false;
      }
      
      // Source filter
      if (sourceFilter !== 'all' && ioc.source !== sourceFilter) {
        return false;
      }
      
      // Confidence threshold
      if (ioc.confidence < confidenceThreshold) {
        return false;
      }
      
      // Risk threshold
      if (ioc.analysis.riskScore < riskThreshold) {
        return false;
      }
      
      return true;
    });
  }, [iocNodes, searchTerm, typeFilter, severityFilter, sourceFilter, confidenceThreshold, riskThreshold]);

  // Calculate correlation statistics
  const correlationStats = useMemo(() => {
    const totalNodes = filteredIOCs.length;
    const totalEdges = filteredIOCs.reduce((sum, node) => sum + node.relationships.siblingNodes.length, 0) / 2;
    const avgConnections = totalNodes > 0 ? totalEdges / totalNodes : 0;
    const clusteredNodes = filteredIOCs.filter(ioc => ioc.visualization.cluster).length;
    const clusteringRatio = totalNodes > 0 ? clusteredNodes / totalNodes : 0;
    
    return {
      totalNodes,
      totalEdges,
      avgConnections: Math.round(avgConnections * 100) / 100,
      clusteringRatio: Math.round(clusteringRatio * 100),
      activeClusters: clusters.filter(c => c.visible).length,
      highRiskNodes: filteredIOCs.filter(ioc => ioc.analysis.riskScore >= 80).length
    };
  }, [filteredIOCs, clusters]);

  // Get node color based on color scheme
  const getNodeColor = useCallback((node: IOCNode): string => {
    switch (visualizationSettings.colorScheme) {
      case 'severity':
        switch (node.severity) {
          case 'critical': return theme.palette.error.main;
          case 'high': return theme.palette.warning.main;
          case 'medium': return theme.palette.info.main;
          case 'low': return theme.palette.success.main;
        }
        break;
      case 'type':
        const typeColors: Record<string, string> = {
          ip: '#ff6b6b',
          domain: '#4ecdc4',
          url: '#45b7d1',
          hash: '#96ceb4',
          email: '#ffeaa7',
          file: '#dda0dd'
        };
        return typeColors[node.type] || theme.palette.grey[500];
      case 'cluster':
        const cluster = clusters.find(c => c.id === node.visualization.cluster);
        return cluster?.color || theme.palette.grey[500];
      case 'source':
        return `hsl(${node.source.length * 50}, 70%, 60%)`;
      case 'timeline':
        const age = Date.now() - node.lastSeen.getTime();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        const ratio = Math.min(age / maxAge, 1);
        return `hsl(${(1 - ratio) * 120}, 70%, 60%)`;
      default:
        return theme.palette.primary.main;
    }
  }, [visualizationSettings.colorScheme, theme, clusters]);

  // Get node size based on size scheme
  const getNodeSize = useCallback((node: IOCNode): number => {
    const baseSize = 8;
    const maxSize = 24;
    
    switch (visualizationSettings.nodeSize) {
      case 'fixed':
        return baseSize;
      case 'occurrences':
        return Math.min(baseSize + (node.occurrences / 10), maxSize);
      case 'risk':
        return Math.min(baseSize + (node.analysis.riskScore / 5), maxSize);
      case 'connections':
        return Math.min(baseSize + (node.relationships.siblingNodes.length * 2), maxSize);
      default:
        return baseSize;
    }
  }, [visualizationSettings.nodeSize]);

  // Canvas drawing function
  const drawVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom and pan
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);
    
    // Draw clusters if enabled
    if (visualizationSettings.showClusters) {
      clusters.filter(c => c.visible).forEach(cluster => {
        const clusterNodes = filteredIOCs.filter(ioc => ioc.visualization.cluster === cluster.id);
        if (clusterNodes.length === 0) return;
        
        // Calculate cluster bounds
        const minX = Math.min(...clusterNodes.map(n => n.visualization.x));
        const maxX = Math.max(...clusterNodes.map(n => n.visualization.x));
        const minY = Math.min(...clusterNodes.map(n => n.visualization.y));
        const maxY = Math.max(...clusterNodes.map(n => n.visualization.y));
        
        const padding = 20;
        const width = maxX - minX + padding * 2;
        const height = maxY - minY + padding * 2;
        
        // Draw cluster background
        ctx.fillStyle = alpha(cluster.color, 0.1);
        ctx.strokeStyle = alpha(cluster.color, 0.3);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(minX - padding, minY - padding, width, height, 10);
        ctx.fill();
        ctx.stroke();
        
        // Draw cluster label
        if (visualizationSettings.showLabels) {
          ctx.fillStyle = cluster.color;
          ctx.font = '12px Arial';
          ctx.fillText(cluster.name, minX - padding + 5, minY - padding + 15);
        }
      });
    }
    
    // Draw edges
    filteredIOCs.forEach(node => {
      node.relationships.siblingNodes.forEach(siblingId => {
        const sibling = filteredIOCs.find(n => n.id === siblingId);
        if (!sibling) return;
        
        const strength = node.relationships.strength;
        const thickness = visualizationSettings.edgeThickness === 'fixed' ? 1 :
                         visualizationSettings.edgeThickness === 'strength' ? strength * 3 :
                         2;
        
        ctx.strokeStyle = alpha(theme.palette.grey[400], 0.3 + strength * 0.4);
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(node.visualization.x, node.visualization.y);
        ctx.lineTo(sibling.visualization.x, sibling.visualization.y);
        ctx.stroke();
      });
    });
    
    // Draw nodes
    filteredIOCs.forEach(node => {
      const size = getNodeSize(node);
      const color = getNodeColor(node);
      
      // Node background
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.visualization.x, node.visualization.y, size, 0, 2 * Math.PI);
      ctx.fill();
      
      // Selection highlight
      if (selectedNodes.includes(node.id)) {
        ctx.strokeStyle = theme.palette.primary.main;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      
      // Hover highlight
      if (hoveredNode === node.id) {
        ctx.strokeStyle = theme.palette.secondary.main;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Draw labels if enabled
      if (visualizationSettings.showLabels && size > 10) {
        ctx.fillStyle = theme.palette.text.primary;
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          node.value.length > 15 ? node.value.substring(0, 12) + '...' : node.value,
          node.visualization.x,
          node.visualization.y + size + 12
        );
      }
    });
    
    ctx.restore();
  }, [filteredIOCs, clusters, visualizationSettings, selectedNodes, hoveredNode, zoomLevel, panOffset, getNodeColor, getNodeSize, theme]);

  // Redraw visualization when dependencies change
  useEffect(() => {
    drawVisualization();
  }, [drawVisualization]);

  // Handle canvas interactions
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - panOffset.x) / zoomLevel;
    const y = (event.clientY - rect.top - panOffset.y) / zoomLevel;
    
    // Find clicked node
    const clickedNode = filteredIOCs.find(node => {
      const dx = node.visualization.x - x;
      const dy = node.visualization.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= getNodeSize(node);
    });
    
    if (clickedNode) {
      if (event.ctrlKey || event.metaKey) {
        // Multi-select
        setSelectedNodes(prev => 
          prev.includes(clickedNode.id) 
            ? prev.filter(id => id !== clickedNode.id)
            : [...prev, clickedNode.id]
        );
      } else {
        // Single select
        setSelectedNodes([clickedNode.id]);
      }
    } else {
      // Clear selection
      setSelectedNodes([]);
    }
  }, [filteredIOCs, panOffset, zoomLevel, getNodeSize]);

  // Render statistics panel
  const renderStatsPanel = () => (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Correlation Statistics
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Total Nodes
            </Typography>
            <Typography variant="h5">
              {correlationStats.totalNodes.toLocaleString()}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Total Connections
            </Typography>
            <Typography variant="h5">
              {correlationStats.totalEdges.toLocaleString()}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Avg Connections
            </Typography>
            <Typography variant="h5">
              {correlationStats.avgConnections}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Clustering Ratio
            </Typography>
            <Typography variant="h5">
              {correlationStats.clusteringRatio}%
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Active Clusters
            </Typography>
            <Typography variant="h5">
              {correlationStats.activeClusters}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              High Risk Nodes
            </Typography>
            <Typography variant="h5" color="error">
              {correlationStats.highRiskNodes}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  // Render cluster list
  const renderClusterList = () => (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        IOC Clusters
      </Typography>
      <List dense>
        {clusters.map(cluster => (
          <ListItemButton
            key={cluster.id}
            selected={selectedCluster === cluster.id}
            onClick={() => setSelectedCluster(cluster.id)}
          >
            <ListItemIcon>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: cluster.color
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary={cluster.name}
              secondary={`${cluster.size} IOCs • ${cluster.avgRiskScore} risk`}
            />
            <Switch
              edge="end"
              checked={cluster.visible}
              onChange={() => {
                setClusters(prev => prev.map(c => 
                  c.id === cluster.id ? { ...c, visible: !c.visible } : c
                ));
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );

  // Render correlation rules panel
  const renderCorrelationRules = () => (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Correlation Rules
      </Typography>
      <List>
        {correlationRules.map(rule => (
          <ListItem key={rule.id}>
            <ListItemIcon>
              <Hub />
            </ListItemIcon>
            <ListItemText
              primary={rule.name}
              secondary={
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {rule.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                    <Chip size="small" label={`Weight: ${rule.weight}`} />
                    <Chip size="small" label={`Matches: ${rule.matchCount}`} />
                    <Chip 
                      size="small" 
                      label={rule.enabled ? 'Enabled' : 'Disabled'}
                      color={rule.enabled ? 'success' : 'default'}
                    />
                  </Box>
                </Box>
              }
            />
            <Switch
              checked={rule.enabled}
              onChange={() => {
                setCorrelationRules(prev => prev.map(r =>
                  r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                ));
              }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
        sx={{
          width: 320,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
            position: 'relative'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            IOC Correlation Engine
          </Typography>
          
          {/* Search and Filters */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search IOCs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
            
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="ip">IP Address</MenuItem>
                    <MenuItem value="domain">Domain</MenuItem>
                    <MenuItem value="url">URL</MenuItem>
                    <MenuItem value="hash">Hash</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="file">File</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
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
              />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" gutterBottom>
                Risk Threshold: {riskThreshold}%
              </Typography>
              <Slider
                value={riskThreshold}
                onChange={(_, value) => setRiskThreshold(value as number)}
                min={0}
                max={100}
                step={5}
                size="small"
              />
            </Box>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {/* Tabs for different panels */}
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="Stats" />
            <Tab label="Clusters" />
            <Tab label="Rules" />
          </Tabs>
          
          <Box sx={{ mt: 2, maxHeight: 'calc(100vh - 400px)', overflow: 'auto' }}>
            {activeTab === 0 && renderStatsPanel()}
            {activeTab === 1 && renderClusterList()}
            {activeTab === 2 && renderCorrelationRules()}
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar variant="dense">
            <IconButton
              edge="start"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu />
            </IconButton>
            
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              IOC Correlation & Clustering Visualization
            </Typography>
            
            {/* View Controls */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Layout</InputLabel>
                <Select
                  value={visualizationSettings.layout}
                  onChange={(e) => setVisualizationSettings(prev => ({
                    ...prev,
                    layout: e.target.value as any
                  }))}
                  label="Layout"
                >
                  <MenuItem value="force">Force Directed</MenuItem>
                  <MenuItem value="circular">Circular</MenuItem>
                  <MenuItem value="hierarchical">Hierarchical</MenuItem>
                  <MenuItem value="grid">Grid</MenuItem>
                  <MenuItem value="clustering">Clustering</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Color By</InputLabel>
                <Select
                  value={visualizationSettings.colorScheme}
                  onChange={(e) => setVisualizationSettings(prev => ({
                    ...prev,
                    colorScheme: e.target.value as any
                  }))}
                  label="Color By"
                >
                  <MenuItem value="severity">Severity</MenuItem>
                  <MenuItem value="type">Type</MenuItem>
                  <MenuItem value="cluster">Cluster</MenuItem>
                  <MenuItem value="source">Source</MenuItem>
                  <MenuItem value="timeline">Timeline</MenuItem>
                </Select>
              </FormControl>
              
              <Divider orientation="vertical" flexItem />
              
              <IconButton
                onClick={() => setZoomLevel(prev => Math.min(prev * 1.2, 3))}
                title="Zoom In"
              >
                <ZoomIn />
              </IconButton>
              
              <IconButton
                onClick={() => setZoomLevel(prev => Math.max(prev / 1.2, 0.1))}
                title="Zoom Out"
              >
                <ZoomOut />
              </IconButton>
              
              <IconButton
                onClick={() => {
                  setZoomLevel(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                title="Reset View"
              >
                <CenterFocusStrong />
              </IconButton>
              
              <Divider orientation="vertical" flexItem />
              
              <IconButton
                onClick={() => setSettingsOpen(true)}
                title="Settings"
              >
                <Settings />
              </IconButton>
              
              <IconButton
                onClick={() => {/* Refresh data */}}
                title="Refresh"
              >
                <Refresh />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Canvas Container */}
        <Box
          ref={containerRef}
          sx={{
            flexGrow: 1,
            position: 'relative',
            overflow: 'hidden',
            bgcolor: theme.palette.background.default
          }}
        >
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%' 
            }}>
              <CircularProgress size={60} />
            </Box>
          ) : error ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%' 
            }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : (
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={(e) => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left - panOffset.x) / zoomLevel;
                const y = (e.clientY - rect.top - panOffset.y) / zoomLevel;
                
                const hoveredIOC = filteredIOCs.find(node => {
                  const dx = node.visualization.x - x;
                  const dy = node.visualization.y - y;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  return distance <= getNodeSize(node);
                });
                
                setHoveredNode(hoveredIOC?.id || null);
              }}
              style={{
                width: '100%',
                height: '100%',
                cursor: draggedNode ? 'grabbing' : hoveredNode ? 'pointer' : 'default'
              }}
            />
          )}
          
          {/* Overlay Information */}
          {hoveredNode && (
            <Paper
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                p: 2,
                maxWidth: 300,
                zIndex: 1000
              }}
            >
              {(() => {
                const node = filteredIOCs.find(n => n.id === hoveredNode);
                if (!node) return null;
                
                return (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {node.value}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {node.type.toUpperCase()} • {node.source}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <Chip size="small" label={node.severity} color="primary" />
                      <Chip size="small" label={`${node.confidence}% confidence`} />
                      <Chip size="small" label={`${node.analysis.riskScore} risk`} />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Connections: {node.relationships.siblingNodes.length}
                    </Typography>
                    <Typography variant="body2">
                      Occurrences: {node.occurrences}
                    </Typography>
                  </Box>
                );
              })()}
            </Paper>
          )}
          
          {/* Selection Info */}
          {selectedNodes.length > 0 && (
            <Paper
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                p: 2,
                minWidth: 200
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Selected: {selectedNodes.length} IOCs
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {/* Analyze selected */}}
                >
                  Analyze
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {/* Export selected */}}
                >
                  Export
                </Button>
                <Button
                  size="small"
                  onClick={() => setSelectedNodes([])}
                >
                  Clear
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Visualization Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Layout Settings
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Layout Algorithm</InputLabel>
                <Select
                  value={visualizationSettings.layout}
                  onChange={(e) => setVisualizationSettings(prev => ({
                    ...prev,
                    layout: e.target.value as any
                  }))}
                  label="Layout Algorithm"
                >
                  <MenuItem value="force">Force Directed</MenuItem>
                  <MenuItem value="circular">Circular</MenuItem>
                  <MenuItem value="hierarchical">Hierarchical</MenuItem>
                  <MenuItem value="grid">Grid</MenuItem>
                  <MenuItem value="clustering">Clustering</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Node Size</InputLabel>
                <Select
                  value={visualizationSettings.nodeSize}
                  onChange={(e) => setVisualizationSettings(prev => ({
                    ...prev,
                    nodeSize: e.target.value as any
                  }))}
                  label="Node Size"
                >
                  <MenuItem value="fixed">Fixed Size</MenuItem>
                  <MenuItem value="occurrences">By Occurrences</MenuItem>
                  <MenuItem value="risk">By Risk Score</MenuItem>
                  <MenuItem value="connections">By Connections</MenuItem>
                </Select>
              </FormControl>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={visualizationSettings.showLabels}
                    onChange={(e) => setVisualizationSettings(prev => ({
                      ...prev,
                      showLabels: e.target.checked
                    }))}
                  />
                }
                label="Show Labels"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={visualizationSettings.showClusters}
                    onChange={(e) => setVisualizationSettings(prev => ({
                      ...prev,
                      showClusters: e.target.checked
                    }))}
                  />
                }
                label="Show Clusters"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Color and Animation
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Color Scheme</InputLabel>
                <Select
                  value={visualizationSettings.colorScheme}
                  onChange={(e) => setVisualizationSettings(prev => ({
                    ...prev,
                    colorScheme: e.target.value as any
                  }))}
                  label="Color Scheme"
                >
                  <MenuItem value="severity">By Severity</MenuItem>
                  <MenuItem value="type">By Type</MenuItem>
                  <MenuItem value="cluster">By Cluster</MenuItem>
                  <MenuItem value="source">By Source</MenuItem>
                  <MenuItem value="timeline">By Timeline</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Edge Thickness</InputLabel>
                <Select
                  value={visualizationSettings.edgeThickness}
                  onChange={(e) => setVisualizationSettings(prev => ({
                    ...prev,
                    edgeThickness: e.target.value as any
                  }))}
                  label="Edge Thickness"
                >
                  <MenuItem value="fixed">Fixed</MenuItem>
                  <MenuItem value="strength">By Strength</MenuItem>
                  <MenuItem value="frequency">By Frequency</MenuItem>
                </Select>
              </FormControl>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={visualizationSettings.animationEnabled}
                    onChange={(e) => setVisualizationSettings(prev => ({
                      ...prev,
                      animationEnabled: e.target.checked
                    }))}
                  />
                }
                label="Enable Animation"
              />
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" gutterBottom>
                  Filter Threshold: {visualizationSettings.filterThreshold}
                </Typography>
                <Slider
                  value={visualizationSettings.filterThreshold}
                  onChange={(_, value) => setVisualizationSettings(prev => ({
                    ...prev,
                    filterThreshold: value as number
                  }))}
                  min={0}
                  max={1}
                  step={0.1}
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // Apply settings and redraw
              drawVisualization();
              setSettingsOpen(false);
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Correlation Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Analytics />}
          tooltipTitle="Run Analysis"
          onClick={() => {/* Run correlation analysis */}}
        />
        <SpeedDialAction
          icon={<Download />}
          tooltipTitle="Export Visualization"
          onClick={() => {/* Export */}}
        />
        <SpeedDialAction
          icon={<Share />}
          tooltipTitle="Share Analysis"
          onClick={() => {/* Share */}}
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

export default IOCCorrelationVisualization;
