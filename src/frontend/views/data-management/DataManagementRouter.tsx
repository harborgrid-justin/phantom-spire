/**
 * Data Management Router - Handles routing for all 32 data management pages
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import data management components
import { DataManagementHub } from './DataManagementHub';

// Data Ingestion & Processing Components (8 pages)
import { Sources } from './ingestion/Sources';
import { Streams } from './ingestion/Streams';
import { BatchProcessing } from './ingestion/BatchProcessing';
import { Transformation } from './ingestion/Transformation';
import { QualityValidation } from './ingestion/QualityValidation';
import { PipelineMonitor } from './ingestion/PipelineMonitor';
import { FormatConversion } from './ingestion/FormatConversion';
import { SchemaRegistry } from './ingestion/SchemaRegistry';

// Data Governance & Compliance Components (8 pages)
import { Dashboard as GovernanceDashboard } from './governance/Dashboard';
import { PolicyManagement } from './governance/PolicyManagement';
import { ComplianceMonitoring } from './governance/ComplianceMonitoring';
import { LineageTracking } from './governance/LineageTracking';
import { PrivacyControls } from './governance/PrivacyControls';
import { AuditTrail } from './governance/AuditTrail';
import { RetentionPolicies } from './governance/RetentionPolicies';
import { Classification } from './governance/Classification';

// Data Analytics & Insights Components (8 pages)
import { Workbench } from './analytics/Workbench';
import { ReportGeneration } from './analytics/ReportGeneration';
import { DashboardBuilder } from './analytics/DashboardBuilder';
import { MetricsKpi } from './analytics/MetricsKpi';
import { TrendAnalysis } from './analytics/TrendAnalysis';
import { PerformanceAnalytics } from './analytics/PerformanceAnalytics';
import { DataMining } from './analytics/DataMining';
import { PredictiveAnalytics } from './analytics/PredictiveAnalytics';

// Data Operations & Monitoring Components (8 pages)
import { HealthMonitor } from './operations/HealthMonitor';
import { StorageManagement } from './operations/StorageManagement';
import { BackupRecovery } from './operations/BackupRecovery';
import { AccessControl } from './operations/AccessControl';
import { IntegrationStatus } from './operations/IntegrationStatus';
import { PerformanceOptimizer } from './operations/PerformanceOptimizer';
import { ErrorManagement } from './operations/ErrorManagement';
import { CapacityPlanning } from './operations/CapacityPlanning';

// Placeholder component for pages under development
const PlaceholderComponent: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div style={{ padding: '24px' }}>
    <h2>{title}</h2>
    <p>{description}</p>
    <p style={{ color: '#666' }}>This page is under development and will be fully implemented soon.</p>
  </div>
);

export const DataManagementRouter: React.FC = () => {
  return (
    <Routes>
      {/* Main hub route */}
      <Route path="/" element={<DataManagementHub />} />
      <Route path="hub" element={<DataManagementHub />} />
      
      {/* Data Ingestion & Processing (8 routes) */}
      <Route path="ingestion/sources" element={<Sources />} />
      <Route path="ingestion/streams" element={<Streams />} />
      <Route path="ingestion/batch-processing" element={<BatchProcessing />} />
      <Route path="ingestion/transformation" element={<Transformation />} />
      <Route path="ingestion/quality-validation" element={<QualityValidation />} />
      <Route path="ingestion/pipeline-monitor" element={<PipelineMonitor />} />
      <Route path="ingestion/format-conversion" element={<FormatConversion />} />
      <Route path="ingestion/schema-registry" element={<SchemaRegistry />} />
      
      {/* Data Governance & Compliance (8 routes) */}
      <Route path="governance/dashboard" element={<GovernanceDashboard />} />
      <Route path="governance/policy-management" element={<PolicyManagement />} />
      <Route path="governance/compliance-monitoring" element={<ComplianceMonitoring />} />
      <Route path="governance/lineage-tracking" element={<LineageTracking />} />
      <Route path="governance/privacy-controls" element={<PrivacyControls />} />
      <Route path="governance/audit-trail" element={<AuditTrail />} />
      <Route path="governance/retention-policies" element={<RetentionPolicies />} />
      <Route path="governance/classification" element={<Classification />} />
      
      {/* Data Analytics & Insights (8 routes) */}
      <Route path="analytics/workbench" element={<Workbench />} />
      <Route path="analytics/report-generation" element={<ReportGeneration />} />
      <Route path="analytics/dashboard-builder" element={<DashboardBuilder />} />
      <Route path="analytics/metrics-kpi" element={<MetricsKpi />} />
      <Route path="analytics/trend-analysis" element={<TrendAnalysis />} />
      <Route path="analytics/performance-analytics" element={<PerformanceAnalytics />} />
      <Route path="analytics/data-mining" element={<DataMining />} />
      <Route path="analytics/predictive-analytics" element={<PredictiveAnalytics />} />
      
      {/* Data Operations & Monitoring (8 routes) */}
      <Route path="operations/health-monitor" element={<HealthMonitor />} />
      <Route path="operations/storage-management" element={<StorageManagement />} />
      <Route path="operations/backup-recovery" element={<BackupRecovery />} />
      <Route path="operations/access-control" element={<AccessControl />} />
      <Route path="operations/integration-status" element={<IntegrationStatus />} />
      <Route path="operations/performance-optimizer" element={<PerformanceOptimizer />} />
      <Route path="operations/error-management" element={<ErrorManagement />} />
      <Route path="operations/capacity-planning" element={<CapacityPlanning />} />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="hub" replace />} />
    </Routes>
  );
};