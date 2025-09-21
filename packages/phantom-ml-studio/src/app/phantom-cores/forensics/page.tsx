'use client';

// Phantom Forensics Core Management - Digital Forensics & Evidence Analysis
// Provides comprehensive GUI for digital forensics and evidence analysis capabilities

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
  Biotech as ForensicsIcon,
  Storage as EvidenceIcon,
  Timeline as TimelineIcon,
  Fingerprint as ArtifactIcon,
  Analytics as AnalysisIcon,
  Folder as FileIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Memory as MemoryIcon,
  Search as SearchIcon
} from '@mui/material-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces
interface ForensicsStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      active_cases: number;
      evidence_items: number;
      analysis_completion: number;
      storage_used_gb: number;
    };
  };
}

interface ForensicsAnalysis {
  analysis_id: string;
  case_profile: {
    case_id: string;
    evidence_type: string;
    analysis_method: string;
    confidence_level: number;
  };
  forensic_findings: any;
  timeline_reconstruction: any;
  recommendations: string[];
}

// API functions
const fetchForensicsStatus = async (): Promise<ForensicsStatus> => {
  const response = await fetch('/api/phantom-cores/forensics?operation=status');
  return response.json();
};

const analyzeEvidence = async (analysisData: any) => {
  const response = await fetch('/api/phantom-cores/forensics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-evidence',
      analysisData
    })
  });
  return response.json();
};

const reconstructTimeline = async (timelineData: any) => {
  const response = await fetch('/api/phantom-cores/forensics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'reconstruct-timeline',
      timelineData
    })
  });
  return response.json();
};

const extractArtifacts = async (artifactData: any) => {
  const response = await fetch('/api/phantom-cores/forensics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'extract-artifacts',
      artifactData
    })
  });
  return response.json();
};

const generateForensicsReport = async (reportData: any) => {
  const response = await fetch('/api/phantom-cores/forensics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'generate-report',
      reportData
    })
  });
  return response.json();
};

// Component: Forensics Overview
const ForensicsOverview: React.FC<{ status: ForensicsStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Forensics system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  const getCompletionColor = (completion: number) => {
    if (completion >= 0.8) return 'success';
    if (completion >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>System Status</Typography>
            <Chip
              icon={status.data.status === 'operational' ? <CheckCircleIcon /> : <WarningIcon />}
              label={status.data.status}
              color={status.data.status === 'operational' ? 'success' : 'warning'}
            />
            <Typography variant="body2" color="textSecondary" mt={1}>
              Uptime: {metrics.uptime}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active Cases</Typography>
            <Typography variant="h3" color="primary">
              {metrics.active_cases}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Forensic investigations
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Evidence Items</Typography>
            <Typography variant="h3" color="secondary">
              {metrics.evidence_items.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Digital artifacts
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Analysis Progress</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={metrics.analysis_completion * 100}
                size={60}
                color={getCompletionColor(metrics.analysis_completion)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getCompletionColor(metrics.analysis_completion)}>
                  {(metrics.analysis_completion * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Completion Rate
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Component: Forensics Analysis Panel
const ForensicsAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<ForensicsAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [evidenceType, setEvidenceType] = useState('disk_image');
  const [analysisMethod, setAnalysisMethod] = useState('comprehensive');

  const evidenceTypes = [
    'disk_image', 'memory_dump', 'network_capture', 'mobile_device', 'log_files',
    'registry_hives', 'file_system', 'database_files'
  ];

  const analysisMethods = [
    'comprehensive', 'timeline_focused', 'artifact_extraction', 'signature_analysis',
    'hash_verification', 'metadata_analysis'
  ];

  const runForensicsAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeEvidence({
        evidence_type: evidenceType,
        analysis_method: analysisMethod,
        case_priority: 'high',
        preserve_chain_of_custody: true,
        include_deleted_files: true,
        deep_analysis: true
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Forensics analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Forensics Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Evidence Type</InputLabel>
              <Select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
                label="Evidence Type"
              >
                {evidenceTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Analysis Method</InputLabel>
              <Select
                value={analysisMethod}
                onChange={(e) => setAnalysisMethod(e.target.value)}
                label="Analysis Method"
              >
                {analysisMethods.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<ForensicsIcon />}
              onClick={runForensicsAnalysis}
              disabled={loading}
            >
              Analyze
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {analysis && (
          <Box>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Case Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Case ID:</strong> {analysis.case_profile.case_id}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Evidence Type:</strong> {analysis.case_profile.evidence_type}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Analysis Method:</strong> {analysis.case_profile.analysis_method}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" mr={1}>
                      <strong>Confidence Level:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.case_profile.confidence_level * 100).toFixed(1)}%`}
                      color={analysis.case_profile.confidence_level >= 0.8 ? 'success' :
                             analysis.case_profile.confidence_level >= 0.6 ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2">
                    <strong>Analysis ID:</strong> {analysis.analysis_id}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Key Findings</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <ArtifactIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Suspicious executable artifacts discovered"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimelineIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Timeline reconstruction shows data exfiltration"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <FileIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Deleted files recovered and analyzed"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <MemoryIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Memory artifacts indicate persistence mechanisms"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Forensic Recommendations</Typography>
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

// Component: Forensics Operations Panel
const ForensicsOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'timeline',
      title: 'Timeline Reconstruction',
      description: 'Reconstruct forensic timeline from evidence',
      icon: <TimelineIcon />,
      action: async () => {
        const result = await reconstructTimeline({
          time_range: '7_days',
          evidence_sources: ['file_system', 'registry', 'logs', 'network'],
          correlation_algorithms: ['temporal', 'behavioral', 'causal'],
          include_deleted_items: true
        });
        return result.data;
      }
    },
    {
      id: 'artifacts',
      title: 'Artifact Extraction',
      description: 'Extract and analyze digital artifacts',
      icon: <ArtifactIcon />,
      action: async () => {
        const result = await extractArtifacts({
          extraction_scope: 'comprehensive',
          artifact_types: ['executables', 'documents', 'images', 'network_traces'],
          preserve_metadata: true,
          hash_verification: true
        });
        return result.data;
      }
    },
    {
      id: 'report',
      title: 'Generate Report',
      description: 'Generate comprehensive forensic investigation report',
      icon: <EvidenceIcon />,
      action: async () => {
        const result = await generateForensicsReport({
          report_type: 'Digital Forensics Investigation Report',
          include_timeline: true,
          include_artifacts: true,
          include_chain_of_custody: true,
          format: 'comprehensive'
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
        <Typography variant="h6" gutterBottom>Forensics Operations</Typography>

        <Grid container spacing={2}>
          {operations.map((operation) => (
            <Grid item xs={12} md={4} key={operation.id}>
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
            </Grid>
          ))}
        </Grid>

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

// Main Component: Forensics Management Dashboard
const ForensicsManagementDashboard: React.FC = () => {
  const { data: forensicsStatus, isLoading, error } = useQuery({
    queryKey: ['forensics-status'],
    queryFn: fetchForensicsStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Forensics Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !forensicsStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load forensics system status. Please ensure the forensics core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <ForensicsIcon sx={{ mr: 2, fontSize: 32, color: '#795548' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Forensics Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Digital Forensics & Evidence Analysis Platform
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ForensicsOverview status={forensicsStatus} />
        </Grid>

        <Grid item xs={12}>
          <ForensicsAnalysisPanel />
        </Grid>

        <Grid item xs={12}>
          <ForensicsOperationsPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ForensicsManagementDashboard;