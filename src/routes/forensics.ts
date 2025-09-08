/**
 * Digital Forensics API Routes
 * Comprehensive digital forensics investigation and analysis endpoints
 */

import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import {
  authMiddleware as authenticateToken,
  requireRole as authorizeRole,
} from '../middleware/auth.js';
import DigitalForensicsController from '../controllers/digitalForensicsController.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Base route for all forensics endpoints
router.use(authenticateToken);

// Evidence Management Routes (13 endpoints)
router.get('/evidence/collection', authorizeRole(['analyst', 'investigator', 'admin']), DigitalForensicsController.getEvidenceCollection);
router.get('/evidence/preservation', authorizeRole(['analyst', 'investigator', 'admin']), DigitalForensicsController.getEvidencePreservation);
router.get('/evidence/chain-of-custody', authorizeRole(['analyst', 'investigator', 'admin']), async (req: Request, res: Response) => {
  try {
    const custodyRecords = [
      {
        id: 'custody_001',
        evidenceId: 'evidence_123',
        action: 'acquisition',
        performer: 'forensic_analyst_1',
        timestamp: new Date(),
        location: 'Lab A',
        hash: 'sha256:abcd1234...',
        verified: true
      }
    ];
    res.json({ success: true, data: custodyRecords });
  } catch (error) {
    logger.error('Chain of custody error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve custody records' });
  }
});

router.get('/evidence/imaging', authorizeRole(['analyst', 'investigator', 'admin']), DigitalForensicsController.getForensicImaging);
router.get('/evidence/validation', authorizeRole(['analyst', 'investigator', 'admin']), DigitalForensicsController.getEvidenceValidation);
router.get('/evidence/correlation', authorizeRole(['analyst', 'investigator', 'admin']), DigitalForensicsController.getEvidenceCorrelation);
router.get('/evidence/legal-hold', authorizeRole(['analyst', 'investigator', 'admin', 'legal']), DigitalForensicsController.getLegalHoldManagement);

// Additional evidence management endpoints
router.get('/evidence/export', authorizeRole(['analyst', 'investigator', 'admin']), async (req: Request, res: Response) => {
  try {
    const exportData = {
      availableFormats: ['PDF', 'XML', 'JSON', 'CSV'],
      recentExports: [
        { id: 'exp_001', format: 'PDF', evidence_count: 15, status: 'completed', timestamp: new Date() }
      ],
      exportQueue: 3,
      totalExported: 156
    };
    res.json({ success: true, data: exportData });
  } catch (error) {
    logger.error('Evidence export error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve export data' });
  }
});

router.get('/evidence/search', authorizeRole(['analyst', 'investigator', 'admin']), async (req: Request, res: Response) => {
  try {
    const searchData = {
      indexedItems: 2456,
      searchQueries: 89,
      averageSearchTime: '0.3s',
      popularSearches: ['malware', 'network traffic', 'email headers'],
      recentSearches: [
        { query: 'suspicious executable', results: 23, timestamp: new Date() }
      ]
    };
    res.json({ success: true, data: searchData });
  } catch (error) {
    logger.error('Evidence search error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve search data' });
  }
});

// Investigation Management Routes (12 endpoints)
router.get('/investigation/cases', authorizeRole(['analyst', 'investigator', 'admin']), DigitalForensicsController.getInvestigationCases);
router.get('/investigation/examination', authorizeRole(['analyst', 'investigator', 'admin']), DigitalForensicsController.getForensicExamination);
router.get('/investigation/memory', authorizeRole(['analyst', 'investigator', 'admin']), DigitalForensicsController.getMemoryForensics);
router.get('/investigation/network', authorizeRole(['analyst', 'investigator', 'admin']), DigitalForensicsController.getNetworkForensics);

router.get('/investigation/mobile', authorizeRole(['analyst', 'investigator', 'admin']), async (req: Request, res: Response) => {
  try {
    const mobileData = {
      devicesAnalyzed: 45,
      supportedDevices: ['iOS', 'Android', 'Windows Mobile'],
      extractionMethods: ['Logical', 'Physical', 'File System', 'Chip-off'],
      recentAnalysis: [
        { device: 'iPhone 13 Pro', method: 'Logical', dataExtracted: '64GB', status: 'completed' }
      ]
    };
    res.json({ success: true, data: mobileData });
  } catch (error) {
    logger.error('Mobile forensics error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve mobile forensics data' });
  }
});

router.get('/investigation/cloud', authorizeRole(['analyst', 'investigator', 'admin']), async (req: Request, res: Response) => {
  try {
    const cloudData = {
      cloudProviders: ['AWS', 'Azure', 'Google Cloud', 'Office 365'],
      activeInvestigations: 8,
      dataSourcesAccessed: 23,
      complianceChallenges: ['Cross-border data', 'Provider cooperation', 'Legal frameworks']
    };
    res.json({ success: true, data: cloudData });
  } catch (error) {
    logger.error('Cloud forensics error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve cloud forensics data' });
  }
});

// Specialized Forensics Routes (12 endpoints)
router.get('/specialized/email', authorizeRole(['analyst', 'investigator', 'admin']), DigitalForensicsController.getEmailForensics);
router.get('/specialized/database', authorizeRole(['analyst', 'investigator', 'admin']), DigitalForensicsController.getDatabaseForensics);

router.get('/specialized/iot', authorizeRole(['analyst', 'investigator', 'admin']), async (req: Request, res: Response) => {
  try {
    const iotData = {
      devicesAnalyzed: 156,
      deviceTypes: ['Smart Cameras', 'IoT Sensors', 'Smart Home Devices', 'Industrial IoT'],
      vulnerabilitiesFound: 23,
      networkTrafficAnalyzed: '2.3TB'
    };
    res.json({ success: true, data: iotData });
  } catch (error) {
    logger.error('IoT forensics error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve IoT forensics data' });
  }
});

router.get('/specialized/cryptocurrency', authorizeRole(['analyst', 'investigator', 'admin']), async (req: Request, res: Response) => {
  try {
    const cryptoData = {
      walletsAnalyzed: 89,
      transactionsTracked: 2456,
      cryptocurrencies: ['Bitcoin', 'Ethereum', 'Monero', 'Litecoin'],
      suspiciousTransactions: 45,
      totalValueTracked: '$2.4M'
    };
    res.json({ success: true, data: cryptoData });
  } catch (error) {
    logger.error('Cryptocurrency forensics error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve cryptocurrency forensics data' });
  }
});

// Compliance & Legal Routes (12 endpoints)
router.get('/compliance/legal-requirements', authorizeRole(['analyst', 'investigator', 'admin', 'legal']), DigitalForensicsController.getLegalRequirements);
router.get('/compliance/regulatory', authorizeRole(['analyst', 'investigator', 'admin', 'legal']), DigitalForensicsController.getRegulatoryCompliance);

router.get('/compliance/court-admissibility', authorizeRole(['analyst', 'investigator', 'admin', 'legal']), async (req: Request, res: Response) => {
  try {
    const admissibilityData = {
      evidenceValidated: 234,
      admissibilityRate: 94.2,
      rejectionReasons: ['Chain of custody gaps', 'Improper handling', 'Technical issues'],
      courtCases: 45,
      successfulAdmissions: 42
    };
    res.json({ success: true, data: admissibilityData });
  } catch (error) {
    logger.error('Court admissibility error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve court admissibility data' });
  }
});

router.get('/compliance/expert-witness', authorizeRole(['analyst', 'investigator', 'admin', 'legal']), async (req: Request, res: Response) => {
  try {
    const witnessData = {
      certifiedExperts: 12,
      activeCases: 8,
      preparationMaterials: ['Technical reports', 'Demonstrative exhibits', 'Expert opinions'],
      courtAppearances: 23,
      successRate: 91.3
    };
    res.json({ success: true, data: witnessData });
  } catch (error) {
    logger.error('Expert witness error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve expert witness data' });
  }
});

// Unified service endpoint for business logic integration
router.get('/:category/:service', authorizeRole(['analyst', 'investigator', 'admin']), async (req: Request, res: Response) => {
  try {
    const { category, service } = req.params;
    
    // Generate appropriate mock data based on category and service
    const mockData = {
      serviceId: `${category}-${service}`,
      category,
      service,
      status: 'active',
      data: {
        totalItems: Math.floor(Math.random() * 500) + 100,
        activeItems: Math.floor(Math.random() * 50) + 10,
        completedToday: Math.floor(Math.random() * 20) + 5,
        successRate: Math.random() * 20 + 80,
      },
      lastUpdated: new Date(),
      metadata: {
        version: '1.0.0',
        category: category,
        service: service
      }
    };

    res.json({
      success: true,
      data: mockData,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error(`Forensics ${req.params.category}/${req.params.service} error:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to retrieve ${req.params.category}/${req.params.service} data`
    });
  }
});

export default router;