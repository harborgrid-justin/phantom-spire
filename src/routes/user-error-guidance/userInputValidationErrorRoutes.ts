import { Router } from 'express';
import { userInputValidationErrorController } from '../../controllers/user-error-guidance/userInputValidationErrorController';

const router = Router();

/**
 * @swagger
 * /api/user-error-guidance/user-input-validation-error:
 *   get:
 *     summary: Get all user input validation error items
 *     tags: [User Input Validation Error]
 *     responses:
 *       200:
 *         description: List of user input validation error items with analytics
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
router.get('/', userInputValidationErrorController.getAll.bind(userInputValidationErrorController));

/**
 * @swagger
 * /api/user-error-guidance/user-input-validation-error/{id}:
 *   get:
 *     summary: Get user input validation error item by ID
 *     tags: [User Input Validation Error]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User Input Validation Error item ID
 *     responses:
 *       200:
 *         description: User Input Validation Error item details
 *       404:
 *         description: User Input Validation Error item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', userInputValidationErrorController.getById.bind(userInputValidationErrorController));

/**
 * @swagger
 * /api/user-error-guidance/user-input-validation-error:
 *   post:
 *     summary: Create new user input validation error item
 *     tags: [User Input Validation Error]
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
 *         description: User Input Validation Error item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', userInputValidationErrorController.create.bind(userInputValidationErrorController));

/**
 * @swagger
 * /api/user-error-guidance/user-input-validation-error/{id}:
 *   put:
 *     summary: Update user input validation error item
 *     tags: [User Input Validation Error]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User Input Validation Error item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User Input Validation Error item updated successfully
 *       404:
 *         description: User Input Validation Error item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', userInputValidationErrorController.update.bind(userInputValidationErrorController));

/**
 * @swagger
 * /api/user-error-guidance/user-input-validation-error/{id}:
 *   delete:
 *     summary: Delete user input validation error item
 *     tags: [User Input Validation Error]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User Input Validation Error item ID
 *     responses:
 *       200:
 *         description: User Input Validation Error item deleted successfully
 *       404:
 *         description: User Input Validation Error item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', userInputValidationErrorController.delete.bind(userInputValidationErrorController));

/**
 * @swagger
 * /api/user-error-guidance/user-input-validation-error/health:
 *   get:
 *     summary: Health check for user input validation error service
 *     tags: [User Input Validation Error]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', userInputValidationErrorController.healthCheck.bind(userInputValidationErrorController));

export { router as userInputValidationErrorRoutes };
export default router;