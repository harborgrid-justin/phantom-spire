/**
 * Information Sharing Routes
 * Backend API routes for information sharing functionality
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     ThreatIntelligenceShare:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique sharing record ID
 *         title:
 *           type: string
 *           description: Title of shared intelligence
 *         type:
 *           type: string
 *           enum: [IOC, TTP, Campaign, Actor, Vulnerability]
 *           description: Type of threat intelligence
 *         classification:
 *           type: string
 *           enum: [TLP:WHITE, TLP:GREEN, TLP:AMBER, TLP:RED]
 *           description: Traffic Light Protocol classification
 *         source:
 *           type: string
 *           description: Source organization
 *         targetOrganizations:
 *           type: array
 *           items:
 *             type: string
 *           description: Target organizations for sharing
 *         data:
 *           type: object
 *           description: The actual threat intelligence data
 *         sharedAt:
 *           type: string
 *           format: date-time
 *           description: When the intelligence was shared
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: When the sharing expires
 *         confidence:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Confidence level of the intelligence
 */

/**
 * @swagger
 * /api/v1/information-sharing/exchange:
 *   get:
 *     summary: Get shared threat intelligence
 *     tags: [Information Sharing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classification
 *         schema:
 *           type: string
 *           enum: [TLP:WHITE, TLP:GREEN, TLP:AMBER, TLP:RED]
 *         description: Filter by classification level
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [IOC, TTP, Campaign, Actor, Vulnerability]
 *         description: Filter by intelligence type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: List of shared threat intelligence
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ThreatIntelligenceShare'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
router.get('/exchange', async (req, res) => {
  try {
    const { classification, type, limit = 50 } = req.query;
    
    // Mock data for demonstration
    const mockSharedIntelligence = [
      {
        id: 'share-001',
        title: 'APT29 Infrastructure Updates',
        type: 'TTP',
        classification: 'TLP:AMBER',
        source: 'US-CERT',
        targetOrganizations: ['Financial Services ISAC', 'Energy ISAC'],
        data: {
          indicators: ['192.168.1.100', 'malicious-domain.com'],
          ttps: ['T1566.001', 'T1027'],
          description: 'Updated infrastructure used by APT29 group'
        },
        sharedAt: '2024-01-15T10:30:00Z',
        expiresAt: '2024-02-15T10:30:00Z',
        confidence: 95
      },
      {
        id: 'share-002',
        title: 'Banking Trojan IOCs',
        type: 'IOC',
        classification: 'TLP:GREEN',
        source: 'Financial Services ISAC',
        targetOrganizations: ['All Partners'],
        data: {
          indicators: ['hash:abc123', 'domain:evil-bank.com'],
          family: 'Zeus Variant',
          description: 'IOCs for new banking trojan variant'
        },
        sharedAt: '2024-01-15T09:15:00Z',
        expiresAt: '2024-03-15T09:15:00Z',
        confidence: 88
      }
    ];

    // Apply filters
    let filteredData = mockSharedIntelligence;
    if (classification) {
      filteredData = filteredData.filter(item => item.classification === classification);
    }
    if (type) {
      filteredData = filteredData.filter(item => item.type === type);
    }

    // Apply limit
    filteredData = filteredData.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: filteredData,
      pagination: {
        total: mockSharedIntelligence.length,
        page: 1,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve shared intelligence',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/information-sharing/exchange:
 *   post:
 *     summary: Share threat intelligence
 *     tags: [Information Sharing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *               - classification
 *               - data
 *               - targetOrganizations
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [IOC, TTP, Campaign, Actor, Vulnerability]
 *               classification:
 *                 type: string
 *                 enum: [TLP:WHITE, TLP:GREEN, TLP:AMBER, TLP:RED]
 *               data:
 *                 type: object
 *               targetOrganizations:
 *                 type: array
 *                 items:
 *                   type: string
 *               confidence:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Intelligence shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ThreatIntelligenceShare'
 */
router.post('/exchange', async (req, res) => {
  try {
    const { title, type, classification, data, targetOrganizations, confidence = 50, expiresAt } = req.body;

    // Validate required fields
    if (!title || !type || !classification || !data || !targetOrganizations) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['title', 'type', 'classification', 'data', 'targetOrganizations']
      });
    }

    // Create sharing record
    const sharingRecord = {
      id: `share-${Date.now()}`,
      title,
      type,
      classification,
      source: 'Current Organization', // Would get from authenticated user
      targetOrganizations,
      data,
      sharedAt: new Date().toISOString(),
      expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default 30 days
      confidence
    };

    // In a real implementation, save to database and notify target organizations

    res.status(201).json({
      success: true,
      data: sharingRecord,
      message: 'Threat intelligence shared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to share intelligence',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/information-sharing/partners:
 *   get:
 *     summary: Get list of partner organizations
 *     tags: [Information Sharing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of partner organizations
 */
router.get('/partners', async (req, res) => {
  try {
    const mockPartners = [
      {
        id: 'partner-001',
        name: 'Financial Services ISAC',
        type: 'ISAC',
        status: 'active',
        trustLevel: 'verified',
        lastActivity: '2024-01-15T10:30:00Z',
        sharedAssets: 1247,
        collaborativeProjects: 8
      },
      {
        id: 'partner-002',
        name: 'National Cyber Security Centre',
        type: 'Government',
        status: 'active',
        trustLevel: 'verified',
        lastActivity: '2024-01-15T09:15:00Z',
        sharedAssets: 2156,
        collaborativeProjects: 12
      }
    ];

    res.json({
      success: true,
      data: mockPartners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve partners',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/information-sharing/feeds:
 *   get:
 *     summary: Get available threat feeds
 *     tags: [Information Sharing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available threat feeds
 */
router.get('/feeds', async (req, res) => {
  try {
    const mockFeeds = [
      {
        id: 'feed-001',
        name: 'Open Threat Exchange',
        provider: 'AlienVault Community',
        type: 'Mixed',
        format: 'JSON',
        updateFrequency: 'Real-time',
        status: 'active',
        subscribers: 15420,
        rating: 4.7,
        isFree: true,
        isVerified: true
      },
      {
        id: 'feed-002',
        name: 'Malware Domain List',
        provider: 'MDL Community',
        type: 'Network',
        format: 'CSV',
        updateFrequency: 'Daily',
        status: 'active',
        subscribers: 8900,
        rating: 4.3,
        isFree: true,
        isVerified: true
      }
    ];

    res.json({
      success: true,
      data: mockFeeds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feeds',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/information-sharing/agreements:
 *   get:
 *     summary: Get information sharing agreements
 *     tags: [Information Sharing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sharing agreements
 */
router.get('/agreements', async (req, res) => {
  try {
    const mockAgreements = [
      {
        id: 'agreement-001',
        title: 'Financial ISAC Bilateral Intelligence Sharing',
        type: 'Bilateral',
        status: 'active',
        effectiveDate: '2023-06-15',
        expirationDate: '2024-06-15',
        classification: 'TLP:AMBER',
        parties: ['Our Organization', 'Financial Services ISAC']
      },
      {
        id: 'agreement-002',
        title: 'Multi-Government Cyber Threat Sharing MOU',
        type: 'Multilateral',
        status: 'active',
        effectiveDate: '2023-09-01',
        expirationDate: '2025-09-01',
        classification: 'TLP:GREEN',
        parties: ['Our Organization', 'US-CERT', 'NCSC-UK', 'CERT-EU']
      }
    ];

    res.json({
      success: true,
      data: mockAgreements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve agreements',
      details: error.message
    });
  }
});

export default router;