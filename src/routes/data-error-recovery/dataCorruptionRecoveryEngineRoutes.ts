import { Router } from 'express';
import { dataCorruptionRecoveryEngineController } from '../../controllers/data-error-recovery/dataCorruptionRecoveryEngineController';

const router = Router();

/**
 * @swagger
 * /api/data-error-recovery/data-corruption-recovery-engine:
 *   get:
 *     summary: Get all data corruption recovery engine items
 *     tags: [Data Corruption Recovery Engine]
 *     responses:
 *       200:
 *         description: List of data corruption recovery engine items with analytics
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
router.get('/', dataCorruptionRecoveryEngineController.getAll.bind(dataCorruptionRecoveryEngineController));

/**
 * @swagger
 * /api/data-error-recovery/data-corruption-recovery-engine/{id}:
 *   get:
 *     summary: Get data corruption recovery engine item by ID
 *     tags: [Data Corruption Recovery Engine]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Data Corruption Recovery Engine item ID
 *     responses:
 *       200:
 *         description: Data Corruption Recovery Engine item details
 *       404:
 *         description: Data Corruption Recovery Engine item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', dataCorruptionRecoveryEngineController.getById.bind(dataCorruptionRecoveryEngineController));

/**
 * @swagger
 * /api/data-error-recovery/data-corruption-recovery-engine:
 *   post:
 *     summary: Create new data corruption recovery engine item
 *     tags: [Data Corruption Recovery Engine]
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
 *         description: Data Corruption Recovery Engine item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', dataCorruptionRecoveryEngineController.create.bind(dataCorruptionRecoveryEngineController));

/**
 * @swagger
 * /api/data-error-recovery/data-corruption-recovery-engine/{id}:
 *   put:
 *     summary: Update data corruption recovery engine item
 *     tags: [Data Corruption Recovery Engine]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Data Corruption Recovery Engine item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Data Corruption Recovery Engine item updated successfully
 *       404:
 *         description: Data Corruption Recovery Engine item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', dataCorruptionRecoveryEngineController.update.bind(dataCorruptionRecoveryEngineController));

/**
 * @swagger
 * /api/data-error-recovery/data-corruption-recovery-engine/{id}:
 *   delete:
 *     summary: Delete data corruption recovery engine item
 *     tags: [Data Corruption Recovery Engine]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Data Corruption Recovery Engine item ID
 *     responses:
 *       200:
 *         description: Data Corruption Recovery Engine item deleted successfully
 *       404:
 *         description: Data Corruption Recovery Engine item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', dataCorruptionRecoveryEngineController.delete.bind(dataCorruptionRecoveryEngineController));

/**
 * @swagger
 * /api/data-error-recovery/data-corruption-recovery-engine/health:
 *   get:
 *     summary: Health check for data corruption recovery engine service
 *     tags: [Data Corruption Recovery Engine]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', dataCorruptionRecoveryEngineController.healthCheck.bind(dataCorruptionRecoveryEngineController));

export { router as dataCorruptionRecoveryEngineRoutes };
export default router;