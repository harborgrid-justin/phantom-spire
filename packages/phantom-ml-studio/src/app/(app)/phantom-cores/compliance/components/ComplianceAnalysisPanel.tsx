// Compliance Analysis Panel Component

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  AccountBalance as FrameworkIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { ComplianceAnalysis, ComplianceFramework, ComplianceIndustry } from '../types';
import { analyzeFramework } from '../api';

const ComplianceAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<ComplianceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework>('ISO 27001');
  const [industry, setIndustry] = useState<ComplianceIndustry>('Technology');

  const frameworks: ComplianceFramework[] = [
    'ISO 27001', 'SOC 2', 'GDPR', 'HIPAA', 'PCI DSS', 'NIST CSF', 'SOX', 'FISMA'
  ];

  const industries: ComplianceIndustry[] = [
    'Technology', 'Healthcare', 'Financial Services', 'Government', 'Retail', 'Manufacturing'
  ];

  const runFrameworkAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeFramework({
        name: `${selectedFramework} Compliance Framework`,
        industry: industry,
        standards: [selectedFramework],
        scope: 'enterprise-wide',
        maturityTarget: 'Advanced'
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Framework analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Framework Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Framework</InputLabel>
              <Select
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value as ComplianceFramework)}
                label="Framework"
              >
                {frameworks.map((framework) => (
                  <MenuItem key={framework} value={framework}>
                    {framework}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Industry</InputLabel>
              <Select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as ComplianceIndustry)}
                label="Industry"
              >
                {industries.map((ind) => (
                  <MenuItem key={ind} value={ind}>
                    {ind}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<FrameworkIcon />}
              onClick={runFrameworkAnalysis}
              disabled={loading}
            >
              Analyze
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {analysis && (
          <Box>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Framework Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Name:</strong> {analysis.framework_profile.name}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Compliance Score:</strong> {(analysis.framework_profile.compliance_score * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Maturity Level:</strong> {analysis.framework_profile.maturity_level}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Framework ID:</strong> {analysis.framework_id}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Key Recommendations</Typography>
                  <List dense>
                    {analysis.recommendations?.slice(0, 4).map((recommendation, index) => (
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
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ComplianceAnalysisPanel;
