/**
 * Threat Actor Timeline Analysis Component
 * Historical activity timelines and trend analysis
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
  DatePicker,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';

import {
  Timeline,
  AccessTime,
  TrendingUp,
  TrendingDown,
  BarChart,
  LineAxis,
  Search,
  FilterList,
  DateRange,
  Event,
  Schedule,
  History,
  Analytics,
  Assessment,
  Warning,  Error as ErrorIcon,
  Info,
  CheckCircle,
  Download,
  Share,
  Refresh,
  ExpandMore,
  Visibility,
  PlayArrow,
  Pause,
  FastForward,
  FastRewind,
  ZoomIn,
  ZoomOut
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

// Interfaces
interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'campaign' | 'attack' | 'infrastructure' | 'attribution' | 'ioc' | 'discovery';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  location?: string;
  targets?: string[];
  techniques?: string[];
  sources: string[];
  relatedEvents: string[];
}

interface ThreatActorTimeline {
  id: string;
  name: string;
  aliases: string[];
  firstSeen: Date;
  lastSeen: Date;
  events: TimelineEvent[];
  activityPeriods: Array<{
    start: Date;
    end: Date;
    intensity: 'high' | 'medium' | 'low';
    description: string;
  }>;
  evolutionPhases: Array<{
    phase: string;
    timeRange: [Date, Date];
    characteristics: string[];
    majorEvents: string[];
  }>;
  dormancyPeriods: Array<{
    start: Date;
    end: Date;
    duration: number;
    possibleReasons: string[];
  }>;
  trends: {
    activityTrend: 'increasing' | 'decreasing' | 'stable';
    sophisticationTrend: 'increasing' | 'decreasing' | 'stable';
    targetingTrend: 'expanding' | 'focusing' | 'stable';
    geographicTrend: 'expanding' | 'focusing' | 'stable';
  };
  statistics: {
    totalEvents: number;
    averageEventsPerMonth: number;
    peakActivityPeriod: [Date, Date];
    longestDormancy: number;
    campaignCount: number;
    targetCount: number;
  };
}

interface TimelineFilter {
  dateRange: [Date | null, Date | null];
  eventTypes: string[];
  severity: string[];
  confidence: number;
  actor: string;
}

const ThreatActorTimelineAnalysis: React.FC = () => {
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
  } = useServicePage('threat-intelligence-timeline');

  // State management
  const [actors, setActors] = useState<ThreatActorTimeline[]>([]);
  const [selectedActor, setSelectedActor] = useState<ThreatActorTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<TimelineFilter>({
    dateRange: [new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()],
    eventTypes: ['campaign', 'attack', 'infrastructure', 'attribution', 'ioc', 'discovery'],
    severity: ['critical', 'high', 'medium', 'low'],
    confidence: 50,
    actor: 'all'
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [timelineView, setTimelineView] = useState<'events' | 'trends' | 'phases'>('events');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [playbackMode, setPlaybackMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock data generation
  const generateMockTimelines = useCallback((): ThreatActorTimeline[] => {
    const eventTypes: TimelineEvent['type'][] = ['campaign', 'attack', 'infrastructure', 'attribution', 'ioc', 'discovery'];
    const severities: TimelineEvent['severity'][] = ['critical', 'high', 'medium', 'low'];
    const timelines: ThreatActorTimeline[] = [];

    for (let i = 1; i <= 15; i++) {
      const firstSeen = new Date(Date.now() - Math.random() * 3 * 365 * 24 * 60 * 60 * 1000);
      const lastSeen = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      // Generate timeline events
      const eventCount = Math.floor(Math.random() * 50) + 20;
      const events: TimelineEvent[] = [];
      
      for (let j = 0; j < eventCount; j++) {
        const timestamp = new Date(
          firstSeen.getTime() + Math.random() * (lastSeen.getTime() - firstSeen.getTime())
        );
        
        events.push({
          id: `event-${i}-${j}`,
          timestamp,
          type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          title: `Timeline Event ${i}-${j}`,
          description: `Detailed description of threat actor ${i} activity event ${j}`,
          severity: severities[Math.floor(Math.random() * severities.length)],
          confidence: Math.floor(Math.random() * 40) + 60,
          location: ['US', 'CN', 'RU', 'KP', 'IR'][Math.floor(Math.random() * 5)],
          targets: ['Financial', 'Government', 'Healthcare', 'Technology'].slice(0, Math.floor(Math.random() * 3) + 1),
          techniques: ['T1566', 'T1027', 'T1055', 'T1083'].slice(0, Math.floor(Math.random() * 3) + 1),
          sources: ['OSINT', 'Internal', 'Partner', 'Commercial'].slice(0, Math.floor(Math.random() * 3) + 1),
          relatedEvents: []
        });
      }
      
      events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      timelines.push({
        id: `timeline-actor-${i}`,
        name: `TimelineActor-${i}`,
        aliases: [`TA-${i}`, `Group-${i}`],
        firstSeen,
        lastSeen,
        events,
        activityPeriods: [
          {
            start: firstSeen,
            end: new Date(firstSeen.getTime() + 180 * 24 * 60 * 60 * 1000),
            intensity: 'high',
            description: 'Initial emergence and establishment'
          },
          {
            start: new Date(firstSeen.getTime() + 180 * 24 * 60 * 60 * 1000),
            end: new Date(firstSeen.getTime() + 360 * 24 * 60 * 60 * 1000),
            intensity: 'medium',
            description: 'Operational development phase'
          }
        ],
        evolutionPhases: [
          {
            phase: 'Emergence',
            timeRange: [firstSeen, new Date(firstSeen.getTime() + 90 * 24 * 60 * 60 * 1000)],
            characteristics: ['Basic TTPs', 'Limited targeting', 'Simple infrastructure'],
            majorEvents: events.slice(0, 3).map(e => e.id)
          },
          {
            phase: 'Development',
            timeRange: [new Date(firstSeen.getTime() + 90 * 24 * 60 * 60 * 1000), lastSeen],
            characteristics: ['Advanced TTPs', 'Expanded targeting', 'Complex infrastructure'],
            majorEvents: events.slice(-3).map(e => e.id)
          }
        ],
        dormancyPeriods: [
          {
            start: new Date(firstSeen.getTime() + 200 * 24 * 60 * 60 * 1000),
            end: new Date(firstSeen.getTime() + 250 * 24 * 60 * 60 * 1000),
            duration: 50,
            possibleReasons: ['Infrastructure takedown', 'Operational security', 'Resource constraints']
          }
        ],
        trends: {
          activityTrend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as 'increasing' | 'decreasing' | 'stable',
          sophisticationTrend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as 'increasing' | 'decreasing' | 'stable',
          targetingTrend: ['expanding', 'focusing', 'stable'][Math.floor(Math.random() * 3)] as 'expanding' | 'focusing' | 'stable',
          geographicTrend: ['expanding', 'focusing', 'stable'][Math.floor(Math.random() * 3)] as 'expanding' | 'focusing' | 'stable'
        },
        statistics: {
          totalEvents: events.length,
          averageEventsPerMonth: Math.round(events.length / 12),
          peakActivityPeriod: [firstSeen, lastSeen],
          longestDormancy: 50,
          campaignCount: events.filter(e => e.type === 'campaign').length,
          targetCount: Math.floor(Math.random() * 50) + 10
        }
      });
    }

    return timelines.sort((a, b) => b.statistics.totalEvents - a.statistics.totalEvents);
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockTimelines = generateMockTimelines();
        setActors(mockTimelines);
        setSelectedActor(mockTimelines[0]);
        addUIUXEvaluation('timeline-analysis-loaded', 'success', {
          actorCount: mockTimelines.length,
          loadTime: 1000
        });
      } catch (error) {
        console.error('Error loading timeline data:', error);
        addNotification('error', 'Failed to load timeline data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockTimelines, addNotification]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (!selectedActor) return [];
    
    return selectedActor.events.filter(event => {
      if (filters.dateRange[0] && event.timestamp < filters.dateRange[0]) return false;
      if (filters.dateRange[1] && event.timestamp > filters.dateRange[1]) return false;
      if (!filters.eventTypes.includes(event.type)) return false;
      if (!filters.severity.includes(event.severity)) return false;
      if (event.confidence < filters.confidence) return false;
      
      if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !event.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [selectedActor, filters, searchTerm]);

  // Event handlers
  const handleActorSelect = (actor: ThreatActorTimeline) => {
    setSelectedActor(actor);
    addUIUXEvaluation('timeline-actor-selected', 'interaction', {
      actorId: actor.id,
      eventCount: actor.events.length
    });
  };

  const handleEventSelect = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
    addUIUXEvaluation('timeline-event-selected', 'interaction', {
      eventId: event.id,
      eventType: event.type
    });
  };

  const handlePlaybackToggle = () => {
    setPlaybackMode(!playbackMode);
    if (!playbackMode) {
      setCurrentTime(filters.dateRange[0] || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      const newTimelines = generateMockTimelines();
      setActors(newTimelines);
      setSelectedActor(newTimelines[0]);
      addNotification('success', 'Timeline data refreshed');
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
          <Timeline color="primary" />
          Threat Actor Timeline Analysis
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Historical activity analysis, trend identification, and temporal pattern recognition
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search Events"
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
            <ToggleButtonGroup
              value={timelineView}
              exclusive
              onChange={(_, value) => value && setTimelineView(value)}
              size="small"
            >
              <ToggleButton value="events">Events</ToggleButton>
              <ToggleButton value="trends">Trends</ToggleButton>
              <ToggleButton value="phases">Phases</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={handlePlaybackToggle}
                color={playbackMode ? 'primary' : 'default'}
              >
                {playbackMode ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton size="small"><FastRewind /></IconButton>
              <IconButton size="small"><FastForward /></IconButton>
            </Box>
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
        {/* Timeline Visualization */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '600px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {selectedActor?.name} - Activity Timeline
                </Typography>
                <Chip 
                  label={`${filteredEvents.length} events`} 
                  variant="outlined" 
                  size="small" 
                />
              </Box>
              
              {/* Timeline Visualization Area */}
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
                  <Timeline sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.5), mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    Interactive Timeline Visualization
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {timelineView === 'events' && `Showing ${filteredEvents.length} events over time`}
                    {timelineView === 'trends' && 'Activity trends and patterns analysis'}
                    {timelineView === 'phases' && 'Evolution phases and development stages'}
                  </Typography>
                  {selectedActor && (
                    <Box sx={{ mt: 2 }}>
                      <Chip label={`${selectedActor.statistics.totalEvents} total events`} size="small" sx={{ mr: 1 }} />
                      <Chip label={`${selectedActor.statistics.campaignCount} campaigns`} size="small" sx={{ mr: 1 }} />
                      <Chip label={`Avg: ${selectedActor.statistics.averageEventsPerMonth}/month`} size="small" />
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
                <Tab label="Events" />
                <Tab label="Trends" />
                <Tab label="Stats" />
              </Tabs>

              {selectedTab === 0 && (
                <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recent Events ({filteredEvents.length})
                  </Typography>
                  <List dense>
                    {filteredEvents.slice(-10).reverse().map(event => (
                      <ListItem
                        key={event.id}
                        button
                        onClick={() => handleEventSelect(event)}
                        sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                      >
                        <ListItemIcon>
                          {event.type === 'campaign' && <Event color="primary" />}
                          {event.type === 'attack' && <Warning color="error" />}
                          {event.type === 'infrastructure' && <Analytics color="info" />}
                          {event.type === 'attribution' && <Assessment color="secondary" />}
                          {event.type === 'ioc' && <Info color="warning" />}
                          {event.type === 'discovery' && <CheckCircle color="success" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={event.title}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {event.timestamp.toLocaleDateString()}
                              </Typography>
                              <Chip 
                                label={event.severity} 
                                size="small" 
                                color={
                                  event.severity === 'critical' ? 'error' :
                                  event.severity === 'high' ? 'warning' :
                                  event.severity === 'medium' ? 'info' : 'default'
                                }
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {selectedTab === 1 && selectedActor && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Trend Analysis</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="caption">Activity Trend</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {selectedActor.trends.activityTrend === 'increasing' && <TrendingUp color="success" />}
                          {selectedActor.trends.activityTrend === 'decreasing' && <TrendingDown color="error" />}
                          {selectedActor.trends.activityTrend === 'stable' && <BarChart color="info" />}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {selectedActor.trends.activityTrend}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="caption">Sophistication Trend</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {selectedActor.trends.sophisticationTrend === 'increasing' && <TrendingUp color="success" />}
                          {selectedActor.trends.sophisticationTrend === 'decreasing' && <TrendingDown color="error" />}
                          {selectedActor.trends.sophisticationTrend === 'stable' && <BarChart color="info" />}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {selectedActor.trends.sophisticationTrend}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="caption">Evolution Phases</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List dense>
                            {selectedActor.evolutionPhases.map((phase, idx) => (
                              <ListItem key={idx}>
                                <ListItemText
                                  primary={phase.phase}
                                  secondary={phase.characteristics.join(', ')}
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

              {selectedTab === 2 && selectedActor && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Activity Statistics</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {selectedActor.statistics.totalEvents}
                        </Typography>
                        <Typography variant="caption">Total Events</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="warning">
                          {selectedActor.statistics.campaignCount}
                        </Typography>
                        <Typography variant="caption">Campaigns</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="info">
                          {selectedActor.statistics.averageEventsPerMonth}
                        </Typography>
                        <Typography variant="caption">Events/Month</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="error">
                          {selectedActor.statistics.longestDormancy}
                        </Typography>
                        <Typography variant="caption">Max Dormancy (days)</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Event Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Event Details
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>{selectedEvent.title}</Typography>
                <Typography variant="body2" paragraph>{selectedEvent.description}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Event Information</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Type" secondary={selectedEvent.type} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Timestamp" secondary={selectedEvent.timestamp.toLocaleString()} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Severity" secondary={selectedEvent.severity} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Confidence" secondary={`${selectedEvent.confidence}%`} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Additional Details</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Location" secondary={selectedEvent.location || 'Unknown'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Targets" secondary={selectedEvent.targets?.join(', ') || 'None specified'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Techniques" secondary={selectedEvent.techniques?.join(', ') || 'None specified'} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Sources" secondary={selectedEvent.sources.join(', ')} />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained">View Related Events</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThreatActorTimelineAnalysis;