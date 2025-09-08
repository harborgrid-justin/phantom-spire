import { Router } from 'express';
import { intrusionDetectionErrorManagerController } from '../../controllers/security-error-response/intrusionDetectionErrorManagerController';

const router = Router();

/**
 * @swagger
 * /api/security-error-response/intrusion-detection-error-manager:
 *   get:
 *     summary: Get all intrusion detection error manager items
 *     tags: [Intrusion Detection Error Manager]
 *     responses:
 *       200:
 *         description: List of intrusion detection error manager items with analytics
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
router.get('/', intrusionDetectionErrorManagerController.getAll.bind(intrusionDetectionErrorManagerController));

/**
 * @swagger
 * /api/security-error-response/intrusion-detection-error-manager/{id}:
 *   get:
 *     summary: Get intrusion detection error manager item by ID
 *     tags: [Intrusion Detection Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Intrusion Detection Error Manager item ID
 *     responses:
 *       200:
 *         description: Intrusion Detection Error Manager item details
 *       404:
 *         description: Intrusion Detection Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', intrusionDetectionErrorManagerController.getById.bind(intrusionDetectionErrorManagerController));

/**
 * @swagger
 * /api/security-error-response/intrusion-detection-error-manager:
 *   post:
 *     summary: Create new intrusion detection error manager item
 *     tags: [Intrusion Detection Error Manager]
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
 *         description: Intrusion Detection Error Manager item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', intrusionDetectionErrorManagerController.create.bind(intrusionDetectionErrorManagerController));

/**
 * @swagger
 * /api/security-error-response/intrusion-detection-error-manager/{id}:
 *   put:
 *     summary: Update intrusion detection error manager item
 *     tags: [Intrusion Detection Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Intrusion Detection Error Manager item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Intrusion Detection Error Manager item updated successfully
 *       404:
 *         description: Intrusion Detection Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', intrusionDetectionErrorManagerController.update.bind(intrusionDetectionErrorManagerController));

/**
 * @swagger
 * /api/security-error-response/intrusion-detection-error-manager/{id}:
 *   delete:
 *     summary: Delete intrusion detection error manager item
 *     tags: [Intrusion Detection Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Intrusion Detection Error Manager item ID
 *     responses:
 *       200:
 *         description: Intrusion Detection Error Manager item deleted successfully
 *       404:
 *         description: Intrusion Detection Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', intrusionDetectionErrorManagerController.delete.bind(intrusionDetectionErrorManagerController));

/**
 * @swagger
 * /api/security-error-response/intrusion-detection-error-manager/health:
 *   get:
 *     summary: Health check for intrusion detection error manager service
 *     tags: [Intrusion Detection Error Manager]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', intrusionDetectionErrorManagerController.healthCheck.bind(intrusionDetectionErrorManagerController));

export { router as intrusionDetectionErrorManagerRoutes };
export default router;