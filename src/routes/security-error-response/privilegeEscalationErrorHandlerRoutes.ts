import { Router } from 'express';
import { privilegeEscalationErrorHandlerController } from '../../controllers/security-error-response/privilegeEscalationErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/security-error-response/privilege-escalation-error-handler:
 *   get:
 *     summary: Get all privilege escalation error handler items
 *     tags: [Privilege Escalation Error Handler]
 *     responses:
 *       200:
 *         description: List of privilege escalation error handler items with analytics
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
router.get('/', privilegeEscalationErrorHandlerController.getAll.bind(privilegeEscalationErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/privilege-escalation-error-handler/{id}:
 *   get:
 *     summary: Get privilege escalation error handler item by ID
 *     tags: [Privilege Escalation Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Privilege Escalation Error Handler item ID
 *     responses:
 *       200:
 *         description: Privilege Escalation Error Handler item details
 *       404:
 *         description: Privilege Escalation Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', privilegeEscalationErrorHandlerController.getById.bind(privilegeEscalationErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/privilege-escalation-error-handler:
 *   post:
 *     summary: Create new privilege escalation error handler item
 *     tags: [Privilege Escalation Error Handler]
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
 *         description: Privilege Escalation Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', privilegeEscalationErrorHandlerController.create.bind(privilegeEscalationErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/privilege-escalation-error-handler/{id}:
 *   put:
 *     summary: Update privilege escalation error handler item
 *     tags: [Privilege Escalation Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Privilege Escalation Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Privilege Escalation Error Handler item updated successfully
 *       404:
 *         description: Privilege Escalation Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', privilegeEscalationErrorHandlerController.update.bind(privilegeEscalationErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/privilege-escalation-error-handler/{id}:
 *   delete:
 *     summary: Delete privilege escalation error handler item
 *     tags: [Privilege Escalation Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Privilege Escalation Error Handler item ID
 *     responses:
 *       200:
 *         description: Privilege Escalation Error Handler item deleted successfully
 *       404:
 *         description: Privilege Escalation Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', privilegeEscalationErrorHandlerController.delete.bind(privilegeEscalationErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/privilege-escalation-error-handler/health:
 *   get:
 *     summary: Health check for privilege escalation error handler service
 *     tags: [Privilege Escalation Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', privilegeEscalationErrorHandlerController.healthCheck.bind(privilegeEscalationErrorHandlerController));

export { router as privilegeEscalationErrorHandlerRoutes };
export default router;