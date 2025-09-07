/**
 * Attack Vector Routes
 * API routes for attack vector analysis endpoints
 */

import { Router } from 'express';
import {
  getAttackVectors,
  getAttackVectorById,
  createAttackVector,
  updateAttackVector,
  deleteAttackVector,
  getAttackCampaigns,
  getAttackVectorStats,
  searchAttackVectors,
  attackVectorValidation
} from '../controllers/attackVectorController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     AttackVector:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the attack vector
 *         name:
 *           type: string
 *           description: Attack vector name
 *         category:
 *           type: string
 *           enum: [initial_access, execution, persistence, privilege_escalation, defense_evasion, credential_access, discovery, lateral_movement, collection, command_control, exfiltration, impact]
 *           description: MITRE ATT&CK tactic category
 *         subcategory:
 *           type: string
 *           description: Specific subcategory within the tactic
 *         severity:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Threat severity level
 *         description:
 *           type: string
 *           description: Detailed description of the attack vector
 *         techniques:
 *           type: array
 *           items:
 *             type: string
 *           description: Associated MITRE ATT&CK techniques
 *         platforms:
 *           type: array
 *           items:
 *             type: string
 *           description: Affected platforms
 *         tactics:
 *           type: array
 *           items:
 *             type: string
 *           description: MITRE ATT&CK tactics
 *         mitre_mappings:
 *           type: array
 *           items:
 *             type: string
 *           description: MITRE ATT&CK technique mappings
 *         indicators:
 *           type: array
 *           items:
 *             type: string
 *           description: Indicators of compromise
 *         mitigations:
 *           type: array
 *           items:
 *             type: string
 *           description: Mitigation strategies
 *         references:
 *           type: array
 *           items:
 *             type: string
 *           description: External references
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "av-1"
 *         name: "Phishing Email Attack Vector"
 *         category: "initial_access"
 *         subcategory: "phishing"
 *         severity: "high"
 *         description: "Email-based phishing attack targeting user credentials"
 *         techniques: ["T1566.001", "T1566.002"]
 *         platforms: ["Windows", "macOS", "Linux"]
 *         tactics: ["Initial Access"]
 *         mitre_mappings: ["T1566"]
 *         indicators: ["suspicious-email@evil.com", "malicious-link.com"]
 *         mitigations: ["User training", "Email security gateway"]
 *         references: ["https://attack.mitre.org/techniques/T1566/"]
 *     
 *     AttackCampaign:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique campaign identifier
 *         name:
 *           type: string
 *           description: Campaign name
 *         actor_group:
 *           type: string
 *           description: Threat actor group
 *         start_date:
 *           type: string
 *           format: date
 *         end_date:
 *           type: string
 *           format: date
 *           nullable: true
 *         vectors_used:
 *           type: array
 *           items:
 *             type: string
 *           description: Attack vectors used in campaign
 *         targets:
 *           type: array
 *           items:
 *             type: string
 *           description: Target sectors or organizations
 *         success_rate:
 *           type: number
 *           description: Campaign success rate percentage
 *         attribution_confidence:
 *           type: string
 *           enum: [low, medium, high, very_high]
 *           description: Confidence level of attribution
 *       example:
 *         id: "camp-1"
 *         name: "Operation Phishing Storm"
 *         actor_group: "APT-29"
 *         start_date: "2024-01-01"
 *         end_date: "2024-06-30"
 *         vectors_used: ["av-1"]
 *         targets: ["Finance", "Government"]
 *         success_rate: 35
 *         attribution_confidence: "high"
 *     
 *     AttackVectorStats:
 *       type: object
 *       properties:
 *         total_vectors:
 *           type: number
 *           description: Total number of attack vectors
 *         by_category:
 *           type: object
 *           description: Attack vectors grouped by category
 *         by_severity:
 *           type: object
 *           description: Attack vectors grouped by severity
 *         active_campaigns:
 *           type: number
 *           description: Number of active campaigns
 *         total_campaigns:
 *           type: number
 *           description: Total number of campaigns
 *         most_targeted_platforms:
 *           type: object
 *           description: Platform targeting statistics
 */

/**
 * @swagger
 * /api/v1/attack-vectors:
 *   get:
 *     summary: Get all attack vectors
 *     tags: [Attack Vectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [initial_access, execution, persistence, privilege_escalation, defense_evasion, credential_access, discovery, lateral_movement, collection, command_control, exfiltration, impact]
 *         description: Filter by MITRE ATT&CK category
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by severity level
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Filter by platform
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: List of attack vectors retrieved successfully
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
 *                     $ref: '#/components/schemas/AttackVector'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     total:
 *                       type: number
 *                     pages:
 *                       type: number
 *       500:
 *         description: Server error
 */
router.get('/', getAttackVectors);

/**
 * @swagger
 * /api/v1/attack-vectors/search:
 *   get:
 *     summary: Search attack vectors
 *     tags: [Attack Vectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *         description: Filter by severity
 *     responses:
 *       200:
 *         description: Search results
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
 *                     $ref: '#/components/schemas/AttackVector'
 *                 total:
 *                   type: number
 *       400:
 *         description: Bad request - search query required
 */
router.get('/search', searchAttackVectors);

/**
 * @swagger
 * /api/v1/attack-vectors/stats:
 *   get:
 *     summary: Get attack vector statistics
 *     tags: [Attack Vectors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attack vector statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AttackVectorStats'
 *       500:
 *         description: Server error
 */
router.get('/stats', getAttackVectorStats);

/**
 * @swagger
 * /api/v1/attack-vectors/campaigns:
 *   get:
 *     summary: Get attack campaigns
 *     tags: [Attack Vectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: actor
 *         schema:
 *           type: string
 *         description: Filter by threat actor group
 *       - in: query
 *         name: active_only
 *         schema:
 *           type: boolean
 *         description: Show only active campaigns
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
 *           default: 10
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of attack campaigns
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
 *                     $ref: '#/components/schemas/AttackCampaign'
 *                 pagination:
 *                   type: object
 */
router.get('/campaigns', getAttackCampaigns);

/**
 * @swagger
 * /api/v1/attack-vectors/{id}:
 *   get:
 *     summary: Get attack vector by ID
 *     tags: [Attack Vectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attack vector ID
 *     responses:
 *       200:
 *         description: Attack vector details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AttackVector'
 *       404:
 *         description: Attack vector not found
 */
router.get('/:id', getAttackVectorById);

/**
 * @swagger
 * /api/v1/attack-vectors:
 *   post:
 *     summary: Create new attack vector
 *     tags: [Attack Vectors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - severity
 *               - description
 *               - techniques
 *               - platforms
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [initial_access, execution, persistence, privilege_escalation, defense_evasion, credential_access, discovery, lateral_movement, collection, command_control, exfiltration, impact]
 *               subcategory:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               description:
 *                 type: string
 *               techniques:
 *                 type: array
 *                 items:
 *                   type: string
 *               platforms:
 *                 type: array
 *                 items:
 *                   type: string
 *               tactics:
 *                 type: array
 *                 items:
 *                   type: string
 *               mitre_mappings:
 *                 type: array
 *                 items:
 *                   type: string
 *               indicators:
 *                 type: array
 *                 items:
 *                   type: string
 *               mitigations:
 *                 type: array
 *                 items:
 *                   type: string
 *               references:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Attack vector created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AttackVector'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', attackVectorValidation, createAttackVector);

/**
 * @swagger
 * /api/v1/attack-vectors/{id}:
 *   put:
 *     summary: Update attack vector
 *     tags: [Attack Vectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attack vector ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               severity:
 *                 type: string
 *               description:
 *                 type: string
 *               techniques:
 *                 type: array
 *                 items:
 *                   type: string
 *               platforms:
 *                 type: array
 *                 items:
 *                   type: string
 *               indicators:
 *                 type: array
 *                 items:
 *                   type: string
 *               mitigations:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Attack vector updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Attack vector not found
 *       500:
 *         description: Server error
 */
router.put('/:id', attackVectorValidation, updateAttackVector);

/**
 * @swagger
 * /api/v1/attack-vectors/{id}:
 *   delete:
 *     summary: Delete attack vector
 *     tags: [Attack Vectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attack vector ID
 *     responses:
 *       200:
 *         description: Attack vector deleted successfully
 *       404:
 *         description: Attack vector not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteAttackVector);

export default router;