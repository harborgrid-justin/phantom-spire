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
  Search as InvestigateIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { investigateIncident, conductThreatHunt } from '../api';
import { XDROperation } from '../types';

export const XDROperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations: XDROperation[] = [
    {
      id: 'investigate',
      title: 'Incident Investigation',
      description: 'Comprehensive forensic analysis and incident investigation',
      icon: <InvestigateIcon />,
      action: async () => {
        const result = await investigateIncident({
          incident_type: 'security_alert',
          investigation_scope: {
            timeline: '72_hours',
            forensic_depth: 'comprehensive'
          }
        });
        return result.data;
      }
    },
    {
      id: 'hunt',
      title: 'Threat Hunting',
      description: 'Proactive threat hunting across enterprise environment',
      icon: <SearchIcon />,
      action: async () => {
        const result = await conductThreatHunt({
          hunt_name: 'Enterprise Security Hunt',
          hunt_scope: 'enterprise_environment',
          hypotheses: [
            {
              hypothesis: 'APT group using living-off-the-land techniques',
              techniques: ['T1059.001', 'T1070.004', 'T1218.011']
            }
          ]
        });
        return result.data;
      }
    }
  ];

  const runOperation = async (operation: XDROperation) => {
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
        <Typography variant="h6" gutterBottom>XDR Operations</Typography>

        <Box display="flex" flexWrap="wrap" gap={2}>
          {operations.map((operation) => (
            <Box flex="1 1 400px" minWidth="400px" key={operation.id}>
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
                <pre style={{ fontSize: '12px', overflow: 'auto' }}>
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
