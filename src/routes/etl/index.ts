import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

// Apply authentication middleware to all ETL routes
router.use(authenticateToken);

// ETL Dashboard route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ETL Management Platform',
    categories: [
      { name: 'extraction', title: 'Data Extraction & Ingestion', pageCount: 12 },
      { name: 'transformation', title: 'Data Transformation & Processing', pageCount: 10 },
      { name: 'loading', title: 'Data Loading & Storage', pageCount: 8 },
      { name: 'pipeline', title: 'Pipeline Management & Orchestration', pageCount: 7 },
      { name: 'monitoring', title: 'Monitoring & Analytics', pageCount: 7 },
      { name: 'governance', title: 'Governance & Compliance', pageCount: 5 }
    ],
    totalPages: 49
  });
});

// Category routes
router.use('/extraction', require('./extractionRoutes').default);
router.use('/transformation', require('./transformationRoutes').default);
router.use('/loading', require('./loadingRoutes').default);
router.use('/pipeline', require('./pipelineRoutes').default);
router.use('/monitoring', require('./monitoringRoutes').default);
router.use('/governance', require('./governanceRoutes').default);

export default router;