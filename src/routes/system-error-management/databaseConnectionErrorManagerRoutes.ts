import { Router } from 'express';
import { databaseConnectionErrorManagerController } from '../../controllers/system-error-management/databaseConnectionErrorManagerController';

const router = Router();

/**
 * @swagger
 * /api/system-error-management/database-connection-error-manager:
 *   get:
 *     summary: Get all database connection error manager items
 *     tags: [Database Connection Error Manager]
 *     responses:
 *       200:
 *         description: List of database connection error manager items with analytics
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
router.get('/', databaseConnectionErrorManagerController.getAll.bind(databaseConnectionErrorManagerController));

/**
 * @swagger
 * /api/system-error-management/database-connection-error-manager/{id}:
 *   get:
 *     summary: Get database connection error manager item by ID
 *     tags: [Database Connection Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Database Connection Error Manager item ID
 *     responses:
 *       200:
 *         description: Database Connection Error Manager item details
 *       404:
 *         description: Database Connection Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', databaseConnectionErrorManagerController.getById.bind(databaseConnectionErrorManagerController));

/**
 * @swagger
 * /api/system-error-management/database-connection-error-manager:
 *   post:
 *     summary: Create new database connection error manager item
 *     tags: [Database Connection Error Manager]
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
 *         description: Database Connection Error Manager item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', databaseConnectionErrorManagerController.create.bind(databaseConnectionErrorManagerController));

/**
 * @swagger
 * /api/system-error-management/database-connection-error-manager/{id}:
 *   put:
 *     summary: Update database connection error manager item
 *     tags: [Database Connection Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Database Connection Error Manager item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Database Connection Error Manager item updated successfully
 *       404:
 *         description: Database Connection Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', databaseConnectionErrorManagerController.update.bind(databaseConnectionErrorManagerController));

/**
 * @swagger
 * /api/system-error-management/database-connection-error-manager/{id}:
 *   delete:
 *     summary: Delete database connection error manager item
 *     tags: [Database Connection Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Database Connection Error Manager item ID
 *     responses:
 *       200:
 *         description: Database Connection Error Manager item deleted successfully
 *       404:
 *         description: Database Connection Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', databaseConnectionErrorManagerController.delete.bind(databaseConnectionErrorManagerController));

/**
 * @swagger
 * /api/system-error-management/database-connection-error-manager/health:
 *   get:
 *     summary: Health check for database connection error manager service
 *     tags: [Database Connection Error Manager]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', databaseConnectionErrorManagerController.healthCheck.bind(databaseConnectionErrorManagerController));

export { router as databaseConnectionErrorManagerRoutes };
export default router;