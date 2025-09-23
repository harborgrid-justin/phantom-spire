// Attribution Analysis Panel Component - Attribution Analysis with detailed threat actor profiling

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
  Psychology as AttributionIcon,
  CheckCircle as CheckCircleIcon,
  Fingerprint as TTPIcon
} from '@mui/icons-material';
import { AttributionAnalysis, AnalysisType, ThreatActor } from '../types';
import { analyzeAttribution } from '../api';

const AttributionAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<AttributionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('campaign_attribution');
  const [targetActor, setTargetActor] = useState<ThreatActor>('APT29');

  const analysisTypes: AnalysisType[] = [
    'campaign_attribution', 'actor_profiling', 'ttp_analysis', 'infrastructure_mapping'
  ];

  const knownActors: ThreatActor[] = [
    'APT29', 'APT28', 'Lazarus Group', 'FIN7', 'Carbanak', 'Equation Group',
    'Comment Crew', 'Mustang Panda', 'TA505', 'Conti'
  ];

  const runAttributionAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeAttribution({
        analysis_type: analysisType,
        target_actor: targetActor,
        analysis_scope: 'comprehensive',
        confidence_threshold: 0.7,
        include_ttp_mapping: true,
        timeframe: '90_days'
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Attribution analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Attribution Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Analysis Type</InputLabel>
              <Select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
                label="Analysis Type"
              >
                {analysisTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Target Actor</InputLabel>
              <Select
                value={targetActor}
                onChange={(e) => setTargetActor(e.target.value as ThreatActor)}
                label="Target Actor"
              >
                {knownActors.map((actor) => (
                  <MenuItem key={actor} value={actor}>
                    {actor}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AttributionIcon />}
              onClick={runAttributionAnalysis}
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
                  <Typography variant="subtitle1" gutterBottom>Attribution Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Threat Actor:</strong> {analysis.attribution_profile.threat_actor}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Campaign:</strong> {analysis.attribution_profile.campaign_name}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1} gap={1}>
                    <Typography variant="body2" component="span">
                      <strong>Confidence Score:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.attribution_profile.confidence_score * 100).toFixed(1)}%`}
                      color={analysis.attribution_profile.confidence_score >= 0.8 ? 'success' :
                             analysis.attribution_profile.confidence_score >= 0.6 ? 'warning' : 'error'}
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
                  <Typography variant="subtitle1" gutterBottom>TTP Techniques</Typography>
                  <List dense>
                    {analysis.attribution_profile.attribution_techniques?.slice(0, 4).map((technique, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TTPIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={technique}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Key Recommendations</Typography>
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

export default AttributionAnalysisPanel;
