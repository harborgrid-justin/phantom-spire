// Attribution Operations Panel Component - Attribution Operations and Management Functions

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
  AccountCircle as ActorIcon,
  Fingerprint as TTPIcon,
  Assignment as ProfileIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import {
  profileThreatActor,
  analyzeTTP,
  generateCampaignProfile
} from '../api';

interface Operation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<any>;
}

const AttributionOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations: Operation[] = [
    {
      id: 'profile',
      title: 'Actor Profiling',
      description: 'Generate comprehensive threat actor profile',
      icon: <ActorIcon />,
      action: async () => {
        const result = await profileThreatActor({
          actor_name: 'APT29 (Cozy Bear)',
          profiling_scope: 'comprehensive',
          include_infrastructure: true,
          include_campaigns: true,
          timeframe: '24_months'
        });
        return result.data;
      }
    },
    {
      id: 'ttp',
      title: 'TTP Analysis',
      description: 'Analyze tactics, techniques, and procedures',
      icon: <TTPIcon />,
      action: async () => {
        const result = await analyzeTTP({
          analysis_type: 'MITRE ATT&CK Mapping',
          techniques: ['T1566.001', 'T1059.001', 'T1105'],
          scope: 'enterprise_matrix',
          include_detection_rules: true
        });
        return result.data;
      }
    },
    {
      id: 'campaign',
      title: 'Campaign Profiling',
      description: 'Generate detailed campaign profile and attribution',
      icon: <ProfileIcon />,
      action: async () => {
        const result = await generateCampaignProfile({
          campaign_name: 'Operation Ghost Flame',
          attribution_indicators: ['domain_patterns', 'malware_families', 'infrastructure'],
          analysis_depth: 'comprehensive',
          confidence_threshold: 0.75
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
        <Typography variant="h6" gutterBottom>Attribution Operations</Typography>

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

export default AttributionOperationsPanel;
