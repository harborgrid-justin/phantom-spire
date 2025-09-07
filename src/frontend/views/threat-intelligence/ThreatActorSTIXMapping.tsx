/**
 * Threat Actor STIX Mapping Component
 * STIX 2.0/2.1 data mapping and integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

import {
  AccountTree,
  Schema,
  DataObject,
  Sync,
  CheckCircle,
  Error,
  Warning,
  Search,
  Download,
  Upload,
  Refresh,
  Code,
  Assignment
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

interface STIXObject {
  id: string;
  type: string;
  spec_version: string;
  created: Date;
  modified: Date;
  name: string;
  description: string;
  actorId: string;
  mapping_status: 'mapped' | 'partial' | 'unmapped' | 'error';
  confidence: number;
  content: Record<string, any>;
}

interface MappingRule {
  id: string;
  name: string;
  source_field: string;
  target_field: string;
  transformation: string;
  enabled: boolean;
  priority: number;
}

const ThreatActorSTIXMapping: React.FC = () => {
  const theme = useTheme();
  
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('threat-intelligence-stix');

  const [stixObjects, setSTIXObjects] = useState<STIXObject[]>([]);
  const [mappingRules, setMappingRules] = useState<MappingRule[]>([]);
  const [selectedObject, setSelectedObject] = useState<STIXObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const generateMockData = useCallback(() => {
    const stixTypes = ['threat-actor', 'malware', 'campaign', 'attack-pattern', 'indicator', 'intrusion-set'];
    const mockObjects: STIXObject[] = [];
    
    for (let i = 1; i <= 50; i++) {
      const objectType = stixTypes[Math.floor(Math.random() * stixTypes.length)];
      mockObjects.push({
        id: `stix-object-${i}`,
        type: objectType,
        spec_version: '2.1',
        created: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        modified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        name: `STIX ${objectType.replace('-', ' ')} ${i}`,
        description: `STIX object description for ${objectType} ${i}`,
        actorId: `actor-${Math.floor(Math.random() * 15) + 1}`,
        mapping_status: ['mapped', 'partial', 'unmapped', 'error'][Math.floor(Math.random() * 4)] as any,
        confidence: Math.floor(Math.random() * 40) + 60,
        content: {
          labels: [`${objectType}-label`],
          aliases: [`alias-${i}`],
          sophistication: 'advanced',
          resource_level: 'organization'
        }
      });
    }

    const mockRules: MappingRule[] = [
      {
        id: 'rule-1',
        name: 'Actor Name Mapping',
        source_field: 'name',
        target_field: 'actor.name',
        transformation: 'direct',
        enabled: true,
        priority: 1
      },
      {
        id: 'rule-2',
        name: 'Aliases Mapping',
        source_field: 'aliases',
        target_field: 'actor.aliases',
        transformation: 'array_merge',
        enabled: true,
        priority: 2
      },
      {
        id: 'rule-3',
        name: 'Sophistication Mapping',
        source_field: 'sophistication',
        target_field: 'actor.sophistication_level',
        transformation: 'enum_mapping',
        enabled: true,
        priority: 3
      }
    ];

    setSTIXObjects(mockObjects);
    setMappingRules(mockRules);
    setSelectedObject(mockObjects[0]);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        generateMockData();
        addUIUXEvaluation('stix-mapping-loaded', 'success', {
          loadTime: 1000
        });
      } catch (error) {
        console.error('Error loading STIX data:', error);
        addNotification('error', 'Failed to load STIX mapping data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockData, addNotification]);

  const filteredObjects = stixObjects.filter(obj => {
    if (searchTerm && !obj.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (typeFilter !== 'all' && obj.type !== typeFilter) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mapped': return 'success';
      case 'partial': return 'warning';
      case 'unmapped': return 'info';
      case 'error': return 'error';
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
          <Schema color="primary" />
          Threat Actor STIX Mapping
        </Typography>
        <Typography variant="body1" color="textSecondary">
          STIX 2.0/2.1 data mapping and integration for threat intelligence
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary">
                {stixObjects.length}
              </Typography>
              <Typography variant="caption">STIX Objects</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success">
                {stixObjects.filter(o => o.mapping_status === 'mapped').length}
              </Typography>
              <Typography variant="caption">Mapped</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning">
                {stixObjects.filter(o => o.mapping_status === 'partial').length}
              </Typography>
              <Typography variant="caption">Partial</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info">
                {mappingRules.filter(r => r.enabled).length}
              </Typography>
              <Typography variant="caption">Active Rules</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Search STIX Objects"
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Object Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Object Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="threat-actor">Threat Actor</MenuItem>
                <MenuItem value="malware">Malware</MenuItem>
                <MenuItem value="campaign">Campaign</MenuItem>
                <MenuItem value="attack-pattern">Attack Pattern</MenuItem>
                <MenuItem value="indicator">Indicator</MenuItem>
                <MenuItem value="intrusion-set">Intrusion Set</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<Upload />}>
                Import STIX
              </Button>
              <Button variant="outlined" startIcon={<Download />}>
                Export
              </Button>
              <Button variant="outlined" startIcon={<Sync />}>
                Sync
              </Button>
              <Button variant="contained" startIcon={<Refresh />}>
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '600px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                STIX Objects ({filteredObjects.length})
              </Typography>
              <Box sx={{ height: '520px', overflow: 'auto' }}>
                <List dense>
                  {filteredObjects.map(obj => (
                    <ListItem
                      key={obj.id}
                      button
                      selected={selectedObject?.id === obj.id}
                      onClick={() => setSelectedObject(obj)}
                      sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                    >
                      <ListItemIcon>
                        <DataObject color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {obj.name}
                            </Typography>
                            <Chip 
                              label={obj.type} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              label={obj.mapping_status} 
                              size="small" 
                              color={getStatusColor(obj.mapping_status)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              STIX {obj.spec_version} • Confidence: {obj.confidence}%
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Modified: {obj.modified.toLocaleDateString()}
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

        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '600px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {selectedObject?.name || 'Select STIX Object'}
              </Typography>

              {selectedObject ? (
                <Box sx={{ height: '510px' }}>
                  <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
                    <Tab label="Details" />
                    <Tab label="Mapping" />
                    <Tab label="Content" />
                  </Tabs>

                  {selectedTab === 0 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Object Information</Typography>
                            <List dense>
                              <ListItem>
                                <ListItemText primary="ID" secondary={selectedObject.id} />
                              </ListItem>
                              <ListItem>
                                <ListItemText primary="Type" secondary={selectedObject.type} />
                              </ListItem>
                              <ListItem>
                                <ListItemText primary="STIX Version" secondary={selectedObject.spec_version} />
                              </ListItem>
                              <ListItem>
                                <ListItemText primary="Created" secondary={selectedObject.created.toLocaleString()} />
                              </ListItem>
                              <ListItem>
                                <ListItemText primary="Modified" secondary={selectedObject.modified.toLocaleString()} />
                              </ListItem>
                            </List>
                          </Paper>
                        </Grid>
                        <Grid item xs={12}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Mapping Status</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Chip 
                                label={selectedObject.mapping_status} 
                                color={getStatusColor(selectedObject.mapping_status)}
                                icon={
                                  selectedObject.mapping_status === 'mapped' ? <CheckCircle /> :
                                  selectedObject.mapping_status === 'error' ? <Error /> :
                                  <Warning />
                                }
                              />
                              <Typography variant="body2">
                                Confidence: {selectedObject.confidence}%
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {selectedObject.description}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {selectedTab === 1 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Mapping Rules ({mappingRules.length})
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Rule Name</TableCell>
                              <TableCell>Source Field</TableCell>
                              <TableCell>Target Field</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {mappingRules.map(rule => (
                              <TableRow key={rule.id}>
                                <TableCell>{rule.name}</TableCell>
                                <TableCell>{rule.source_field}</TableCell>
                                <TableCell>{rule.target_field}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={rule.enabled ? 'Enabled' : 'Disabled'} 
                                    size="small" 
                                    color={rule.enabled ? 'success' : 'default'}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {selectedTab === 2 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>Raw STIX Content</Typography>
                      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(selectedObject.content, null, 2)}
                        </pre>
                      </Paper>
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
                    <Schema sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.5), mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      Select a STIX Object
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThreatActorSTIXMapping;