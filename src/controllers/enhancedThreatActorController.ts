/**
 * Enhanced Threat Actor Controller with 18 Advanced Modules
 * Provides comprehensive threat intelligence API endpoints
 */

import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { ThreatIntelService } from '../../services/EnhancedThreatIntelService';
import {
  CreateThreatActorRequest,
  UpdateThreatActorRequest,
  ThreatActorQuery,
  ApiResponse,
  AttributionAnalysisRequest,
  CampaignTrackingRequest,
  ReputationAnalysisRequest,
  RiskAssessmentRequest,
  ComplianceReportRequest,
  ThreatHuntingRequest,
  IntelligenceSharingRequest,
  AlertConfigurationRequest
} from '../../types/api.js';

/**
 * Enhanced Threat Actor Controller with 18 business-ready modules
 */
export class EnhancedThreatActorController extends BaseController {
  constructor(
    private threatIntelService: ThreatIntelService
  ) {
    super();
  }

  /**
   * @swagger
   * /threat-actors/advanced-attribution:
   *   post:
   *     summary: Perform advanced ML-based threat actor attribution
   *     tags: [Advanced Attribution]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               indicators:
   *                 type: array
   *                 items:
   *                   type: string
   *               context:
   *                 type: object
   *                 additionalProperties:
   *                   type: string
   *               confidence_threshold:
   *                 type: number
   *                 minimum: 0
   *                 maximum: 1
   *     responses:
   *       200:
   *         description: Attribution analysis results
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 analysis_id:
   *                   type: string
   *                 primary_attribution:
   *                   type: object
   *                 confidence_score:
   *                   type: number
   *                 ml_predictions:
   *                   type: array
   */
  public async performAdvancedAttribution(req: Request, res: Response): Promise<void> {
    try {
      const { indicators, context, confidence_threshold = 0.75 } = req.body as AttributionAnalysisRequest;
      
      const analysis = await this.threatIntelService.performAdvancedAttribution({
        indicators,
        context: context || {},
        confidence_threshold
      });

      res.json({
        success: true,
        data: analysis,
        metadata: {
          module: 'advanced_attribution',
          version: '2.1.0',
          analysis_timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Advanced attribution analysis failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/campaign-lifecycle:
   *   post:
   *     summary: Start comprehensive campaign lifecycle tracking
   *     tags: [Campaign Lifecycle]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               campaign_name:
   *                 type: string
   *               actor_id:
   *                 type: string
   *               objectives:
   *                 type: array
   *                 items:
   *                   type: string
   *               targets:
   *                 type: array
   *                 items:
   *                   type: object
   *     responses:
   *       200:
   *         description: Campaign tracking initiated
   */
  public async startCampaignTracking(req: Request, res: Response): Promise<void> {
    try {
      const campaignData = req.body as CampaignTrackingRequest;
      
      const trackingResult = await this.threatIntelService.startCampaignTracking(campaignData);

      res.json({
        success: true,
        data: trackingResult,
        metadata: {
          module: 'campaign_lifecycle',
          tracking_id: trackingResult.campaign_id
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Campaign tracking initialization failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/{actorId}/reputation:
   *   post:
   *     summary: Analyze actor reputation with dynamic scoring
   *     tags: [Reputation System]
   *     parameters:
   *       - in: path
   *         name: actorId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               factors:
   *                 type: object
   *                 properties:
   *                   sophistication:
   *                     type: number
   *                   activity_frequency:
   *                     type: number
   *                   success_rate:
   *                     type: number
   *     responses:
   *       200:
   *         description: Reputation analysis results
   */
  public async analyzeActorReputation(req: Request, res: Response): Promise<void> {
    try {
      const { actorId } = req.params;
      const { factors } = req.body as ReputationAnalysisRequest;
      
      const reputation = await this.threatIntelService.analyzeActorReputation(actorId, factors);

      res.json({
        success: true,
        data: reputation,
        metadata: {
          module: 'reputation_system',
          actor_id: actorId,
          analysis_version: '2.1.0'
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Reputation analysis failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/behavioral-patterns:
   *   post:
   *     summary: Analyze behavioral patterns and predict future activities
   *     tags: [Behavioral Analysis]
   */
  public async analyzeBehavioralPatterns(req: Request, res: Response): Promise<void> {
    try {
      const { actor_id, activities, timeframe } = req.body;
      
      const analysis = await this.threatIntelService.analyzeBehavioralPatterns({
        actor_id,
        activities,
        timeframe
      });

      res.json({
        success: true,
        data: analysis,
        metadata: {
          module: 'behavioral_patterns',
          actor_id
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Behavioral pattern analysis failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/ttp-evolution:
   *   get:
   *     summary: Track TTP evolution and predict changes
   *     tags: [TTP Evolution]
   */
  public async trackTTPEvolution(req: Request, res: Response): Promise<void> {
    try {
      const { actor_id, timeframe } = req.query;
      
      const evolution = await this.threatIntelService.trackTTPEvolution({
        actor_id: actor_id as string,
        timeframe: timeframe as string
      });

      res.json({
        success: true,
        data: evolution,
        metadata: {
          module: 'ttp_evolution'
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'TTP evolution tracking failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/infrastructure-analysis:
   *   post:
   *     summary: Perform deep infrastructure analysis
   *     tags: [Infrastructure Analysis]
   */
  public async analyzeInfrastructure(req: Request, res: Response): Promise<void> {
    try {
      const { indicators, analysis_depth } = req.body;
      
      const analysis = await this.threatIntelService.analyzeInfrastructure({
        indicators,
        analysis_depth: analysis_depth || 'comprehensive'
      });

      res.json({
        success: true,
        data: analysis,
        metadata: {
          module: 'infrastructure_analysis',
          depth: analysis_depth
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Infrastructure analysis failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/risk-assessment:
   *   post:
   *     summary: Calculate business risk quantification
   *     tags: [Risk Assessment]
   */
  public async calculateRiskAssessment(req: Request, res: Response): Promise<void> {
    try {
      const riskData = req.body as RiskAssessmentRequest;
      
      const assessment = await this.threatIntelService.calculateRiskAssessment(riskData);

      res.json({
        success: true,
        data: assessment,
        metadata: {
          module: 'risk_assessment',
          assessment_type: riskData.assessment_type
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Risk assessment calculation failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/impact-assessment:
   *   post:
   *     summary: Analyze potential impact and damage modeling
   *     tags: [Impact Assessment]
   */
  public async assessImpact(req: Request, res: Response): Promise<void> {
    try {
      const { actor_id, target_assets, attack_scenarios } = req.body;
      
      const impact = await this.threatIntelService.assessImpact({
        actor_id,
        target_assets,
        attack_scenarios
      });

      res.json({
        success: true,
        data: impact,
        metadata: {
          module: 'impact_assessment',
          actor_id,
          scenarios_analyzed: attack_scenarios?.length || 0
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Impact assessment failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/threat-landscape:
   *   get:
   *     summary: Generate comprehensive threat landscape mapping
   *     tags: [Threat Landscape]
   */
  public async generateThreatLandscape(req: Request, res: Response): Promise<void> {
    try {
      const { geography, sector, timeframe } = req.query;
      
      const landscape = await this.threatIntelService.generateThreatLandscape({
        geography: geography as string,
        sector: sector as string,
        timeframe: timeframe as string || '30d'
      });

      res.json({
        success: true,
        data: landscape,
        metadata: {
          module: 'threat_landscape',
          scope: `${geography}-${sector}`,
          timeframe
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Threat landscape generation failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/industry-targeting:
   *   get:
   *     summary: Analyze sector-specific targeting patterns
   *     tags: [Industry Targeting]
   */
  public async analyzeIndustryTargeting(req: Request, res: Response): Promise<void> {
    try {
      const { sector, actor_id } = req.query;
      
      const targeting = await this.threatIntelService.analyzeIndustryTargeting({
        sector: sector as string,
        actor_id: actor_id as string
      });

      res.json({
        success: true,
        data: targeting,
        metadata: {
          module: 'industry_targeting',
          sector,
          actor_id
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Industry targeting analysis failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/geographic-analysis:
   *   get:
   *     summary: Generate geographic threat intelligence
   *     tags: [Geographic Analysis]
   */
  public async analyzeGeographicThreats(req: Request, res: Response): Promise<void> {
    try {
      const { region, country, threat_type } = req.query;
      
      const analysis = await this.threatIntelService.analyzeGeographicThreats({
        region: region as string,
        country: country as string,
        threat_type: threat_type as string
      });

      res.json({
        success: true,
        data: analysis,
        metadata: {
          module: 'geographic_analysis',
          scope: `${region}-${country}`,
          threat_type
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Geographic analysis failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/supply-chain-risk:
   *   post:
   *     summary: Assess supply chain risk exposure
   *     tags: [Supply Chain Risk]
   */
  public async assessSupplyChainRisk(req: Request, res: Response): Promise<void> {
    try {
      const { vendors, dependencies, risk_factors } = req.body;
      
      const assessment = await this.threatIntelService.assessSupplyChainRisk({
        vendors,
        dependencies,
        risk_factors
      });

      res.json({
        success: true,
        data: assessment,
        metadata: {
          module: 'supply_chain_risk',
          vendors_analyzed: vendors?.length || 0,
          dependencies_checked: dependencies?.length || 0
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Supply chain risk assessment failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/executive-dashboard:
   *   get:
   *     summary: Generate C-level executive dashboard
   *     tags: [Executive Dashboard]
   */
  public async generateExecutiveDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe, focus_areas } = req.query;
      
      const dashboard = await this.threatIntelService.generateExecutiveDashboard({
        timeframe: timeframe as string || '7d',
        focus_areas: focus_areas ? (focus_areas as string).split(',') : ['risk', 'threats', 'incidents']
      });

      res.json({
        success: true,
        data: dashboard,
        metadata: {
          module: 'executive_dashboard',
          timeframe,
          focus_areas: dashboard.focus_areas
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Executive dashboard generation failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/compliance-reporting:
   *   post:
   *     summary: Generate regulatory compliance reports
   *     tags: [Compliance Reporting]
   */
  public async generateComplianceReport(req: Request, res: Response): Promise<void> {
    try {
      const reportData = req.body as ComplianceReportRequest;
      
      const report = await this.threatIntelService.generateComplianceReport(reportData);

      res.json({
        success: true,
        data: report,
        metadata: {
          module: 'compliance_reporting',
          framework: reportData.compliance_framework,
          report_type: reportData.report_type
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Compliance report generation failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/incident-response:
   *   post:
   *     summary: Coordinate incident response integration
   *     tags: [Incident Response]
   */
  public async coordinateIncidentResponse(req: Request, res: Response): Promise<void> {
    try {
      const { incident_id, actor_attribution, response_actions } = req.body;
      
      const coordination = await this.threatIntelService.coordinateIncidentResponse({
        incident_id,
        actor_attribution,
        response_actions
      });

      res.json({
        success: true,
        data: coordination,
        metadata: {
          module: 'incident_response',
          incident_id,
          actions_coordinated: response_actions?.length || 0
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Incident response coordination failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/threat-hunting:
   *   post:
   *     summary: Automate proactive threat hunting activities
   *     tags: [Threat Hunting]
   */
  public async automateeThreatHunting(req: Request, res: Response): Promise<void> {
    try {
      const huntingData = req.body as ThreatHuntingRequest;
      
      const results = await this.threatIntelService.automateThreatHunting(huntingData);

      res.json({
        success: true,
        data: results,
        metadata: {
          module: 'threat_hunting',
          hunt_type: huntingData.hunt_type,
          indicators_searched: huntingData.indicators?.length || 0
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Threat hunting automation failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/intelligence-sharing:
   *   post:
   *     summary: Share intelligence with external partners
   *     tags: [Intelligence Sharing]
   */
  public async shareIntelligence(req: Request, res: Response): Promise<void> {
    try {
      const sharingData = req.body as IntelligenceSharingRequest;
      
      const result = await this.threatIntelService.shareIntelligence(sharingData);

      res.json({
        success: true,
        data: result,
        metadata: {
          module: 'intelligence_sharing',
          sharing_protocol: sharingData.protocol,
          recipients: sharingData.recipients?.length || 0
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Intelligence sharing failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/realtime-alerts:
   *   post:
   *     summary: Configure real-time threat notifications
   *     tags: [Real-time Alerts]
   */
  public async configureRealtimeAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alertConfig = req.body as AlertConfigurationRequest;
      
      const configuration = await this.threatIntelService.configureRealtimeAlerts(alertConfig);

      res.json({
        success: true,
        data: configuration,
        metadata: {
          module: 'realtime_alerts',
          alert_types: alertConfig.alert_types?.length || 0,
          notification_channels: alertConfig.notification_channels?.length || 0
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Real-time alert configuration failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/comprehensive-report:
   *   get:
   *     summary: Generate comprehensive threat intelligence report
   *     tags: [Comprehensive Analysis]
   */
  public async generateComprehensiveReport(req: Request, res: Response): Promise<void> {
    try {
      const { actor_id, include_modules } = req.query;
      const modules = include_modules ? (include_modules as string).split(',') : [
        'advanced_attribution', 'campaign_lifecycle', 'reputation_system',
        'behavioral_patterns', 'ttp_evolution', 'infrastructure_analysis',
        'risk_assessment', 'impact_assessment', 'threat_landscape'
      ];
      
      const report = await this.threatIntelService.generateComprehensiveReport({
        actor_id: actor_id as string,
        modules,
        report_format: 'detailed'
      });

      res.json({
        success: true,
        data: report,
        metadata: {
          modules_included: modules,
          actor_id,
          report_version: '2.1.0',
          generation_timestamp: new Date().toISOString()
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Comprehensive report generation failed');
    }
  }

  /**
   * @swagger
   * /threat-actors/modules/status:
   *   get:
   *     summary: Get status of all 18 modules
   *     tags: [System Status]
   */
  public async getModuleStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.threatIntelService.getModuleStatus();

      res.json({
        success: true,
        data: status,
        metadata: {
          total_modules: 18,
          active_modules: Object.values(status).filter(s => s === 'active').length,
          system_version: '2.1.0'
        }
      } as ApiResponse);
    } catch (error) {
      this.handleError(res, error, 'Module status retrieval failed');
    }
  }
}

/**
 * Factory function to create controller instance
 */
export const createEnhancedThreatActorController = (
  threatIntelService: ThreatIntelService
) => {
  return new EnhancedThreatActorController(threatIntelService);
};