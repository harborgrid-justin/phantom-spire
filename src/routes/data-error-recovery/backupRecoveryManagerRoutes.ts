import { Router } from 'express';
import { backupRecoveryManagerController } from '../../controllers/data-error-recovery/backupRecoveryManagerController';

const router = Router();

/**
 * @swagger
 * /api/data-error-recovery/backup-recovery-manager:
 *   get:
 *     summary: Get all backup recovery manager items
 *     tags: [Backup Recovery Manager]
 *     responses:
 *       200:
 *         description: List of backup recovery manager items with analytics
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
router.get('/', backupRecoveryManagerController.getAll.bind(backupRecoveryManagerController));

/**
 * @swagger
 * /api/data-error-recovery/backup-recovery-manager/{id}:
 *   get:
 *     summary: Get backup recovery manager item by ID
 *     tags: [Backup Recovery Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Backup Recovery Manager item ID
 *     responses:
 *       200:
 *         description: Backup Recovery Manager item details
 *       404:
 *         description: Backup Recovery Manager item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', backupRecoveryManagerController.getById.bind(backupRecoveryManagerController));

/**
 * @swagger
 * /api/data-error-recovery/backup-recovery-manager:
 *   post:
 *     summary: Create new backup recovery manager item
 *     tags: [Backup Recovery Manager]
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
 *         description: Backup Recovery Manager item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', backupRecoveryManagerController.create.bind(backupRecoveryManagerController));

/**
 * @swagger
 * /api/data-error-recovery/backup-recovery-manager/{id}:
 *   put:
 *     summary: Update backup recovery manager item
 *     tags: [Backup Recovery Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Backup Recovery Manager item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Backup Recovery Manager item updated successfully
 *       404:
 *         description: Backup Recovery Manager item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', backupRecoveryManagerController.update.bind(backupRecoveryManagerController));

/**
 * @swagger
 * /api/data-error-recovery/backup-recovery-manager/{id}:
 *   delete:
 *     summary: Delete backup recovery manager item
 *     tags: [Backup Recovery Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Backup Recovery Manager item ID
 *     responses:
 *       200:
 *         description: Backup Recovery Manager item deleted successfully
 *       404:
 *         description: Backup Recovery Manager item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', backupRecoveryManagerController.delete.bind(backupRecoveryManagerController));

/**
 * @swagger
 * /api/data-error-recovery/backup-recovery-manager/health:
 *   get:
 *     summary: Health check for backup recovery manager service
 *     tags: [Backup Recovery Manager]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', backupRecoveryManagerController.healthCheck.bind(backupRecoveryManagerController));

export { router as backupRecoveryManagerRoutes };
export default router;