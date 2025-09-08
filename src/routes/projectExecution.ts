/**
 * Main Project Execution Routes
 * Integrates all 48 project execution modules into the main API
 */

import { Router } from 'express';
import { projectExecutionRoutes } from './project-execution/index.js';

const router = Router();

// Mount all project execution route modules
for (const routeConfig of projectExecutionRoutes) {
  const categoryRouter = Router();
  
  // Mount the specific module route under its category path
  categoryRouter.use(routeConfig.path, routeConfig.createRouter());
  
  // Mount the category router under the project execution namespace
  router.use(`/${routeConfig.category}`, categoryRouter);
}

// Health check endpoint for project execution module
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Project Execution module is operational',
    modules: projectExecutionRoutes.length,
    categories: [...new Set(projectExecutionRoutes.map(r => r.category))],
    timestamp: new Date()
  });
});

// Overview endpoint
router.get('/', (req, res) => {
  const categories = projectExecutionRoutes.reduce((acc, route) => {
    if (!acc[route.category]) {
      acc[route.category] = [];
    }
    acc[route.category].push({
      path: route.path,
      title: route.title
    });
    return acc;
  }, {});

  res.json({
    success: true,
    message: 'Project Execution API - 48 modules for comprehensive project management',
    totalModules: projectExecutionRoutes.length,
    categories,
    endpoints: {
      health: '/api/v1/project-execution/health',
      modules: Object.keys(categories).map(category => ({
        category,
        baseUrl: `/api/v1/project-execution/${category}`,
        modules: categories[category].length
      }))
    },
    timestamp: new Date()
  });
});

export default router;