// IOC Analysis Panel Component

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
  Flag as IOCIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  TrendingUp as TrendIcon,
  Speed as FastIcon
} from '@mui/icons-material';
import { IOCAnalysis, IndicatorType } from '../types';
import { analyzeIOC } from '../api';

const IOCAnalysisPanel: React.FC = () => {
  const [analysis, setAnalysis] = useState<IOCAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [indicatorType, setIndicatorType] = useState<IndicatorType>('hash');
  const [indicatorValue, setIndicatorValue] = useState('a1b2c3d4e5f6...');

  const indicatorTypes: IndicatorType[] = ['hash', 'ip_address', 'domain', 'url', 'file_path', 'registry_key', 'email', 'user_agent'];

  const runIOCAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeIOC({
        indicator_type: indicatorType,
        indicator_value: indicatorValue,
        analysis_scope: 'comprehensive',
        threat_intelligence_enrichment: true,
        attribution_analysis: true,
        confidence_threshold: 0.7
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('IOC analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">IOC Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Indicator Type</InputLabel>
              <Select
                value={indicatorType}
                onChange={(e) => setIndicatorType(e.target.value as IndicatorType)}
                label="Indicator Type"
              >
                {indicatorTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Indicator Value"
              value={indicatorValue}
              onChange={(e) => setIndicatorValue(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="contained"
              startIcon={<IOCIcon />}
              onClick={runIOCAnalysis}
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
                  <Typography variant="subtitle1" gutterBottom>IOC Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Indicator:</strong> {analysis.ioc_profile.indicator_value}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Type:</strong> {analysis.ioc_profile.indicator_type}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1} gap={1}>
                    <Typography variant="body2" component="span">
                      <strong>Threat Level:</strong>
                    </Typography>
                    <Chip
                      label={analysis.ioc_profile.threat_level}
                      color={analysis.ioc_profile.threat_level === 'HIGH' ? 'error' :
                             analysis.ioc_profile.threat_level === 'MEDIUM' ? 'warning' : 'info'}
                      size="small"
                    />
                  </Box>
                  <Box display="flex" alignItems="center" mb={1} gap={1}>
                    <Typography variant="body2" component="span">
                      <strong>Confidence Score:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.ioc_profile.confidence_score * 100).toFixed(1)}%`}
                      color={analysis.ioc_profile.confidence_score >= 0.8 ? 'success' :
                             analysis.ioc_profile.confidence_score >= 0.6 ? 'warning' : 'error'}
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
                  <Typography variant="subtitle1" gutterBottom>Threat Intelligence</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Associated with known malware family"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Recently observed in active campaigns"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <FastIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Fast flux infrastructure detected"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Multiple threat intel sources confirm"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>IOC Recommendations</Typography>
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

export default IOCAnalysisPanel;
