import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import DataExplorer from './pages/DataExplorer/DataExplorer';
import ModelBuilder from './pages/ModelBuilder/ModelBuilder';
import Experiments from './pages/Experiments/Experiments';
import Models from './pages/Models/Models';
import Deployments from './pages/Deployments/Deployments';
import Settings from './pages/Settings/Settings';
import ModelComparison from './pages/ModelComparison/ModelComparison';
import H2OComparison from './pages/H2OComparison/H2OComparison';
import RealTimeMonitoring from './pages/RealTimeMonitoring';
import AutoMLPipelineVisualizer from './pages/AutoMLPipelineVisualizer';
import BiasDetectionEngine from './pages/BiasDetectionEngine';
import InteractiveFeatureEngineering from './pages/InteractiveFeatureEngineering';
import ThreatIntelligenceMarketplace from './pages/ThreatIntelligenceMarketplace';
import ExplainableAIVisualizer from './pages/ExplainableAIVisualizer';
import MultiModelABTesting from './pages/MultiModelABTesting';
import EnterpriseSecurityCompliance from './pages/EnterpriseSecurityCompliance';

const App: React.FC = () => {
  return (
    <Layout>
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
    </Layout>
  );
};

export default App;