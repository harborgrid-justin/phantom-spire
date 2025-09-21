'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  CircularProgress,
  Container,
  Paper,
  Button,
  Chip
} from '@mui/material';
import {
  Security as SecurityIcon,
  Psychology as PsychologyIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { ServiceContext } from '@/services/core';

interface ModelExplanation {
  modelId: string;
  explanation: string;
  features: string[];
  importance: number[];
  timestamp: Date;
}

export default function ExplainableAIVisualizerPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [explanation, setExplanation] = useState<ModelExplanation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate fetching explanation data with fallback
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Provide mock data as fallback
        const mockExplanation: ModelExplanation = {
          modelId: 'threat-detector-v3',
          explanation: 'Model explanation with feature importance analysis',
          features: ['network_traffic', 'user_behavior', 'system_logs', 'threat_signatures'],
          importance: [0.35, 0.28, 0.22, 0.15],
          timestamp: new Date()
        };

        setExplanation(mockExplanation);
      } catch (err) {
        console.error('Error loading explainable AI data:', err);
        setError('Failed to load model explanation data. Using fallback visualization.');
        
        // Still provide mock data even on error
        const fallbackExplanation: ModelExplanation = {
          modelId: 'fallback-model',
          explanation: 'Fallback explanation for demonstration purposes',
          features: ['feature_1', 'feature_2', 'feature_3'],
          importance: [0.4, 0.35, 0.25],
          timestamp: new Date()
        };
        setExplanation(fallbackExplanation);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Explainable AI Visualization Engine
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Advanced model interpretability with security-focused explanations and bias analysis
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Service Notice</AlertTitle>
          {error}
        </Alert>
      )}

      <Alert severity="success" sx={{ mb: 3 }}>
        <AlertTitle>H2O.ai Competitive Edge</AlertTitle>
        Security-focused explainable AI with threat context and bias analysis.
      </Alert>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Feature Importance" />
        <Tab label="SHAP Analysis" />
        <Tab label="Security Context" />
      </Tabs>

      <Grid container spacing={3}>
        {activeTab === 0 && (
          <>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Feature Importance Analysis
                </Typography>
                {explanation && (
                  <Box>
                    {explanation.features.map((feature, index) => (
                      <Box key={feature} mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">{feature}</Typography>
                          <Typography variant="body2">
                            {(explanation.importance[index] * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: '100%',
                            height: 8,
                            backgroundColor: 'grey.200',
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              width: `${explanation.importance[index] * 100}%`,
                              height: '100%',
                              backgroundColor: 'primary.main',
                              transition: 'width 0.5s ease-in-out'
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: 400 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Model Insights</Typography>
                  </Box>
                  <Box mb={2}>
                    <Chip label="High Accuracy" color="success" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label="Low Bias" color="primary" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label="Secure" color="secondary" size="small" sx={{ mb: 1 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Model: {explanation?.modelId || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated: {explanation?.timestamp.toLocaleString() || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {activeTab === 1 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                SHAP (SHapley Additive exPlanations) Analysis
              </Typography>
              <Box display="flex" justifyContent="center" alignItems="center" height="80%">
                <Typography variant="body1" color="text.secondary">
                  SHAP visualization components will be rendered here
                </Typography>
              </Box>
            </Paper>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <SecurityIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">Security Context Analysis</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Threat Level
                      </Typography>
                      <Typography variant="h5" color="warning.main">
                        Medium
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Confidence Score
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        92.3%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Risk Assessment
                      </Typography>
                      <Typography variant="h5" color="info.main">
                        Low
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Bias Score
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        0.12
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Box mt={4}>
        <Button variant="contained" sx={{ mr: 2 }}>
          Export Analysis
        </Button>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Refresh Data
        </Button>
      </Box>
    </Container>
  );
};

