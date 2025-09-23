'use client';

import React from 'react';
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
  AutoAwesome as MLIcon,
  BugReport as AnomalyIcon,
  TrendingUp as PredictiveIcon,
  Speed as RealtimeIcon,
  Verified as AccuracyIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useMLAnalysis } from '../hooks';

export const MLAnalysisPanel: React.FC = () => {
  const {
    analysis,
    loading,
    modelType,
    setModelType,
    dataSource,
    setDataSource,
    modelTypes,
    dataSources,
    runMLSecurityAnalysis
  } = useMLAnalysis();

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">ML Security Analysis</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Model Type</InputLabel>
              <Select
                value={modelType}
                onChange={(e) => setModelType(e.target.value as any)}
                label="Model Type"
              >
                {modelTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Data Source</InputLabel>
              <Select
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value as any)}
                label="Data Source"
              >
                {dataSources.map((source) => (
                  <MenuItem key={source} value={source}>
                    {source.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<MLIcon />}
              onClick={runMLSecurityAnalysis}
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
                  <Typography variant="subtitle1" gutterBottom>ML Model Profile</Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Model Name:</strong> {analysis.ml_profile.model_name}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Algorithm:</strong> {analysis.ml_profile.algorithm_type}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" mr={1}>
                      <strong>Prediction Accuracy:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.ml_profile.prediction_accuracy * 100).toFixed(1)}%`}
                      color={analysis.ml_profile.prediction_accuracy >= 0.9 ? 'success' :
                             analysis.ml_profile.prediction_accuracy >= 0.8 ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" mr={1}>
                      <strong>Confidence Score:</strong>
                    </Typography>
                    <Chip
                      label={`${(analysis.ml_profile.confidence_score * 100).toFixed(1)}%`}
                      color={analysis.ml_profile.confidence_score >= 0.8 ? 'success' :
                             analysis.ml_profile.confidence_score >= 0.6 ? 'warning' : 'error'}
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
                  <Typography variant="subtitle1" gutterBottom>ML Insights</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <AnomalyIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Anomalous behavior patterns detected"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PredictiveIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Predictive threat indicators identified"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <RealtimeIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Real-time threat scoring active"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AccuracyIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="High confidence threat classification"
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>

            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>ML Security Recommendations</Typography>
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
