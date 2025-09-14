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
      </Routes>
    </Layout>
  );
};

export default App;