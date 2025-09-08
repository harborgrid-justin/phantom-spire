/**
 * Threat Actor Profiling and Attribution System
 * Advanced threat actor analysis competing with Anomali ThreatStream
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Snackbar
} from '@mui/material';

import {
  Person,
  Security,
  Public,
  Timeline as TimelineIcon,
  TrendingUp,
  Warning,  Error as ErrorIcon,
  CheckCircle,
  Info,
  Search,
  FilterList,
  Download,
  Share,
  Edit,
  Delete,
  Add,
  Visibility,
  VisibilityOff,
  Map,
  Group,
  AttachMoney,
  Business,
  Code,
  Language,
  Schedule,
  LocationOn,
  Flag,
  Psychology,
  Hub,
  CompareArrows,
  Analytics,
  Assessment,
  Report,
  CloudDownload,
  BugReport,
  Gavel,
  ExpandMore,
  DataUsage,
  NetworkCheck,
  DeviceHub,
  Shield
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

// Enhanced interfaces for threat actor data
interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  type: 'nation-state' | 'cybercriminal' | 'hacktivist' | 'insider' | 'unknown';
  sophistication: 'minimal' | 'intermediate' | 'advanced' | 'expert' | 'innovator';
  resourceLevel: 'individual' | 'team' | 'organization' | 'government';
  primaryMotivation: 'financial' | 'political' | 'espionage' | 'ideology' | 'personal';
  secondaryMotivations: string[];
  goals: string[];
  firstSeen: Date;
  lastSeen: Date;
  isActive: boolean;
  confidence: number;
  attribution: {
    country: string;
    region: string;
    organization?: string;
    confidence: number;
    sources: string[];
  };
  capabilities: {
    malwareFamilies: string[];
    techniques: string[];
    tacticsUsed: string[];
    targetedSectors: string[];
    targetedRegions: string[];
    infrastructureTypes: string[];
  };
  relationships: {
    associates: string[];
    rivals: string[];
    contractors: string[];
    sponsors: string[];
  };
  campaigns: string[];
  totalIOCs: number;
  recentActivity: number;
  riskScore: number;
  tags: string[];
  description: string;
  notes: string;
  sources: string[];
  lastUpdated: Date;
  createdBy: string;
  updatedBy: string;
}

interface Attribution {
  actorId: string;
  confidence: number;
  evidence: {
    type: 'linguistic' | 'temporal' | 'infrastructure' | 'tactical' | 'technical';
    description: string;
    weight: number;
    sources: string[];
  }[];
  analystAssessment: string;
  lastUpdated: Date;
  updatedBy: string;
}

interface Campaign {
  id: string;
  name: string;
  actorId: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  objectives: string[];
  targets: string[];
  techniques: string[];
  malware: string[];
  iocs: number;
  description: string;
  timeline: {
    date: Date;
    event: string;
    description: string;
    sources: string[];
  }[];
}

const ThreatActorProfiling: React.FC = () => {
  const theme = useTheme();
  
  // Enhanced business logic integration
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('threat-intelligence');
  
  const [actors, setActors] = useState<ThreatActor[]>([]);
  const [filteredActors, setFilteredActors] = useState<ThreatActor[]>([]);
  const [selectedActor, setSelectedActor] = useState<ThreatActor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSophistication, setFilterSophistication] = useState<string>('all');
  const [filterMotivation, setFilterMotivation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'lastSeen' | 'riskScore' | 'confidence'>('riskScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Dialog states
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  
  // View states
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'timeline'>('grid');
  const [showInactive, setShowInactive] = useState(false);
  
  // SpeedDial state
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('threat-actor-profiling', {
      continuous: true,
      position: 'bottom-right',
      minimized: true,
      interval: 90000
    });

    return () => evaluationController.remove();
  }, []);

  // Business logic operations
  const handleUpdateActorProfile = async (actorId: string, profileData: any) => {
    try {
      await businessLogic.execute('update-actor-profile', { actorId, profileData }, 'medium');
      addNotification('success', 'Threat actor profile updated');
    } catch (error) {
      addNotification('error', 'Failed to update actor profile');
    }
  };

  const handleTrackNewActor = async (actorData: any) => {
    try {
      await businessLogic.execute('track-new-actor', actorData, 'medium');
      addNotification('info', 'New threat actor added to tracking');
    } catch (error) {
      addNotification('error', 'Failed to add threat actor');
    }
  };

  const handleAttributeIOCs = async (actorId: string, iocIds: string[]) => {
    try {
      await businessLogic.execute('attribute-iocs', { actorId, iocIds }, 'high');
      addNotification('success', `Attributed ${iocIds.length} IOCs to threat actor`);
    } catch (error) {
      addNotification('error', 'Failed to attribute IOCs');
    }
  };

  const handleRefreshActorData = async () => {
    try {
      await refresh();
      addNotification('success', 'Threat actor data refreshed');
    } catch (error) {
      addNotification('error', 'Failed to refresh actor data');
    }
  };

  // Mock data generation for threat actors
  const generateMockActors = useCallback((): ThreatActor[] => {
    const actorTypes = ['nation-state', 'cybercriminal', 'hacktivist', 'insider'] as const;
    const sophistications = ['minimal', 'intermediate', 'advanced', 'expert', 'innovator'] as const;
    const motivations = ['financial', 'political', 'espionage', 'ideology', 'personal'] as const;
    const countries = ['China', 'Russia', 'North Korea', 'Iran', 'USA', 'Israel', 'Unknown'];
    const malwareFamilies = ['APT1', 'Lazarus', 'Fancy Bear', 'Cozy Bear', 'Carbanak', 'Equation Group'];
    
    const actors: ThreatActor[] = [];
    
    for (let i = 1; i <= 50; i++) {
      const type = actorTypes[Math.floor(Math.random() * actorTypes.length)];
      const sophistication = sophistications[Math.floor(Math.random() * sophistications.length)];
      const motivation = motivations[Math.floor(Math.random() * motivations.length)];
      
      actors.push({
        id: `actor-${i}`,
        name: `APT-${Math.floor(Math.random() * 100) + 1}`,
        aliases: [`Group${i}`, `Team${i}`, `Actor${i}`],
        type,
        sophistication,
        resourceLevel: type === 'nation-state' ? 'government' : 'organization',
        primaryMotivation: motivation,
        secondaryMotivations: motivations.filter(m => m !== motivation).slice(0, 2),
        goals: ['Data theft', 'Espionage', 'Disruption'],
        firstSeen: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        lastSeen: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        isActive: Math.random() > 0.3,
        confidence: Math.floor(Math.random() * 40) + 60,
        attribution: {
          country: countries[Math.floor(Math.random() * countries.length)],
          region: 'Asia-Pacific',
          confidence: Math.floor(Math.random() * 30) + 70,
          sources: ['OSINT', 'Internal Analysis', 'Partner Sharing']
        },
        capabilities: {
          malwareFamilies: malwareFamilies.slice(0, Math.floor(Math.random() * 3) + 1),
          techniques: ['T1566', 'T1027', 'T1055', 'T1083'],
          tacticsUsed: ['Initial Access', 'Persistence', 'Defense Evasion'],
          targetedSectors: ['Government', 'Healthcare', 'Finance'],
          targetedRegions: ['North America', 'Europe', 'Asia'],
          infrastructureTypes: ['Compromised websites', 'Bulletproof hosting', 'Domain generation algorithms']
        },
        relationships: {
          associates: [],
          rivals: [],
          contractors: [],
          sponsors: []
        },
        campaigns: [`Campaign-${i}-A`, `Campaign-${i}-B`],
        totalIOCs: Math.floor(Math.random() * 1000) + 100,
        recentActivity: Math.floor(Math.random() * 50),
        riskScore: Math.floor(Math.random() * 40) + 60,
        tags: ['APT', 'Advanced', 'Persistent'],
        description: `Advanced persistent threat group with focus on ${motivation} activities.`,
        notes: 'Analysis notes and observations',
        sources: ['Mandiant', 'CrowdStrike', 'FireEye'],
        lastUpdated: new Date(),
        createdBy: 'analyst@company.com',
        updatedBy: 'analyst@company.com'
      });
    }
    
    return actors.sort((a, b) => b.riskScore - a.riskScore);
  }, []);

  // Load data
  useEffect(() => {
    const loadActors = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockActors = generateMockActors();
        setActors(mockActors);
        setFilteredActors(mockActors);
      } catch (err) {
        setError('Failed to load threat actors');
        console.error('Error loading actors:', err);
      } finally {
        setLoading(false);
      }
    };

    loadActors();
  }, [generateMockActors]);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...actors];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(actor => 
        actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        actor.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
        actor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        actor.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(actor => actor.type === filterType);
    }

    // Sophistication filter
    if (filterSophistication !== 'all') {
      filtered = filtered.filter(actor => actor.sophistication === filterSophistication);
    }

    // Motivation filter
    if (filterMotivation !== 'all') {
      filtered = filtered.filter(actor => actor.primaryMotivation === filterMotivation);
    }

    // Active/inactive filter
    if (!showInactive) {
      filtered = filtered.filter(actor => actor.isActive);
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const modifier = sortOrder === 'asc' ? 1 : -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * modifier;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        return (aVal.getTime() - bVal.getTime()) * modifier;
      } else {
        return ((aVal as number) - (bVal as number)) * modifier;
      }
    });

    setFilteredActors(filtered);
    setPage(0);
  }, [actors, searchTerm, filterType, filterSophistication, filterMotivation, showInactive, sortBy, sortOrder]);

  // Get risk score color
  const getRiskScoreColor = (score: number): string => {
    if (score >= 90) return theme.palette.error.main;
    if (score >= 70) return theme.palette.warning.main;
    if (score >= 50) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  // Get sophistication color
  const getSophisticationColor = (level: string): string => {
    switch (level) {
      case 'innovator': return theme.palette.error.main;
      case 'expert': return theme.palette.warning.main;
      case 'advanced': return theme.palette.info.main;
      case 'intermediate': return theme.palette.primary.main;
      default: return theme.palette.grey[500];
    }
  };

  // Render actor card
  const renderActorCard = (actor: ThreatActor) => (
    <Card
      key={actor.id}
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
        border: selectedForComparison.includes(actor.id) ? 
          `2px solid ${theme.palette.primary.main}` : undefined
      }}
      onClick={() => {
        setSelectedActor(actor);
        setDetailsOpen(true);
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                bgcolor: getRiskScoreColor(actor.riskScore),
                width: 32,
                height: 32
              }}
            >
              <Person fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="h6" noWrap>
                {actor.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {actor.aliases.slice(0, 2).join(', ')}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: 0.5 }}>
            <Chip
              size="small"
              label={actor.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              color="primary"
              variant="outlined"
            />
            <Badge
              badgeContent={actor.isActive ? 'Active' : 'Inactive'}
              color={actor.isActive ? 'success' : 'default'}
              variant="dot"
            />
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary" noWrap>
            {actor.description}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={`Risk: ${actor.riskScore}`}
            sx={{
              bgcolor: alpha(getRiskScoreColor(actor.riskScore), 0.1),
              color: getRiskScoreColor(actor.riskScore)
            }}
          />
          <Chip
            size="small"
            label={actor.sophistication}
            sx={{
              bgcolor: alpha(getSophisticationColor(actor.sophistication), 0.1),
              color: getSophisticationColor(actor.sophistication)
            }}
          />
          <Chip
            size="small"
            label={`${actor.totalIOCs} IOCs`}
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Typography variant="caption" color="textSecondary">
            {actor.attribution.country} • {actor.confidence}% confidence
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (selectedForComparison.includes(actor.id)) {
                  setSelectedForComparison(prev => prev.filter(id => id !== actor.id));
                } else if (selectedForComparison.length < 3) {
                  setSelectedForComparison(prev => [...prev, actor.id]);
                }
              }}
              color={selectedForComparison.includes(actor.id) ? 'primary' : 'default'}
            >
              <CompareArrows fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedActor(actor);
                setEditOpen(true);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  // Render main content
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress size={60} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedActors = filteredActors.slice(startIndex, endIndex);

    return (
      <>
        {viewMode === 'grid' && (
          <Grid container spacing={3}>
            {paginatedActors.map(renderActorCard)}
          </Grid>
        )}

        {viewMode === 'table' && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Actor</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Sophistication</TableCell>
                  <TableCell>Attribution</TableCell>
                  <TableCell>Risk Score</TableCell>
                  <TableCell>IOCs</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedActors.map((actor) => (
                  <TableRow
                    key={actor.id}
                    hover
                    onClick={() => {
                      setSelectedActor(actor);
                      setDetailsOpen(true);
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            bgcolor: getRiskScoreColor(actor.riskScore),
                            width: 24,
                            height: 24
                          }}
                        >
                          <Person fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {actor.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {actor.aliases[0]}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={actor.type.replace('-', ' ')}
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={actor.sophistication}
                        sx={{
                          bgcolor: alpha(getSophisticationColor(actor.sophistication), 0.1),
                          color: getSophisticationColor(actor.sophistication)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {actor.attribution.country}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {actor.attribution.confidence}% confidence
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: getRiskScoreColor(actor.riskScore) }}
                          fontWeight="bold"
                        >
                          {actor.riskScore}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={actor.riskScore}
                          sx={{
                            width: 60,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getRiskScoreColor(actor.riskScore)
                            }
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{actor.totalIOCs.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        badgeContent={actor.isActive ? 'Active' : 'Inactive'}
                        color={actor.isActive ? 'success' : 'default'}
                        variant="dot"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedForComparison.includes(actor.id)) {
                              setSelectedForComparison(prev => prev.filter(id => id !== actor.id));
                            } else if (selectedForComparison.length < 3) {
                              setSelectedForComparison(prev => [...prev, actor.id]);
                            }
                          }}
                          color={selectedForComparison.includes(actor.id) ? 'primary' : 'default'}
                        >
                          <CompareArrows fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedActor(actor);
                            setEditOpen(true);
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <TablePagination
            component="div"
            count={filteredActors.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </Box>
      </>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Threat Actor Profiling & Attribution
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Advanced threat actor intelligence and attribution analysis
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {actors.filter(a => a.isActive).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Actors
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <Security />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {actors.filter(a => a.riskScore >= 80).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    High Risk
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                  <Flag />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {actors.filter(a => a.type === 'nation-state').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Nation State
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <Assessment />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {Math.round(actors.reduce((sum, a) => sum + a.confidence, 0) / actors.length)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Confidence
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search actors, aliases, tags..."
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
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="nation-state">Nation State</MenuItem>
                <MenuItem value="cybercriminal">Cybercriminal</MenuItem>
                <MenuItem value="hacktivist">Hacktivist</MenuItem>
                <MenuItem value="insider">Insider</MenuItem>
                <MenuItem value="unknown">Unknown</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sophistication</InputLabel>
              <Select
                value={filterSophistication}
                onChange={(e) => setFilterSophistication(e.target.value)}
                label="Sophistication"
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="innovator">Innovator</MenuItem>
                <MenuItem value="expert">Expert</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="minimal">Minimal</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                label="Sort By"
              >
                <MenuItem value="riskScore">Risk Score</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="lastSeen">Last Seen</MenuItem>
                <MenuItem value="confidence">Confidence</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Comparison Bar */}
      {selectedForComparison.length > 0 && (
        <Alert
          severity="info"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                onClick={() => setCompareOpen(true)}
                disabled={selectedForComparison.length < 2}
              >
                Compare ({selectedForComparison.length})
              </Button>
              <Button
                size="small"
                onClick={() => setSelectedForComparison([])}
              >
                Clear
              </Button>
            </Box>
          }
        >
          {selectedForComparison.length} actors selected for comparison
        </Alert>
      )}

      {/* Main Content */}
      <Box sx={{ mt: 3 }}>
        {renderContent()}
      </Box>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Threat Actor Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        open={speedDialOpen}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
      >
        <SpeedDialAction
          icon={<Add />}
          tooltipTitle="Add New Actor"
          onClick={() => {
            setSelectedActor(null);
            setEditOpen(true);
            setSpeedDialOpen(false);
          }}
        />
        <SpeedDialAction
          icon={<Download />}
          tooltipTitle="Export Data"
          onClick={() => setSpeedDialOpen(false)}
        />
        <SpeedDialAction
          icon={<Analytics />}
          tooltipTitle="Generate Report"
          onClick={() => setSpeedDialOpen(false)}
        />
        <SpeedDialAction
          icon={<Share />}
          tooltipTitle="Share Intelligence"
          onClick={() => setSpeedDialOpen(false)}
        />
      </SpeedDial>

      {/* Details Dialog */}
      {selectedActor && (
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
                  bgcolor: getRiskScoreColor(selectedActor.riskScore),
                  width: 40,
                  height: 40
                }}
              >
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h5">
                  {selectedActor.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedActor.aliases.join(', ')}
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
                      Basic Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Type
                        </Typography>
                        <Typography variant="body2">
                          {selectedActor.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Sophistication
                        </Typography>
                        <Typography variant="body2">
                          {selectedActor.sophistication.replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Primary Motivation
                        </Typography>
                        <Typography variant="body2">
                          {selectedActor.primaryMotivation.replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Resource Level
                        </Typography>
                        <Typography variant="body2">
                          {selectedActor.resourceLevel.replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Attribution
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Country
                        </Typography>
                        <Typography variant="body2">
                          {selectedActor.attribution.country}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Region
                        </Typography>
                        <Typography variant="body2">
                          {selectedActor.attribution.region}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Confidence
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {selectedActor.attribution.confidence}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={selectedActor.attribution.confidence}
                            sx={{ flexGrow: 1 }}
                          />
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Sources
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                          {selectedActor.attribution.sources.map((source) => (
                            <Chip
                              key={source}
                              size="small"
                              label={source}
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Risk Assessment
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Risk Score
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="h5"
                            sx={{ color: getRiskScoreColor(selectedActor.riskScore) }}
                          >
                            {selectedActor.riskScore}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={selectedActor.riskScore}
                            sx={{
                              flexGrow: 1,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: getRiskScoreColor(selectedActor.riskScore)
                              }
                            }}
                          />
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Status
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Badge
                            badgeContent={selectedActor.isActive ? 'Active' : 'Inactive'}
                            color={selectedActor.isActive ? 'success' : 'default'}
                            variant="dot"
                          />
                          <Typography variant="body2">
                            {selectedActor.isActive ? 'Currently Active' : 'Inactive'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Total IOCs
                        </Typography>
                        <Typography variant="body2">
                          {selectedActor.totalIOCs.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Last Seen
                        </Typography>
                        <Typography variant="body2">
                          {selectedActor.lastSeen.toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Capabilities
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Malware Families
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {selectedActor.capabilities.malwareFamilies.map((malware) => (
                          <Chip
                            key={malware}
                            size="small"
                            label={malware}
                            color="error"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Targeted Sectors
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {selectedActor.capabilities.targetedSectors.map((sector) => (
                          <Chip
                            key={sector}
                            size="small"
                            label={sector}
                            color="warning"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Description & Analysis
              </Typography>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2">
                  {selectedActor.description}
                </Typography>
                {selectedActor.notes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Analysis Notes
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedActor.notes}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setDetailsOpen(false);
                setEditOpen(true);
              }}
            >
              Edit
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Notifications */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={6000}
          onClose={() => removeNotification(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={notification.type}
            onClose={() => removeNotification(notification.id)}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};

export default ThreatActorProfiling;
