'use client';

import React from 'react';
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
  TrendingUp as TrendIcon,
  AccountBalance as GovernanceIcon,
  Shield as ShieldIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useRiskOperations } from '../hooks';
import type { RiskOperation } from '../types';

export const RiskOperationsPanel: React.FC = () => {
  const {
    activeOperation,
    operationResult,
    loading,
    runTrendAnalysis,
    runMitigationGeneration,
    runGovernanceReview
  } = useRiskOperations();

  const operations: RiskOperation[] = [
    {
      id: 'trends',
      title: 'Risk Trend Analysis',
      description: 'Analyze risk trends and patterns over time',
      icon: <TrendIcon />,
      action: runTrendAnalysis
    },
    {
      id: 'mitigation',
      title: 'Generate Mitigation Plan',
      description: 'Generate comprehensive risk mitigation strategies',
      icon: <ShieldIcon />,
      action: runMitigationGeneration
    },
    {
      id: 'governance',
      title: 'Governance Review',
      description: 'Review risk governance and compliance frameworks',
      icon: <GovernanceIcon />,
      action: runGovernanceReview
    }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Risk Operations</Typography>

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
                    onClick={operation.action}
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
