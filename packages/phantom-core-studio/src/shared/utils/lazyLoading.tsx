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
export const ModelBuilder = lazy(() => import('@/app/modelBuilder/page'));
export const DataExplorer = lazy(() => import('@/app/dataExplorer/page'));
export const Experiments = lazy(() => import('@/app/experiments/page'));
export const Models = lazy(() => import('@/app/models/page'));
export const Deployments = lazy(() => import('@/app/deployments/page'));
export const Settings = lazy(() => import('@/app/settings/page'));

// Advanced feature pages - loaded on demand
export const AutoMLPipelineVisualizer = lazy(() => import('@/app/automlPipeline/page'));
export const BiasDetectionEngine = lazy(() => import('@/app/biasDetection/page'));
export const EnterpriseSecurityCompliance = lazy(() => import('@/app/compliance/page'));
export const ExplainableAIVisualizer = lazy(() => import('@/app/explainableAi/page'));
export const InteractiveFeatureEngineering = lazy(() => import('@/app/featureEngineering/page'));
export const MultiModelABTesting = lazy(() => import('@/app/abTesting/page'));
export const RealTimeMonitoring = lazy(() => import('@/app/monitoring/page'));
export const ThreatIntelligenceMarketplace = lazy(() => import('@/app/threatIntelligence/page'));

// Bundle analyzer friendly exports
export {
  LoadingFallback,
};