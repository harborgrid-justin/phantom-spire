import { Router } from 'express';
import { schemaValidationErrorManagerController } from '../../controllers/data-error-recovery/schemaValidationErrorManagerController';

const router = Router();

/**
 * @swagger
 * /api/data-error-recovery/schema-validation-error-manager:
 *   get:
 *     summary: Get all schema validation error manager items
 *     tags: [Schema Validation Error Manager]
 *     responses:
 *       200:
 *         description: List of schema validation error manager items with analytics
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
router.get('/', schemaValidationErrorManagerController.getAll.bind(schemaValidationErrorManagerController));

/**
 * @swagger
 * /api/data-error-recovery/schema-validation-error-manager/{id}:
 *   get:
 *     summary: Get schema validation error manager item by ID
 *     tags: [Schema Validation Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schema Validation Error Manager item ID
 *     responses:
 *       200:
 *         description: Schema Validation Error Manager item details
 *       404:
 *         description: Schema Validation Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', schemaValidationErrorManagerController.getById.bind(schemaValidationErrorManagerController));

/**
 * @swagger
 * /api/data-error-recovery/schema-validation-error-manager:
 *   post:
 *     summary: Create new schema validation error manager item
 *     tags: [Schema Validation Error Manager]
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
 *         description: Schema Validation Error Manager item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', schemaValidationErrorManagerController.create.bind(schemaValidationErrorManagerController));

/**
 * @swagger
 * /api/data-error-recovery/schema-validation-error-manager/{id}:
 *   put:
 *     summary: Update schema validation error manager item
 *     tags: [Schema Validation Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schema Validation Error Manager item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Schema Validation Error Manager item updated successfully
 *       404:
 *         description: Schema Validation Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', schemaValidationErrorManagerController.update.bind(schemaValidationErrorManagerController));

/**
 * @swagger
 * /api/data-error-recovery/schema-validation-error-manager/{id}:
 *   delete:
 *     summary: Delete schema validation error manager item
 *     tags: [Schema Validation Error Manager]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schema Validation Error Manager item ID
 *     responses:
 *       200:
 *         description: Schema Validation Error Manager item deleted successfully
 *       404:
 *         description: Schema Validation Error Manager item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', schemaValidationErrorManagerController.delete.bind(schemaValidationErrorManagerController));

/**
 * @swagger
 * /api/data-error-recovery/schema-validation-error-manager/health:
 *   get:
 *     summary: Health check for schema validation error manager service
 *     tags: [Schema Validation Error Manager]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', schemaValidationErrorManagerController.healthCheck.bind(schemaValidationErrorManagerController));

export { router as schemaValidationErrorManagerRoutes };
export default router;