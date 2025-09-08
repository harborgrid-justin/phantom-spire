import { Router } from 'express';
import { missingDataValidatorController } from '../../controllers/data-error-recovery/missingDataValidatorController';

const router = Router();

/**
 * @swagger
 * /api/data-error-recovery/missing-data-validator:
 *   get:
 *     summary: Get all missing data validator items
 *     tags: [Missing Data Validator]
 *     responses:
 *       200:
 *         description: List of missing data validator items with analytics
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
router.get('/', missingDataValidatorController.getAll.bind(missingDataValidatorController));

/**
 * @swagger
 * /api/data-error-recovery/missing-data-validator/{id}:
 *   get:
 *     summary: Get missing data validator item by ID
 *     tags: [Missing Data Validator]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Missing Data Validator item ID
 *     responses:
 *       200:
 *         description: Missing Data Validator item details
 *       404:
 *         description: Missing Data Validator item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', missingDataValidatorController.getById.bind(missingDataValidatorController));

/**
 * @swagger
 * /api/data-error-recovery/missing-data-validator:
 *   post:
 *     summary: Create new missing data validator item
 *     tags: [Missing Data Validator]
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
 *         description: Missing Data Validator item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', missingDataValidatorController.create.bind(missingDataValidatorController));

/**
 * @swagger
 * /api/data-error-recovery/missing-data-validator/{id}:
 *   put:
 *     summary: Update missing data validator item
 *     tags: [Missing Data Validator]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Missing Data Validator item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Missing Data Validator item updated successfully
 *       404:
 *         description: Missing Data Validator item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', missingDataValidatorController.update.bind(missingDataValidatorController));

/**
 * @swagger
 * /api/data-error-recovery/missing-data-validator/{id}:
 *   delete:
 *     summary: Delete missing data validator item
 *     tags: [Missing Data Validator]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Missing Data Validator item ID
 *     responses:
 *       200:
 *         description: Missing Data Validator item deleted successfully
 *       404:
 *         description: Missing Data Validator item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', missingDataValidatorController.delete.bind(missingDataValidatorController));

/**
 * @swagger
 * /api/data-error-recovery/missing-data-validator/health:
 *   get:
 *     summary: Health check for missing data validator service
 *     tags: [Missing Data Validator]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', missingDataValidatorController.healthCheck.bind(missingDataValidatorController));

export { router as missingDataValidatorRoutes };
export default router;