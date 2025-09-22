'use client';

// Phantom MITRE Core Management - MITRE ATT&CK Framework Integration
// Provides comprehensive GUI for MITRE ATT&CK framework integration and TTP analysis

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  AccountTree as MitreIcon,
  Psychology as TacticsIcon,
  Build as TechniquesIcon,
  Speed as ProceduresIcon,
  Assessment as MappingIcon,
  Security as DefenseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces
interface MitreStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      techniques_mapped: number;
      coverage_percentage: number;
      detection_rules: number;
      framework_version: string;
    };
  };
}

interface MitreAnalysis {
  analysis_id: string;
  ttp_profile: {
    technique_id: string;
    technique_name: string;
    tactic: string;
    coverage_score: number;
  };
  mapping_results: any;
  detection_coverage: any;
  recommendations: string[];
}

// API functions
const fetchMitreStatus = async (): Promise<MitreStatus> => {
  const response = await fetch('/api/phantom-cores/mitre?operation=status');
  return response.json();
};

const analyzeTTP = async (ttpData: any) => {
  const response = await fetch('/api/phantom-cores/mitre', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-ttp',
      ttpData
    })
  });
  return response.json();
};

const mapTechniques = async (mappingData: any) => {
  const response = await fetch('/api/phantom-cores/mitre', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'map-techniques',
      mappingData
    })
  });
  return response.json();
};

const assessCoverage = async (coverageData: any) => {
  const response = await fetch('/api/phantom-cores/mitre', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'assess-coverage',
      coverageData
    })
  });
  return response.json();
};

const generateMitreReport = async (reportData: any) => {
  const response = await fetch('/api/phantom-cores/mitre', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'generate-mitre-report',
      reportData
    })
  });
  return response.json();
};

// Component: MITRE Overview
const MitreOverview: React.FC<{ status: MitreStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">MITRE system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  // Add null check for metrics
  if (!metrics) {
    return (
      <Alert severity="info">MITRE metrics are currently being initialized...</Alert>
    );
  }

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 0.8) return 'success';
    if (coverage >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>System Status</Typography>
            <Chip
              icon={status.data.status === 'operational' ? <CheckCircleIcon /> : <WarningIcon />}
              label={status.data.status}
              color={status.data.status === 'operational' ? 'success' : 'warning'}
            />
            <Typography variant="body2" color="textSecondary" mt={1}>
              Framework: {metrics.framework_version}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Techniques Mapped</Typography>
            <Typography variant="h3" color="primary">
              {metrics.techniques_mapped}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              ATT&CK techniques
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Coverage</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.coverage_percentage * 100}
                size={60}
                color={getCoverageColor(metrics.coverage_percentage)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getCoverageColor(metrics.coverage_percentage)}>
                  {(metrics.coverage_percentage * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Framework Coverage
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Detection Rules</Typography>
            <Typography variant="h3" color="secondary">
              {metrics.detection_rules}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Active detection rules
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

// Component: MITRE Analysis Panel
const MitreAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<MitreAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [techniqueId, setTechniqueId] = useState('T1566.001');
  const [tactic, setTactic] = useState('Initial Access');

  const tactics = [
    'Reconnaissance', 'Resource Development', 'Initial Access', 'Execution',
    'Persistence', 'Privilege Escalation', 'Defense Evasion', 'Credential Access',
    'Discovery', 'Lateral Movement', 'Collection', 'Command and Control',
    'Exfiltration', 'Impact'
  ];

  const runMitreAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeTTP({
        technique_id: techniqueId,
        tactic: tactic,
        analysis_scope: 'comprehensive',
        include_detection_rules: true,
        include_mitigations: true,
        assess_coverage: true
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('MITRE analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">MITRE ATT&CK Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              size="small"
              label="Technique ID"
              value={techniqueId}
              onChange={(e) => setTechniqueId(e.target.value)}
              sx={{ minWidth: 150 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Tactic</InputLabel>
              <Select
                value={tactic}
                onChange={(e) => setTactic(e.target.value)}
                label="Tactic"
              >
                {tactics.map((tacticItem) => (
                  <MenuItem key={tacticItem} value={tacticItem}>
                    {tacticItem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<MitreIcon />}
              onClick={runMitreAnalysis}
              disabled={loading}
            >
              Analyze
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {analysis && (
          <Box>
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>TTP Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Technique ID:</strong> {analysis.ttp_profile.technique_id}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Technique Name:</strong> {analysis.ttp_profile.technique_name}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Tactic:</strong> {analysis.ttp_profile.tactic}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" mr={1}>
                      <strong>Coverage Score:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.ttp_profile.coverage_score * 100).toFixed(1)}%`}
                      color={analysis.ttp_profile.coverage_score >= 0.8 ? 'success' :
                             analysis.ttp_profile.coverage_score >= 0.6 ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2">
                    <strong>Analysis ID:</strong> {analysis.analysis_id}
                  </Typography>
                </Paper>
              </Box>

              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Detection & Mitigation</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <DefenseIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Active detection rules deployed"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ShieldIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Mitigation strategies implemented"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimelineIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Historical attack patterns analyzed"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Trending in current threat landscape"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>MITRE Recommendations</Typography>
              <List dense>
                {analysis.recommendations?.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={recommendation}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Component: MITRE Operations Panel
const MitreOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'mapping',
      title: 'Technique Mapping',
      description: 'Map threat activities to MITRE ATT&CK techniques',
      icon: <MappingIcon />,
      action: async () => {
        const result = await mapTechniques({
          mapping_scope: 'enterprise_matrix',
          include_sub_techniques: true,
          correlation_analysis: true,
          threat_actor_attribution: true
        });
        return result.data;
      }
    },
    {
      id: 'coverage',
      title: 'Coverage Assessment',
      description: 'Assess defensive coverage against MITRE framework',
      icon: <DefenseIcon />,
      action: async () => {
        const result = await assessCoverage({
          assessment_scope: 'full_enterprise_matrix',
          include_detection_rules: true,
          include_mitigations: true,
          gap_analysis: true
        });
        return result.data;
      }
    },
    {
      id: 'report',
      title: 'MITRE Report',
      description: 'Generate comprehensive MITRE ATT&CK analysis report',
      icon: <TechniquesIcon />,
      action: async () => {
        const result = await generateMitreReport({
          report_type: 'MITRE ATT&CK Coverage Report',
          include_heat_map: true,
          include_gap_analysis: true,
          include_recommendations: true,
          framework_version: 'v12.1'
        });
        return result.data;
      }
    }
  ];

  const runOperation = async (operation: any) => {
    setLoading(true);
    setActiveOperation(operation.id);
    try {
      const result = await operation.action();
      setOperationResult(result);
    } catch (error) {
      console.error(`${operation.title} failed:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>MITRE Operations</Typography>

        <Box display="flex" flexWrap="wrap" gap={2}>
          {operations.map((operation) => (
            <Box flex="1 1 300px" minWidth="300px" key={operation.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    {operation.icon}
                    <Typography variant="subtitle1" sx={{ ml: 1 }}>
                      {operation.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    {operation.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => runOperation(operation)}
                    disabled={loading && activeOperation === operation.id}
                  >
                    {loading && activeOperation === operation.id ? 'Running...' : 'Execute'}
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {loading && (
          <Box mt={2}>
            <LinearProgress />
            <Typography variant="body2" color="textSecondary" mt={1}>
              Executing {operations.find(op => op.id === activeOperation)?.title}...
            </Typography>
          </Box>
        )}

        {operationResult && (
          <Box mt={2}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Operation Results</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '400px' }}>
                  {JSON.stringify(operationResult, null, 2)}
                </pre>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Main Component: MITRE Management Dashboard
const MitreManagementDashboard: React.FC = () => {
  const { data: mitreStatus, isLoading, error } = useQuery({
    queryKey: ['mitre-status'],
    queryFn: fetchMitreStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading MITRE Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !mitreStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load MITRE system status. Please ensure the MITRE core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <MitreIcon sx={{ mr: 2, fontSize: 32, color: '#607d8b' }} />
        <Box>
          <Typography variant="h4" component="h1">
            MITRE Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            MITRE ATT&CK Framework Integration & TTP Analysis Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <MitreOverview status={mitreStatus} />
        <MitreAnalysisPanel />
        <MitreOperationsPanel />
      </Box>
    </Box>
  );
};

export default MitreManagementDashboard;
