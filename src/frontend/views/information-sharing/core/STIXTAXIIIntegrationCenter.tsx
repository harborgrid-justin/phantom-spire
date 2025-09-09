/**
 * STIX/TAXII Integration Center
 * Platform for managing STIX/TAXII standard integrations and data exchange
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
  LinearProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  IconButton
} from '@mui/material';
import { 
  Widgets as Integration, 
  CloudSync, 
  Security, 
  DataObject,
  Add,
  Edit,
  Delete,
  CheckCircle,  Error as ErrorIcon,
  Warning,
  Sync,
  Download,
  Upload,
  Settings,
  Visibility
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';
import { Status, Priority } from '../../../types/index';

interface STIXServer {
  id: string;
  name: string;
  endpoint: string;
  version: 'TAXII 1.1' | 'TAXII 2.0' | 'TAXII 2.1';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: string;
  collections: number;
  objects: number;
  authentication: 'none' | 'basic' | 'certificate' | 'oauth';
  isProducer: boolean;
  isConsumer: boolean;
}

interface STIXCollection {
  id: string;
  title: string;
  description: string;
  server: string;
  objectCount: number;
  lastUpdate: string;
  canRead: boolean;
  canWrite: boolean;
  mediaTypes: string[];
}

interface STIXObject {
  id: string;
  type: string;
  spec_version: string;
  created: string;
  modified: string;
  labels: string[];
  confidence: number;
  source: string;
}

export const STIXTAXIIIntegrationCenter: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('stix-taxii');

  const [currentTab, setCurrentTab] = useState(0);
  const [addServerOpen, setAddServerOpen] = useState(false);

  const [stixServers, setStixServers] = useState<STIXServer[]>([
    {
      id: 'server-001',
      name: 'US-CERT TAXII Server',
      endpoint: 'https://taxii.us-cert.gov/taxii',
      version: 'TAXII 2.1',
      status: 'connected',
      lastSync: '2024-01-15T10:30:00Z',
      collections: 12,
      objects: 15420,
      authentication: 'certificate',
      isProducer: false,
      isConsumer: true
    },
    {
      id: 'server-002',
      name: 'MISP TAXII Instance',
      endpoint: 'https://misp.company.com/taxii2',
      version: 'TAXII 2.0',
      status: 'connected',
      lastSync: '2024-01-15T09:45:00Z',
      collections: 8,
      objects: 8900,
      authentication: 'basic',
      isProducer: true,
      isConsumer: true
    },
    {
      id: 'server-003',
      name: 'Partner STIX Repository',
      endpoint: 'https://partner.threat-intel.org/taxii',
      version: 'TAXII 2.1',
      status: 'error',
      lastSync: '2024-01-14T16:20:00Z',
      collections: 5,
      objects: 3450,
      authentication: 'oauth',
      isProducer: false,
      isConsumer: true
    }
  ]);

  const [stixCollections, setStixCollections] = useState<STIXCollection[]>([
    {
      id: 'collection-001',
      title: 'Malware Indicators',
      description: 'Indicators of compromise for known malware families',
      server: 'US-CERT TAXII Server',
      objectCount: 5420,
      lastUpdate: '2024-01-15T10:30:00Z',
      canRead: true,
      canWrite: false,
      mediaTypes: ['application/stix+json;version=2.1']
    },
    {
      id: 'collection-002',
      title: 'APT Campaign Data',
      description: 'Advanced persistent threat campaign information',
      server: 'MISP TAXII Instance',
      objectCount: 2340,
      lastUpdate: '2024-01-15T09:45:00Z',
      canRead: true,
      canWrite: true,
      mediaTypes: ['application/stix+json;version=2.0']
    },
    {
      id: 'collection-003',
      title: 'Infrastructure IOCs',
      description: 'Network infrastructure indicators and relationships',
      server: 'Partner STIX Repository',
      objectCount: 1890,
      lastUpdate: '2024-01-14T16:20:00Z',
      canRead: true,
      canWrite: false,
      mediaTypes: ['application/stix+json;version=2.1']
    }
  ]);

  const [recentObjects, setRecentObjects] = useState<STIXObject[]>([
    {
      id: 'indicator--01234567-89ab-cdef-0123-456789abcdef',
      type: 'indicator',
      spec_version: '2.1',
      created: '2024-01-15T10:30:00Z',
      modified: '2024-01-15T10:30:00Z',
      labels: ['malicious-activity'],
      confidence: 85,
      source: 'US-CERT TAXII Server'
    },
    {
      id: 'malware--11234567-89ab-cdef-0123-456789abcdef',
      type: 'malware',
      spec_version: '2.0',
      created: '2024-01-15T09:45:00Z',
      modified: '2024-01-15T09:45:00Z',
      labels: ['trojan'],
      confidence: 92,
      source: 'MISP TAXII Instance'
    },
    {
      id: 'threat-actor--21234567-89ab-cdef-0123-456789abcdef',
      type: 'threat-actor',
      spec_version: '2.1',
      created: '2024-01-15T08:15:00Z',
      modified: '2024-01-15T08:15:00Z',
      labels: ['nation-state'],
      confidence: 78,
      source: 'Partner STIX Repository'
    }
  ]);

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('stix-taxii-integration', {
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
      case 'connected': return 'success';
      case 'disconnected': return 'default';
      case 'error': return 'error';
      case 'syncing': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle />;
      case 'disconnected': return <ErrorIcon />;
      case 'error': return <ErrorIcon />;
      case 'syncing': return <Sync className="rotate" />;
      default: return <Warning />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Integration color="primary" />
        🔗 STIX/TAXII Integration Center
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage STIX/TAXII servers, collections, and automated threat intelligence data exchange.
      </Typography>

      {/* Status Overview */}
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Integration Status:</strong> 3 TAXII servers connected • 25 collections available • 28,760 STIX objects synchronized
        </Typography>
      </Alert>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="TAXII Servers" />
          <Tab label="Collections" />
          <Tab label="STIX Objects" />
          <Tab label="Sync Settings" />
        </Tabs>
      </Paper>

      {/* TAXII Servers Tab */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  TAXII Server Connections
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => setAddServerOpen(true)}
                >
                  Add Server
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Server Name</TableCell>
                      <TableCell>Endpoint</TableCell>
                      <TableCell>Version</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Collections</TableCell>
                      <TableCell>Objects</TableCell>
                      <TableCell>Last Sync</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stixServers.map((server) => (
                      <TableRow key={server.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DataObject color="primary" />
                            <Box>
                              <Typography variant="subtitle2">{server.name}</Typography>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {server.isProducer && (
                                  <Chip label="Producer" size="small" color="success" />
                                )}
                                {server.isConsumer && (
                                  <Chip label="Consumer" size="small" color="info" />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {server.endpoint}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={server.version} variant="outlined" size="small" />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(server.status)}
                            <Chip 
                              label={server.status} 
                              color={getStatusColor(server.status)}
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{server.collections}</TableCell>
                        <TableCell>{server.objects.toLocaleString()}</TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {new Date(server.lastSync).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" color="primary">
                              <Sync />
                            </IconButton>
                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Delete />
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

      {/* Collections Tab */}
      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Available Collections
              </Typography>
              <List>
                {stixCollections.map((collection) => (
                  <ListItem key={collection.id} divider>
                    <ListItemIcon>
                      <DataObject color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{collection.title}</Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {collection.canRead && (
                              <Chip label="Read" size="small" color="success" />
                            )}
                            {collection.canWrite && (
                              <Chip label="Write" size="small" color="info" />
                            )}
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {collection.description}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Server: {collection.server} • Objects: {collection.objectCount.toLocaleString()}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="textSecondary">
                            Last updated: {new Date(collection.lastUpdate).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button variant="outlined" startIcon={<Visibility />} size="small">
                        Browse
                      </Button>
                      <Button variant="outlined" startIcon={<Download />} size="small">
                        Export
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
                  Collection Statistics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Total Collections
                    </Typography>
                    <Typography variant="h4" color="primary">
                      25
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Readable Collections
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      23
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Writable Collections
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      8
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* STIX Objects Tab */}
      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent STIX Objects
              </Typography>
              <List>
                {recentObjects.map((object) => (
                  <ListItem key={object.id} divider>
                    <ListItemIcon>
                      <Security color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{object.type}</Typography>
                          <Chip label={`STIX ${object.spec_version}`} size="small" variant="outlined" />
                          <Chip label={`${object.confidence}% confidence`} size="small" color="info" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            ID: {object.id}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Source: {object.source} • Created: {new Date(object.created).toLocaleString()}
                          </Typography>
                          {object.labels.length > 0 && (
                            <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {object.labels.map((label, index) => (
                                <Chip key={index} label={label} size="small" variant="outlined" />
                              ))}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button variant="outlined" size="small">
                        View Details
                      </Button>
                      <Button variant="outlined" startIcon={<Download />} size="small">
                        Export
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Add Server Dialog */}
      <Dialog open={addServerOpen} onClose={() => setAddServerOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add TAXII Server</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Server Name"
              fullWidth
              variant="outlined"
            />
            <TextField
              label="TAXII Endpoint URL"
              fullWidth
              variant="outlined"
              placeholder="https://example.com/taxii2/"
            />
            <FormControl fullWidth>
              <InputLabel>TAXII Version</InputLabel>
              <Select label="TAXII Version">
                <MenuItem value="TAXII 2.1">TAXII 2.1</MenuItem>
                <MenuItem value="TAXII 2.0">TAXII 2.0</MenuItem>
                <MenuItem value="TAXII 1.1">TAXII 1.1</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Authentication</InputLabel>
              <Select label="Authentication">
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="basic">Basic Authentication</MenuItem>
                <MenuItem value="certificate">Certificate</MenuItem>
                <MenuItem value="oauth">OAuth 2.0</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Switch />}
              label="Enable as Producer (share our intelligence)"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable as Consumer (receive intelligence)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddServerOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddServerOpen(false)}>
            Test & Add Server
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