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
  Fingerprint as AttributionIcon,
  Analytics as AnalyticsIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { trackCampaign, analyzeAttribution, generateThreatIntelligence } from '../api';
import { Operation } from '../types';

export const ThreatActorOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations: Operation[] = [
    {
      id: 'campaign',
      title: 'Campaign Tracking',
      description: 'Track and analyze ongoing threat actor campaigns',
      icon: <TimelineIcon />,
      action: async () => {
        const result = await trackCampaign({
          campaign_name: 'Enterprise Target Campaign',
          actor_indicators: ['phishing_emails', 'c2_infrastructure', 'malware_signatures'],
          tracking_scope: 'global',
          analysis_period: '90_days'
        });
        return result.data;
      }
    },
    {
      id: 'attribution',
      title: 'Attribution Analysis',
      description: 'Perform comprehensive attribution analysis',
      icon: <AttributionIcon />,
      action: async () => {
        const result = await analyzeAttribution({
          incident_data: {
            attack_patterns: ['spear_phishing', 'lateral_movement', 'data_exfiltration'],
            infrastructure_iocs: ['domain_names', 'ip_addresses', 'ssl_certificates'],
            malware_families: ['custom_backdoor', 'credential_harvester']
          },
          attribution_confidence_threshold: 0.7
        });
        return result.data;
      }
    },
    {
      id: 'intelligence',
      title: 'Threat Intelligence',
      description: 'Generate comprehensive threat intelligence report',
      icon: <AnalyticsIcon />,
      action: async () => {
        const result = await generateThreatIntelligence({
          intelligence_type: 'threat_actor_landscape',
          scope: 'enterprise_threats',
          time_range: '12_months'
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Threat Actor Operations</Typography>

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
