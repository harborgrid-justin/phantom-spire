/**
 * XDR (Extended Detection and Response) Controller
 * Handles all XDR-related API endpoints with comprehensive business logic integration
 */

import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { BusinessLogicManager } from '../../services/business-logic/core/BusinessLogicManager.js';
import { createBusinessLogicRequest } from '../../utils/businessLogicHelper.js';

const businessLogicManager = BusinessLogicManager.getInstance();

export class XDRController {
  /**
   * Core XDR Detection Methods (1-10)
   */
  
  // 1. XDR Detection Engine
  static async getDetectionAnalysis(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest(
          'xdr-detection-engine',
          'detection-analysis',
          req.query,
          req.user?.id,
          'high'
        )
      );

      res.json({
        success: true,
        data: result,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to process XDR detection analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 2. XDR Incident Response
  static async manageIncidents(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest(
          'xdr-incident-response',
          'incident-management',
          req.body,
          req.user?.id,
          'critical'
        )
      );

      res.json({
        success: true,
        data: result,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to manage XDR incidents',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 3. XDR Threat Hunting
  static async executeThreatHunt(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest(
          'xdr-threat-hunting',
          'hunt-execution',
          req.body,
          req.user?.id,
          'high'
        )
      );

      res.json({
        success: true,
        data: result,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to execute XDR threat hunt',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 4. XDR Analytics Dashboard
  static async getDashboardData(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest(
          'xdr-analytics-dashboard',
          'dashboard-data',
          req.query,
          req.user?.id
        )
      );

      res.json({
        success: true,
        data: result,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get XDR dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 5. XDR Configuration
  static async manageConfiguration(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest(
          'xdr-configuration',
          'config-management',
          req.body,
          req.user?.id
        )
      );

      res.json({
        success: true,
        data: result,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to manage XDR configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 6. XDR Real-time Monitoring
  static async getRealtimeMonitoring(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest(
          'xdr-realtime-monitoring',
          'monitor-events',
          req.query,
          req.user?.id,
          'high'
        )
      );

      res.json({
        success: true,
        data: result,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get XDR real-time monitoring data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 7. XDR Alert Management
  static async manageAlerts(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest(
          'xdr-alert-management',
          'manage-alerts',
          req.body,
          req.user?.id,
          'high'
        )
      );

      res.json({
        success: true,
        data: result,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to manage XDR alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 8. XDR Asset Discovery
  static async discoverAssets(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest(
          'xdr-asset-discovery',
          'discover-assets',
          req.query,
          req.user?.id
        )
      );

      res.json({
        success: true,
        data: result,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to discover XDR assets',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 9. XDR Behavioral Analytics
  static async analyzeBehavior(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest(
          'xdr-behavioral-analytics',
          'analyze-behavior',
          req.body,
          req.user?.id
        )
      );

      res.json({
        success: true,
        data: result,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to analyze XDR behavior',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 10. XDR Compliance Monitoring
  static async monitorCompliance(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest(
          'xdr-compliance-monitoring',
          'monitor-compliance',
          req.query,
          req.user?.id
        )
      );

      res.json({
        success: true,
        data: result,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to monitor XDR compliance',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Extended XDR Security Methods (11-25)
   */

  // 11. XDR Data Loss Prevention
  static async preventDataLoss(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-data-loss-prevention', 'prevent-data-loss', req.body, req.user?.id, 'high')
      );
      res.json({ success: true, data: result, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to prevent data loss', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  // 12. XDR Email Security
  static async secureEmail(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-email-security', 'secure-email', req.query, req.user?.id)
      );
      res.json({ success: true, data: result, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to secure email', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  // 13. XDR Endpoint Protection
  static async protectEndpoints(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-endpoint-protection', 'protect-endpoints', req.query, req.user?.id, 'high')
      );
      res.json({ success: true, data: result, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to protect endpoints', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  // 14. XDR Forensic Analysis
  static async performForensicAnalysis(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-forensic-analysis', 'forensic-analysis', req.body, req.user?.id, 'high')
      );
      res.json({ success: true, data: result, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to perform forensic analysis', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  // 15. XDR Identity Protection
  static async protectIdentity(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-identity-protection', 'protect-identity', req.query, req.user?.id)
      );
      res.json({ success: true, data: result, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to protect identity', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  // 16-25: Additional security methods (abbreviated for brevity)
  static async mlDetection(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-ml-detection', 'ml-detection', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'ML detection failed' });
    }
  }

  static async secureNetwork(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-network-security', 'secure-network', req.query, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Network security failed' });
    }
  }

  static async orchestrateResponse(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-orchestration-engine', 'orchestrate-response', req.body, req.user?.id, 'high')
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Response orchestration failed' });
    }
  }

  static async managePatches(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-patch-management', 'manage-patches', req.query, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Patch management failed' });
    }
  }

  static async manageQuarantine(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-quarantine-management', 'manage-quarantine', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Quarantine management failed' });
    }
  }

  /**
   * Advanced XDR Operations (26-49)
   */

  // Automated methods for the remaining 24 XDR operations
  static async assessRisk(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-risk-assessment', 'assess-risk', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Risk assessment failed' });
    }
  }

  static async analyzeSandbox(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-sandbox-analysis', 'analyze-sandbox', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Sandbox analysis failed' });
    }
  }

  static async threatIntelligence(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-threat-intelligence', 'threat-intel', req.query, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Threat intelligence failed' });
    }
  }

  static async analyzeUserBehavior(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-user-behavior-analytics', 'analyze-user-behavior', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'User behavior analysis failed' });
    }
  }

  static async manageVulnerabilities(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-vulnerability-management', 'manage-vulnerabilities', req.query, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Vulnerability management failed' });
    }
  }

  // Continue with workflow automation through business continuity (30-49)
  static async automateWorkflow(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-workflow-automation', 'automate-workflow', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Workflow automation failed' });
    }
  }

  static async enforceZeroTrust(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-zero-trust-enforcement', 'enforce-zero-trust', req.body, req.user?.id, 'high')
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Zero trust enforcement failed' });
    }
  }

  // Additional methods for comprehensive XDR coverage (32-49)
  static async secureAPIs(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-api-security', 'secure-apis', req.query, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'API security failed' });
    }
  }

  static async secureBackups(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-backup-security', 'secure-backups', req.query, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Backup security failed' });
    }
  }

  static async secureCloud(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-cloud-security', 'secure-cloud', req.query, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Cloud security failed' });
    }
  }

  // Final comprehensive XDR methods
  static async controlDevices(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-device-control', 'control-devices', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Device control failed' });
    }
  }

  static async exportImportData(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-export-import', 'export-import-data', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Export/import failed' });
    }
  }

  static async monitorIntegrity(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-file-integrity', 'monitor-integrity', req.query, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Integrity monitoring failed' });
    }
  }

  static async trackLocation(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-geo-location', 'track-location', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Location tracking failed' });
    }
  }

  static async manageHoneypots(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-honeypot', 'manage-honeypots', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Honeypot management failed' });
    }
  }

  // Remaining comprehensive XDR endpoint methods (40-49)
  static async createTimeline(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-incident-timeline', 'create-timeline', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Timeline creation failed' });
    }
  }

  static async syncJira(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-jira-integration', 'sync-jira', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Jira integration failed' });
    }
  }

  static async manageKnowledge(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-knowledge-base', 'manage-knowledge', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Knowledge management failed' });
    }
  }

  static async analyzeLogs(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-log-analysis', 'analyze-logs', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Log analysis failed' });
    }
  }

  static async secureMobile(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-mobile-security', 'secure-mobile', req.query, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Mobile security failed' });
    }
  }

  static async manageNotifications(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-notification-center', 'manage-notifications', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Notification management failed' });
    }
  }

  static async offlineAnalysis(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-offline-analysis', 'offline-analysis', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Offline analysis failed' });
    }
  }

  static async managePolicies(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-policy-management', 'manage-policies', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Policy management failed' });
    }
  }

  static async buildQueries(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-query-builder', 'build-queries', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Query building failed' });
    }
  }

  static async generateReports(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-report-generator', 'generate-reports', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Report generation failed' });
    }
  }

  static async scheduleTasks(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-scheduler', 'schedule-tasks', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Task scheduling failed' });
    }
  }

  static async manageFeeds(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-threat-feed', 'manage-feeds', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Feed management failed' });
    }
  }

  static async manageUsers(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-user-management', 'manage-users', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'User management failed' });
    }
  }

  static async createVisualizations(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-visualization', 'create-visualizations', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Visualization creation failed' });
    }
  }

  static async secureWeb(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-web-security', 'secure-web', req.query, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Web security failed' });
    }
  }

  static async parseXML(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-xml-parser', 'parse-xml', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'XML parsing failed' });
    }
  }

  static async yaraScan(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-yara-engine', 'yara-scan', req.body, req.user?.id)
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'YARA scan failed' });
    }
  }

  static async defendZones(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-zone-defense', 'defend-zones', req.body, req.user?.id, 'high')
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Zone defense failed' });
    }
  }

  static async automateResponse(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-automated-response', 'automate-response', req.body, req.user?.id, 'critical')
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Automated response failed' });
    }
  }

  static async ensureContinuity(req: AuthRequest, res: Response) {
    try {
      const result = await businessLogicManager.processRequest(
        createBusinessLogicRequest('xdr-business-continuity', 'ensure-continuity', req.body, req.user?.id, 'critical')
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Business continuity failed' });
    }
  }

  /**
   * XDR Health and Status Methods
   */
  static async getXDRHealth(req: AuthRequest, res: Response) {
    try {
      res.json({
        success: true,
        data: {
          xdrModules: 49,
          status: 'operational',
          lastUpdate: new Date(),
          activeServices: [
            'detection-engine', 'incident-response', 'threat-hunting',
            'analytics-dashboard', 'configuration', 'realtime-monitoring'
          ]
        },
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get XDR health status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}