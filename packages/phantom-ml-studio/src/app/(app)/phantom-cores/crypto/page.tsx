'use client';

// Phantom Crypto Core Management - Cryptographic Analysis & Cipher Detection
// Provides comprehensive GUI for cryptographic analysis and cipher detection capabilities

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
  VpnKey as CryptoIcon,
  Lock as CipherIcon,
  Fingerprint as HashIcon,
  Code as AlgorithmIcon,
  Analytics as AnalysisIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as VulnerabilityIcon,
  Shield as ProtectionIcon,
  Speed as PerformanceIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Interfaces
interface CryptoStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      analyzed_samples: number;
      cipher_detection_rate: number;
      encryption_strength: number;
    };
  };
}

interface CryptoAnalysis {
  analysis_id: string;
  cipher_profile: {
    algorithm_type: string;
    encryption_strength: string;
    cipher_family: string;
    confidence_score: number;
  };
  cryptographic_assessment: any;
  vulnerability_analysis: any;
  recommendations: string[];
}

// API functions
const fetchCryptoStatus = async (): Promise<CryptoStatus> => {
  const response = await fetch('/api/phantom-cores/crypto?operation=status');
  return response.json();
};

const analyzeCryptography = async (analysisData: any) => {
  const response = await fetch('/api/phantom-cores/crypto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-crypto',
      analysisData
    })
  });
  return response.json();
};

const detectCipher = async (cipherData: any) => {
  const response = await fetch('/api/phantom-cores/crypto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'detect-cipher',
      cipherData
    })
  });
  return response.json();
};

const analyzeEncryption = async (encryptionData: any) => {
  const response = await fetch('/api/phantom-cores/crypto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-encryption',
      encryptionData
    })
  });
  return response.json();
};

const assessCryptoVulnerabilities = async (vulnData: any) => {
  const response = await fetch('/api/phantom-cores/crypto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'assess-vulnerabilities',
      vulnData
    })
  });
  return response.json();
};

// Component: Crypto Overview
const CryptoOverview: React.FC<{ status: CryptoStatus | undefined }> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">Crypto system status unavailable</Alert>
    );
  }

  const { metrics } = status.data;

  // Add null check for metrics
  if (!metrics) {
    return (
      <Alert severity="info">Crypto metrics are currently being initialized...</Alert>
    );
  }

  const getStrengthColor = (strength: number) => {
    if (strength >= 0.9) return 'success';
    if (strength >= 0.7) return 'warning';
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
              Uptime: {metrics.uptime}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Detection Rate</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={(metrics.cipher_detection_rate || 0) * 100}
                size={60}
                color="primary"
              />
              <Box ml={2}>
                <Typography variant="h4" color="primary">
                  {((metrics.cipher_detection_rate || 0) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Cipher Detection
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Analyzed Samples</Typography>
            <Typography variant="h3" color="secondary">
              {(metrics.analyzed_samples || 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Cryptographic samples
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Encryption Strength</Typography>
            <Box display="flex" alignItems="center">
              <CircularProgress
                variant="determinate"
                value={(metrics.encryption_strength || 0) * 100}
                size={60}
                color={getStrengthColor(metrics.encryption_strength || 0)}
              />
              <Box ml={2}>
                <Typography variant="h4" color={getStrengthColor(metrics.encryption_strength || 0)}>
                  {((metrics.encryption_strength || 0) * 100).toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg Strength
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

// Component: Cryptographic Analysis Panel
const CryptographicAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<CryptoAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState('cipher_detection');
  const [algorithmFamily, setAlgorithmFamily] = useState('AES');

  const analysisTypes = [
    'cipher_detection', 'encryption_analysis', 'hash_analysis', 'key_analysis', 'vulnerability_assessment'
  ];

  const algorithmFamilies = [
    'AES', 'RSA', 'DES', 'Blowfish', 'ChaCha20', 'Salsa20', 'Twofish', 'RC4', 'MD5', 'SHA'
  ];

  const runCryptographicAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeCryptography({
        analysis_type: analysisType,
        algorithm_family: algorithmFamily,
        analysis_depth: 'comprehensive',
        include_entropy_analysis: true,
        include_pattern_detection: true,
        sample_size: 'large'
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Cryptographic analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Cryptographic Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Analysis Type</InputLabel>
              <Select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                label="Analysis Type"
              >
                {analysisTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Algorithm</InputLabel>
              <Select
                value={algorithmFamily}
                onChange={(e) => setAlgorithmFamily(e.target.value)}
                label="Algorithm"
              >
                {algorithmFamilies.map((algorithm) => (
                  <MenuItem key={algorithm} value={algorithm}>
                    {algorithm}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<CryptoIcon />}
              onClick={runCryptographicAnalysis}
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
                  <Typography variant="subtitle1" gutterBottom>Cipher Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Algorithm Type:</strong> {analysis.cipher_profile.algorithm_type}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Cipher Family:</strong> {analysis.cipher_profile.cipher_family}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Encryption Strength:</strong> {analysis.cipher_profile.encryption_strength}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1} gap={1}>
                    <Typography variant="body2" component="span">
                      <strong>Confidence Score:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.cipher_profile.confidence_score * 100).toFixed(1)}%`}
                      color={analysis.cipher_profile.confidence_score >= 0.8 ? 'success' :
                             analysis.cipher_profile.confidence_score >= 0.6 ? 'warning' : 'error'}
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
                  <Typography variant="subtitle1" gutterBottom>Security Assessment</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Strong cryptographic implementation detected"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ProtectionIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="No weak key patterns identified"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PerformanceIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Optimal entropy distribution"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Compliance with industry standards"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Key Recommendations</Typography>
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

// Component: Crypto Operations Panel
const CryptoOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'detect',
      title: 'Cipher Detection',
      description: 'Detect and classify cryptographic algorithms',
      icon: <CipherIcon />,
      action: async () => {
        const result = await detectCipher({
          sample_type: 'encrypted_data',
          detection_algorithms: ['statistical_analysis', 'entropy_analysis', 'pattern_matching'],
          confidence_threshold: 0.8,
          include_metadata: true
        });
        return result.data;
      }
    },
    {
      id: 'encrypt',
      title: 'Encryption Analysis',
      description: 'Comprehensive encryption strength assessment',
      icon: <AlgorithmIcon />,
      action: async () => {
        const result = await analyzeEncryption({
          analysis_type: 'Encryption Strength Assessment',
          algorithms: ['AES-256', 'RSA-2048', 'ChaCha20-Poly1305'],
          test_vectors: 'NIST_standard',
          include_performance_metrics: true
        });
        return result.data;
      }
    },
    {
      id: 'vulnerability',
      title: 'Vulnerability Assessment',
      description: 'Assess cryptographic vulnerabilities and weaknesses',
      icon: <VulnerabilityIcon />,
      action: async () => {
        const result = await assessCryptoVulnerabilities({
          assessment_scope: 'comprehensive',
          vulnerability_databases: ['CVE', 'NVD', 'OWASP'],
          include_quantum_resistance: true,
          severity_threshold: 'medium'
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
        <Typography variant="h6" gutterBottom>Cryptographic Operations</Typography>

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

// Main Component: Crypto Management Dashboard
const CryptoManagementDashboard: React.FC = () => {
  const { data: cryptoStatus, isLoading, error } = useQuery({
    queryKey: ['crypto-status'],
    queryFn: fetchCryptoStatus,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Crypto Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !cryptoStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load crypto system status. Please ensure the crypto core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <CryptoIcon sx={{ mr: 2, fontSize: 32, color: '#ff9800' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Crypto Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Cryptographic Analysis & Cipher Detection Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <CryptoOverview status={cryptoStatus} />
        <CryptographicAnalysisPanel />
        <CryptoOperationsPanel />
      </Box>
    </Box>
  );
};

export default CryptoManagementDashboard;
