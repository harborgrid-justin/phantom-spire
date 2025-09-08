/**
 * Incident Response Center
 * Comprehensive incident management and response coordination
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Alert,
  Tooltip,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Divider,
  Tab,
  Tabs,
  useTheme,
  alpha,
  Snackbar
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineConnector,
  TimelineSeparator,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  BugReport,
  Add,
  Assignment,
  Person,
  Schedule,
  Warning,
  CheckCircle,  Error as ErrorIcon,
  Info,
  PlayArrow,
  Pause,
  Stop,
  MoreVert,
  Edit,
  Delete,
  Share,
  Timeline as TimelineIcon,
  Speed,
  Security,
  Visibility,
  Comment,
  Attachment,
  Group,
  Notifications,
  Flag
} from '@mui/icons-material';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { SecurityIncident, IncidentStatus, IncidentPriority, ThreatSeverity } from '../../types/common';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

interface IncidentMetrics {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  averageResolutionTime: number;
  escalatedCount: number;
  criticalCount: number;
}

interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assignee?: string;
  estimatedDuration: number;
  actualDuration?: number;
  dependencies?: string[];
  automatable: boolean;
}

interface IncidentPlaybook {
  id: string;
  name: string;
  description: string;
  applicableTypes: string[];
  steps: PlaybookStep[];
  estimatedTotalTime: number;
}

export const IncidentResponseCenter: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
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
  } = useServicePage('incident');
  
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [metrics, setMetrics] = useState<IncidentMetrics | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPlaybookDialog, setShowPlaybookDialog] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<IncidentPlaybook | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('incident-response-center', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 120000
    });

    return () => evaluationController.remove();
  }, []);

  // Load incidents and metrics
  useEffect(() => {
    loadIncidents();
    loadMetrics();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      // Mock incident data
      const mockIncidents: SecurityIncident[] = generateMockIncidents();
      setIncidents(mockIncidents);
    } catch (error) {
      console.error('Failed to load incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    // Mock metrics
    const mockMetrics: IncidentMetrics = {
      total: 167,
      open: 23,
      inProgress: 12,
      resolved: 132,
      averageResolutionTime: 4.2, // hours
      escalatedCount: 3,
      criticalCount: 5
    };
    setMetrics(mockMetrics);
  };

  // Business logic operations
  const handleCreateIncident = async (incidentData: any) => {
    try {
      await businessLogic.execute('create-incident', incidentData, 'high');
      addNotification('success', 'Incident created successfully');
      await loadIncidents();
      setShowCreateDialog(false);
    } catch (error) {
      addNotification('error', 'Failed to create incident');
    }
  };

  const handleAssignIncident = async (incidentId: string, assigneeId: string) => {
    try {
      await businessLogic.execute('assign-incident', { incidentId, assigneeId });
      addNotification('info', 'Incident assigned successfully');
      await loadIncidents();
    } catch (error) {
      addNotification('error', 'Failed to assign incident');
    }
  };

  const handleEscalateIncident = async (incidentId: string) => {
    try {
      await businessLogic.execute('escalate-incident', { incidentId }, 'critical');
      addNotification('warning', 'Incident escalated to senior team');
      await loadIncidents();
    } catch (error) {
      addNotification('error', 'Failed to escalate incident');
    }
  };

  const handleRunPlaybook = async (incidentId: string, playbookId: string) => {
    try {
      await businessLogic.execute('run-incident-playbook', { incidentId, playbookId }, 'medium');
      addNotification('info', 'Incident playbook execution started');
    } catch (error) {
      addNotification('error', 'Failed to run incident playbook');
    }
  };

  const handleRefreshIncidents = async () => {
    try {
      await refresh();
      await loadIncidents();
      await loadMetrics();
      addNotification('success', 'Incident data refreshed');
    } catch (error) {
      addNotification('error', 'Failed to refresh incidents');
    }
  };

  const generateMockIncidents = (): SecurityIncident[] => {
    const mockIncidents: SecurityIncident[] = [];
    const statuses: IncidentStatus[] = ['new', 'assigned', 'in_progress', 'investigating', 'resolved'];
    const priorities: IncidentPriority[] = ['low', 'medium', 'high', 'critical'];
    const severities: ThreatSeverity[] = ['low', 'medium', 'high', 'critical'];
    const titles = [
      'Suspicious network activity detected',
      'Malware infection on workstation',
      'Phishing email campaign identified',
      'Data exfiltration attempt',
      'Unauthorized access to database',
      'Ransomware indicators detected',
      'APT activity observed',
      'Credential theft incident',
      'DDoS attack in progress',
      'Insider threat investigation'
    ];

    for (let i = 0; i < 25; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      mockIncidents.push({
        id: `INC-2024-${String(i + 1).padStart(4, '0')}`,
        title,
        description: `Investigation required for ${title.toLowerCase()}. Initial triage indicates ${severity} severity incident requiring ${priority} priority response.`,
        severity,
        status,
        priority,
        assignee: Math.random() > 0.3 ? 'John Smith' : undefined,
        reporter: 'Security Analyst',
        createdAt,
        updatedAt: new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        dueDate: priority === 'critical' ? new Date(createdAt.getTime() + 2 * 60 * 60 * 1000) : undefined,
        tags: ['security', priority === 'critical' ? 'urgent' : 'standard'],
        indicators: [`IOC-${Math.floor(Math.random() * 1000)}`],
        artifacts: [],
        timeline: [
          {
            id: '1',
            timestamp: createdAt,
            user: 'System',
            action: 'Incident Created',
            description: 'Initial incident report generated'
          }
        ],
        mttrData: status === 'resolved' ? {
          timeToDetection: Math.random() * 60,
          timeToResponse: Math.random() * 120,
          timeToContainment: Math.random() * 240,
          timeToResolution: Math.random() * 480
        } : undefined,
        impact: {
          affectedSystems: Math.floor(Math.random() * 10) + 1,
          affectedUsers: Math.floor(Math.random() * 100) + 10,
          dataExfiltrated: Math.random() > 0.8,
          businessImpact: priority as any
        }
      });
    }

    return mockIncidents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'new': return theme.palette.info.main;
      case 'assigned': return theme.palette.warning.main;
      case 'in_progress': return theme.palette.primary.main;
      case 'investigating': return theme.palette.secondary.main;
      case 'resolved': return theme.palette.success.main;
      case 'closed': return theme.palette.grey[500];
      default: return theme.palette.grey[400];
    }
  };

  const getPriorityColor = (priority: IncidentPriority) => {
    switch (priority) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getSeverityColor = (severity: ThreatSeverity) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Recently';
  };

  const filteredIncidents = useMemo(() => {
    switch (activeTab) {
      case 0: return incidents; // All
      case 1: return incidents.filter(i => ['new', 'assigned', 'in_progress', 'investigating'].includes(i.status)); // Active
      case 2: return incidents.filter(i => i.priority === 'critical' || i.priority === 'high'); // High Priority
      case 3: return incidents.filter(i => !i.assignee); // Unassigned
      case 4: return incidents.filter(i => i.status === 'resolved' || i.status === 'closed'); // Resolved
      default: return incidents;
    }
  }, [incidents, activeTab]);

  const mockPlaybooks: IncidentPlaybook[] = [
    {
      id: 'malware-response',
      name: 'Malware Incident Response',
      description: 'Standard response procedures for malware infections',
      applicableTypes: ['malware', 'virus', 'trojan'],
      estimatedTotalTime: 240,
      steps: [
        {
          id: 'isolate',
          title: 'Isolate Affected Systems',
          description: 'Immediately isolate infected systems from the network',
          status: 'completed',
          estimatedDuration: 15,
          actualDuration: 12,
          assignee: 'Security Team',
          automatable: true
        },
        {
          id: 'analyze',
          title: 'Malware Analysis',
          description: 'Analyze the malware sample and identify indicators',
          status: 'in_progress',
          estimatedDuration: 60,
          assignee: 'Malware Analyst',
          dependencies: ['isolate'],
          automatable: false
        },
        {
          id: 'cleanup',
          title: 'System Cleanup',
          description: 'Remove malware and restore system integrity',
          status: 'pending',
          estimatedDuration: 90,
          dependencies: ['analyze'],
          automatable: false
        },
        {
          id: 'monitor',
          title: 'Post-Incident Monitoring',
          description: 'Monitor for signs of reinfection or lateral movement',
          status: 'pending',
          estimatedDuration: 60,
          dependencies: ['cleanup'],
          automatable: true
        }
      ]
    }
  ];

  const renderIncidentCard = (incident: SecurityIncident) => (
    <Card
      key={incident.id}
      elevation={2}
      sx={{
        mb: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          elevation: 4,
          transform: 'translateY(-2px)'
        },
        borderLeft: `4px solid ${getPriorityColor(incident.priority)}`
      }}
      onClick={() => setSelectedIncident(incident)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                {incident.id}
              </Typography>
              <Chip
                size="small"
                label={incident.status.replace('_', ' ').toUpperCase()}
                sx={{
                  bgcolor: alpha(getStatusColor(incident.status), 0.1),
                  color: getStatusColor(incident.status),
                  border: `1px solid ${getStatusColor(incident.status)}`
                }}
              />
              <Chip
                size="small"
                label={incident.priority.toUpperCase()}
                sx={{
                  bgcolor: alpha(getPriorityColor(incident.priority), 0.1),
                  color: getPriorityColor(incident.priority)
                }}
              />
            </Box>
            <Typography variant="body1" fontWeight="medium" gutterBottom>
              {incident.title}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              {incident.description.length > 150
                ? `${incident.description.substring(0, 150)}...`
                : incident.description}
            </Typography>
          </Box>
          
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Person sx={{ fontSize: 16, color: 'action.active' }} />
              <Typography variant="caption">
                {incident.assignee || 'Unassigned'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Schedule sx={{ fontSize: 16, color: 'action.active' }} />
              <Typography variant="caption">
                {getTimeAgo(incident.createdAt)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Security sx={{ fontSize: 16, color: 'action.active' }} />
              <Typography variant="caption">
                {incident.indicators.length} IOCs
              </Typography>
            </Box>
          </Box>

          {incident.priority === 'critical' && (
            <Chip
              size="small"
              icon={<Warning />}
              label="URGENT"
              color="error"
              variant="filled"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            🚨 Incident Response Center
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowCreateDialog(true)}
            >
              Create Incident
            </Button>
            <Button
              variant="outlined"
              startIcon={<Assignment />}
              onClick={() => setShowPlaybookDialog(true)}
            >
              Playbooks
            </Button>
          </Box>
        </Box>

        {/* Metrics Cards */}
        {metrics && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {metrics.total}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Incidents
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="error" fontWeight="bold">
                    {metrics.open}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Open
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="warning" fontWeight="bold">
                    {metrics.inProgress}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    In Progress
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="success" fontWeight="bold">
                    {metrics.resolved}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Resolved
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="info" fontWeight="bold">
                    {metrics.averageResolutionTime}h
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Avg Resolution
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="error" fontWeight="bold">
                    {metrics.criticalCount}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Critical
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Tabs */}
      <Paper elevation={1} sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={<Badge badgeContent={incidents.length} color="default" max={999}>All Incidents</Badge>} />
          <Tab label={<Badge badgeContent={incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length} color="primary" max={999}>Active</Badge>} />
          <Tab label={<Badge badgeContent={incidents.filter(i => ['critical', 'high'].includes(i.priority)).length} color="error" max={999}>High Priority</Badge>} />
          <Tab label={<Badge badgeContent={incidents.filter(i => !i.assignee).length} color="warning" max={999}>Unassigned</Badge>} />
          <Tab label={<Badge badgeContent={incidents.filter(i => ['resolved', 'closed'].includes(i.status)).length} color="success" max={999}>Resolved</Badge>} />
        </Tabs>
      </Paper>

      {/* Incident List */}
      <Grid container spacing={3} sx={{ flex: 1, overflow: 'auto' }}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Incidents ({filteredIncidents.length})
            </Typography>
            
            {filteredIncidents.map(renderIncidentCard)}
            
            {filteredIncidents.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <BugReport sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  No incidents found
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  All clear! No incidents match the current filter criteria.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Incident Details Panel */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            {selectedIncident ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedIncident.id}
                  </Typography>
                  <Box>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small">
                      <Share />
                    </IconButton>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body1" fontWeight="medium" gutterBottom>
                  {selectedIncident.title}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    label={selectedIncident.status.replace('_', ' ').toUpperCase()}
                    sx={{
                      bgcolor: alpha(getStatusColor(selectedIncident.status), 0.1),
                      color: getStatusColor(selectedIncident.status)
                    }}
                  />
                  <Chip
                    size="small"
                    label={`${selectedIncident.priority.toUpperCase()} PRIORITY`}
                    sx={{
                      bgcolor: alpha(getPriorityColor(selectedIncident.priority), 0.1),
                      color: getPriorityColor(selectedIncident.priority)
                    }}
                  />
                  <Chip
                    size="small"
                    label={`${selectedIncident.severity.toUpperCase()} SEVERITY`}
                    sx={{
                      bgcolor: alpha(getSeverityColor(selectedIncident.severity), 0.1),
                      color: getSeverityColor(selectedIncident.severity)
                    }}
                  />
                </Box>

                <Typography variant="body2" color="textSecondary" paragraph>
                  {selectedIncident.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Incident Details
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2" color="textSecondary">Assignee:</Typography>
                    <Typography variant="body2">{selectedIncident.assignee || 'Unassigned'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2" color="textSecondary">Reporter:</Typography>
                    <Typography variant="body2">{selectedIncident.reporter}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2" color="textSecondary">Created:</Typography>
                    <Typography variant="body2">{selectedIncident.createdAt.toLocaleDateString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2" color="textSecondary">IOCs:</Typography>
                    <Typography variant="body2">{selectedIncident.indicators.length}</Typography>
                  </Box>
                </Box>

                {selectedIncident.impact && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Impact Assessment
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">Affected Systems:</Typography>
                      <Typography variant="body2">{selectedIncident.impact.affectedSystems}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">Affected Users:</Typography>
                      <Typography variant="body2">{selectedIncident.impact.affectedUsers}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" color="textSecondary">Data Exfiltrated:</Typography>
                      <Typography variant="body2">{selectedIncident.impact.dataExfiltrated ? 'Yes' : 'No'}</Typography>
                    </Box>
                  </Box>
                )}

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Recent Activity
                  </Typography>
                  <Timeline sx={{ p: 0 }}>
                    {selectedIncident.timeline.slice(0, 3).map((entry, index) => (
                      <TimelineItem key={entry.id}>
                        <TimelineOppositeContent sx={{ flex: 0.3 }}>
                          <Typography variant="caption" color="textSecondary">
                            {entry.timestamp.toLocaleTimeString()}
                          </Typography>
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <TimelineDot color="primary" />
                          {index < selectedIncident.timeline.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body2" fontWeight="medium">
                            {entry.action}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            by {entry.user}
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button size="small" variant="outlined" startIcon={<PlayArrow />}>
                    Start Playbook
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<Person />}>
                    Assign
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<Comment />}>
                    Add Comment
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Assignment sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  Select an Incident
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Click on an incident to view its details and manage the response.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Create Incident Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Incident</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Incident Title"
                placeholder="Brief description of the incident..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                placeholder="Detailed description of the incident..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select defaultValue="medium">
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select defaultValue="medium">
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Assignee"
                placeholder="Assign to team member..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tags"
                placeholder="malware, phishing, etc. (comma-separated)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Create Incident
          </Button>
        </DialogActions>
      </Dialog>

      {/* Playbook Dialog */}
      <Dialog
        open={showPlaybookDialog}
        onClose={() => setShowPlaybookDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Incident Response Playbooks</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {mockPlaybooks.map((playbook) => (
              <Grid item xs={12} md={6} key={playbook.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {playbook.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {playbook.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="textSecondary">
                        Estimated Duration: {Math.floor(playbook.estimatedTotalTime / 60)}h {playbook.estimatedTotalTime % 60}m
                      </Typography>
                    </Box>

                    <Stepper orientation="vertical" sx={{ mt: 2 }}>
                      {playbook.steps.slice(0, 3).map((step) => (
                        <Step key={step.id} active={step.status !== 'pending'} completed={step.status === 'completed'}>
                          <StepLabel>
                            <Typography variant="body2">
                              {step.title}
                            </Typography>
                          </StepLabel>
                        </Step>
                      ))}
                      {playbook.steps.length > 3 && (
                        <Step>
                          <StepLabel>
                            <Typography variant="caption" color="textSecondary">
                              +{playbook.steps.length - 3} more steps
                            </Typography>
                          </StepLabel>
                        </Step>
                      )}
                    </Stepper>
                  </CardContent>
                  <CardActions>
                    <Button size="small">
                      View Details
                    </Button>
                    <Button size="small" variant="contained">
                      Execute
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPlaybookDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

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

      <Routes>
        <Route path="/active" element={<div>Active Incidents Component</div>} />
        <Route path="/resolved" element={<div>Resolved Incidents Component</div>} />
        <Route path="/create" element={<div>Create Incident Component</div>} />
        <Route path="/:id" element={<div>Incident Details Component</div>} />
      </Routes>
    </Box>
  );
};
