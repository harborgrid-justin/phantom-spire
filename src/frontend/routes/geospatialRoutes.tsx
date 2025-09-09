/**
 * Geospatial Routes Configuration
 * Auto-generated routes for 47 geospatial pages
 */

import { RouteObject } from 'react-router-dom';

// Import all geospatial components
import InteractiveMappingDashboardComponent from '../views/geospatial/mapping/InteractiveMappingDashboardComponent';
import GeographicThreatVisualizationComponent from '../views/geospatial/mapping/GeographicThreatVisualizationComponent';
import AssetLocationMappingComponent from '../views/geospatial/mapping/AssetLocationMappingComponent';
import IncidentGeographicCorrelationComponent from '../views/geospatial/mapping/IncidentGeographicCorrelationComponent';
import HeatMapAnalyticsComponent from '../views/geospatial/mapping/HeatMapAnalyticsComponent';
import GeofencingManagementComponent from '../views/geospatial/mapping/GeofencingManagementComponent';
import SatelliteImageryIntegrationComponent from '../views/geospatial/mapping/SatelliteImageryIntegrationComponent';
import CustomMapLayersComponent from '../views/geospatial/mapping/CustomMapLayersComponent';
import IpGeolocationTrackingComponent from '../views/geospatial/intelligence/IpGeolocationTrackingComponent';
import ThreatActorGeographicProfilingComponent from '../views/geospatial/intelligence/ThreatActorGeographicProfilingComponent';
import CampaignGeographicAnalysisComponent from '../views/geospatial/intelligence/CampaignGeographicAnalysisComponent';
import RegionalThreatAssessmentComponent from '../views/geospatial/intelligence/RegionalThreatAssessmentComponent';
import CrossBorderThreatTrackingComponent from '../views/geospatial/intelligence/CrossBorderThreatTrackingComponent';
import GeopoliticalRiskAnalysisComponent from '../views/geospatial/intelligence/GeopoliticalRiskAnalysisComponent';
import LocationBasedAlertsComponent from '../views/geospatial/intelligence/LocationBasedAlertsComponent';
import IntelligenceFusionCenterComponent from '../views/geospatial/intelligence/IntelligenceFusionCenterComponent';
import SpatialPatternRecognitionComponent from '../views/geospatial/analytics/SpatialPatternRecognitionComponent';
import GeographicClusteringAnalysisComponent from '../views/geospatial/analytics/GeographicClusteringAnalysisComponent';
import ProximityAnalysisEngineComponent from '../views/geospatial/analytics/ProximityAnalysisEngineComponent';
import TemporalSpatialCorrelationComponent from '../views/geospatial/analytics/TemporalSpatialCorrelationComponent';
import DensityAnalysisPlatformComponent from '../views/geospatial/analytics/DensityAnalysisPlatformComponent';
import SpatialAnomalyDetectionComponent from '../views/geospatial/analytics/SpatialAnomalyDetectionComponent';
import NetworkTopologyMappingComponent from '../views/geospatial/analytics/NetworkTopologyMappingComponent';
import PredictiveGeographicModelingComponent from '../views/geospatial/analytics/PredictiveGeographicModelingComponent';
import GlobalAssetInventoryComponent from '../views/geospatial/tracking/GlobalAssetInventoryComponent';
import InfrastructureMappingComponent from '../views/geospatial/tracking/InfrastructureMappingComponent';
import MobileDeviceTrackingComponent from '../views/geospatial/tracking/MobileDeviceTrackingComponent';
import IotDeviceGeolocationComponent from '../views/geospatial/tracking/IotDeviceGeolocationComponent';
import SupplyChainGeographicMonitoringComponent from '../views/geospatial/tracking/SupplyChainGeographicMonitoringComponent';
import FacilitySecurityMappingComponent from '../views/geospatial/tracking/FacilitySecurityMappingComponent';
import VehicleFleetTrackingComponent from '../views/geospatial/tracking/VehicleFleetTrackingComponent';
import PersonnelLocationServicesComponent from '../views/geospatial/tracking/PersonnelLocationServicesComponent';
import AttackSurfaceGeographyComponent from '../views/geospatial/threats/AttackSurfaceGeographyComponent';
import MalwareGeographicDistributionComponent from '../views/geospatial/threats/MalwareGeographicDistributionComponent';
import BotnetGeographicTrackingComponent from '../views/geospatial/threats/BotnetGeographicTrackingComponent';
import PhishingCampaignGeographyComponent from '../views/geospatial/threats/PhishingCampaignGeographyComponent';
import RansomwareGeographicIntelligenceComponent from '../views/geospatial/threats/RansomwareGeographicIntelligenceComponent';
import AptGeographicAttributionComponent from '../views/geospatial/threats/AptGeographicAttributionComponent';
import DarkWebGeographicMappingComponent from '../views/geospatial/threats/DarkWebGeographicMappingComponent';
import RegulatoryComplianceMappingComponent from '../views/geospatial/compliance/RegulatoryComplianceMappingComponent';
import DataSovereigntyManagementComponent from '../views/geospatial/compliance/DataSovereigntyManagementComponent';
import CrossBorderDataFlowsComponent from '../views/geospatial/compliance/CrossBorderDataFlowsComponent';
import JurisdictionRiskAssessmentComponent from '../views/geospatial/compliance/JurisdictionRiskAssessmentComponent';
import GeographicAuditTrailsComponent from '../views/geospatial/compliance/GeographicAuditTrailsComponent';
import PrivacyRegulationComplianceComponent from '../views/geospatial/compliance/PrivacyRegulationComplianceComponent';
import SanctionsScreeningGeographyComponent from '../views/geospatial/compliance/SanctionsScreeningGeographyComponent';
import RegionalSecurityStandardsComponent from '../views/geospatial/compliance/RegionalSecurityStandardsComponent';

export const geospatialRoutes: RouteObject[] = [
  {
    path: '/mapping/dashboard',
    element: <InteractiveMappingDashboardComponent />,
    index: false
  },
  {
    path: '/mapping/threats',
    element: <GeographicThreatVisualizationComponent />,
    index: false
  },
  {
    path: '/mapping/assets',
    element: <AssetLocationMappingComponent />,
    index: false
  },
  {
    path: '/mapping/incidents',
    element: <IncidentGeographicCorrelationComponent />,
    index: false
  },
  {
    path: '/mapping/heatmaps',
    element: <HeatMapAnalyticsComponent />,
    index: false
  },
  {
    path: '/mapping/geofencing',
    element: <GeofencingManagementComponent />,
    index: false
  },
  {
    path: '/mapping/satellite',
    element: <SatelliteImageryIntegrationComponent />,
    index: false
  },
  {
    path: '/mapping/layers',
    element: <CustomMapLayersComponent />,
    index: false
  },
  {
    path: '/intelligence/ip-geo',
    element: <IpGeolocationTrackingComponent />,
    index: false
  },
  {
    path: '/intelligence/actor-profiling',
    element: <ThreatActorGeographicProfilingComponent />,
    index: false
  },
  {
    path: '/intelligence/campaigns',
    element: <CampaignGeographicAnalysisComponent />,
    index: false
  },
  {
    path: '/intelligence/regional',
    element: <RegionalThreatAssessmentComponent />,
    index: false
  },
  {
    path: '/intelligence/cross-border',
    element: <CrossBorderThreatTrackingComponent />,
    index: false
  },
  {
    path: '/intelligence/geopolitical',
    element: <GeopoliticalRiskAnalysisComponent />,
    index: false
  },
  {
    path: '/intelligence/alerts',
    element: <LocationBasedAlertsComponent />,
    index: false
  },
  {
    path: '/intelligence/fusion',
    element: <IntelligenceFusionCenterComponent />,
    index: false
  },
  {
    path: '/analytics/patterns',
    element: <SpatialPatternRecognitionComponent />,
    index: false
  },
  {
    path: '/analytics/clustering',
    element: <GeographicClusteringAnalysisComponent />,
    index: false
  },
  {
    path: '/analytics/proximity',
    element: <ProximityAnalysisEngineComponent />,
    index: false
  },
  {
    path: '/analytics/temporal',
    element: <TemporalSpatialCorrelationComponent />,
    index: false
  },
  {
    path: '/analytics/density',
    element: <DensityAnalysisPlatformComponent />,
    index: false
  },
  {
    path: '/analytics/anomalies',
    element: <SpatialAnomalyDetectionComponent />,
    index: false
  },
  {
    path: '/analytics/topology',
    element: <NetworkTopologyMappingComponent />,
    index: false
  },
  {
    path: '/analytics/predictive',
    element: <PredictiveGeographicModelingComponent />,
    index: false
  },
  {
    path: '/tracking/inventory',
    element: <GlobalAssetInventoryComponent />,
    index: false
  },
  {
    path: '/tracking/infrastructure',
    element: <InfrastructureMappingComponent />,
    index: false
  },
  {
    path: '/tracking/mobile',
    element: <MobileDeviceTrackingComponent />,
    index: false
  },
  {
    path: '/tracking/iot',
    element: <IotDeviceGeolocationComponent />,
    index: false
  },
  {
    path: '/tracking/supply-chain',
    element: <SupplyChainGeographicMonitoringComponent />,
    index: false
  },
  {
    path: '/tracking/facilities',
    element: <FacilitySecurityMappingComponent />,
    index: false
  },
  {
    path: '/tracking/fleet',
    element: <VehicleFleetTrackingComponent />,
    index: false
  },
  {
    path: '/tracking/personnel',
    element: <PersonnelLocationServicesComponent />,
    index: false
  },
  {
    path: '/threats/attack-surface',
    element: <AttackSurfaceGeographyComponent />,
    index: false
  },
  {
    path: '/threats/malware-geo',
    element: <MalwareGeographicDistributionComponent />,
    index: false
  },
  {
    path: '/threats/botnets',
    element: <BotnetGeographicTrackingComponent />,
    index: false
  },
  {
    path: '/threats/phishing-geo',
    element: <PhishingCampaignGeographyComponent />,
    index: false
  },
  {
    path: '/threats/ransomware-geo',
    element: <RansomwareGeographicIntelligenceComponent />,
    index: false
  },
  {
    path: '/threats/apt-geo',
    element: <AptGeographicAttributionComponent />,
    index: false
  },
  {
    path: '/threats/darkweb-geo',
    element: <DarkWebGeographicMappingComponent />,
    index: false
  },
  {
    path: '/compliance/regulatory',
    element: <RegulatoryComplianceMappingComponent />,
    index: false
  },
  {
    path: '/compliance/sovereignty',
    element: <DataSovereigntyManagementComponent />,
    index: false
  },
  {
    path: '/compliance/data-flows',
    element: <CrossBorderDataFlowsComponent />,
    index: false
  },
  {
    path: '/compliance/jurisdiction',
    element: <JurisdictionRiskAssessmentComponent />,
    index: false
  },
  {
    path: '/compliance/audit-trails',
    element: <GeographicAuditTrailsComponent />,
    index: false
  },
  {
    path: '/compliance/privacy',
    element: <PrivacyRegulationComplianceComponent />,
    index: false
  },
  {
    path: '/compliance/sanctions',
    element: <SanctionsScreeningGeographyComponent />,
    index: false
  },
  {
    path: '/compliance/standards',
    element: <RegionalSecurityStandardsComponent />,
    index: false
  }
];

export const geospatialPages = [
  {
    name: 'interactive-mapping-dashboard',
    title: '🗺️ Interactive Mapping Dashboard',
    description: 'Real-time interactive maps with threat intelligence overlay',
    category: 'mapping',
    endpoint: '/mapping/dashboard',
    icon: '🗺️'
  },
  {
    name: 'geographic-threat-visualization',
    title: '🌍 Geographic Threat Visualization',
    description: 'Visual threat intelligence mapped to geographic locations',
    category: 'mapping',
    endpoint: '/mapping/threats',
    icon: '🌍'
  },
  // ... (additional 45 pages - truncated for brevity)
];

export default geospatialRoutes;