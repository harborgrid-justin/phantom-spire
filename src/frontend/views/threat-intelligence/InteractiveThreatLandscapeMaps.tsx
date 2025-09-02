/**
 * Interactive Threat Landscape Maps and Geographic Visualizations
 * Global threat intelligence geographic analysis platform
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
  ToggleButton,
  ToggleButtonGroup,
  AppBar,
  Toolbar,
  Drawer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Breadcrumbs,
  Link,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  Popper,
  Grow,
  ClickAwayListener,
  Backdrop,
  Fade,
  Modal
} from '@mui/material';

import {
  Map,
  Public,
  LocationOn,
  MyLocation,
  Place,
  Room,
  PinDrop,
  GpsFixed,
  Explore,
  Language,
  Flight,
  DirectionsRun,
  Timeline as TimelineIcon,
  TrendingUp,
  TrendingDown,
  Analytics,
  Assessment,
  Visibility,
  VisibilityOff,
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
  Security,
  Warning,
  Error,
  CheckCircle,
  Info,
  Psychology,
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
  DataUsage,
  CloudDownload,
  Storage,
  Memory,
  Speed,
  NetworkCheck,
  Computer,
  BugReport,
  Flag,
  Business,
  Person,
  Schedule,
  ExpandMore,
  ExpandLess,
  ChevronRight,
  MoreVert,
  Launch,
  OpenInNew,
  Edit,
  Delete,
  Add,
  Remove,
  PlayArrow,
  Pause,
  Stop,
  FastForward,
  FastRewind,
  SkipNext,
  SkipPrevious,
  Fullscreen,
  FullscreenExit,
  Satellite,
  Terrain,
  Traffic
} from '@mui/icons-material';

import {
  ComposedChart,
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
  Treemap,
  Sankey
} from 'recharts';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/core/UIUXEvaluationService';

// Geographic threat data interfaces
interface ThreatLocation {
  id: string;
  coordinates: [number, number]; // [lat, lng]
  country: string;
  countryCode: string;
  region: string;
  city?: string;
  threatCount: number;
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  threatTypes: {
    malware: number;
    phishing: number;
    botnet: number;
    apt: number;
    ransomware: number;
    ddos: number;
  };
  actors: {
    id: string;
    name: string;
    count: number;
    type: string;
  }[];
  infrastructure: {
    c2Servers: number;
    botnets: number;
    phishingSites: number;
    malwareHosts: number;
  };
  timeline: {
    date: Date;
    count: number;
    severity: string;
  }[];
  riskScore: number;
  confidence: number;
  lastUpdated: Date;
}

interface ThreatFlow {
  id: string;
  source: ThreatLocation;
  destination: ThreatLocation;
  threatType: string;
  volume: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  protocols: string[];
  ports: number[];
  duration: number;
  firstSeen: Date;
  lastSeen: Date;
  isActive: boolean;
  confidence: number;
  campaigns: string[];
  actors: string[];
}

interface GeographicCluster {
  id: string;
  name: string;
  center: [number, number];
  radius: number;
  locations: string[];
  totalThreats: number;
  dominantType: string;
  avgSeverity: number;
  riskScore: number;
  characteristics: {
    commonActors: string[];
    commonCampaigns: string[];
    commonTechniques: string[];
    targetedSectors: string[];
  };
  color: string;
  visible: boolean;
}

interface HeatmapData {
  country: string;
  countryCode: string;
  coordinates: [number, number];
  value: number;
  intensity: number;
  color: string;
  details: {
    threats: number;
    actors: number;
    campaigns: number;
    infrastructure: number;
  };
}

interface MapSettings {
  mapType: 'satellite' | 'terrain' | 'hybrid' | 'political';
  overlay: 'threats' | 'actors' | 'infrastructure' | 'flows' | 'clusters';
  colorScheme: 'severity' | 'type' | 'volume' | 'risk';
  animation: boolean;
  clustering: boolean;
  heatmap: boolean;
  flows: boolean;
  labels: boolean;
  zoomLevel: number;
  center: [number, number];
  timeRange: {
    start: Date;
    end: Date;
  };
  autoUpdate: boolean;
  updateInterval: number;
}

const InteractiveThreatLandscapeMaps: React.FC = () => {
  const theme = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Core data states
  const [threatLocations, setThreatLocations] = useState<ThreatLocation[]>([]);
  const [threatFlows, setThreatFlows] = useState<ThreatFlow[]>([]);
  const [geoClusters, setGeoClusters] = useState<GeographicCluster[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Map states
  const [mapSettings, setMapSettings] = useState<MapSettings>({
    mapType: 'political',
    overlay: 'threats',
    colorScheme: 'severity',
    animation: true,
    clustering: true,
    heatmap: false,
    flows: true,
    labels: true,
    zoomLevel: 2,
    center: [20, 0],
    timeRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    autoUpdate: true,
    updateInterval: 30000
  });
  
  // Selection states
  const [selectedLocation, setSelectedLocation] = useState<ThreatLocation | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<ThreatFlow | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<GeographicCluster | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  
  // UI states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [timelineMode, setTimelineMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  
  // Timeline states
  const [currentTimeframe, setCurrentTimeframe] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  // Filter states
  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [threatTypeFilter, setThreatTypeFilter] = useState<string[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [actorFilter, setActorFilter] = useState<string[]>([]);
  const [riskThreshold, setRiskThreshold] = useState([0, 100]);

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('interactive-threat-landscape-maps', {
      continuous: true,
      position: 'top-left',
      minimized: true,
      interval: 200000
    });

    return () => evaluationController.remove();
  }, []);

  // Generate mock geographic threat data
  const generateMockGeoData = useCallback(() => {
    const countries = [
      { name: 'United States', code: 'US', coords: [39.8283, -98.5795] },
      { name: 'China', code: 'CN', coords: [35.8617, 104.1954] },
      { name: 'Russia', code: 'RU', coords: [61.5240, 105.3188] },
      { name: 'Germany', code: 'DE', coords: [51.1657, 10.4515] },
      { name: 'United Kingdom', code: 'GB', coords: [55.3781, -3.4360] },
      { name: 'France', code: 'FR', coords: [46.2276, 2.2137] },
      { name: 'Japan', code: 'JP', coords: [36.2048, 138.2529] },
      { name: 'South Korea', code: 'KR', coords: [35.9078, 127.7669] },
      { name: 'India', code: 'IN', coords: [20.5937, 78.9629] },
      { name: 'Brazil', code: 'BR', coords: [-14.2350, -51.9253] },
      { name: 'Australia', code: 'AU', coords: [-25.2744, 133.7751] },
      { name: 'Canada', code: 'CA', coords: [56.1304, -106.3468] },
      { name: 'Iran', code: 'IR', coords: [32.4279, 53.6880] },
      { name: 'North Korea', code: 'KP', coords: [40.3399, 127.5101] },
      { name: 'Israel', code: 'IL', coords: [31.0461, 34.8516] }
    ];

    const threatTypes = ['malware', 'phishing', 'botnet', 'apt', 'ransomware', 'ddos'];
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    
    // Generate threat locations
    const locations: ThreatLocation[] = countries.map((country, index) => {
      const threatCount = Math.floor(Math.random() * 5000) + 100;
      const severityBreakdown = {
        critical: Math.floor(threatCount * 0.05),
        high: Math.floor(threatCount * 0.15),
        medium: Math.floor(threatCount * 0.3),
        low: Math.floor(threatCount * 0.5)
      };
      
      const threatTypeBreakdown = threatTypes.reduce((acc, type) => {
        acc[type] = Math.floor(Math.random() * threatCount * 0.3);
        return acc;
      }, {} as any);
      
      const riskScore = Math.floor(Math.random() * 100);
      
      // Generate timeline data
      const timeline = [];
      for (let i = 30; i >= 0; i--) {
        timeline.push({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          count: Math.floor(Math.random() * 200) + 10,
          severity: severities[Math.floor(Math.random() * 4)]
        });
      }
      
      return {
        id: `location-${index}`,
        coordinates: country.coords as [number, number],
        country: country.name,
        countryCode: country.code,
        region: index < 5 ? 'Americas' : index < 10 ? 'Asia-Pacific' : 'Europe',
        city: `${country.name} Metro`,
        threatCount,
        severityBreakdown,
        threatTypes: threatTypeBreakdown,
        actors: [
          { id: `actor-${index}-1`, name: `APT-${index + 20}`, count: Math.floor(Math.random() * 50), type: 'nation-state' },
          { id: `actor-${index}-2`, name: `Group-${index + 50}`, count: Math.floor(Math.random() * 30), type: 'cybercriminal' }
        ],
        infrastructure: {
          c2Servers: Math.floor(Math.random() * 50),
          botnets: Math.floor(Math.random() * 20),
          phishingSites: Math.floor(Math.random() * 100),
          malwareHosts: Math.floor(Math.random() * 75)
        },
        timeline,
        riskScore,
        confidence: Math.floor(Math.random() * 30) + 70,
        lastUpdated: new Date()
      };
    });

    // Generate threat flows
    const flows: ThreatFlow[] = [];
    for (let i = 0; i < 25; i++) {
      const sourceIndex = Math.floor(Math.random() * locations.length);
      const destIndex = Math.floor(Math.random() * locations.length);
      
      if (sourceIndex !== destIndex) {
        flows.push({
          id: `flow-${i}`,
          source: locations[sourceIndex],
          destination: locations[destIndex],
          threatType: threatTypes[Math.floor(Math.random() * threatTypes.length)],
          volume: Math.floor(Math.random() * 1000) + 10,
          severity: severities[Math.floor(Math.random() * 4)],
          protocols: ['HTTP', 'HTTPS', 'DNS', 'TCP', 'UDP'].slice(0, Math.floor(Math.random() * 3) + 1),
          ports: [80, 443, 53, 25, 22, 3389].slice(0, Math.floor(Math.random() * 3) + 1),
          duration: Math.floor(Math.random() * 86400), // seconds
          firstSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          isActive: Math.random() > 0.3,
          confidence: Math.floor(Math.random() * 40) + 60,
          campaigns: [`Campaign-${Math.floor(Math.random() * 20)}`],
          actors: [`APT-${Math.floor(Math.random() * 50)}`]
        });
      }
    }

    // Generate geographic clusters
    const clusters: GeographicCluster[] = [
      {
        id: 'cluster-asia-pacific',
        name: 'Asia-Pacific Cluster',
        center: [35, 120],
        radius: 2000,
        locations: locations.filter(l => l.region === 'Asia-Pacific').map(l => l.id),
        totalThreats: locations.filter(l => l.region === 'Asia-Pacific').reduce((sum, l) => sum + l.threatCount, 0),
        dominantType: 'apt',
        avgSeverity: 3.2,
        riskScore: 85,
        characteristics: {
          commonActors: ['APT1', 'APT28', 'Lazarus'],
          commonCampaigns: ['Operation Aurora', 'Lazarus Campaign'],
          commonTechniques: ['T1566', 'T1027', 'T1055'],
          targetedSectors: ['Government', 'Defense', 'Technology']
        },
        color: '#FF6B6B',
        visible: true
      },
      {
        id: 'cluster-europe',
        name: 'European Cluster',
        center: [50, 10],
        radius: 1500,
        locations: locations.filter(l => l.region === 'Europe').map(l => l.id),
        totalThreats: locations.filter(l => l.region === 'Europe').reduce((sum, l) => sum + l.threatCount, 0),
        dominantType: 'ransomware',
        avgSeverity: 2.8,
        riskScore: 72,
        characteristics: {
          commonActors: ['FIN7', 'Carbanak', 'Conti'],
          commonCampaigns: ['Conti Ransomware', 'FIN7 Campaign'],
          commonTechniques: ['T1486', 'T1083', 'T1005'],
          targetedSectors: ['Finance', 'Healthcare', 'Manufacturing']
        },
        color: '#4ECDC4',
        visible: true
      }
    ];

    // Generate heatmap data
    const heatmap: HeatmapData[] = locations.map(location => ({
      country: location.country,
      countryCode: location.countryCode,
      coordinates: location.coordinates,
      value: location.threatCount,
      intensity: Math.min(location.threatCount / 1000, 1),
      color: location.riskScore >= 80 ? theme.palette.error.main :
             location.riskScore >= 60 ? theme.palette.warning.main :
             location.riskScore >= 40 ? theme.palette.info.main :
             theme.palette.success.main,
      details: {
        threats: location.threatCount,
        actors: location.actors.length,
        campaigns: 0, // Would be calculated from actual data
        infrastructure: Object.values(location.infrastructure).reduce((sum, val) => sum + val, 0)
      }
    }));

    return { locations, flows, clusters, heatmap };
  }, [theme]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1800));
        
        const { locations, flows, clusters, heatmap } = generateMockGeoData();
        setThreatLocations(locations);
        setThreatFlows(flows);
        setGeoClusters(clusters);
        setHeatmapData(heatmap);
        
      } catch (err) {
        setError('Failed to load geographic threat data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockGeoData]);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    let filteredLocations = threatLocations;
    let filteredFlows = threatFlows;
    
    // Apply country filter
    if (countryFilter.length > 0) {
      filteredLocations = filteredLocations.filter(loc => 
        countryFilter.includes(loc.countryCode)
      );
      filteredFlows = filteredFlows.filter(flow =>
        countryFilter.includes(flow.source.countryCode) ||
        countryFilter.includes(flow.destination.countryCode)
      );
    }
    
    // Apply threat type filter
    if (threatTypeFilter.length > 0) {
      filteredFlows = filteredFlows.filter(flow =>
        threatTypeFilter.includes(flow.threatType)
      );
    }
    
    // Apply severity filter
    if (severityFilter.length > 0) {
      filteredFlows = filteredFlows.filter(flow =>
        severityFilter.includes(flow.severity)
      );
    }
    
    // Apply risk threshold
    filteredLocations = filteredLocations.filter(loc =>
      loc.riskScore >= riskThreshold[0] && loc.riskScore <= riskThreshold[1]
    );
    
    return { locations: filteredLocations, flows: filteredFlows };
  }, [threatLocations, threatFlows, countryFilter, threatTypeFilter, severityFilter, riskThreshold]);

  // Calculate global statistics
  const globalStats = useMemo(() => {
    const totalThreats = filteredData.locations.reduce((sum, loc) => sum + loc.threatCount, 0);
    const totalFlows = filteredData.flows.length;
    const avgRiskScore = filteredData.locations.length > 0 ?
      Math.round(filteredData.locations.reduce((sum, loc) => sum + loc.riskScore, 0) / filteredData.locations.length) : 0;
    const highRiskCountries = filteredData.locations.filter(loc => loc.riskScore >= 80).length;
    const activeClusters = geoClusters.filter(cluster => cluster.visible).length;
    const activeFlows = filteredData.flows.filter(flow => flow.isActive).length;
    
    return {
      totalThreats,
      totalFlows,
      avgRiskScore,
      highRiskCountries,
      activeClusters,
      activeFlows
    };
  }, [filteredData, geoClusters]);

  // Draw map visualization
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    const container = mapContainerRef.current;
    
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw world map background (simplified)
    ctx.fillStyle = alpha(theme.palette.primary.main, 0.1);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw threat locations
    filteredData.locations.forEach(location => {
      const [lat, lng] = location.coordinates;
      
      // Convert lat/lng to canvas coordinates (simplified projection)
      const x = ((lng + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;
      
      // Determine size and color based on threat data
      const size = Math.max(5, Math.min(30, location.threatCount / 100));
      const color = location.riskScore >= 80 ? theme.palette.error.main :
                   location.riskScore >= 60 ? theme.palette.warning.main :
                   location.riskScore >= 40 ? theme.palette.info.main :
                   theme.palette.success.main;
      
      // Draw location marker
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw border if selected
      if (selectedLocation?.id === location.id) {
        ctx.strokeStyle = theme.palette.secondary.main;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      
      // Draw label if enabled
      if (mapSettings.labels && size > 10) {
        ctx.fillStyle = theme.palette.text.primary;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(location.countryCode, x, y + size + 15);
      }
    });
    
    // Draw threat flows
    if (mapSettings.flows) {
      filteredData.flows.forEach(flow => {
        const [sourceLat, sourceLng] = flow.source.coordinates;
        const [destLat, destLng] = flow.destination.coordinates;
        
        const sourceX = ((sourceLng + 180) / 360) * canvas.width;
        const sourceY = ((90 - sourceLat) / 180) * canvas.height;
        const destX = ((destLng + 180) / 360) * canvas.width;
        const destY = ((90 - destLat) / 180) * canvas.height;
        
        // Flow color and thickness based on severity and volume
        const flowColor = flow.severity === 'critical' ? theme.palette.error.main :
                         flow.severity === 'high' ? theme.palette.warning.main :
                         flow.severity === 'medium' ? theme.palette.info.main :
                         theme.palette.success.main;
        
        const thickness = Math.max(1, Math.min(5, flow.volume / 100));
        
        // Draw flow line
        ctx.strokeStyle = alpha(flowColor, 0.6);
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(destX, destY);
        ctx.stroke();
        
        // Draw arrow head
        const angle = Math.atan2(destY - sourceY, destX - sourceX);
        const arrowLength = 10;
        const arrowAngle = Math.PI / 6;
        
        ctx.save();
        ctx.translate(destX, destY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-arrowLength, -arrowLength * Math.tan(arrowAngle));
        ctx.lineTo(-arrowLength, arrowLength * Math.tan(arrowAngle));
        ctx.closePath();
        ctx.fillStyle = flowColor;
        ctx.fill();
        ctx.restore();
      });
    }
    
    // Draw clusters
    if (mapSettings.clustering) {
      geoClusters.filter(cluster => cluster.visible).forEach(cluster => {
        const [lat, lng] = cluster.center;
        const x = ((lng + 180) / 360) * canvas.width;
        const y = ((90 - lat) / 180) * canvas.height;
        const radius = cluster.radius / 20; // Scale for display
        
        // Draw cluster circle
        ctx.strokeStyle = alpha(cluster.color, 0.6);
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw cluster label
        if (mapSettings.labels) {
          ctx.fillStyle = cluster.color;
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(cluster.name, x, y - radius - 10);
        }
      });
    }
  }, [filteredData, mapSettings, selectedLocation, theme, geoClusters]);

  // Redraw map when dependencies change
  useEffect(() => {
    drawMap();
  }, [drawMap]);

  // Handle map click
  const handleMapClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert canvas coordinates back to lat/lng
    const lng = (x / canvas.width) * 360 - 180;
    const lat = 90 - (y / canvas.height) * 180;
    
    // Find clicked location
    const clickedLocation = filteredData.locations.find(location => {
      const [locLat, locLng] = location.coordinates;
      const distance = Math.sqrt(
        Math.pow(lat - locLat, 2) + Math.pow(lng - locLng, 2)
      );
      return distance < 5; // 5 degree threshold
    });
    
    if (clickedLocation) {
      setSelectedLocation(clickedLocation);
      setDetailsOpen(true);
    }
  }, [filteredData.locations]);

  // Render statistics panel
  const renderStatsPanel = () => (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Global Threat Statistics
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Total Threats
            </Typography>
            <Typography variant="h5">
              {globalStats.totalThreats.toLocaleString()}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Active Flows
            </Typography>
            <Typography variant="h5">
              {globalStats.activeFlows}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Avg Risk Score
            </Typography>
            <Typography variant="h5" sx={{ color: globalStats.avgRiskScore >= 70 ? 'error.main' : 'success.main' }}>
              {globalStats.avgRiskScore}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              High Risk Countries
            </Typography>
            <Typography variant="h5" color="warning.main">
              {globalStats.highRiskCountries}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  // Render top threats by country
  const renderTopThreats = () => (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Top Threat Sources
      </Typography>
      <List dense>
        {filteredData.locations
          .sort((a, b) => b.threatCount - a.threatCount)
          .slice(0, 10)
          .map((location, index) => (
            <ListItem
              key={location.id}
              button
              onClick={() => {
                setSelectedLocation(location);
                setDetailsOpen(true);
              }}
            >
              <ListItemIcon>
                <Badge badgeContent={index + 1} color="primary">
                  <Flag />
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={location.country}
                secondary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">
                      {location.threatCount.toLocaleString()} threats
                    </Typography>
                    <Chip
                      size="small"
                      label={`Risk: ${location.riskScore}`}
                      sx={{
                        bgcolor: alpha(location.riskScore >= 80 ? theme.palette.error.main : 
                                     location.riskScore >= 60 ? theme.palette.warning.main :
                                     theme.palette.success.main, 0.1),
                        color: location.riskScore >= 80 ? theme.palette.error.main : 
                               location.riskScore >= 60 ? theme.palette.warning.main :
                               theme.palette.success.main
                      }}
                    />
                  </Box>
                }
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
          width: 350,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 350,
            boxSizing: 'border-box',
            position: 'relative'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Threat Landscape Analysis
          </Typography>
          
          {/* Filters */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">Filters & Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Map Type</InputLabel>
                  <Select
                    value={mapSettings.mapType}
                    onChange={(e) => setMapSettings(prev => ({
                      ...prev,
                      mapType: e.target.value as any
                    }))}
                    label="Map Type"
                  >
                    <MenuItem value="political">Political</MenuItem>
                    <MenuItem value="satellite">Satellite</MenuItem>
                    <MenuItem value="terrain">Terrain</MenuItem>
                    <MenuItem value="hybrid">Hybrid</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth size="small">
                  <InputLabel>Overlay</InputLabel>
                  <Select
                    value={mapSettings.overlay}
                    onChange={(e) => setMapSettings(prev => ({
                      ...prev,
                      overlay: e.target.value as any
                    }))}
                    label="Overlay"
                  >
                    <MenuItem value="threats">Threats</MenuItem>
                    <MenuItem value="actors">Actors</MenuItem>
                    <MenuItem value="infrastructure">Infrastructure</MenuItem>
                    <MenuItem value="flows">Flows</MenuItem>
                    <MenuItem value="clusters">Clusters</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth size="small">
                  <InputLabel>Color Scheme</InputLabel>
                  <Select
                    value={mapSettings.colorScheme}
                    onChange={(e) => setMapSettings(prev => ({
                      ...prev,
                      colorScheme: e.target.value as any
                    }))}
                    label="Color Scheme"
                  >
                    <MenuItem value="severity">By Severity</MenuItem>
                    <MenuItem value="type">By Type</MenuItem>
                    <MenuItem value="volume">By Volume</MenuItem>
                    <MenuItem value="risk">By Risk Score</MenuItem>
                  </Select>
                </FormControl>
                
                <Box>
                  <Typography variant="caption" gutterBottom>
                    Risk Score Range: {riskThreshold[0]} - {riskThreshold[1]}
                  </Typography>
                  <Slider
                    value={riskThreshold}
                    onChange={(_, value) => setRiskThreshold(value as number[])}
                    min={0}
                    max={100}
                    step={5}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mapSettings.clustering}
                        onChange={(e) => setMapSettings(prev => ({
                          ...prev,
                          clustering: e.target.checked
                        }))}
                      />
                    }
                    label="Show Clusters"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mapSettings.flows}
                        onChange={(e) => setMapSettings(prev => ({
                          ...prev,
                          flows: e.target.checked
                        }))}
                      />
                    }
                    label="Show Flows"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mapSettings.heatmap}
                        onChange={(e) => setMapSettings(prev => ({
                          ...prev,
                          heatmap: e.target.checked
                        }))}
                      />
                    }
                    label="Heatmap Mode"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mapSettings.labels}
                        onChange={(e) => setMapSettings(prev => ({
                          ...prev,
                          labels: e.target.checked
                        }))}
                      />
                    }
                    label="Show Labels"
                  />
                </FormGroup>
              </Box>
            </AccordionDetails>
          </Accordion>
          
          <Box sx={{ mt: 2 }}>
            {renderStatsPanel()}
          </Box>
          
          <Box sx={{ mt: 2 }}>
            {renderTopThreats()}
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <MenuItemComponent />
            </IconButton>
            
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Interactive Threat Landscape Map
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton
                onClick={() => setMapSettings(prev => ({
                  ...prev,
                  zoomLevel: Math.min(prev.zoomLevel * 1.2, 10)
                }))}
                title="Zoom In"
              >
                <ZoomIn />
              </IconButton>
              
              <IconButton
                onClick={() => setMapSettings(prev => ({
                  ...prev,
                  zoomLevel: Math.max(prev.zoomLevel / 1.2, 0.5)
                }))}
                title="Zoom Out"
              >
                <ZoomOut />
              </IconButton>
              
              <IconButton
                onClick={() => setMapSettings(prev => ({
                  ...prev,
                  zoomLevel: 2,
                  center: [20, 0]
                }))}
                title="Reset View"
              >
                <CenterFocusStrong />
              </IconButton>
              
              <Divider orientation="vertical" flexItem />
              
              <IconButton
                onClick={() => setTimelineMode(!timelineMode)}
                color={timelineMode ? 'primary' : 'default'}
                title="Timeline Mode"
              >
                <TimelineIcon />
              </IconButton>
              
              <IconButton
                onClick={() => setLayersOpen(true)}
                title="Layers"
              >
                <Layers />
              </IconButton>
              
              <IconButton
                onClick={() => setFullscreen(!fullscreen)}
                title="Fullscreen"
              >
                {fullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
              
              <IconButton
                onClick={() => setSettingsOpen(true)}
                title="Settings"
              >
                <Settings />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Map Container */}
        <Box
          ref={mapContainerRef}
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
              onClick={handleMapClick}
              onMouseMove={(e) => {
                // Handle hover effects
                const canvas = canvasRef.current;
                if (!canvas) return;
                
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Find hovered location
                const lng = (x / canvas.width) * 360 - 180;
                const lat = 90 - (y / canvas.height) * 180;
                
                const hoveredLocation = filteredData.locations.find(location => {
                  const [locLat, locLng] = location.coordinates;
                  const distance = Math.sqrt(
                    Math.pow(lat - locLat, 2) + Math.pow(lng - locLng, 2)
                  );
                  return distance < 5;
                });
                
                setHoveredElement(hoveredLocation?.id || null);
              }}
              style={{
                width: '100%',
                height: '100%',
                cursor: 'crosshair'
              }}
            />
          )}
          
          {/* Hover Information */}
          {hoveredElement && (
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
                const location = filteredData.locations.find(l => l.id === hoveredElement);
                if (!location) return null;
                
                return (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {location.country}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {location.region}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <Chip size="small" label={`${location.threatCount} threats`} />
                      <Chip size="small" label={`Risk: ${location.riskScore}`} />
                      <Chip size="small" label={`${location.confidence}% confidence`} />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Infrastructure: {Object.values(location.infrastructure).reduce((sum, val) => sum + val, 0)}
                    </Typography>
                  </Box>
                );
              })()}
            </Paper>
          )}
          
          {/* Timeline Controls */}
          {timelineMode && (
            <Paper
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                p: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                  onClick={() => setIsPlaying(!isPlaying)}
                  color="primary"
                >
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
                
                <IconButton onClick={() => setCurrentTimeframe(0)}>
                  <SkipPrevious />
                </IconButton>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" gutterBottom>
                    Timeline: Day {currentTimeframe + 1} of 30
                  </Typography>
                  <Slider
                    value={currentTimeframe}
                    onChange={(_, value) => setCurrentTimeframe(value as number)}
                    min={0}
                    max={29}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `Day ${value + 1}`}
                  />
                </Box>
                
                <IconButton onClick={() => setCurrentTimeframe(29)}>
                  <SkipNext />
                </IconButton>
                
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Speed</InputLabel>
                  <Select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(e.target.value as number)}
                    label="Speed"
                  >
                    <MenuItem value={0.5}>0.5x</MenuItem>
                    <MenuItem value={1}>1x</MenuItem>
                    <MenuItem value={2}>2x</MenuItem>
                    <MenuItem value={5}>5x</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Location Details Dialog */}
      {selectedLocation && (
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                <LocationOn />
              </Avatar>
              <Box>
                <Typography variant="h5">
                  {selectedLocation.country}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedLocation.region} • Risk Score: {selectedLocation.riskScore}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Threat Overview
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Total Threats
                          </Typography>
                          <Typography variant="h5">
                            {selectedLocation.threatCount.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Risk Score
                          </Typography>
                          <Typography variant="h5" sx={{ color: selectedLocation.riskScore >= 70 ? 'error.main' : 'success.main' }}>
                            {selectedLocation.riskScore}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Severity Breakdown
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          label={`Critical: ${selectedLocation.severityBreakdown.critical}`}
                          color="error"
                        />
                        <Chip
                          size="small"
                          label={`High: ${selectedLocation.severityBreakdown.high}`}
                          color="warning"
                        />
                        <Chip
                          size="small"
                          label={`Medium: ${selectedLocation.severityBreakdown.medium}`}
                          color="info"
                        />
                        <Chip
                          size="small"
                          label={`Low: ${selectedLocation.severityBreakdown.low}`}
                          color="success"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Infrastructure
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><Hub /></ListItemIcon>
                        <ListItemText
                          primary="C2 Servers"
                          secondary={selectedLocation.infrastructure.c2Servers}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><DeviceHub /></ListItemIcon>
                        <ListItemText
                          primary="Botnets"
                          secondary={selectedLocation.infrastructure.botnets}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Security /></ListItemIcon>
                        <ListItemText
                          primary="Phishing Sites"
                          secondary={selectedLocation.infrastructure.phishingSites}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><BugReport /></ListItemIcon>
                        <ListItemText
                          primary="Malware Hosts"
                          secondary={selectedLocation.infrastructure.malwareHosts}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Threat Timeline (Last 30 Days)
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={selectedLocation.timeline}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <YAxis />
                        <RechartsTooltip 
                          labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke={theme.palette.primary.main}
                          fill={alpha(theme.palette.primary.main, 0.3)}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
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
        ariaLabel="Map Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Download />}
          tooltipTitle="Export Map"
          onClick={() => {/* Export map */}}
        />
        <SpeedDialAction
          icon={<Analytics />}
          tooltipTitle="Generate Report"
          onClick={() => {/* Generate report */}}
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

export default InteractiveThreatLandscapeMaps;