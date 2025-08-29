import { Router } from 'express';
import {
  syncMitreData,
  getMitreStats,
  getTactics,
  getTactic,
  getTechniques,
  getTechnique,
  getGroups,
  getGroup,
  getSoftware,
  getSoftwareById,
  getMitigations,
  getMitigation,
  getDataSources,
  getDataSource,
} from '../controllers/mitreController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     MitreTactic:
 *       type: object
 *       properties:
 *         mitreId:
 *           type: string
 *           description: MITRE tactic ID (e.g., TA0001)
 *         name:
 *           type: string
 *           description: Tactic name
 *         description:
 *           type: string
 *           description: Tactic description
 *         shortName:
 *           type: string
 *           description: Short name for the tactic
 *         url:
 *           type: string
 *           description: MITRE ATT&CK URL
 *         platforms:
 *           type: array
 *           items:
 *             type: string
 *           description: Applicable platforms
 *       example:
 *         mitreId: "TA0001"
 *         name: "Initial Access"
 *         description: "The adversary is trying to get into your network."
 *         shortName: "initial-access"
 *         url: "https://attack.mitre.org/tactics/TA0001/"
 *         platforms: ["Windows", "macOS", "Linux"]
 *
 *     MitreTechnique:
 *       type: object
 *       properties:
 *         mitreId:
 *           type: string
 *           description: MITRE technique ID (e.g., T1566)
 *         name:
 *           type: string
 *           description: Technique name
 *         description:
 *           type: string
 *           description: Technique description
 *         isSubTechnique:
 *           type: boolean
 *           description: Whether this is a sub-technique
 *         parentTechnique:
 *           type: string
 *           description: Parent technique ID if this is a sub-technique
 *         tactics:
 *           type: array
 *           items:
 *             type: string
 *           description: Associated tactics
 *         platforms:
 *           type: array
 *           items:
 *             type: string
 *           description: Applicable platforms
 *       example:
 *         mitreId: "T1566"
 *         name: "Phishing"
 *         description: "Adversaries may send phishing messages..."
 *         isSubTechnique: false
 *         tactics: ["initial-access"]
 *         platforms: ["Windows", "macOS", "Linux"]
 */

// Admin-only endpoints
/**
 * @swagger
 * /api/v1/mitre/sync:
 *   post:
 *     summary: Sync MITRE ATT&CK data from official source
 *     tags: [MITRE ATT&CK]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data sync completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: object
 *                   properties:
 *                     tactics:
 *                       type: number
 *                     techniques:
 *                       type: number
 *                     groups:
 *                       type: number
 *                     software:
 *                       type: number
 *                     mitigations:
 *                       type: number
 *                     dataSources:
 *                       type: number
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Sync failed
 */
router.post('/sync', syncMitreData);

// Statistics endpoint
/**
 * @swagger
 * /api/v1/mitre/stats:
 *   get:
 *     summary: Get MITRE ATT&CK data statistics
 *     tags: [MITRE ATT&CK]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: MITRE ATT&CK statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tactics:
 *                   type: number
 *                 techniques:
 *                   type: number
 *                 subTechniques:
 *                   type: number
 *                 groups:
 *                   type: number
 *                 software:
 *                   type: number
 *                 mitigations:
 *                   type: number
 *                 dataSources:
 *                   type: number
 *                 lastSync:
 *                   type: string
 *                   format: date-time
 */
router.get('/stats', getMitreStats);

// Tactics endpoints
/**
 * @swagger
 * /api/v1/mitre/tactics:
 *   get:
 *     summary: Get all MITRE tactics
 *     tags: [MITRE ATT&CK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of MITRE tactics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tactics:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MitreTactic'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/tactics', getTactics);

/**
 * @swagger
 * /api/v1/mitre/tactics/{mitreId}:
 *   get:
 *     summary: Get a specific MITRE tactic
 *     tags: [MITRE ATT&CK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mitreId
 *         required: true
 *         schema:
 *           type: string
 *         description: MITRE tactic ID (e.g., TA0001)
 *     responses:
 *       200:
 *         description: MITRE tactic details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MitreTactic'
 *       404:
 *         description: Tactic not found
 */
router.get('/tactics/:mitreId', getTactic);

// Techniques endpoints
/**
 * @swagger
 * /api/v1/mitre/techniques:
 *   get:
 *     summary: Get all MITRE techniques
 *     tags: [MITRE ATT&CK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Items per page
 *       - in: query
 *         name: tactic
 *         schema:
 *           type: string
 *         description: Filter by tactic
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Filter by platform
 *       - in: query
 *         name: isSubTechnique
 *         schema:
 *           type: boolean
 *         description: Filter sub-techniques
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, description, or MITRE ID
 *     responses:
 *       200:
 *         description: List of MITRE techniques
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 techniques:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MitreTechnique'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/techniques', getTechniques);

/**
 * @swagger
 * /api/v1/mitre/techniques/{mitreId}:
 *   get:
 *     summary: Get a specific MITRE technique
 *     tags: [MITRE ATT&CK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mitreId
 *         required: true
 *         schema:
 *           type: string
 *         description: MITRE technique ID (e.g., T1566)
 *     responses:
 *       200:
 *         description: MITRE technique details with sub-techniques
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/MitreTechnique'
 *                 - type: object
 *                   properties:
 *                     subTechniques:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MitreTechnique'
 *       404:
 *         description: Technique not found
 */
router.get('/techniques/:mitreId', getTechnique);

// Groups endpoints
/**
 * @swagger
 * /api/v1/mitre/groups:
 *   get:
 *     summary: Get all MITRE groups
 *     tags: [MITRE ATT&CK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, description, aliases, or MITRE ID
 *     responses:
 *       200:
 *         description: List of MITRE groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/groups', getGroups);

/**
 * @swagger
 * /api/v1/mitre/groups/{mitreId}:
 *   get:
 *     summary: Get a specific MITRE group
 *     tags: [MITRE ATT&CK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mitreId
 *         required: true
 *         schema:
 *           type: string
 *         description: MITRE group ID (e.g., G0001)
 *     responses:
 *       200:
 *         description: MITRE group details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Group not found
 */
router.get('/groups/:mitreId', getGroup);

// Software endpoints
/**
 * @swagger
 * /api/v1/mitre/software:
 *   get:
 *     summary: Get all MITRE software (malware/tools)
 *     tags: [MITRE ATT&CK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Items per page
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Filter by platform
 *       - in: query
 *         name: label
 *         schema:
 *           type: string
 *           enum: [malware, tool]
 *         description: Filter by software type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, description, aliases, or MITRE ID
 *     responses:
 *       200:
 *         description: List of MITRE software
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 software:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/software', getSoftware);

/**
 * @swagger
 * /api/v1/mitre/software/{mitreId}:
 *   get:
 *     summary: Get a specific MITRE software
 *     tags: [MITRE ATT&CK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mitreId
 *         required: true
 *         schema:
 *           type: string
 *         description: MITRE software ID (e.g., S0001)
 *     responses:
 *       200:
 *         description: MITRE software details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Software not found
 */
router.get('/software/:mitreId', getSoftwareById);

// Mitigations endpoints
/**
 * @swagger
 * /api/v1/mitre/mitigations:
 *   get:
 *     summary: Get all MITRE mitigations
 *     tags: [MITRE ATT&CK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, description, or MITRE ID
 *     responses:
 *       200:
 *         description: List of MITRE mitigations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mitigations:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/mitigations', getMitigations);

/**
 * @swagger
 * /api/v1/mitre/mitigations/{mitreId}:
 *   get:
 *     summary: Get a specific MITRE mitigation
 *     tags: [MITRE ATT&CK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mitreId
 *         required: true
 *         schema:
 *           type: string
 *         description: MITRE mitigation ID (e.g., M1001)
 *     responses:
 *       200:
 *         description: MITRE mitigation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Mitigation not found
 */
router.get('/mitigations/:mitreId', getMitigation);

// Data Sources endpoints
/**
 * @swagger
 * /api/v1/mitre/data-sources:
 *   get:
 *     summary: Get all MITRE data sources
 *     tags: [MITRE ATT&CK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Items per page
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Filter by platform
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, description, or MITRE ID
 *     responses:
 *       200:
 *         description: List of MITRE data sources
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dataSources:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/data-sources', getDataSources);

/**
 * @swagger
 * /api/v1/mitre/data-sources/{mitreId}:
 *   get:
 *     summary: Get a specific MITRE data source
 *     tags: [MITRE ATT&CK]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mitreId
 *         required: true
 *         schema:
 *           type: string
 *         description: MITRE data source ID (e.g., DS0001)
 *     responses:
 *       200:
 *         description: MITRE data source details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Data source not found
 */
router.get('/data-sources/:mitreId', getDataSource);

export default router;
