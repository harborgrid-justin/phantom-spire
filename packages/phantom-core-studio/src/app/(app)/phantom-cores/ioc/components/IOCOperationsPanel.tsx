// IOC Operations Panel Component

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
  Assessment as AnalysisIcon,
  TrendingUp as TrendIcon,
  Description as FileIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { enrichIOC, correlateIOCs, generateIOCReport } from '../api';

interface Operation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<any>;
}

const IOCOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations: Operation[] = [
    {
      id: 'enrich',
      title: 'IOC Enrichment',
      description: 'Enrich IOCs with threat intelligence data',
      icon: <AnalysisIcon />,
      action: async () => {
        const result = await enrichIOC({
          enrichment_sources: ['VirusTotal', 'ThreatConnect', 'OTX', 'PassiveTotal'],
          enrichment_types: ['reputation', 'geolocation', 'whois', 'passive_dns'],
          include_historical_data: true,
          correlation_analysis: true
        });
        return result.data;
      }
    },
    {
      id: 'correlate',
      title: 'IOC Correlation',
      description: 'Correlate IOCs to identify patterns and campaigns',
      icon: <TrendIcon />,
      action: async () => {
        const result = await correlateIOCs({
          correlation_algorithms: ['temporal', 'network', 'behavioral'],
          time_window: '30_days',
          similarity_threshold: 0.8,
          include_campaign_analysis: true
        });
        return result.data;
      }
    },
    {
      id: 'report',
      title: 'IOC Report',
      description: 'Generate comprehensive IOC analysis report',
      icon: <FileIcon />,
      action: async () => {
        const result = await generateIOCReport({
          report_type: 'IOC Intelligence Report',
          time_period: '7_days',
          include_trending_analysis: true,
          include_attribution: true,
          include_mitigation_strategies: true
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
        <Typography variant="h6" gutterBottom>IOC Operations</Typography>
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

export default IOCOperationsPanel;
