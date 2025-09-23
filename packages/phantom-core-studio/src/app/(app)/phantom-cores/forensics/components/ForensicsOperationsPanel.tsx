// Forensics Operations Panel Component

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
  Timeline as TimelineIcon,
  Fingerprint as ArtifactIcon,
  Storage as EvidenceIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import {
  reconstructTimeline,
  extractArtifacts,
  generateForensicsReport
} from '../api';

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
      setOperationResult({ error: `${operation.title} failed: ${error}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Forensics Operations</Typography>

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

export default ForensicsOperationsPanel;
