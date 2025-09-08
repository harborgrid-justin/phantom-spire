import { Router } from 'express';
import { cdnErrorRecoveryManagerController } from '../../controllers/network-error-handling/cdnErrorRecoveryManagerController';

const router = Router();

/**
 * @swagger
 * /api/network-error-handling/cdn-error-recovery-manager:
 *   get:
 *     summary: Get all cdn error recovery manager items
 *     tags: [Cdn Error Recovery Manager]
 *     responses:
 *       200:
 *         description: List of cdn error recovery manager items with analytics
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
router.get('/', cdnErrorRecoveryManagerController.getAll.bind(cdnErrorRecoveryManagerController));

/**
 * @swagger
 * /api/network-error-handling/cdn-error-recovery-manager/{id}:
 *   get:
 *     summary: Get cdn error recovery manager item by ID
 *     tags: [Cdn Error Recovery Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cdn Error Recovery Manager item ID
 *     responses:
 *       200:
 *         description: Cdn Error Recovery Manager item details
 *       404:
 *         description: Cdn Error Recovery Manager item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', cdnErrorRecoveryManagerController.getById.bind(cdnErrorRecoveryManagerController));

/**
 * @swagger
 * /api/network-error-handling/cdn-error-recovery-manager:
 *   post:
 *     summary: Create new cdn error recovery manager item
 *     tags: [Cdn Error Recovery Manager]
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
 *         description: Cdn Error Recovery Manager item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', cdnErrorRecoveryManagerController.create.bind(cdnErrorRecoveryManagerController));

/**
 * @swagger
 * /api/network-error-handling/cdn-error-recovery-manager/{id}:
 *   put:
 *     summary: Update cdn error recovery manager item
 *     tags: [Cdn Error Recovery Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cdn Error Recovery Manager item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cdn Error Recovery Manager item updated successfully
 *       404:
 *         description: Cdn Error Recovery Manager item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', cdnErrorRecoveryManagerController.update.bind(cdnErrorRecoveryManagerController));

/**
 * @swagger
 * /api/network-error-handling/cdn-error-recovery-manager/{id}:
 *   delete:
 *     summary: Delete cdn error recovery manager item
 *     tags: [Cdn Error Recovery Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cdn Error Recovery Manager item ID
 *     responses:
 *       200:
 *         description: Cdn Error Recovery Manager item deleted successfully
 *       404:
 *         description: Cdn Error Recovery Manager item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', cdnErrorRecoveryManagerController.delete.bind(cdnErrorRecoveryManagerController));

/**
 * @swagger
 * /api/network-error-handling/cdn-error-recovery-manager/health:
 *   get:
 *     summary: Health check for cdn error recovery manager service
 *     tags: [Cdn Error Recovery Manager]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', cdnErrorRecoveryManagerController.healthCheck.bind(cdnErrorRecoveryManagerController));

export { router as cdnErrorRecoveryManagerRoutes };
export default router;