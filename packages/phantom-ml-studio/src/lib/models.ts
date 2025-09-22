/**
 * MODELS REGISTRATION AND ASSOCIATIONS
 * Central place to register all Sequelize models and set up associations
 */
import { ModelCtor, Model } from 'sequelize-typescript';

// Import all models
import { Dataset } from './models/Dataset.model';
import { DatasetColumn } from './models/DatasetColumn.model';
import { SampleData } from './models/SampleData.model';
import { Experiment } from './models/Experiment.model';
import { TrainingHistory } from './models/TrainingHistory.model';
import { MLModel } from './models/Model.model';
import { Deployment } from './models/Deployment.model';
import { MetricsData } from './models/MetricsData.model';
import { User } from './models/User.model';
import { ApiKey } from './models/ApiKey.model';
import { AuditLog } from './models/AuditLog.model';
import { Project } from './models/Project.model';
import { MitreTactic } from './models/MitreTactic.model';
import { MitreTechnique } from './models/MitreTechnique.model';
import { MitreSubtechnique } from './models/MitreSubtechnique.model';
import { ThreatActor } from './models/ThreatActor.model';
import { ThreatIntelligence } from './models/ThreatIntelligence.model';
import { Campaign } from './models/Campaign.model';
import { ThreatFeed } from './models/ThreatFeed.model';
import { CVE } from './models/CVE.model';
import { IOC } from './models/IOC.model';
import { MalwareSample } from './models/MalwareSample.model';
import { Incident } from './models/Incident.model';
import { Alert } from './models/Alert.model';
import { ThreatActorTactic } from './models/ThreatActorTactic.model';
import { ThreatActorTechnique } from './models/ThreatActorTechnique.model';
import { ThreatActorCVE } from './models/ThreatActorCVE.model';
import { IncidentIOC } from './models/IncidentIOC.model';
import { IncidentCVE } from './models/IncidentCVE.model';
import { PhantomCore } from './models/PhantomCore.model';
import { XDREvent } from './models/XDREvent.model';
import { ReputationScore } from './models/ReputationScore.model';
import { ForensicsEvidence } from './models/ForensicsEvidence.model';
import { ComplianceCheck } from './models/ComplianceCheck.model';
import { ThreatHunt } from './models/ThreatHunt.model';
import { ThreatGroup } from './models/ThreatGroup.model';
import { AttributionAnalysis } from './models/AttributionAnalysis.model';
import { SandboxAnalysis } from './models/SandboxAnalysis.model';
import { NetworkFlow } from './models/NetworkFlow.model';
import { EmailThreat } from './models/EmailThreat.model';
import { DomainIntelligence } from './models/DomainIntelligence.model';
import { CryptoWallet } from './models/CryptoWallet.model';
import { ThreatSignature } from './models/ThreatSignature.model';
import { VulnerabilityAssessment } from './models/VulnerabilityAssessment.model';
import { ThreatTrend } from './models/ThreatTrend.model';
import { SecurityMetrics } from './models/SecurityMetrics.model';
import { RiskAssessment } from './models/RiskAssessment.model';
import { ThreatExchange } from './models/ThreatExchange.model';
import { CyberIncident } from './models/CyberIncident.model';
import { ThreatVector } from './models/ThreatVector.model';
import { ThreatLandscape } from './models/ThreatLandscape.model';
import { DarkWebIntel } from './models/DarkWebIntel.model';
import { FileIntelligence } from './models/FileIntelligence.model';
import { SecurityControl } from './models/SecurityControl.model';

/**
 * Array of all model classes for Sequelize registration
 * SQ.7: Models are registered with Sequelize using addModels([...])
 */
export const models: ModelCtor<Model>[] = [
  // Core ML Platform Models
  Dataset,
  DatasetColumn,
  SampleData,
  Experiment,
  TrainingHistory,
  MLModel,
  Deployment,
  MetricsData,
  
  // User Management & Authentication
  User,
  ApiKey,
  AuditLog,
  
  // Project Management
  Project,
  
  // MITRE ATT&CK Framework
  MitreTactic,
  MitreTechnique,
  MitreSubtechnique,
  
  // Threat Intelligence & Actors
  ThreatActor,
  ThreatIntelligence,
  Campaign,
  ThreatFeed,
  
  // Vulnerability Management
  CVE,
  
  // Indicators of Compromise
  IOC,
  
  // Malware Analysis
  MalwareSample,
  
  // Incident Response
  Incident,
  Alert,
  
  // Junction Tables for Many-to-Many Relationships
  ThreatActorTactic,
  ThreatActorTechnique,
  ThreatActorCVE,
  IncidentIOC,
  IncidentCVE,
  
  // Phantom-Core Models
  PhantomCore,
  XDREvent,
  ReputationScore,
  ForensicsEvidence,
  ComplianceCheck,
  
  // Advanced Cyber Threat Intelligence Models
  ThreatHunt,
  ThreatGroup,
  AttributionAnalysis,
  SandboxAnalysis,
  NetworkFlow,
  EmailThreat,
  DomainIntelligence,
  CryptoWallet,
  ThreatSignature,
  VulnerabilityAssessment,
  ThreatTrend,
  SecurityMetrics,
  RiskAssessment,
  ThreatExchange,
  CyberIncident,
  ThreatVector,
  ThreatLandscape,
  DarkWebIntel,
  FileIntelligence,
  SecurityControl
];

/**
 * Set up model associations
 * This function is called after Sequelize initialization to establish relationships
 */
export function setupAssociations(): void {
  console.log('🔗 Setting up model associations...');
  
  // Note: Most associations are already defined in individual model files using decorators
  // This function can be used for any additional programmatic association setup if needed
  
  console.log('✅ Model associations set up successfully');
}

/**
 * Get all model names for debugging and introspection
 */
export function getModelNames(): string[] {
  return models.map(model => model.name);
}

/**
 * Validate that all models are properly typed and exported
 */
export function validateModels(): void {
  models.forEach((model, index) => {
    if (!model.name) {
      throw new Error(`Model at index ${index} is missing a name property`);
    }
    
    if (typeof model !== 'function') {
      throw new Error(`Model ${model.name} is not a proper class constructor`);
    }
  });
  
  console.log(`✅ All ${models.length} models validated successfully`);
}
