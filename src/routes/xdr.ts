/**
 * XDR (Extended Detection and Response) Routes
 * Comprehensive routing for 49 XDR-related endpoints
 */

import { Router } from 'express';
import { XDRController } from '../controllers/xdr/xdrController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all XDR routes
router.use(authMiddleware);

/**
 * Core XDR Detection and Response Routes (1-10)
 */

// 1. XDR Detection Engine
router.get('/detection/analysis', XDRController.getDetectionAnalysis);
router.post('/detection/analyze', XDRController.getDetectionAnalysis);

// 2. XDR Incident Response
router.get('/incidents', XDRController.manageIncidents);
router.post('/incidents', XDRController.manageIncidents);
router.put('/incidents/:id', XDRController.manageIncidents);
router.delete('/incidents/:id', XDRController.manageIncidents);

// 3. XDR Threat Hunting
router.post('/threat-hunting/execute', XDRController.executeThreatHunt);
router.get('/threat-hunting/results', XDRController.executeThreatHunt);

// 4. XDR Analytics Dashboard
router.get('/dashboard', XDRController.getDashboardData);
router.get('/dashboard/metrics', XDRController.getDashboardData);

// 5. XDR Configuration
router.get('/configuration', XDRController.manageConfiguration);
router.post('/configuration', XDRController.manageConfiguration);
router.put('/configuration', XDRController.manageConfiguration);

// 6. XDR Real-time Monitoring
router.get('/monitoring/realtime', XDRController.getRealtimeMonitoring);
router.get('/monitoring/events', XDRController.getRealtimeMonitoring);

// 7. XDR Alert Management
router.get('/alerts', XDRController.manageAlerts);
router.post('/alerts', XDRController.manageAlerts);
router.put('/alerts/:id', XDRController.manageAlerts);
router.delete('/alerts/:id', XDRController.manageAlerts);

// 8. XDR Asset Discovery
router.get('/assets/discover', XDRController.discoverAssets);
router.post('/assets/scan', XDRController.discoverAssets);

// 9. XDR Behavioral Analytics
router.post('/behavior/analyze', XDRController.analyzeBehavior);
router.get('/behavior/patterns', XDRController.analyzeBehavior);

// 10. XDR Compliance Monitoring
router.get('/compliance', XDRController.monitorCompliance);
router.get('/compliance/status', XDRController.monitorCompliance);

/**
 * Extended XDR Security Routes (11-25)
 */

// 11. XDR Data Loss Prevention
router.get('/dlp', XDRController.preventDataLoss);
router.post('/dlp/policies', XDRController.preventDataLoss);

// 12. XDR Email Security
router.get('/email-security', XDRController.secureEmail);
router.get('/email-security/threats', XDRController.secureEmail);

// 13. XDR Endpoint Protection
router.get('/endpoints', XDRController.protectEndpoints);
router.post('/endpoints/protect', XDRController.protectEndpoints);

// 14. XDR Forensic Analysis
router.post('/forensics/analyze', XDRController.performForensicAnalysis);
router.get('/forensics/results/:id', XDRController.performForensicAnalysis);

// 15. XDR Identity Protection
router.get('/identity', XDRController.protectIdentity);
router.get('/identity/risks', XDRController.protectIdentity);

// 16. XDR Machine Learning Detection
router.post('/ml/detect', XDRController.mlDetection);
router.get('/ml/models', XDRController.mlDetection);

// 17. XDR Network Security
router.get('/network', XDRController.secureNetwork);
router.get('/network/threats', XDRController.secureNetwork);

// 18. XDR Orchestration Engine
router.post('/orchestration/response', XDRController.orchestrateResponse);
router.get('/orchestration/playbooks', XDRController.orchestrateResponse);

// 19. XDR Patch Management
router.get('/patches', XDRController.managePatches);
router.post('/patches/deploy', XDRController.managePatches);

// 20. XDR Quarantine Management
router.get('/quarantine', XDRController.manageQuarantine);
router.post('/quarantine/isolate', XDRController.manageQuarantine);
router.post('/quarantine/release', XDRController.manageQuarantine);

// 21. XDR Risk Assessment
router.post('/risk/assess', XDRController.assessRisk);
router.get('/risk/score', XDRController.assessRisk);

// 22. XDR Sandbox Analysis
router.post('/sandbox/analyze', XDRController.analyzeSandbox);
router.get('/sandbox/results/:id', XDRController.analyzeSandbox);

// 23. XDR Threat Intelligence
router.get('/threat-intel', XDRController.threatIntelligence);
router.get('/threat-intel/feeds', XDRController.threatIntelligence);

// 24. XDR User Behavior Analytics
router.post('/uba/analyze', XDRController.analyzeUserBehavior);
router.get('/uba/anomalies', XDRController.analyzeUserBehavior);

// 25. XDR Vulnerability Management
router.get('/vulnerabilities', XDRController.manageVulnerabilities);
router.post('/vulnerabilities/scan', XDRController.manageVulnerabilities);

/**
 * Advanced XDR Operations Routes (26-49)
 */

// 26. XDR Workflow Automation
router.post('/workflow/automate', XDRController.automateWorkflow);
router.get('/workflow/tasks', XDRController.automateWorkflow);

// 27. XDR Zero Trust Enforcement
router.post('/zero-trust/enforce', XDRController.enforceZeroTrust);
router.get('/zero-trust/status', XDRController.enforceZeroTrust);

// 28. XDR API Security
router.get('/api-security', XDRController.secureAPIs);
router.get('/api-security/threats', XDRController.secureAPIs);

// 29. XDR Backup Security
router.get('/backup-security', XDRController.secureBackups);
router.post('/backup-security/verify', XDRController.secureBackups);

// 30. XDR Cloud Security
router.get('/cloud-security', XDRController.secureCloud);
router.get('/cloud-security/posture', XDRController.secureCloud);

// 31. XDR Device Control
router.post('/device-control', XDRController.controlDevices);
router.get('/device-control/status', XDRController.controlDevices);

// 32. XDR Export/Import
router.post('/export', XDRController.exportImportData);
router.post('/import', XDRController.exportImportData);

// 33. XDR File Integrity
router.get('/file-integrity', XDRController.monitorIntegrity);
router.post('/file-integrity/monitor', XDRController.monitorIntegrity);

// 34. XDR Geo-Location
router.post('/geo-location/track', XDRController.trackLocation);
router.get('/geo-location/risks', XDRController.trackLocation);

// 35. XDR Honeypot
router.post('/honeypot/deploy', XDRController.manageHoneypots);
router.get('/honeypot/status', XDRController.manageHoneypots);

// 36. XDR Incident Timeline
router.post('/incident/timeline', XDRController.createTimeline);
router.get('/incident/timeline/:id', XDRController.createTimeline);

// 37. XDR JIRA Integration
router.post('/jira/sync', XDRController.syncJira);
router.get('/jira/tickets', XDRController.syncJira);

// 38. XDR Knowledge Base
router.post('/knowledge-base', XDRController.manageKnowledge);
router.get('/knowledge-base', XDRController.manageKnowledge);
router.put('/knowledge-base/:id', XDRController.manageKnowledge);

// 39. XDR Log Analysis
router.post('/logs/analyze', XDRController.analyzeLogs);
router.get('/logs/anomalies', XDRController.analyzeLogs);

// 40. XDR Mobile Security
router.get('/mobile-security', XDRController.secureMobile);
router.get('/mobile-security/devices', XDRController.secureMobile);

// 41. XDR Notification Center
router.post('/notifications', XDRController.manageNotifications);
router.get('/notifications', XDRController.manageNotifications);
router.put('/notifications/:id', XDRController.manageNotifications);

// 42. XDR Offline Analysis
router.post('/offline/analyze', XDRController.offlineAnalysis);
router.get('/offline/results/:id', XDRController.offlineAnalysis);

// 43. XDR Policy Management
router.post('/policies', XDRController.managePolicies);
router.get('/policies', XDRController.managePolicies);
router.put('/policies/:id', XDRController.managePolicies);
router.delete('/policies/:id', XDRController.managePolicies);

// 44. XDR Query Builder
router.post('/query/build', XDRController.buildQueries);
router.post('/query/execute', XDRController.buildQueries);

// 45. XDR Report Generator
router.post('/reports/generate', XDRController.generateReports);
router.get('/reports', XDRController.generateReports);
router.get('/reports/:id', XDRController.generateReports);

// 46. XDR Scheduler
router.post('/scheduler/tasks', XDRController.scheduleTasks);
router.get('/scheduler/tasks', XDRController.scheduleTasks);
router.put('/scheduler/tasks/:id', XDRController.scheduleTasks);

// 47. XDR Threat Feed
router.post('/threat-feeds', XDRController.manageFeeds);
router.get('/threat-feeds', XDRController.manageFeeds);
router.put('/threat-feeds/:id', XDRController.manageFeeds);

// 48. XDR User Management
router.post('/users', XDRController.manageUsers);
router.get('/users', XDRController.manageUsers);
router.put('/users/:id', XDRController.manageUsers);
router.delete('/users/:id', XDRController.manageUsers);

// 49. XDR Visualization
router.post('/visualizations', XDRController.createVisualizations);
router.get('/visualizations', XDRController.createVisualizations);

/**
 * Additional XDR Specialized Routes
 */

// Web Security
router.get('/web-security', XDRController.secureWeb);
router.get('/web-security/threats', XDRController.secureWeb);

// XML Parser
router.post('/xml/parse', XDRController.parseXML);

// YARA Engine
router.post('/yara/scan', XDRController.yaraScan);
router.get('/yara/rules', XDRController.yaraScan);

// Zone Defense
router.post('/zone-defense/activate', XDRController.defendZones);
router.get('/zone-defense/status', XDRController.defendZones);

// Automated Response
router.post('/automated-response/trigger', XDRController.automateResponse);
router.get('/automated-response/actions', XDRController.automateResponse);

// Business Continuity
router.post('/business-continuity/ensure', XDRController.ensureContinuity);
router.get('/business-continuity/status', XDRController.ensureContinuity);

/**
 * XDR System Routes
 */

// XDR Health and Status
router.get('/health', XDRController.getXDRHealth);
router.get('/status', XDRController.getXDRHealth);

export default router;