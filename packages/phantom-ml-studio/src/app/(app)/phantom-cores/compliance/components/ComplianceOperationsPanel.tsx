// Compliance Operations Panel Component

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
import Grid from '@mui/material/Grid';
import {
  Security as SecurityIcon,
  Assignment as AuditIcon,
  Report as ReportIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import {
  assessCompliance,
  conductAudit,
  generateReport
} from '../api';

const ComplianceOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'assess',
      title: 'Compliance Assessment',
      description: 'Comprehensive compliance status assessment',
      icon: <SecurityIcon />,
      action: async () => {
        const result = await assessCompliance({
          framework_id: 'enterprise-framework',
          assessmentScope: ['data_protection', 'access_control', 'audit_trails'],
          assessmentType: 'comprehensive',
          include_remediation: true,
          priority_level: 'high'
        });
        return result.data;
      }
    },
    {
      id: 'audit',
      title: 'Compliance Audit',
      description: 'Conduct comprehensive compliance audit',
      icon: <AuditIcon />,
      action: async () => {
        const result = await conductAudit({
          audit_type: 'ML Compliance Audit',
          scope: ['model_governance', 'data_privacy', 'algorithmic_fairness'],
          auditStandards: ['ISO 27001', 'GDPR'],
          audit_period: 'Q4_2024',
          include_interviews: true,
          include_documentation_review: true
        });
        return result.data;
      }
    },
    {
      id: 'report',
      title: 'Generate Report',
      description: 'Generate comprehensive compliance report',
      icon: <ReportIcon />,
      action: async () => {
        const result = await generateReport({
          report_type: 'ML Studio Compliance Report',
          frameworks: ['ISO 27001', 'SOC 2', 'GDPR'],
          reportingPeriod: 'Q4 2024',
          includeMetrics: true,
          include_executive_summary: true,
          format: 'pdf'
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
        <Typography variant="h6" gutterBottom>Compliance Operations</Typography>

        <Grid container spacing={2}>
          {operations.map((operation) => (
            <Grid item xs={12} md={4} key={operation.id}>
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
            </Grid>
          ))}
        </Grid>

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

export default ComplianceOperationsPanel;
