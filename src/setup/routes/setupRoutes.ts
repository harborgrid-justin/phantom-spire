import { Router, Request, Response, NextFunction } from 'express';
import { SetupService } from '../services/SetupService.js';
import { DatabaseHealthService } from '../services/DatabaseHealthService.js';
import { SystemRequirementsService } from '../services/SystemRequirementsService.js';
import { AdminUserService } from '../services/AdminUserService.js';

const router = Router();
const setupService = new SetupService();
const databaseHealthService = new DatabaseHealthService();
const systemRequirementsService = new SystemRequirementsService();
const adminUserService = new AdminUserService();

// Middleware to check if setup is required
const requireSetupMode = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.SETUP_MODE !== 'true') {
    return res.status(403).json({
      success: false,
      message: 'Setup mode is disabled. Platform is already configured.'
    });
  }
  next();
};

/**
 * @route GET /api/setup/status
 * @desc Check if setup is required
 * @access Public
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const setupStatus = await setupService.getSetupStatus();
    res.json({
      success: true,
      data: setupStatus
    });
  } catch (error) {
    console.error('Setup status check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check setup status',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/setup/system-check
 * @desc Perform comprehensive system requirements check
 * @access Public (setup mode only)
 */
router.get('/system-check', requireSetupMode, async (req: Request, res: Response) => {
  try {
    console.log('Starting system requirements check...');
    const systemCheck = await systemRequirementsService.performSystemCheck();
    
    res.json({
      success: true,
      status: systemCheck.passed ? 'ready' : 'failed',
      message: systemCheck.passed ? 'System requirements met' : 'System requirements not met',
      data: systemCheck
    });
  } catch (error) {
    console.error('System check failed:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'System check failed: ' + (error as Error).message,
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/setup/database-check/:database
 * @desc Check connection to specific database
 * @access Public (setup mode only)
 * @param {string} database - Database type (mongodb, postgresql, mysql, redis)
 */
router.get('/database-check/:database', requireSetupMode, async (req: Request, res: Response) => {
  try {
    const { database } = req.params;
    console.log(`Checking ${database} connection...`);
    
    if (!['mongodb', 'postgresql', 'mysql', 'redis'].includes(database)) {
      return res.status(400).json({
        success: false,
        connected: false,
        message: 'Invalid database type'
      });
    }
    
    const connectionResult = await databaseHealthService.checkConnection(database);
    
    res.json({
      success: true,
      connected: connectionResult.connected,
      database: database,
      status: connectionResult.status,
      message: connectionResult.message,
      details: connectionResult.details,
      responseTime: connectionResult.responseTime
    });
  } catch (error) {
    console.error(`Database ${req.params.database} check failed:`, error);
    res.status(500).json({
      success: false,
      connected: false,
      database: req.params.database,
      status: 'error',
      message: 'Database connection failed: ' + (error as Error).message,
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/setup/database-health
 * @desc Check health of all databases
 * @access Public (setup mode only)
 */
router.get('/database-health', requireSetupMode, async (req: Request, res: Response) => {
  try {
    console.log('Performing comprehensive database health check...');
    const healthCheck = await databaseHealthService.performHealthCheck();
    
    res.json({
      success: true,
      data: healthCheck
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database health check failed',
      error: (error as Error).message
    });
  }
});

/**
 * @route POST /api/setup/admin-user
 * @desc Create the initial administrator user
 * @access Public (setup mode only)
 * @body {username, email, password, organization}
 */
router.post('/admin-user', requireSetupMode, async (req: Request, res: Response) => {
  try {
    const { username, email, password, organization } = req.body;
    
    // Validation
    if (!username || !email || !password || !organization) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: username, email, password, organization'
      });
    }
    
    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }
    
    console.log(`Creating admin user: ${username} for organization: ${organization}`);
    const result = await adminUserService.createAdminUser({
      username,
      email,
      password,
      organization
    });
    
    res.json({
      success: true,
      message: 'Administrator user created successfully',
      data: {
        userId: result.userId,
        organizationId: result.organizationId,
        username: result.username,
        email: result.email,
        organization: result.organization
      }
    });
  } catch (error) {
    console.error('Admin user creation failed:', error);
    
    // Handle specific errors
    if ((error as Error).message.includes('duplicate') || (error as Error).message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: 'User with this username or email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create administrator user',
      error: (error as Error).message
    });
  }
});

/**
 * @route POST /api/setup/finalize
 * @desc Complete the setup process
 * @access Public (setup mode only)
 * @body {systemConfig, integrationConfig}
 */
router.post('/finalize', requireSetupMode, async (req: Request, res: Response) => {
  try {
    const { systemConfig, integrationConfig } = req.body;
    
    console.log('Finalizing Phantom Spire setup...');
    console.log('System config:', JSON.stringify(systemConfig, null, 2));
    console.log('Integration config keys:', Object.keys(integrationConfig || {}));
    
    const result = await setupService.finalizeSetup({
      systemConfig: systemConfig || {},
      integrationConfig: integrationConfig || {}
    });
    
    // Update environment to disable setup mode
    process.env.SETUP_MODE = 'false';
    process.env.FIRST_RUN = 'false';
    
    console.log('Setup finalized successfully');
    res.json({
      success: true,
      message: 'Phantom Spire setup completed successfully',
      data: result,
      redirectUrl: '/dashboard'
    });
  } catch (error) {
    console.error('Setup finalization failed:', error);
    res.status(500).json({
      success: false,
      message: 'Setup finalization failed',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/setup/progress
 * @desc Get current setup progress
 * @access Public (setup mode only)
 */
router.get('/progress', requireSetupMode, async (req: Request, res: Response) => {
  try {
    const progress = await setupService.getSetupProgress();
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Setup progress check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check setup progress',
      error: (error as Error).message
    });
  }
});

/**
 * @route POST /api/setup/test-integration
 * @desc Test external integration configuration
 * @access Public (setup mode only)
 * @body {type, config}
 */
router.post('/test-integration', requireSetupMode, async (req: Request, res: Response) => {
  try {
    const { type, config } = req.body;
    
    if (!type || !config) {
      return res.status(400).json({
        success: false,
        message: 'Integration type and config are required'
      });
    }
    
    console.log(`Testing ${type} integration...`);
    const result = await setupService.testIntegration(type, config);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(`Integration test failed for ${req.body.type}:`, error);
    res.status(500).json({
      success: false,
      message: 'Integration test failed',
      error: (error as Error).message
    });
  }
});

/**
 * @route GET /api/setup/database-schemas
 * @desc Get database schema initialization status
 * @access Public (setup mode only)
 */
router.get('/database-schemas', requireSetupMode, async (req: Request, res: Response) => {
  try {
    const schemaStatus = await setupService.getDatabaseSchemaStatus();
    
    res.json({
      success: true,
      data: schemaStatus
    });
  } catch (error) {
    console.error('Database schema check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check database schemas',
      error: (error as Error).message
    });
  }
});

export default router;