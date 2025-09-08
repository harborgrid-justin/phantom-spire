import { Router } from 'express';
import { encryptionErrorHandlerController } from '../../controllers/security-error-response/encryptionErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/security-error-response/encryption-error-handler:
 *   get:
 *     summary: Get all encryption error handler items
 *     tags: [Encryption Error Handler]
 *     responses:
 *       200:
 *         description: List of encryption error handler items with analytics
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
router.get('/', encryptionErrorHandlerController.getAll.bind(encryptionErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/encryption-error-handler/{id}:
 *   get:
 *     summary: Get encryption error handler item by ID
 *     tags: [Encryption Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Encryption Error Handler item ID
 *     responses:
 *       200:
 *         description: Encryption Error Handler item details
 *       404:
 *         description: Encryption Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', encryptionErrorHandlerController.getById.bind(encryptionErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/encryption-error-handler:
 *   post:
 *     summary: Create new encryption error handler item
 *     tags: [Encryption Error Handler]
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
 *         description: Encryption Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', encryptionErrorHandlerController.create.bind(encryptionErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/encryption-error-handler/{id}:
 *   put:
 *     summary: Update encryption error handler item
 *     tags: [Encryption Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Encryption Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Encryption Error Handler item updated successfully
 *       404:
 *         description: Encryption Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', encryptionErrorHandlerController.update.bind(encryptionErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/encryption-error-handler/{id}:
 *   delete:
 *     summary: Delete encryption error handler item
 *     tags: [Encryption Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Encryption Error Handler item ID
 *     responses:
 *       200:
 *         description: Encryption Error Handler item deleted successfully
 *       404:
 *         description: Encryption Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', encryptionErrorHandlerController.delete.bind(encryptionErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/encryption-error-handler/health:
 *   get:
 *     summary: Health check for encryption error handler service
 *     tags: [Encryption Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', encryptionErrorHandlerController.healthCheck.bind(encryptionErrorHandlerController));

export { router as encryptionErrorHandlerRoutes };
export default router;