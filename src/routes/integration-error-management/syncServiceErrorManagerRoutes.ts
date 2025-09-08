import { Router } from 'express';
import { syncServiceErrorManagerController } from '../../controllers/integration-error-management/syncServiceErrorManagerController';

const router = Router();

/**
 * @swagger
 * /api/integration-error-management/sync-service-error-manager:
 *   get:
 *     summary: Get all sync service error manager items
 *     tags: [Sync Service Error Manager]
 *     responses:
 *       200:
 *         description: List of sync service error manager items with analytics
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
router.get('/', syncServiceErrorManagerController.getAll.bind(syncServiceErrorManagerController));

/**
 * @swagger
 * /api/integration-error-management/sync-service-error-manager/{id}:
 *   get:
 *     summary: Get sync service error manager item by ID
 *     tags: [Sync Service Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sync Service Error Manager item ID
 *     responses:
 *       200:
 *         description: Sync Service Error Manager item details
 *       404:
 *         description: Sync Service Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', syncServiceErrorManagerController.getById.bind(syncServiceErrorManagerController));

/**
 * @swagger
 * /api/integration-error-management/sync-service-error-manager:
 *   post:
 *     summary: Create new sync service error manager item
 *     tags: [Sync Service Error Manager]
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
 *         description: Sync Service Error Manager item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', syncServiceErrorManagerController.create.bind(syncServiceErrorManagerController));

/**
 * @swagger
 * /api/integration-error-management/sync-service-error-manager/{id}:
 *   put:
 *     summary: Update sync service error manager item
 *     tags: [Sync Service Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sync Service Error Manager item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Sync Service Error Manager item updated successfully
 *       404:
 *         description: Sync Service Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', syncServiceErrorManagerController.update.bind(syncServiceErrorManagerController));

/**
 * @swagger
 * /api/integration-error-management/sync-service-error-manager/{id}:
 *   delete:
 *     summary: Delete sync service error manager item
 *     tags: [Sync Service Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sync Service Error Manager item ID
 *     responses:
 *       200:
 *         description: Sync Service Error Manager item deleted successfully
 *       404:
 *         description: Sync Service Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', syncServiceErrorManagerController.delete.bind(syncServiceErrorManagerController));

/**
 * @swagger
 * /api/integration-error-management/sync-service-error-manager/health:
 *   get:
 *     summary: Health check for sync service error manager service
 *     tags: [Sync Service Error Manager]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', syncServiceErrorManagerController.healthCheck.bind(syncServiceErrorManagerController));

export { router as syncServiceErrorManagerRoutes };
export default router;