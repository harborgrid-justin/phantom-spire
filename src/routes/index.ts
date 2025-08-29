import { Router } from 'express';
import authRoutes from './auth';
import iocRoutes from './iocs';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/iocs', iocRoutes);

// API info endpoint
router.get('/', (_req, res) => {
  res.json({
    message: 'Phantom Spire CTI Platform API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: '/api/v1/auth',
      iocs: '/api/v1/iocs',
      docs: '/api-docs',
      health: '/health',
    },
  });
});

export default router;
