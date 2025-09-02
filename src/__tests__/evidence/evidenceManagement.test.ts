/**
 * Evidence Management Service Tests
 * Comprehensive test suite for Fortune 100-grade evidence management
 */

import { EvidenceManagementService } from '../../data-layer/evidence/services/EvidenceManagementService.js';
import { EvidenceAnalyticsEngine } from '../../data-layer/evidence/services/EvidenceAnalyticsEngine.js';
import {
  EvidenceType,
  EvidenceSourceType,
  ClassificationLevel,
  CustodyAction,
} from '../../data-layer/evidence/interfaces/IEvidence.js';
import {
  IEvidenceContext,
  ICreateEvidenceRequest,
} from '../../data-layer/evidence/interfaces/IEvidenceManager.js';

describe('Evidence Management Service', () => {
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
      ipAddress: '192.168.1.100',
    };
  });

  describe('Evidence Creation and Management', () => {
    it('should create evidence with complete chain of custody', async () => {
      const request: ICreateEvidenceRequest = {
        type: EvidenceType.IOC_EVIDENCE,
        sourceType: EvidenceSourceType.THREAT_FEED,
        sourceId: 'ioc-12345',
        sourceSystem: 'phantom-spire-test',
        data: {
          value: '192.168.1.100',
          type: 'ip',
          confidence: 85,
          severity: 'high',
          tags: ['malware', 'c2'],
        },
        metadata: {
          title: 'Suspicious IP Address',
          description: 'IP address associated with malware C2',
          severity: 'high',
          confidence: 85,
          format: 'json',
        },
        classification: ClassificationLevel.TLP_AMBER,
        tags: ['threat-intelligence', 'c2-server'],
      };

      const evidence = await evidenceService.createEvidence(
        request,
        testContext
      );

      expect(evidence).toBeDefined();
      expect(evidence.id).toBeDefined();
      expect(evidence.type).toBe(EvidenceType.IOC_EVIDENCE);
      expect(evidence.sourceType).toBe(EvidenceSourceType.THREAT_FEED);
      expect(evidence.data.value).toBe('192.168.1.100');
      expect(evidence.classification).toBe(ClassificationLevel.TLP_AMBER);
      expect(evidence.createdBy).toBe(testContext.userId);
      expect(evidence.chainOfCustody).toHaveLength(1);
      expect(evidence.chainOfCustody[0]?.action).toBe(CustodyAction.CREATED);
      expect(evidence.integrity.isValid).toBe(true);
      expect(evidence.validation.isValid).toBe(true);
    });

    it('should retrieve evidence with proper access control', async () => {
      const request: ICreateEvidenceRequest = {
        type: EvidenceType.THREAT_INTELLIGENCE,
        sourceType: EvidenceSourceType.HUMAN_ANALYSIS,
        sourceId: 'threat-analysis-789',
        sourceSystem: 'phantom-spire-test',
        data: {
          campaign: 'APT-TEST-001',
          ttps: ['T1055', 'T1027'],
          attribution: 'test-actor',
        },
        metadata: {
          title: 'APT Campaign Analysis',
          description: 'Analysis of test APT campaign',
          severity: 'high',
          confidence: 90,
          format: 'json',
        },
        classification: ClassificationLevel.TLP_RED,
      };

      const evidence = await evidenceService.createEvidence(
        request,
        testContext
      );

      // Test access with same classification level
      const retrieved = await evidenceService.getEvidence(
        evidence.id,
        testContext
      );
      expect(retrieved).toBeNull(); // Should fail due to higher classification

      // Test access with higher classification
      const highClassificationContext = {
        ...testContext,
        classification: ClassificationLevel.TLP_RED,
      };
      const retrievedWithAccess = await evidenceService.getEvidence(
        evidence.id,
        highClassificationContext
      );
      expect(retrievedWithAccess).toBeDefined();
      expect(retrievedWithAccess!.id).toBe(evidence.id);
    });

    it('should update evidence and track custody changes', async () => {
      const request: ICreateEvidenceRequest = {
        type: EvidenceType.FORENSIC_ARTIFACT,
        sourceType: EvidenceSourceType.SENSOR_DATA,
        sourceId: 'artifact-456',
        sourceSystem: 'phantom-spire-test',
        data: {
          filename: 'suspicious.exe',
          hash: 'abc123def456',
          size: 1024000,
        },
        metadata: {
          title: 'Suspicious Executable',
          description: 'Potentially malicious executable file',
          severity: 'medium',
          confidence: 70,
          format: 'binary',
        },
        classification: ClassificationLevel.TLP_GREEN,
      };

      const evidence = await evidenceService.createEvidence(
        request,
        testContext
      );
      expect(evidence.chainOfCustody).toHaveLength(1);

      // Update the evidence
      const updatedEvidence = await evidenceService.updateEvidence(
        evidence.id,
        {
          metadata: {
            confidence: 90,
            severity: 'high',
          },
          tags: ['malware', 'trojan'],
        },
        testContext
      );

      expect(updatedEvidence.metadata.confidence).toBe(90);
      expect(updatedEvidence.metadata.severity).toBe('high');
      expect(updatedEvidence.tags).toContain('malware');
      expect(updatedEvidence.tags).toContain('trojan');
      expect(updatedEvidence.version).toBe(2);
      expect(updatedEvidence.chainOfCustody).toHaveLength(2);
      expect(updatedEvidence.chainOfCustody[1]?.action).toBe(
        CustodyAction.ANALYZED
      );
    });
  });

  describe('Evidence Search and Query', () => {
    beforeEach(async () => {
      // Create test evidence
      const evidenceRequests: ICreateEvidenceRequest[] = [
        {
          type: EvidenceType.IOC_EVIDENCE,
          sourceType: EvidenceSourceType.THREAT_FEED,
          sourceId: 'ioc-1',
          sourceSystem: 'test-system',
          data: { value: '1.2.3.4', type: 'ip' },
          metadata: {
            title: 'Malicious IP 1',
            description: 'Test IP 1',
            severity: 'high',
            confidence: 85,
            format: 'json',
          },
          classification: ClassificationLevel.TLP_AMBER,
          tags: ['malware', 'c2'],
        },
        {
          type: EvidenceType.IOC_EVIDENCE,
          sourceType: EvidenceSourceType.HONEYPOT,
          sourceId: 'ioc-2',
          sourceSystem: 'test-system',
          data: { value: '5.6.7.8', type: 'ip' },
          metadata: {
            title: 'Malicious IP 2',
            description: 'Test IP 2',
            severity: 'medium',
            confidence: 70,
            format: 'json',
          },
          classification: ClassificationLevel.TLP_GREEN,
          tags: ['scan', 'recon'],
        },
      ];

      for (const request of evidenceRequests) {
        await evidenceService.createEvidence(request, testContext);
      }
    });

    it('should search evidence by type', async () => {
      const result = await evidenceService.searchEvidence(
        {
          types: [EvidenceType.IOC_EVIDENCE],
          limit: 10,
        },
        testContext
      );

      expect(result.evidence).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(
        result.evidence.every(e => e.type === EvidenceType.IOC_EVIDENCE)
      ).toBe(true);
    });

    it('should search evidence by tags', async () => {
      const result = await evidenceService.searchEvidence(
        {
          tags: ['malware'],
          limit: 10,
        },
        testContext
      );

      expect(result.evidence).toHaveLength(1);
      expect(result.evidence[0]?.tags).toContain('malware');
    });

    it('should search evidence by severity', async () => {
      const result = await evidenceService.searchEvidence(
        {
          severities: ['high'],
          limit: 10,
        },
        testContext
      );

      expect(result.evidence).toHaveLength(1);
      expect(result.evidence[0]?.metadata.severity).toBe('high');
    });

    it('should search evidence with confidence range', async () => {
      const result = await evidenceService.searchEvidence(
        {
          confidenceRange: { min: 80, max: 100 },
          limit: 10,
        },
        testContext
      );

      expect(result.evidence).toHaveLength(1);
      expect(result.evidence[0]?.metadata.confidence).toBeGreaterThanOrEqual(
        80
      );
    });

    it('should return facets with search results', async () => {
      const result = await evidenceService.searchEvidence(
        { limit: 10 },
        testContext
      );

      expect(result.facets).toBeDefined();
      expect(result.facets.types).toBeDefined();
      expect(result.facets.sourceTypes).toBeDefined();
      expect(result.facets.classifications).toBeDefined();
      expect(result.facets.tags).toBeDefined();
    });
  });

  describe('Chain of Custody', () => {
    it('should maintain complete custody chain', async () => {
      const request: ICreateEvidenceRequest = {
        type: EvidenceType.NETWORK_TRAFFIC,
        sourceType: EvidenceSourceType.SENSOR_DATA,
        sourceId: 'traffic-capture-123',
        sourceSystem: 'phantom-spire-test',
        data: {
          protocol: 'HTTP',
          src_ip: '192.168.1.10',
          dst_ip: '10.0.0.1',
          payload: 'GET /malware.exe',
        },
        metadata: {
          title: 'Suspicious Network Traffic',
          description: 'HTTP request for malware',
          severity: 'high',
          confidence: 95,
          format: 'pcap',
        },
        classification: ClassificationLevel.TLP_AMBER,
      };

      const evidence = await evidenceService.createEvidence(
        request,
        testContext
      );

      // Add custom custody entry
      await evidenceService.addCustodyEntry(
        evidence.id,
        {
          action: CustodyAction.ANALYZED,
          details: 'Analyzed by security team',
          location: 'SOC-Lab-01',
        },
        testContext
      );

      // Verify custody chain
      const custodyChain = await evidenceService.getCustodyChain(
        evidence.id,
        testContext
      );
      expect(custodyChain).toHaveLength(2);

      const verificationResult = await evidenceService.verifyCustodyChain(
        evidence.id,
        testContext
      );
      expect(verificationResult.isValid).toBe(true);
      expect(verificationResult.chainLength).toBe(2);
      expect(verificationResult.issues).toHaveLength(0);
    });
  });

  describe('Data Integrity', () => {
    it('should verify data integrity', async () => {
      const request: ICreateEvidenceRequest = {
        type: EvidenceType.MALWARE_SAMPLE,
        sourceType: EvidenceSourceType.SANDBOX,
        sourceId: 'sample-789',
        sourceSystem: 'phantom-spire-test',
        data: {
          filename: 'malware.exe',
          md5: 'abc123def456789',
          sha256: '123456789abcdef',
          behavior: ['file_create', 'registry_modify'],
        },
        metadata: {
          title: 'Malware Sample Analysis',
          description: 'Analysis results from sandbox',
          severity: 'critical',
          confidence: 98,
          format: 'json',
        },
        classification: ClassificationLevel.TLP_RED,
      };

      const evidence = await evidenceService.createEvidence(request, {
        ...testContext,
        classification: ClassificationLevel.TLP_RED,
      });

      const integrityResult = await evidenceService.verifyIntegrity(
        evidence.id,
        {
          ...testContext,
          classification: ClassificationLevel.TLP_RED,
        }
      );

      expect(integrityResult.isValid).toBe(true);
      expect(integrityResult.algorithm).toBe('sha256');
      expect(integrityResult.currentHash).toBe(integrityResult.expectedHash);
    });

    it('should recalculate hash when requested', async () => {
      const request: ICreateEvidenceRequest = {
        type: EvidenceType.VULNERABILITY,
        sourceType: EvidenceSourceType.EXTERNAL_REPORT,
        sourceId: 'cve-2024-test',
        sourceSystem: 'phantom-spire-test',
        data: {
          cve_id: 'CVE-2024-TEST',
          severity: 'high',
          description: 'Test vulnerability',
          affected_systems: ['windows', 'linux'],
        },
        metadata: {
          title: 'Critical Vulnerability Report',
          description: 'New critical vulnerability discovered',
          severity: 'critical',
          confidence: 90,
          format: 'json',
        },
        classification: ClassificationLevel.TLP_WHITE,
      };

      const evidence = await evidenceService.createEvidence(
        request,
        testContext
      );
      const originalHash = evidence.integrity.hash;

      const newHash = await evidenceService.recalculateHash(
        evidence.id,
        testContext
      );

      expect(newHash).toBeDefined();
      expect(newHash).toBe(originalHash); // Should be same since data didn't change
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk evidence creation', async () => {
      const requests: ICreateEvidenceRequest[] = [
        {
          type: EvidenceType.IOC_EVIDENCE,
          sourceType: EvidenceSourceType.THREAT_FEED,
          sourceId: 'bulk-1',
          sourceSystem: 'test',
          data: { value: 'evil1.com', type: 'domain' },
          metadata: {
            title: 'Bulk Evidence 1',
            description: 'Test bulk 1',
            severity: 'medium',
            confidence: 75,
            format: 'json',
          },
          classification: ClassificationLevel.TLP_GREEN,
        },
        {
          type: EvidenceType.IOC_EVIDENCE,
          sourceType: EvidenceSourceType.THREAT_FEED,
          sourceId: 'bulk-2',
          sourceSystem: 'test',
          data: { value: 'evil2.com', type: 'domain' },
          metadata: {
            title: 'Bulk Evidence 2',
            description: 'Test bulk 2',
            severity: 'medium',
            confidence: 75,
            format: 'json',
          },
          classification: ClassificationLevel.TLP_GREEN,
        },
      ];

      const result = await evidenceService.bulkCreateEvidence(
        requests,
        testContext
      );

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Evidence Relationships', () => {
    it('should add and manage evidence relationships', async () => {
      // Create two pieces of evidence
      const evidence1 = await evidenceService.createEvidence(
        {
          type: EvidenceType.IOC_EVIDENCE,
          sourceType: EvidenceSourceType.THREAT_FEED,
          sourceId: 'rel-test-1',
          sourceSystem: 'test',
          data: { value: '1.1.1.1', type: 'ip' },
          metadata: {
            title: 'Related Evidence 1',
            description: 'First piece of related evidence',
            severity: 'high',
            confidence: 85,
            format: 'json',
          },
          classification: ClassificationLevel.TLP_AMBER,
        },
        testContext
      );

      const evidence2 = await evidenceService.createEvidence(
        {
          type: EvidenceType.IOC_EVIDENCE,
          sourceType: EvidenceSourceType.THREAT_FEED,
          sourceId: 'rel-test-2',
          sourceSystem: 'test',
          data: { value: 'evil.com', type: 'domain' },
          metadata: {
            title: 'Related Evidence 2',
            description: 'Second piece of related evidence',
            severity: 'high',
            confidence: 85,
            format: 'json',
          },
          classification: ClassificationLevel.TLP_AMBER,
        },
        testContext
      );

      // Add relationship
      await evidenceService.addRelationship(
        evidence1.id,
        evidence2.id,
        {
          relationshipType: 'correlates_with',
          confidence: 85,
          description: 'Both IOCs part of same campaign',
          evidence: ['temporal_correlation', 'same_source_campaign'],
        },
        testContext
      );

      // Find related evidence
      const relatedEvidence = await evidenceService.findRelatedEvidence(
        evidence1.id,
        testContext
      );

      expect(relatedEvidence).toHaveLength(1);
      expect(relatedEvidence[0]?.id).toBe(evidence2.id);
    });
  });

  describe('Evidence Metrics', () => {
    it('should generate comprehensive evidence metrics', async () => {
      // Create some test evidence first
      await evidenceService.createEvidence(
        {
          type: EvidenceType.CAMPAIGN_EVIDENCE,
          sourceType: EvidenceSourceType.HUMAN_ANALYSIS,
          sourceId: 'metrics-test',
          sourceSystem: 'test',
          data: { campaign: 'TEST-METRICS' },
          metadata: {
            title: 'Metrics Test Evidence',
            description: 'Evidence for metrics testing',
            severity: 'high',
            confidence: 90,
            format: 'json',
          },
          classification: ClassificationLevel.TLP_AMBER,
        },
        testContext
      );

      const metrics = await evidenceService.getEvidenceMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.totalEvidence).toBeGreaterThan(0);
      expect(metrics.evidenceByType).toBeDefined();
      expect(metrics.evidenceByClassification).toBeDefined();
      expect(metrics.averageConfidence).toBeGreaterThan(0);
      expect(metrics.qualityMetrics).toBeDefined();
      expect(metrics.custodyMetrics).toBeDefined();
    });
  });
});

describe('Evidence Analytics Engine', () => {
  let evidenceService: EvidenceManagementService;
  let analyticsEngine: EvidenceAnalyticsEngine;
  let testContext: IEvidenceContext;

  beforeEach(() => {
    evidenceService = new EvidenceManagementService();
    analyticsEngine = new EvidenceAnalyticsEngine(evidenceService);

    testContext = {
      userId: 'test-analyst',
      userRole: 'senior-analyst',
      permissions: ['evidence:read', 'evidence:write', 'evidence:analyze'],
      classification: ClassificationLevel.TLP_AMBER,
      sessionId: 'analytics-session',
      ipAddress: '192.168.1.50',
    };
  });

  describe('Single Evidence Analysis', () => {
    it('should analyze single evidence for quality issues', async () => {
      // Create evidence with low confidence
      const evidence = await evidenceService.createEvidence(
        {
          type: EvidenceType.IOC_EVIDENCE,
          sourceType: EvidenceSourceType.OSINT,
          sourceId: 'low-confidence-test',
          sourceSystem: 'test',
          data: { value: 'suspicious.domain.com', type: 'domain' },
          metadata: {
            title: 'Low Confidence IOC',
            description: 'IOC with low confidence rating',
            severity: 'medium',
            confidence: 35, // Low confidence
            format: 'json',
          },
          classification: ClassificationLevel.TLP_GREEN,
        },
        testContext
      );

      const findings = await analyticsEngine.analyzeSingleEvidence(
        evidence.id,
        testContext
      );

      expect(findings).toBeDefined();
      expect(findings.length).toBeGreaterThan(0);

      const lowConfidenceFinding = findings.find(
        f => f.title === 'Low Confidence Evidence'
      );
      expect(lowConfidenceFinding).toBeDefined();
      expect(lowConfidenceFinding!.type).toBe('quality_issue');
      expect(lowConfidenceFinding!.severity).toBe('medium');
    });
  });

  describe('Comprehensive Evidence Analysis', () => {
    it('should perform comprehensive analysis on multiple evidence items', async () => {
      // Create multiple related evidence items
      const evidenceIds = [];

      for (let i = 0; i < 3; i++) {
        const evidence = await evidenceService.createEvidence(
          {
            type: EvidenceType.IOC_EVIDENCE,
            sourceType: EvidenceSourceType.THREAT_FEED,
            sourceId: `comprehensive-test-${i}`,
            sourceSystem: 'test-comprehensive',
            data: {
              value: `192.168.1.${100 + i}`,
              type: 'ip',
              campaign: 'TEST-CAMPAIGN-001',
            },
            metadata: {
              title: `Comprehensive Test Evidence ${i + 1}`,
              description: `Evidence ${i + 1} for comprehensive analysis`,
              severity: 'high',
              confidence: 85 + i * 5,
              format: 'json',
            },
            classification: ClassificationLevel.TLP_AMBER,
            tags: ['test-campaign', 'comprehensive-analysis'],
          },
          testContext
        );

        evidenceIds.push(evidence.id);
      }

      const analysisResult = await analyticsEngine.analyzeEvidence(
        evidenceIds,
        testContext,
        {
          include_correlations: true,
          include_patterns: true,
          include_risk_assessment: true,
          include_recommendations: true,
          analysis_depth: 'comprehensive',
        }
      );

      expect(analysisResult).toBeDefined();
      expect(analysisResult.analysisId).toBeDefined();
      expect(analysisResult.evidenceAnalyzed).toBe(3);
      expect(analysisResult.findings).toBeDefined();
      expect(analysisResult.correlations).toBeDefined();
      expect(analysisResult.patterns).toBeDefined();
      expect(analysisResult.riskAssessment).toBeDefined();
      expect(analysisResult.recommendations).toBeDefined();
      expect(analysisResult.quality.completeness).toBe(100);
      expect(analysisResult.quality.depth).toBe(100); // Comprehensive analysis
    });
  });

  describe('Temporal Correlations', () => {
    it('should find temporal correlations between evidence', async () => {
      // Create evidence with close timestamps
      const baseTime = new Date();
      const evidenceIds = [];

      for (let i = 0; i < 2; i++) {
        const evidence = await evidenceService.createEvidence(
          {
            type: EvidenceType.ATTACK_PATTERN,
            sourceType: EvidenceSourceType.SENSOR_DATA,
            sourceId: `temporal-test-${i}`,
            sourceSystem: 'test-temporal',
            data: {
              technique: `T10${i}${i}`,
              timestamp: new Date(baseTime.getTime() + i * 30000), // 30 seconds apart
            },
            metadata: {
              title: `Temporal Test Evidence ${i + 1}`,
              description: `Evidence for temporal correlation testing`,
              severity: 'high',
              confidence: 90,
              format: 'json',
            },
            classification: ClassificationLevel.TLP_AMBER,
          },
          testContext
        );

        evidenceIds.push(evidence.id);
      }

      const correlations = await analyticsEngine.findTemporalCorrelations(
        evidenceIds,
        testContext,
        3600000 // 1 hour window
      );

      expect(correlations).toBeDefined();
      expect(correlations.length).toBeGreaterThan(0);

      const correlation = correlations[0];
      expect(correlation?.correlation_type).toBe('temporal');
      expect(correlation?.strength).toBeGreaterThan(50);
    });
  });
});
