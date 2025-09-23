// CVE Operations Panel Component - CVE Operations and Management Functions

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
  Security as VulnIcon,
  Update as UpdateIcon,
  Assessment as AssessmentIcon,
  Analytics as CorrelationIcon,
  Stream as StreamIcon,
  Speed as RealtimeIcon,
  Psychology as MLIcon,
  Hub as CrossModuleIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import {
  trackVulnerability,
  updateCVEDatabase,
  generateVulnerabilityReport,
  correlateCVE,
  analyzeRealtimeStream,
  checkRealtimeFeed,
  mlPrioritizeCVEs,
  crossModuleAnalysis
} from '../api';

interface Operation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<any>;
}

const CVEOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations: Operation[] = [
    {
      id: 'track',
      title: 'Vulnerability Tracking',
      description: 'Track and monitor vulnerability lifecycle with real-time updates',
      icon: <VulnIcon />,
      action: async () => {
        const result = await trackVulnerability({
          tracking_scope: 'enterprise_environment',
          vulnerability_sources: ['NVD', 'MITRE', 'vendor_advisories'],
          tracking_criteria: {
            severity_threshold: 'MEDIUM',
            affected_systems: 'all'
          }
        });
        return result.data;
      }
    },
    {
      id: 'update',
      title: 'Real-time Database Update',
      description: 'Update CVE database with streaming real-time feeds',
      icon: <UpdateIcon />,
      action: async () => {
        const result = await updateCVEDatabase({
          update_sources: ['NIST NVD', 'MITRE CVE', 'CISA KEV'],
          update_frequency: 'real_time',
          include_metadata: true,
          verify_signatures: true
        });
        return result.data;
      }
    },
    {
      id: 'report',
      title: 'Enhanced Vulnerability Report',
      description: 'Generate comprehensive report with threat intelligence fusion',
      icon: <AssessmentIcon />,
      action: async () => {
        const result = await generateVulnerabilityReport({
          report_type: 'Enterprise Vulnerability Assessment',
          time_period: '30_days',
          include_trends: true,
          severity_breakdown: true,
          remediation_status: true
        });
        return result.data;
      }
    },
    {
      id: 'correlate',
      title: 'CVE Threat Correlation',
      description: 'Perform AI-powered threat intelligence correlation',
      icon: <CorrelationIcon />,
      action: async () => {
        const result = await correlateCVE({
          cveId: 'CVE-2024-21887',
          includeMLAnalysis: true,
          correlationTypes: ['mitre', 'ioc', 'threat-actor', 'malware']
        });
        return result.data;
      }
    },
    {
      id: 'stream',
      title: 'Real-time Stream Analysis',
      description: 'Analyze CVE processing stream performance and metrics',
      icon: <StreamIcon />,
      action: async () => {
        const result = await analyzeRealtimeStream({
          includeMetrics: true,
          includePerfomance: true,
          analyzeQueue: true
        });
        return result.data;
      }
    },
    {
      id: 'feed',
      title: 'Real-time Feed Status',
      description: 'Monitor live CVE feed connections and data flow',
      icon: <RealtimeIcon />,
      action: async () => {
        const result = await checkRealtimeFeed({
          feedType: 'all',
          severityFilter: ['critical', 'high', 'medium'],
          includeHealth: true
        });
        return result.data;
      }
    },
    {
      id: 'ml-priority',
      title: 'ML-Powered Prioritization',
      description: 'Use machine learning to prioritize CVE remediation',
      icon: <MLIcon />,
      action: async () => {
        const result = await mlPrioritizeCVEs({
          cves: ['CVE-2024-21887', 'CVE-2024-1234', 'CVE-2024-5678'],
          organizationContext: {
            sector: 'Technology',
            riskTolerance: 'Low',
            assetCriticality: 'High'
          },
          includeMLMetrics: true
        });
        return result.data;
      }
    },
    {
      id: 'cross-module',
      title: 'Cross-Module Analysis',
      description: 'Unified threat analysis across all phantom-*-core modules',
      icon: <CrossModuleIcon />,
      action: async () => {
        const result = await crossModuleAnalysis({
          cveId: 'CVE-2024-21887',
          modules: ['mitre', 'ioc', 'threat-actor', 'vulnerability', 'malware'],
          includeCorrelation: true,
          includeML: true
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
        <Typography variant="h6" gutterBottom>CVE Operations</Typography>

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

export default CVEOperationsPanel;
