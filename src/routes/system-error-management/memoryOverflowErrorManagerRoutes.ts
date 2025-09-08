import { Router } from 'express';
import { memoryOverflowErrorManagerController } from '../../controllers/system-error-management/memoryOverflowErrorManagerController';

const router = Router();

/**
 * @swagger
 * /api/system-error-management/memory-overflow-error-manager:
 *   get:
 *     summary: Get all memory overflow error manager items
 *     tags: [Memory Overflow Error Manager]
 *     responses:
 *       200:
 *         description: List of memory overflow error manager items with analytics
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
router.get('/', memoryOverflowErrorManagerController.getAll.bind(memoryOverflowErrorManagerController));

/**
 * @swagger
 * /api/system-error-management/memory-overflow-error-manager/{id}:
 *   get:
 *     summary: Get memory overflow error manager item by ID
 *     tags: [Memory Overflow Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Memory Overflow Error Manager item ID
 *     responses:
 *       200:
 *         description: Memory Overflow Error Manager item details
 *       404:
 *         description: Memory Overflow Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', memoryOverflowErrorManagerController.getById.bind(memoryOverflowErrorManagerController));

/**
 * @swagger
 * /api/system-error-management/memory-overflow-error-manager:
 *   post:
 *     summary: Create new memory overflow error manager item
 *     tags: [Memory Overflow Error Manager]
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
 *         description: Memory Overflow Error Manager item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', memoryOverflowErrorManagerController.create.bind(memoryOverflowErrorManagerController));

/**
 * @swagger
 * /api/system-error-management/memory-overflow-error-manager/{id}:
 *   put:
 *     summary: Update memory overflow error manager item
 *     tags: [Memory Overflow Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Memory Overflow Error Manager item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Memory Overflow Error Manager item updated successfully
 *       404:
 *         description: Memory Overflow Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', memoryOverflowErrorManagerController.update.bind(memoryOverflowErrorManagerController));

/**
 * @swagger
 * /api/system-error-management/memory-overflow-error-manager/{id}:
 *   delete:
 *     summary: Delete memory overflow error manager item
 *     tags: [Memory Overflow Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Memory Overflow Error Manager item ID
 *     responses:
 *       200:
 *         description: Memory Overflow Error Manager item deleted successfully
 *       404:
 *         description: Memory Overflow Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', memoryOverflowErrorManagerController.delete.bind(memoryOverflowErrorManagerController));

/**
 * @swagger
 * /api/system-error-management/memory-overflow-error-manager/health:
 *   get:
 *     summary: Health check for memory overflow error manager service
 *     tags: [Memory Overflow Error Manager]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', memoryOverflowErrorManagerController.healthCheck.bind(memoryOverflowErrorManagerController));

export { router as memoryOverflowErrorManagerRoutes };
export default router;