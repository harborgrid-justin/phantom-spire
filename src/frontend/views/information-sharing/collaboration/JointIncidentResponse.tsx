/**
 * Joint Incident Response
 * Collaborative incident response coordination platform
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,

  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
} from '@mui/lab';
import { 
  Emergency, 
  Groups, 
  Share, 
  Schedule,
  Add,
  Edit,
  Message,
  Assignment,
  Warning,
  CheckCircle,  Error as ErrorIcon,
  Info,
  Person,
  Business,
  AccessTime,
  Flag,
  Assessment
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';

interface JointIncident {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'contained' | 'resolved' | 'investigating';
  leadOrganization: string;
  participatingOrgs: string[];
  createdAt: string;
  lastUpdate: string;
  affectedSystems: number;
  estimatedImpact: string;
  incidentType: 'malware' | 'data-breach' | 'ddos' | 'apt' | 'insider-threat';
  coordinator: string;
}

interface ResponseAction {
  id: string;
  incidentId: string;
  action: string;
  assignedTo: string;
  organization: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  createdAt: string;
  completedAt?: string;
}

interface ResponseTeam {
  id: string;
  name: string;
  organization: string;
  role: 'lead' | 'support' | 'observer';
  members: number;
  expertise: string[];
  availability: 'available' | 'busy' | 'offline';
  lastActive: string;
}

export const JointIncidentResponse: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('joint-incident-response');

  const [currentTab, setCurrentTab] = useState(0);
  const [createIncidentOpen, setCreateIncidentOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);

  const [activeIncidents, setActiveIncidents] = useState<JointIncident[]>([
    {
      id: 'incident-001',
      title: 'Multi-Bank APT29 Compromise',
      severity: 'critical',
      status: 'active',
      leadOrganization: 'Financial Services ISAC',
      participatingOrgs: ['Global Bank Security', 'Regional Credit Union', 'National Cyber Centre'],
      createdAt: '2024-01-15T08:30:00Z',
      lastUpdate: '2024-01-15T10:45:00Z',
      affectedSystems: 12,
      estimatedImpact: '$2.5M potential loss',
      incidentType: 'apt',
      coordinator: 'Sarah Johnson (FS-ISAC)'
    },
    {
      id: 'incident-002',
      title: 'Supply Chain Malware Distribution',
      severity: 'high',
      status: 'investigating',
      leadOrganization: 'National Cyber Security Centre',
      participatingOrgs: ['Manufacturing ISAC', 'Tech Vendor Alliance'],
      createdAt: '2024-01-15T06:15:00Z',
      lastUpdate: '2024-01-15T09:30:00Z',
      affectedSystems: 8,
      estimatedImpact: 'Multiple vendor compromise',
      incidentType: 'malware',
      coordinator: 'Dr. Michael Chen (NCSC)'
    },
    {
      id: 'incident-003',
      title: 'Energy Sector DDoS Campaign',
      severity: 'medium',
      status: 'contained',
      leadOrganization: 'Energy Security Consortium',
      participatingOrgs: ['Power Grid Alliance', 'Oil & Gas ISAC'],
      createdAt: '2024-01-14T14:20:00Z',
      lastUpdate: '2024-01-15T07:00:00Z',
      affectedSystems: 5,
      estimatedImpact: 'Service disruption - 2 hours',
      incidentType: 'ddos',
      coordinator: 'Alex Rodriguez (ESC)'
    }
  ]);

  const [responseActions, setResponseActions] = useState<ResponseAction[]>([
    {
      id: 'action-001',
      incidentId: 'incident-001',
      action: 'Deploy additional monitoring on critical systems',
      assignedTo: 'Security Team Alpha',
      organization: 'Global Bank Security',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2024-01-15T14:00:00Z',
      createdAt: '2024-01-15T09:00:00Z'
    },
    {
      id: 'action-002',
      incidentId: 'incident-001',
      action: 'Share IOCs with all participating organizations',
      assignedTo: 'Intelligence Team',
      organization: 'Financial Services ISAC',
      status: 'completed',
      priority: 'high',
      dueDate: '2024-01-15T10:00:00Z',
      createdAt: '2024-01-15T08:45:00Z',
      completedAt: '2024-01-15T09:30:00Z'
    },
    {
      id: 'action-003',
      incidentId: 'incident-002',
      action: 'Analyze malware samples',
      assignedTo: 'Malware Research Lab',
      organization: 'National Cyber Security Centre',
      status: 'in-progress',
      priority: 'medium',
      dueDate: '2024-01-15T16:00:00Z',
      createdAt: '2024-01-15T07:30:00Z'
    }
  ]);

  const [responseTeams, setResponseTeams] = useState<ResponseTeam[]>([
    {
      id: 'team-001',
      name: 'Cyber Incident Response Team',
      organization: 'Financial Services ISAC',
      role: 'lead',
      members: 8,
      expertise: ['APT Analysis', 'Forensics', 'Containment'],
      availability: 'available',
      lastActive: '2024-01-15T10:45:00Z'
    },
    {
      id: 'team-002',
      name: 'Threat Intelligence Unit',
      organization: 'National Cyber Security Centre',
      role: 'support',
      members: 12,
      expertise: ['Attribution', 'IOC Analysis', 'Reporting'],
      availability: 'busy',
      lastActive: '2024-01-15T10:30:00Z'
    },
    {
      id: 'team-003',
      name: 'Infrastructure Security',
      organization: 'Global Bank Security',
      role: 'support',
      members: 6,
      expertise: ['Network Security', 'System Hardening', 'Monitoring'],
      availability: 'available',
      lastActive: '2024-01-15T10:15:00Z'
    }
  ]);

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('joint-incident-response', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 180000
    });

    return () => evaluationController.remove();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'error';
      case 'investigating': return 'warning';
      case 'contained': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'in-progress': return 'info';
      case 'completed': return 'success';
      case 'blocked': return 'error';
      default: return 'default';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'success';
      case 'busy': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Emergency color="primary" />
        🚨 Joint Incident Response
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Coordinate multi-organizational incident response efforts and share critical response information.
      </Typography>

      {/* Status Overview */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Response Status:</strong> 3 active incidents • 8 response teams engaged • 12 pending actions
        </Typography>
      </Alert>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="Active Incidents" />
          <Tab label="Response Actions" />
          <Tab label="Response Teams" />
          <Tab label="Incident Timeline" />
        </Tabs>
      </Paper>

      {/* Active Incidents Tab */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Active Joint Incidents
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => setCreateIncidentOpen(true)}
                >
                  Create Incident
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Incident</TableCell>
                      <TableCell>Lead Organization</TableCell>
                      <TableCell>Participants</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Impact</TableCell>
                      <TableCell>Coordinator</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeIncidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">{incident.title}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip 
                                label={incident.severity} 
                                color={getSeverityColor(incident.severity)}
                                size="small"
                              />
                              <Chip 
                                label={incident.incidentType} 
                                variant="outlined"
                                size="small"
                              />
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                              Created: {new Date(incident.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{incident.leadOrganization}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {incident.participatingOrgs.length} organizations
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {incident.affectedSystems} systems affected
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={incident.status} 
                            color={getStatusColor(incident.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{incident.estimatedImpact}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{incident.coordinator}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => setSelectedIncident(incident.id)}
                            >
                              View Details
                            </Button>
                            <IconButton size="small" color="primary">
                              <Message />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Response Actions Tab */}
      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Response Actions
              </Typography>
              <List>
                {responseActions.map((action) => (
                  <ListItem key={action.id} divider>
                    <ListItemIcon>
                      <Assignment color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{action.action}</Typography>
                          <Chip 
                            label={action.status} 
                            color={getActionStatusColor(action.status)}
                            size="small"
                          />
                          <Chip 
                            label={action.priority} 
                            color={action.priority === 'high' ? 'error' : action.priority === 'medium' ? 'warning' : 'info'}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Assigned to: {action.assignedTo} ({action.organization})
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Due: {new Date(action.dueDate).toLocaleString()}
                            {action.completedAt && ` • Completed: ${new Date(action.completedAt).toLocaleString()}`}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button variant="outlined" startIcon={<Edit />} size="small">
                        Update
                      </Button>
                      <Button variant="outlined" startIcon={<Message />} size="small">
                        Comment
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Action Statistics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Pending Actions
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      5
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      In Progress
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      7
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Completed Today
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      12
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Response Teams Tab */}
      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Available Response Teams
              </Typography>
              <List>
                {responseTeams.map((team) => (
                  <ListItem key={team.id} divider>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Groups />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{team.name}</Typography>
                          <Chip 
                            label={team.role} 
                            color={team.role === 'lead' ? 'primary' : 'default'}
                            size="small"
                          />
                          <Chip 
                            label={team.availability} 
                            color={getAvailabilityColor(team.availability)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {team.organization} • {team.members} members
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Expertise: {team.expertise.join(', ')}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="textSecondary">
                            Last active: {new Date(team.lastActive).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button variant="outlined" startIcon={<Message />} size="small">
                        Contact
                      </Button>
                      <Button variant="outlined" startIcon={<Assignment />} size="small">
                        Assign
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Create Incident Dialog */}
      <Dialog open={createIncidentOpen} onClose={() => setCreateIncidentOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Joint Incident</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Incident Title"
              fullWidth
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select label="Severity">
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Incident Type</InputLabel>
              <Select label="Incident Type">
                <MenuItem value="malware">Malware</MenuItem>
                <MenuItem value="data-breach">Data Breach</MenuItem>
                <MenuItem value="ddos">DDoS Attack</MenuItem>
                <MenuItem value="apt">APT Campaign</MenuItem>
                <MenuItem value="insider-threat">Insider Threat</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Estimated Impact"
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Lead Organization"
              fullWidth
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateIncidentOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setCreateIncidentOpen(false)}>
            Create & Notify Partners
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
    </Box>
  );
};