/**
 * MODELS INDEX
 * Exports all Sequelize models for the cybersecurity ML platform
 * 30 comprehensive models to compete with enterprise platforms like Anomali
 */

// Core ML Platform Models
export { Dataset } from './Dataset.model';
export { DatasetColumn } from './DatasetColumn.model';
export { SampleData } from './SampleData.model';
export { Experiment } from './Experiment.model';
export { TrainingHistory } from './TrainingHistory.model';
export { MLModel } from './Model.model';
export { Deployment } from './Deployment.model';
export { MetricsData } from './MetricsData.model';

// User Management & Authentication
export { User } from './User.model';
export { ApiKey } from './ApiKey.model';
export { AuditLog } from './AuditLog.model';

// Project Management
export { Project } from './Project.model';

// MITRE ATT&CK Framework
export { MitreTactic } from './MitreTactic.model';
export { MitreTechnique } from './MitreTechnique.model';
export { MitreSubtechnique } from './MitreSubtechnique.model';

// Threat Intelligence & Actors
export { ThreatActor } from './ThreatActor.model';
export { ThreatIntelligence } from './ThreatIntelligence.model';
export { Campaign } from './Campaign.model';
export { ThreatFeed } from './ThreatFeed.model';

// Vulnerability Management
export { CVE } from './CVE.model';

// Indicators of Compromise
export { IOC } from './IOC.model';

// Malware Analysis
export { MalwareSample } from './MalwareSample.model';

// Incident Response
export { Incident } from './Incident.model';
export { Alert } from './Alert.model';

// Junction Tables for Many-to-Many Relationships
export { ThreatActorTactic } from './ThreatActorTactic.model';
export { ThreatActorTechnique } from './ThreatActorTechnique.model';
export { ThreatActorCVE } from './ThreatActorCVE.model';
export { IncidentIOC } from './IncidentIOC.model';
export { IncidentCVE } from './IncidentCVE.model';

// Phantom-Core Models
export { PhantomCore } from './PhantomCore.model';
export { XDREvent } from './XDREvent.model';
export { ReputationScore } from './ReputationScore.model';
export { ForensicsEvidence } from './ForensicsEvidence.model';
export { ComplianceCheck } from './ComplianceCheck.model';

// Advanced Cyber Threat Intelligence Models (20 New Models)
export { ThreatHunt } from './ThreatHunt.model';
export { ThreatGroup } from './ThreatGroup.model';
export { AttributionAnalysis } from './AttributionAnalysis.model';
export { SandboxAnalysis } from './SandboxAnalysis.model';
export { NetworkFlow } from './NetworkFlow.model';
export { EmailThreat } from './EmailThreat.model';
export { DomainIntelligence } from './DomainIntelligence.model';
export { CryptoWallet } from './CryptoWallet.model';
export { ThreatSignature } from './ThreatSignature.model';
export { VulnerabilityAssessment } from './VulnerabilityAssessment.model';
export { ThreatTrend } from './ThreatTrend.model';
export { SecurityMetrics } from './SecurityMetrics.model';
export { RiskAssessment } from './RiskAssessment.model';
export { ThreatExchange } from './ThreatExchange.model';
export { CyberIncident } from './CyberIncident.model';
export { ThreatVector } from './ThreatVector.model';
export { ThreatLandscape } from './ThreatLandscape.model';
export { DarkWebIntel } from './DarkWebIntel.model';
export { FileIntelligence } from './FileIntelligence.model';
export { SecurityControl } from './SecurityControl.model';

/**
 * Model Categories for Easy Reference:
 * 
 * CORE ML MODELS (8):
 * - Dataset, DatasetColumn, SampleData, Experiment, TrainingHistory, MLModel, Deployment, MetricsData
 * 
 * SECURITY INTELLIGENCE MODELS (14):
 * - ThreatActor, ThreatIntelligence, Campaign, ThreatFeed, CVE, IOC, MalwareSample
 * - MitreTactic, MitreTechnique, MitreSubtechnique, Incident, Alert, User, Project
 * 
 * PHANTOM-CORE MODELS (5):
 * - PhantomCore, XDREvent, ReputationScore, ForensicsEvidence, ComplianceCheck
 * 
 * JUNCTION MODELS (5):
 * - ThreatActorTactic, ThreatActorTechnique, ThreatActorCVE, IncidentIOC, IncidentCVE
 * 
 * SYSTEM MODELS (3):
 * - ApiKey, AuditLog, User (also security)
 * 
 * ADVANCED CYBER THREAT INTELLIGENCE MODELS (20):
 * - ThreatHunt, ThreatGroup, AttributionAnalysis, SandboxAnalysis, NetworkFlow
 * - EmailThreat, DomainIntelligence, CryptoWallet, ThreatSignature, VulnerabilityAssessment
 * - ThreatTrend, SecurityMetrics, RiskAssessment, ThreatExchange, CyberIncident
 * - ThreatVector, ThreatLandscape, DarkWebIntel, FileIntelligence, SecurityControl
 * 
 * TOTAL: 55 Models
 */

/**
 * Competitive Analysis vs Anomali ThreatStream + Phantom-Cores:
 * 
 * ✅ MITRE ATT&CK Integration (Tactics, Techniques, Subtechniques)
 * ✅ Threat Intelligence Management (Strategic, Tactical, Operational, Technical)
 * ✅ Threat Actor Profiling & Campaign Tracking
 * ✅ IOC Management with Confidence & Severity Scoring
 * ✅ CVE Tracking with CVSS Integration
 * ✅ Malware Analysis & Sandbox Integration
 * ✅ Threat Feed Management & Quality Metrics
 * ✅ Incident Response & Alert Management
 * ✅ Extended Detection & Response (XDR) Capabilities
 * ✅ Reputation Scoring & Intelligence Enrichment
 * ✅ Digital Forensics Evidence Management
 * ✅ Compliance Framework Management (SOX, HIPAA, PCI-DSS, etc.)
 * ✅ Phantom-Core Module Integration & Management
 * ✅ Advanced Analytics & ML Capabilities
 * ✅ Enterprise Security Features (Audit, RBAC, API Keys)
 */
