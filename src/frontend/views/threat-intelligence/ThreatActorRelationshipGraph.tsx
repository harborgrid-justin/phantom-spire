/**
 * Threat Actor Relationship Graph Component
 * Actor relationship visualization and network analysis
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
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';

import {
  Hub,
  AccountTree,
  Group,
  Link,
  Search,
  FilterList,
  Analytics,
  Assessment,
  Visibility,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  Download,
  Share,
  Refresh,
  ExpandMore,
  CompareArrows,
  Timeline,
  Security,
  Language,
  LocationOn,
  Business,
  Code,
  NetworkCheck,
  Psychology,
  Warning,
  Info,
  CheckCircle,
  Error
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

// Interfaces
interface ThreatActorNode {
  id: string;
  name: string;
  aliases: string[];
  type: 'primary' | 'affiliate' | 'contractor' | 'sponsor' | 'rival' | 'victim';
  sophistication: 'minimal' | 'intermediate' | 'advanced' | 'expert';
  country: string;
  region: string;
  firstSeen: Date;
  lastSeen: Date;
  isActive: boolean;
  riskScore: number;
  position: {
    x: number;
    y: number;
  };
  metadata: {
    campaigns: string[];
    techniques: string[];
    infrastructure: string[];
    malwareFamilies: string[];
  };
}

interface ThreatActorRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'cooperation' | 'competition' | 'hierarchy' | 'supply_chain' | 'infrastructure_sharing' | 'technique_sharing' | 'target_overlap' | 'attribution_conflict';
  strength: number;
  confidence: number;
  firstObserved: Date;
  lastObserved: Date;
  evidence: Array<{
    type: 'infrastructure' | 'malware' | 'ttp' | 'campaign' | 'communication' | 'financial';
    description: string;
    confidence: number;
    source: string;
  }>;
  direction: 'bidirectional' | 'unidirectional';
  status: 'active' | 'historical' | 'suspected' | 'disputed';
}

interface NetworkCluster {
  id: string;
  name: string;
  members: string[];
  type: 'alliance' | 'supply_chain' | 'geographical' | 'tactical' | 'infrastructure';
  coherence: number;
  activity: 'high' | 'medium' | 'low';
  timeframe: [Date, Date];
}

interface RelationshipGraph {
  nodes: ThreatActorNode[];
  relationships: ThreatActorRelationship[];
  clusters: NetworkCluster[];
  metadata: {
    totalActors: number;
    totalRelationships: number;
    averageConnections: number;
    networkDensity: number;
    centralityScores: Record<string, number>;
    influenceScores: Record<string, number>;
  };
}

interface GraphFilter {
  actorType: string;
  relationshipType: string;
  sophistication: string;
  region: string;
  confidence: number;
  strength: number;
  timeRange: string;
  showClusters: boolean;
  layoutAlgorithm: 'force' | 'hierarchical' | 'circular' | 'grid';
}

const ThreatActorRelationshipGraph: React.FC = () => {
  const theme = useTheme();
  
  // Business logic integration
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('threat-intelligence-relationships');

  // State management
  const [graphData, setGraphData] = useState<RelationshipGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<ThreatActorNode | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<ThreatActorRelationship | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<GraphFilter>({
    actorType: 'all',
    relationshipType: 'all',
    sophistication: 'all',
    region: 'all',
    confidence: 60,
    strength: 30,
    timeRange: '1y',
    showClusters: true,
    layoutAlgorithm: 'force'
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'graph' | 'matrix' | 'timeline'>('graph');
  const [selectedCluster, setSelectedCluster] = useState<NetworkCluster | null>(null);

  // Mock data generation
  const generateMockGraphData = useCallback((): RelationshipGraph => {
    const actorTypes: ThreatActorNode['type'][] = ['primary', 'affiliate', 'contractor', 'sponsor', 'rival', 'victim'];
    const sophisticationLevels: ThreatActorNode['sophistication'][] = ['minimal', 'intermediate', 'advanced', 'expert'];
    const relationshipTypes: ThreatActorRelationship['type'][] = [
      'cooperation', 'competition', 'hierarchy', 'supply_chain', 
      'infrastructure_sharing', 'technique_sharing', 'target_overlap', 'attribution_conflict'
    ];
    const countries = ['United States', 'China', 'Russia', 'North Korea', 'Iran', 'Israel', 'United Kingdom', 'Germany'];
    const regions = ['North America', 'East Asia', 'Eastern Europe', 'Middle East', 'Western Europe'];

    // Generate nodes
    const nodes: ThreatActorNode[] = Array.from({ length: 25 }, (_, i) => ({
      id: `actor-${i + 1}`,
      name: `ThreatActor-${i + 1}`,
      aliases: [`TA${i + 1}`, `Group-${i + 1}`],
      type: actorTypes[Math.floor(Math.random() * actorTypes.length)],
      sophistication: sophisticationLevels[Math.floor(Math.random() * sophisticationLevels.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      region: regions[Math.floor(Math.random() * regions.length)],
      firstSeen: new Date(Date.now() - Math.random() * 3 * 365 * 24 * 60 * 60 * 1000),
      lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      isActive: Math.random() > 0.3,
      riskScore: Math.floor(Math.random() * 40) + 60,
      position: {
        x: Math.random() * 800,
        y: Math.random() * 600
      },
      metadata: {
        campaigns: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, idx) => `Campaign-${i}-${idx}`),
        techniques: ['T1566', 'T1027', 'T1055', 'T1083'].slice(0, Math.floor(Math.random() * 4) + 1),
        infrastructure: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, idx) => `infra-${i}-${idx}.com`),
        malwareFamilies: ['Zeus', 'Emotet', 'Ryuk', 'TrickBot'].slice(0, Math.floor(Math.random() * 3) + 1)
      }
    }));

    // Generate relationships
    const relationships: ThreatActorRelationship[] = [];
    const relationshipCount = Math.floor(nodes.length * 1.5);
    
    for (let i = 0; i < relationshipCount; i++) {
      const sourceNode = nodes[Math.floor(Math.random() * nodes.length)];
      let targetNode = nodes[Math.floor(Math.random() * nodes.length)];
      
      // Ensure no self-relationships and no duplicates
      while (targetNode.id === sourceNode.id || 
             relationships.some(r => 
               (r.sourceId === sourceNode.id && r.targetId === targetNode.id) ||
               (r.sourceId === targetNode.id && r.targetId === sourceNode.id)
             )) {
        targetNode = nodes[Math.floor(Math.random() * nodes.length)];
      }

      const relType = relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)];
      
      relationships.push({
        id: `rel-${i + 1}`,
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        type: relType,
        strength: Math.floor(Math.random() * 70) + 30,
        confidence: Math.floor(Math.random() * 40) + 60,
        firstObserved: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastObserved: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        evidence: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, evidenceIdx) => ({
          type: ['infrastructure', 'malware', 'ttp', 'campaign', 'communication', 'financial'][Math.floor(Math.random() * 6)] as any,
          description: `Evidence ${evidenceIdx + 1} for relationship ${i + 1}`,
          confidence: Math.floor(Math.random() * 30) + 70,
          source: ['OSINT', 'Internal Analysis', 'Partner Intel'][Math.floor(Math.random() * 3)]
        })),
        direction: Math.random() > 0.5 ? 'bidirectional' : 'unidirectional',
        status: ['active', 'historical', 'suspected', 'disputed'][Math.floor(Math.random() * 4)] as any
      });
    }

    // Generate clusters
    const clusters: NetworkCluster[] = Array.from({ length: 5 }, (_, i) => {
      const clusterSize = Math.floor(Math.random() * 6) + 3;
      const clusterMembers = nodes.slice(i * 4, i * 4 + clusterSize).map(n => n.id);
      
      return {
        id: `cluster-${i + 1}`,
        name: `Network Cluster ${i + 1}`,
        members: clusterMembers,
        type: ['alliance', 'supply_chain', 'geographical', 'tactical', 'infrastructure'][Math.floor(Math.random() * 5)] as any,
        coherence: Math.floor(Math.random() * 40) + 60,
        activity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
        timeframe: [
          new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        ]
      };
    });

    // Calculate metadata
    const centralityScores: Record<string, number> = {};
    const influenceScores: Record<string, number> = {};
    
    nodes.forEach(node => {
      const connections = relationships.filter(r => r.sourceId === node.id || r.targetId === node.id).length;
      centralityScores[node.id] = connections;
      influenceScores[node.id] = connections * (node.riskScore / 100);
    });

    return {
      nodes,
      relationships,
      clusters,
      metadata: {
        totalActors: nodes.length,
        totalRelationships: relationships.length,
        averageConnections: Math.round(relationships.length * 2 / nodes.length),
        networkDensity: (relationships.length * 2) / (nodes.length * (nodes.length - 1)),
        centralityScores,
        influenceScores
      }
    };
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockGraph = generateMockGraphData();
        setGraphData(mockGraph);
        addUIUXEvaluation('relationship-graph-loaded', 'success', {
          nodeCount: mockGraph.nodes.length,
          relationshipCount: mockGraph.relationships.length,
          loadTime: 1000
        });
      } catch (error) {
        console.error('Error loading relationship graph:', error);
        addNotification('error', 'Failed to load relationship graph data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockGraphData, addNotification]);

  // Filtered data
  const filteredData = useMemo(() => {
    if (!graphData) return null;
    
    let filteredNodes = [...graphData.nodes];
    let filteredRelationships = [...graphData.relationships];

    // Apply search filter
    if (searchTerm) {
      filteredNodes = filteredNodes.filter(node => 
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
        node.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredRelationships = filteredRelationships.filter(rel => 
        nodeIds.has(rel.sourceId) && nodeIds.has(rel.targetId)
      );
    }

    // Apply filters
    if (filters.actorType !== 'all') {
      filteredNodes = filteredNodes.filter(node => node.type === filters.actorType);
    }

    if (filters.relationshipType !== 'all') {
      filteredRelationships = filteredRelationships.filter(rel => rel.type === filters.relationshipType);
    }

    if (filters.sophistication !== 'all') {
      filteredNodes = filteredNodes.filter(node => node.sophistication === filters.sophistication);
    }

    if (filters.region !== 'all') {
      filteredNodes = filteredNodes.filter(node => node.region === filters.region);
    }

    filteredRelationships = filteredRelationships.filter(rel => 
      rel.confidence >= filters.confidence && rel.strength >= filters.strength
    );

    // Filter relationships to only include those between remaining nodes
    const finalNodeIds = new Set(filteredNodes.map(n => n.id));
    filteredRelationships = filteredRelationships.filter(rel => 
      finalNodeIds.has(rel.sourceId) && finalNodeIds.has(rel.targetId)
    );

    return {
      ...graphData,
      nodes: filteredNodes,
      relationships: filteredRelationships
    };
  }, [graphData, searchTerm, filters]);

  // Event handlers
  const handleNodeSelect = (node: ThreatActorNode) => {
    setSelectedNode(node);
    setDetailsOpen(true);
    addUIUXEvaluation('relationship-node-selected', 'interaction', {
      nodeId: node.id,
      nodeType: node.type
    });
  };

  const handleRelationshipSelect = (relationship: ThreatActorRelationship) => {
    setSelectedRelationship(relationship);
    addUIUXEvaluation('relationship-edge-selected', 'interaction', {
      relationshipId: relationship.id,
      relationshipType: relationship.type
    });
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      const newGraph = generateMockGraphData();
      setGraphData(newGraph);
      addNotification('success', 'Relationship graph refreshed');
    } catch (error) {
      addNotification('error', 'Failed to refresh graph data');
    }
  };

  const getNodeColor = (node: ThreatActorNode) => {
    switch (node.type) {
      case 'primary': return theme.palette.error.main;
      case 'affiliate': return theme.palette.warning.main;
      case 'contractor': return theme.palette.info.main;
      case 'sponsor': return theme.palette.secondary.main;
      case 'rival': return theme.palette.primary.main;
      case 'victim': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getRelationshipColor = (relationship: ThreatActorRelationship) => {
    switch (relationship.type) {
      case 'cooperation': return theme.palette.success.main;
      case 'competition': return theme.palette.error.main;
      case 'hierarchy': return theme.palette.primary.main;
      case 'supply_chain': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Hub color="primary" />
          Threat Actor Relationship Graph
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Network analysis and relationship visualization for threat actor ecosystems
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search Actors"
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
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Actor Type</InputLabel>
              <Select
                value={filters.actorType}
                onChange={(e) => setFilters(prev => ({ ...prev, actorType: e.target.value }))}
                label="Actor Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="primary">Primary</MenuItem>
                <MenuItem value="affiliate">Affiliate</MenuItem>
                <MenuItem value="contractor">Contractor</MenuItem>
                <MenuItem value="sponsor">Sponsor</MenuItem>
                <MenuItem value="rival">Rival</MenuItem>
                <MenuItem value="victim">Victim</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Relationship</InputLabel>
              <Select
                value={filters.relationshipType}
                onChange={(e) => setFilters(prev => ({ ...prev, relationshipType: e.target.value }))}
                label="Relationship"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="cooperation">Cooperation</MenuItem>
                <MenuItem value="competition">Competition</MenuItem>
                <MenuItem value="hierarchy">Hierarchy</MenuItem>
                <MenuItem value="supply_chain">Supply Chain</MenuItem>
                <MenuItem value="infrastructure_sharing">Infrastructure</MenuItem>
                <MenuItem value="technique_sharing">Technique</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
            >
              <ToggleButton value="graph">Graph</ToggleButton>
              <ToggleButton value="matrix">Matrix</ToggleButton>
              <ToggleButton value="timeline">Timeline</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefresh}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
              >
                Export
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={3}>
            <Typography variant="caption" gutterBottom display="block">
              Confidence: {filters.confidence}%
            </Typography>
            <Slider
              value={filters.confidence}
              onChange={(_, value) => setFilters(prev => ({ ...prev, confidence: value as number }))}
              min={0}
              max={100}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="caption" gutterBottom display="block">
              Relationship Strength: {filters.strength}%
            </Typography>
            <Slider
              value={filters.strength}
              onChange={(_, value) => setFilters(prev => ({ ...prev, strength: value as number }))}
              min={0}
              max={100}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.showClusters}
                  onChange={(e) => setFilters(prev => ({ ...prev, showClusters: e.target.checked }))}
                />
              }
              label="Show Clusters"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Layout</InputLabel>
              <Select
                value={filters.layoutAlgorithm}
                onChange={(e) => setFilters(prev => ({ ...prev, layoutAlgorithm: e.target.value as any }))}
                label="Layout"
              >
                <MenuItem value="force">Force-Directed</MenuItem>
                <MenuItem value="hierarchical">Hierarchical</MenuItem>
                <MenuItem value="circular">Circular</MenuItem>
                <MenuItem value="grid">Grid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Graph Visualization */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '600px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Network Visualization
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Zoom In">
                    <IconButton size="small"><ZoomIn /></IconButton>
                  </Tooltip>
                  <Tooltip title="Zoom Out">
                    <IconButton size="small"><ZoomOut /></IconButton>
                  </Tooltip>
                  <Tooltip title="Center View">
                    <IconButton size="small"><CenterFocusStrong /></IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {/* Graph Visualization Area */}
              <Box
                sx={{
                  height: '500px',
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Hub sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.5), mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    Interactive Network Graph
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {viewMode === 'graph' && filteredData && `${filteredData.nodes.length} actors, ${filteredData.relationships.length} relationships`}
                    {viewMode === 'matrix' && 'Adjacency matrix view of actor relationships'}
                    {viewMode === 'timeline' && 'Temporal evolution of actor relationships'}
                  </Typography>
                  {filteredData && (
                    <Box sx={{ mt: 2 }}>
                      <Chip label={`Density: ${(filteredData.metadata.networkDensity * 100).toFixed(1)}%`} size="small" sx={{ mr: 1 }} />
                      <Chip label={`Avg Connections: ${filteredData.metadata.averageConnections}`} size="small" sx={{ mr: 1 }} />
                      <Chip label={`${filteredData.clusters.length} clusters`} size="small" />
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Analysis Panel */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '600px' }}>
            <CardContent>
              <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
                <Tab label="Actors" />
                <Tab label="Clusters" />
                <Tab label="Metrics" />
              </Tabs>

              {selectedTab === 0 && filteredData && (
                <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Network Actors ({filteredData.nodes.length})
                  </Typography>
                  <List dense>
                    {filteredData.nodes.slice(0, 20).map(node => {
                      const connections = filteredData.relationships.filter(r => 
                        r.sourceId === node.id || r.targetId === node.id
                      ).length;
                      
                      return (
                        <ListItem
                          key={node.id}
                          button
                          onClick={() => handleNodeSelect(node)}
                          sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                        >
                          <ListItemIcon>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: getNodeColor(node)
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" noWrap>
                                  {node.name}
                                </Typography>
                                <Chip 
                                  label={node.type} 
                                  size="small" 
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  {node.country} • {connections} connections
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Risk: {node.riskScore} • {node.sophistication}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              )}

              {selectedTab === 1 && graphData && (
                <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Network Clusters ({graphData.clusters.length})
                  </Typography>
                  <List dense>
                    {graphData.clusters.map(cluster => (
                      <ListItem
                        key={cluster.id}
                        button
                        onClick={() => setSelectedCluster(cluster)}
                        sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                      >
                        <ListItemIcon>
                          <Group color={cluster.activity === 'high' ? 'error' : cluster.activity === 'medium' ? 'warning' : 'success'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">{cluster.name}</Typography>
                              <Chip 
                                label={cluster.type} 
                                size="small" 
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {cluster.members.length} members • {cluster.activity} activity
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Coherence: {cluster.coherence}%
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {selectedTab === 2 && graphData && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Network Metrics</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {graphData.metadata.totalActors}
                        </Typography>
                        <Typography variant="caption">Total Actors</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="warning">
                          {graphData.metadata.totalRelationships}
                        </Typography>
                        <Typography variant="caption">Relationships</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="info">
                          {graphData.metadata.averageConnections}
                        </Typography>
                        <Typography variant="caption">Avg Connections</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="success">
                          {(graphData.metadata.networkDensity * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="caption">Network Density</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 2 }}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="caption">Top Central Actors</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {Object.entries(graphData.metadata.centralityScores)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5)
                            .map(([actorId, score]) => {
                              const actor = graphData.nodes.find(n => n.id === actorId);
                              return (
                                <ListItem key={actorId}>
                                  <ListItemText
                                    primary={actor?.name || actorId}
                                    secondary={`${score} connections`}
                                  />
                                </ListItem>
                              );
                            })}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Node Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Actor Details
        </DialogTitle>
        <DialogContent>
          {selectedNode && filteredData && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedNode.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={selectedNode.type} color="primary" size="small" />
                  <Chip label={selectedNode.sophistication} variant="outlined" size="small" />
                  <Chip label={selectedNode.isActive ? 'Active' : 'Inactive'} 
                        color={selectedNode.isActive ? 'success' : 'default'} size="small" />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Basic Information</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Aliases" secondary={selectedNode.aliases.join(', ')} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Country" secondary={selectedNode.country} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Region" secondary={selectedNode.region} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Risk Score" secondary={selectedNode.riskScore} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Activity Timeline</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="First Seen" secondary={selectedNode.firstSeen.toLocaleDateString()} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Last Seen" secondary={selectedNode.lastSeen.toLocaleDateString()} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Campaigns" secondary={selectedNode.metadata.campaigns.length} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Techniques" secondary={selectedNode.metadata.techniques.length} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Relationships ({filteredData.relationships.filter(r => 
                    r.sourceId === selectedNode.id || r.targetId === selectedNode.id
                  ).length})
                </Typography>
                <List dense>
                  {filteredData.relationships
                    .filter(r => r.sourceId === selectedNode.id || r.targetId === selectedNode.id)
                    .slice(0, 5)
                    .map(rel => {
                      const otherNodeId = rel.sourceId === selectedNode.id ? rel.targetId : rel.sourceId;
                      const otherNode = filteredData.nodes.find(n => n.id === otherNodeId);
                      return (
                        <ListItem key={rel.id}>
                          <ListItemText
                            primary={`${rel.type} with ${otherNode?.name || otherNodeId}`}
                            secondary={`Strength: ${rel.strength}% • Confidence: ${rel.confidence}%`}
                          />
                        </ListItem>
                      );
                    })}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained">View Full Profile</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThreatActorRelationshipGraph;