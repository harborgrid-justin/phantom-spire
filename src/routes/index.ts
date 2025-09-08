import { Router } from 'express';
import authRoutes from './auth.js';
import iocRoutes from './iocs.js';
import mitreRoutes from './mitre.js';
import evidenceRoutes from './evidence/evidenceRoutes.js';
import issueRoutes from './issue/issueRoutesSimplified.js';
import { organizationRoutes } from './organization.js';
import { createTaskRoutes } from './tasks/taskRoutes.js';
import { createTaskTemplateRoutes } from './tasks/taskTemplateRoutes.js';
import { createTaskWorkflowRoutes } from './tasks/taskWorkflowRoutes.js';
import { createInvestigationRoutes } from './investigation/investigationRoutes.js';
import attackVectorRoutes from './attackVectors.js';
import cveRoutes from './cve.js';
import cveAdvancedRoutes from './cveAdvanced.js';
import vulnerabilityManagementRoutes from './vulnerabilityManagement.js';
import threatIntelligenceRoutes from './threatIntelligence.js';
import dataManagementRoutes from './dataManagement.js';
import vendorRiskRoutes from './vendorRisk.js';
import forensicsRoutes from './forensics.js';
import projectExecutionRoutes from './projectExecution.js';
import { workflowManagementRoutes } from './workflow-management/index.js';
import { userManagementRoutes } from './user-management/userManagementRoutes.js';
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
  router.use('/cve', cveRoutes);
  router.use('/cve-advanced', cveAdvancedRoutes);
  router.use('/vulnerability-management', vulnerabilityManagementRoutes);
  router.use('/threat-intelligence', threatIntelligenceRoutes);
  router.use('/data-management', dataManagementRoutes);
  router.use('/vendor-risk', vendorRiskRoutes);
  router.use('/forensics', forensicsRoutes);
  router.use('/project-execution', projectExecutionRoutes);
  router.use('/workflow-management', workflowManagementRoutes);
  router.use('/user-management', userManagementRoutes);

  // Task management routes (only if orchestrator is provided)
  if (orchestrator) {
    const taskManager = orchestrator.getTaskManager();
    router.use('/tasks', createTaskRoutes(taskManager));
    router.use('/tasks', createTaskTemplateRoutes());
    router.use('/tasks', createTaskWorkflowRoutes());
  }

  // Investigation routes
  router.use('/investigation', createInvestigationRoutes());

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
        cve: '/api/v1/cve',
        cveAdvanced: '/api/v1/cve-advanced',
        vulnerabilityManagement: '/api/v1/vulnerability-management',
        threatIntelligence: '/api/v1/threat-intelligence',
        dataManagement: '/api/v1/data-management',
        vendorRisk: '/api/v1/vendor-risk',
        forensics: '/api/v1/forensics',
        projectExecution: '/api/v1/project-execution',
        workflowManagement: '/api/v1/workflow-management',
        userManagement: '/api/v1/user-management',
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
        vulnerabilityManagement: true,
        dataManagement: true,
        vendorRiskManagement: true,
        digitalForensics: true,
        projectExecution: true,
        workflowManagement: true,
        userManagement: true,
      },
    });
  });

  return router;
}

// Export default router for backward compatibility
const router = createApiRoutes();
export default router;
