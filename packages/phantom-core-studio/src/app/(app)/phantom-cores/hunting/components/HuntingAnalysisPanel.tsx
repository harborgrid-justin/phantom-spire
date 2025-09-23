'use client';

// Hunting Analysis Panel - Conducts and displays threat hunting analysis
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Search as HuntingIcon,
  GpsFixed as TargetIcon,
  Visibility as DetectionIcon,
  Timeline as TimelineIcon,
  Security as ThreatIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { conductHunt } from '../api';
import type { HuntingAnalysis } from '../types';

export const HuntingAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<HuntingAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [huntType, setHuntType] = useState('behavioral_anomaly');
  const [targetScope, setTargetScope] = useState('enterprise_wide');

  const huntTypes = [
    'behavioral_anomaly', 'ioc_hunting', 'ttp_tracking', 'insider_threat',
    'apt_campaign', 'lateral_movement', 'data_exfiltration', 'malware_family'
  ];

  const targetScopes = [
    'enterprise_wide', 'network_perimeter', 'endpoint_focused', 'cloud_infrastructure',
    'critical_assets', 'user_behavior', 'server_infrastructure'
  ];

  const runThreatHunt = async () => {
    setLoading(true);
    try {
      const result = await conductHunt({
        hunt_type: huntType,
        target_scope: targetScope,
        hypothesis: 'Advanced persistent threat using living-off-the-land techniques',
        time_range: '30_days',
        confidence_threshold: 0.7,
        include_ml_analysis: true
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Threat hunt failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Threat Hunting Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Hunt Type</InputLabel>
              <Select
                value={huntType}
                onChange={(e) => setHuntType(e.target.value)}
                label="Hunt Type"
              >
                {huntTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Target Scope</InputLabel>
              <Select
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value)}
                label="Target Scope"
              >
                {targetScopes.map((scope) => (
                  <MenuItem key={scope} value={scope}>
                    {scope.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<HuntingIcon />}
              onClick={runThreatHunt}
              disabled={loading}
            >
              Hunt
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {analysis && (
          <Box>
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Box flex="1 1 400px" minWidth="400px">
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Hunt Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Hunt Name:</strong> {analysis.hunt_profile.hunt_name}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Hypothesis:</strong> {analysis.hunt_profile.hypothesis}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Threat Level:</strong> {analysis.hunt_profile.threat_level}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1} gap={1}>
                    <Typography variant="body2" component="span">
                      <strong>Confidence Score:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.hunt_profile.confidence_score * 100).toFixed(1)}%`}
                      color={analysis.hunt_profile.confidence_score >= 0.8 ? 'success' :
                             analysis.hunt_profile.confidence_score >= 0.6 ? 'warning' : 'error'}
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
                  <Typography variant="subtitle1" gutterBottom>Hunt Results</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <DetectionIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="15 suspicious activities detected"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TargetIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="3 high-priority IOCs matched"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimelineIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Attack timeline reconstructed"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ThreatIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Advanced threat actor signatures identified"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Hunt Recommendations</Typography>
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
