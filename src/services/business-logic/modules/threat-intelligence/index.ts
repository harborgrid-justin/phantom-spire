/**
 * Threat Intelligence Business Logic Services Index
 * Exports all threat intelligence business logic services
 */

export { ThreatAnalyticsBusinessLogic } from './ThreatAnalyticsBusinessLogic';
export { IntelligenceDashboardBusinessLogic } from './IntelligenceDashboardBusinessLogic';
export { IocCorrelationBusinessLogic } from './IocCorrelationBusinessLogic';
export { ActorAttributionBusinessLogic } from './ActorAttributionBusinessLogic';
export { CampaignAnalysisBusinessLogic } from './CampaignAnalysisBusinessLogic';
export { LandscapeAssessmentBusinessLogic } from './LandscapeAssessmentBusinessLogic';
export { VulnerabilityMappingBusinessLogic } from './VulnerabilityMappingBusinessLogic';
export { PredictiveModelingBusinessLogic } from './PredictiveModelingBusinessLogic';
export { LifecycleManagementBusinessLogic } from './LifecycleManagementBusinessLogic';
export { EnrichmentServiceBusinessLogic } from './EnrichmentServiceBusinessLogic';
export { ValidationSystemBusinessLogic } from './ValidationSystemBusinessLogic';
export { InvestigationToolsBusinessLogic } from './InvestigationToolsBusinessLogic';
export { ReputationScoringBusinessLogic } from './ReputationScoringBusinessLogic';
export { RelationshipMappingBusinessLogic } from './RelationshipMappingBusinessLogic';
export { SourceManagementBusinessLogic } from './SourceManagementBusinessLogic';
export { ExportImportHubBusinessLogic } from './ExportImportHubBusinessLogic';
export { ActorProfilesBusinessLogic } from './ActorProfilesBusinessLogic';
export { AttributionAnalyticsBusinessLogic } from './AttributionAnalyticsBusinessLogic';
export { ActorTrackingBusinessLogic } from './ActorTrackingBusinessLogic';
export { CapabilityAssessmentBusinessLogic } from './CapabilityAssessmentBusinessLogic';
export { ConfidenceScoringBusinessLogic } from './ConfidenceScoringBusinessLogic';
export { CollaborationNetworksBusinessLogic } from './CollaborationNetworksBusinessLogic';
export { CampaignMappingBusinessLogic } from './CampaignMappingBusinessLogic';
export { IntelligenceFeedsBusinessLogic } from './IntelligenceFeedsBusinessLogic';
export { IntelligenceSharingBusinessLogic } from './IntelligenceSharingBusinessLogic';
export { CollectionManagementBusinessLogic } from './CollectionManagementBusinessLogic';
export { AutomationEngineBusinessLogic } from './AutomationEngineBusinessLogic';
export { RealtimeMonitoringBusinessLogic } from './RealtimeMonitoringBusinessLogic';
export { WorkflowEngineBusinessLogic } from './WorkflowEngineBusinessLogic';
export { SourceManagementBusinessLogic } from './SourceManagementBusinessLogic';
export { ApiManagementBusinessLogic } from './ApiManagementBusinessLogic';
export { TrainingCenterBusinessLogic } from './TrainingCenterBusinessLogic';
export { ProactiveHuntingBusinessLogic } from './ProactiveHuntingBusinessLogic';
export { BehavioralAnalyticsBusinessLogic } from './BehavioralAnalyticsBusinessLogic';
export { HuntingPlaybooksBusinessLogic } from './HuntingPlaybooksBusinessLogic';
export { IncidentResponseBusinessLogic } from './IncidentResponseBusinessLogic';
export { ForensicAnalysisBusinessLogic } from './ForensicAnalysisBusinessLogic';
export { ThreatSimulationBusinessLogic } from './ThreatSimulationBusinessLogic';
export { CompromiseAssessmentBusinessLogic } from './CompromiseAssessmentBusinessLogic';
export { ResponseAutomationBusinessLogic } from './ResponseAutomationBusinessLogic';
export { MlDetectionBusinessLogic } from './MlDetectionBusinessLogic';
export { ZeroDayProtectionBusinessLogic } from './ZeroDayProtectionBusinessLogic';
export { SandboxAnalysisBusinessLogic } from './SandboxAnalysisBusinessLogic';
export { NetworkMonitoringBusinessLogic } from './NetworkMonitoringBusinessLogic';
export { EndpointProtectionBusinessLogic } from './EndpointProtectionBusinessLogic';
export { ThreatPreventionBusinessLogic } from './ThreatPreventionBusinessLogic';
export { SignatureEngineBusinessLogic } from './SignatureEngineBusinessLogic';
export { ThreatScoringBusinessLogic } from './ThreatScoringBusinessLogic';

// Convenience exports by category
export const AdvancedAnalyticsServices = {
  ThreatAnalytics: ThreatAnalyticsBusinessLogic,
  IntelligenceDashboard: IntelligenceDashboardBusinessLogic,
  IocCorrelation: IocCorrelationBusinessLogic,
  ActorAttribution: ActorAttributionBusinessLogic,
  CampaignAnalysis: CampaignAnalysisBusinessLogic,
  LandscapeAssessment: LandscapeAssessmentBusinessLogic,
  VulnerabilityMapping: VulnerabilityMappingBusinessLogic,
  PredictiveModeling: PredictiveModelingBusinessLogic,
};

export const IOCManagementServices = {
  LifecycleManagement: LifecycleManagementBusinessLogic,
  EnrichmentService: EnrichmentServiceBusinessLogic,
  ValidationSystem: ValidationSystemBusinessLogic,
  InvestigationTools: InvestigationToolsBusinessLogic,
  ReputationScoring: ReputationScoringBusinessLogic,
  RelationshipMapping: RelationshipMappingBusinessLogic,
  SourceManagement: SourceManagementBusinessLogic,
  ExportImportHub: ExportImportHubBusinessLogic,
};

export const ThreatActorServices = {
  ActorProfiles: ActorProfilesBusinessLogic,
  AttributionAnalytics: AttributionAnalyticsBusinessLogic,
  ActorTracking: ActorTrackingBusinessLogic,
  CapabilityAssessment: CapabilityAssessmentBusinessLogic,
  ConfidenceScoring: ConfidenceScoringBusinessLogic,
  CollaborationNetworks: CollaborationNetworksBusinessLogic,
  CampaignMapping: CampaignMappingBusinessLogic,
  IntelligenceFeeds: IntelligenceFeedsBusinessLogic,
};

export const IntelOperationsServices = {
  IntelligenceSharing: IntelligenceSharingBusinessLogic,
  CollectionManagement: CollectionManagementBusinessLogic,
  AutomationEngine: AutomationEngineBusinessLogic,
  RealtimeMonitoring: RealtimeMonitoringBusinessLogic,
  WorkflowEngine: WorkflowEngineBusinessLogic,
  SourceManagement: SourceManagementBusinessLogic,
  ApiManagement: ApiManagementBusinessLogic,
  TrainingCenter: TrainingCenterBusinessLogic,
};

export const ThreatHuntingServices = {
  ProactiveHunting: ProactiveHuntingBusinessLogic,
  BehavioralAnalytics: BehavioralAnalyticsBusinessLogic,
  HuntingPlaybooks: HuntingPlaybooksBusinessLogic,
  IncidentResponse: IncidentResponseBusinessLogic,
  ForensicAnalysis: ForensicAnalysisBusinessLogic,
  ThreatSimulation: ThreatSimulationBusinessLogic,
  CompromiseAssessment: CompromiseAssessmentBusinessLogic,
  ResponseAutomation: ResponseAutomationBusinessLogic,
};

export const ThreatDetectionServices = {
  MlDetection: MlDetectionBusinessLogic,
  ZeroDayProtection: ZeroDayProtectionBusinessLogic,
  SandboxAnalysis: SandboxAnalysisBusinessLogic,
  NetworkMonitoring: NetworkMonitoringBusinessLogic,
  EndpointProtection: EndpointProtectionBusinessLogic,
  ThreatPrevention: ThreatPreventionBusinessLogic,
  SignatureEngine: SignatureEngineBusinessLogic,
  ThreatScoring: ThreatScoringBusinessLogic,
};

// All services collection
export const AllThreatIntelligenceServices = {
  ...AdvancedAnalyticsServices,
  ...IOCManagementServices,
  ...ThreatActorServices,
  ...IntelOperationsServices,
  ...ThreatHuntingServices,
  ...ThreatDetectionServices
};
