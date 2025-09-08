import { Router } from 'express';
import { authorizationErrorManagerController } from '../../controllers/security-error-response/authorizationErrorManagerController';

const router = Router();

/**
 * @swagger
 * /api/security-error-response/authorization-error-manager:
 *   get:
 *     summary: Get all authorization error manager items
 *     tags: [Authorization Error Manager]
 *     responses:
 *       200:
 *         description: List of authorization error manager items with analytics
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
router.get('/', authorizationErrorManagerController.getAll.bind(authorizationErrorManagerController));

/**
 * @swagger
 * /api/security-error-response/authorization-error-manager/{id}:
 *   get:
 *     summary: Get authorization error manager item by ID
 *     tags: [Authorization Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization Error Manager item ID
 *     responses:
 *       200:
 *         description: Authorization Error Manager item details
 *       404:
 *         description: Authorization Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authorizationErrorManagerController.getById.bind(authorizationErrorManagerController));

/**
 * @swagger
 * /api/security-error-response/authorization-error-manager:
 *   post:
 *     summary: Create new authorization error manager item
 *     tags: [Authorization Error Manager]
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
 *         description: Authorization Error Manager item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', authorizationErrorManagerController.create.bind(authorizationErrorManagerController));

/**
 * @swagger
 * /api/security-error-response/authorization-error-manager/{id}:
 *   put:
 *     summary: Update authorization error manager item
 *     tags: [Authorization Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization Error Manager item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Authorization Error Manager item updated successfully
 *       404:
 *         description: Authorization Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authorizationErrorManagerController.update.bind(authorizationErrorManagerController));

/**
 * @swagger
 * /api/security-error-response/authorization-error-manager/{id}:
 *   delete:
 *     summary: Delete authorization error manager item
 *     tags: [Authorization Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization Error Manager item ID
 *     responses:
 *       200:
 *         description: Authorization Error Manager item deleted successfully
 *       404:
 *         description: Authorization Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authorizationErrorManagerController.delete.bind(authorizationErrorManagerController));

/**
 * @swagger
 * /api/security-error-response/authorization-error-manager/health:
 *   get:
 *     summary: Health check for authorization error manager service
 *     tags: [Authorization Error Manager]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', authorizationErrorManagerController.healthCheck.bind(authorizationErrorManagerController));

export { router as authorizationErrorManagerRoutes };
export default router;