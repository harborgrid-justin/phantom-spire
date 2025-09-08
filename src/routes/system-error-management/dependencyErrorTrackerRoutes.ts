import { Router } from 'express';
import { dependencyErrorTrackerController } from '../../controllers/system-error-management/dependencyErrorTrackerController';

const router = Router();

/**
 * @swagger
 * /api/system-error-management/dependency-error-tracker:
 *   get:
 *     summary: Get all dependency error tracker items
 *     tags: [Dependency Error Tracker]
 *     responses:
 *       200:
 *         description: List of dependency error tracker items with analytics
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
router.get('/', dependencyErrorTrackerController.getAll.bind(dependencyErrorTrackerController));

/**
 * @swagger
 * /api/system-error-management/dependency-error-tracker/{id}:
 *   get:
 *     summary: Get dependency error tracker item by ID
 *     tags: [Dependency Error Tracker]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dependency Error Tracker item ID
 *     responses:
 *       200:
 *         description: Dependency Error Tracker item details
 *       404:
 *         description: Dependency Error Tracker item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', dependencyErrorTrackerController.getById.bind(dependencyErrorTrackerController));

/**
 * @swagger
 * /api/system-error-management/dependency-error-tracker:
 *   post:
 *     summary: Create new dependency error tracker item
 *     tags: [Dependency Error Tracker]
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
 *         description: Dependency Error Tracker item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', dependencyErrorTrackerController.create.bind(dependencyErrorTrackerController));

/**
 * @swagger
 * /api/system-error-management/dependency-error-tracker/{id}:
 *   put:
 *     summary: Update dependency error tracker item
 *     tags: [Dependency Error Tracker]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dependency Error Tracker item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Dependency Error Tracker item updated successfully
 *       404:
 *         description: Dependency Error Tracker item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', dependencyErrorTrackerController.update.bind(dependencyErrorTrackerController));

/**
 * @swagger
 * /api/system-error-management/dependency-error-tracker/{id}:
 *   delete:
 *     summary: Delete dependency error tracker item
 *     tags: [Dependency Error Tracker]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dependency Error Tracker item ID
 *     responses:
 *       200:
 *         description: Dependency Error Tracker item deleted successfully
 *       404:
 *         description: Dependency Error Tracker item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', dependencyErrorTrackerController.delete.bind(dependencyErrorTrackerController));

/**
 * @swagger
 * /api/system-error-management/dependency-error-tracker/health:
 *   get:
 *     summary: Health check for dependency error tracker service
 *     tags: [Dependency Error Tracker]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', dependencyErrorTrackerController.healthCheck.bind(dependencyErrorTrackerController));

export { router as dependencyErrorTrackerRoutes };
export default router;