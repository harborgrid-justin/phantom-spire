import { Router } from 'express';
import { sslCertificateErrorHandlerController } from '../../controllers/network-error-handling/sslCertificateErrorHandlerController';

const router = Router();

/**
 * @swagger
 * /api/network-error-handling/ssl-certificate-error-handler:
 *   get:
 *     summary: Get all ssl certificate error handler items
 *     tags: [Ssl Certificate Error Handler]
 *     responses:
 *       200:
 *         description: List of ssl certificate error handler items with analytics
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
router.get('/', sslCertificateErrorHandlerController.getAll.bind(sslCertificateErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/ssl-certificate-error-handler/{id}:
 *   get:
 *     summary: Get ssl certificate error handler item by ID
 *     tags: [Ssl Certificate Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ssl Certificate Error Handler item ID
 *     responses:
 *       200:
 *         description: Ssl Certificate Error Handler item details
 *       404:
 *         description: Ssl Certificate Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', sslCertificateErrorHandlerController.getById.bind(sslCertificateErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/ssl-certificate-error-handler:
 *   post:
 *     summary: Create new ssl certificate error handler item
 *     tags: [Ssl Certificate Error Handler]
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
 *         description: Ssl Certificate Error Handler item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', sslCertificateErrorHandlerController.create.bind(sslCertificateErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/ssl-certificate-error-handler/{id}:
 *   put:
 *     summary: Update ssl certificate error handler item
 *     tags: [Ssl Certificate Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ssl Certificate Error Handler item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ssl Certificate Error Handler item updated successfully
 *       404:
 *         description: Ssl Certificate Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', sslCertificateErrorHandlerController.update.bind(sslCertificateErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/ssl-certificate-error-handler/{id}:
 *   delete:
 *     summary: Delete ssl certificate error handler item
 *     tags: [Ssl Certificate Error Handler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ssl Certificate Error Handler item ID
 *     responses:
 *       200:
 *         description: Ssl Certificate Error Handler item deleted successfully
 *       404:
 *         description: Ssl Certificate Error Handler item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', sslCertificateErrorHandlerController.delete.bind(sslCertificateErrorHandlerController));

/**
 * @swagger
 * /api/network-error-handling/ssl-certificate-error-handler/health:
 *   get:
 *     summary: Health check for ssl certificate error handler service
 *     tags: [Ssl Certificate Error Handler]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', sslCertificateErrorHandlerController.healthCheck.bind(sslCertificateErrorHandlerController));

export { router as sslCertificateErrorHandlerRoutes };
export default router;