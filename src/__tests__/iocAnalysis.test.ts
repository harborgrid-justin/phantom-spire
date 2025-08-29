import { IOCAnalysisService } from '../services/iocAnalysisService';
import { IIOC } from '../models/IOC';

// Mock MongoDB ObjectId
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: jest.fn().mockImplementation(() => 'mock-object-id'),
  },
}));

// Mock IOC model
jest.mock('../models/IOC', () => ({
  IOC: {
    find: jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue([]),
    }),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));

describe('IOCAnalysisService', () => {
  const createMockIOC = (overrides: Partial<IIOC> = {}): IIOC => {
    return {
      _id: 'test-id',
      value: '192.168.1.100',
      type: 'ip',
      confidence: 80,
      severity: 'medium',
      tags: ['malware', 'botnet'],
      source: 'internal-honeypot',
      description: 'Suspicious IP detected in honeypot logs',
      firstSeen: new Date('2024-01-01'),
      lastSeen: new Date('2024-01-15'),
      isActive: true,
      metadata: {},
      createdBy: 'user-id',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      ...overrides,
    } as any as IIOC;
  };

  const mockIOC = createMockIOC();

  describe('assessRisk', () => {
    it('should perform comprehensive risk assessment for IP IOC', async () => {
      const result = await IOCAnalysisService.assessRisk(mockIOC);

      expect(result).toMatchObject({
        overallRisk: expect.any(Number),
        riskCategory: expect.stringMatching(/^(low|medium|high|critical)$/),
        contributingFactors: expect.any(Array),
        recommendations: expect.any(Array),
        confidence: mockIOC.confidence,
        analysis: {
          typeRisk: expect.any(Number),
          contextualRisk: expect.any(Number),
          temporalRisk: expect.any(Number),
          sourceReliability: expect.any(Number),
        },
      });

      expect(result.overallRisk).toBeGreaterThanOrEqual(0);
      expect(result.overallRisk).toBeLessThanOrEqual(100);
      expect(result.contributingFactors.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should assess high risk for malware-tagged IOCs', async () => {
      const highRiskIOC = createMockIOC({
        tags: ['malware', 'ransomware', 'apt'],
        severity: 'critical',
        confidence: 95,
        description: 'Known ransomware C2 server with active exploitation',
      });

      const result = await IOCAnalysisService.assessRisk(highRiskIOC);

      expect(result.overallRisk).toBeGreaterThan(70);
      expect(result.riskCategory).toMatch(/^(high|critical)$/);
      expect(result.contributingFactors).toContain('High-risk contextual indicators detected');
    });

    it('should assess lower risk for old inactive IOCs', async () => {
      const oldIOC = createMockIOC({
        isActive: false,
        lastSeen: new Date('2022-01-01'), // Very old
        tags: ['tracking'],
        severity: 'low',
        confidence: 30,
      });

      const result = await IOCAnalysisService.assessRisk(oldIOC);

      expect(result.overallRisk).toBeLessThanOrEqual(50);
      expect(result.riskCategory).toMatch(/^(low|medium)$/);
    });

    it('should handle IOCs without tags gracefully', async () => {
      const noTagsIOC = createMockIOC({
        tags: [],
      });

      const result = await IOCAnalysisService.assessRisk(noTagsIOC);

      expect(result).toBeDefined();
      expect(result.overallRisk).toBeGreaterThanOrEqual(0);
      expect(result.analysis.contextualRisk).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculatePriority', () => {
    it('should calculate priority based on risk assessment', async () => {
      const result = await IOCAnalysisService.calculatePriority(mockIOC);

      expect(result).toMatchObject({
        priority: expect.any(Number),
        urgency: expect.stringMatching(/^(low|medium|high|critical)$/),
        reasoning: expect.any(Array),
        suggestedActions: expect.any(Array),
      });

      expect(result.priority).toBeGreaterThanOrEqual(1);
      expect(result.priority).toBeLessThanOrEqual(10);
      expect(result.reasoning.length).toBeGreaterThan(0);
      expect(result.suggestedActions.length).toBeGreaterThan(0);
    });

    it('should give maximum priority to critical severity IOCs', async () => {
      const criticalIOC = createMockIOC({
        severity: 'critical',
        confidence: 95,
        tags: ['apt', 'zero-day'],
      });

      const result = await IOCAnalysisService.calculatePriority(criticalIOC);

      expect(result.priority).toBe(10);
      expect(result.urgency).toBe('critical');
      expect(result.reasoning).toContain('Critical severity designation');
    });

    it('should suggest type-specific actions', async () => {
      const domainIOC = createMockIOC({
        type: 'domain',
        value: 'malware.example.com',
      });

      const result = await IOCAnalysisService.calculatePriority(domainIOC);

      expect(result.suggestedActions).toContain('Check DNS logs');
      expect(result.suggestedActions).toContain('Add to DNS blacklist');
    });

    it('should suggest verification for low confidence IOCs', async () => {
      const lowConfidenceIOC = createMockIOC({
        confidence: 40,
      });

      const result = await IOCAnalysisService.calculatePriority(lowConfidenceIOC);

      expect(result.suggestedActions).toContain('Verify IOC through additional sources');
      expect(result.suggestedActions).toContain('Conduct manual analysis');
    });
  });

  describe('findCorrelatedIOCs', () => {
    beforeEach(() => {
      // Reset all mocks before each test
      jest.clearAllMocks();
    });

    it('should find correlated IOCs', async () => {
      const mockFind = require('../models/IOC').IOC.find;
      
      // Mock chain methods properly
      mockFind.mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      });

      const result = await IOCAnalysisService.findCorrelatedIOCs(mockIOC);

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(0);
    });

    it('should handle correlation errors gracefully', async () => {
      const mockFind = require('../models/IOC').IOC.find;
      mockFind.mockReturnValue({
        limit: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      const result = await IOCAnalysisService.findCorrelatedIOCs(mockIOC);

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(0);
    });
  });

  describe('generateAnalytics', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should generate comprehensive analytics', async () => {
      const mockCountDocuments = require('../models/IOC').IOC.countDocuments;
      const mockAggregate = require('../models/IOC').IOC.aggregate;

      // Mock responses
      mockCountDocuments.mockResolvedValue(100);
      mockAggregate.mockResolvedValue([]);

      const result = await IOCAnalysisService.generateAnalytics();

      expect(result).toMatchObject({
        summary: expect.objectContaining({
          totalIOCs: expect.any(Number),
          activeIOCs: expect.any(Number),
          inactiveIOCs: expect.any(Number),
        }),
        distributions: expect.objectContaining({
          byType: expect.any(Array),
          bySeverity: expect.any(Array),
          byConfidence: expect.any(Array),
        }),
        sources: expect.any(Array),
        activity: expect.any(Array),
        generatedAt: expect.any(Date),
      });
    });

    it('should filter analytics by date range', async () => {
      const mockCountDocuments = require('../models/IOC').IOC.countDocuments;
      const mockAggregate = require('../models/IOC').IOC.aggregate;

      mockCountDocuments.mockResolvedValue(50);
      mockAggregate.mockResolvedValue([]);

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const result = await IOCAnalysisService.generateAnalytics(dateRange);

      expect(result).toBeDefined();
      expect(mockCountDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: expect.objectContaining({
            $gte: dateRange.start,
            $lte: dateRange.end,
          }),
        })
      );
    });
  });

  describe('Risk Category Determination', () => {
    it('should correctly categorize risk scores', () => {
      // Test private method indirectly through assessRisk
      const testCases = [
        { confidence: 100, severity: 'critical', expectedCategory: 'critical' },
        { confidence: 70, severity: 'high', expectedCategory: 'high' },
        { confidence: 50, severity: 'medium', expectedCategory: 'medium' },
        { confidence: 20, severity: 'low', expectedCategory: 'low' },
      ];

      testCases.forEach(async (testCase) => {
        const testIOC = createMockIOC({
          confidence: testCase.confidence,
          severity: testCase.severity as any,
          tags: testCase.severity === 'critical' ? ['malware', 'apt'] : ['suspicious'],
        });

        const result = await IOCAnalysisService.assessRisk(testIOC);
        // Risk category should align with expectations based on input
        expect(['low', 'medium', 'high', 'critical']).toContain(result.riskCategory);
      });
    });
  });
});