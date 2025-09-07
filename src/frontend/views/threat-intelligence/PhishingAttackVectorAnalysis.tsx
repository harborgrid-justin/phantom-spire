/**
 * Phishing Attack Vector Analysis
 * Comprehensive phishing vector analysis and detection platform
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
  Avatar,
  LinearProgress,
  Alert,
  Tooltip,
  useTheme,
  alpha,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import {
  Security,
  Warning,
  Email,
  Link,
  Assessment,
  TrendingUp,
  Shield,
  BugReport,
  Visibility,
  Search,
  FilterList,
  GetApp,
  Share,
  Refresh,
  OpenInNew,
  ExpandMore,
  ChevronRight,
  CheckCircle,
  Error,
  Info,
} from '@mui/icons-material';

// Interfaces
interface PhishingVector {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'voice' | 'social' | 'website';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  indicators: string[];
  detectionRate: number;
  prevalence: number;
  targetSectors: string[];
  commonPayloads: string[];
  mitigations: string[];
  techniques: string[];
  campaign?: string;
  actor?: string;
  firstSeen: Date;
  lastSeen: Date;
  samples: number;
  blocked: number;
  success_rate: number;
}

interface PhishingCampaign {
  id: string;
  name: string;
  actor: string;
  startDate: Date;
  endDate?: Date;
  targetSectors: string[];
  vectors: string[];
  emailsSent: number;
  successfulCompromises: number;
  detectionRate: number;
  geography: string[];
  sophistication: 'basic' | 'intermediate' | 'advanced' | 'expert';
}

interface PhishingMetrics {
  totalVectors: number;
  activeCampaigns: number;
  detectionRate: number;
  successRate: number;
  topTargets: string[];
  emergingThreats: number;
  mitigationCoverage: number;
}

const PhishingAttackVectorAnalysis: React.FC = () => {
  const theme = useTheme();
  
  // State management
  const [vectors, setVectors] = useState<PhishingVector[]>([]);
  const [campaigns, setCampaigns] = useState<PhishingCampaign[]>([]);
  const [metrics, setMetrics] = useState<PhishingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection states
  const [selectedVector, setSelectedVector] = useState<PhishingVector | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<PhishingCampaign | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Simulated data generation
  const generatePhishingData = useCallback(() => {
    const vectorTypes = ['email', 'sms', 'voice', 'social', 'website'] as const;
    const severityLevels = ['low', 'medium', 'high', 'critical'] as const;
    const sectors = ['Finance', 'Healthcare', 'Government', 'Education', 'Technology', 'Retail'];
    const techniques = [
      'Credential Harvesting',
      'Malware Delivery',
      'Business Email Compromise',
      'CEO Fraud',
      'Invoice Scam',
      'Tech Support Scam',
      'Romance Scam',
      'Lottery Scam'
    ];

    // Generate phishing vectors
    const vectorData: PhishingVector[] = [];
    for (let i = 0; i < 25; i++) {
      const type = vectorTypes[Math.floor(Math.random() * vectorTypes.length)];
      const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
      
      vectorData.push({
        id: `vector-${i + 1}`,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Phishing Vector ${i + 1}`,
        type,
        severity,
        description: `Advanced ${type} phishing attack targeting ${sectors[Math.floor(Math.random() * sectors.length)]} sector`,
        indicators: [
          `suspicious-${type}-${i + 1}@evil.com`,
          `malicious-link-${i + 1}.evil.com`,
          `phishing-payload-${i + 1}.exe`
        ],
        detectionRate: Math.floor(Math.random() * 40) + 60,
        prevalence: Math.floor(Math.random() * 100),
        targetSectors: sectors.slice(0, Math.floor(Math.random() * 3) + 1),
        commonPayloads: techniques.slice(0, Math.floor(Math.random() * 3) + 1),
        mitigations: [
          'Email Security Gateway',
          'User Training',
          'Multi-Factor Authentication',
          'DNS Filtering'
        ],
        techniques: techniques.slice(0, Math.floor(Math.random() * 2) + 1),
        campaign: `Campaign-${Math.floor(Math.random() * 10) + 1}`,
        actor: `APT-${Math.floor(Math.random() * 50) + 1}`,
        firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        samples: Math.floor(Math.random() * 1000) + 100,
        blocked: Math.floor(Math.random() * 800) + 50,
        success_rate: Math.floor(Math.random() * 15) + 5
      });
    }

    // Generate phishing campaigns
    const campaignData: PhishingCampaign[] = [];
    for (let i = 0; i < 10; i++) {
      const sophisticationLevels = ['basic', 'intermediate', 'advanced', 'expert'] as const;
      
      campaignData.push({
        id: `campaign-${i + 1}`,
        name: `Operation Phishing Storm ${i + 1}`,
        actor: `APT-${Math.floor(Math.random() * 50) + 1}`,
        startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        endDate: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
        targetSectors: sectors.slice(0, Math.floor(Math.random() * 3) + 1),
        vectors: vectorTypes.slice(0, Math.floor(Math.random() * 3) + 1),
        emailsSent: Math.floor(Math.random() * 50000) + 10000,
        successfulCompromises: Math.floor(Math.random() * 500) + 50,
        detectionRate: Math.floor(Math.random() * 40) + 60,
        geography: ['US', 'EU', 'APAC'].slice(0, Math.floor(Math.random() * 3) + 1),
        sophistication: sophisticationLevels[Math.floor(Math.random() * sophisticationLevels.length)]
      });
    }

    // Generate metrics
    const metricsData: PhishingMetrics = {
      totalVectors: vectorData.length,
      activeCampaigns: campaignData.filter(c => !c.endDate).length,
      detectionRate: Math.floor(vectorData.reduce((sum, v) => sum + v.detectionRate, 0) / vectorData.length),
      successRate: Math.floor(vectorData.reduce((sum, v) => sum + v.success_rate, 0) / vectorData.length),
      topTargets: sectors.slice(0, 5),
      emergingThreats: Math.floor(Math.random() * 10) + 5,
      mitigationCoverage: Math.floor(Math.random() * 20) + 75
    };

    setVectors(vectorData);
    setCampaigns(campaignData);
    setMetrics(metricsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    generatePhishingData();
  }, [generatePhishingData]);

  // Filtered data based on search and filters
  const filteredVectors = useMemo(() => {
    return vectors.filter(vector => {
      const matchesSearch = vector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vector.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || vector.type === filterType;
      const matchesSeverity = filterSeverity === 'all' || vector.severity === filterSeverity;
      
      return matchesSearch && matchesType && matchesSeverity;
    });
  }, [vectors, searchTerm, filterType, filterSeverity]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return '#ff9800';
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Email />;
      case 'sms': return <Assessment />;
      case 'voice': return <Warning />;
      case 'social': return <Share />;
      case 'website': return <Link />;
      default: return <Security />;
    }
  };

  // Render overview metrics
  const renderOverviewMetrics = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {[
        { label: 'Total Vectors', value: metrics?.totalVectors || 0, icon: <Security />, color: theme.palette.primary.main },
        { label: 'Active Campaigns', value: metrics?.activeCampaigns || 0, icon: <TrendingUp />, color: theme.palette.warning.main },
        { label: 'Detection Rate', value: `${metrics?.detectionRate || 0}%`, icon: <Shield />, color: theme.palette.success.main },
        { label: 'Mitigation Coverage', value: `${metrics?.mitigationCoverage || 0}%`, icon: <CheckCircle />, color: theme.palette.info.main }
      ].map((metric, index) => (
        <Grid item xs={12} sm={6} lg={3} key={index}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {metric.label}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(metric.color, 0.1), color: metric.color }}>
                  {metric.icon}
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render vectors table
  const renderVectorsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Vector Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Severity</TableCell>
            <TableCell>Detection Rate</TableCell>
            <TableCell>Success Rate</TableCell>
            <TableCell>Samples</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredVectors
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((vector) => (
              <TableRow key={vector.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getTypeIcon(vector.type)}
                    <Typography variant="body2">{vector.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={vector.type} />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={vector.severity}
                    sx={{
                      bgcolor: alpha(getSeverityColor(vector.severity), 0.1),
                      color: getSeverityColor(vector.severity)
                    }}
                  />
                </TableCell>
                <TableCell>{vector.detectionRate}%</TableCell>
                <TableCell>{vector.success_rate}%</TableCell>
                <TableCell>{vector.samples.toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedVector(vector);
                      setDetailsOpen(true);
                    }}
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={filteredVectors.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
    </TableContainer>
  );

  // Render campaigns overview
  const renderCampaigns = () => (
    <Grid container spacing={3}>
      {campaigns.map((campaign) => (
        <Grid item xs={12} md={6} lg={4} key={campaign.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {campaign.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Actor: {campaign.actor}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" display="block">
                  Emails Sent: {campaign.emailsSent.toLocaleString()}
                </Typography>
                <Typography variant="caption" display="block">
                  Compromises: {campaign.successfulCompromises.toLocaleString()}
                </Typography>
                <Typography variant="caption" display="block">
                  Detection Rate: {campaign.detectionRate}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {campaign.targetSectors.map((sector) => (
                  <Chip key={sector} size="small" label={sector} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Phishing Attack Vector Analysis
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive analysis and detection of phishing attack vectors across multiple channels
        </Typography>
      </Box>

      {renderOverviewMetrics()}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search vectors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search />
              }}
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="voice">Voice</MenuItem>
                <MenuItem value="social">Social</MenuItem>
                <MenuItem value="website">Website</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                label="Severity"
              >
                <MenuItem value="all">All Severities</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
            <Button startIcon={<Refresh />} onClick={generatePhishingData}>
              Refresh
            </Button>
          </Box>

          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Attack Vectors" />
            <Tab label="Active Campaigns" />
          </Tabs>

          {activeTab === 0 && renderVectorsTable()}
          {activeTab === 1 && renderCampaigns()}
        </CardContent>
      </Card>

      {/* Vector Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedVector?.name}
        </DialogTitle>
        <DialogContent>
          {selectedVector && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Vector Details
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedVector.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" display="block">
                      Type: {selectedVector.type}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Severity: {selectedVector.severity}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Detection Rate: {selectedVector.detectionRate}%
                    </Typography>
                    <Typography variant="caption" display="block">
                      Success Rate: {selectedVector.success_rate}%
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Indicators
                  </Typography>
                  <List dense>
                    {selectedVector.indicators.map((indicator, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <BugReport />
                        </ListItemIcon>
                        <ListItemText primary={indicator} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
          <Button
            variant="outlined"
            startIcon={<OpenInNew />}
            onClick={() => window.open('#', '_blank')}
          >
            View Details
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PhishingAttackVectorAnalysis;