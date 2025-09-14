import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import Layout from './components/Layout/Layout';

// Lazy load components for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const DataExplorer = React.lazy(() => import('./pages/DataExplorer/DataExplorer'));
const ModelBuilder = React.lazy(() => import('./pages/ModelBuilder/ModelBuilder'));
const Experiments = React.lazy(() => import('./pages/Experiments/Experiments'));
const Models = React.lazy(() => import('./pages/Models/Models'));
const Deployments = React.lazy(() => import('./pages/Deployments/Deployments'));
const Settings = React.lazy(() => import('./pages/Settings/Settings'));
const ModelComparison = React.lazy(() => import('./pages/ModelComparison/ModelComparison'));
const H2OComparison = React.lazy(() => import('./pages/H2OComparison/H2OComparison'));
const RealTimeMonitoring = React.lazy(() => import('./pages/RealTimeMonitoring'));
const AutoMLPipelineVisualizer = React.lazy(() => import('./pages/AutoMLPipelineVisualizer'));
const BiasDetectionEngine = React.lazy(() => import('./pages/BiasDetectionEngine'));
const InteractiveFeatureEngineering = React.lazy(() => import('./pages/InteractiveFeatureEngineering'));
const ThreatIntelligenceMarketplace = React.lazy(() => import('./pages/ThreatIntelligenceMarketplace'));
const ExplainableAIVisualizer = React.lazy(() => import('./pages/ExplainableAIVisualizer'));
const MultiModelABTesting = React.lazy(() => import('./pages/MultiModelABTesting'));
const EnterpriseSecurityCompliance = React.lazy(() => import('./pages/EnterpriseSecurityCompliance'));

// Loading component
const LoadingFallback: React.FC = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    height="60vh"
    flexDirection="column"
    gap={2}
  >
    <CircularProgress size={60} />
    <div>Loading...</div>
  </Box>
);

const App: React.FC = () => {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/data" element={<DataExplorer />} />
          <Route path="/build" element={<ModelBuilder />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="/models" element={<Models />} />
          <Route path="/compare" element={<ModelComparison />} />
          <Route path="/h2o-comparison" element={<H2OComparison />} />
          <Route path="/deploy" element={<Deployments />} />
          <Route path="/settings" element={<Settings />} />
          {/* 8 New Advanced Competitive Features */}
          <Route path="/realtime-monitoring" element={<RealTimeMonitoring />} />
          <Route path="/pipeline-visualizer" element={<AutoMLPipelineVisualizer />} />
          <Route path="/bias-detection" element={<BiasDetectionEngine />} />
          <Route path="/feature-engineering" element={<InteractiveFeatureEngineering />} />
          <Route path="/threat-marketplace" element={<ThreatIntelligenceMarketplace />} />
          <Route path="/explainable-ai" element={<ExplainableAIVisualizer />} />
          <Route path="/ab-testing" element={<MultiModelABTesting />} />
          <Route path="/enterprise-compliance" element={<EnterpriseSecurityCompliance />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

export default App;