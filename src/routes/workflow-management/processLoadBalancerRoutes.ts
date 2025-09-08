import { Router } from 'express';
import { processLoadBalancerController } from '../controllers/processLoadBalancerController';

const router = Router();

/**
 * @swagger
 * /api/workflow-management/process-load-balancer:
 *   get:
 *     summary: Get all process load balancer items
 *     tags: [Process Load Balancer]
 *     responses:
 *       200:
 *         description: List of process load balancer items
 */
router.get('/', processLoadBalancerController.getAll.bind(processLoadBalancerController));

/**
 * @swagger
 * /api/workflow-management/process-load-balancer/{id}:
 *   get:
 *     summary: Get process load balancer item by ID
 *     tags: [Process Load Balancer]
 */
router.get('/:id', processLoadBalancerController.getById.bind(processLoadBalancerController));

/**
 * @swagger
 * /api/workflow-management/process-load-balancer:
 *   post:
 *     summary: Create new process load balancer item
 *     tags: [Process Load Balancer]
 */
router.post('/', processLoadBalancerController.create.bind(processLoadBalancerController));

export { router as processLoadBalancerRoutes };
export default router;