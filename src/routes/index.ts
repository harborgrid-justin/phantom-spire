import { Router } from 'express';
import authRoutes from './auth';
import iocRoutes from './iocs';
import mitreRoutes from './mitre';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/iocs', iocRoutes);
router.use('/mitre', mitreRoutes);

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
      docs: '/api-docs',
      health: '/health',
    },
  });
});

export default router;
