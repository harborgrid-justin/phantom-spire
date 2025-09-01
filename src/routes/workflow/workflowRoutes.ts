/**
 * Fortune 100-Grade Workflow BPM API Routes
 * RESTful API endpoints for workflow management and execution
 */

import { Router, Response } from 'express';
import { WorkflowBPMOrchestrator } from '../../workflow-bpm/index.js';
import { validateRequest } from '../../middleware/validation.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param } from 'express-validator';
import { logger } from '../../utils/logger.js';
import { AuthRequest } from '../../middleware/auth.js';

const router = Router();

// Apply authentication middleware to all workflow routes
router.use(authenticate);

/**
 * @swagger
 * /api/workflow/definitions:
 *   get:
 *     summary: List all workflow definitions
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by workflow category
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by tags
 *     responses:
 *       200:
 *         description: List of workflow definitions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WorkflowDefinition'
 */
router.get('/definitions', async (req: AuthRequest, res: Response) => {
  try {
    const orchestrator = req.app.locals.workflowOrchestrator as WorkflowBPMOrchestrator;
    const definitions = await orchestrator.getWorkflowDefinitions();
    
    // Apply filters if provided
    let filteredDefinitions = definitions;
    
    if (req.query.category) {
      filteredDefinitions = filteredDefinitions.filter(def => 
        def.category === req.query.category
      );
    }
    
    if (req.query.tags) {
      const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
      filteredDefinitions = filteredDefinitions.filter(def => 
        tags.some((tag: string) => def.tags.includes(tag))
      );
    }

    res.json({
      success: true,
      data: filteredDefinitions,
      count: filteredDefinitions.length
    });
  } catch (error) {
    logger.error('Failed to get workflow definitions', {
      error: (error as Error).message,
      query: req.query
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve workflow definitions',
      error: (error as Error).message
    });
  }
});

/**
 * @swagger
 * /api/workflow/definitions:
 *   post:
 *     summary: Register a new workflow definition
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkflowDefinition'
 *     responses:
 *       201:
 *         description: Workflow definition registered successfully
 *       400:
 *         description: Invalid workflow definition
 */
router.post('/definitions',
  [
    body('id').notEmpty().withMessage('Workflow ID is required'),
    body('name').notEmpty().withMessage('Workflow name is required'),
    body('version').notEmpty().withMessage('Workflow version is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('steps').isArray().withMessage('Steps must be an array'),
    validateRequest
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const orchestrator = req.app.locals.workflowOrchestrator as WorkflowBPMOrchestrator;
      const definition = req.body;
      
      // Add metadata
      definition.metadata = {
        ...definition.metadata,
        author: req.user?.id || 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await orchestrator.registerWorkflowDefinition(definition);

      logger.info('Workflow definition registered via API', {
        workflowId: definition.id,
        version: definition.version,
        userId: req.user?.id
      });

      res.status(201).json({
        success: true,
        message: 'Workflow definition registered successfully',
        data: { id: definition.id, version: definition.version }
      });
    } catch (error) {
      logger.error('Failed to register workflow definition', {
        error: (error as Error).message,
        workflowId: req.body.id,
        userId: req.user?.id
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to register workflow definition',
        error: (error as Error).message
      });
    }
  }
);

/**
 * @swagger
 * /api/workflow/instances:
 *   get:
 *     summary: List workflow instances
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workflowId
 *         schema:
 *           type: string
 *         description: Filter by workflow ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [pending, running, paused, completed, failed, cancelled, suspended]
 *         description: Filter by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: List of workflow instances
 */
router.get('/instances', async (req: AuthRequest, res: Response) => {
  try {
    const orchestrator = req.app.locals.workflowOrchestrator as WorkflowBPMOrchestrator;
    
    const filters = {
      workflowId: req.query.workflowId as string,
      status: req.query.status ? 
        (Array.isArray(req.query.status) ? req.query.status : [req.query.status]) as string[] : 
        undefined,
      limit: parseInt(req.query.limit as string) || 100,
      offset: parseInt(req.query.offset as string) || 0
    };

    const instances = await orchestrator.listWorkflowInstances(filters);

    res.json({
      success: true,
      data: instances,
      count: instances.length,
      pagination: {
        limit: filters.limit,
        offset: filters.offset
      }
    });
  } catch (error) {
    logger.error('Failed to get workflow instances', {
      error: (error as Error).message,
      query: req.query
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve workflow instances',
      error: (error as Error).message
    });
  }
});

/**
 * @swagger
 * /api/workflow/instances:
 *   post:
 *     summary: Start a new workflow instance
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workflowId
 *             properties:
 *               workflowId:
 *                 type: string
 *                 description: ID of the workflow to start
 *               parameters:
 *                 type: object
 *                 description: Parameters to pass to the workflow
 *     responses:
 *       201:
 *         description: Workflow instance started successfully
 *       400:
 *         description: Invalid request
 */
router.post('/instances',
  [
    body('workflowId').notEmpty().withMessage('Workflow ID is required'),
    validateRequest
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const orchestrator = req.app.locals.workflowOrchestrator as WorkflowBPMOrchestrator;
      const { workflowId, parameters = {} } = req.body;
      const initiatedBy = req.user?.id || 'api-user';

      const instance = await orchestrator.startWorkflow(workflowId, parameters, initiatedBy);

      logger.info('Workflow started via API', {
        instanceId: instance.id,
        workflowId,
        initiatedBy,
        userId: req.user?.id
      });

      res.status(201).json({
        success: true,
        message: 'Workflow started successfully',
        data: {
          instanceId: instance.id,
          workflowId: instance.workflowId,
          status: instance.status,
          startedAt: instance.startedAt
        }
      });
    } catch (error) {
      logger.error('Failed to start workflow', {
        error: (error as Error).message,
        workflowId: req.body.workflowId,
        userId: req.user?.id
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to start workflow',
        error: (error as Error).message
      });
    }
  }
);

/**
 * @swagger
 * /api/workflow/instances/{instanceId}:
 *   get:
 *     summary: Get workflow instance details
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow instance ID
 *     responses:
 *       200:
 *         description: Workflow instance details
 *       404:
 *         description: Workflow instance not found
 */
router.get('/instances/:instanceId',
  [
    param('instanceId').notEmpty().withMessage('Instance ID is required'),
    validateRequest
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const orchestrator = req.app.locals.workflowOrchestrator as WorkflowBPMOrchestrator;
      const { instanceId } = req.params;

      const instance = await orchestrator.getWorkflowInstance(instanceId);

      res.json({
        success: true,
        data: instance
      });
    } catch (error) {
      logger.error('Failed to get workflow instance', {
        error: (error as Error).message,
        instanceId: req.params.instanceId
      });
      
      const statusCode = (error as Error).message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Failed to retrieve workflow instance',
        error: (error as Error).message
      });
    }
  }
);

/**
 * @swagger
 * /api/workflow/instances/{instanceId}/pause:
 *   post:
 *     summary: Pause a workflow instance
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow instance ID
 *     responses:
 *       200:
 *         description: Workflow paused successfully
 *       404:
 *         description: Workflow instance not found
 */
router.post('/instances/:instanceId/pause',
  [
    param('instanceId').notEmpty().withMessage('Instance ID is required'),
    validateRequest
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const orchestrator = req.app.locals.workflowOrchestrator as WorkflowBPMOrchestrator;
      const { instanceId } = req.params;

      await orchestrator.pauseWorkflow(instanceId);

      logger.info('Workflow paused via API', {
        instanceId,
        userId: req.user?.id
      });

      res.json({
        success: true,
        message: 'Workflow paused successfully'
      });
    } catch (error) {
      logger.error('Failed to pause workflow', {
        error: (error as Error).message,
        instanceId: req.params.instanceId,
        userId: req.user?.id
      });
      
      const statusCode = (error as Error).message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Failed to pause workflow',
        error: (error as Error).message
      });
    }
  }
);

/**
 * @swagger
 * /api/workflow/instances/{instanceId}/resume:
 *   post:
 *     summary: Resume a paused workflow instance
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow instance ID
 *     responses:
 *       200:
 *         description: Workflow resumed successfully
 *       404:
 *         description: Workflow instance not found
 */
router.post('/instances/:instanceId/resume',
  [
    param('instanceId').notEmpty().withMessage('Instance ID is required'),
    validateRequest
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const orchestrator = req.app.locals.workflowOrchestrator as WorkflowBPMOrchestrator;
      const { instanceId } = req.params;

      await orchestrator.resumeWorkflow(instanceId);

      logger.info('Workflow resumed via API', {
        instanceId,
        userId: req.user?.id
      });

      res.json({
        success: true,
        message: 'Workflow resumed successfully'
      });
    } catch (error) {
      logger.error('Failed to resume workflow', {
        error: (error as Error).message,
        instanceId: req.params.instanceId,
        userId: req.user?.id
      });
      
      const statusCode = (error as Error).message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Failed to resume workflow',
        error: (error as Error).message
      });
    }
  }
);

/**
 * @swagger
 * /api/workflow/instances/{instanceId}/cancel:
 *   post:
 *     summary: Cancel a workflow instance
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow instance ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Workflow cancelled successfully
 *       404:
 *         description: Workflow instance not found
 */
router.post('/instances/:instanceId/cancel',
  [
    param('instanceId').notEmpty().withMessage('Instance ID is required'),
    validateRequest
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const orchestrator = req.app.locals.workflowOrchestrator as WorkflowBPMOrchestrator;
      const { instanceId } = req.params;
      const { reason } = req.body;

      await orchestrator.cancelWorkflow(instanceId, reason);

      logger.info('Workflow cancelled via API', {
        instanceId,
        reason,
        userId: req.user?.id
      });

      res.json({
        success: true,
        message: 'Workflow cancelled successfully'
      });
    } catch (error) {
      logger.error('Failed to cancel workflow', {
        error: (error as Error).message,
        instanceId: req.params.instanceId,
        userId: req.user?.id
      });
      
      const statusCode = (error as Error).message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: 'Failed to cancel workflow',
        error: (error as Error).message
      });
    }
  }
);

// CTI-specific workflow endpoints

/**
 * @swagger
 * /api/workflow/cti/apt-response:
 *   post:
 *     summary: Start APT response workflow
 *     tags: [CTI Workflows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - indicators
 *               - event
 *             properties:
 *               indicators:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: APT indicators detected
 *               event:
 *                 type: object
 *                 description: Detection event details
 *     responses:
 *       201:
 *         description: APT response workflow started
 */
router.post('/cti/apt-response',
  [
    body('indicators').isArray().withMessage('Indicators must be an array'),
    body('event').isObject().withMessage('Event must be an object'),
    validateRequest
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const orchestrator = req.app.locals.workflowOrchestrator as WorkflowBPMOrchestrator;
      const { indicators, event } = req.body;
      const initiatedBy = req.user?.id || 'api-user';

      const instance = await orchestrator.startAPTResponseWorkflow(indicators, event, initiatedBy);

      logger.info('APT response workflow started via API', {
        instanceId: instance.id,
        indicatorCount: indicators.length,
        userId: req.user?.id
      });

      res.status(201).json({
        success: true,
        message: 'APT response workflow started successfully',
        data: {
          instanceId: instance.id,
          workflowId: instance.workflowId,
          status: instance.status
        }
      });
    } catch (error) {
      logger.error('Failed to start APT response workflow', {
        error: (error as Error).message,
        userId: req.user?.id
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to start APT response workflow',
        error: (error as Error).message
      });
    }
  }
);

/**
 * @swagger
 * /api/workflow/cti/malware-analysis:
 *   post:
 *     summary: Start malware analysis workflow
 *     tags: [CTI Workflows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sample
 *             properties:
 *               sample:
 *                 type: object
 *                 description: Malware sample metadata and data
 *     responses:
 *       201:
 *         description: Malware analysis workflow started
 */
router.post('/cti/malware-analysis',
  [
    body('sample').isObject().withMessage('Sample must be an object'),
    validateRequest
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const orchestrator = req.app.locals.workflowOrchestrator as WorkflowBPMOrchestrator;
      const { sample } = req.body;
      const initiatedBy = req.user?.id || 'api-user';

      const instance = await orchestrator.startMalwareAnalysisWorkflow(sample, initiatedBy);

      logger.info('Malware analysis workflow started via API', {
        instanceId: instance.id,
        sampleId: sample.id,
        userId: req.user?.id
      });

      res.status(201).json({
        success: true,
        message: 'Malware analysis workflow started successfully',
        data: {
          instanceId: instance.id,
          workflowId: instance.workflowId,
          status: instance.status
        }
      });
    } catch (error) {
      logger.error('Failed to start malware analysis workflow', {
        error: (error as Error).message,
        userId: req.user?.id
      });
      
      res.status(500).json({
        success: false,
        message: 'Failed to start malware analysis workflow',
        error: (error as Error).message
      });
    }
  }
);

/**
 * @swagger
 * /api/workflow/metrics:
 *   get:
 *     summary: Get workflow engine metrics
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workflow engine metrics
 */
router.get('/metrics', async (req: AuthRequest, res: Response) => {
  try {
    const orchestrator = req.app.locals.workflowOrchestrator as WorkflowBPMOrchestrator;
    
    const performanceMetrics = orchestrator.getPerformanceMetrics();
    const engineMetrics = await orchestrator.getEngineMetrics();

    res.json({
      success: true,
      data: {
        performance: performanceMetrics,
        engine: engineMetrics,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Failed to get workflow metrics', {
      error: (error as Error).message
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve workflow metrics',
      error: (error as Error).message
    });
  }
});

export default router;
