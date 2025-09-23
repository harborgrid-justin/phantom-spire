// Crypto Operations Panel Component - Crypto Operations and Management Functions

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Lock as CipherIcon,
  Code as AlgorithmIcon,
  BugReport as VulnerabilityIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import {
  detectCipher,
  analyzeEncryption,
  assessCryptoVulnerabilities
} from '../api';

interface Operation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<any>;
}

const CryptoOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations: Operation[] = [
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

  const runOperation = async (operation: Operation) => {
    setLoading(true);
    setActiveOperation(operation.id);
    try {
      const result = await operation.action();
      setOperationResult(result);
    } catch (error) {
      console.error(`${operation.title} failed:`, error);
      setOperationResult({ error: `${operation.title} failed: ${error}` });
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

export default CryptoOperationsPanel;
