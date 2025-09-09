import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge
} from '@mui/material';
import {
  Security,
  Analytics,
  Timeline,
  Assessment,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  GetApp,
  Add,
  Edit,
  Delete,
  Visibility,
  ExpandMore,
  TrendingUp,
  TrendingDown,
  Shield,
  BugReport,
  FlashOn,
  Storage,
  NetworkCheck,
  PersonSearch,
  LocalPolice,
  Gavel
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface TTPData {
  id: string;
  name: string;
  mitreId?: string;
  status: 'active' | 'monitoring' | 'mitigated' | 'archived';
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  tactics?: string[];
  techniques?: string[];
  procedures?: string[];
  actors?: string[];
  detectionCoverage?: number;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    platform?: string[];
    killchain?: string;
    references?: string[];
    mitigations?: string[];
    dataSource?: string;
  };
}

interface ProcedureDocumentationCenterProps {
  onDataUpdate?: (data: TTPData[]) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  filters?: {
    status?: string[];
    severity?: string[];
    tactics?: string[];
  };
}

const ProcedureDocumentationCenter: React.FC<ProcedureDocumentationCenterProps> = ({
  onDataUpdate,
  onRefresh,
  onExport,
  filters
}) => {
  const [data, setData] = useState<TTPData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<TTPData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    critical: 0,
    coverage: 0
  });

  // Mock TTP data generator
  const generateMockData = (): TTPData[] => {
    const mockItems: TTPData[] = [];
    const statuses: TTPData['status'][] = ['active', 'monitoring', 'mitigated', 'archived'];
    const severities: TTPData['severity'][] = ['critical', 'high', 'medium', 'low'];
    const tactics = ['Initial Access', 'Execution', 'Persistence', 'Privilege Escalation', 'Defense Evasion'];
    const techniques = ['T1078', 'T1055', 'T1027', 'T1134', 'T1070'];
    const platforms = ['Windows', 'Linux', 'macOS', 'Cloud', 'Network'];
    
    for (let i = 1; i <= 25; i++) {
      mockItems.push({
        id: `ttp-${i.toString().padStart(3, '0')}`,
        name: `${componentName.replace(/([A-Z])/g, ' $1').trim()} Item ${i}`,
        mitreId: `T${(1000 + i).toString()}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        confidence: Math.floor(Math.random() * 40) + 60,
        tactics: [tactics[Math.floor(Math.random() * tactics.length)]],
        techniques: [techniques[Math.floor(Math.random() * techniques.length)]],
        procedures: [`Procedure ${i}`],
        actors: [`Actor Group ${Math.floor(Math.random() * 5) + 1}`],
        detectionCoverage: Math.floor(Math.random() * 40) + 60,
        lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          platform: [platforms[Math.floor(Math.random() * platforms.length)]],
          killchain: `Phase ${Math.floor(Math.random() * 7) + 1}`,
          references: [`https://attack.mitre.org/techniques/T${1000 + i}`],
          mitigations: [`M${(1000 + i).toString()}`],
          dataSource: 'MITRE ATT&CK'
        }
      });
    }
    return mockItems;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData = generateMockData();
        setData(mockData);
        
        // Calculate stats
        setStats({
          total: mockData.length,
          active: mockData.filter(item => item.status === 'active').length,
          critical: mockData.filter(item => item.severity === 'critical').length,
          coverage: Math.round(mockData.reduce((acc, item) => acc + (item.detectionCoverage || 0), 0) / mockData.length)
        });
        
        if (onDataUpdate) {
          onDataUpdate(mockData);
        }
      } catch (error) {
        console.error('Error fetching TTP data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [onDataUpdate]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    setData(generateMockData());
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    }
    console.log('Exporting ttp-category TTP data...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'error';
      case 'monitoring': return 'warning';
      case 'mitigated': return 'success';
      case 'archived': return 'default';
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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 120 },
    { field: 'name', headerName: 'Name', width: 200, flex: 1 },
    { field: 'mitreId', headerName: 'MITRE ID', width: 100 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value) as any}
          size="small"
        />
      )
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getSeverityColor(params.value) as any}
          size="small"
        />
      )
    },
    {
      field: 'confidence',
      headerName: 'Confidence',
      width: 120,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Box width="100%" mr={1}>
            <LinearProgress 
              variant="determinate" 
              value={params.value} 
              color={params.value > 80 ? 'success' : params.value > 60 ? 'warning' : 'error'}
            />
          </Box>
          <Typography variant="body2">{params.value}%</Typography>
        </Box>
      )
    },
    {
      field: 'detectionCoverage',
      headerName: 'Coverage',
      width: 120,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Box width="100%" mr={1}>
            <LinearProgress 
              variant="determinate" 
              value={params.value} 
              color={params.value > 80 ? 'success' : params.value > 60 ? 'warning' : 'error'}
            />
          </Box>
          <Typography variant="body2">{params.value}%</Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton 
              onClick={() => {
                setSelectedItem(params.row);
                setDialogOpen(true);
              }} 
              size="small"
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small">
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small">
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom display="flex" alignItems="center">
          <Security sx={{ mr: 2, color: 'primary.main' }} />
          ${componentName.replace(/([A-Z])/g, ' $1').trim()}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          ${category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} TTP Analysis and Management
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Storage sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.total}</Typography>
                  <Typography variant="body2" color="textSecondary">Total TTPs</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Warning sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.active}</Typography>
                  <Typography variant="body2" color="textSecondary">Active Threats</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Error sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.critical}</Typography>
                  <Typography variant="body2" color="textSecondary">Critical</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Shield sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.coverage}%</Typography>
                  <Typography variant="body2" color="textSecondary">Coverage</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Bar */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ mr: 2 }}
          >
            Add TTP
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<GetApp />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box mb={3}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" />
          <Tab label="MITRE ATT&CK Mapping" />
          <Tab label="Analytics" />
          <Tab label="Reports" />
        </Tabs>
      </Box>

      {/* Main Content */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <DataGrid
              rows={data}
              columns={columns}
              pageSize={25}
              rowsPerPageOptions={[25]}
              autoHeight
              disableSelectionOnClick
            />
          </CardContent>
        </Card>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>MITRE ATT&CK Framework Mapping</Typography>
                <Box mt={2}>
                  {data.slice(0, 10).map((item) => (
                    <Accordion key={item.id}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box display="flex" alignItems="center" width="100%">
                          <Typography sx={{ width: '33%', flexShrink: 0 }}>
                            {item.mitreId} - {item.name}
                          </Typography>
                          <Chip 
                            label={item.status} 
                            color={getStatusColor(item.status) as any}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip 
                            label={item.severity} 
                            color={getSeverityColor(item.severity) as any}
                            size="small"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">Tactics:</Typography>
                            {item.tactics?.map((tactic, index) => (
                              <Chip key={index} label={tactic} size="small" sx={{ mr: 1, mb: 1 }} />
                            ))}
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">Techniques:</Typography>
                            {item.techniques?.map((technique, index) => (
                              <Chip key={index} label={technique} size="small" sx={{ mr: 1, mb: 1 }} />
                            ))}
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">Procedures:</Typography>
                            {item.procedures?.map((procedure, index) => (
                              <Chip key={index} label={procedure} size="small" sx={{ mr: 1, mb: 1 }} />
                            ))}
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Coverage Summary</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><Shield /></ListItemIcon>
                    <ListItemText 
                      primary="Detection Coverage" 
                      secondary={stats.coverage + '%'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Security /></ListItemIcon>
                    <ListItemText 
                      primary="Mitigation Coverage" 
                      secondary="78%"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Analytics /></ListItemIcon>
                    <ListItemText 
                      primary="Visibility Coverage" 
                      secondary="82%"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>TTP Analytics Dashboard</Typography>
                <Typography variant="body2" color="textSecondary">
                  Advanced analytics and insights for TTP data will be displayed here.
                </Typography>
                <Box mt={3} textAlign="center" py={4}>
                  <Analytics sx={{ fontSize: 64, color: 'action.disabled' }} />
                  <Typography variant="h6" color="textSecondary">
                    Analytics Module
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    TTP trend analysis, predictive modeling, and intelligence insights
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>TTP Reports</Typography>
                <Typography variant="body2" color="textSecondary">
                  Generate comprehensive reports on TTP analysis and intelligence.
                </Typography>
                <Box mt={3} textAlign="center" py={4}>
                  <Assessment sx={{ fontSize: 64, color: 'action.disabled' }} />
                  <Typography variant="h6" color="textSecondary">
                    Report Generator
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Automated TTP intelligence reports and executive summaries
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          TTP Details: {selectedItem?.name}
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">MITRE ID:</Typography>
                <Typography variant="body2" gutterBottom>{selectedItem.mitreId}</Typography>
                
                <Typography variant="subtitle2">Status:</Typography>
                <Chip 
                  label={selectedItem.status} 
                  color={getStatusColor(selectedItem.status) as any}
                  size="small"
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="subtitle2">Severity:</Typography>
                <Chip 
                  label={selectedItem.severity} 
                  color={getSeverityColor(selectedItem.severity) as any}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Confidence:</Typography>
                <Typography variant="body2" gutterBottom>{selectedItem.confidence}%</Typography>
                
                <Typography variant="subtitle2">Detection Coverage:</Typography>
                <Typography variant="body2" gutterBottom>{selectedItem.detectionCoverage}%</Typography>
                
                <Typography variant="subtitle2">Last Seen:</Typography>
                <Typography variant="body2" gutterBottom>
                  {selectedItem.lastSeen ? new Date(selectedItem.lastSeen).toLocaleString() : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Tactics:</Typography>
                <Box mb={2}>
                  {selectedItem.tactics?.map((tactic, index) => (
                    <Chip key={index} label={tactic} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
                
                <Typography variant="subtitle2">Techniques:</Typography>
                <Box mb={2}>
                  {selectedItem.techniques?.map((technique, index) => (
                    <Chip key={index} label={technique} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
                
                <Typography variant="subtitle2">Associated Actors:</Typography>
                <Box>
                  {selectedItem.actors?.map((actor, index) => (
                    <Chip key={index} label={actor} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button variant="contained">Edit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcedureDocumentationCenter;