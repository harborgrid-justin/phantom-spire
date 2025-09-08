import { Router } from 'express';
import { connectionTimeoutManagerController } from '../../controllers/network-error-handling/connectionTimeoutManagerController';

const router = Router();

/**
 * @swagger
 * /api/network-error-handling/connection-timeout-manager:
 *   get:
 *     summary: Get all connection timeout manager items
 *     tags: [Connection Timeout Manager]
 *     responses:
 *       200:
 *         description: List of connection timeout manager items with analytics
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
router.get('/', connectionTimeoutManagerController.getAll.bind(connectionTimeoutManagerController));

/**
 * @swagger
 * /api/network-error-handling/connection-timeout-manager/{id}:
 *   get:
 *     summary: Get connection timeout manager item by ID
 *     tags: [Connection Timeout Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Connection Timeout Manager item ID
 *     responses:
 *       200:
 *         description: Connection Timeout Manager item details
 *       404:
 *         description: Connection Timeout Manager item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', connectionTimeoutManagerController.getById.bind(connectionTimeoutManagerController));

/**
 * @swagger
 * /api/network-error-handling/connection-timeout-manager:
 *   post:
 *     summary: Create new connection timeout manager item
 *     tags: [Connection Timeout Manager]
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
 *         description: Connection Timeout Manager item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', connectionTimeoutManagerController.create.bind(connectionTimeoutManagerController));

/**
 * @swagger
 * /api/network-error-handling/connection-timeout-manager/{id}:
 *   put:
 *     summary: Update connection timeout manager item
 *     tags: [Connection Timeout Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Connection Timeout Manager item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Connection Timeout Manager item updated successfully
 *       404:
 *         description: Connection Timeout Manager item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', connectionTimeoutManagerController.update.bind(connectionTimeoutManagerController));

/**
 * @swagger
 * /api/network-error-handling/connection-timeout-manager/{id}:
 *   delete:
 *     summary: Delete connection timeout manager item
 *     tags: [Connection Timeout Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Connection Timeout Manager item ID
 *     responses:
 *       200:
 *         description: Connection Timeout Manager item deleted successfully
 *       404:
 *         description: Connection Timeout Manager item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', connectionTimeoutManagerController.delete.bind(connectionTimeoutManagerController));

/**
 * @swagger
 * /api/network-error-handling/connection-timeout-manager/health:
 *   get:
 *     summary: Health check for connection timeout manager service
 *     tags: [Connection Timeout Manager]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', connectionTimeoutManagerController.healthCheck.bind(connectionTimeoutManagerController));

export { router as connectionTimeoutManagerRoutes };
export default router;