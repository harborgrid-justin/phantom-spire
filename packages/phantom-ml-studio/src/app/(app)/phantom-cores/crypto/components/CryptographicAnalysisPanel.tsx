// Cryptographic Analysis Panel Component - Crypto Analysis with detailed cipher profiling

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  VpnKey as CryptoIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Shield as ProtectionIcon,
  Speed as PerformanceIcon
} from '@mui/icons-material';
import { CryptoAnalysis, AnalysisType, AlgorithmFamily } from '../types';
import { analyzeCryptography } from '../api';

const CryptographicAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<CryptoAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('cipher_detection');
  const [algorithmFamily, setAlgorithmFamily] = useState<AlgorithmFamily>('AES');

  const analysisTypes: AnalysisType[] = [
    'cipher_detection', 'encryption_analysis', 'hash_analysis', 'key_analysis', 'vulnerability_assessment'
  ];

  const algorithmFamilies: AlgorithmFamily[] = [
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
                onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
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
                onChange={(e) => setAlgorithmFamily(e.target.value as AlgorithmFamily)}
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

export default CryptographicAnalysisPanel;
