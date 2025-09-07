/**
 * Supply Chain Compromise Vectors Analysis
 * Comprehensive analysis of supply chain attack vectors and dependencies
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
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
  Badge,
  TreeView,
  TreeItem,
} from '@mui/material';

import {
  AccountTree,
  Security,
  Warning,
  Assessment,
  TrendingUp,
  Shield,
  BugReport,
  Visibility,
  Search,
  Refresh,
  OpenInNew,
  CheckCircle,
  Error,
  Link,
  Storage,
  Package,
  Update,
  Build,
  CloudDownload,
  ExpandMore,
  ChevronRight,
  Info,
} from '@mui/icons-material';

// Interfaces
interface SupplyChainVector {
  id: string;
  name: string;
  type: 'software' | 'hardware' | 'service' | 'process' | 'vendor';
  attack_stage: 'development' | 'build' | 'distribution' | 'update' | 'deployment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  attack_techniques: string[];
  affected_components: string[];
  impact_scope: 'limited' | 'moderate' | 'extensive' | 'global';
  detection_difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  persistence_methods: string[];
  attribution_challenges: string[];
  real_world_incidents: string[];
  prevention_strategies: string[];
  detection_methods: string[];
  recovery_procedures: string[];
  business_impact: 'low' | 'medium' | 'high' | 'critical';
  technical_complexity: 'low' | 'medium' | 'high' | 'expert';
  first_observed: Date;
  last_updated: Date;
  affected_industries: string[];
}

interface DependencyAsset {
  id: string;
  name: string;
  type: 'npm_package' | 'maven_artifact' | 'nuget_package' | 'pip_package' | 'docker_image' | 'library' | 'framework';
  vendor: string;
  version: string;
  risk_score: number;
  vulnerabilities: string[];
  dependencies: string[];
  usage_frequency: number;
  last_updated: Date;
  license_type: string;
  maintainer_trust: 'unknown' | 'low' | 'medium' | 'high' | 'verified';
  download_count: number;
  security_advisories: number;
  code_quality_score: number;
  community_support: 'poor' | 'fair' | 'good' | 'excellent';
}

interface SupplyChainIncident {
  id: string;
  name: string;
  incident_type: string;
  date_discovered: Date;
  affected_vendors: string[];
  estimated_impact: number;
  attack_duration: string;
  attribution: string;
  sectors_affected: string[];
  geographical_scope: string[];
  attack_sophistication: 'basic' | 'intermediate' | 'advanced' | 'nation_state';
  detection_method: string;
  response_time: string;
  recovery_time: string;
  lessons_learned: string[];
}

interface SupplyChainMetrics {
  total_vectors: number;
  high_risk_dependencies: number;
  recent_incidents: number;
  vendor_trust_score: number;
  dependency_health_score: number;
  detection_coverage: number;
  mean_time_to_discovery: number;
  supply_chain_maturity: number;
}

const SupplyChainCompromiseVectors: React.FC = () => {
  const theme = useTheme();
  
  // State management
  const [vectors, setVectors] = useState<SupplyChainVector[]>([]);
  const [dependencies, setDependencies] = useState<DependencyAsset[]>([]);
  const [incidents, setIncidents] = useState<SupplyChainIncident[]>([]);
  const [metrics, setMetrics] = useState<SupplyChainMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection states
  const [selectedVector, setSelectedVector] = useState<SupplyChainVector | null>(null);
  const [selectedDependency, setSelectedDependency] = useState<DependencyAsset | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Simulated data generation
  const generateSupplyChainData = useCallback(() => {
    const vectorTypes = ['software', 'hardware', 'service', 'process', 'vendor'] as const;
    const attackStages = ['development', 'build', 'distribution', 'update', 'deployment'] as const;
    const severityLevels = ['low', 'medium', 'high', 'critical'] as const;
    const dependencyTypes = ['npm_package', 'maven_artifact', 'nuget_package', 'pip_package', 'docker_image', 'library', 'framework'] as const;
    const industries = ['Technology', 'Finance', 'Healthcare', 'Government', 'Manufacturing', 'Retail'];

    // Generate supply chain vectors
    const vectorData: SupplyChainVector[] = [];
    for (let i = 0; i < 18; i++) {
      const type = vectorTypes[Math.floor(Math.random() * vectorTypes.length)];
      const stage = attackStages[Math.floor(Math.random() * attackStages.length)];
      const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
      
      vectorData.push({
        id: `vector-${i + 1}`,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Supply Chain Attack ${i + 1}`,
        type,
        attack_stage: stage,
        severity: severity as any,
        description: `${type} supply chain compromise targeting ${stage} stage of software development lifecycle`,
        attack_techniques: [
          'Typosquatting',
          'Dependency Confusion',
          'Malicious Package Injection',
          'Build System Compromise',
          'Code Signing Certificate Theft'
        ],
        affected_components: [
          'Third-party libraries',
          'Build tools',
          'Package managers',
          'CI/CD pipelines'
        ],
        impact_scope: ['limited', 'moderate', 'extensive', 'global'][Math.floor(Math.random() * 4)] as any,
        detection_difficulty: ['easy', 'medium', 'hard', 'very_hard'][Math.floor(Math.random() * 4)] as any,
        persistence_methods: [
          'Backdoor insertion',
          'Legitimate functionality abuse',
          'Update mechanism hijacking'
        ],
        attribution_challenges: [
          'Legitimate code modification',
          'Time-delayed activation',
          'Multiple layer obfuscation'
        ],
        real_world_incidents: [
          'SolarWinds (2020)',
          'Codecov (2021)',
          'Kaseya (2021)',
          'Log4j (2021)'
        ],
        prevention_strategies: [
          'Software Bill of Materials (SBOM)',
          'Code signing verification',
          'Supply chain risk assessment',
          'Vendor security evaluation'
        ],
        detection_methods: [
          'Behavioral analysis',
          'Integrity monitoring',
          'Anomaly detection',
          'Threat intelligence feeds'
        ],
        recovery_procedures: [
          'Incident response activation',
          'Asset inventory verification',
          'Clean build environment setup',
          'Dependency replacement'
        ],
        business_impact: severity as any,
        technical_complexity: ['low', 'medium', 'high', 'expert'][Math.floor(Math.random() * 4)] as any,
        first_observed: new Date(Date.now() - Math.random() * 1000 * 24 * 60 * 60 * 1000),
        last_updated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        affected_industries: industries.slice(0, Math.floor(Math.random() * 3) + 1)
      });
    }

    // Generate dependency assets
    const dependencyData: DependencyAsset[] = [];
    for (let i = 0; i < 25; i++) {
      const type = dependencyTypes[Math.floor(Math.random() * dependencyTypes.length)];
      const vendors = ['Microsoft', 'Google', 'Apache', 'Mozilla', 'Red Hat', 'Oracle', 'IBM', 'Amazon'];
      
      dependencyData.push({
        id: `dependency-${i + 1}`,
        name: `${type.replace('_', '-')}-library-${i + 1}`,
        type,
        vendor: vendors[Math.floor(Math.random() * vendors.length)],
        version: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 20)}`,
        risk_score: Math.floor(Math.random() * 100),
        vulnerabilities: [
          `CVE-2024-${1000 + i}`,
          `CVE-2023-${2000 + i}`
        ],
        dependencies: [
          `dependency-${Math.floor(Math.random() * 10) + 1}`,
          `dependency-${Math.floor(Math.random() * 10) + 11}`
        ],
        usage_frequency: Math.floor(Math.random() * 100),
        last_updated: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        license_type: ['MIT', 'Apache 2.0', 'GPL v3', 'BSD', 'Proprietary'][Math.floor(Math.random() * 5)],
        maintainer_trust: ['unknown', 'low', 'medium', 'high', 'verified'][Math.floor(Math.random() * 5)] as any,
        download_count: Math.floor(Math.random() * 10000000) + 1000,
        security_advisories: Math.floor(Math.random() * 10),
        code_quality_score: Math.floor(Math.random() * 40) + 60,
        community_support: ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)] as any
      });
    }

    // Generate supply chain incidents
    const incidentData: SupplyChainIncident[] = [];
    const realIncidents = [
      'SolarWinds Orion',
      'Codecov Bash Uploader',
      'Kaseya VSA',
      'Log4Shell',
      'Event-Stream NPM',
      'CCleaner',
      'NotPetya',
      'ASUS Live Update'
    ];

    realIncidents.forEach((incident, index) => {
      incidentData.push({
        id: `incident-${index + 1}`,
        name: incident,
        incident_type: 'Software Supply Chain Compromise',
        date_discovered: new Date(Date.now() - Math.random() * 1000 * 24 * 60 * 60 * 1000),
        affected_vendors: [
          vendors[Math.floor(Math.random() * vendors.length)],
          vendors[Math.floor(Math.random() * vendors.length)]
        ],
        estimated_impact: Math.floor(Math.random() * 100000) + 10000,
        attack_duration: `${Math.floor(Math.random() * 12) + 1} months`,
        attribution: `APT-${Math.floor(Math.random() * 50) + 1}`,
        sectors_affected: industries.slice(0, Math.floor(Math.random() * 3) + 1),
        geographical_scope: ['Global', 'US/EU', 'APAC', 'Americas'][Math.floor(Math.random() * 4)],
        attack_sophistication: ['basic', 'intermediate', 'advanced', 'nation_state'][Math.floor(Math.random() * 4)] as any,
        detection_method: ['Internal monitoring', 'Third-party discovery', 'Customer report', 'Security research'][Math.floor(Math.random() * 4)],
        response_time: `${Math.floor(Math.random() * 30) + 1} days`,
        recovery_time: `${Math.floor(Math.random() * 180) + 30} days`,
        lessons_learned: [
          'Enhanced vendor assessment required',
          'Continuous monitoring implementation',
          'Incident response plan updates',
          'Supply chain mapping improvements'
        ]
      });
    });

    // Generate metrics
    const metricsData: SupplyChainMetrics = {
      total_vectors: vectorData.length,
      high_risk_dependencies: dependencyData.filter(d => d.risk_score > 70).length,
      recent_incidents: incidentData.filter(i => 
        new Date(i.date_discovered).getTime() > Date.now() - 365 * 24 * 60 * 60 * 1000
      ).length,
      vendor_trust_score: Math.floor(Math.random() * 30) + 70,
      dependency_health_score: Math.floor(Math.random() * 25) + 75,
      detection_coverage: Math.floor(Math.random() * 20) + 70,
      mean_time_to_discovery: Math.floor(Math.random() * 200) + 50,
      supply_chain_maturity: Math.floor(Math.random() * 30) + 60
    };

    setVectors(vectorData);
    setDependencies(dependencyData);
    setIncidents(incidentData);
    setMetrics(metricsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    generateSupplyChainData();
  }, [generateSupplyChainData]);

  // Filtered data
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
      case 'software': return <Package />;
      case 'hardware': return <Build />;
      case 'service': return <CloudDownload />;
      case 'process': return <AccountTree />;
      case 'vendor': return <Link />;
      default: return <Security />;
    }
  };

  const getTrustColor = (trust: string) => {
    switch (trust) {
      case 'verified': return theme.palette.success.main;
      case 'high': return theme.palette.info.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return '#ff9800';
      case 'unknown': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  // Render overview metrics
  const renderOverviewMetrics = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {[
        { label: 'Total Vectors', value: metrics?.total_vectors || 0, icon: <AccountTree />, color: theme.palette.primary.main },
        { label: 'High Risk Dependencies', value: metrics?.high_risk_dependencies || 0, icon: <Warning />, color: theme.palette.error.main },
        { label: 'Recent Incidents', value: metrics?.recent_incidents || 0, icon: <Error />, color: theme.palette.warning.main },
        { label: 'Supply Chain Maturity', value: `${metrics?.supply_chain_maturity || 0}%`, icon: <Shield />, color: theme.palette.success.main }
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
            <TableCell>Attack Stage</TableCell>
            <TableCell>Severity</TableCell>
            <TableCell>Impact Scope</TableCell>
            <TableCell>Detection Difficulty</TableCell>
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
                  <Chip size="small" label={vector.attack_stage} variant="outlined" />
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
                <TableCell>
                  <Chip
                    size="small"
                    label={vector.impact_scope}
                    color={vector.impact_scope === 'global' ? 'error' : 
                           vector.impact_scope === 'extensive' ? 'warning' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={vector.detection_difficulty}
                    color={vector.detection_difficulty === 'very_hard' ? 'error' : 
                           vector.detection_difficulty === 'hard' ? 'warning' : 'success'}
                  />
                </TableCell>
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

  // Render dependencies
  const renderDependencies = () => (
    <Grid container spacing={3}>
      {dependencies.slice(0, 12).map((dependency) => (
        <Grid item xs={12} md={6} lg={4} key={dependency.id}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
              }
            }}
            onClick={() => {
              setSelectedDependency(dependency);
              setDetailsOpen(true);
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {dependency.name}
                </Typography>
                <Chip
                  size="small"
                  label={dependency.maintainer_trust}
                  sx={{
                    bgcolor: alpha(getTrustColor(dependency.maintainer_trust), 0.1),
                    color: getTrustColor(dependency.maintainer_trust)
                  }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {dependency.vendor} • v{dependency.version}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" display="block">
                  Risk Score: {dependency.risk_score}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={dependency.risk_score}
                  color={dependency.risk_score > 70 ? 'error' : dependency.risk_score > 40 ? 'warning' : 'success'}
                  sx={{ mb: 1, height: 6, borderRadius: 3 }}
                />
                <Typography variant="caption" display="block">
                  Downloads: {dependency.download_count.toLocaleString()}
                </Typography>
                <Typography variant="caption" display="block">
                  Quality Score: {dependency.code_quality_score}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip size="small" label={dependency.type.replace('_', ' ')} />
                <Chip size="small" label={dependency.license_type} variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render incidents
  const renderIncidents = () => (
    <Grid container spacing={3}>
      {incidents.map((incident) => (
        <Grid item xs={12} md={6} key={incident.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {incident.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {incident.incident_type}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" display="block">
                  Discovered: {incident.date_discovered.toLocaleDateString()}
                </Typography>
                <Typography variant="caption" display="block">
                  Estimated Impact: {incident.estimated_impact.toLocaleString()} organizations
                </Typography>
                <Typography variant="caption" display="block">
                  Attack Duration: {incident.attack_duration}
                </Typography>
                <Typography variant="caption" display="block">
                  Attribution: {incident.attribution}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip
                  size="small"
                  label={incident.attack_sophistication}
                  color={incident.attack_sophistication === 'nation_state' ? 'error' : 
                         incident.attack_sophistication === 'advanced' ? 'warning' : 'default'}
                />
                <Chip size="small" label={incident.geographical_scope} variant="outlined" />
              </Box>
              <Typography variant="caption" color="textSecondary">
                Response Time: {incident.response_time} • Recovery: {incident.recovery_time}
              </Typography>
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
          Supply Chain Compromise Vectors
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive analysis of supply chain attack vectors, dependencies, and security incidents
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
                <MenuItem value="software">Software</MenuItem>
                <MenuItem value="hardware">Hardware</MenuItem>
                <MenuItem value="service">Service</MenuItem>
                <MenuItem value="process">Process</MenuItem>
                <MenuItem value="vendor">Vendor</MenuItem>
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
            <Button startIcon={<Refresh />} onClick={generateSupplyChainData}>
              Refresh
            </Button>
          </Box>

          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Attack Vectors" />
            <Tab label="Dependencies" />
            <Tab label="Historical Incidents" />
          </Tabs>

          {activeTab === 0 && renderVectorsTable()}
          {activeTab === 1 && renderDependencies()}
          {activeTab === 2 && renderIncidents()}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedVector?.name || selectedDependency?.name}
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
                      Attack Stage: {selectedVector.attack_stage}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Severity: {selectedVector.severity}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Impact Scope: {selectedVector.impact_scope}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Prevention Strategies
                  </Typography>
                  <List dense>
                    {selectedVector.prevention_strategies.map((strategy, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Shield />
                        </ListItemIcon>
                        <ListItemText primary={strategy} />
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

export default SupplyChainCompromiseVectors;