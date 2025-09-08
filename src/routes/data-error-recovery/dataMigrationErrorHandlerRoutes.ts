import { Router } from 'express';
import { dataMigrationErrorHandlerController } from '../../controllers/data-error-recovery/dataMigrationErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/data-error-recovery/data-migration-error-handler:
 *   get:
 *     summary: Get all data migration error handler items
 *     tags: [Data Migration Error Handler]
 *     responses:
 *       200:
 *         description: List of data migration error handler items with analytics
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
router.get('/', dataMigrationErrorHandlerController.getAll.bind(dataMigrationErrorHandlerController));

/**
 * @swagger
 * /api/data-error-recovery/data-migration-error-handler/{id}:
 *   get:
 *     summary: Get data migration error handler item by ID
 *     tags: [Data Migration Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Data Migration Error Handler item ID
 *     responses:
 *       200:
 *         description: Data Migration Error Handler item details
 *       404:
 *         description: Data Migration Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', dataMigrationErrorHandlerController.getById.bind(dataMigrationErrorHandlerController));

/**
 * @swagger
 * /api/data-error-recovery/data-migration-error-handler:
 *   post:
 *     summary: Create new data migration error handler item
 *     tags: [Data Migration Error Handler]
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
 *         description: Data Migration Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', dataMigrationErrorHandlerController.create.bind(dataMigrationErrorHandlerController));

/**
 * @swagger
 * /api/data-error-recovery/data-migration-error-handler/{id}:
 *   put:
 *     summary: Update data migration error handler item
 *     tags: [Data Migration Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Data Migration Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Data Migration Error Handler item updated successfully
 *       404:
 *         description: Data Migration Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', dataMigrationErrorHandlerController.update.bind(dataMigrationErrorHandlerController));

/**
 * @swagger
 * /api/data-error-recovery/data-migration-error-handler/{id}:
 *   delete:
 *     summary: Delete data migration error handler item
 *     tags: [Data Migration Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Data Migration Error Handler item ID
 *     responses:
 *       200:
 *         description: Data Migration Error Handler item deleted successfully
 *       404:
 *         description: Data Migration Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', dataMigrationErrorHandlerController.delete.bind(dataMigrationErrorHandlerController));

/**
 * @swagger
 * /api/data-error-recovery/data-migration-error-handler/health:
 *   get:
 *     summary: Health check for data migration error handler service
 *     tags: [Data Migration Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', dataMigrationErrorHandlerController.healthCheck.bind(dataMigrationErrorHandlerController));

export { router as dataMigrationErrorHandlerRoutes };
export default router;