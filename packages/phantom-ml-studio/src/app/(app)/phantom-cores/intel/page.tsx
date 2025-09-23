'use client';

// Phantom Intel Core Management - Intelligence Gathering & Analysis
// Provides comprehensive GUI for intelligence gathering and analysis operations

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Psychology as IntelIcon,
  Public as OSINTIcon,
  Verified as VerifiedIcon,
  Assessment as ReportIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  TrendingUp as TrendIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

// Import modular components and hooks
import IntelOverview from './components/IntelOverview';
import { useIntelStatus } from './hooks/useIntelStatus';
import { CollectionMethod, TargetDomain, IntelAnalysis } from './types';
import {
  analyzeIntelligence,
  gatherIntelligence,
  validateSources,
  generateIntelReport
} from './api';

// Intelligence Analysis Panel Component
const IntelligenceAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<IntelAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [collectionMethod, setCollectionMethod] = useState<CollectionMethod>('OSINT');
  const [targetDomain, setTargetDomain] = useState<TargetDomain>('cyber_threats');

  const collectionMethods: CollectionMethod[] = ['OSINT', 'SIGINT', 'HUMINT', 'GEOINT', 'MASINT', 'TECHINT'];
  const targetDomains: TargetDomain[] = [
    'cyber_threats', 'nation_state_actors', 'criminal_organizations',
    'terrorist_groups', 'insider_threats', 'supply_chain_risks'
  ];

  const runIntelligenceAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeIntelligence({
        collection_method: collectionMethod,
        target_domain: targetDomain,
        analysis_scope: 'comprehensive',
        confidence_threshold: 0.75,
        correlation_analysis: true,
        threat_modeling: true
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Intelligence analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Intelligence Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Collection Method</InputLabel>
              <Select
                value={collectionMethod}
                onChange={(e) => setCollectionMethod(e.target.value as CollectionMethod)}
                label="Collection Method"
              >
                {collectionMethods.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Target Domain</InputLabel>
              <Select
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value as TargetDomain)}
                label="Target Domain"
              >
                {targetDomains.map((domain) => (
                  <MenuItem key={domain} value={domain}>
                    {domain.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<IntelIcon />}
              onClick={runIntelligenceAnalysis}
              disabled={loading}
            >
              Analyze
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {analysis && (
          <Box>
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Intelligence Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Operation:</strong> {analysis.intelligence_profile.operation_name}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Collection Method:</strong> {analysis.intelligence_profile.collection_method}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Threat Assessment:</strong> {analysis.intelligence_profile.threat_assessment}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" mr={1}>
                      <strong>Confidence Level:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.intelligence_profile.confidence_level * 100).toFixed(1)}%`}
                      color={analysis.intelligence_profile.confidence_level >= 0.8 ? 'success' :
                             analysis.intelligence_profile.confidence_level >= 0.6 ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2">
                    <strong>Analysis ID:</strong> {analysis.analysis_id}
                  </Typography>
                </Paper>
              </Box>

              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Key Intelligence</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Advanced persistent threat campaign identified"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <VerifiedIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="High-confidence attribution to known actor"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Increasing activity in target sector"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <OSINTIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Multiple OSINT sources corroborate findings"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Intelligence Recommendations</Typography>
              <List dense>
                {analysis.recommendations?.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={recommendation}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Intel Operations Panel Component
const IntelOperationsPanel: React.FC = () => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationResult, setOperationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const operations = [
    {
      id: 'gather',
      title: 'Intelligence Gathering',
      description: 'Collect intelligence from multiple sources',
      icon: <OSINTIcon />,
      action: async () => {
        const result = await gatherIntelligence({
          collection_sources: ['social_media', 'dark_web', 'technical_indicators', 'public_records'],
          collection_scope: 'targeted_campaign',
          automated_collection: true,
          source_validation: true
        });
        return result.data;
      }
    },
    {
      id: 'validate',
      title: 'Source Validation',
      description: 'Validate and assess intelligence source reliability',
      icon: <VerifiedIcon />,
      action: async () => {
        const result = await validateSources({
          validation_criteria: ['source_reliability', 'information_accuracy', 'timeliness'],
          cross_reference_analysis: true,
          confidence_scoring: true,
          bias_assessment: true
        });
        return result.data;
      }
    },
    {
      id: 'report',
      title: 'Intelligence Report',
      description: 'Generate comprehensive intelligence assessment report',
      icon: <ReportIcon />,
      action: async () => {
        const result = await generateIntelReport({
          report_type: 'Strategic Intelligence Assessment',
          classification_level: 'confidential',
          include_analysis: true,
          include_recommendations: true,
          distribution_list: ['security_team', 'executive_leadership']
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
        <Typography variant="h6" gutterBottom>Intelligence Operations</Typography>
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

// Main Component: Intel Management Dashboard
const IntelManagementDashboard: React.FC = () => {
  const { data: intelStatus, isLoading, error } = useIntelStatus();

  if (isLoading) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography variant="h6" mt={2}>Loading Intel Dashboard...</Typography>
      </Box>
    );
  }

  if (error || !intelStatus?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load intel system status. Please ensure the intel core is initialized.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <IntelIcon sx={{ mr: 2, fontSize: 32, color: '#673ab7' }} />
        <Box>
          <Typography variant="h4" component="h1">
            Intel Management Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Intelligence Gathering & Analysis Platform
          </Typography>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <IntelOverview status={intelStatus} />
        <IntelligenceAnalysisPanel />
        <IntelOperationsPanel />
      </Box>
    </Box>
  );
};

export default IntelManagementDashboard;
