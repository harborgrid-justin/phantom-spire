/**
 * Comprehensive MITRE ATT&CK Framework Integration
 * Advanced tactics, techniques, and procedures (TTPs) analysis platform
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Switch,
  FormControlLabel,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Collapse,
  Stepper,
  Step,
  StepLabel,
  Breadcrumbs,
  Link,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemButton,
  ToggleButton,
  ToggleButtonGroup,
  RadioGroup,
  Radio,
  FormLabel,
  Checkbox
} from '@mui/material';

import { SimpleTreeView as TreeView, TreeItem } from '@mui/x-tree-view';

import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';

import {
  AccountTree,
  Security,
  Shield,
  BugReport,
  Gavel,
  Psychology,
  Code,
  Computer,
  NetworkCheck,
  Storage,
  Memory,
  Speed,
  Visibility,
  VisibilityOff,
  FilterList,
  Download,
  Share,
  Settings,
  Refresh,
  Search,
  Edit,
  Delete,
  Add,
  Remove,
  Star,
  StarBorder,
  Bookmark,
  BookmarkBorder,
  Flag,
  LocationOn,
  Schedule,
  Person,
  Business,
  Timeline as TimelineIcon,
  Analytics,
  Assessment,
  Report,
  Info,
  Warning,  Error as ErrorIcon,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ExpandMore,
  ExpandLess,
  ChevronRight,
  MoreVert,
  Launch,
  OpenInNew,
  Map,
  Hub,
  DeviceHub,
  Transform,
  Functions,
  AutoGraph,
  Insights,
  Calculate,
  Schema,
  GroupWork,
  CompareArrows,
  DataUsage,
  CloudDownload,
  Layers,
  ViewModule,
  FormatListBulleted,
  Dashboard,
  Category,
  Extension,
  Build,
  Engineering,
  Handyman,
  Construction,
  Architecture
} from '@mui/icons-material';

import {
  ResponsiveContainer,
  Treemap,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  LineChart,
  Line,
  ScatterChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart
} from 'recharts';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';

// MITRE ATT&CK interfaces
interface MitreTactic {
  id: string;
  name: string;
  description: string;
  shortName: string;
  url: string;
  external_references: {
    source_name: string;
    external_id: string;
    url: string;
  }[];
  techniques: string[];
  platforms: string[];
  x_mitre_version: string;
  created: Date;
  modified: Date;
  killChainPhases: string[];
  color: string;
  position: number;
}

interface MitreTechnique {
  id: string;
  name: string;
  description: string;
  url: string;
  tactics: string[];
  platforms: string[];
  data_sources: string[];
  detection: string;
  mitigation: string[];
  subtechniques: string[];
  x_mitre_version: string;
  x_mitre_data_sources: string[];
  x_mitre_detection: string;
  x_mitre_platforms: string[];
  x_mitre_permissions_required: string[];
  x_mitre_effective_permissions: string[];
  x_mitre_system_requirements: string[];
  x_mitre_network_requirements: boolean;
  x_mitre_remote_support: boolean;
  external_references: {
    source_name: string;
    external_id: string;
    url: string;
    description?: string;
  }[];
  kill_chain_phases: {
    kill_chain_name: string;
    phase_name: string;
  }[];
  created: Date;
  modified: Date;
  revoked?: boolean;
  deprecated?: boolean;
  usage: {
    frequency: number;
    campaigns: string[];
    actors: string[];
    malware: string[];
    tools: string[];
  };
  detection_coverage: {
    level: 'none' | 'minimal' | 'partial' | 'good' | 'excellent';
    sources: string[];
    rules: string[];
    confidence: number;
  };
  mitigation_coverage: {
    level: 'none' | 'minimal' | 'partial' | 'good' | 'excellent';
    controls: string[];
    effectiveness: number;
  };
}

interface MitreSubtechnique {
  id: string;
  name: string;
  description: string;
  parent_technique: string;
  url: string;
  platforms: string[];
  data_sources: string[];
  detection: string;
  mitigation: string[];
  x_mitre_version: string;
  external_references: {
    source_name: string;
    external_id: string;
    url: string;
  }[];
  created: Date;
  modified: Date;
}

interface MitreMitigation {
  id: string;
  name: string;
  description: string;
  url: string;
  techniques: string[];
  x_mitre_version: string;
  external_references: {
    source_name: string;
    external_id: string;
    url: string;
  }[];
  created: Date;
  modified: Date;
  implementation: {
    difficulty: 'low' | 'medium' | 'high';
    cost: 'low' | 'medium' | 'high';
    effectiveness: number;
    coverage: string[];
  };
}

interface TTPMapping {
  id: string;
  entityId: string;
  entityType: 'ioc' | 'actor' | 'campaign' | 'malware' | 'incident';
  tactics: string[];
  techniques: string[];
  subtechniques: string[];
  confidence: number;
  evidence: {
    type: 'observed' | 'inferred' | 'reported';
    description: string;
    sources: string[];
    confidence: number;
  }[];
  timeline: {
    date: Date;
    tactic: string;
    technique: string;
    description: string;
    confidence: number;
  }[];
  attribution: {
    actor?: string;
    campaign?: string;
    confidence: number;
  };
  lastUpdated: Date;
  updatedBy: string;
}

interface AttackPath {
  id: string;
  name: string;
  description: string;
  actor?: string;
  campaign?: string;
  sequence: {
    step: number;
    tactic: string;
    technique: string;
    subtechnique?: string;
    description: string;
    requirements: string[];
    detection_opportunities: string[];
    mitigation_opportunities: string[];
  }[];
  probability: number;
  impact: number;
  difficulty: number;
  stealth: number;
  duration: string;
  prerequisites: string[];
  artifacts: string[];
  countermeasures: string[];
}

const MITREAttackIntegration: React.FC = () => {
  const theme = useTheme();
  
  // Core data states
  const [tactics, setTactics] = useState<MitreTactic[]>([]);
  const [techniques, setTechniques] = useState<MitreTechnique[]>([]);
  const [subtechniques, setSubtechniques] = useState<MitreSubtechnique[]>([]);
  const [mitigations, setMitigations] = useState<MitreMitigation[]>([]);
  const [ttpMappings, setTTPMappings] = useState<TTPMapping[]>([]);
  const [attackPaths, setAttackPaths] = useState<AttackPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection states
  const [selectedTactic, setSelectedTactic] = useState<string | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<MitreTechnique | null>(null);
  const [selectedMapping, setSelectedMapping] = useState<TTPMapping | null>(null);
  const [selectedPath, setSelectedPath] = useState<AttackPath | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'matrix' | 'tree' | 'timeline' | 'paths'>('matrix');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pathDetailsOpen, setPathDetailsOpen] = useState(false);
  const [mappingOpen, setMappingOpen] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [tacticFilter, setTacticFilter] = useState<string>('all');
  const [dataSourceFilter, setDataSourceFilter] = useState<string>('all');
  const [coverageFilter, setCoverageFilter] = useState<string>('all');
  const [showDeprecated, setShowDeprecated] = useState(false);
  const [showRevoked, setShowRevoked] = useState(false);
  
  // Matrix states
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [matrixFilter, setMatrixFilter] = useState<'usage' | 'detection' | 'mitigation'>('usage');

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('mitre-attack-integration', {
      continuous: true,
      position: 'top-right',
      minimized: true,
      interval: 150000
    });

    return () => evaluationController.remove();
  }, []);

  // Generate mock MITRE data
  const generateMockMITREData = useCallback(() => {
    // Generate tactics
    const tacticData: MitreTactic[] = [
      {
        id: 'TA0001',
        name: 'Initial Access',
        description: 'The adversary is trying to get into your network.',
        shortName: 'initial-access',
        url: 'https://attack.mitre.org/tactics/TA0001/',
        external_references: [
          {
            source_name: 'mitre-attack',
            external_id: 'TA0001',
            url: 'https://attack.mitre.org/tactics/TA0001/'
          }
        ],
        techniques: ['T1566', 'T1190', 'T1078', 'T1133'],
        platforms: ['Windows', 'macOS', 'Linux'],
        x_mitre_version: '1.0',
        created: new Date('2017-05-31'),
        modified: new Date('2024-01-15'),
        killChainPhases: ['initial-access'],
        color: '#FF6B6B',
        position: 1
      },
      {
        id: 'TA0002',
        name: 'Execution',
        description: 'The adversary is trying to run malicious code.',
        shortName: 'execution',
        url: 'https://attack.mitre.org/tactics/TA0002/',
        external_references: [
          {
            source_name: 'mitre-attack',
            external_id: 'TA0002',
            url: 'https://attack.mitre.org/tactics/TA0002/'
          }
        ],
        techniques: ['T1059', 'T1203', 'T1204', 'T1106'],
        platforms: ['Windows', 'macOS', 'Linux'],
        x_mitre_version: '1.0',
        created: new Date('2017-05-31'),
        modified: new Date('2024-01-15'),
        killChainPhases: ['execution'],
        color: '#4ECDC4',
        position: 2
      },
      {
        id: 'TA0003',
        name: 'Persistence',
        description: 'The adversary is trying to maintain their foothold.',
        shortName: 'persistence',
        url: 'https://attack.mitre.org/tactics/TA0003/',
        external_references: [
          {
            source_name: 'mitre-attack',
            external_id: 'TA0003',
            url: 'https://attack.mitre.org/tactics/TA0003/'
          }
        ],
        techniques: ['T1053', 'T1543', 'T1547', 'T1574'],
        platforms: ['Windows', 'macOS', 'Linux'],
        x_mitre_version: '1.0',
        created: new Date('2017-05-31'),
        modified: new Date('2024-01-15'),
        killChainPhases: ['persistence'],
        color: '#45B7D1',
        position: 3
      },
      {
        id: 'TA0004',
        name: 'Privilege Escalation',
        description: 'The adversary is trying to gain higher-level permissions.',
        shortName: 'privilege-escalation',
        url: 'https://attack.mitre.org/tactics/TA0004/',
        external_references: [
          {
            source_name: 'mitre-attack',
            external_id: 'TA0004',
            url: 'https://attack.mitre.org/tactics/TA0004/'
          }
        ],
        techniques: ['T1068', 'T1055', 'T1134', 'T1548'],
        platforms: ['Windows', 'macOS', 'Linux'],
        x_mitre_version: '1.0',
        created: new Date('2017-05-31'),
        modified: new Date('2024-01-15'),
        killChainPhases: ['privilege-escalation'],
        color: '#96CEB4',
        position: 4
      },
      {
        id: 'TA0005',
        name: 'Defense Evasion',
        description: 'The adversary is trying to avoid being detected.',
        shortName: 'defense-evasion',
        url: 'https://attack.mitre.org/tactics/TA0005/',
        external_references: [
          {
            source_name: 'mitre-attack',
            external_id: 'TA0005',
            url: 'https://attack.mitre.org/tactics/TA0005/'
          }
        ],
        techniques: ['T1027', 'T1070', 'T1112', 'T1562'],
        platforms: ['Windows', 'macOS', 'Linux'],
        x_mitre_version: '1.0',
        created: new Date('2017-05-31'),
        modified: new Date('2024-01-15'),
        killChainPhases: ['defense-evasion'],
        color: '#FFEAA7',
        position: 5
      }
    ];

    // Generate techniques for each tactic
    const techniqueData: MitreTechnique[] = [];
    tacticData.forEach((tactic, tacticIndex) => {
      tactic.techniques.forEach((techId, techIndex) => {
        const platforms = ['Windows', 'macOS', 'Linux', 'Network', 'Cloud'];
        const randomPlatforms = platforms.slice(0, Math.floor(Math.random() * 3) + 1);
        
        techniqueData.push({
          id: techId,
          name: `Technique ${techId}`,
          description: `This technique is used to achieve ${tactic.name.toLowerCase()} objectives.`,
          url: `https://attack.mitre.org/techniques/${techId}/`,
          tactics: [tactic.id],
          platforms: randomPlatforms,
          data_sources: ['Process monitoring', 'File monitoring', 'Network traffic'],
          detection: 'Monitor for unusual process execution patterns',
          mitigation: [`M${1000 + techIndex}`, `M${1001 + techIndex}`],
          subtechniques: [`${techId}.001`, `${techId}.002`],
          x_mitre_version: '1.0',
          x_mitre_data_sources: ['Process monitoring', 'File monitoring'],
          x_mitre_detection: 'Monitor for process execution anomalies',
          x_mitre_platforms: randomPlatforms,
          x_mitre_permissions_required: ['User', 'Administrator'],
          x_mitre_effective_permissions: ['Administrator'],
          x_mitre_system_requirements: [],
          x_mitre_network_requirements: false,
          x_mitre_remote_support: true,
          external_references: [
            {
              source_name: 'mitre-attack',
              external_id: techId,
              url: `https://attack.mitre.org/techniques/${techId}/`
            }
          ],
          kill_chain_phases: [
            {
              kill_chain_name: 'mitre-attack',
              phase_name: tactic.shortName
            }
          ],
          created: new Date('2017-05-31'),
          modified: new Date('2024-01-15'),
          usage: {
            frequency: Math.floor(Math.random() * 100),
            campaigns: [`Campaign-${tacticIndex}-${techIndex}`, `Campaign-${tacticIndex + 1}-${techIndex}`],
            actors: [`APT${tacticIndex + techIndex}`, `Group${tacticIndex * 10 + techIndex}`],
            malware: [`Malware-${techId}`, `Tool-${techId}`],
            tools: [`Tool-${techId}-A`, `Tool-${techId}-B`]
          },
          detection_coverage: {
            level: ['none', 'minimal', 'partial', 'good', 'excellent'][Math.floor(Math.random() * 5)] as any,
            sources: ['SIEM', 'EDR', 'Network Monitoring'],
            rules: [`Rule-${techId}-1`, `Rule-${techId}-2`],
            confidence: Math.floor(Math.random() * 40) + 60
          },
          mitigation_coverage: {
            level: ['none', 'minimal', 'partial', 'good', 'excellent'][Math.floor(Math.random() * 5)] as any,
            controls: [`Control-${techId}-1`, `Control-${techId}-2`],
            effectiveness: Math.floor(Math.random() * 40) + 60
          }
        });
      });
    });

    // Generate attack paths
    const pathData: AttackPath[] = [];
    for (let i = 0; i < 10; i++) {
      const pathTactics = tacticData.slice(0, Math.floor(Math.random() * 4) + 2);
      
      pathData.push({
        id: `path-${i}`,
        name: `Attack Path ${i + 1}`,
        description: `Sophisticated attack chain targeting enterprise infrastructure`,
        actor: `APT-${i + 20}`,
        campaign: `Campaign-${i + 50}`,
        sequence: pathTactics.map((tactic, stepIndex) => ({
          step: stepIndex + 1,
          tactic: tactic.id,
          technique: tactic.techniques[0],
          description: `Execute ${tactic.name.toLowerCase()} phase`,
          requirements: ['Network access', 'Valid credentials'],
          detection_opportunities: ['Process monitoring', 'Network traffic analysis'],
          mitigation_opportunities: ['Application whitelisting', 'Network segmentation']
        })),
        probability: Math.floor(Math.random() * 40) + 60,
        impact: Math.floor(Math.random() * 40) + 60,
        difficulty: Math.floor(Math.random() * 100),
        stealth: Math.floor(Math.random() * 100),
        duration: ['Minutes', 'Hours', 'Days', 'Weeks'][Math.floor(Math.random() * 4)],
        prerequisites: ['Initial foothold', 'Network reconnaissance'],
        artifacts: ['Log entries', 'Network traffic', 'File modifications'],
        countermeasures: ['Detection rules', 'Preventive controls', 'Response procedures']
      });
    }

    return { tactics: tacticData, techniques: techniqueData, paths: pathData };
  }, []);

  // Load MITRE data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const { tactics: tacticData, techniques: techniqueData, paths: pathData } = generateMockMITREData();
        setTactics(tacticData);
        setTechniques(techniqueData);
        setAttackPaths(pathData);
        
        // Generate heatmap data
        const heatmap: Record<string, number> = {};
        techniqueData.forEach(tech => {
          tech.tactics.forEach(tacticId => {
            const key = `${tacticId}-${tech.id}`;
            heatmap[key] = tech.usage.frequency;
          });
        });
        setHeatmapData(heatmap);
        
      } catch (err) {
        setError('Failed to load MITRE ATT&CK data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockMITREData]);

  // Filter techniques
  const filteredTechniques = useMemo(() => {
    return techniques.filter(tech => {
      if (searchTerm && !tech.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !tech.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !tech.id.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (platformFilter !== 'all' && !tech.platforms.includes(platformFilter)) {
        return false;
      }
      if (tacticFilter !== 'all' && !tech.tactics.includes(tacticFilter)) {
        return false;
      }
      if (!showDeprecated && tech.deprecated) {
        return false;
      }
      if (!showRevoked && tech.revoked) {
        return false;
      }
      return true;
    });
  }, [techniques, searchTerm, platformFilter, tacticFilter, showDeprecated, showRevoked]);

  // Get coverage color
  const getCoverageColor = (level: string): string => {
    switch (level) {
      case 'excellent': return theme.palette.success.main;
      case 'good': return theme.palette.info.main;
      case 'partial': return theme.palette.warning.main;
      case 'minimal': return theme.palette.error.light;
      case 'none': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  // Render MITRE matrix
  const renderMatrix = () => (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            MITRE ATT&CK Enterprise Matrix
          </Typography>
          <ToggleButtonGroup
            value={matrixFilter}
            exclusive
            onChange={(_, value) => value && setMatrixFilter(value)}
            size="small"
          >
            <ToggleButton value="usage">Usage Frequency</ToggleButton>
            <ToggleButton value="detection">Detection Coverage</ToggleButton>
            <ToggleButton value="mitigation">Mitigation Coverage</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>
      
      <Paper sx={{ overflow: 'auto', maxHeight: 600 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 150, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                Technique
              </TableCell>
              {tactics.map(tactic => (
                <TableCell
                  key={tactic.id}
                  align="center"
                  sx={{
                    minWidth: 120,
                    bgcolor: alpha(tactic.color, 0.1),
                    fontWeight: 'bold'
                  }}
                >
                  <Box>
                    <Typography variant="caption" fontWeight="bold">
                      {tactic.name}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="textSecondary">
                      {tactic.id}
                    </Typography>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTechniques.map(technique => (
              <TableRow key={technique.id} hover>
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: 0,
                    bgcolor: 'background.paper',
                    zIndex: 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedTechnique(technique);
                    setDetailsOpen(true);
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {technique.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {technique.id}
                    </Typography>
                  </Box>
                </TableCell>
                {tactics.map(tactic => {
                  const isMapped = technique.tactics.includes(tactic.id);
                  const heatmapKey = `${tactic.id}-${technique.id}`;
                  const intensity = heatmapData[heatmapKey] || 0;
                  
                  return (
                    <TableCell
                      key={`${technique.id}-${tactic.id}`}
                      align="center"
                      sx={{
                        bgcolor: isMapped ? alpha(tactic.color, 0.3 + intensity / 100 * 0.4) : 'transparent',
                        cursor: isMapped ? 'pointer' : 'default',
                        border: selectedCells.includes(heatmapKey) ? `2px solid ${theme.palette.primary.main}` : undefined
                      }}
                      onClick={() => {
                        if (isMapped) {
                          setSelectedCells(prev => 
                            prev.includes(heatmapKey) 
                              ? prev.filter(key => key !== heatmapKey)
                              : [...prev, heatmapKey]
                          );
                        }
                      }}
                    >
                      {isMapped && (
                        <Box>
                          <Typography variant="caption" fontWeight="bold">
                            {matrixFilter === 'usage' && intensity}
                            {matrixFilter === 'detection' && technique.detection_coverage.level}
                            {matrixFilter === 'mitigation' && technique.mitigation_coverage.level}
                          </Typography>
                          {matrixFilter === 'usage' && (
                            <LinearProgress
                              variant="determinate"
                              value={intensity}
                              sx={{ mt: 0.5, height: 4 }}
                            />
                          )}
                        </Box>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );

  // Render technique tree
  const renderTechniqueTree = () => (
    <Paper sx={{ p: 2, maxHeight: 600, overflow: 'auto' }}>
      <TreeView
        defaultExpandedItems={tactics.map(t => t.id)}
      >
        {tactics.map(tactic => (
          <TreeItem
            key={tactic.id}
            itemId={tactic.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: tactic.color,
                    width: 24,
                    height: 24
                  }}
                >
                  <Typography variant="caption" fontWeight="bold">
                    {tactic.position}
                  </Typography>
                </Avatar>
                <Typography variant="body2" fontWeight="bold">
                  {tactic.name}
                </Typography>
                <Chip
                  size="small"
                  label={`${tactic.techniques.length} techniques`}
                  variant="outlined"
                />
              </Box>
            }
          >
            {filteredTechniques
              .filter(tech => tech.tactics.includes(tactic.id))
              .map(technique => (
                <TreeItem
                  key={technique.id}
                  itemId={technique.id}
                  label={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 0.5,
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setSelectedTechnique(technique);
                        setDetailsOpen(true);
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {technique.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ({technique.id})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Chip
                          size="small"
                          label={`${technique.usage.frequency}%`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={technique.detection_coverage.level}
                          sx={{
                            bgcolor: alpha(getCoverageColor(technique.detection_coverage.level), 0.1),
                            color: getCoverageColor(technique.detection_coverage.level)
                          }}
                        />
                      </Box>
                    </Box>
                  }
                >
                  {technique.subtechniques.map(subtech => (
                    <TreeItem
                      key={subtech}
                      itemId={subtech}
                      label={
                        <Typography variant="body2" color="textSecondary">
                          Subtechnique {subtech}
                        </Typography>
                      }
                    />
                  ))}
                </TreeItem>
              ))}
          </TreeItem>
        ))}
      </TreeView>
    </Paper>
  );

  // Render attack paths
  const renderAttackPaths = () => (
    <Grid container spacing={3}>
      {attackPaths.map(path => (
        <Grid item xs={12} lg={6} key={path.id}>
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
              setSelectedPath(path);
              setPathDetailsOpen(true);
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {path.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {path.description}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={`${path.sequence.length} steps`}
                  color="primary"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Timeline sx={{ p: 0 }}>
                  {path.sequence.slice(0, 3).map((step, index) => {
                    const tactic = tactics.find(t => t.id === step.tactic);
                    return (
                      <TimelineItem key={step.step}>
                        <TimelineOppositeContent sx={{ minWidth: 40 }}>
                          <Typography variant="caption" color="textSecondary">
                            {step.step}
                          </Typography>
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <TimelineDot
                            sx={{
                              bgcolor: tactic?.color || theme.palette.primary.main,
                              width: 16,
                              height: 16
                            }}
                          />
                          {index < 2 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body2" fontWeight="bold">
                            {tactic?.name || 'Unknown Tactic'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {step.technique}
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                    );
                  })}
                  {path.sequence.length > 3 && (
                    <TimelineItem>
                      <TimelineOppositeContent sx={{ minWidth: 40 }}>
                        <Typography variant="caption" color="textSecondary">
                          ...
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="grey" />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="caption" color="textSecondary">
                          +{path.sequence.length - 3} more steps
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  )}
                </Timeline>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Probability
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {path.probability}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Impact
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {path.impact}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Difficulty
                    </Typography>
                    <Typography variant="h6" color="info.main">
                      {path.difficulty}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Duration
                    </Typography>
                    <Typography variant="body2">
                      {path.duration}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {path.actor && (
                    <Chip
                      size="small"
                      label={path.actor}
                      icon={<Person />}
                      variant="outlined"
                    />
                  )}
                  {path.campaign && (
                    <Chip
                      size="small"
                      label={path.campaign}
                      icon={<Flag />}
                      variant="outlined"
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small">
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <Share fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          MITRE ATT&CK Integration
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive tactics, techniques, and procedures analysis framework
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <Shield />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {tactics.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tactics
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                  <Code />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {techniques.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Techniques
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <AccountTree />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {attackPaths.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Attack Paths
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <Assessment />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {Math.round(techniques.reduce((sum, t) => sum + t.detection_coverage.confidence, 0) / techniques.length)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Coverage
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search techniques, tactics..."
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
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Platform</InputLabel>
              <Select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                label="Platform"
              >
                <MenuItem value="all">All Platforms</MenuItem>
                <MenuItem value="Windows">Windows</MenuItem>
                <MenuItem value="macOS">macOS</MenuItem>
                <MenuItem value="Linux">Linux</MenuItem>
                <MenuItem value="Network">Network</MenuItem>
                <MenuItem value="Cloud">Cloud</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Tactic</InputLabel>
              <Select
                value={tacticFilter}
                onChange={(e) => setTacticFilter(e.target.value)}
                label="Tactic"
              >
                <MenuItem value="all">All Tactics</MenuItem>
                {tactics.map(tactic => (
                  <MenuItem key={tactic.id} value={tactic.id}>
                    {tactic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>View</InputLabel>
              <Select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                label="View"
              >
                <MenuItem value="matrix">Matrix View</MenuItem>
                <MenuItem value="tree">Tree View</MenuItem>
                <MenuItem value="timeline">Timeline</MenuItem>
                <MenuItem value="paths">Attack Paths</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showDeprecated}
                    onChange={(e) => setShowDeprecated(e.target.checked)}
                  />
                }
                label="Deprecated"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showRevoked}
                    onChange={(e) => setShowRevoked(e.target.checked)}
                  />
                }
                label="Revoked"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            {viewMode === 'matrix' && renderMatrix()}
            {viewMode === 'tree' && renderTechniqueTree()}
            {viewMode === 'paths' && renderAttackPaths()}
            {viewMode === 'timeline' && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Technique Timeline Analysis
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Timeline view coming soon...
                </Typography>
              </Paper>
            )}
          </>
        )}
      </Box>

      {/* Technique Details Dialog */}
      {selectedTechnique && (
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                <Code />
              </Avatar>
              <Box>
                <Typography variant="h5">
                  {selectedTechnique.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedTechnique.id} • MITRE ATT&CK
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2">
                    {selectedTechnique.description}
                  </Typography>
                </Paper>
                
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Detection & Mitigation
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Detection
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {selectedTechnique.detection}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {selectedTechnique.data_sources.map(source => (
                          <Chip
                            key={source}
                            size="small"
                            label={source}
                            color="info"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Mitigation
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {selectedTechnique.mitigation.map(mit => (
                          <Chip
                            key={mit}
                            size="small"
                            label={mit}
                            color="success"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Usage Statistics
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Frequency
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">
                          {selectedTechnique.usage.frequency}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={selectedTechnique.usage.frequency}
                          sx={{ flexGrow: 1 }}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Associated Campaigns
                      </Typography>
                      <Typography variant="body2">
                        {selectedTechnique.usage.campaigns.length}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Associated Actors
                      </Typography>
                      <Typography variant="body2">
                        {selectedTechnique.usage.actors.length}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
                
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Coverage Assessment
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Detection Coverage
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          size="small"
                          label={selectedTechnique.detection_coverage.level}
                          sx={{
                            bgcolor: alpha(getCoverageColor(selectedTechnique.detection_coverage.level), 0.1),
                            color: getCoverageColor(selectedTechnique.detection_coverage.level)
                          }}
                        />
                        <Typography variant="body2">
                          {selectedTechnique.detection_coverage.confidence}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Mitigation Coverage
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          size="small"
                          label={selectedTechnique.mitigation_coverage.level}
                          sx={{
                            bgcolor: alpha(getCoverageColor(selectedTechnique.mitigation_coverage.level), 0.1),
                            color: getCoverageColor(selectedTechnique.mitigation_coverage.level)
                          }}
                        />
                        <Typography variant="body2">
                          {selectedTechnique.mitigation_coverage.effectiveness}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
            <Button
              variant="outlined"
              startIcon={<OpenInNew />}
              onClick={() => window.open(selectedTechnique.url, '_blank')}
            >
              View on MITRE
            </Button>
            <Button variant="contained">
              Create Detection Rule
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="MITRE Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Download />}
          tooltipTitle="Export Matrix"
          onClick={() => {/* Export matrix */}}
        />
        <SpeedDialAction
          icon={<Analytics />}
          tooltipTitle="Coverage Analysis"
          onClick={() => {/* Run coverage analysis */}}
        />
        <SpeedDialAction
          icon={<Share />}
          tooltipTitle="Share Framework"
          onClick={() => {/* Share */}}
        />
        <SpeedDialAction
          icon={<Settings />}
          tooltipTitle="Settings"
          onClick={() => {/* Settings */}}
        />
      </SpeedDial>
    </Box>
  );
};

export default MITREAttackIntegration;
