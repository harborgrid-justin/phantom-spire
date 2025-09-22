# API Routes Analysis Report

## Current State Analysis

### Models Available (55 total):
From `src/lib/models/index.ts`, we have 55 comprehensive models covering:

**CORE ML MODELS (8):**
- Dataset, DatasetColumn, SampleData, Experiment, TrainingHistory, MLModel, Deployment, MetricsData

**SECURITY INTELLIGENCE MODELS (14):**
- ThreatActor, ThreatIntelligence, Campaign, ThreatFeed, CVE, IOC, MalwareSample
- MitreTactic, MitreTechnique, MitreSubtechnique, Incident, Alert, User, Project

**PHANTOM-CORE MODELS (5):**
- PhantomCore, XDREvent, ReputationScore, ForensicsEvidence, ComplianceCheck

**JUNCTION MODELS (5):**
- ThreatActorTactic, ThreatActorTechnique, ThreatActorCVE, IncidentIOC, IncidentCVE

**SYSTEM MODELS (3):**
- ApiKey, AuditLog, User

**ADVANCED CYBER THREAT INTELLIGENCE MODELS (20):**
- ThreatHunt, ThreatGroup, AttributionAnalysis, SandboxAnalysis, NetworkFlow
- EmailThreat, DomainIntelligence, CryptoWallet, ThreatSignature, VulnerabilityAssessment
- ThreatTrend, SecurityMetrics, RiskAssessment, ThreatExchange, CyberIncident
- ThreatVector, ThreatLandscape, DarkWebIntel, FileIntelligence, SecurityControl

### Existing API Routes (From src/app/api):
- ✅ abTesting/route.ts
- ✅ automl/ (execute, status)
- ✅ automlPipeline/route.ts
- ✅ dashboard/route.ts
- ✅ dataExplorer/route.ts
- ✅ datasets/route.ts
- ✅ deployments/route.ts
- ✅ experiments/route.ts
- ✅ explainableAi/route.ts
- ✅ featureEngineering/route.ts
- ✅ mitre/route.ts (+ integration, techniques)
- ✅ ml-core/ (activity, datasets, health, models, performance, predictions, status, train)
- ✅ modelBuilder/route.ts
- ✅ models/route.ts
- ✅ monitoring/route.ts
- ✅ phantom-cores/ (extensive set - compliance, crypto, cve, forensics, hunting, etc.)
- ✅ settings/route.ts
- ✅ threatIntelligence/route.ts
- ✅ training-orchestrator/route.ts

### MISSING API Routes (Critical gaps):

**Core Models Missing API Routes:**
1. ❌ /api/users (User management)
2. ❌ /api/projects (Project management)
3. ❌ /api/dataset-columns (DatasetColumn CRUD)
4. ❌ /api/sample-data (SampleData management)
5. ❌ /api/training-history (TrainingHistory tracking)
6. ❌ /api/metrics-data (MetricsData analysis)
7. ❌ /api/api-keys (ApiKey management)
8. ❌ /api/audit-logs (AuditLog tracking)

**Security Intelligence Missing:**
9. ❌ /api/threat-actors (ThreatActor CRUD)
10. ❌ /api/campaigns (Campaign management)
11. ❌ /api/threat-feeds (ThreatFeed management)
12. ❌ /api/cves (CVE management) - different from phantom-cores/cve
13. ❌ /api/iocs (IOC management)
14. ❌ /api/malware-samples (MalwareSample analysis)
15. ❌ /api/incidents (Incident management)
16. ❌ /api/alerts (Alert management)
17. ❌ /api/mitre-tactics (MitreTactic CRUD)
18. ❌ /api/mitre-techniques (MitreTechnique CRUD) - different from phantom-cores
19. ❌ /api/mitre-subtechniques (MitreSubtechnique CRUD)

**Advanced Cyber Threat Intelligence Missing (20 endpoints):**
20. ❌ /api/threat-hunts (ThreatHunt management)
21. ❌ /api/threat-groups (ThreatGroup management)
22. ❌ /api/attribution-analysis (AttributionAnalysis)
23. ❌ /api/sandbox-analysis (SandboxAnalysis)
24. ❌ /api/network-flows (NetworkFlow monitoring)
25. ❌ /api/email-threats (EmailThreat analysis)
26. ❌ /api/domain-intelligence (DomainIntelligence)
27. ❌ /api/crypto-wallets (CryptoWallet tracking)
28. ❌ /api/threat-signatures (ThreatSignature management)
29. ❌ /api/vulnerability-assessments (VulnerabilityAssessment)
30. ❌ /api/threat-trends (ThreatTrend analysis)
31. ❌ /api/security-metrics (SecurityMetrics tracking)
32. ❌ /api/risk-assessments (RiskAssessment management)
33. ❌ /api/threat-exchange (ThreatExchange integration)
34. ❌ /api/cyber-incidents (CyberIncident management)
35. ❌ /api/threat-vectors (ThreatVector analysis)
36. ❌ /api/threat-landscapes (ThreatLandscape mapping)
37. ❌ /api/dark-web-intel (DarkWebIntel monitoring)
38. ❌ /api/file-intelligence (FileIntelligence analysis)
39. ❌ /api/security-controls (SecurityControl management)

**Junction Table APIs (5 endpoints):**
40. ❌ /api/threat-actor-tactics (ThreatActorTactic relationships)
41. ❌ /api/threat-actor-techniques (ThreatActorTechnique relationships)
42. ❌ /api/threat-actor-cves (ThreatActorCVE relationships)
43. ❌ /api/incident-iocs (IncidentIOC relationships)
44. ❌ /api/incident-cves (IncidentCVE relationships)

**Phantom-Core Models Missing Direct APIs:**
45. ❌ /api/phantom-cores (PhantomCore management) - exists but may need enhancement
46. ❌ /api/xdr-events (XDREvent management)
47. ❌ /api/reputation-scores (ReputationScore management)
48. ❌ /api/forensics-evidence (ForensicsEvidence management)
49. ❌ /api/compliance-checks (ComplianceCheck management)

## Swagger/OpenAPI Integration Status:
- ❌ No existing Swagger/OpenAPI configuration found
- ❌ No API documentation endpoint (/api/docs)
- ❌ No OpenAPI schema generation
- ❌ No Swagger UI integration

## Recommendations:

### Phase 1: Critical Core APIs
1. Add Swagger/OpenAPI infrastructure
2. Create missing User/Project/API management endpoints
3. Add security intelligence core endpoints (ThreatActor, CVE, IOC, etc.)

### Phase 2: Advanced Intelligence APIs
4. Implement 20 advanced cyber threat intelligence endpoints
5. Add junction table relationship APIs
6. Enhance phantom-core direct APIs

### Phase 3: Integration & Testing
7. Complete Swagger documentation for all endpoints
8. Add comprehensive API testing
9. Implement rate limiting and security
10. Add API versioning strategy

## Swagger Integration Plan:
1. Install swagger-ui-next and openapi3-ts
2. Create OpenAPI schema definitions for all models
3. Add API documentation route at /api/docs
4. Implement automatic schema generation
5. Add request/response validation
6. Create comprehensive API documentation
