/**
 * Threat Actor Geospatial Mapping Component
 * Advanced geographic threat actor mapping and visualization
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';

import {
  Map,
  LocationOn,
  Public,
  Search,
  FilterList,
  Layers,
  Timeline,
  Assessment,
  TrendingUp,
  Security,
  Warning,
  Info,
  Download,
  Share,
  Refresh,
  ExpandMore,
  Visibility,
  ZoomIn,
  ZoomOut,
  MyLocation,
  Place,
  Language,
  Business,
  Group,
  Analytics
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

// Interfaces
interface GeospatialThreatActor {
  id: string;
  name: string;
  aliases: string[];
  primaryLocation: {
    country: string;
    region: string;
    coordinates: [number, number];
    confidence: number;
  };
  operationalRegions: Array<{
    country: string;
    region: string;
    activityLevel: 'high' | 'medium' | 'low';
    firstSeen: Date;
    lastSeen: Date;
    targetCount: number;
  }>;
  attribution: {
    confidence: number;
    sources: string[];
    methods: string[];
  };
  campaigns: Array<{
    id: string;
    name: string;
    region: string;
    targets: number;
    timeline: [Date, Date];
  }>;
  infrastructure: Array<{
    type: 'c2' | 'hosting' | 'domain' | 'ip';
    value: string;
    location: string;
    confidence: number;
    firstSeen: Date;
    lastSeen: Date;
  }>;
  sophistication: 'minimal' | 'intermediate' | 'advanced' | 'expert';
  riskScore: number;
  lastUpdated: Date;
}

interface GeospatialFilter {
  region: string;
  sophistication: string;
  activityLevel: string;
  timeRange: string;
  actorType: string;
}

interface MapLayer {
  id: string;
  name: string;
  type: 'actors' | 'campaigns' | 'infrastructure' | 'targets';
  visible: boolean;
  opacity: number;
}

const ThreatActorGeospatialMapping: React.FC = () => {
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
  } = useServicePage('threat-intelligence-geospatial');

  // State management
  const [actors, setActors] = useState<GeospatialThreatActor[]>([]);
  const [selectedActor, setSelectedActor] = useState<GeospatialThreatActor | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<GeospatialFilter>({
    region: 'all',
    sophistication: 'all',
    activityLevel: 'all',
    timeRange: '1y',
    actorType: 'all'
  });
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    { id: 'actors', name: 'Threat Actors', type: 'actors', visible: true, opacity: 1 },
    { id: 'campaigns', name: 'Campaigns', type: 'campaigns', visible: true, opacity: 0.8 },
    { id: 'infrastructure', name: 'Infrastructure', type: 'infrastructure', visible: false, opacity: 0.6 },
    { id: 'targets', name: 'Targets', type: 'targets', visible: false, opacity: 0.7 }
  ]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [mapMode, setMapMode] = useState<'heat' | 'markers' | 'clusters'>('markers');

  // Mock data generation
  const generateMockActors = useCallback((): GeospatialThreatActor[] => {
    const countries = [
      'United States', 'China', 'Russia', 'North Korea', 'Iran', 'Israel',
      'United Kingdom', 'Germany', 'France', 'Brazil', 'India', 'Japan'
    ];
    
    const regions = [
      'North America', 'East Asia', 'Eastern Europe', 'Middle East',
      'Western Europe', 'South America', 'South Asia', 'Southeast Asia'
    ];

    const actors: GeospatialThreatActor[] = [];

    for (let i = 1; i <= 25; i++) {
      const primaryCountry = countries[Math.floor(Math.random() * countries.length)];
      const primaryRegion = regions[Math.floor(Math.random() * regions.length)];
      
      actors.push({
        id: `geo-actor-${i}`,
        name: `GeoThreat-${i}`,
        aliases: [`Alias-${i}-A`, `Alias-${i}-B`],
        primaryLocation: {
          country: primaryCountry,
          region: primaryRegion,
          coordinates: [
            -180 + Math.random() * 360,
            -90 + Math.random() * 180
          ],
          confidence: Math.floor(Math.random() * 30) + 70
        },
        operationalRegions: regions.slice(0, Math.floor(Math.random() * 4) + 1).map(region => ({
          country: countries[Math.floor(Math.random() * countries.length)],
          region,
          activityLevel: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
          firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          targetCount: Math.floor(Math.random() * 50) + 5
        })),
        attribution: {
          confidence: Math.floor(Math.random() * 40) + 60,
          sources: ['OSINT', 'Internal Analysis', 'Partner Sharing'],
          methods: ['Infrastructure Analysis', 'TTPs Correlation', 'Code Similarity']
        },
        campaigns: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, idx) => ({
          id: `campaign-${i}-${idx}`,
          name: `Campaign ${i}-${idx}`,
          region: regions[Math.floor(Math.random() * regions.length)],
          targets: Math.floor(Math.random() * 20) + 3,
          timeline: [
            new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
            new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          ]
        })),
        infrastructure: Array.from({ length: Math.floor(Math.random() * 8) + 2 }, (_, idx) => ({
          type: ['c2', 'hosting', 'domain', 'ip'][Math.floor(Math.random() * 4)] as 'c2' | 'hosting' | 'domain' | 'ip',
          value: `infrastructure-${i}-${idx}.example.com`,
          location: countries[Math.floor(Math.random() * countries.length)],
          confidence: Math.floor(Math.random() * 30) + 70,
          firstSeen: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        })),
        sophistication: ['minimal', 'intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 4)] as 'minimal' | 'intermediate' | 'advanced' | 'expert',
        riskScore: Math.floor(Math.random() * 40) + 60,
        lastUpdated: new Date()
      });
    }

    return actors.sort((a, b) => b.riskScore - a.riskScore);
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockActors = generateMockActors();
        setActors(mockActors);
        addUIUXEvaluation('geospatial-mapping-loaded', 'success', {
          actorCount: mockActors.length,
          loadTime: 1000
        });
      } catch (error) {
        console.error('Error loading geospatial data:', error);
        addNotification('error', 'Failed to load geospatial threat data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockActors, addNotification]);

  // Filtered actors
  const filteredActors = useMemo(() => {
    return actors.filter(actor => {
      if (searchTerm && !actor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !actor.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      
      if (filters.region !== 'all' && actor.primaryLocation.region !== filters.region) {
        return false;
      }
      
      if (filters.sophistication !== 'all' && actor.sophistication !== filters.sophistication) {
        return false;
      }
      
      return true;
    });
  }, [actors, searchTerm, filters]);

  // Event handlers
  const handleLayerToggle = (layerId: string) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const handleLayerOpacityChange = (layerId: string, opacity: number) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    ));
  };

  const handleActorSelect = (actor: GeospatialThreatActor) => {
    setSelectedActor(actor);
    setDetailsOpen(true);
    addUIUXEvaluation('geospatial-actor-selected', 'interaction', {
      actorId: actor.id,
      riskScore: actor.riskScore
    });
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      const newActors = generateMockActors();
      setActors(newActors);
      addNotification('success', 'Geospatial data refreshed');
    } catch (error) {
      addNotification('error', 'Failed to refresh data');
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
          <Map color="primary" />
          Threat Actor Geospatial Mapping
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Interactive geographic visualization of threat actor locations, operations, and infrastructure
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
              <InputLabel>Region</InputLabel>
              <Select
                value={filters.region}
                onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                label="Region"
              >
                <MenuItem value="all">All Regions</MenuItem>
                <MenuItem value="North America">North America</MenuItem>
                <MenuItem value="Europe">Europe</MenuItem>
                <MenuItem value="Asia">Asia</MenuItem>
                <MenuItem value="Middle East">Middle East</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sophistication</InputLabel>
              <Select
                value={filters.sophistication}
                onChange={(e) => setFilters(prev => ({ ...prev, sophistication: e.target.value }))}
                label="Sophistication"
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="expert">Expert</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="minimal">Minimal</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Map Mode</InputLabel>
              <Select
                value={mapMode}
                onChange={(e) => setMapMode(e.target.value as 'heat' | 'markers' | 'clusters')}
                label="Map Mode"
              >
                <MenuItem value="markers">Markers</MenuItem>
                <MenuItem value="clusters">Clusters</MenuItem>
                <MenuItem value="heat">Heat Map</MenuItem>
              </Select>
            </FormControl>
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
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Map Area */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '600px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Geographic Distribution</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small"><ZoomIn /></IconButton>
                  <IconButton size="small"><ZoomOut /></IconButton>
                  <IconButton size="small"><MyLocation /></IconButton>
                </Box>
              </Box>
              
              {/* Map Placeholder */}
              <Box
                sx={{
                  height: '500px',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Map sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.5), mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    Interactive Map Visualization
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Showing {filteredActors.length} threat actors across {new Set(filteredActors.map(a => a.primaryLocation.region)).size} regions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Controls Panel */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '600px' }}>
            <CardContent>
              <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
                <Tab label="Layers" />
                <Tab label="Actors" />
                <Tab label="Stats" />
              </Tabs>

              {selectedTab === 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Map Layers</Typography>
                  {mapLayers.map(layer => (
                    <Box key={layer.id} sx={{ mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={layer.visible}
                            onChange={() => handleLayerToggle(layer.id)}
                          />
                        }
                        label={layer.name}
                      />
                      {layer.visible && (
                        <Box sx={{ ml: 4, mt: 1 }}>
                          <Typography variant="caption">Opacity: {Math.round(layer.opacity * 100)}%</Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}

              {selectedTab === 1 && (
                <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Threat Actors ({filteredActors.length})
                  </Typography>
                  <List dense>
                    {filteredActors.slice(0, 20).map(actor => (
                      <ListItem
                        key={actor.id}
                        button
                        onClick={() => handleActorSelect(actor)}
                        sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                      >
                        <ListItemIcon>
                          <Place color={actor.riskScore > 80 ? 'error' : actor.riskScore > 60 ? 'warning' : 'success'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={actor.name}
                          secondary={`${actor.primaryLocation.country} • Risk: ${actor.riskScore}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {selectedTab === 2 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Regional Statistics</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {new Set(filteredActors.map(a => a.primaryLocation.region)).size}
                        </Typography>
                        <Typography variant="caption">Regions</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="error">
                          {filteredActors.filter(a => a.riskScore > 80).length}
                        </Typography>
                        <Typography variant="caption">High Risk</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="warning">
                          {filteredActors.reduce((sum, a) => sum + a.campaigns.length, 0)}
                        </Typography>
                        <Typography variant="caption">Campaigns</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="info">
                          {filteredActors.reduce((sum, a) => sum + a.infrastructure.length, 0)}
                        </Typography>
                        <Typography variant="caption">Infrastructure</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actor Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedActor?.name} - Geospatial Profile
        </DialogTitle>
        <DialogContent>
          {selectedActor && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Primary Location</Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip label={selectedActor.primaryLocation.country} color="primary" size="small" />
                  <Chip label={selectedActor.primaryLocation.region} variant="outlined" size="small" sx={{ ml: 1 }} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Confidence: {selectedActor.primaryLocation.confidence}%
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Operational Regions</Typography>
                <List dense>
                  {selectedActor.operationalRegions.slice(0, 3).map((region, idx) => (
                    <ListItem key={idx}>
                      <ListItemText
                        primary={region.region}
                        secondary={`${region.activityLevel} activity • ${region.targetCount} targets`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>Infrastructure Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Confidence</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedActor.infrastructure.slice(0, 5).map((infra, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{infra.type}</TableCell>
                              <TableCell>{infra.value}</TableCell>
                              <TableCell>{infra.location}</TableCell>
                              <TableCell>{infra.confidence}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
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

export default ThreatActorGeospatialMapping;