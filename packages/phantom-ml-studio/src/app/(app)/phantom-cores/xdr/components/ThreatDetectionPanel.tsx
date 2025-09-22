import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  BugReport as ThreatIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { ThreatAnalysis } from '../types';
import { performThreatDetection } from '../api';

export const ThreatDetectionPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<ThreatAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [scope, setScope] = useState('enterprise_wide');

  const runThreatDetection = async () => {
    setLoading(true);
    try {
      const result = await performThreatDetection({
        scope,
        analysis_depth: 'comprehensive',
        detection_config: {
          enable_behavioral: true,
          enable_ml_anomaly: true,
          enable_signature: true,
          enable_threat_intel: true
        }
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Threat detection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Advanced Threat Detection</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Analysis Scope</InputLabel>
              <Select value={scope} onChange={(e) => setScope(e.target.value)} label="Analysis Scope">
                <MenuItem value="enterprise_wide">Enterprise Wide</MenuItem>
                <MenuItem value="network_perimeter">Network Perimeter</MenuItem>
                <MenuItem value="endpoint_focused">Endpoint Focused</MenuItem>
                <MenuItem value="cloud_infrastructure">Cloud Infrastructure</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<ThreatIcon />}
              onClick={runThreatDetection}
              disabled={loading}
            >
              Detect Threats
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {analysis && (
          <Box>
            {/* Add null check for threat_overview */}
            {!analysis.threat_overview ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Threat analysis is being processed. Please wait for results...
              </Alert>
            ) : (
              <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                <Box flex="1 1 400px" minWidth="400px">
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Threat Overview</Typography>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      <Box flex="1 1 150px" minWidth="150px">
                        <Typography variant="body2">Total Detected:</Typography>
                        <Typography variant="h5" color="primary">
                          {analysis.threat_overview.total_threats_detected || 0}
                        </Typography>
                      </Box>
                      <Box flex="1 1 150px" minWidth="150px">
                        <Typography variant="body2">Critical:</Typography>
                        <Typography variant="h5" color="error">
                          {analysis.threat_overview.critical_threats || 0}
                        </Typography>
                      </Box>
                      <Box flex="1 1 150px" minWidth="150px">
                        <Typography variant="body2">High Priority:</Typography>
                        <Typography variant="h6" color="warning.main">
                          {analysis.threat_overview.high_priority_threats || 0}
                        </Typography>
                      </Box>
                      <Box flex="1 1 150px" minWidth="150px">
                        <Typography variant="body2">Medium Priority:</Typography>
                        <Typography variant="h6" color="info.main">
                          {analysis.threat_overview.medium_priority_threats || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Box>

                <Box flex="1 1 400px" minWidth="400px">
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Recommendations</Typography>
                    <List dense>
                      {(analysis.recommendations || []).map((recommendation, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <ShieldIcon color="primary" fontSize="small" />
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
              </Box>
            )}

            <Typography variant="caption" color="textSecondary">
              Analysis ID: {analysis.analysis_id || 'N/A'} | Generated: {analysis.timestamp ? new Date(analysis.timestamp).toLocaleString() : 'N/A'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
