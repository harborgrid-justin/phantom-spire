/**
 * Threat Actor Campaign Management Component
 * Campaign tracking and management for threat actors
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  Avatar,
  Badge,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

import {
  Campaign,
  Timeline as TimelineIcon,
  Security,
  Group,
  LocationOn,
  DateRange,
  Search,
  FilterList,
  Analytics,
  Assessment,
  Warning,
  CheckCircle,
  Error,
  Info,
  Download,
  Share,
  Refresh,
  ExpandMore,
  Visibility,
  PlayArrow,
  Pause,
  Stop,
  Edit,
  Delete,
  Add,
  TrendingUp,
  Business,
  Computer,
  Language
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

// Interfaces
interface CampaignIOC {
  id: string;
  type: 'hash' | 'domain' | 'ip' | 'url' | 'email' | 'registry';
  value: string;
  confidence: number;
  firstSeen: Date;
  lastSeen: Date;
  context: string;
}

interface CampaignTarget {
  id: string;
  name: string;
  type: 'individual' | 'organization' | 'sector' | 'country';
  sector: string;
  country: string;
  attackDate: Date;
  status: 'targeted' | 'compromised' | 'failed' | 'unknown';
  impact: 'low' | 'medium' | 'high' | 'critical';
}

interface CampaignPhase {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: 'planned' | 'active' | 'completed' | 'failed';
  objectives: string[];
  techniques: string[];
  iocs: string[];
  targets: string[];
}

interface ThreatActorCampaign {
  id: string;
  name: string;
  description: string;
  actorId: string;
  actorName: string;
  status: 'planning' | 'active' | 'dormant' | 'completed' | 'disrupted';
  classification: 'espionage' | 'financial' | 'destructive' | 'influence' | 'unknown';
  startDate: Date;
  endDate?: Date;
  lastActivity: Date;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  phases: CampaignPhase[];
  targets: CampaignTarget[];
  iocs: CampaignIOC[];
  geography: {
    primaryRegion: string;
    countries: string[];
    scope: 'local' | 'regional' | 'national' | 'global';
  };
  objectives: string[];
  techniques: string[];
  infrastructure: Array<{
    type: 'c2' | 'hosting' | 'proxy' | 'email';
    value: string;
    role: string;
    firstSeen: Date;
    lastSeen: Date;
  }>;
  timeline: Array<{
    date: Date;
    event: string;
    type: 'intelligence' | 'attack' | 'discovery' | 'disruption';
    description: string;
    source: string;
  }>;
  attribution: {
    confidence: number;
    evidence: string[];
    alternativeActors: string[];
  };
  impact: {
    estimatedVictims: number;
    sectors: string[];
    economicImpact?: number;
    dataExfiltrated?: boolean;
    systemsDisrupted?: boolean;
  };
  countermeasures: Array<{
    date: Date;
    action: string;
    implementer: string;
    effectiveness: 'low' | 'medium' | 'high';
    status: 'planned' | 'implemented' | 'failed';
  }>;
}

interface CampaignFilter {
  status: string;
  classification: string;
  severity: string;
  actor: string;
  geography: string;
  timeRange: string;
  confidence: number;
}

const ThreatActorCampaignManagement: React.FC = () => {
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
  } = useServicePage('threat-intelligence-campaigns');

  // State management
  const [campaigns, setCampaigns] = useState<ThreatActorCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<ThreatActorCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CampaignFilter>({
    status: 'all',
    classification: 'all',
    severity: 'all',
    actor: 'all',
    geography: 'all',
    timeRange: '1y',
    confidence: 50
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<CampaignPhase | null>(null);

  // Mock data generation
  const generateMockCampaigns = useCallback((): ThreatActorCampaign[] => {
    const campaigns: ThreatActorCampaign[] = [];
    const statuses: ThreatActorCampaign['status'][] = ['planning', 'active', 'dormant', 'completed', 'disrupted'];
    const classifications: ThreatActorCampaign['classification'][] = ['espionage', 'financial', 'destructive', 'influence', 'unknown'];
    const severities: ThreatActorCampaign['severity'][] = ['low', 'medium', 'high', 'critical'];
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Middle East', 'Latin America'];
    const countries = ['United States', 'China', 'Russia', 'Germany', 'United Kingdom', 'Japan', 'South Korea'];
    const sectors = ['Government', 'Financial', 'Healthcare', 'Technology', 'Energy', 'Defense', 'Education'];

    for (let i = 1; i <= 25; i++) {
      const startDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      const endDate = Math.random() > 0.5 ? new Date(startDate.getTime() + Math.random() * 180 * 24 * 60 * 60 * 1000) : undefined;
      
      const phases: CampaignPhase[] = Array.from({ length: Math.floor(Math.random() * 4) + 2 }, (_, phaseIdx) => ({
        id: `phase-${i}-${phaseIdx}`,
        name: `Phase ${phaseIdx + 1}`,
        description: `Campaign phase ${phaseIdx + 1} for operation ${i}`,
        startDate: new Date(startDate.getTime() + phaseIdx * 30 * 24 * 60 * 60 * 1000),
        endDate: phaseIdx < 2 ? new Date(startDate.getTime() + (phaseIdx + 1) * 30 * 24 * 60 * 60 * 1000) : undefined,
        status: ['planned', 'active', 'completed', 'failed'][Math.floor(Math.random() * 4)] as any,
        objectives: [`Objective ${phaseIdx + 1}A`, `Objective ${phaseIdx + 1}B`],
        techniques: ['T1566', 'T1027', 'T1055'].slice(0, Math.floor(Math.random() * 3) + 1),
        iocs: [`ioc-${i}-${phaseIdx}-1`, `ioc-${i}-${phaseIdx}-2`],
        targets: [`target-${i}-${phaseIdx}`]
      }));

      const targets: CampaignTarget[] = Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, targetIdx) => ({
        id: `target-${i}-${targetIdx}`,
        name: `Target Organization ${i}-${targetIdx}`,
        type: ['individual', 'organization', 'sector', 'country'][Math.floor(Math.random() * 4)] as any,
        sector: sectors[Math.floor(Math.random() * sectors.length)],
        country: countries[Math.floor(Math.random() * countries.length)],
        attackDate: new Date(startDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000),
        status: ['targeted', 'compromised', 'failed', 'unknown'][Math.floor(Math.random() * 4)] as any,
        impact: severities[Math.floor(Math.random() * severities.length)] as any
      }));

      const iocs: CampaignIOC[] = Array.from({ length: Math.floor(Math.random() * 15) + 5 }, (_, iocIdx) => ({
        id: `ioc-${i}-${iocIdx}`,
        type: ['hash', 'domain', 'ip', 'url', 'email', 'registry'][Math.floor(Math.random() * 6)] as any,
        value: `indicator-${i}-${iocIdx}.example.com`,
        confidence: Math.floor(Math.random() * 30) + 70,
        firstSeen: new Date(startDate.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        context: `Context for IOC ${iocIdx}`
      }));

      campaigns.push({
        id: `campaign-${i}`,
        name: `Operation ${i}`,
        description: `Large-scale cyber campaign ${i} targeting multiple sectors`,
        actorId: `actor-${Math.floor(Math.random() * 10) + 1}`,
        actorName: `ThreatActor-${Math.floor(Math.random() * 10) + 1}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        classification: classifications[Math.floor(Math.random() * classifications.length)],
        startDate,
        endDate,
        lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        confidence: Math.floor(Math.random() * 30) + 70,
        severity: severities[Math.floor(Math.random() * severities.length)],
        phases,
        targets,
        iocs,
        geography: {
          primaryRegion: regions[Math.floor(Math.random() * regions.length)],
          countries: countries.slice(0, Math.floor(Math.random() * 4) + 1),
          scope: ['local', 'regional', 'national', 'global'][Math.floor(Math.random() * 4)] as any
        },
        objectives: [
          'Data exfiltration',
          'System disruption',
          'Intelligence gathering',
          'Financial gain'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        techniques: ['T1566', 'T1027', 'T1055', 'T1083'].slice(0, Math.floor(Math.random() * 4) + 1),
        infrastructure: Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, infraIdx) => ({
          type: ['c2', 'hosting', 'proxy', 'email'][Math.floor(Math.random() * 4)] as any,
          value: `infra-${i}-${infraIdx}.example.com`,
          role: `Infrastructure role ${infraIdx}`,
          firstSeen: new Date(startDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        })),
        timeline: Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, timeIdx) => ({
          date: new Date(startDate.getTime() + timeIdx * 7 * 24 * 60 * 60 * 1000),
          event: `Timeline Event ${timeIdx + 1}`,
          type: ['intelligence', 'attack', 'discovery', 'disruption'][Math.floor(Math.random() * 4)] as any,
          description: `Event description ${timeIdx + 1} for campaign ${i}`,
          source: ['Internal', 'OSINT', 'Partner', 'Vendor'][Math.floor(Math.random() * 4)]
        })),
        attribution: {
          confidence: Math.floor(Math.random() * 30) + 70,
          evidence: [`Evidence A`, `Evidence B`, `Evidence C`],
          alternativeActors: [`AlternativeActor-${i}A`, `AlternativeActor-${i}B`]
        },
        impact: {
          estimatedVictims: Math.floor(Math.random() * 10000) + 1000,
          sectors: sectors.slice(0, Math.floor(Math.random() * 4) + 1),
          economicImpact: Math.floor(Math.random() * 10000000) + 100000,
          dataExfiltrated: Math.random() > 0.5,
          systemsDisrupted: Math.random() > 0.6
        },
        countermeasures: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, cmIdx) => ({
          date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
          action: `Countermeasure ${cmIdx + 1}`,
          implementer: ['Government', 'Law Enforcement', 'Private Sector'][Math.floor(Math.random() * 3)],
          effectiveness: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          status: ['planned', 'implemented', 'failed'][Math.floor(Math.random() * 3)] as any
        }))
      });
    }

    return campaigns.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockCampaigns = generateMockCampaigns();
        setCampaigns(mockCampaigns);
        setSelectedCampaign(mockCampaigns[0]);
        addUIUXEvaluation('campaign-management-loaded', 'success', {
          campaignCount: mockCampaigns.length,
          loadTime: 1000
        });
      } catch (error) {
        console.error('Error loading campaign data:', error);
        addNotification('error', 'Failed to load campaign management data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockCampaigns, addNotification]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      if (searchTerm && !campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !campaign.actorName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      if (filters.status !== 'all' && campaign.status !== filters.status) {
        return false;
      }
      
      if (filters.classification !== 'all' && campaign.classification !== filters.classification) {
        return false;
      }
      
      if (filters.severity !== 'all' && campaign.severity !== filters.severity) {
        return false;
      }
      
      if (campaign.confidence < filters.confidence) {
        return false;
      }
      
      if (filters.geography !== 'all' && campaign.geography.primaryRegion !== filters.geography) {
        return false;
      }
      
      return true;
    });
  }, [campaigns, searchTerm, filters]);

  // Event handlers
  const handleCampaignSelect = (campaign: ThreatActorCampaign) => {
    setSelectedCampaign(campaign);
    addUIUXEvaluation('campaign-selected', 'interaction', {
      campaignId: campaign.id,
      status: campaign.status
    });
  };

  const handlePhaseSelect = (phase: CampaignPhase) => {
    setSelectedPhase(phase);
    setDetailsOpen(true);
    addUIUXEvaluation('campaign-phase-selected', 'interaction', {
      phaseId: phase.id,
      status: phase.status
    });
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      const newCampaigns = generateMockCampaigns();
      setCampaigns(newCampaigns);
      setSelectedCampaign(newCampaigns[0]);
      addNotification('success', 'Campaign data refreshed');
    } catch (error) {
      addNotification('error', 'Failed to refresh data');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'error';
      case 'planning': return 'warning';
      case 'dormant': return 'info';
      case 'completed': return 'success';
      case 'disrupted': return 'primary';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
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
          <Campaign color="primary" />
          Threat Actor Campaign Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Track and manage threat actor campaigns with comprehensive analysis and timeline visualization
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search Campaigns"
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
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="planning">Planning</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="dormant">Dormant</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="disrupted">Disrupted</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Classification</InputLabel>
              <Select
                value={filters.classification}
                onChange={(e) => setFilters(prev => ({ ...prev, classification: e.target.value }))}
                label="Classification"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="espionage">Espionage</MenuItem>
                <MenuItem value="financial">Financial</MenuItem>
                <MenuItem value="destructive">Destructive</MenuItem>
                <MenuItem value="influence">Influence</MenuItem>
                <MenuItem value="unknown">Unknown</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                label="Severity"
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
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
              <Button
                variant="contained"
                startIcon={<Add />}
              >
                New Campaign
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Campaign List */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '600px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Campaigns ({filteredCampaigns.length})
              </Typography>
              <Box sx={{ height: '520px', overflow: 'auto' }}>
                <List dense>
                  {filteredCampaigns.map(campaign => (
                    <ListItem
                      key={campaign.id}
                      button
                      selected={selectedCampaign?.id === campaign.id}
                      onClick={() => handleCampaignSelect(campaign)}
                      sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                    >
                      <ListItemIcon>
                        <Badge
                          badgeContent={campaign.iocs.length}
                          color="primary"
                          max={99}
                        >
                          <Campaign color={getStatusColor(campaign.status)} />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" noWrap>
                              {campaign.name}
                            </Typography>
                            <Chip 
                              label={campaign.status} 
                              size="small" 
                              color={getStatusColor(campaign.status)}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {campaign.actorName} • {campaign.classification}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                label={campaign.severity} 
                                size="small" 
                                color={getSeverityColor(campaign.severity)}
                              />
                              <Typography variant="caption" color="textSecondary">
                                {campaign.targets.length} targets • {campaign.geography.scope}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                              Last activity: {campaign.lastActivity.toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Campaign Details */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '600px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {selectedCampaign?.name || 'Select Campaign'}
                </Typography>
                {selectedCampaign && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      label={selectedCampaign.status} 
                      color={getStatusColor(selectedCampaign.status)}
                    />
                    <Chip 
                      label={selectedCampaign.classification} 
                      variant="outlined"
                    />
                  </Box>
                )}
              </Box>

              {selectedCampaign ? (
                <Box sx={{ height: '510px' }}>
                  <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
                    <Tab label="Overview" />
                    <Tab label="Timeline" />
                    <Tab label="Targets" />
                    <Tab label="IOCs" />
                  </Tabs>

                  {selectedTab === 0 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>Campaign Information</Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText primary="Actor" secondary={selectedCampaign.actorName} />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Classification" secondary={selectedCampaign.classification} />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Start Date" secondary={selectedCampaign.startDate.toLocaleDateString()} />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Last Activity" secondary={selectedCampaign.lastActivity.toLocaleDateString()} />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Confidence" secondary={`${selectedCampaign.confidence}%`} />
                            </ListItem>
                          </List>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>Geographic Scope</Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText primary="Primary Region" secondary={selectedCampaign.geography.primaryRegion} />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Countries" secondary={selectedCampaign.geography.countries.join(', ')} />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Scope" secondary={selectedCampaign.geography.scope} />
                            </ListItem>
                          </List>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>Objectives</Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            {selectedCampaign.objectives.map((objective, idx) => (
                              <Chip key={idx} label={objective} variant="outlined" size="small" />
                            ))}
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>Campaign Phases</Typography>
                          <Stepper orientation="horizontal" alternativeLabel>
                            {selectedCampaign.phases.map((phase, idx) => (
                              <Step key={phase.id} active={phase.status === 'active'} completed={phase.status === 'completed'}>
                                <StepLabel error={phase.status === 'failed'}>
                                  {phase.name}
                                </StepLabel>
                              </Step>
                            ))}
                          </Stepper>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>Impact Assessment</Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={3}>
                              <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h4" color="error">
                                  {selectedCampaign.impact.estimatedVictims.toLocaleString()}
                                </Typography>
                                <Typography variant="caption">Est. Victims</Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={3}>
                              <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h4" color="warning">
                                  {selectedCampaign.impact.sectors.length}
                                </Typography>
                                <Typography variant="caption">Sectors</Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={3}>
                              <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h4" color={selectedCampaign.impact.dataExfiltrated ? 'error' : 'success'}>
                                  {selectedCampaign.impact.dataExfiltrated ? 'YES' : 'NO'}
                                </Typography>
                                <Typography variant="caption">Data Stolen</Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={3}>
                              <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h4" color="info">
                                  ${(selectedCampaign.impact.economicImpact! / 1000000).toFixed(1)}M
                                </Typography>
                                <Typography variant="caption">Economic Impact</Typography>
                              </Paper>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {selectedTab === 1 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Campaign Timeline ({selectedCampaign.timeline.length} events)
                      </Typography>
                      <Timeline>
                        {selectedCampaign.timeline.slice(0, 10).map((event, idx) => (
                          <TimelineItem key={idx}>
                            <TimelineSeparator>
                              <TimelineDot color={
                                event.type === 'attack' ? 'error' :
                                event.type === 'discovery' ? 'warning' :
                                event.type === 'disruption' ? 'success' : 'primary'
                              }>
                                {event.type === 'attack' && <Warning />}
                                {event.type === 'discovery' && <Visibility />}
                                {event.type === 'disruption' && <Security />}
                                {event.type === 'intelligence' && <Analytics />}
                              </TimelineDot>
                              {idx < selectedCampaign.timeline.length - 1 && <TimelineConnector />}
                            </TimelineSeparator>
                            <TimelineContent>
                              <Typography variant="body2" fontWeight="medium">
                                {event.event}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" display="block">
                                {event.date.toLocaleDateString()} • {event.source}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {event.description}
                              </Typography>
                            </TimelineContent>
                          </TimelineItem>
                        ))}
                      </Timeline>
                    </Box>
                  )}

                  {selectedTab === 2 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Campaign Targets ({selectedCampaign.targets.length})
                      </Typography>
                      <List dense>
                        {selectedCampaign.targets.map(target => (
                          <ListItem key={target.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                            <ListItemIcon>
                              <Business color={
                                target.status === 'compromised' ? 'error' :
                                target.status === 'targeted' ? 'warning' :
                                target.status === 'failed' ? 'success' : 'default'
                              } />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2">{target.name}</Typography>
                                  <Chip label={target.status} size="small" variant="outlined" />
                                  <Chip label={target.impact} size="small" color={getSeverityColor(target.impact)} />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="caption" display="block">
                                    {target.sector} • {target.country}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    Attacked: {target.attackDate.toLocaleDateString()}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {selectedTab === 3 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Indicators of Compromise ({selectedCampaign.iocs.length})
                      </Typography>
                      <List dense>
                        {selectedCampaign.iocs.slice(0, 20).map(ioc => (
                          <ListItem key={ioc.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                            <ListItemIcon>
                              {ioc.type === 'hash' && <Computer />}
                              {ioc.type === 'domain' && <Language />}
                              {ioc.type === 'ip' && <LocationOn />}
                              {ioc.type === 'url' && <Language />}
                              {ioc.type === 'email' && <Language />}
                              {ioc.type === 'registry' && <Computer />}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                                    {ioc.value}
                                  </Typography>
                                  <Chip label={ioc.type} size="small" variant="outlined" />
                                  <Chip 
                                    label={`${ioc.confidence}%`} 
                                    size="small" 
                                    color={ioc.confidence > 80 ? 'success' : ioc.confidence > 60 ? 'warning' : 'error'}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="caption" display="block">
                                    {ioc.context}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    First seen: {ioc.firstSeen.toLocaleDateString()} • Last seen: {ioc.lastSeen.toLocaleDateString()}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    height: '500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Campaign sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.5), mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      Select a Campaign
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Choose a campaign from the list to view detailed information and analysis
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Phase Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Campaign Phase Details
        </DialogTitle>
        <DialogContent>
          {selectedPhase && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedPhase.name}
                </Typography>
                <Typography variant="body2" paragraph>
                  {selectedPhase.description}
                </Typography>
                <Chip 
                  label={selectedPhase.status} 
                  color={getStatusColor(selectedPhase.status)}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Timeline</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Start Date" secondary={selectedPhase.startDate.toLocaleDateString()} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="End Date" secondary={selectedPhase.endDate?.toLocaleDateString() || 'Ongoing'} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Objectives</Typography>
                <List dense>
                  {selectedPhase.objectives.map((objective, idx) => (
                    <ListItem key={idx}>
                      <ListItemText primary={objective} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Associated Elements</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="caption">Techniques</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {selectedPhase.techniques.map((technique, idx) => (
                        <Chip key={idx} label={technique} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption">IOCs</Typography>
                    <Typography variant="body2">{selectedPhase.iocs.length} indicators</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption">Targets</Typography>
                    <Typography variant="body2">{selectedPhase.targets.length} targets</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained">Edit Phase</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThreatActorCampaignManagement;