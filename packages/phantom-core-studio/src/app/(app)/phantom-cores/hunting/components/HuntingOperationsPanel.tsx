'use client';

// Hunting Operations Panel - Manages hunting operations and displays results
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
  Psychology as HypothesisIcon,
  GpsFixed as TargetIcon,
  Analytics as AnalyticsIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { analyzeHypothesis, trackIOCs, generateHuntReport } from '../api';
import type { HuntingOperation } from '../types';

export const HuntingOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations: HuntingOperation[] = [
    {
      id: 'hypothesis',
      title: 'Hypothesis Analysis',
      description: 'Analyze and validate threat hunting hypotheses',
      icon: <HypothesisIcon />,
      action: async () => {
        const result = await analyzeHypothesis({
          hypothesis: 'Insider threat using privileged access for data theft',
          evidence_sources: ['user_behavior', 'data_access_logs', 'network_traffic'],
          analysis_depth: 'comprehensive',
          confidence_threshold: 0.75
        });
        return result.data;
      }
    },
    {
      id: 'ioc_tracking',
      title: 'IOC Tracking',
      description: 'Track and correlate indicators of compromise',
      icon: <TargetIcon />,
      action: async () => {
        const result = await trackIOCs({
          ioc_types: ['file_hashes', 'ip_addresses', 'domains', 'registry_keys'],
          tracking_scope: 'enterprise_environment',
          correlation_analysis: true,
          threat_intelligence_enrichment: true
        });
        return result.data;
      }
    },
    {
      id: 'hunt_report',
      title: 'Hunt Report',
      description: 'Generate comprehensive threat hunting report',
      icon: <AnalyticsIcon />,
      action: async () => {
        const result = await generateHuntReport({
          report_type: 'Threat Hunting Campaign Report',
          time_period: '30_days',
          include_timeline: true,
          include_ioc_analysis: true,
          include_recommendations: true
        });
        return result.data;
      }
    }
  ];

  const runOperation = async (operation: HuntingOperation) => {
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
        <Typography variant="h6" gutterBottom>Hunting Operations</Typography>

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
