// CVE Analysis Panel Component - CVE Analysis with detailed vulnerability profiling

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  BugReport as CVEIcon,
  CheckCircle as CheckCircleIcon,
  Flag as PriorityIcon,
  Shield as ShieldIcon,
  Timeline as TimelineIcon,
  Speed as CriticalIcon
} from '@mui/icons-material';
import { CVEAnalysis, SeverityLevel } from '../types';
import { analyzeCVE } from '../api';

const CVEAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<CVEAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [cveId, setCveId] = useState('CVE-2024-21887');
  const [severity, setSeverity] = useState<SeverityLevel>('CRITICAL');

  const severityLevels: SeverityLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const runCVEAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeCVE({
        cve_id: cveId,
        severity_filter: severity,
        analysis_scope: 'comprehensive',
        include_exploits: true,
        include_patches: true,
        assessment_type: 'full_impact'
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('CVE analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">CVE Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              size="small"
              label="CVE ID"
              value={cveId}
              onChange={(e) => setCveId(e.target.value)}
              sx={{ minWidth: 180 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                label="Severity"
              >
                {severityLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<CVEIcon />}
              onClick={runCVEAnalysis}
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
                  <Typography variant="subtitle1" gutterBottom>Vulnerability Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>CVE ID:</strong> {analysis.vulnerability_profile.cve_id}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Impact Level:</strong> {analysis.vulnerability_profile.impact_level}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Exploitability:</strong> {analysis.vulnerability_profile.exploitability}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1} gap={1}>
                    <Typography variant="body2" component="span">
                      <strong>CVSS Score:</strong>
                    </Typography>
                    <Chip
                      label={analysis.vulnerability_profile.severity_score.toFixed(1)}
                      color={analysis.vulnerability_profile.severity_score >= 9.0 ? 'error' :
                             analysis.vulnerability_profile.severity_score >= 7.0 ? 'warning' : 'info'}
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
                  <Typography variant="subtitle1" gutterBottom>Risk Assessment</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CriticalIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Active exploitation detected in the wild"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PriorityIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Patches available for affected systems"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ShieldIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Mitigation strategies identified"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimelineIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Trending upward in attack campaigns"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Remediation Recommendations</Typography>
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

export default CVEAnalysisPanel;
