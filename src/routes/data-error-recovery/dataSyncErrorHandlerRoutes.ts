import { Router } from 'express';
import { dataSyncErrorHandlerController } from '../../controllers/data-error-recovery/dataSyncErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/data-error-recovery/data-sync-error-handler:
 *   get:
 *     summary: Get all data sync error handler items
 *     tags: [Data Sync Error Handler]
 *     responses:
 *       200:
 *         description: List of data sync error handler items with analytics
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
router.get('/', dataSyncErrorHandlerController.getAll.bind(dataSyncErrorHandlerController));

/**
 * @swagger
 * /api/data-error-recovery/data-sync-error-handler/{id}:
 *   get:
 *     summary: Get data sync error handler item by ID
 *     tags: [Data Sync Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Data Sync Error Handler item ID
 *     responses:
 *       200:
 *         description: Data Sync Error Handler item details
 *       404:
 *         description: Data Sync Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', dataSyncErrorHandlerController.getById.bind(dataSyncErrorHandlerController));

/**
 * @swagger
 * /api/data-error-recovery/data-sync-error-handler:
 *   post:
 *     summary: Create new data sync error handler item
 *     tags: [Data Sync Error Handler]
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
 *         description: Data Sync Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', dataSyncErrorHandlerController.create.bind(dataSyncErrorHandlerController));

/**
 * @swagger
 * /api/data-error-recovery/data-sync-error-handler/{id}:
 *   put:
 *     summary: Update data sync error handler item
 *     tags: [Data Sync Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Data Sync Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Data Sync Error Handler item updated successfully
 *       404:
 *         description: Data Sync Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', dataSyncErrorHandlerController.update.bind(dataSyncErrorHandlerController));

/**
 * @swagger
 * /api/data-error-recovery/data-sync-error-handler/{id}:
 *   delete:
 *     summary: Delete data sync error handler item
 *     tags: [Data Sync Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Data Sync Error Handler item ID
 *     responses:
 *       200:
 *         description: Data Sync Error Handler item deleted successfully
 *       404:
 *         description: Data Sync Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', dataSyncErrorHandlerController.delete.bind(dataSyncErrorHandlerController));

/**
 * @swagger
 * /api/data-error-recovery/data-sync-error-handler/health:
 *   get:
 *     summary: Health check for data sync error handler service
 *     tags: [Data Sync Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', dataSyncErrorHandlerController.healthCheck.bind(dataSyncErrorHandlerController));

export { router as dataSyncErrorHandlerRoutes };
export default router;