/**
 * Basic Evidence Management Service Tests
 * Simplified test suite focused on core functionality
 */

import { EvidenceManagementService } from '../../data-layer/evidence/services/EvidenceManagementService';
import {
  EvidenceType,
  EvidenceSourceType,
  ClassificationLevel
} from '../../data-layer/evidence/interfaces/IEvidence';
import {
  IEvidenceContext,
  ICreateEvidenceRequest
} from '../../data-layer/evidence/interfaces/IEvidenceManager';

describe('Evidence Management Service - Basic Tests', () => {
  let evidenceService: EvidenceManagementService;
  let testContext: IEvidenceContext;

  beforeEach(() => {
    evidenceService = new EvidenceManagementService();
    
    testContext = {
      userId: 'test-user-123',
      userRole: 'analyst',
      permissions: ['evidence:read', 'evidence:write'],
      classification: ClassificationLevel.TLP_AMBER,
      sessionId: 'test-session-456',
      ipAddress: '192.168.1.100'
    };
  });

  describe('Basic Evidence Operations', () => {
    it('should create evidence successfully', async () => {
      const request: ICreateEvidenceRequest = {
        type: EvidenceType.IOC_EVIDENCE,
        sourceType: EvidenceSourceType.THREAT_FEED,
        sourceId: 'test-ioc-123',
        sourceSystem: 'phantom-spire-test',
        data: {
          value: '192.168.1.100',
          type: 'ip'
        },
        metadata: {
          title: 'Test Evidence',
          description: 'Test evidence for basic functionality',
          severity: 'medium',
          confidence: 75,
          format: 'json'
        },
        classification: ClassificationLevel.TLP_AMBER
      };

      const evidence = await evidenceService.createEvidence(request, testContext);

      expect(evidence).toBeDefined();
      expect(evidence.id).toBeDefined();
      expect(evidence.type).toBe(EvidenceType.IOC_EVIDENCE);
      expect(evidence.data.value).toBe('192.168.1.100');
      expect(evidence.createdBy).toBe(testContext.userId);
      expect(evidence.integrity.isValid).toBe(true);
      expect(evidence.validation.isValid).toBe(true);
    });

    it('should retrieve evidence successfully', async () => {
      const request: ICreateEvidenceRequest = {
        type: EvidenceType.THREAT_INTELLIGENCE,
        sourceType: EvidenceSourceType.HUMAN_ANALYSIS,
        sourceId: 'threat-123',
        sourceSystem: 'test-system',
        data: {
          threat_actor: 'test-actor',
          campaign: 'test-campaign'
        },
        metadata: {
          title: 'Threat Intelligence',
          description: 'Test threat intelligence',
          severity: 'high',
          confidence: 90,
          format: 'json'
        },
        classification: ClassificationLevel.TLP_GREEN
      };

      const evidence = await evidenceService.createEvidence(request, testContext);
      const retrieved = await evidenceService.getEvidence(evidence.id, testContext);

      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(evidence.id);
      expect(retrieved!.data.threat_actor).toBe('test-actor');
    });

    it('should search evidence successfully', async () => {
      // Create test evidence
      const request: ICreateEvidenceRequest = {
        type: EvidenceType.IOC_EVIDENCE,
        sourceType: EvidenceSourceType.THREAT_FEED,
        sourceId: 'search-test',
        sourceSystem: 'test-system',
        data: {
          value: 'evil.domain.com',
          type: 'domain'
        },
        metadata: {
          title: 'Evil Domain',
          description: 'Malicious domain for testing',
          severity: 'high',
          confidence: 85,
          format: 'json'
        },
        classification: ClassificationLevel.TLP_GREEN,
        tags: ['malware', 'domain']
      };

      await evidenceService.createEvidence(request, testContext);

      const searchResult = await evidenceService.searchEvidence(
        {
          types: [EvidenceType.IOC_EVIDENCE],
          tags: ['malware'],
          limit: 10
        },
        testContext
      );

      expect(searchResult.evidence.length).toBeGreaterThan(0);
      expect(searchResult.totalCount).toBeGreaterThan(0);
      expect(searchResult.facets).toBeDefined();
    });

    it('should calculate evidence metrics', async () => {
      // Create some test evidence
      const requests: ICreateEvidenceRequest[] = [
        {
          type: EvidenceType.IOC_EVIDENCE,
          sourceType: EvidenceSourceType.THREAT_FEED,
          sourceId: 'metrics-1',
          sourceSystem: 'test',
          data: { value: '1.2.3.4', type: 'ip' },
          metadata: {
            title: 'Metrics Test 1',
            description: 'Test for metrics',
            severity: 'medium',
            confidence: 70,
            format: 'json'
          },
          classification: ClassificationLevel.TLP_GREEN
        },
        {
          type: EvidenceType.VULNERABILITY,
          sourceType: EvidenceSourceType.EXTERNAL_REPORT,
          sourceId: 'metrics-2',
          sourceSystem: 'test',
          data: { cve: 'CVE-2024-TEST' },
          metadata: {
            title: 'Metrics Test 2',
            description: 'Test for metrics',
            severity: 'high',
            confidence: 85,
            format: 'json'
          },
          classification: ClassificationLevel.TLP_AMBER
        }
      ];

      for (const request of requests) {
        await evidenceService.createEvidence(request, testContext);
      }

      const metrics = await evidenceService.getEvidenceMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.totalEvidence).toBeGreaterThan(0);
      expect(metrics.evidenceByType).toBeDefined();
      expect(metrics.evidenceByClassification).toBeDefined();
      expect(metrics.averageConfidence).toBeGreaterThan(0);
      expect(metrics.qualityMetrics).toBeDefined();
      expect(metrics.custodyMetrics).toBeDefined();
    });

    it('should verify evidence integrity', async () => {
      const request: ICreateEvidenceRequest = {
        type: EvidenceType.FORENSIC_ARTIFACT,
        sourceType: EvidenceSourceType.SENSOR_DATA,
        sourceId: 'integrity-test',
        sourceSystem: 'test',
        data: {
          filename: 'test.exe',
          hash: 'abc123def456'
        },
        metadata: {
          title: 'Integrity Test',
          description: 'Test for integrity verification',
          severity: 'medium',
          confidence: 80,
          format: 'json'
        },
        classification: ClassificationLevel.TLP_WHITE
      };

      const evidence = await evidenceService.createEvidence(request, testContext);
      const integrityResult = await evidenceService.verifyIntegrity(evidence.id, testContext);

      expect(integrityResult.isValid).toBe(true);
      expect(integrityResult.algorithm).toBe('sha256');
      expect(integrityResult.currentHash).toBeDefined();
    });

    it('should handle bulk operations', async () => {
      const requests: ICreateEvidenceRequest[] = [
        {
          type: EvidenceType.IOC_EVIDENCE,
          sourceType: EvidenceSourceType.THREAT_FEED,
          sourceId: 'bulk-1',
          sourceSystem: 'test',
          data: { value: 'evil1.com', type: 'domain' },
          metadata: {
            title: 'Bulk Test 1',
            description: 'Bulk operation test',
            severity: 'low',
            confidence: 60,
            format: 'json'
          },
          classification: ClassificationLevel.TLP_WHITE
        },
        {
          type: EvidenceType.IOC_EVIDENCE,
          sourceType: EvidenceSourceType.THREAT_FEED,
          sourceId: 'bulk-2',
          sourceSystem: 'test',
          data: { value: 'evil2.com', type: 'domain' },
          metadata: {
            title: 'Bulk Test 2',
            description: 'Bulk operation test',
            severity: 'low',
            confidence: 65,
            format: 'json'
          },
          classification: ClassificationLevel.TLP_WHITE
        }
      ];

      const result = await evidenceService.bulkCreateEvidence(requests, testContext);

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Access Control', () => {
    it('should respect classification-based access control', async () => {
      const request: ICreateEvidenceRequest = {
        type: EvidenceType.THREAT_INTELLIGENCE,
        sourceType: EvidenceSourceType.HUMAN_ANALYSIS,
        sourceId: 'classified-test',
        sourceSystem: 'test',
        data: {
          sensitive_info: 'classified data'
        },
        metadata: {
          title: 'Classified Evidence',
          description: 'Evidence with high classification',
          severity: 'critical',
          confidence: 95,
          format: 'json'
        },
        classification: ClassificationLevel.SECRET
      };

      // Create evidence with high classification context
      const highClassContext = {
        ...testContext,
        classification: ClassificationLevel.SECRET
      };
      
      const evidence = await evidenceService.createEvidence(request, highClassContext);

      // Try to access with lower classification - should be denied
      const retrieved = await evidenceService.getEvidence(evidence.id, testContext);
      expect(retrieved).toBeNull();

      // Access with proper classification - should succeed
      const retrievedWithAccess = await evidenceService.getEvidence(evidence.id, highClassContext);
      expect(retrievedWithAccess).toBeDefined();
      expect(retrievedWithAccess!.id).toBe(evidence.id);
    });
  });
});

// Add a simple type fix for the classified intelligence type
declare module '../../data-layer/evidence/interfaces/IEvidence' {
  namespace EvidenceType {
    const CLASSIFIED_INTELLIGENCE: 'classified_intelligence';
  }
}