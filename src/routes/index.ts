import { Router } from 'express';
import authRoutes from './auth.js';
import iocRoutes from './iocs.js';
import mitreRoutes from './mitre.js';
import evidenceRoutes from './evidence/evidenceRoutes.js';
import issueRoutes from './issue/issueRoutesSimplified.js';
import { organizationRoutes } from './organization.js';
import { createTaskRoutes } from './tasks/taskRoutes.js';
import attackVectorRoutes from './attackVectors.js';
import { DataLayerOrchestrator } from '../data-layer/DataLayerOrchestrator.js';

// Create router factory that accepts orchestrator
export function createApiRoutes(orchestrator?: DataLayerOrchestrator): Router {
  const router = Router();

  // API routes
  router.use('/auth', authRoutes);
  router.use('/iocs', iocRoutes);
  router.use('/mitre', mitreRoutes);
  router.use('/evidence', evidenceRoutes);
  router.use('/issues', issueRoutes);
  router.use('/organizations', organizationRoutes);
  router.use('/attack-vectors', attackVectorRoutes);

  // Task management routes (only if orchestrator is provided)
  if (orchestrator) {
    const taskManager = orchestrator.getTaskManager();
    router.use('/tasks', createTaskRoutes(taskManager));
  }

  // API info endpoint
  router.get('/', (_req, res) => {
    res.json({
      message: 'Phantom Spire CTI Platform API',
      version: '1.0.0',
      status: 'active',
      endpoints: {
        auth: '/api/v1/auth',
        iocs: '/api/v1/iocs',
        mitre: '/api/v1/mitre',
        evidence: '/api/v1/evidence',
        issues: '/api/v1/issues',
        organizations: '/api/v1/organizations',
        attackVectors: '/api/v1/attack-vectors',
        tasks: orchestrator
          ? '/api/v1/tasks'
          : 'not available (orchestrator not initialized)',
        docs: '/api-docs',
        health: '/health',
      },
      features: {
        organizationManagement: true,
        taskManagement: !!orchestrator,
        evidenceManagement: true,
        threatIntelligence: true,
        issueTracking: true,
        attackVectorAnalysis: true,
      },
    });
  });

  return router;
}

// Export default router for backward compatibility
const router = createApiRoutes();
export default router;
