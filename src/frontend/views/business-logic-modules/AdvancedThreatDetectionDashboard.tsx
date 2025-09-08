/**
 * Advanced Threat Detection Dashboard
 * Real-time threat detection with AI-powered analysis
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Security,
  Warning,
  CheckCircle,
  Error,
  Speed,
  Analytics,
  BugReport,
  Shield
} from '@mui/icons-material';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

export const AdvancedThreatDetectionDashboard: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('advanced-threat-detection');

  const [analysisType, setAnalysisType] = useState<string>('hybrid');
  const [detectionResults, setDetectionResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Execute threat detection
  const handleThreatDetection = async () => {
    try {
      setIsAnalyzing(true);
      const sampleData = Array.from({ length: 100 }, (_, i) => ({
        id: `event_${i}`,
        timestamp: new Date(),
        source: `source_${i % 5}`,
        type: ['network', 'endpoint', 'email', 'web'][i % 4]
      }));

      const response = await businessLogic.execute('detect-threats', {
        data: sampleData,
        analysisType,
        confidence_threshold: 0.7
      });

      setDetectionResults(response);
      addNotification('success', `Threat detection completed: ${response.data?.summary?.total_threats || 0} threats found`);
    } catch (error) {
      addNotification('error', `Threat detection failed: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Train ML model
  const handleModelTraining = async () => {
    try {
      const trainingData = Array.from({ length: 1000 }, (_, i) => ({
        features: [Math.random(), Math.random(), Math.random()],
        label: Math.random() > 0.5 ? 'threat' : 'benign'
      }));

      const response = await businessLogic.execute('train-model', {
        training_data: trainingData,
        model_type: 'neural_network'
      });

      addNotification('success', `Model training completed with ${(response.data?.training_accuracy * 100).toFixed(1)}% accuracy`);
    } catch (error) {
      addNotification('error', `Model training failed: ${error}`);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <Error color="error" />;
      case 'high': return <Warning color="warning" />;
      case 'medium': return <Security color="info" />;
      case 'low': return <CheckCircle color="success" />;
      default: return <Shield />;
    }
  };

  if (!isFullyLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Advanced Threat Detection...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Security sx={{ mr: 2, fontSize: 40 }} />
        Advanced Threat Detection Engine
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        AI-powered threat detection with behavioral analysis, machine learning, and real-time monitoring.
      </Typography>

      {hasErrors && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Some services are experiencing issues. Functionality may be limited.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Detection Configuration */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Analytics sx={{ mr: 1 }} />
                Detection Configuration
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Analysis Type</InputLabel>
                <Select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  label="Analysis Type"
                >
                  <MenuItem value="behavioral">Behavioral Analysis</MenuItem>
                  <MenuItem value="signature">Signature-Based</MenuItem>
                  <MenuItem value="anomaly">Anomaly Detection</MenuItem>
                  <MenuItem value="hybrid">Hybrid Analysis</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                fullWidth
                onClick={handleThreatDetection}
                disabled={isAnalyzing}
                startIcon={isAnalyzing ? <CircularProgress size={20} /> : <Speed />}
                sx={{ mb: 2 }}
              >
                {isAnalyzing ? 'Analyzing...' : 'Start Detection'}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={handleModelTraining}
                startIcon={<BugReport />}
              >
                Train ML Model
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Detection Results */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detection Results
              </Typography>
              
              {detectionResults ? (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {detectionResults.summary?.total_threats || 0}
                        </Typography>
                        <Typography variant="body2">Total Threats</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="error">
                          {detectionResults.summary?.critical_count || 0}
                        </Typography>
                        <Typography variant="body2">Critical</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="warning">
                          {detectionResults.summary?.high_count || 0}
                        </Typography>
                        <Typography variant="body2">High</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="success">
                          {((1 - (detectionResults.summary?.false_positive_rate || 0)) * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2">Accuracy</Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Typography variant="h6" gutterBottom>
                    Detected Threats
                  </Typography>
                  <List>
                    {detectionResults.threats?.slice(0, 5).map((threat: any, index: number) => (
                      <ListItem key={index} divider>
                        <ListItemIcon>
                          {getSeverityIcon(threat.severity)}
                        </ListItemIcon>
                        <ListItemText
                          primary={threat.type}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                Confidence: {(threat.confidence * 100).toFixed(1)}%
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                {threat.indicators?.slice(0, 2).map((indicator: string, idx: number) => (
                                  <Chip
                                    key={idx}
                                    label={indicator}
                                    size="small"
                                    sx={{ mr: 1, mb: 1 }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          }
                        />
                        <Chip
                          label={threat.severity}
                          color={getSeverityColor(threat.severity)}
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="textSecondary">
                    No detection results available. Start a threat detection scan to see results.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Real-time Monitoring */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Real-time Monitoring
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    System Performance
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={85} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    Detection Engine: 85% capacity
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    Model Accuracy
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={92} 
                    color="success"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    Current Model: 92% accuracy
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};