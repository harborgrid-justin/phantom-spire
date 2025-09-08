/**
 * Threat Actor TTP Mapping Component
 * Tactics, Techniques, and Procedures mapping and analysis
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
  AccordionDetails,
  Badge,
  LinearProgress,
  TreeView,
  TreeItem
} from '@mui/material';

import {
  AccountTree,
  Security,
  Psychology,
  Code,
  Build,
  Timeline,
  Search,
  FilterList,
  Map,
  Assessment,
  Analytics,
  Warning,  Error as ErrorIcon,
  Info,
  CheckCircle,
  Download,
  Share,
  Refresh,
  ExpandMore,
  ChevronRight,
  Visibility,
  CompareArrows,
  Hub,
  DataUsage,
  Category,
  Assignment,
  TrendingUp,
  Group,
  Link
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

// Interfaces
interface MITRETactic {
  id: string;
  name: string;
  description: string;
  techniques: MITRETechnique[];
}

interface MITRETechnique {
  id: string;
  name: string;
  description: string;
  tactics: string[];
  platforms: string[];
  dataSource: string[];
  defenses: string[];
  detections: string[];
  subTechniques: MITRESubTechnique[];
  usage: {
    frequency: number;
    firstSeen: Date;
    lastSeen: Date;
    campaigns: string[];
  };
}

interface MITRESubTechnique {
  id: string;
  name: string;
  description: string;
  parentTechnique: string;
  platforms: string[];
  usage: {
    frequency: number;
    examples: string[];
  };
}

interface ThreatActorTTPProfile {
  id: string;
  name: string;
  aliases: string[];
  tactics: Array<{
    tactic: MITRETactic;
    proficiency: 'novice' | 'intermediate' | 'advanced' | 'expert';
    usage: {
      frequency: number;
      campaigns: string[];
      evolution: 'increasing' | 'decreasing' | 'stable';
    };
  }>;
  techniques: Array<{
    technique: MITRETechnique;
    proficiency: 'novice' | 'intermediate' | 'advanced' | 'expert';
    usage: {
      frequency: number;
      campaigns: string[];
      evolution: 'increasing' | 'decreasing' | 'stable';
      variants: string[];
    };
  }>;
  procedures: Array<{
    id: string;
    name: string;
    description: string;
    techniques: string[];
    campaigns: string[];
    effectiveness: number;
    complexity: 'low' | 'medium' | 'high';
  }>;
  evolution: {
    tacticTrends: Array<{
      tactic: string;
      trend: 'adopting' | 'abandoning' | 'improving';
      timeframe: string;
    }>;
    sophisticationLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
    adaptability: number;
    innovation: number;
  };
  similarities: Array<{
    actorId: string;
    actorName: string;
    similarity: number;
    sharedTechniques: string[];
    sharedTactics: string[];
  }>;
  coverage: {
    totalTactics: number;
    coveredTactics: number;
    totalTechniques: number;
    coveredTechniques: number;
    completeness: number;
  };
}

interface TTPFilter {
  actor: string;
  tactic: string;
  platform: string;
  proficiency: string;
  evolution: string;
  similarity: number;
}

const ThreatActorTTPMapping: React.FC = () => {
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
  } = useServicePage('threat-intelligence-ttp');

  // State management
  const [actors, setActors] = useState<ThreatActorTTPProfile[]>([]);
  const [selectedActor, setSelectedActor] = useState<ThreatActorTTPProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<TTPFilter>({
    actor: 'all',
    tactic: 'all',
    platform: 'all',
    proficiency: 'all',
    evolution: 'all',
    similarity: 70
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<MITRETechnique | null>(null);
  const [viewMode, setViewMode] = useState<'matrix' | 'tree' | 'timeline'>('matrix');
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

  // Mock MITRE data
  const mitreTactics: MITRETactic[] = [
    {
      id: 'TA0001',
      name: 'Initial Access',
      description: 'Trying to get into your network',
      techniques: []
    },
    {
      id: 'TA0002',
      name: 'Execution',
      description: 'Trying to run malicious code',
      techniques: []
    },
    {
      id: 'TA0003',
      name: 'Persistence',
      description: 'Trying to maintain their foothold',
      techniques: []
    },
    {
      id: 'TA0004',
      name: 'Privilege Escalation',
      description: 'Trying to gain higher-level permissions',
      techniques: []
    },
    {
      id: 'TA0005',
      name: 'Defense Evasion',
      description: 'Trying to avoid being detected',
      techniques: []
    },
    {
      id: 'TA0006',
      name: 'Credential Access',
      description: 'Trying to steal account credentials',
      techniques: []
    },
    {
      id: 'TA0007',
      name: 'Discovery',
      description: 'Trying to figure out your environment',
      techniques: []
    },
    {
      id: 'TA0008',
      name: 'Lateral Movement',
      description: 'Trying to move through your environment',
      techniques: []
    },
    {
      id: 'TA0009',
      name: 'Collection',
      description: 'Trying to gather data of interest',
      techniques: []
    },
    {
      id: 'TA0010',
      name: 'Exfiltration',
      description: 'Trying to steal data',
      techniques: []
    },
    {
      id: 'TA0011',
      name: 'Impact',
      description: 'Trying to manipulate, interrupt, or destroy systems',
      techniques: []
    }
  ];

  // Mock data generation
  const generateMockTTPProfiles = useCallback((): ThreatActorTTPProfile[] => {
    const actors: ThreatActorTTPProfile[] = [];
    const proficiencyLevels: Array<'novice' | 'intermediate' | 'advanced' | 'expert'> = ['novice', 'intermediate', 'advanced', 'expert'];
    const platforms = ['Windows', 'macOS', 'Linux', 'Network', 'Cloud'];

    for (let i = 1; i <= 12; i++) {
      const actorTactics = mitreTactics.slice(0, Math.floor(Math.random() * 8) + 4).map(tactic => ({
        tactic,
        proficiency: proficiencyLevels[Math.floor(Math.random() * proficiencyLevels.length)],
        usage: {
          frequency: Math.floor(Math.random() * 100),
          campaigns: [`Campaign-${i}-A`, `Campaign-${i}-B`],
          evolution: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as 'increasing' | 'decreasing' | 'stable'
        }
      }));

      const techniques = Array.from({ length: Math.floor(Math.random() * 20) + 10 }, (_, idx) => {
        const technique: MITRETechnique = {
          id: `T${1000 + idx}`,
          name: `Technique ${i}-${idx}`,
          description: `MITRE ATT&CK technique ${i}-${idx} description`,
          tactics: [mitreTactics[Math.floor(Math.random() * mitreTactics.length)].id],
          platforms: platforms.slice(0, Math.floor(Math.random() * 3) + 1),
          dataSource: ['Process monitoring', 'Network traffic', 'File monitoring'],
          defenses: ['Application control', 'Endpoint protection'],
          detections: ['Behavior analysis', 'Signature detection'],
          subTechniques: [],
          usage: {
            frequency: Math.floor(Math.random() * 100),
            firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
            lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            campaigns: [`Campaign-${i}-A`]
          }
        };

        return {
          technique,
          proficiency: proficiencyLevels[Math.floor(Math.random() * proficiencyLevels.length)],
          usage: {
            frequency: Math.floor(Math.random() * 100),
            campaigns: [`Campaign-${i}-A`, `Campaign-${i}-B`],
            evolution: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as 'increasing' | 'decreasing' | 'stable',
            variants: [`Variant-${idx}-A`, `Variant-${idx}-B`]
          }
        };
      });

      const procedures = Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, idx) => ({
        id: `procedure-${i}-${idx}`,
        name: `Procedure ${i}-${idx}`,
        description: `Custom procedure used by threat actor ${i}`,
        techniques: techniques.slice(0, 3).map(t => t.technique.id),
        campaigns: [`Campaign-${i}-A`],
        effectiveness: Math.floor(Math.random() * 40) + 60,
        complexity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
      }));

      actors.push({
        id: `ttp-actor-${i}`,
        name: `TTPActor-${i}`,
        aliases: [`TA-${i}`, `Group-${i}`],
        tactics: actorTactics,
        techniques,
        procedures,
        evolution: {
          tacticTrends: [
            {
              tactic: mitreTactics[0].name,
              trend: 'adopting',
              timeframe: 'Last 6 months'
            },
            {
              tactic: mitreTactics[1].name,
              trend: 'improving',
              timeframe: 'Last 3 months'
            }
          ],
          sophisticationLevel: ['basic', 'intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 4)] as 'basic' | 'intermediate' | 'advanced' | 'expert',
          adaptability: Math.floor(Math.random() * 40) + 60,
          innovation: Math.floor(Math.random() * 40) + 40
        },
        similarities: actors.slice(0, Math.min(actors.length, 3)).map(actor => ({
          actorId: actor.id,
          actorName: actor.name,
          similarity: Math.floor(Math.random() * 40) + 60,
          sharedTechniques: ['T1566', 'T1027'],
          sharedTactics: ['TA0001', 'TA0002']
        })),
        coverage: {
          totalTactics: mitreTactics.length,
          coveredTactics: actorTactics.length,
          totalTechniques: 100,
          coveredTechniques: techniques.length,
          completeness: Math.floor((actorTactics.length / mitreTactics.length) * 100)
        }
      });
    }

    return actors.sort((a, b) => b.coverage.completeness - a.coverage.completeness);
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockProfiles = generateMockTTPProfiles();
        setActors(mockProfiles);
        setSelectedActor(mockProfiles[0]);
        addUIUXEvaluation('ttp-mapping-loaded', 'success', {
          actorCount: mockProfiles.length,
          loadTime: 1000
        });
      } catch (error) {
        console.error('Error loading TTP data:', error);
        addNotification('error', 'Failed to load TTP mapping data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockTTPProfiles, addNotification]);

  // Filtered techniques
  const filteredTechniques = useMemo(() => {
    if (!selectedActor) return [];
    
    return selectedActor.techniques.filter(tech => {
      if (searchTerm && !tech.technique.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !tech.technique.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      if (filters.tactic !== 'all' && !tech.technique.tactics.includes(filters.tactic)) {
        return false;
      }
      
      if (filters.platform !== 'all' && !tech.technique.platforms.includes(filters.platform)) {
        return false;
      }
      
      if (filters.proficiency !== 'all' && tech.proficiency !== filters.proficiency) {
        return false;
      }
      
      if (filters.evolution !== 'all' && tech.usage.evolution !== filters.evolution) {
        return false;
      }
      
      return true;
    });
  }, [selectedActor, searchTerm, filters]);

  // Event handlers
  const handleActorSelect = (actor: ThreatActorTTPProfile) => {
    setSelectedActor(actor);
    addUIUXEvaluation('ttp-actor-selected', 'interaction', {
      actorId: actor.id,
      techniqueCount: actor.techniques.length
    });
  };

  const handleTechniqueSelect = (technique: MITRETechnique) => {
    setSelectedTechnique(technique);
    setDetailsOpen(true);
    addUIUXEvaluation('ttp-technique-selected', 'interaction', {
      techniqueId: technique.id,
      techniqueName: technique.name
    });
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      const newProfiles = generateMockTTPProfiles();
      setActors(newProfiles);
      setSelectedActor(newProfiles[0]);
      addNotification('success', 'TTP mapping data refreshed');
    } catch (error) {
      addNotification('error', 'Failed to refresh data');
    }
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'expert': return 'error';
      case 'advanced': return 'warning';
      case 'intermediate': return 'info';
      case 'novice': return 'success';
      default: return 'default';
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
          <AccountTree color="primary" />
          Threat Actor TTP Mapping
        </Typography>
        <Typography variant="body1" color="textSecondary">
          MITRE ATT&CK framework mapping for tactics, techniques, and procedures analysis
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search Techniques"
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
              <InputLabel>Actor</InputLabel>
              <Select
                value={selectedActor?.id || ''}
                onChange={(e) => {
                  const actor = actors.find(a => a.id === e.target.value);
                  if (actor) handleActorSelect(actor);
                }}
                label="Actor"
              >
                {actors.map(actor => (
                  <MenuItem key={actor.id} value={actor.id}>
                    {actor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Tactic</InputLabel>
              <Select
                value={filters.tactic}
                onChange={(e) => setFilters(prev => ({ ...prev, tactic: e.target.value }))}
                label="Tactic"
              >
                <MenuItem value="all">All Tactics</MenuItem>
                {mitreTactics.map(tactic => (
                  <MenuItem key={tactic.id} value={tactic.id}>
                    {tactic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Proficiency</InputLabel>
              <Select
                value={filters.proficiency}
                onChange={(e) => setFilters(prev => ({ ...prev, proficiency: e.target.value }))}
                label="Proficiency"
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="expert">Expert</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="novice">Novice</MenuItem>
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
        {/* TTP Matrix/Visualization */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '600px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {selectedActor?.name} - TTP Matrix
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={viewMode === 'matrix' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setViewMode('matrix')}
                  >
                    Matrix
                  </Button>
                  <Button
                    variant={viewMode === 'tree' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setViewMode('tree')}
                  >
                    Tree
                  </Button>
                  <Button
                    variant={viewMode === 'timeline' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setViewMode('timeline')}
                  >
                    Timeline
                  </Button>
                </Box>
              </Box>
              
              {/* MITRE ATT&CK Matrix Visualization */}
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
                  <AccountTree sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.5), mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    MITRE ATT&CK Matrix Visualization
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {viewMode === 'matrix' && `Interactive matrix showing ${filteredTechniques.length} techniques`}
                    {viewMode === 'tree' && 'Hierarchical view of tactics and techniques'}
                    {viewMode === 'timeline' && 'Timeline evolution of TTP adoption'}
                  </Typography>
                  {selectedActor && (
                    <Box sx={{ mt: 2 }}>
                      <Chip label={`${selectedActor.coverage.coveredTactics}/${selectedActor.coverage.totalTactics} tactics`} size="small" sx={{ mr: 1 }} />
                      <Chip label={`${selectedActor.techniques.length} techniques`} size="small" sx={{ mr: 1 }} />
                      <Chip label={`${selectedActor.coverage.completeness}% coverage`} size="small" />
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
                <Tab label="Techniques" />
                <Tab label="Tactics" />
                <Tab label="Evolution" />
              </Tabs>

              {selectedTab === 0 && (
                <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Techniques ({filteredTechniques.length})
                  </Typography>
                  <List dense>
                    {filteredTechniques.slice(0, 15).map(techUsage => (
                      <ListItem
                        key={techUsage.technique.id}
                        button
                        onClick={() => handleTechniqueSelect(techUsage.technique)}
                        sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                      >
                        <ListItemIcon>
                          <Code color={getProficiencyColor(techUsage.proficiency)} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">{techUsage.technique.name}</Typography>
                              <Chip 
                                label={techUsage.proficiency} 
                                size="small" 
                                color={getProficiencyColor(techUsage.proficiency)}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                ID: {techUsage.technique.id}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={techUsage.usage.frequency} 
                                  sx={{ flexGrow: 1, height: 4 }}
                                />
                                <Typography variant="caption">
                                  {techUsage.usage.frequency}%
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {selectedTab === 1 && selectedActor && (
                <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tactics Coverage ({selectedActor.tactics.length}/{mitreTactics.length})
                  </Typography>
                  <List dense>
                    {selectedActor.tactics.map(tacticUsage => (
                      <ListItem key={tacticUsage.tactic.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                        <ListItemIcon>
                          <Security color={getProficiencyColor(tacticUsage.proficiency)} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">{tacticUsage.tactic.name}</Typography>
                              <Chip 
                                label={tacticUsage.proficiency} 
                                size="small" 
                                color={getProficiencyColor(tacticUsage.proficiency)}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {tacticUsage.tactic.description}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={tacticUsage.usage.frequency} 
                                  sx={{ flexGrow: 1, height: 4 }}
                                />
                                <Typography variant="caption">
                                  {tacticUsage.usage.frequency}%
                                </Typography>
                                {tacticUsage.usage.evolution === 'increasing' && <TrendingUp color="success" fontSize="small" />}
                                {tacticUsage.usage.evolution === 'decreasing' && <TrendingUp color="error" fontSize="small" sx={{ transform: 'rotate(180deg)' }} />}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {selectedTab === 2 && selectedActor && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Evolution Analysis</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="caption">Sophistication Level</Typography>
                        <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                          {selectedActor.evolution.sophisticationLevel}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {selectedActor.evolution.adaptability}
                        </Typography>
                        <Typography variant="caption">Adaptability</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="warning">
                          {selectedActor.evolution.innovation}
                        </Typography>
                        <Typography variant="caption">Innovation</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="caption">Tactic Trends</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List dense>
                            {selectedActor.evolution.tacticTrends.map((trend, idx) => (
                              <ListItem key={idx}>
                                <ListItemText
                                  primary={trend.tactic}
                                  secondary={`${trend.trend} (${trend.timeframe})`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                    <Grid item xs={12}>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="caption">Similar Actors</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List dense>
                            {selectedActor.similarities.map((sim, idx) => (
                              <ListItem key={idx}>
                                <ListItemText
                                  primary={sim.actorName}
                                  secondary={`${sim.similarity}% similarity • ${sim.sharedTechniques.length} shared techniques`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Technique Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Technique Details
        </DialogTitle>
        <DialogContent>
          {selectedTechnique && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedTechnique.name} ({selectedTechnique.id})
                </Typography>
                <Typography variant="body2" paragraph>
                  {selectedTechnique.description}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Technical Details</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Tactics" secondary={selectedTechnique.tactics.join(', ')} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Platforms" secondary={selectedTechnique.platforms.join(', ')} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Data Sources" secondary={selectedTechnique.dataSource.join(', ')} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Detection & Mitigation</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Defenses" secondary={selectedTechnique.defenses.join(', ')} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Detections" secondary={selectedTechnique.detections.join(', ')} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Usage Frequency" secondary={`${selectedTechnique.usage.frequency}%`} />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained">View MITRE Page</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThreatActorTTPMapping;