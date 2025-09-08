import { Router } from 'express';
import { userWorkflowErrorGuidanceController } from '../../controllers/user-error-guidance/userWorkflowErrorGuidanceController';

const router = Router();

/**
 * @swagger
 * /api/user-error-guidance/user-workflow-error-guidance:
 *   get:
 *     summary: Get all user workflow error guidance items
 *     tags: [User Workflow Error Guidance]
 *     responses:
 *       200:
 *         description: List of user workflow error guidance items with analytics
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
router.get('/', userWorkflowErrorGuidanceController.getAll.bind(userWorkflowErrorGuidanceController));

/**
 * @swagger
 * /api/user-error-guidance/user-workflow-error-guidance/{id}:
 *   get:
 *     summary: Get user workflow error guidance item by ID
 *     tags: [User Workflow Error Guidance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User Workflow Error Guidance item ID
 *     responses:
 *       200:
 *         description: User Workflow Error Guidance item details
 *       404:
 *         description: User Workflow Error Guidance item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', userWorkflowErrorGuidanceController.getById.bind(userWorkflowErrorGuidanceController));

/**
 * @swagger
 * /api/user-error-guidance/user-workflow-error-guidance:
 *   post:
 *     summary: Create new user workflow error guidance item
 *     tags: [User Workflow Error Guidance]
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
 *         description: User Workflow Error Guidance item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', userWorkflowErrorGuidanceController.create.bind(userWorkflowErrorGuidanceController));

/**
 * @swagger
 * /api/user-error-guidance/user-workflow-error-guidance/{id}:
 *   put:
 *     summary: Update user workflow error guidance item
 *     tags: [User Workflow Error Guidance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User Workflow Error Guidance item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User Workflow Error Guidance item updated successfully
 *       404:
 *         description: User Workflow Error Guidance item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', userWorkflowErrorGuidanceController.update.bind(userWorkflowErrorGuidanceController));

/**
 * @swagger
 * /api/user-error-guidance/user-workflow-error-guidance/{id}:
 *   delete:
 *     summary: Delete user workflow error guidance item
 *     tags: [User Workflow Error Guidance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User Workflow Error Guidance item ID
 *     responses:
 *       200:
 *         description: User Workflow Error Guidance item deleted successfully
 *       404:
 *         description: User Workflow Error Guidance item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', userWorkflowErrorGuidanceController.delete.bind(userWorkflowErrorGuidanceController));

/**
 * @swagger
 * /api/user-error-guidance/user-workflow-error-guidance/health:
 *   get:
 *     summary: Health check for user workflow error guidance service
 *     tags: [User Workflow Error Guidance]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', userWorkflowErrorGuidanceController.healthCheck.bind(userWorkflowErrorGuidanceController));

export { router as userWorkflowErrorGuidanceRoutes };
export default router;