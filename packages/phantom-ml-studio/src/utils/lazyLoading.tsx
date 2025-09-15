import { lazy, Suspense, ComponentType } from 'react';
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

// Type definitions for lazy loading
interface LazyComponentProps {
  [key: string]: unknown;
}

interface LazyLoadingOptions {
  loadingMessage?: string;
  errorMessage?: string;
  retryButton?: boolean;
}

// Lazy load all major page components for code splitting
export const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
export const ModelBuilder = lazy(() => import('../pages/ModelBuilder/ModelBuilder'));
export const DataExplorer = lazy(() => import('../pages/DataExplorer/DataExplorer'));
export const Experiments = lazy(() => import('../pages/Experiments/Experiments'));
export const Models = lazy(() => import('../pages/Models/Models'));
export const Deployments = lazy(() => import('../pages/Deployments/Deployments'));
export const Settings = lazy(() => import('../pages/Settings/Settings'));

// Advanced feature pages - loaded on demand
export const H2OComparison = lazy(() => import('../pages/H2OComparison/H2OComparison'));
export const AutoMLPipelineVisualizer = lazy(() => import('../pages/AutoMLPipelineVisualizer'));
export const BiasDetectionEngine = lazy(() => import('../pages/BiasDetectionEngine'));
export const EnterpriseSecurityCompliance = lazy(() => import('../pages/EnterpriseSecurityCompliance'));
export const ExplainableAIVisualizer = lazy(() => import('../pages/ExplainableAIVisualizer'));
export const InteractiveFeatureEngineering = lazy(() => import('../pages/InteractiveFeatureEngineering'));
export const MultiModelABTesting = lazy(() => import('../pages/MultiModelABTesting'));
export const RealTimeMonitoring = lazy(() => import('../pages/RealTimeMonitoring'));
export const ThreatIntelligenceMarketplace = lazy(() => import('../pages/ThreatIntelligenceMarketplace'));
export const ModelComparison = lazy(() => import('../pages/ModelComparison/ModelComparison'));

// Bundle analyzer friendly exports
export {
  LoadingFallback,
};