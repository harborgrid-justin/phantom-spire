// Incident Analysis Panel Component

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
  Emergency as IncidentIcon,
  CheckCircle as CheckCircleIcon,
  Speed as UrgentIcon,
  Group as TeamIcon,
  Security as SecurityIcon,
  Notifications as AlertIcon
} from '@mui/icons-material';
import { IncidentType, SeverityLevel, IncidentAnalysis } from '../types';
import { analyzeIncident } from '../api';

const IncidentAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<IncidentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [incidentType, setIncidentType] = useState<IncidentType>('security_breach');
  const [severityLevel, setSeverityLevel] = useState<SeverityLevel>('HIGH');

  const incidentTypes: IncidentType[] = [
    'security_breach', 'malware_infection', 'data_breach', 'ddos_attack',
    'insider_threat', 'phishing_campaign', 'ransomware', 'system_compromise'
  ];

  const severityLevels: SeverityLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const runIncidentAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeIncident({
        incident_type: incidentType,
        severity_level: severityLevel,
        analysis_scope: 'comprehensive',
        include_threat_assessment: true,
        include_impact_analysis: true,
        priority_escalation: true
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Incident analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Incident Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Incident Type</InputLabel>
              <Select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                label="Incident Type"
              >
                {incidentTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={severityLevel}
                onChange={(e) => setSeverityLevel(e.target.value as SeverityLevel)}
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
              startIcon={<IncidentIcon />}
              onClick={runIncidentAnalysis}
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
                  <Typography variant="subtitle1" gutterBottom>Incident Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Incident ID:</strong> {analysis.incident_profile.incident_id}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Type:</strong> {analysis.incident_profile.incident_type}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1} gap={1}>
                    <Typography variant="body2" component="span">
                      <strong>Severity:</strong>
                    </Typography>
                    <Chip
                      label={analysis.incident_profile.severity_level}
                      color={analysis.incident_profile.severity_level === 'CRITICAL' ? 'error' :
                             analysis.incident_profile.severity_level === 'HIGH' ? 'warning' : 'info'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" mb={1}>
                    <strong>Response Status:</strong> {analysis.incident_profile.response_status}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Analysis ID:</strong> {analysis.analysis_id}
                  </Typography>
                </Paper>
              </Box>

              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Response Actions</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <UrgentIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Immediate containment initiated"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TeamIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Response team assembled and briefed"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Security perimeter established"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AlertIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Stakeholders notified per protocol"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Response Recommendations</Typography>
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

export default IncidentAnalysisPanel;
