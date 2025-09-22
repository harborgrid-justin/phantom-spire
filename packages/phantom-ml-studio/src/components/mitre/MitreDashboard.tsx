/**
 * MITRE ATT&CK Framework Dashboard Component
 * Displays MITRE data and integration status with interoperability features
 */
'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Alert,
  LinearProgress,
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
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Security as SecurityIcon,
  Sync as SyncIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Analytics as AnalyticsIcon,
  Shield as ShieldIcon,
  Group as GroupIcon,
  Computer as ComputerIcon,
  BugReport as BugReportIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Types
interface MitreIntegrationStatus {
  isInitialized: boolean;
  lastSync: string | null;
  dataVersion: string | null;
  totalRecords: number;
  syncInProgress: boolean;
  errors: string[];
}

interface MitreAnalytics {
  totalTactics: number;
  totalTechniques: number;
  totalSubTechniques: number;
  totalGroups: number;
  totalSoftware: number;
  totalMitigations: number;
  totalDataSources: number;
}

interface MitreSearchResult {
  items: any[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mitre-tabpanel-${index}`}
      aria-labelledby={`mitre-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MitreDashboard() {
  const [status, setStatus] = useState<MitreIntegrationStatus | null>(null);
  const [analytics, setAnalytics] = useState<MitreAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MitreSearchResult | null>(null);
  const [searchType, setSearchType] = useState<'techniques' | 'tactics' | 'groups' | 'software'>('techniques');
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadMitreData();
  }, []);

  const loadMitreData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/mitre');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStatus(data.status);
      setAnalytics(data.analytics);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load MITRE data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      
      const response = await fetch('/api/mitre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' })
      });
      
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Sync completed:', result);
      
      // Reload data after sync
      await loadMitreData();
    } catch (err: any) {
      setError(err.message);
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setError(null);
      const response = await fetch(`/api/mitre?action=${searchType}&q=${encodeURIComponent(searchQuery)}&limit=20`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const results = await response.json();
      setSearchResults(results);
    } catch (err: any) {
      setError(err.message);
      console.error('Search failed:', err);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (isInitialized: boolean, hasErrors: boolean) => {
    if (hasErrors) return 'error';
    if (isInitialized) return 'success';
    return 'warning';
  };

  const getStatusText = (isInitialized: boolean, hasErrors: boolean) => {
    if (hasErrors) return 'Error';
    if (isInitialized) return 'Active';
    return 'Not Initialized';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading MITRE ATT&CK Integration...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SecurityIcon color="primary" />
        MITRE ATT&CK Framework
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Status Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Integration Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip
                  label={getStatusText(status?.isInitialized || false, (status?.errors.length || 0) > 0)}
                  color={getStatusColor(status?.isInitialized || false, (status?.errors.length || 0) > 0)}
                  icon={<SecurityIcon />}
                />
                <Typography variant="body2" color="text.secondary">
                  {status?.totalRecords || 0} records • Last sync: {formatDate(status?.lastSync || null)}
                </Typography>
              </Box>
              
              {status?.syncInProgress && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Synchronization in progress...
                  </Typography>
                </Box>
              )}
              
              <Button
                variant="contained"
                startIcon={<SyncIcon />}
                onClick={handleSync}
                disabled={syncing || status?.syncInProgress}
                size="small"
              >
                {syncing ? 'Syncing...' : 'Sync MITRE Data'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Overview
              </Typography>
              {analytics && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Tactics:</Typography>
                    <Typography variant="body2" fontWeight="bold">{analytics.totalTactics}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Techniques:</Typography>
                    <Typography variant="body2" fontWeight="bold">{analytics.totalTechniques}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Sub-techniques:</Typography>
                    <Typography variant="body2" fontWeight="bold">{analytics.totalSubTechniques}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Groups:</Typography>
                    <Typography variant="body2" fontWeight="bold">{analytics.totalGroups}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Software:</Typography>
                    <Typography variant="body2" fontWeight="bold">{analytics.totalSoftware}</Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          aria-label="MITRE dashboard tabs"
        >
          <Tab 
            label="Search & Explore" 
            icon={<SearchIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Analytics" 
            icon={<AnalyticsIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Interoperability" 
            icon={<ShieldIcon />}
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* Search Interface */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Search Type"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  SelectProps={{ native: true }}
                >
                  <option value="techniques">Techniques</option>
                  <option value="tactics">Tactics</option>
                  <option value="groups">Groups</option>
                  <option value="software">Software</option>
                </TextField>
              </Grid>
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search MITRE data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleSearch} size="small">
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSearch}
                  disabled={!searchQuery.trim()}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Search Results */}
          {searchResults && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {item.mitre_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={searchType.slice(0, -1)} 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            maxWidth: 300, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}
                        >
                          {item.description?.substring(0, 100)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {searchResults.hasMore && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {searchResults.items.length} of {searchResults.total} results
                  </Typography>
                </Box>
              )}
            </TableContainer>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            MITRE Framework Analytics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon color="primary" />
                    <Typography variant="h4">{analytics?.totalTactics || 0}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Tactics
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BugReportIcon color="warning" />
                    <Typography variant="h4">{analytics?.totalTechniques || 0}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Techniques
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon color="info" />
                    <Typography variant="h4">{analytics?.totalGroups || 0}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Threat Groups
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ComputerIcon color="secondary" />
                    <Typography variant="h4">{analytics?.totalSoftware || 0}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Malware & Tools
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Cross-Module Interoperability
          </Typography>
          <Alert severity="info" icon={<InfoIcon />}>
            MITRE ATT&CK data is now fully integrated and accessible across all phantom-ml-studio modules. 
            This enables advanced threat analysis, technique mapping, and cross-correlation with other security data sources.
          </Alert>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" paragraph>
              The MITRE integration provides the following interoperability features:
            </Typography>
            <ul>
              <li>Real-time technique mapping for threat analysis</li>
              <li>Cross-correlation with IOCs and threat intelligence</li>
              <li>Integration with ML models for behavioral analysis</li>
              <li>Automated attack pattern recognition</li>
              <li>Framework coverage assessment and gap analysis</li>
            </ul>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}