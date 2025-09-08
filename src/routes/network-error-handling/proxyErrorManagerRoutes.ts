import { Router } from 'express';
import { proxyErrorManagerController } from '../../controllers/network-error-handling/proxyErrorManagerController';

const router = Router();

/**
 * @swagger
 * /api/network-error-handling/proxy-error-manager:
 *   get:
 *     summary: Get all proxy error manager items
 *     tags: [Proxy Error Manager]
 *     responses:
 *       200:
 *         description: List of proxy error manager items with analytics
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
router.get('/', proxyErrorManagerController.getAll.bind(proxyErrorManagerController));

/**
 * @swagger
 * /api/network-error-handling/proxy-error-manager/{id}:
 *   get:
 *     summary: Get proxy error manager item by ID
 *     tags: [Proxy Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proxy Error Manager item ID
 *     responses:
 *       200:
 *         description: Proxy Error Manager item details
 *       404:
 *         description: Proxy Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', proxyErrorManagerController.getById.bind(proxyErrorManagerController));

/**
 * @swagger
 * /api/network-error-handling/proxy-error-manager:
 *   post:
 *     summary: Create new proxy error manager item
 *     tags: [Proxy Error Manager]
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
 *         description: Proxy Error Manager item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', proxyErrorManagerController.create.bind(proxyErrorManagerController));

/**
 * @swagger
 * /api/network-error-handling/proxy-error-manager/{id}:
 *   put:
 *     summary: Update proxy error manager item
 *     tags: [Proxy Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proxy Error Manager item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Proxy Error Manager item updated successfully
 *       404:
 *         description: Proxy Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', proxyErrorManagerController.update.bind(proxyErrorManagerController));

/**
 * @swagger
 * /api/network-error-handling/proxy-error-manager/{id}:
 *   delete:
 *     summary: Delete proxy error manager item
 *     tags: [Proxy Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proxy Error Manager item ID
 *     responses:
 *       200:
 *         description: Proxy Error Manager item deleted successfully
 *       404:
 *         description: Proxy Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', proxyErrorManagerController.delete.bind(proxyErrorManagerController));

/**
 * @swagger
 * /api/network-error-handling/proxy-error-manager/health:
 *   get:
 *     summary: Health check for proxy error manager service
 *     tags: [Proxy Error Manager]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', proxyErrorManagerController.healthCheck.bind(proxyErrorManagerController));

export { router as proxyErrorManagerRoutes };
export default router;