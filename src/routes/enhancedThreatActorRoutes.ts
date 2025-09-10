/**
 * Enhanced Threat Actor Routes - 18 Module API Endpoints
 * Comprehensive threat intelligence REST API
 */

import express from 'express';
import { EnhancedThreatActorController } from '../controllers/enhancedThreatActorController.js';
import { ThreatIntelService } from '../services/EnhancedThreatIntelService.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { rateLimitMiddleware } from '../middleware/rateLimit.js';

const router = express.Router();

// Initialize services and controller
const threatIntelService = new ThreatIntelService();
const controller = new EnhancedThreatActorController(threatIntelService);

// Apply middleware
router.use(authMiddleware);
router.use(rateLimitMiddleware);

/**
 * Module 1: Advanced Attribution Engine
 */
router.post('/advanced-attribution', 
  validateRequest({
    body: {
      indicators: { type: 'array', required: true },
      context: { type: 'object', required: false },
      confidence_threshold: { type: 'number', min: 0, max: 1, required: false }
    }
  }),
  async (req, res) => await controller.performAdvancedAttribution(req, res)
);

/**
 * Module 2: Campaign Lifecycle Tracker
 */
router.post('/campaign-lifecycle',
  validateRequest({
    body: {
      campaign_name: { type: 'string', required: true },
      actor_id: { type: 'string', required: false },
      objectives: { type: 'array', required: false },
      targets: { type: 'array', required: false }
    }
  }),
  async (req, res) => await controller.startCampaignTracking(req, res)
);

router.get('/campaign-lifecycle/:campaignId/status',
  async (req, res) => {
    try {
      const { campaignId } = req.params;
      const status = await threatIntelService.getCampaignStatus(campaignId);
      res.json({ success: true, data: status });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.put('/campaign-lifecycle/:campaignId/stage',
  validateRequest({
    body: {
      stage: { type: 'string', required: true }
    }
  }),
  async (req, res) => {
    try {
      const { campaignId } = req.params;
      const { stage } = req.body;
      const result = await threatIntelService.updateCampaignStage(campaignId, stage);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Module 3: Threat Actor Reputation System
 */
router.post('/:actorId/reputation',
  validateRequest({
    params: {
      actorId: { type: 'string', required: true }
    },
    body: {
      factors: { type: 'object', required: true }
    }
  }),
  async (req, res) => await controller.analyzeActorReputation(req, res)
);

router.get('/:actorId/reputation/history',
  async (req, res) => {
    try {
      const { actorId } = req.params;
      const { timeframe = '30d' } = req.query;
      const history = await threatIntelService.getReputationHistory(actorId, timeframe as string);
      res.json({ success: true, data: history });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.get('/reputation/rankings',
  async (req, res) => {
    try {
      const { limit = 100, category } = req.query;
      const rankings = await threatIntelService.getReputationRankings(
        parseInt(limit as string), 
        category as string
      );
      res.json({ success: true, data: rankings });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Module 4: Behavioral Pattern Analyzer
 */
router.post('/behavioral-patterns',
  validateRequest({
    body: {
      actor_id: { type: 'string', required: true },
      activities: { type: 'array', required: true },
      timeframe: { type: 'string', required: false }
    }
  }),
  async (req, res) => await controller.analyzeBehavioralPatterns(req, res)
);

router.get('/:actorId/behavioral-patterns/predictions',
  async (req, res) => {
    try {
      const { actorId } = req.params;
      const { timeframe = '30d' } = req.query;
      const predictions = await threatIntelService.getBehavioralPredictions(actorId, timeframe as string);
      res.json({ success: true, data: predictions });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Module 5: TTP Evolution Tracker
 */
router.get('/ttp-evolution',
  validateRequest({
    query: {
      actor_id: { type: 'string', required: false },
      timeframe: { type: 'string', required: false }
    }
  }),
  async (req, res) => await controller.trackTTPEvolution(req, res)
);

router.get('/:actorId/ttp-evolution/timeline',
  async (req, res) => {
    try {
      const { actorId } = req.params;
      const { granularity = 'monthly' } = req.query;
      const timeline = await threatIntelService.getTTPEvolutionTimeline(actorId, granularity as string);
      res.json({ success: true, data: timeline });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Module 6: Infrastructure Analysis Engine
 */
router.post('/infrastructure-analysis',
  validateRequest({
    body: {
      indicators: { type: 'array', required: true },
      analysis_depth: { type: 'string', required: false }
    }
  }),
  async (req, res) => await controller.analyzeInfrastructure(req, res)
);

router.get('/infrastructure-analysis/:analysisId',
  async (req, res) => {
    try {
      const { analysisId } = req.params;
      const analysis = await threatIntelService.getInfrastructureAnalysis(analysisId);
      res.json({ success: true, data: analysis });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Module 7: Risk Assessment Calculator
 */
router.post('/risk-assessment',
  validateRequest({
    body: {
      assessment_type: { type: 'string', required: true },
      assets: { type: 'array', required: true },
      threat_actors: { type: 'array', required: false }
    }
  }),
  async (req, res) => await controller.calculateRiskAssessment(req, res)
);

router.get('/risk-assessment/:assessmentId/report',
  async (req, res) => {
    try {
      const { assessmentId } = req.params;
      const { format = 'json' } = req.query;
      const report = await threatIntelService.getRiskAssessmentReport(assessmentId, format as string);
      res.json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Module 8: Impact Assessment Engine
 */
router.post('/impact-assessment',
  validateRequest({
    body: {
      actor_id: { type: 'string', required: true },
      target_assets: { type: 'array', required: true },
      attack_scenarios: { type: 'array', required: false }
    }
  }),
  async (req, res) => await controller.assessImpact(req, res)
);

router.get('/impact-assessment/:assessmentId/simulation',
  async (req, res) => {
    try {
      const { assessmentId } = req.params;
      const { scenario_id } = req.query;
      const simulation = await threatIntelService.runImpactSimulation(assessmentId, scenario_id as string);
      res.json({ success: true, data: simulation });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Module 9: Threat Landscape Mapper
 */
router.get('/threat-landscape',
  validateRequest({
    query: {
      geography: { type: 'string', required: false },
      sector: { type: 'string', required: false },
      timeframe: { type: 'string', required: false }
    }
  }),
  async (req, res) => await controller.generateThreatLandscape(req, res)
);

router.get('/threat-landscape/trends',
  async (req, res) => {
    try {
      const { timeframe = '90d', geography, sector } = req.query;
      const trends = await threatIntelService.getThreatLandscapeTrends({
        timeframe: timeframe as string,
        geography: geography as string,
        sector: sector as string
      });
      res.json({ success: true, data: trends });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Module 10: Industry Targeting Analyzer
 */
router.get('/industry-targeting',
  validateRequest({
    query: {
      sector: { type: 'string', required: false },
      actor_id: { type: 'string', required: false }
    }
  }),
  async (req, res) => await controller.analyzeIndustryTargeting(req, res)
);

router.get('/industry-targeting/:sector/actors',
  async (req, res) => {
    try {
      const { sector } = req.params;
      const { threat_level = 'all' } = req.query;
      const actors = await threatIntelService.getSectorThreats(sector, threat_level as string);
      res.json({ success: true, data: actors });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Module 11: Geographic Threat Analysis
 */
router.get('/geographic-analysis',
  validateRequest({
    query: {
      region: { type: 'string', required: false },
      country: { type: 'string', required: false },
      threat_type: { type: 'string', required: false }
    }
  }),
  async (req, res) => await controller.analyzeGeographicThreats(req, res)
);

router.get('/geographic-analysis/:region/heatmap',
  async (req, res) => {
    try {
      const { region } = req.params;
      const { metric = 'threat_density' } = req.query;
      const heatmap = await threatIntelService.generateThreatHeatmap(region, metric as string);
      res.json({ success: true, data: heatmap });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Module 12: Supply Chain Risk Analyzer
 */
router.post('/supply-chain-risk',
  validateRequest({
    body: {
      vendors: { type: 'array', required: true },
      dependencies: { type: 'array', required: false },
      risk_factors: { type: 'object', required: false }
    }
  }),
  async (req, res) => await controller.assessSupplyChainRisk(req, res)
);

router.get('/supply-chain-risk/:assessmentId/mitigation',
  async (req, res) => {
    try {
      const { assessmentId } = req.params;
      const mitigation = await threatIntelService.getSupplyChainMitigation(assessmentId);
      res.json({ success: true, data: mitigation });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Module 13: Executive Dashboard Generator
 */
router.get('/executive-dashboard',
  validateRequest({
    query: {
      timeframe: { type: 'string', required: false },
      focus_areas: { type: 'string', required: false }
    }
  }),
  async (req, res) => await controller.generateExecutiveDashboard(req, res)
);

router.get('/executive-dashboard/metrics',
  async (req, res) => {
    try {
      const { metric_type = 'all', timeframe = '7d' } = req.query;
      const metrics = await threatIntelService.getExecutiveMetrics(metric_type as string, timeframe as string);
      res.json({ success: true, data: metrics });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Module 14: Compliance Reporting Engine
 */
router.post('/compliance-reporting',
  validateRequest({
    body: {
      compliance_framework: { type: 'string', required: true },
      report_type: { type: 'string', required: true },
      scope: { type: 'object', required: false }
    }
  }),
  async (req, res) => await controller.generateComplianceReport(req, res)
);

router.get('/compliance-reporting/frameworks',
  async (req, res) => {
    try {
      const frameworks = await threatIntelService.getSupportedComplianceFrameworks();
      res.json({ success: true, data: frameworks });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Module 15: Incident Response Coordinator
 */
router.post('/incident-response',
  validateRequest({
    body: {
      incident_id: { type: 'string', required: true },
      actor_attribution: { type: 'object', required: false },
      response_actions: { type: 'array', required: false }
    }
  }),
  async (req, res) => await controller.coordinateIncidentResponse(req, res)
);

router.get('/incident-response/:incidentId/playbook',
  async (req, res) => {
    try {
      const { incidentId } = req.params;
      const { actor_type } = req.query;
      const playbook = await threatIntelService.getIncidentPlaybook(incidentId, actor_type as string);
      res.json({ success: true, data: playbook });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Module 16: Threat Hunting Assistant
 */
router.post('/threat-hunting',
  validateRequest({
    body: {
      hunt_type: { type: 'string', required: true },
      indicators: { type: 'array', required: false },
      timeframe: { type: 'string', required: false }
    }
  }),
  async (req, res) => await controller.automateeThreatHunting(req, res)
);

router.get('/threat-hunting/queries/:huntType',
  async (req, res) => {
    try {
      const { huntType } = req.params;
      const { platform = 'splunk' } = req.query;
      const queries = await threatIntelService.generateHuntingQueries(huntType, platform as string);
      res.json({ success: true, data: queries });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Module 17: Intelligence Sharing Gateway
 */
router.post('/intelligence-sharing',
  validateRequest({
    body: {
      protocol: { type: 'string', required: true },
      recipients: { type: 'array', required: true },
      data: { type: 'object', required: true }
    }
  }),
  async (req, res) => await controller.shareIntelligence(req, res)
);

router.get('/intelligence-sharing/feeds',
  async (req, res) => {
    try {
      const { feed_type = 'all' } = req.query;
      const feeds = await threatIntelService.getIntelligenceFeeds(feed_type as string);
      res.json({ success: true, data: feeds });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Module 18: Real-time Alert System
 */
router.post('/realtime-alerts',
  validateRequest({
    body: {
      alert_types: { type: 'array', required: true },
      notification_channels: { type: 'array', required: true },
      criteria: { type: 'object', required: false }
    }
  }),
  async (req, res) => await controller.configureRealtimeAlerts(req, res)
);

router.get('/realtime-alerts/active',
  async (req, res) => {
    try {
      const { severity = 'all', limit = 100 } = req.query;
      const alerts = await threatIntelService.getActiveAlerts(severity as string, parseInt(limit as string));
      res.json({ success: true, data: alerts });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.put('/realtime-alerts/:alertId/acknowledge',
  async (req, res) => {
    try {
      const { alertId } = req.params;
      const { user_id } = req.body;
      const result = await threatIntelService.acknowledgeAlert(alertId, user_id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Comprehensive Analysis Endpoints
 */
router.get('/comprehensive-report',
  validateRequest({
    query: {
      actor_id: { type: 'string', required: false },
      include_modules: { type: 'string', required: false }
    }
  }),
  async (req, res) => await controller.generateComprehensiveReport(req, res)
);

router.get('/modules/status',
  async (req, res) => await controller.getModuleStatus(req, res)
);

/**
 * Health Check Endpoint
 */
router.get('/health',
  async (req, res) => {
    try {
      const health = await threatIntelService.performHealthCheck();
      res.json({
        success: true,
        data: health,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * System Information Endpoint
 */
router.get('/system/info',
  async (req, res) => {
    try {
      const info = {
        version: '2.1.0',
        name: 'Phantom Threat Actor Core API',
        modules: 18,
        capabilities: [
          'Advanced Attribution Analysis',
          'Campaign Lifecycle Tracking', 
          'Dynamic Reputation System',
          'Behavioral Pattern Analysis',
          'TTP Evolution Tracking',
          'Infrastructure Analysis',
          'Risk Assessment',
          'Impact Assessment', 
          'Threat Landscape Mapping',
          'Industry Targeting Analysis',
          'Geographic Analysis',
          'Supply Chain Risk Assessment',
          'Executive Dashboard Generation',
          'Compliance Reporting',
          'Incident Response Coordination',
          'Threat Hunting Assistant',
          'Intelligence Sharing Gateway',
          'Real-time Alert System'
        ],
        api_version: 'v2',
        endpoints: {
          advanced_attribution: '/threat-actors/advanced-attribution',
          campaign_lifecycle: '/threat-actors/campaign-lifecycle',
          reputation_system: '/threat-actors/:actorId/reputation',
          behavioral_patterns: '/threat-actors/behavioral-patterns',
          ttp_evolution: '/threat-actors/ttp-evolution',
          infrastructure_analysis: '/threat-actors/infrastructure-analysis',
          risk_assessment: '/threat-actors/risk-assessment',
          impact_assessment: '/threat-actors/impact-assessment',
          threat_landscape: '/threat-actors/threat-landscape',
          industry_targeting: '/threat-actors/industry-targeting',
          geographic_analysis: '/threat-actors/geographic-analysis',
          supply_chain_risk: '/threat-actors/supply-chain-risk',
          executive_dashboard: '/threat-actors/executive-dashboard',
          compliance_reporting: '/threat-actors/compliance-reporting',
          incident_response: '/threat-actors/incident-response',
          threat_hunting: '/threat-actors/threat-hunting',
          intelligence_sharing: '/threat-actors/intelligence-sharing',
          realtime_alerts: '/threat-actors/realtime-alerts'
        }
      };
      
      res.json({
        success: true,
        data: info
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;