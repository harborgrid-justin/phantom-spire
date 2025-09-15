'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { automlPipelineVisualizerService } from '../../services/automlPipelineVisualizerService';
import { AutoMLExperiment, PipelineStep } from '../../services/automlPipelineVisualizer.types';
import { ServiceContext } from '../../services/core';

const AutoMLPipelineVisualizerPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [experiment, setExperiment] = useState<AutoMLExperiment | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const context: ServiceContext = {
        requestId: `req-${Date.now()}`,
        startTime: new Date(),
        timeout: 5000,
        permissions: [],
        metadata: {},
        trace: {
            traceId: `trace-${Date.now()}`,
            spanId: `span-${Date.now()}`,
            sampled: true,
            baggage: {},
        }
      };
      const response = await automlPipelineVisualizerService.getAutoMLExperiment({
        id: 'req-automl-exp',
        type: 'getAutoMLExperiment',
        data: { experimentId: 'exp-security-ml-001' },
        metadata: { category: 'automl', module: 'automl-page', version: '1.0.0' },
        context: { environment: 'development' },
        timestamp: new Date(),
      }, context);

      if (response.success && response.data) {
        setExperiment(response.data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !experiment) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Drawing logic would be here
  }, [experiment]);

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckIcon color="success" />;
    if (status === 'running') return <PlayIcon color="primary" />;
    if (status === 'failed') return <ErrorIcon color="error" />;
    return <WarningIcon color="disabled" />;
  };

  if (loading || !experiment) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>AutoML Pipeline Visualizer</Typography>
      <Alert severity="success" sx={{ mb: 3 }}>
        <AlertTitle>H2O.ai Competitive Edge</AlertTitle>
        Advanced pipeline visualization with security scoring at each step.
      </Alert>
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Pipeline Overview" />
      </Tabs>
      <Grid container spacing={3}>
        <Grid item xs={12}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Security-First AutoML Pipeline</Typography>
                    <Box sx={{ overflow: 'auto', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <canvas ref={canvasRef} width={1200} height={200} />
                    </Box>
                </CardContent>
            </Card>
        </Grid>
        <Grid item xs={12}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Pipeline Steps Detail</Typography>
                    <Stepper orientation="vertical">
                        {experiment.pipeline.map((step) => (
                            <Step key={step.id} active={step.status === 'running'} completed={step.status === 'completed'}>
                                <StepLabel icon={getStatusIcon(step.status)}>
                                    <Typography variant="subtitle1">{step.name}</Typography>
                                </StepLabel>
                                <StepContent>
                                    {step.progress !== undefined && <LinearProgress variant="determinate" value={step.progress} />}
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>
                </CardContent>
            </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AutoMLPipelineVisualizerPage;