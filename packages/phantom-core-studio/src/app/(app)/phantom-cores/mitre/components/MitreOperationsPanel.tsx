// MITRE Operations Panel Component

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
  Assessment as MappingIcon,
  Security as DefenseIcon,
  Build as TechniquesIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import {
  mapTechniques,
  assessCoverage,
  generateMitreReport
} from '../api';

const MitreOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'mapping',
      title: 'Technique Mapping',
      description: 'Map threat activities to MITRE ATT&CK techniques',
      icon: <MappingIcon />,
      action: async () => {
        const result = await mapTechniques({
          mapping_scope: 'enterprise_matrix',
          include_sub_techniques: true,
          correlation_analysis: true,
          threat_actor_attribution: true
        });
        return result.data;
      }
    },
    {
      id: 'coverage',
      title: 'Coverage Assessment',
      description: 'Assess defensive coverage against MITRE framework',
      icon: <DefenseIcon />,
      action: async () => {
        const result = await assessCoverage({
          assessment_scope: 'full_enterprise_matrix',
          include_detection_rules: true,
          include_mitigations: true,
          gap_analysis: true
        });
        return result.data;
      }
    },
    {
      id: 'report',
      title: 'MITRE Report',
      description: 'Generate comprehensive MITRE ATT&CK analysis report',
      icon: <TechniquesIcon />,
      action: async () => {
        const result = await generateMitreReport({
          report_type: 'MITRE ATT&CK Coverage Report',
          include_heat_map: true,
          include_gap_analysis: true,
          include_recommendations: true,
          framework_version: 'v12.1'
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
        <Typography variant="h6" gutterBottom>MITRE Operations</Typography>

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

export default MitreOperationsPanel;
