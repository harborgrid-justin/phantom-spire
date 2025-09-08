/**
 * Case Management Routes Integration
 * Integrates all 40 case management routes into the main application
 */

import { Router } from 'express';
import { caseManagementRoutes } from './case-management/index.js';

export function createCaseManagementRouter(): Router {
  const router = Router();

  // Register all case management routes
  caseManagementRoutes.forEach(route => {
    console.log(`📋 Registering case management route: ${route.path} (${route.title})`);
    router.use(route.path, route.createRouter());
  });

  // Main case management dashboard route
  router.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Case Management System',
      availableRoutes: caseManagementRoutes.map(route => ({
        path: `/api/v1/case-management${route.path}`,
        title: route.title,
        category: route.category,
        description: `API endpoints for ${route.title.toLowerCase()}`
      })),
      totalModules: caseManagementRoutes.length,
      categories: {
        lifecycle: caseManagementRoutes.filter(r => r.category === 'lifecycle').length,
        evidence: caseManagementRoutes.filter(r => r.category === 'evidence').length,
        workflows: caseManagementRoutes.filter(r => r.category === 'workflows').length,
        analytics: caseManagementRoutes.filter(r => r.category === 'analytics').length,
        compliance: caseManagementRoutes.filter(r => r.category === 'compliance').length
      },
      timestamp: new Date().toISOString()
    });
  });

  return router;
}