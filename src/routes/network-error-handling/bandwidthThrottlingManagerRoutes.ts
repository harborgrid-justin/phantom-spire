import { Router } from 'express';
import { bandwidthThrottlingManagerController } from '../../controllers/network-error-handling/bandwidthThrottlingManagerController';

const router = Router();

/**
 * @swagger
 * /api/network-error-handling/bandwidth-throttling-manager:
 *   get:
 *     summary: Get all bandwidth throttling manager items
 *     tags: [Bandwidth Throttling Manager]
 *     responses:
 *       200:
 *         description: List of bandwidth throttling manager items with analytics
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
router.get('/', bandwidthThrottlingManagerController.getAll.bind(bandwidthThrottlingManagerController));

/**
 * @swagger
 * /api/network-error-handling/bandwidth-throttling-manager/{id}:
 *   get:
 *     summary: Get bandwidth throttling manager item by ID
 *     tags: [Bandwidth Throttling Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bandwidth Throttling Manager item ID
 *     responses:
 *       200:
 *         description: Bandwidth Throttling Manager item details
 *       404:
 *         description: Bandwidth Throttling Manager item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', bandwidthThrottlingManagerController.getById.bind(bandwidthThrottlingManagerController));

/**
 * @swagger
 * /api/network-error-handling/bandwidth-throttling-manager:
 *   post:
 *     summary: Create new bandwidth throttling manager item
 *     tags: [Bandwidth Throttling Manager]
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
 *         description: Bandwidth Throttling Manager item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', bandwidthThrottlingManagerController.create.bind(bandwidthThrottlingManagerController));

/**
 * @swagger
 * /api/network-error-handling/bandwidth-throttling-manager/{id}:
 *   put:
 *     summary: Update bandwidth throttling manager item
 *     tags: [Bandwidth Throttling Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bandwidth Throttling Manager item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Bandwidth Throttling Manager item updated successfully
 *       404:
 *         description: Bandwidth Throttling Manager item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', bandwidthThrottlingManagerController.update.bind(bandwidthThrottlingManagerController));

/**
 * @swagger
 * /api/network-error-handling/bandwidth-throttling-manager/{id}:
 *   delete:
 *     summary: Delete bandwidth throttling manager item
 *     tags: [Bandwidth Throttling Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bandwidth Throttling Manager item ID
 *     responses:
 *       200:
 *         description: Bandwidth Throttling Manager item deleted successfully
 *       404:
 *         description: Bandwidth Throttling Manager item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', bandwidthThrottlingManagerController.delete.bind(bandwidthThrottlingManagerController));

/**
 * @swagger
 * /api/network-error-handling/bandwidth-throttling-manager/health:
 *   get:
 *     summary: Health check for bandwidth throttling manager service
 *     tags: [Bandwidth Throttling Manager]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', bandwidthThrottlingManagerController.healthCheck.bind(bandwidthThrottlingManagerController));

export { router as bandwidthThrottlingManagerRoutes };
export default router;