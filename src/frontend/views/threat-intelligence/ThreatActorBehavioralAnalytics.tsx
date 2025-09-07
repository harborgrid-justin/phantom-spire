/**
 * Threat Actor Behavioral Analytics Component
 * ML-based behavioral analysis and pattern detection
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  useTheme,
  alpha,
  Tabs,
  Tab,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

import {
  Psychology,
  Analytics,
  TrendingUp,
  Computer,
  Security,
  Search,
  Refresh,
  Download,
  Visibility,
  Assessment,
  DataUsage,
  NetworkCheck,
  Timeline,
  Fingerprint
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

interface BehavioralPattern {
  id: string;
  name: string;
  description: string;
  confidence: number;
  frequency: number;
  category: 'temporal' | 'technical' | 'operational' | 'target_selection';
  indicators: string[];
  examples: string[];
}

interface ThreatActorProfile {
  id: string;
  name: string;
  aliases: string[];
  behavioralScore: number;
  patterns: BehavioralPattern[];
  anomalies: Array<{
    id: string;
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    confidence: number;
    firstDetected: Date;
  }>;
  predictions: Array<{
    id: string;
    prediction: string;
    probability: number;
    timeframe: string;
    confidence: number;
  }>;
  mlMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    lastTraining: Date;
    dataPoints: number;
  };
}

const ThreatActorBehavioralAnalytics: React.FC = () => {
  const theme = useTheme();
  
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('threat-intelligence-behavioral');

  const [profiles, setProfiles] = useState<ThreatActorProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ThreatActorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);

  const generateMockProfiles = useCallback((): ThreatActorProfile[] => {
    const profiles: ThreatActorProfile[] = [];
    
    for (let i = 1; i <= 15; i++) {
      const patterns: BehavioralPattern[] = [
        {
          id: `pattern-${i}-1`,
          name: 'Timing Pattern',
          description: 'Consistent attack timing during business hours',
          confidence: Math.floor(Math.random() * 30) + 70,
          frequency: Math.random(),
          category: 'temporal',
          indicators: ['Business hours activity', 'Weekend dormancy'],
          examples: ['Attacks at 9-17 GMT', 'No weekend activity']
        },
        {
          id: `pattern-${i}-2`,
          name: 'Technical Signature',
          description: 'Unique code patterns and techniques',
          confidence: Math.floor(Math.random() * 40) + 60,
          frequency: Math.random(),
          category: 'technical',
          indicators: ['Custom encryption', 'Specific API calls'],
          examples: ['XOR encryption with key 0x42', 'WinAPI pattern']
        }
      ];

      profiles.push({
        id: `profile-${i}`,
        name: `BehavioralActor-${i}`,
        aliases: [`BA-${i}`, `Group-${i}`],
        behavioralScore: Math.floor(Math.random() * 40) + 60,
        patterns,
        anomalies: [
          {
            id: `anomaly-${i}-1`,
            type: 'Geographic Shift',
            description: 'Unusual geographic activity detected',
            severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
            confidence: Math.floor(Math.random() * 30) + 70,
            firstDetected: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          }
        ],
        predictions: [
          {
            id: `pred-${i}-1`,
            prediction: 'Likely to target financial sector',
            probability: Math.random(),
            timeframe: 'Next 30 days',
            confidence: Math.floor(Math.random() * 30) + 70
          }
        ],
        mlMetrics: {
          accuracy: Math.random() * 0.3 + 0.7,
          precision: Math.random() * 0.3 + 0.7,
          recall: Math.random() * 0.3 + 0.7,
          f1Score: Math.random() * 0.3 + 0.7,
          lastTraining: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          dataPoints: Math.floor(Math.random() * 5000) + 1000
        }
      });
    }

    return profiles;
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockProfiles = generateMockProfiles();
        setProfiles(mockProfiles);
        setSelectedProfile(mockProfiles[0]);
        addUIUXEvaluation('behavioral-analytics-loaded', 'success', {
          profileCount: mockProfiles.length,
          loadTime: 1000
        });
      } catch (error) {
        console.error('Error loading behavioral data:', error);
        addNotification('error', 'Failed to load behavioral analytics data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockProfiles, addNotification]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Psychology color="primary" />
          Threat Actor Behavioral Analytics
        </Typography>
        <Typography variant="body1" color="textSecondary">
          ML-powered behavioral analysis and pattern detection for threat actors
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '600px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Behavioral Profiles ({profiles.length})
              </Typography>
              <Box sx={{ height: '520px', overflow: 'auto' }}>
                <List dense>
                  {profiles.map(profile => (
                    <ListItem
                      key={profile.id}
                      button
                      selected={selectedProfile?.id === profile.id}
                      onClick={() => setSelectedProfile(profile)}
                      sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                    >
                      <ListItemIcon>
                        <Psychology color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={profile.name}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Score: {profile.behavioralScore}/100
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={profile.behavioralScore} 
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '600px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {selectedProfile?.name || 'Select Profile'}
              </Typography>

              {selectedProfile ? (
                <Box sx={{ height: '510px' }}>
                  <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
                    <Tab label="Patterns" />
                    <Tab label="Anomalies" />
                    <Tab label="Predictions" />
                    <Tab label="ML Metrics" />
                  </Tabs>

                  {selectedTab === 0 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Behavioral Patterns ({selectedProfile.patterns.length})
                      </Typography>
                      {selectedProfile.patterns.map(pattern => (
                        <Paper key={pattern.id} sx={{ p: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {pattern.name}
                            </Typography>
                            <Chip 
                              label={`${Math.round(pattern.confidence)}% confidence`} 
                              size="small" 
                              color="primary"
                            />
                          </Box>
                          <Typography variant="body2" color="textSecondary" paragraph>
                            {pattern.description}
                          </Typography>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" display="block">
                              Frequency: {Math.round(pattern.frequency * 100)}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={pattern.frequency * 100} 
                              sx={{ height: 4 }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {pattern.indicators.map((indicator, idx) => (
                              <Chip key={idx} label={indicator} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )}

                  {selectedTab === 1 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Detected Anomalies ({selectedProfile.anomalies.length})
                      </Typography>
                      {selectedProfile.anomalies.map(anomaly => (
                        <Paper key={anomaly.id} sx={{ p: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {anomaly.type}
                            </Typography>
                            <Chip 
                              label={anomaly.severity} 
                              size="small" 
                              color={
                                anomaly.severity === 'high' ? 'error' :
                                anomaly.severity === 'medium' ? 'warning' : 'info'
                              }
                            />
                          </Box>
                          <Typography variant="body2" color="textSecondary" paragraph>
                            {anomaly.description}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            First detected: {anomaly.firstDetected.toLocaleDateString()} • 
                            Confidence: {anomaly.confidence}%
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  )}

                  {selectedTab === 2 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        ML Predictions ({selectedProfile.predictions.length})
                      </Typography>
                      {selectedProfile.predictions.map(prediction => (
                        <Paper key={prediction.id} sx={{ p: 2, mb: 2 }}>
                          <Typography variant="body1" fontWeight="medium" gutterBottom>
                            {prediction.prediction}
                          </Typography>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" display="block">
                              Probability: {Math.round(prediction.probability * 100)}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={prediction.probability * 100} 
                              sx={{ height: 6 }}
                              color={
                                prediction.probability > 0.7 ? 'error' :
                                prediction.probability > 0.4 ? 'warning' : 'success'
                              }
                            />
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            Timeframe: {prediction.timeframe} • Confidence: {prediction.confidence}%
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  )}

                  {selectedTab === 3 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Machine Learning Model Metrics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                              {Math.round(selectedProfile.mlMetrics.accuracy * 100)}%
                            </Typography>
                            <Typography variant="caption">Accuracy</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4" color="success">
                              {Math.round(selectedProfile.mlMetrics.precision * 100)}%
                            </Typography>
                            <Typography variant="caption">Precision</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4" color="warning">
                              {Math.round(selectedProfile.mlMetrics.recall * 100)}%
                            </Typography>
                            <Typography variant="caption">Recall</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4" color="info">
                              {Math.round(selectedProfile.mlMetrics.f1Score * 100)}%
                            </Typography>
                            <Typography variant="caption">F1 Score</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Model Information</Typography>
                            <List dense>
                              <ListItem>
                                <ListItemText 
                                  primary="Last Training" 
                                  secondary={selectedProfile.mlMetrics.lastTraining.toLocaleDateString()} 
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText 
                                  primary="Training Data Points" 
                                  secondary={selectedProfile.mlMetrics.dataPoints.toLocaleString()} 
                                />
                              </ListItem>
                            </List>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    height: '500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Psychology sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.5), mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      Select a Behavioral Profile
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThreatActorBehavioralAnalytics;