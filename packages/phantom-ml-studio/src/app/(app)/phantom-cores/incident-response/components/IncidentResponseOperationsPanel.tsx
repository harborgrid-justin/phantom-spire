// Incident Response Operations Panel Component

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
  Support as ResponseIcon,
  Group as TeamIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import {
  initiateResponse,
  coordinateTeam,
  generateIncidentReport
} from '../api';

const IncidentResponseOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'response',
      title: 'Initiate Response',
      description: 'Activate incident response protocols and procedures',
      icon: <ResponseIcon />,
      action: async () => {
        const result = await initiateResponse({
          response_level: 'full_activation',
          team_assembly: 'immediate',
          communication_plan: 'crisis_protocol',
          escalation_matrix: 'executive_level'
        });
        return result.data;
      }
    },
    {
      id: 'coordinate',
      title: 'Team Coordination',
      description: 'Coordinate response teams and resource allocation',
      icon: <TeamIcon />,
      action: async () => {
        const result = await coordinateTeam({
          teams: ['technical_response', 'communications', 'legal', 'management'],
          coordination_mode: 'unified_command',
          resource_allocation: 'priority_based',
          status_reporting: 'real_time'
        });
        return result.data;
      }
    },
    {
      id: 'report',
      title: 'Incident Report',
      description: 'Generate comprehensive incident response report',
      icon: <AssessmentIcon />,
      action: async () => {
        const result = await generateIncidentReport({
          report_type: 'Post-Incident Analysis Report',
          include_timeline: true,
          include_lessons_learned: true,
          include_recommendations: true,
          compliance_requirements: ['SOX', 'GDPR']
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
        <Typography variant="h6" gutterBottom>Incident Response Operations</Typography>
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

export default IncidentResponseOperationsPanel;
