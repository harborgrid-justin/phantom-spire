/**
 * Test Suite for Phantom Threat Actor Core Integration
 * Tests all 18 modules and napi-rs integration
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { ThreatIntelService } from '../src/services/EnhancedThreatIntelService';
import { phantomThreatActorCore, isThreatActorCoreAvailable } from '../src/integrations/phantomThreatActorCore';

describe('Phantom Threat Actor Core - 18 Module Integration', () => {
  let threatIntelService: ThreatIntelService;

  beforeAll(() => {
    threatIntelService = new ThreatIntelService();
  });

  describe('Core System Integration', () => {
    test('should initialize napi-rs core successfully', () => {
      const isAvailable = isThreatActorCoreAvailable();
      expect(isAvailable).toBe(true);
    });

    test('should return intelligence summary with 18 modules', () => {
      if (phantomThreatActorCore.isReady()) {
        const summary = phantomThreatActorCore.getIntelligenceSummary();
        expect(summary.modules).toBe(18);
        expect(summary.version).toBe('2.1.0');
        expect(summary.capabilities).toHaveLength(18);
      } else {
        console.log('NAPI core not available - testing service layer only');
      }
    });

    test('should return all 18 modules in active status', () => {
      if (phantomThreatActorCore.isReady()) {
        const moduleStatus = phantomThreatActorCore.getModuleStatus();
        const moduleNames = Object.keys(moduleStatus);
        
        expect(moduleNames).toHaveLength(18);
        expect(moduleNames).toContain('advanced_attribution');
        expect(moduleNames).toContain('campaign_lifecycle');
        expect(moduleNames).toContain('reputation_system');
        expect(moduleNames).toContain('realtime_alerts');
        
        // All modules should be active
        Object.values(moduleStatus).forEach(status => {
          expect(status).toBe('active');
        });
      }
    });
  });

  describe('Module 1: Advanced Attribution Engine', () => {
    test('should perform advanced attribution analysis', async () => {
      const request = {
        indicators: ['malicious.domain.com', '192.168.1.100', 'evil.exe'],
        context: { campaign: 'Operation Ghost' },
        confidence_threshold: 0.75
      };

      const result = await threatIntelService.performAdvancedAttribution(request);
      
      expect(result).toBeDefined();
      expect(result.analysis_id).toBeDefined();
      expect(result.primary_attribution).toBeDefined();
      expect(result.confidence_breakdown).toBeDefined();
      expect(result.ml_predictions).toBeDefined();
      expect(result.primary_attribution.confidence_score).toBeGreaterThan(0.5);
    });
  });

  describe('Module 2: Campaign Lifecycle Tracker', () => {
    test('should start campaign tracking', async () => {
      const request = {
        campaign_name: 'Test Campaign',
        objectives: ['data_exfiltration', 'persistence'],
        targets: [{ sector: 'finance', geography: 'US' }]
      };

      const result = await threatIntelService.startCampaignTracking(request);
      
      expect(result).toBeDefined();
      expect(result.campaign_id).toBeDefined();
      expect(result.status).toBe('tracking_initiated');
      expect(result.lifecycle_stage).toBe('planning');
    });

    test('should update campaign stage', async () => {
      const campaignId = 'test-campaign-123';
      const newStage = 'execution';
      
      const result = await threatIntelService.updateCampaignStage(campaignId, newStage);
      
      expect(result).toBeDefined();
      expect(result.new_stage).toBe(newStage);
    });
  });

  describe('Module 3: Threat Actor Reputation System', () => {
    test('should analyze actor reputation', async () => {
      const actorId = 'apt-29';
      const factors = {
        sophistication: 0.9,
        activity_frequency: 0.8,
        success_rate: 0.7,
        impact_magnitude: 0.85
      };

      const result = await threatIntelService.analyzeActorReputation(actorId, factors);
      
      expect(result).toBeDefined();
      expect(result.actor_id).toBe(actorId);
      expect(result.overall_reputation_score).toBeGreaterThan(0);
      expect(result.overall_reputation_score).toBeLessThanOrEqual(100);
      expect(result.reputation_category).toBeDefined();
    });

    test('should get reputation rankings', async () => {
      const rankings = await threatIntelService.getReputationRankings(10);
      
      expect(Array.isArray(rankings)).toBe(true);
      if (rankings.length > 0) {
        expect(rankings[0]).toHaveProperty('rank');
        expect(rankings[0].rank).toBe(1);
      }
    });
  });

  describe('Module 4: Behavioral Pattern Analyzer', () => {
    test('should analyze behavioral patterns', async () => {
      const request = {
        actor_id: 'apt-29',
        activities: [
          { type: 'phishing', timestamp: '2024-01-01T10:00:00Z' },
          { type: 'lateral_movement', timestamp: '2024-01-01T11:00:00Z' }
        ],
        timeframe: '30d'
      };

      const result = await threatIntelService.analyzeBehavioralPatterns(request);
      
      expect(result).toBeDefined();
      expect(result.actor_id).toBe(request.actor_id);
      expect(result.behavioral_patterns).toBeDefined();
      expect(Array.isArray(result.behavioral_patterns)).toBe(true);
      expect(result.predictive_indicators).toBeDefined();
    });
  });

  describe('Module 5: TTP Evolution Tracker', () => {
    test('should track TTP evolution', async () => {
      const request = {
        actor_id: 'apt-29',
        timeframe: '90d'
      };

      const result = await threatIntelService.trackTTPEvolution(request);
      
      expect(result).toBeDefined();
      expect(result.evolution_analysis).toBeDefined();
      expect(result.predictions).toBeDefined();
      expect(Array.isArray(result.predictions)).toBe(true);
    });
  });

  describe('Module 6: Infrastructure Analysis Engine', () => {
    test('should analyze infrastructure', async () => {
      const request = {
        indicators: ['malicious.com', '192.168.1.100', 'evil.domain.net'],
        analysis_depth: 'comprehensive'
      };

      const result = await threatIntelService.analyzeInfrastructure(request);
      
      expect(result).toBeDefined();
      expect(result.analysis_id).toBeDefined();
      expect(result.infrastructure_map).toBeDefined();
      expect(result.threat_score).toBeGreaterThan(0);
    });
  });

  describe('Module 7: Risk Assessment Calculator', () => {
    test('should calculate risk assessment', async () => {
      const request = {
        assessment_type: 'comprehensive',
        assets: [
          { type: 'server', criticality: 'high' },
          { type: 'database', criticality: 'critical' }
        ],
        threat_actors: ['apt-29', 'lazarus']
      };

      const result = await threatIntelService.calculateRiskAssessment(request);
      
      expect(result).toBeDefined();
      expect(result.assessment_id).toBeDefined();
      expect(result.risk_score).toBeGreaterThan(0);
      expect(result.risk_factors).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('Module 8: Impact Assessment Engine', () => {
    test('should assess impact', async () => {
      const request = {
        actor_id: 'apt-29',
        target_assets: [
          { asset_id: 'prod-db-01', value: 1000000 },
          { asset_id: 'web-server-01', value: 50000 }
        ],
        attack_scenarios: ['ransomware', 'data_theft']
      };

      const result = await threatIntelService.assessImpact(request);
      
      expect(result).toBeDefined();
      expect(result.impact_analysis).toBeDefined();
      expect(result.impact_analysis.financial_impact).toBeGreaterThan(0);
      expect(Array.isArray(result.mitigation_strategies)).toBe(true);
    });
  });

  describe('Module 9: Threat Landscape Mapper', () => {
    test('should generate threat landscape', async () => {
      const request = {
        geography: 'global',
        sector: 'finance',
        timeframe: '30d'
      };

      const result = await threatIntelService.generateThreatLandscape(request);
      
      expect(result).toBeDefined();
      expect(result.threat_actors).toBeDefined();
      expect(Array.isArray(result.threat_actors)).toBe(true);
      expect(result.threat_trends).toBeDefined();
      expect(result.regional_hotspots).toBeDefined();
    });
  });

  describe('Module 10-18: Additional Modules', () => {
    test('should analyze industry targeting', async () => {
      const request = { sector: 'healthcare', actor_id: 'apt-29' };
      const result = await threatIntelService.analyzeIndustryTargeting(request);
      expect(result).toBeDefined();
      expect(result.targeting_patterns).toBeDefined();
    });

    test('should analyze geographic threats', async () => {
      const request = { region: 'asia-pacific', country: 'US' };
      const result = await threatIntelService.analyzeGeographicThreats(request);
      expect(result).toBeDefined();
      expect(result.threat_density).toBeGreaterThanOrEqual(0);
    });

    test('should assess supply chain risk', async () => {
      const request = { vendors: ['vendor1', 'vendor2'], dependencies: [] };
      const result = await threatIntelService.assessSupplyChainRisk(request);
      expect(result).toBeDefined();
      expect(result.assessment_id).toBeDefined();
    });

    test('should generate executive dashboard', async () => {
      const request = { timeframe: '7d', focus_areas: ['risk', 'threats'] };
      const result = await threatIntelService.generateExecutiveDashboard(request);
      expect(result).toBeDefined();
      expect(result.key_metrics).toBeDefined();
    });

    test('should generate compliance report', async () => {
      const request = { compliance_framework: 'NIST', report_type: 'assessment' };
      const result = await threatIntelService.generateComplianceReport(request);
      expect(result).toBeDefined();
      expect(result.report_id).toBeDefined();
    });

    test('should coordinate incident response', async () => {
      const request = { incident_id: 'inc-123', response_actions: ['isolate', 'analyze'] };
      const result = await threatIntelService.coordinateIncidentResponse(request);
      expect(result).toBeDefined();
      expect(result.coordination_id).toBeDefined();
    });

    test('should automate threat hunting', async () => {
      const request = { hunt_type: 'apt_detection', indicators: ['ioc1', 'ioc2'] };
      const result = await threatIntelService.automateThreatHunting(request);
      expect(result).toBeDefined();
      expect(result.hunt_id).toBeDefined();
    });

    test('should share intelligence', async () => {
      const request = { protocol: 'STIX', recipients: ['partner1'], data: {} };
      const result = await threatIntelService.shareIntelligence(request);
      expect(result).toBeDefined();
      expect(result.sharing_id).toBeDefined();
    });

    test('should configure realtime alerts', async () => {
      const request = { alert_types: ['high_risk'], notification_channels: ['email'] };
      const result = await threatIntelService.configureRealtimeAlerts(request);
      expect(result).toBeDefined();
      expect(result.configuration_id).toBeDefined();
    });
  });

  describe('System Operations', () => {
    test('should generate comprehensive report', async () => {
      const request = {
        actor_id: 'apt-29',
        modules: ['advanced_attribution', 'reputation_system', 'behavioral_patterns'],
        report_format: 'detailed'
      };

      const result = await threatIntelService.generateComprehensiveReport(request);
      
      expect(result).toBeDefined();
      expect(result.report_id).toBeDefined();
      expect(result.modules_included).toEqual(request.modules);
      expect(result.report_format).toBe('detailed');
    });

    test('should return module status', async () => {
      const status = await threatIntelService.getModuleStatus();
      
      expect(status).toBeDefined();
      expect(Object.keys(status)).toHaveLength(18);
      
      // Check all expected modules are present
      const expectedModules = [
        'advanced_attribution', 'campaign_lifecycle', 'reputation_system',
        'behavioral_patterns', 'ttp_evolution', 'infrastructure_analysis',
        'risk_assessment', 'impact_assessment', 'threat_landscape',
        'industry_targeting', 'geographic_analysis', 'supply_chain_risk',
        'executive_dashboard', 'compliance_reporting', 'incident_response',
        'threat_hunting', 'intelligence_sharing', 'realtime_alerts'
      ];
      
      expectedModules.forEach(module => {
        expect(status).toHaveProperty(module);
        expect(status[module]).toBe('active');
      });
    });

    test('should perform health check', async () => {
      const health = await threatIntelService.performHealthCheck();
      
      expect(health).toBeDefined();
      expect(health.status).toBe('healthy');
      expect(health.modules_active).toBe(18);
      expect(health.api_version).toBe('2.1.0');
    });
  });
});

describe('Performance and Scalability', () => {
  test('should handle concurrent attribution requests', async () => {
    const threatIntelService = new ThreatIntelService();
    const requests = Array(10).fill(null).map((_, i) => ({
      indicators: [`domain${i}.com`, `192.168.1.${i}`],
      context: { test: `concurrent_${i}` },
      confidence_threshold: 0.7
    }));

    const startTime = Date.now();
    const results = await Promise.all(
      requests.map(req => threatIntelService.performAdvancedAttribution(req))
    );
    const endTime = Date.now();

    expect(results).toHaveLength(10);
    expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    
    results.forEach(result => {
      expect(result).toBeDefined();
      expect(result.analysis_id).toBeDefined();
    });
  });

  test('should handle large data sets efficiently', async () => {
    const threatIntelService = new ThreatIntelService();
    const largeIndicatorSet = Array(1000).fill(null).map((_, i) => `indicator_${i}.com`);

    const startTime = Date.now();
    const result = await threatIntelService.analyzeInfrastructure({
      indicators: largeIndicatorSet,
      analysis_depth: 'comprehensive'
    });
    const endTime = Date.now();

    expect(result).toBeDefined();
    expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
  });
});

// Integration test helper functions
export const testHelpers = {
  createTestActor: () => ({
    id: `test-actor-${Date.now()}`,
    name: 'Test APT Group',
    type: 'APT',
    sophistication: 0.8
  }),
  
  createTestCampaign: () => ({
    campaign_name: `Test Campaign ${Date.now()}`,
    objectives: ['test_objective'],
    targets: [{ sector: 'test', geography: 'test' }]
  }),
  
  createTestIndicators: (count = 5) => 
    Array(count).fill(null).map((_, i) => `test-indicator-${i}.com`)
};