/**
 * Public Facing Application Attacks Analysis
 * Comprehensive analysis of web application attack vectors
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Status, Priority } from '../../types/index';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import {
  Web,
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
  CheckCircle,  Error as ErrorIcon,
  Code,
  Storage,
  API,
  ExpandMore,
  HttpIcon,
  LockOpen,
} from '@mui/icons-material';

// Interfaces
interface WebAppVector {
  id: string;
  name: string;
  category: 'injection' | 'broken_auth' | 'sensitive_data' | 'xxe' | 'broken_access' | 'security_misconfig' | 'xss' | 'deserialization' | 'components' | 'logging';
  owasp_rank: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  attack_vectors: string[];
  impact: string[];
  affected_frameworks: string[];
  common_vulnerabilities: string[];
  detection_methods: string[];
  prevention_techniques: string[];
  real_world_examples: string[];
  exploitation_difficulty: 'easy' | 'medium' | 'hard';
  automated_detection: boolean;
  business_impact: 'low' | 'medium' | 'high' | 'critical';
  prevalence: number;
  technical_impact: string;
  first_discovered: Date;
  last_updated: Date;
  cwe_mapping: string[];
}

interface ApplicationAsset {
  id: string;
  name: string;
  url: string;
  technology_stack: string[];
  risk_score: number;
  vulnerabilities: string[];
  last_scan: Date;
  security_headers: boolean;
  https_enforced: boolean;
  waf_protected: boolean;
  authentication_type: string;
  data_sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  business_criticality: 'low' | 'medium' | 'high' | 'critical';
}

interface AttackCampaign {
  id: string;
  name: string;
  target_vector: string;
  actor_group: string;
  start_date: Date;
  end_date?: Date;
  targets_affected: number;
  success_rate: number;
  geographic_scope: string[];
  industry_targets: string[];
  attack_sophistication: 'basic' | 'intermediate' | 'advanced' | 'expert';
  tools_used: string[];
}

interface WebAppMetrics {
  total_vectors: number;
  critical_vulnerabilities: number;
  active_campaigns: number;
  assets_at_risk: number;
  detection_coverage: number;
  prevention_rate: number;
  mean_time_to_detection: number;
  mean_time_to_remediation: number;
}

const PublicFacingApplicationAttacks: React.FC = () => {
  const theme = useTheme();
  
  // State management
  const [vectors, setVectors] = useState<WebAppVector[]>([]);
  const [assets, setAssets] = useState<ApplicationAsset[]>([]);
  const [campaigns, setCampaigns] = useState<AttackCampaign[]>([]);
  const [metrics, setMetrics] = useState<WebAppMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection states
  const [selectedVector, setSelectedVector] = useState<WebAppVector | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<ApplicationAsset | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Simulated data generation
  const generateWebAppData = useCallback(() => {
    const categories = ['injection', 'broken_auth', 'sensitive_data', 'xxe', 'broken_access', 'security_misconfig', 'xss', 'deserialization', 'components', 'logging'] as const;
    const severityLevels = ['low', 'medium', 'high', 'critical'] as const;
    const frameworks = ['React', 'Angular', 'Vue.js', 'Django', 'Spring Boot', 'Express.js', 'Laravel', 'ASP.NET'];
    const owaspTop10 = [
      'Injection',
      'Broken Authentication',
      'Sensitive Data Exposure',
      'XML External Entities (XXE)',
      'Broken Access Control',
      'Security Misconfiguration',
      'Cross-Site Scripting (XSS)',
      'Insecure Deserialization',
      'Using Components with Known Vulnerabilities',
      'Insufficient Logging & Monitoring'
    ];

    // Generate web app vectors (OWASP Top 10 based)
    const vectorData: WebAppVector[] = [];
    owaspTop10.forEach((name, index) => {
      const category = categories[index];
      const severity = index < 3 ? 'critical' : index < 6 ? 'high' : index < 8 ? 'medium' : 'low';
      
      vectorData.push({
        id: `vector-${index + 1}`,
        name,
        category,
        owasp_rank: index + 1,
        severity: severity as any,
        description: `OWASP Top 10 #${index + 1}: ${name} vulnerabilities in web applications`,
        attack_vectors: [
          'Direct attack via input fields',
          'Automated scanning tools',
          'Manual exploitation',
          'Social engineering'
        ],
        impact: [
          'Data breach',
          'System compromise',
          'Service disruption',
          'Reputation damage'
        ],
        affected_frameworks: frameworks.slice(0, Math.floor(Math.random() * 4) + 2),
        common_vulnerabilities: [
          `CVE-2024-${1000 + index}`,
          `CVE-2023-${2000 + index}`,
          'Configuration weakness'
        ],
        detection_methods: [
          'Static Application Security Testing (SAST)',
          'Dynamic Application Security Testing (DAST)',
          'Interactive Application Security Testing (IAST)',
          'Runtime Application Self-Protection (RASP)'
        ],
        prevention_techniques: [
          'Input validation',
          'Output encoding',
          'Parameterized queries',
          'Security headers'
        ],
        real_world_examples: [
          'Equifax breach (2017)',
          'Capital One breach (2019)',
          'SolarWinds attack (2020)'
        ],
        exploitation_difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as any,
        automated_detection: Math.random() > 0.3,
        business_impact: severity as any,
        prevalence: Math.floor(Math.random() * 50) + 30,
        technical_impact: `High impact on ${['confidentiality', 'integrity', 'availability'][Math.floor(Math.random() * 3)]}`,
        first_discovered: new Date(Date.now() - Math.random() * 1000 * 24 * 60 * 60 * 1000),
        last_updated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        cwe_mapping: [`CWE-${100 + index}`, `CWE-${200 + index}`]
      });
    });

    // Generate application assets
    const assetData: ApplicationAsset[] = [];
    for (let i = 0; i < 15; i++) {
      const techStacks = [
        ['React', 'Node.js', 'MongoDB'],
        ['Angular', 'Spring Boot', 'PostgreSQL'],
        ['Vue.js', 'Django', 'MySQL'],
        ['Laravel', 'PHP', 'MariaDB'],
        ['ASP.NET', 'C#', 'SQL Server']
      ];
      
      assetData.push({
        id: `asset-${i + 1}`,
        name: `Web Application ${i + 1}`,
        url: `https://app${i + 1}.company.com`,
        technology_stack: techStacks[Math.floor(Math.random() * techStacks.length)],
        risk_score: Math.floor(Math.random() * 100),
        vulnerabilities: [
          `${owaspTop10[Math.floor(Math.random() * owaspTop10.length)]}`,
          `CVE-2024-${1000 + i}`
        ],
        last_scan: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        security_headers: Math.random() > 0.3,
        https_enforced: Math.random() > 0.2,
        waf_protected: Math.random() > 0.5,
        authentication_type: ['OAuth 2.0', 'SAML', 'Basic Auth', 'Multi-Factor'][Math.floor(Math.random() * 4)],
        data_sensitivity: ['public', 'internal', 'confidential', 'restricted'][Math.floor(Math.random() * 4)] as any,
        business_criticality: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any
      });
    }

    // Generate attack campaigns
    const campaignData: AttackCampaign[] = [];
    for (let i = 0; i < 8; i++) {
      campaignData.push({
        id: `campaign-${i + 1}`,
        name: `Web App Campaign ${i + 1}`,
        target_vector: owaspTop10[Math.floor(Math.random() * owaspTop10.length)],
        actor_group: `APT-${Math.floor(Math.random() * 50) + 1}`,
        start_date: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        end_date: Math.random() > 0.4 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
        targets_affected: Math.floor(Math.random() * 1000) + 100,
        success_rate: Math.floor(Math.random() * 40) + 10,
        geographic_scope: ['US', 'EU', 'APAC', 'Global'].slice(0, Math.floor(Math.random() * 3) + 1),
        industry_targets: ['Finance', 'Healthcare', 'Government', 'Technology'].slice(0, Math.floor(Math.random() * 3) + 1),
        attack_sophistication: ['basic', 'intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 4)] as any,
        tools_used: ['SQLMap', 'Burp Suite', 'OWASP ZAP', 'Metasploit'].slice(0, Math.floor(Math.random() * 3) + 1)
      });
    }

    // Generate metrics
    const metricsData: WebAppMetrics = {
      total_vectors: vectorData.length,
      critical_vulnerabilities: vectorData.filter(v => v.severity === 'critical').length,
      active_campaigns: campaignData.filter(c => !c.end_date).length,
      assets_at_risk: assetData.filter(a => a.risk_score > 70).length,
      detection_coverage: Math.floor(Math.random() * 30) + 70,
      prevention_rate: Math.floor(Math.random() * 25) + 75,
      mean_time_to_detection: Math.floor(Math.random() * 48) + 2,
      mean_time_to_remediation: Math.floor(Math.random() * 168) + 24
    };

    setVectors(vectorData);
    setAssets(assetData);
    setCampaigns(campaignData);
    setMetrics(metricsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    generateWebAppData();
  }, [generateWebAppData]);

  // Filtered data
  const filteredVectors = useMemo(() => {
    return vectors.filter(vector => {
      const matchesSearch = vector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vector.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || vector.category === filterCategory;
      const matchesSeverity = filterSeverity === 'all' || vector.severity === filterSeverity;
      
      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [vectors, searchTerm, filterCategory, filterSeverity]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return '#ff9800';
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'injection': return <Code />;
      case 'broken_auth': return <LockOpen />;
      case 'sensitive_data': return <Storage />;
      case 'xxe': return <BugReport />;
      case 'broken_access': return <Security />;
      case 'security_misconfig': return <Warning />;
      case 'xss': return <Web />;
      case 'deserialization': return <API />;
      case 'components': return <Assessment />;
      case 'logging': return <Visibility />;
      default: return <Security />;
    }
  };

  // Render overview metrics
  const renderOverviewMetrics = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {[
        { label: 'Total Vectors', value: metrics?.total_vectors || 0, icon: <Web />, color: theme.palette.primary.main },
        { label: 'Critical Vulns', value: metrics?.critical_vulnerabilities || 0, icon: <ErrorIcon />, color: theme.palette.error.main },
        { label: 'Active Campaigns', value: metrics?.active_campaigns || 0, icon: <TrendingUp />, color: theme.palette.warning.main },
        { label: 'Prevention Rate', value: `${metrics?.prevention_rate || 0}%`, icon: <Shield />, color: theme.palette.success.main }
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

  // Render OWASP vectors
  const renderOWASPVectors = () => (
    <Grid container spacing={3}>
      {filteredVectors.map((vector) => (
        <Grid item xs={12} md={6} lg={4} key={vector.id}>
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
              setSelectedVector(vector);
              setDetailsOpen(true);
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getCategoryIcon(vector.category)}
                  <Chip 
                    size="small" 
                    label={`#${vector.owasp_rank}`}
                    color="primary"
                  />
                </Box>
                <Chip
                  size="small"
                  label={vector.severity}
                  sx={{
                    bgcolor: alpha(getSeverityColor(vector.severity), 0.1),
                    color: getSeverityColor(vector.severity)
                  }}
                />
              </Box>
              <Typography variant="h6" gutterBottom>
                {vector.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {vector.description}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" display="block">
                  Prevalence: {vector.prevalence}%
                </Typography>
                <Typography variant="caption" display="block">
                  Difficulty: {vector.exploitation_difficulty}
                </Typography>
                <Typography variant="caption" display="block">
                  Auto Detection: {vector.automated_detection ? 'Yes' : 'No'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {vector.affected_frameworks.slice(0, 2).map((framework) => (
                  <Chip key={framework} size="small" label={framework} variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render application assets
  const renderAssets = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Application</TableCell>
            <TableCell>Technology Stack</TableCell>
            <TableCell>Risk Score</TableCell>
            <TableCell>Security Status</TableCell>
            <TableCell>Data Sensitivity</TableCell>
            <TableCell>Criticality</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id} hover>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {asset.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {asset.url}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {asset.technology_stack.map((tech) => (
                    <Chip key={tech} size="small" label={tech} variant="outlined" />
                  ))}
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={asset.risk_score}
                    color={asset.risk_score > 70 ? 'error' : asset.risk_score > 40 ? 'warning' : 'success'}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption">
                    {asset.risk_score}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {asset.https_enforced && <CheckCircle color="success" fontSize="small" />}
                  {asset.waf_protected && <Shield color="primary" fontSize="small" />}
                  {asset.security_headers && <Security color="info" fontSize="small" />}
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={asset.data_sensitivity}
                  color={asset.data_sensitivity === 'restricted' ? 'error' :
                         asset.data_sensitivity === 'confidential' ? 'warning' : 'default'}
                />
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={asset.business_criticality}
                  color={asset.business_criticality === 'critical' ? 'error' :
                         asset.business_criticality === 'high' ? 'warning' : 'default'}
                />
              </TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedAsset(asset);
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
    </TableContainer>
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
          Public Facing Application Attacks
        </Typography>
        <Typography variant="body1" color="textSecondary">
          OWASP Top 10 and web application security vulnerability analysis platform
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
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="injection">Injection</MenuItem>
                <MenuItem value="broken_auth">Broken Auth</MenuItem>
                <MenuItem value="sensitive_data">Sensitive Data</MenuItem>
                <MenuItem value="xxe">XXE</MenuItem>
                <MenuItem value="broken_access">Broken Access</MenuItem>
                <MenuItem value="security_misconfig">Misconfig</MenuItem>
                <MenuItem value="xss">XSS</MenuItem>
                <MenuItem value="deserialization">Deserialization</MenuItem>
                <MenuItem value="components">Components</MenuItem>
                <MenuItem value="logging">Logging</MenuItem>
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
            <Button startIcon={<Refresh />} onClick={generateWebAppData}>
              Refresh
            </Button>
          </Box>

          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="OWASP Top 10" />
            <Tab label="Application Assets" />
            <Tab label="Attack Campaigns" />
          </Tabs>

          {activeTab === 0 && renderOWASPVectors()}
          {activeTab === 1 && renderAssets()}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              {campaigns.map((campaign) => (
                <Grid item xs={12} md={6} key={campaign.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {campaign.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Target Vector: {campaign.target_vector}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Actor: {campaign.actor_group}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" display="block">
                          Targets Affected: {campaign.targets_affected.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Success Rate: {campaign.success_rate}%
                        </Typography>
                        <Typography variant="caption" display="block">
                          Sophistication: {campaign.attack_sophistication}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {campaign.tools_used.map((tool) => (
                          <Chip key={tool} size="small" label={tool} />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
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
          {selectedVector?.name || selectedAsset?.name}
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
                      OWASP Rank: #{selectedVector.owasp_rank}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Category: {selectedVector.category}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Severity: {selectedVector.severity}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Business Impact: {selectedVector.business_impact}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Prevention Techniques
                  </Typography>
                  <List dense>
                    {selectedVector.prevention_techniques.map((technique, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Shield />
                        </ListItemIcon>
                        <ListItemText primary={technique} />
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
            onClick={() => window.open('https://owasp.org/www-project-top-ten/', '_blank')}
          >
            OWASP Reference
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublicFacingApplicationAttacks;