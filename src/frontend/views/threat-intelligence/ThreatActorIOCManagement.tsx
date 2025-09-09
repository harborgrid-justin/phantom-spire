/**
 * Threat Actor IOC Management Component
 * IOC attribution and management for threat actors
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  Avatar,
  Badge
} from '@mui/material';

import {
  Assignment,
  Security,
  Computer,
  Language,
  LocationOn,
  Search,
  FilterList,
  Analytics,
  Download,
  Share,
  Refresh,
  Visibility,
  Edit,
  Delete,
  Add,
  LinkOff,
  CheckCircle,
  Warning,  Error as ErrorIcon,
  Info,
  TrendingUp,
  CompareArrows,
  Hub
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';
import { Status, Priority } from '../../types/index';

// Interfaces
interface ThreatActorIOC {
  id: string;
  type: 'hash' | 'domain' | 'ip' | 'url' | 'email' | 'registry' | 'certificate' | 'mutex';
  value: string;
  actorId: string;
  actorName: string;
  attribution: {
    confidence: number;
    evidence: string[];
    method: 'automatic' | 'manual' | 'external';
    analyst: string;
    timestamp: Date;
  };
  campaigns: string[];
  firstSeen: Date;
  lastSeen: Date;
  status: 'active' | 'expired' | 'sinkholed' | 'unknown';
  tags: string[];
  malwareFamilies: string[];
  context: {
    role: 'c2' | 'dropper' | 'payload' | 'infrastructure' | 'exfil' | 'reconnaissance';
    description: string;
    technicalDetails: string;
  };
  relationships: Array<{
    relatedIOCId: string;
    relationType: 'same_family' | 'infrastructure' | 'campaign' | 'technique';
    confidence: number;
  }>;
  sources: Array<{
    name: string;
    confidence: number;
    firstReported: Date;
    lastUpdated: Date;
  }>;
  enrichment: {
    geolocation?: { country: string; region: string; };
    whoisData?: Record<string, any>;
    dnsData?: Record<string, any>;
    reputation?: { score: number; categories: string[]; };
  };
}

interface IOCFilter {
  actorId: string;
  iocType: string;
  status: string;
  confidence: number;
  timeRange: string;
  campaign: string;
  role: string;
}

const ThreatActorIOCManagement: React.FC = () => {
  const theme = useTheme();
  
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('threat-intelligence-iocs');

  const [iocs, setIOCs] = useState<ThreatActorIOC[]>([]);
  const [selectedIOC, setSelectedIOC] = useState<ThreatActorIOC | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<IOCFilter>({
    actorId: 'all',
    iocType: 'all',
    status: 'all',
    confidence: 50,
    timeRange: '1y',
    campaign: 'all',
    role: 'all'
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const generateMockIOCs = useCallback((): ThreatActorIOC[] => {
    const iocs: ThreatActorIOC[] = [];
    const iocTypes: ThreatActorIOC['type'][] = ['hash', 'domain', 'ip', 'url', 'email', 'registry', 'certificate', 'mutex'];
    const statuses: ThreatActorIOC['status'][] = ['active', 'expired', 'sinkholed', 'unknown'];
    const roles: ThreatActorIOC['context']['role'][] = ['c2', 'dropper', 'payload', 'infrastructure', 'exfil', 'reconnaissance'];

    for (let i = 1; i <= 150; i++) {
      const iocType = iocTypes[Math.floor(Math.random() * iocTypes.length)];
      let value = '';
      
      switch (iocType) {
        case 'hash':
          value = `${Math.random().toString(16).substring(2, 34).padEnd(32, '0')}`;
          break;
        case 'domain':
          value = `malicious-domain-${i}.com`;
          break;
        case 'ip':
          value = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
          break;
        case 'url':
          value = `https://malicious-site-${i}.com/payload.exe`;
          break;
        case 'email':
          value = `attacker${i}@malicious-domain.com`;
          break;
        case 'registry':
          value = `HKLM\\Software\\Malware\\Key${i}`;
          break;
        case 'certificate':
          value = `cert-thumbprint-${i}`;
          break;
        case 'mutex':
          value = `MalwareMutex${i}`;
          break;
      }

      iocs.push({
        id: `ioc-${i}`,
        type: iocType,
        value,
        actorId: `actor-${Math.floor(Math.random() * 15) + 1}`,
        actorName: `ThreatActor-${Math.floor(Math.random() * 15) + 1}`,
        attribution: {
          confidence: Math.floor(Math.random() * 40) + 60,
          evidence: [`Evidence-${i}A`, `Evidence-${i}B`],
          method: ['automatic', 'manual', 'external'][Math.floor(Math.random() * 3)] as any,
          analyst: `analyst${Math.floor(Math.random() * 5) + 1}@company.com`,
          timestamp: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
        },
        campaigns: [`Campaign-${Math.floor(Math.random() * 10) + 1}`],
        firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        tags: ['malware', 'c2', 'apt'].slice(0, Math.floor(Math.random() * 3) + 1),
        malwareFamilies: ['Zeus', 'Emotet', 'Ryuk'].slice(0, Math.floor(Math.random() * 2) + 1),
        context: {
          role: roles[Math.floor(Math.random() * roles.length)],
          description: `IOC context description for ${value}`,
          technicalDetails: `Technical analysis details for IOC ${i}`
        },
        relationships: Array.from({ length: Math.floor(Math.random() * 3) }, (_, relIdx) => ({
          relatedIOCId: `ioc-${Math.floor(Math.random() * 150) + 1}`,
          relationType: ['same_family', 'infrastructure', 'campaign', 'technique'][Math.floor(Math.random() * 4)] as any,
          confidence: Math.floor(Math.random() * 40) + 60
        })),
        sources: [
          {
            name: 'Internal Analysis',
            confidence: Math.floor(Math.random() * 30) + 70,
            firstReported: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
            lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          }
        ],
        enrichment: {
          geolocation: { country: 'US', region: 'North America' },
          reputation: { score: Math.floor(Math.random() * 100), categories: ['malware', 'c2'] }
        }
      });
    }

    return iocs.sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockIOCs = generateMockIOCs();
        setIOCs(mockIOCs);
        addUIUXEvaluation('ioc-management-loaded', 'success', {
          iocCount: mockIOCs.length,
          loadTime: 1000
        });
      } catch (error) {
        console.error('Error loading IOC data:', error);
        addNotification('error', 'Failed to load IOC management data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockIOCs, addNotification]);

  const filteredIOCs = useMemo(() => {
    return iocs.filter(ioc => {
      if (searchTerm && !ioc.value.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !ioc.actorName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filters.actorId !== 'all' && ioc.actorId !== filters.actorId) return false;
      if (filters.iocType !== 'all' && ioc.type !== filters.iocType) return false;
      if (filters.status !== 'all' && ioc.status !== filters.status) return false;
      if (ioc.attribution.confidence < filters.confidence) return false;
      if (filters.role !== 'all' && ioc.context.role !== filters.role) return false;
      return true;
    });
  }, [iocs, searchTerm, filters]);

  const getIOCTypeIcon = (type: string) => {
    switch (type) {
      case 'hash': return <Computer />;
      case 'domain': return <Language />;
      case 'ip': return <LocationOn />;
      case 'url': return <Language />;
      case 'email': return <Language />;
      case 'registry': return <Computer />;
      case 'certificate': return <Security />;
      case 'mutex': return <Computer />;
      default: return <Assignment />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'error';
      case 'expired': return 'warning';
      case 'sinkholed': return 'success';
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assignment color="primary" />
          Threat Actor IOC Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage and analyze indicators of compromise attributed to threat actors
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search IOCs"
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
              <InputLabel>IOC Type</InputLabel>
              <Select
                value={filters.iocType}
                onChange={(e) => setFilters(prev => ({ ...prev, iocType: e.target.value }))}
                label="IOC Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="hash">Hash</MenuItem>
                <MenuItem value="domain">Domain</MenuItem>
                <MenuItem value="ip">IP Address</MenuItem>
                <MenuItem value="url">URL</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="registry">Registry</MenuItem>
                <MenuItem value="certificate">Certificate</MenuItem>
                <MenuItem value="mutex">Mutex</MenuItem>
              </Select>
            </FormControl>
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
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
                <MenuItem value="sinkholed">Sinkholed</MenuItem>
                <MenuItem value="unknown">Unknown</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                label="Role"
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="c2">Command & Control</MenuItem>
                <MenuItem value="dropper">Dropper</MenuItem>
                <MenuItem value="payload">Payload</MenuItem>
                <MenuItem value="infrastructure">Infrastructure</MenuItem>
                <MenuItem value="exfil">Exfiltration</MenuItem>
                <MenuItem value="reconnaissance">Reconnaissance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  const newIOCs = generateMockIOCs();
                  setIOCs(newIOCs);
                  addNotification('success', 'IOC data refreshed');
                }}
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
                Add IOC
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            IOC Database ({filteredIOCs.length} indicators)
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Actor</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Last Seen</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredIOCs
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((ioc) => (
                    <TableRow key={ioc.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getIOCTypeIcon(ioc.type)}
                          <Typography variant="body2">{ioc.type}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', maxWidth: 200 }} noWrap>
                          {ioc.value}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{ioc.actorName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={ioc.context.role} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={ioc.status} 
                          size="small" 
                          color={getStatusColor(ioc.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={ioc.attribution.confidence} 
                            sx={{ width: 60, height: 4 }}
                          />
                          <Typography variant="caption">
                            {ioc.attribution.confidence}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {ioc.lastSeen.toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => {
                          setSelectedIOC(ioc);
                          setDetailsOpen(true);
                        }}>
                          <Visibility />
                        </IconButton>
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                        <IconButton size="small">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filteredIOCs.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            pageSizeOptions={[25, 50, 100]}
          />
        </CardContent>
      </Card>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>IOC Details</DialogTitle>
        <DialogContent>
          {selectedIOC && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  {getIOCTypeIcon(selectedIOC.type)}
                  <Typography variant="h6">{selectedIOC.value}</Typography>
                  <Chip 
                    label={selectedIOC.status} 
                    color={getStatusColor(selectedIOC.status)}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Attribution</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Actor" secondary={selectedIOC.actorName} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Confidence" secondary={`${selectedIOC.attribution.confidence}%`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Method" secondary={selectedIOC.attribution.method} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Analyst" secondary={selectedIOC.attribution.analyst} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Context</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Role" secondary={selectedIOC.context.role} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Campaigns" secondary={selectedIOC.campaigns.join(', ')} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Malware Families" secondary={selectedIOC.malwareFamilies.join(', ')} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Tags" secondary={selectedIOC.tags.join(', ')} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Description</Typography>
                <Typography variant="body2" paragraph>
                  {selectedIOC.context.description}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>Technical Details</Typography>
                <Typography variant="body2">
                  {selectedIOC.context.technicalDetails}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained">Edit IOC</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThreatActorIOCManagement;