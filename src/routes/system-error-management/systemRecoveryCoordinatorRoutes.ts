import { Router } from 'express';
import { systemRecoveryCoordinatorController } from '../../controllers/system-error-management/systemRecoveryCoordinatorController';

const router = Router();

/**
 * @swagger
 * /api/system-error-management/system-recovery-coordinator:
 *   get:
 *     summary: Get all system recovery coordinator items
 *     tags: [System Recovery Coordinator]
 *     responses:
 *       200:
 *         description: List of system recovery coordinator items with analytics
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
router.get('/', systemRecoveryCoordinatorController.getAll.bind(systemRecoveryCoordinatorController));

/**
 * @swagger
 * /api/system-error-management/system-recovery-coordinator/{id}:
 *   get:
 *     summary: Get system recovery coordinator item by ID
 *     tags: [System Recovery Coordinator]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: System Recovery Coordinator item ID
 *     responses:
 *       200:
 *         description: System Recovery Coordinator item details
 *       404:
 *         description: System Recovery Coordinator item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', systemRecoveryCoordinatorController.getById.bind(systemRecoveryCoordinatorController));

/**
 * @swagger
 * /api/system-error-management/system-recovery-coordinator:
 *   post:
 *     summary: Create new system recovery coordinator item
 *     tags: [System Recovery Coordinator]
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
 *         description: System Recovery Coordinator item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', systemRecoveryCoordinatorController.create.bind(systemRecoveryCoordinatorController));

/**
 * @swagger
 * /api/system-error-management/system-recovery-coordinator/{id}:
 *   put:
 *     summary: Update system recovery coordinator item
 *     tags: [System Recovery Coordinator]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: System Recovery Coordinator item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: System Recovery Coordinator item updated successfully
 *       404:
 *         description: System Recovery Coordinator item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', systemRecoveryCoordinatorController.update.bind(systemRecoveryCoordinatorController));

/**
 * @swagger
 * /api/system-error-management/system-recovery-coordinator/{id}:
 *   delete:
 *     summary: Delete system recovery coordinator item
 *     tags: [System Recovery Coordinator]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: System Recovery Coordinator item ID
 *     responses:
 *       200:
 *         description: System Recovery Coordinator item deleted successfully
 *       404:
 *         description: System Recovery Coordinator item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', systemRecoveryCoordinatorController.delete.bind(systemRecoveryCoordinatorController));

/**
 * @swagger
 * /api/system-error-management/system-recovery-coordinator/health:
 *   get:
 *     summary: Health check for system recovery coordinator service
 *     tags: [System Recovery Coordinator]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', systemRecoveryCoordinatorController.healthCheck.bind(systemRecoveryCoordinatorController));

export { router as systemRecoveryCoordinatorRoutes };
export default router;