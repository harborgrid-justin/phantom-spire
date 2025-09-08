/**
 * Network Management Routes Integration
 * Imports and configures all network management routes
 */

import { Router } from 'express';

// Import all network management route creators
import {
  createNetworkInfrastructureDashboardRoutes,
  createNetworkTopologyVisualizerRoutes,
  createNetworkDeviceInventoryRoutes,
  createNetworkAssetTrackerRoutes,
  createNetworkCapacityPlannerRoutes,
  createNetworkChangeManagerRoutes,
  createNetworkDeploymentAutomationRoutes,
  createNetworkRedundancyAnalyzerRoutes,
  createNetworkDocumentationPortalRoutes,
  createNetworkServiceMappingRoutes,
  createNetworkLifecycleManagerRoutes,
  createNetworkIntegrationHubRoutes,
  createNetworkPerformanceMonitorRoutes,
  createNetworkTrafficAnalyzerRoutes,
  createNetworkBandwidthMonitorRoutes,
  createNetworkLatencyTrackerRoutes,
  createNetworkHealthDashboardRoutes,
  createNetworkAnomalyDetectorRoutes,
  createNetworkMetricsCollectorRoutes,
  createNetworkAlertingEngineRoutes,
  createNetworkReportingSuiteRoutes,
  createNetworkPredictiveAnalyticsRoutes,
  createNetworkSecurityDashboardRoutes,
  createNetworkFirewallManagerRoutes,
  createNetworkIntrusionDetectorRoutes,
  createNetworkAccessControllerRoutes,
  createNetworkVulnerabilityScannerRoutes,
  createNetworkThreatIntelligenceRoutes,
  createNetworkSecurityComplianceRoutes,
  createNetworkIncidentResponderRoutes,
  createNetworkConfigManagerRoutes,
  createNetworkConfigBackupRoutes,
  createNetworkConfigComplianceRoutes,
  createNetworkTemplateManagerRoutes,
  createNetworkConfigAutomationRoutes,
  createNetworkConfigValidatorRoutes,
  createNetworkConfigRollbackRoutes,
  createNetworkOptimizationDashboardRoutes,
  createNetworkQosManagerRoutes,
  createNetworkLoadBalancerRoutes,
  createNetworkPerformanceTunerRoutes,
  createNetworkCongestionManagerRoutes,
  createNetworkCacheOptimizerRoutes,
  createNetworkResourceOptimizerRoutes,
  createNetworkComplianceDashboardRoutes,
  createNetworkAuditManagerRoutes,
  createNetworkPolicyEngineRoutes,
  createNetworkGovernancePortalRoutes,
  createNetworkComplianceReporterRoutes
} from './network-management/index.js';

export function createNetworkManagementRoutes(): Router {
  const router = Router();

  // Network Infrastructure Management Routes (12 modules)
  router.use('/network-infrastructure-dashboard', createNetworkInfrastructureDashboardRoutes());
  router.use('/network-topology-visualizer', createNetworkTopologyVisualizerRoutes());
  router.use('/network-device-inventory', createNetworkDeviceInventoryRoutes());
  router.use('/network-asset-tracker', createNetworkAssetTrackerRoutes());
  router.use('/network-capacity-planner', createNetworkCapacityPlannerRoutes());
  router.use('/network-change-manager', createNetworkChangeManagerRoutes());
  router.use('/network-deployment-automation', createNetworkDeploymentAutomationRoutes());
  router.use('/network-redundancy-analyzer', createNetworkRedundancyAnalyzerRoutes());
  router.use('/network-documentation-portal', createNetworkDocumentationPortalRoutes());
  router.use('/network-service-mapping', createNetworkServiceMappingRoutes());
  router.use('/network-lifecycle-manager', createNetworkLifecycleManagerRoutes());
  router.use('/network-integration-hub', createNetworkIntegrationHubRoutes());

  // Network Monitoring & Analytics Routes (10 modules)
  router.use('/network-performance-monitor', createNetworkPerformanceMonitorRoutes());
  router.use('/network-traffic-analyzer', createNetworkTrafficAnalyzerRoutes());
  router.use('/network-bandwidth-monitor', createNetworkBandwidthMonitorRoutes());
  router.use('/network-latency-tracker', createNetworkLatencyTrackerRoutes());
  router.use('/network-health-dashboard', createNetworkHealthDashboardRoutes());
  router.use('/network-anomaly-detector', createNetworkAnomalyDetectorRoutes());
  router.use('/network-metrics-collector', createNetworkMetricsCollectorRoutes());
  router.use('/network-alerting-engine', createNetworkAlertingEngineRoutes());
  router.use('/network-reporting-suite', createNetworkReportingSuiteRoutes());
  router.use('/network-predictive-analytics', createNetworkPredictiveAnalyticsRoutes());

  // Network Security Management Routes (8 modules)
  router.use('/network-security-dashboard', createNetworkSecurityDashboardRoutes());
  router.use('/network-firewall-manager', createNetworkFirewallManagerRoutes());
  router.use('/network-intrusion-detector', createNetworkIntrusionDetectorRoutes());
  router.use('/network-access-controller', createNetworkAccessControllerRoutes());
  router.use('/network-vulnerability-scanner', createNetworkVulnerabilityScannerRoutes());
  router.use('/network-threat-intelligence', createNetworkThreatIntelligenceRoutes());
  router.use('/network-security-compliance', createNetworkSecurityComplianceRoutes());
  router.use('/network-incident-responder', createNetworkIncidentResponderRoutes());

  // Network Configuration Management Routes (7 modules)
  router.use('/network-config-manager', createNetworkConfigManagerRoutes());
  router.use('/network-config-backup', createNetworkConfigBackupRoutes());
  router.use('/network-config-compliance', createNetworkConfigComplianceRoutes());
  router.use('/network-template-manager', createNetworkTemplateManagerRoutes());
  router.use('/network-config-automation', createNetworkConfigAutomationRoutes());
  router.use('/network-config-validator', createNetworkConfigValidatorRoutes());
  router.use('/network-config-rollback', createNetworkConfigRollbackRoutes());

  // Network Performance Optimization Routes (7 modules)
  router.use('/network-optimization-dashboard', createNetworkOptimizationDashboardRoutes());
  router.use('/network-qos-manager', createNetworkQosManagerRoutes());
  router.use('/network-load-balancer', createNetworkLoadBalancerRoutes());
  router.use('/network-performance-tuner', createNetworkPerformanceTunerRoutes());
  router.use('/network-congestion-manager', createNetworkCongestionManagerRoutes());
  router.use('/network-cache-optimizer', createNetworkCacheOptimizerRoutes());
  router.use('/network-resource-optimizer', createNetworkResourceOptimizerRoutes());

  // Network Compliance & Governance Routes (5 modules)
  router.use('/network-compliance-dashboard', createNetworkComplianceDashboardRoutes());
  router.use('/network-audit-manager', createNetworkAuditManagerRoutes());
  router.use('/network-policy-engine', createNetworkPolicyEngineRoutes());
  router.use('/network-governance-portal', createNetworkGovernancePortalRoutes());
  router.use('/network-compliance-reporter', createNetworkComplianceReporterRoutes());

  return router;
}