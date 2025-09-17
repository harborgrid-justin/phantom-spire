import { lazy } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// Create a reusable loading fallback component
const LoadingFallback = ({ message = 'Loading...' }: { message?: string }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="400px"
    gap={2}
  >
    <CircularProgress size={48} />
    <Typography variant="h6" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

// Lazy load all major page components for code splitting
export const Dashboard = lazy(() => import('@/app/dashboard/page'));
export const ModelBuilder = lazy(() => import('@/app/model-builder/page'));
export const DataExplorer = lazy(() => import('@/app/data-explorer/page'));
export const Experiments = lazy(() => import('@/app/experiments/page'));
export const Models = lazy(() => import('@/app/models/page'));
export const Deployments = lazy(() => import('@/app/deployments/page'));
export const Settings = lazy(() => import('@/app/settings/page'));

// Advanced feature pages - loaded on demand
export const AutoMLPipelineVisualizer = lazy(() => import('@/app/automl-pipeline-visualizer/page'));
export const BiasDetectionEngine = lazy(() => import('@/app/bias-detection-engine/page'));
export const EnterpriseSecurityCompliance = lazy(() => import('@/app/enterprise-security-compliance/page'));
export const ExplainableAIVisualizer = lazy(() => import('@/app/explainable-ai-visualizer/page'));
export const InteractiveFeatureEngineering = lazy(() => import('@/app/interactive-feature-engineering/page'));
export const MultiModelABTesting = lazy(() => import('@/app/multi-model-ab-testing/page'));
export const RealTimeMonitoring = lazy(() => import('@/app/real-time-monitoring/page'));
export const ThreatIntelligenceMarketplace = lazy(() => import('@/app/threat-intelligence-marketplace/page'));

// Bundle analyzer friendly exports
export {
  LoadingFallback,
};