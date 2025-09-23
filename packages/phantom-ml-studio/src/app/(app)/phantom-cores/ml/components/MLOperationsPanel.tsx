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
  Assessment as ModelIcon,
  BugReport as AnomalyIcon,
  Analytics as AnalyticsIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useMLOperations } from '../hooks';
import type { MLOperation } from '../types';

export const MLOperationsPanel: React.FC = () => {
  const {
    activeOperation,
    operationResult,
    loading,
    runModelTraining,
    runAnomalyDetection,
    runMLReportGeneration
  } = useMLOperations();

  const operations: MLOperation[] = [
    {
      id: 'train',
      title: 'Model Training',
      description: 'Train ML models with latest security data',
      icon: <ModelIcon />,
      action: runModelTraining
    },
    {
      id: 'anomaly',
      title: 'Anomaly Detection',
      description: 'Detect security anomalies using ML algorithms',
      icon: <AnomalyIcon />,
      action: runAnomalyDetection
    },
    {
      id: 'report',
      title: 'ML Report',
      description: 'Generate comprehensive ML analytics report',
      icon: <AnalyticsIcon />,
      action: runMLReportGeneration
    }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>ML Operations</Typography>

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
