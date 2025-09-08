import { Router } from 'express';
import { securityPolicyViolationHandlerController } from '../../controllers/security-error-response/securityPolicyViolationHandlerController';

const router = Router();

/**
 * @swagger
 * /api/security-error-response/security-policy-violation-handler:
 *   get:
 *     summary: Get all security policy violation handler items
 *     tags: [Security Policy Violation Handler]
 *     responses:
 *       200:
 *         description: List of security policy violation handler items with analytics
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
 *                     type: object
 *                 analytics:
 *                   type: object
 *                 total:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
router.get('/', securityPolicyViolationHandlerController.getAll.bind(securityPolicyViolationHandlerController));

/**
 * @swagger
 * /api/security-error-response/security-policy-violation-handler/{id}:
 *   get:
 *     summary: Get security policy violation handler item by ID
 *     tags: [Security Policy Violation Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Security Policy Violation Handler item ID
 *     responses:
 *       200:
 *         description: Security Policy Violation Handler item details
 *       404:
 *         description: Security Policy Violation Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', securityPolicyViolationHandlerController.getById.bind(securityPolicyViolationHandlerController));

/**
 * @swagger
 * /api/security-error-response/security-policy-violation-handler:
 *   post:
 *     summary: Create new security policy violation handler item
 *     tags: [Security Policy Violation Handler]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               affectedSystems:
 *                 type: array
 *                 items:
 *                   type: string
 *               resolutionSteps:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Security Policy Violation Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', securityPolicyViolationHandlerController.create.bind(securityPolicyViolationHandlerController));

/**
 * @swagger
 * /api/security-error-response/security-policy-violation-handler/{id}:
 *   put:
 *     summary: Update security policy violation handler item
 *     tags: [Security Policy Violation Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Security Policy Violation Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Security Policy Violation Handler item updated successfully
 *       404:
 *         description: Security Policy Violation Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', securityPolicyViolationHandlerController.update.bind(securityPolicyViolationHandlerController));

/**
 * @swagger
 * /api/security-error-response/security-policy-violation-handler/{id}:
 *   delete:
 *     summary: Delete security policy violation handler item
 *     tags: [Security Policy Violation Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Security Policy Violation Handler item ID
 *     responses:
 *       200:
 *         description: Security Policy Violation Handler item deleted successfully
 *       404:
 *         description: Security Policy Violation Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', securityPolicyViolationHandlerController.delete.bind(securityPolicyViolationHandlerController));

/**
 * @swagger
 * /api/security-error-response/security-policy-violation-handler/health:
 *   get:
 *     summary: Health check for security policy violation handler service
 *     tags: [Security Policy Violation Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', securityPolicyViolationHandlerController.healthCheck.bind(securityPolicyViolationHandlerController));

export { router as securityPolicyViolationHandlerRoutes };
export default router;