import { Router } from 'express';
import { certificateErrorHandlerController } from '../../controllers/security-error-response/certificateErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/security-error-response/certificate-error-handler:
 *   get:
 *     summary: Get all certificate error handler items
 *     tags: [Certificate Error Handler]
 *     responses:
 *       200:
 *         description: List of certificate error handler items with analytics
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
router.get('/', certificateErrorHandlerController.getAll.bind(certificateErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/certificate-error-handler/{id}:
 *   get:
 *     summary: Get certificate error handler item by ID
 *     tags: [Certificate Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate Error Handler item ID
 *     responses:
 *       200:
 *         description: Certificate Error Handler item details
 *       404:
 *         description: Certificate Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', certificateErrorHandlerController.getById.bind(certificateErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/certificate-error-handler:
 *   post:
 *     summary: Create new certificate error handler item
 *     tags: [Certificate Error Handler]
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
 *         description: Certificate Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', certificateErrorHandlerController.create.bind(certificateErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/certificate-error-handler/{id}:
 *   put:
 *     summary: Update certificate error handler item
 *     tags: [Certificate Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Certificate Error Handler item updated successfully
 *       404:
 *         description: Certificate Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', certificateErrorHandlerController.update.bind(certificateErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/certificate-error-handler/{id}:
 *   delete:
 *     summary: Delete certificate error handler item
 *     tags: [Certificate Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate Error Handler item ID
 *     responses:
 *       200:
 *         description: Certificate Error Handler item deleted successfully
 *       404:
 *         description: Certificate Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', certificateErrorHandlerController.delete.bind(certificateErrorHandlerController));

/**
 * @swagger
 * /api/security-error-response/certificate-error-handler/health:
 *   get:
 *     summary: Health check for certificate error handler service
 *     tags: [Certificate Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', certificateErrorHandlerController.healthCheck.bind(certificateErrorHandlerController));

export { router as certificateErrorHandlerRoutes };
export default router;