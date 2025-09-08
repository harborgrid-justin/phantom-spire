import { Router } from 'express';
import { tokenExpirationManagerController } from '../../controllers/security-error-response/tokenExpirationManagerController';

const router = Router();

/**
 * @swagger
 * /api/security-error-response/token-expiration-manager:
 *   get:
 *     summary: Get all token expiration manager items
 *     tags: [Token Expiration Manager]
 *     responses:
 *       200:
 *         description: List of token expiration manager items with analytics
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
router.get('/', tokenExpirationManagerController.getAll.bind(tokenExpirationManagerController));

/**
 * @swagger
 * /api/security-error-response/token-expiration-manager/{id}:
 *   get:
 *     summary: Get token expiration manager item by ID
 *     tags: [Token Expiration Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Token Expiration Manager item ID
 *     responses:
 *       200:
 *         description: Token Expiration Manager item details
 *       404:
 *         description: Token Expiration Manager item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', tokenExpirationManagerController.getById.bind(tokenExpirationManagerController));

/**
 * @swagger
 * /api/security-error-response/token-expiration-manager:
 *   post:
 *     summary: Create new token expiration manager item
 *     tags: [Token Expiration Manager]
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
 *         description: Token Expiration Manager item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', tokenExpirationManagerController.create.bind(tokenExpirationManagerController));

/**
 * @swagger
 * /api/security-error-response/token-expiration-manager/{id}:
 *   put:
 *     summary: Update token expiration manager item
 *     tags: [Token Expiration Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Token Expiration Manager item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Token Expiration Manager item updated successfully
 *       404:
 *         description: Token Expiration Manager item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', tokenExpirationManagerController.update.bind(tokenExpirationManagerController));

/**
 * @swagger
 * /api/security-error-response/token-expiration-manager/{id}:
 *   delete:
 *     summary: Delete token expiration manager item
 *     tags: [Token Expiration Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Token Expiration Manager item ID
 *     responses:
 *       200:
 *         description: Token Expiration Manager item deleted successfully
 *       404:
 *         description: Token Expiration Manager item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', tokenExpirationManagerController.delete.bind(tokenExpirationManagerController));

/**
 * @swagger
 * /api/security-error-response/token-expiration-manager/health:
 *   get:
 *     summary: Health check for token expiration manager service
 *     tags: [Token Expiration Manager]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', tokenExpirationManagerController.healthCheck.bind(tokenExpirationManagerController));

export { router as tokenExpirationManagerRoutes };
export default router;