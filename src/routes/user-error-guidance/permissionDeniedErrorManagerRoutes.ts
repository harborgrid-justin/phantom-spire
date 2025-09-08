import { Router } from 'express';
import { permissionDeniedErrorManagerController } from '../../controllers/user-error-guidance/permissionDeniedErrorManagerController';

const router = Router();

/**
 * @swagger
 * /api/user-error-guidance/permission-denied-error-manager:
 *   get:
 *     summary: Get all permission denied error manager items
 *     tags: [Permission Denied Error Manager]
 *     responses:
 *       200:
 *         description: List of permission denied error manager items with analytics
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
router.get('/', permissionDeniedErrorManagerController.getAll.bind(permissionDeniedErrorManagerController));

/**
 * @swagger
 * /api/user-error-guidance/permission-denied-error-manager/{id}:
 *   get:
 *     summary: Get permission denied error manager item by ID
 *     tags: [Permission Denied Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission Denied Error Manager item ID
 *     responses:
 *       200:
 *         description: Permission Denied Error Manager item details
 *       404:
 *         description: Permission Denied Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', permissionDeniedErrorManagerController.getById.bind(permissionDeniedErrorManagerController));

/**
 * @swagger
 * /api/user-error-guidance/permission-denied-error-manager:
 *   post:
 *     summary: Create new permission denied error manager item
 *     tags: [Permission Denied Error Manager]
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
 *         description: Permission Denied Error Manager item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', permissionDeniedErrorManagerController.create.bind(permissionDeniedErrorManagerController));

/**
 * @swagger
 * /api/user-error-guidance/permission-denied-error-manager/{id}:
 *   put:
 *     summary: Update permission denied error manager item
 *     tags: [Permission Denied Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission Denied Error Manager item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Permission Denied Error Manager item updated successfully
 *       404:
 *         description: Permission Denied Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', permissionDeniedErrorManagerController.update.bind(permissionDeniedErrorManagerController));

/**
 * @swagger
 * /api/user-error-guidance/permission-denied-error-manager/{id}:
 *   delete:
 *     summary: Delete permission denied error manager item
 *     tags: [Permission Denied Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission Denied Error Manager item ID
 *     responses:
 *       200:
 *         description: Permission Denied Error Manager item deleted successfully
 *       404:
 *         description: Permission Denied Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', permissionDeniedErrorManagerController.delete.bind(permissionDeniedErrorManagerController));

/**
 * @swagger
 * /api/user-error-guidance/permission-denied-error-manager/health:
 *   get:
 *     summary: Health check for permission denied error manager service
 *     tags: [Permission Denied Error Manager]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', permissionDeniedErrorManagerController.healthCheck.bind(permissionDeniedErrorManagerController));

export { router as permissionDeniedErrorManagerRoutes };
export default router;