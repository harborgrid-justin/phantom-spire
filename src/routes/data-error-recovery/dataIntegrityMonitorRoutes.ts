import { Router } from 'express';
import { dataIntegrityMonitorController } from '../../controllers/data-error-recovery/dataIntegrityMonitorController';

const router = Router();

/**
 * @swagger
 * /api/data-error-recovery/data-integrity-monitor:
 *   get:
 *     summary: Get all data integrity monitor items
 *     tags: [Data Integrity Monitor]
 *     responses:
 *       200:
 *         description: List of data integrity monitor items with analytics
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
router.get('/', dataIntegrityMonitorController.getAll.bind(dataIntegrityMonitorController));

/**
 * @swagger
 * /api/data-error-recovery/data-integrity-monitor/{id}:
 *   get:
 *     summary: Get data integrity monitor item by ID
 *     tags: [Data Integrity Monitor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Data Integrity Monitor item ID
 *     responses:
 *       200:
 *         description: Data Integrity Monitor item details
 *       404:
 *         description: Data Integrity Monitor item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', dataIntegrityMonitorController.getById.bind(dataIntegrityMonitorController));

/**
 * @swagger
 * /api/data-error-recovery/data-integrity-monitor:
 *   post:
 *     summary: Create new data integrity monitor item
 *     tags: [Data Integrity Monitor]
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
 *         description: Data Integrity Monitor item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', dataIntegrityMonitorController.create.bind(dataIntegrityMonitorController));

/**
 * @swagger
 * /api/data-error-recovery/data-integrity-monitor/{id}:
 *   put:
 *     summary: Update data integrity monitor item
 *     tags: [Data Integrity Monitor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Data Integrity Monitor item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Data Integrity Monitor item updated successfully
 *       404:
 *         description: Data Integrity Monitor item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', dataIntegrityMonitorController.update.bind(dataIntegrityMonitorController));

/**
 * @swagger
 * /api/data-error-recovery/data-integrity-monitor/{id}:
 *   delete:
 *     summary: Delete data integrity monitor item
 *     tags: [Data Integrity Monitor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Data Integrity Monitor item ID
 *     responses:
 *       200:
 *         description: Data Integrity Monitor item deleted successfully
 *       404:
 *         description: Data Integrity Monitor item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', dataIntegrityMonitorController.delete.bind(dataIntegrityMonitorController));

/**
 * @swagger
 * /api/data-error-recovery/data-integrity-monitor/health:
 *   get:
 *     summary: Health check for data integrity monitor service
 *     tags: [Data Integrity Monitor]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', dataIntegrityMonitorController.healthCheck.bind(dataIntegrityMonitorController));

export { router as dataIntegrityMonitorRoutes };
export default router;