/**
 * Partner Collaboration Portal
 * Platform for managing partner organizations and collaborative activities
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
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  Groups, 
  Business, 
  Security, 
  Timeline,
  Add,
  Edit,
  Delete,
  CheckCircle,
  Pending,
  Block,
  Message,
  Assignment,
  Assessment
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';

interface Partner {
  id: string;
  name: string;
  type: 'Government' | 'Commercial' | 'ISAC' | 'Academic' | 'NGO';
  industry: string;
  status: 'active' | 'pending' | 'inactive' | 'suspended';
  trustLevel: 'verified' | 'standard' | 'limited';
  joinDate: string;
  lastActivity: string;
  sharedAssets: number;
  collaborativeProjects: number;
  contactPerson: string;
  email: string;
}

interface CollaborativeProject {
  id: string;
  title: string;
  partners: string[];
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate?: string;
  description: string;
  progress: number;
}

export const PartnerCollaborationPortal: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('partner-collaboration');

  const [currentTab, setCurrentTab] = useState(0);
  const [addPartnerOpen, setAddPartnerOpen] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([
    {
      id: 'partner-001',
      name: 'Financial Services ISAC',
      type: 'ISAC',
      industry: 'Financial Services',
      status: 'active',
      trustLevel: 'verified',
      joinDate: '2023-06-15',
      lastActivity: '2024-01-15T10:30:00Z',
      sharedAssets: 1247,
      collaborativeProjects: 8,
      contactPerson: 'Jane Smith',
      email: 'j.smith@fs-isac.org'
    },
    {
      id: 'partner-002',
      name: 'National Cyber Security Centre',
      type: 'Government',
      industry: 'Cybersecurity',
      status: 'active',
      trustLevel: 'verified',
      joinDate: '2023-03-20',
      lastActivity: '2024-01-15T09:15:00Z',
      sharedAssets: 2156,
      collaborativeProjects: 12,
      contactPerson: 'Dr. Michael Johnson',
      email: 'm.johnson@ncsc.gov.uk'
    },
    {
      id: 'partner-003',
      name: 'CyberTech Research Institute',
      type: 'Academic',
      industry: 'Research',
      status: 'pending',
      trustLevel: 'standard',
      joinDate: '2024-01-10',
      lastActivity: '2024-01-14T16:45:00Z',
      sharedAssets: 45,
      collaborativeProjects: 2,
      contactPerson: 'Prof. Sarah Williams',
      email: 's.williams@cybertech.edu'
    }
  ]);

  const [projects, setProjects] = useState<CollaborativeProject[]>([
    {
      id: 'proj-001',
      title: 'APT29 Attribution Research',
      partners: ['Financial Services ISAC', 'National Cyber Security Centre'],
      status: 'active',
      startDate: '2024-01-01',
      description: 'Joint research project on APT29 tactics, techniques, and procedures',
      progress: 67
    },
    {
      id: 'proj-002',
      title: 'Banking Trojan Defense Initiative',
      partners: ['Financial Services ISAC', 'CyberTech Research Institute'],
      status: 'planning',
      startDate: '2024-02-01',
      description: 'Collaborative defense against emerging banking trojans',
      progress: 15
    },
    {
      id: 'proj-003',
      title: 'Supply Chain Security Framework',
      partners: ['National Cyber Security Centre', 'CyberTech Research Institute'],
      status: 'active',
      startDate: '2023-11-15',
      description: 'Development of comprehensive supply chain security guidelines',
      progress: 89
    }
  ]);

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('partner-collaboration', {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getTrustLevelIcon = (trustLevel: string) => {
    switch (trustLevel) {
      case 'verified': return <CheckCircle color="success" />;
      case 'standard': return <Pending color="warning" />;
      case 'limited': return <Block color="error" />;
      default: return <Security />;
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'planning': return 'info';
      case 'completed': return 'default';
      case 'on-hold': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Groups color="primary" />
        🤝 Partner Collaboration Portal
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage partner organizations and collaborative threat intelligence initiatives.
      </Typography>

      {/* Status Overview */}
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Portal Status:</strong> 24 active partners • 8 ongoing projects • 12 new collaboration requests
        </Typography>
      </Alert>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="Partner Organizations" />
          <Tab label="Collaborative Projects" />
          <Tab label="Partnership Analytics" />
          <Tab label="Onboarding" />
        </Tabs>
      </Paper>

      {/* Partner Organizations Tab */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Partner Organizations
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => setAddPartnerOpen(true)}
                >
                  Add Partner
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Organization</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Trust Level</TableCell>
                      <TableCell>Shared Assets</TableCell>
                      <TableCell>Projects</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {partners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                              {partner.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">{partner.name}</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {partner.industry}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={partner.type} variant="outlined" size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={partner.status} 
                            color={getStatusColor(partner.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getTrustLevelIcon(partner.trustLevel)}
                            <Typography variant="body2">{partner.trustLevel}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{partner.sharedAssets.toLocaleString()}</TableCell>
                        <TableCell>{partner.collaborativeProjects}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button startIcon={<Edit />} size="small" variant="outlined">
                              Edit
                            </Button>
                            <Button startIcon={<Message />} size="small" variant="outlined">
                              Contact
                            </Button>
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

      {/* Collaborative Projects Tab */}
      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Active Collaborative Projects
              </Typography>
              <List>
                {projects.map((project) => (
                  <ListItem key={project.id} divider>
                    <ListItemIcon>
                      <Assignment color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{project.title}</Typography>
                          <Chip 
                            label={project.status} 
                            color={getProjectStatusColor(project.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {project.description}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Partners: {project.partners.join(', ')}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={project.progress} 
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption" color="textSecondary">
                              Progress: {project.progress}%
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <Button variant="outlined" size="small">
                      View Details
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Project Statistics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Active Projects
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      8
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Planning Phase
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      3
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Completed This Year
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      12
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Add Partner Dialog */}
      <Dialog open={addPartnerOpen} onClose={() => setAddPartnerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Partner Organization</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Organization Name"
              fullWidth
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>Organization Type</InputLabel>
              <Select label="Organization Type">
                <MenuItem value="Government">Government</MenuItem>
                <MenuItem value="Commercial">Commercial</MenuItem>
                <MenuItem value="ISAC">ISAC</MenuItem>
                <MenuItem value="Academic">Academic</MenuItem>
                <MenuItem value="NGO">NGO</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Industry"
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Contact Person"
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
            />
            <FormControlLabel
              control={<Switch />}
              label="Require approval for asset sharing"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPartnerOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddPartnerOpen(false)}>
            Send Invitation
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