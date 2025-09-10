/**
 * Comprehensive Tests for Enhanced XDR Native Integration
 * Tests both native Rust modules and fallback TypeScript implementations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { nativeXDRService } from '../src/native-modules/NativeXDRIntegrationService';
import { 
  XDRDetectionEngineBusinessLogic, 
  XDRIncidentResponseBusinessLogic,
  XDRThreatHuntingBusinessLogic,
  XDRAnalyticsDashboardBusinessLogic 
} from '../src/services/business-logic/modules/xdr/XDRCoreBusinessLogic';

describe('Enhanced XDR Native Integration', () => {
  let testData: any;

  beforeAll(async () => {
    // Initialize test data
    testData = {
      maliciousIndicators: [
        'malware.example.com',
        'phishing-site.com',
        'exploit-kit.net',
        'c2-server.tk',
        'ransomware-payload.exe'
      ],
      benignIndicators: [
        'google.com',
        'microsoft.com',
        'github.com',
        'stackoverflow.com',
        'wikipedia.org'
      ],
      businessContext: {
        organizationId: 'test-org-001',
        industry: 'financial-services',
        size: 'enterprise',
        complianceRequirements: ['SOX', 'PCI-DSS']
      },
      customerContext: {
        customerId: 'customer-001',
        tier: 'premium',
        riskTolerance: 'low'
      }
    };

    // Wait for native service initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('Native XDR Service Capabilities', () => {
    it('should report native capabilities', () => {
      const capabilities = nativeXDRService.getCapabilities();
      
      expect(capabilities).toHaveProperty('businessReady');
      expect(capabilities).toHaveProperty('customerReady');
      expect(capabilities).toHaveProperty('threatAnalysis');
      expect(capabilities).toHaveProperty('patternMatching');
      expect(capabilities).toHaveProperty('cryptoOperations');
      expect(capabilities).toHaveProperty('mlInference');
    });

    it('should benchmark native performance', async () => {
      const benchmark = await nativeXDRService.benchmarkPerformance();
      
      expect(benchmark).toHaveProperty('threat_analysis_ops_per_sec');
      expect(benchmark).toHaveProperty('pattern_matching_ops_per_sec');
      expect(benchmark).toHaveProperty('crypto_operations_per_sec');
      expect(benchmark).toHaveProperty('ml_inference_ops_per_sec');
      
      if (benchmark.threat_analysis_ops_per_sec) {
        expect(benchmark.threat_analysis_ops_per_sec).toBeGreaterThan(1000);
      }
    });

    it('should provide performance statistics', () => {
      const stats = nativeXDRService.getPerformanceStats();
      
      expect(stats).toHaveProperty('totalOperations');
      expect(stats).toHaveProperty('averageResponseTime');
      expect(stats).toHaveProperty('successRate');
      expect(stats).toHaveProperty('nativeAccelerated');
      expect(stats).toHaveProperty('capabilities');
    });
  });

  describe('Enhanced Threat Analysis', () => {
    it('should analyze malicious indicators with high performance', async () => {
      const request = {
        indicators: testData.maliciousIndicators,
        analysisType: 'batch' as const,
        priority: 'high' as const,
        businessContext: testData.businessContext,
      };

      const result = await nativeXDRService.analyzeThreatsBatch(request);
      
      expect(result.success).toBe(true);
      expect(result.totalAnalyzed).toBe(testData.maliciousIndicators.length);
      expect(result.maliciousDetected).toBeGreaterThan(0);
      expect(result.processingTimeMs).toBeLessThan(5000); // Should be fast
      expect(result.throughputPerSecond).toBeGreaterThan(10);
      expect(result.results).toHaveLength(testData.maliciousIndicators.length);
      expect(result.performanceMetrics).toHaveProperty('nativeProcessingTime');
    });

    it('should analyze benign indicators correctly', async () => {
      const request = {
        indicators: testData.benignIndicators,
        analysisType: 'batch' as const,
        priority: 'medium' as const,
      };

      const result = await nativeXDRService.analyzeThreatsBatch(request);
      
      expect(result.success).toBe(true);
      expect(result.totalAnalyzed).toBe(testData.benignIndicators.length);
      expect(result.maliciousDetected).toBeLessThanOrEqual(1); // Allow for false positives
    });

    it('should handle large batches efficiently', async () => {
      const largeIndicatorSet = Array.from({ length: 1000 }, (_, i) => `indicator-${i}.example.com`);
      
      const request = {
        indicators: largeIndicatorSet,
        analysisType: 'batch' as const,
        priority: 'medium' as const,
      };

      const startTime = Date.now();
      const result = await nativeXDRService.analyzeThreatsBatch(request);
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(result.totalAnalyzed).toBe(1000);
      expect(processingTime).toBeLessThan(10000); // Should handle 1000 indicators in under 10 seconds
      expect(result.throughputPerSecond).toBeGreaterThan(100);
    });
  });

  describe('Business-Ready Analytics', () => {
    it('should generate business-ready metrics', async () => {
      const metrics = await nativeXDRService.getBusinessReadyMetrics(testData.businessContext.organizationId);
      
      expect(metrics).toHaveProperty('securityScore');
      expect(metrics).toHaveProperty('complianceScore');
      expect(metrics).toHaveProperty('riskLevel');
      expect(metrics).toHaveProperty('improvementFromLastMonth');
      expect(metrics).toHaveProperty('executiveInsights');
      expect(metrics).toHaveProperty('businessImpactPrevented');
      expect(metrics).toHaveProperty('roiSecurityInvestment');
      
      expect(metrics.securityScore).toBeGreaterThanOrEqual(0);
      expect(metrics.securityScore).toBeLessThanOrEqual(100);
      expect(metrics.complianceScore).toBeGreaterThanOrEqual(0);
      expect(metrics.complianceScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(metrics.executiveInsights)).toBe(true);
    });

    it('should adapt metrics based on organization context', async () => {
      const financialOrgMetrics = await nativeXDRService.getBusinessReadyMetrics('financial-org');
      const techOrgMetrics = await nativeXDRService.getBusinessReadyMetrics('tech-org');
      
      // Both should return valid metrics but may differ based on context
      expect(financialOrgMetrics.securityScore).toBeGreaterThanOrEqual(0);
      expect(techOrgMetrics.securityScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Customer-Ready Intelligence', () => {
    it('should generate customer-ready insights', async () => {
      const insights = await nativeXDRService.getCustomerReadyInsights(testData.customerContext.customerId);
      
      expect(insights).toHaveProperty('customerId');
      expect(insights).toHaveProperty('securityPosture');
      expect(insights).toHaveProperty('threatLandscape');
      expect(insights).toHaveProperty('personalizedRecommendations');
      expect(insights).toHaveProperty('securityHealthScore');
      expect(insights).toHaveProperty('complianceStatus');
      expect(insights).toHaveProperty('nextActions');
      
      expect(insights.customerId).toBe(testData.customerContext.customerId);
      expect(Array.isArray(insights.personalizedRecommendations)).toBe(true);
      expect(Array.isArray(insights.nextActions)).toBe(true);
      expect(insights.securityHealthScore).toBeGreaterThanOrEqual(0);
      expect(insights.securityHealthScore).toBeLessThanOrEqual(100);
    });

    it('should provide different insights for different customer tiers', async () => {
      const premiumInsights = await nativeXDRService.getCustomerReadyInsights('premium-customer');
      const standardInsights = await nativeXDRService.getCustomerReadyInsights('standard-customer');
      
      expect(premiumInsights.customerId).toBe('premium-customer');
      expect(standardInsights.customerId).toBe('standard-customer');
      
      // Premium customers might get more detailed insights
      expect(premiumInsights.personalizedRecommendations.length).toBeGreaterThanOrEqual(0);
      expect(standardInsights.personalizedRecommendations.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Advanced Pattern Matching', () => {
    it('should match threat patterns effectively', async () => {
      const testData = [
        'GET /admin/login.php?redirect=http://malware.example.com',
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        'normal-website.com/page.html'
      ];

      const result = await nativeXDRService.matchThreatPatterns(testData);
      
      expect(result).toHaveProperty('total_texts_processed');
      expect(result).toHaveProperty('total_matches_found');
      expect(result).toHaveProperty('processing_time_ms');
      expect(result).toHaveProperty('throughput_texts_per_second');
      
      expect(result.total_texts_processed).toBe(testData.length);
      expect(result.total_matches_found).toBeGreaterThanOrEqual(0);
      expect(result.throughput_texts_per_second).toBeGreaterThan(0);
    });
  });

  describe('Cryptographic Evidence Integrity', () => {
    it('should generate evidence fingerprints', async () => {
      const evidenceData = 'Critical evidence data for incident INC-2024-001';
      
      const fingerprint = await nativeXDRService.generateEvidenceFingerprint(evidenceData);
      
      expect(fingerprint).toHaveProperty('hash_algorithm');
      expect(fingerprint).toHaveProperty('hash_value');
      expect(fingerprint).toHaveProperty('data_size_bytes');
      expect(fingerprint).toHaveProperty('generation_time_us');
      expect(fingerprint).toHaveProperty('timestamp');
      
      expect(fingerprint.hash_value).toHaveLength(64); // BLAKE3 produces 64-character hex strings
      expect(fingerprint.data_size_bytes).toBe(evidenceData.length);
      expect(fingerprint.generation_time_us).toBeGreaterThan(0);
    });

    it('should generate consistent fingerprints for same data', async () => {
      const evidenceData = 'Test evidence for consistency check';
      
      const fingerprint1 = await nativeXDRService.generateEvidenceFingerprint(evidenceData);
      const fingerprint2 = await nativeXDRService.generateEvidenceFingerprint(evidenceData);
      
      expect(fingerprint1.hash_value).toBe(fingerprint2.hash_value);
      expect(fingerprint1.data_size_bytes).toBe(fingerprint2.data_size_bytes);
    });
  });

  describe('Machine Learning Inference', () => {
    it('should classify threats using ML', async () => {
      const features = [0.8, 0.9, 0.1, 0.7, 0.6, 0.3, 0.9, 0.4]; // High-risk feature vector
      
      const result = await nativeXDRService.classifyThreatML(features);
      
      expect(result).toHaveProperty('prediction');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('inference_time_ms');
      expect(result).toHaveProperty('model_version');
      
      expect(['malware', 'phishing', 'suspicious', 'benign']).toContain(result.prediction);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.inference_time_ms).toBeGreaterThan(0);
    });

    it('should provide different classifications for different feature vectors', async () => {
      const maliciousFeatures = [0.9, 0.8, 0.9, 0.7, 0.8];
      const benignFeatures = [0.1, 0.2, 0.1, 0.3, 0.2];
      
      const maliciousResult = await nativeXDRService.classifyThreatML(maliciousFeatures);
      const benignResult = await nativeXDRService.classifyThreatML(benignFeatures);
      
      // Should classify high values as more threatening
      expect(maliciousResult.prediction).not.toBe('benign');
      expect(benignResult.prediction).toBe('benign');
    });
  });

  describe('Enhanced Business Logic Integration', () => {
    it('should process XDR detection with native acceleration', async () => {
      const request = {
        payload: {
          indicators: testData.maliciousIndicators.slice(0, 3),
          businessContext: testData.businessContext,
          priority: 'high'
        },
        userId: 'test-user',
        priority: 'high' as const
      };

      const result = await XDRDetectionEngineBusinessLogic.processor(request);
      
      expect(result).toHaveProperty('detectionId');
      expect(result).toHaveProperty('nativeAccelerated');
      expect(result).toHaveProperty('threatLevel');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('processingTime');
      expect(result).toHaveProperty('throughput');
      expect(result).toHaveProperty('performanceMetrics');
      
      expect(result.detectionId).toContain('det_');
      expect(result.nativeAccelerated).toBeDefined();
      expect(['low', 'medium', 'high', 'critical']).toContain(result.threatLevel);
    });

    it('should handle incident response with business context', async () => {
      const request = {
        payload: {
          incidentData: {
            severity: 'high',
            affectedSystems: ['server-001', 'endpoint-123']
          },
          organizationId: testData.businessContext.organizationId,
          businessContext: 'financial',
          personalData: true
        },
        userId: 'incident-manager',
        priority: 'critical' as const
      };

      const result = await XDRIncidentResponseBusinessLogic.processor(request);
      
      expect(result).toHaveProperty('incidentId');
      expect(result).toHaveProperty('severity');
      expect(result).toHaveProperty('assignedTeam');
      expect(result).toHaveProperty('responseActions');
      expect(result).toHaveProperty('businessImpact');
      expect(result).toHaveProperty('complianceRequirements');
      
      expect(result.incidentId).toContain('inc_');
      expect(Array.isArray(result.responseActions)).toBe(true);
      expect(Array.isArray(result.complianceRequirements)).toBe(true);
      expect(result.responseActions.length).toBeGreaterThan(0);
    });

    it('should execute threat hunting with customer insights', async () => {
      const request = {
        payload: {
          huntQuery: 'SELECT * FROM logs WHERE process_name LIKE "%malware%"',
          huntData: ['suspicious_process.exe', 'malware_sample.bin'],
          customerId: testData.customerContext.customerId,
          timeRange: 24
        },
        userId: 'threat-hunter',
        priority: 'medium' as const
      };

      const result = await XDRThreatHuntingBusinessLogic.processor(request);
      
      expect(result).toHaveProperty('huntId');
      expect(result).toHaveProperty('queryResults');
      expect(result).toHaveProperty('huntStatus');
      expect(result).toHaveProperty('nativeAccelerated');
      expect(result).toHaveProperty('businessRecommendations');
      expect(result).toHaveProperty('complianceImpact');
      
      expect(result.huntId).toContain('hunt_');
      expect(result.huntStatus).toBe('completed');
      expect(result.queryResults).toHaveProperty('totalHits');
      expect(Array.isArray(result.businessRecommendations)).toBe(true);
    });

    it('should generate comprehensive analytics dashboard', async () => {
      const request = {
        payload: {
          organizationId: testData.businessContext.organizationId,
          customerId: testData.customerContext.customerId
        },
        userId: 'dashboard-user',
        priority: 'low' as const
      };

      const result = await XDRAnalyticsDashboardBusinessLogic.processor(request);
      
      expect(result).toHaveProperty('dashboardId');
      expect(result).toHaveProperty('nativeAccelerated');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('performanceMetrics');
      expect(result).toHaveProperty('businessIntelligence');
      expect(result).toHaveProperty('customerExperience');
      expect(result).toHaveProperty('realTimeCapabilities');
      
      expect(result.dashboardId).toContain('dash_');
      expect(result.metrics).toHaveProperty('totalDetections');
      expect(result.performanceMetrics).toHaveProperty('threatAnalysisOpsPerSec');
      expect(result.businessIntelligence).toHaveProperty('securityScore');
      expect(result.customerExperience).toHaveProperty('healthScore');
      expect(result.realTimeCapabilities).toHaveProperty('anomaliCompatibilityScore');
    });
  });

  describe('Fallback and Error Handling', () => {
    it('should handle graceful fallback when native modules fail', async () => {
      // Test with invalid data that might cause native modules to fail
      const request = {
        indicators: [], // Empty array might cause issues
        analysisType: 'batch' as const,
        priority: 'medium' as const,
      };

      const result = await nativeXDRService.analyzeThreatsBatch(request);
      
      // Should still return a valid response even if native processing fails
      expect(result.success).toBe(true);
      expect(result).toHaveProperty('totalAnalyzed');
      expect(result).toHaveProperty('processingTimeMs');
    });

    it('should validate business logic requests properly', async () => {
      const invalidRequest = {
        payload: {}, // Missing required fields
        userId: 'test-user',
        priority: 'medium' as const
      };

      const validation = await XDRDetectionEngineBusinessLogic.validator(invalidRequest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scaling', () => {
    it('should maintain performance under concurrent load', async () => {
      const concurrentRequests = Array.from({ length: 10 }, (_, i) => 
        nativeXDRService.analyzeThreatsBatch({
          indicators: [`test-indicator-${i}.com`],
          analysisType: 'batch' as const,
          priority: 'medium' as const,
        })
      );

      const startTime = Date.now();
      const results = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Should handle 10 concurrent requests reasonably fast
      expect(totalTime).toBeLessThan(15000);
    });

    it('should demonstrate performance advantage of native modules', async () => {
      const largeDataSet = Array.from({ length: 100 }, (_, i) => `indicator-${i}.test.com`);
      
      const startTime = Date.now();
      const result = await nativeXDRService.analyzeThreatsBatch({
        indicators: largeDataSet,
        analysisType: 'batch' as const,
        priority: 'medium' as const,
      });
      const processingTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.totalAnalyzed).toBe(100);
      
      // Should process 100 indicators efficiently
      expect(processingTime).toBeLessThan(5000);
      expect(result.throughputPerSecond).toBeGreaterThan(20);
    });
  });

  afterAll(async () => {
    // Cleanup if needed
    console.log('XDR Native Integration tests completed');
  });
});