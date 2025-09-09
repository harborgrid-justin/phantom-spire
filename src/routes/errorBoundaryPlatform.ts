/**
 * Error Boundary Platform Routes Integration
 * Comprehensive API routes for all 44 error boundary modules
 * Demonstrates complete frontend-backend integration
 */

import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { BusinessLogicManager } from '../services/business-logic/core/BusinessLogicManager';
import { allErrorBoundaryBusinessLogicModules } from '../services/business-logic/modules/errorBoundaryModules';

// Import all error boundary routes
// System Error Management Routes
import { criticalSystemErrorHandlerRoutes } from './system-error-management/criticalSystemErrorHandlerRoutes';
import { databaseConnectionErrorManagerRoutes } from './system-error-management/databaseConnectionErrorManagerRoutes';
import { serviceUnavailableErrorHandlerRoutes } from './system-error-management/serviceUnavailableErrorHandlerRoutes';
import { memoryOverflowErrorManagerRoutes } from './system-error-management/memoryOverflowErrorManagerRoutes';
import { performanceDegradationHandlerRoutes } from './system-error-management/performanceDegradationHandlerRoutes';
import { configurationErrorResolverRoutes } from './system-error-management/configurationErrorResolverRoutes';
import { dependencyErrorTrackerRoutes } from './system-error-management/dependencyErrorTrackerRoutes';
import { systemRecoveryCoordinatorRoutes } from './system-error-management/systemRecoveryCoordinatorRoutes';

// Data Error Recovery Routes
import { dataCorruptionRecoveryEngineRoutes } from './data-error-recovery/dataCorruptionRecoveryEngineRoutes';
import { malformedDataHandlerRoutes } from './data-error-recovery/malformedDataHandlerRoutes';
import { missingDataValidatorRoutes } from './data-error-recovery/missingDataValidatorRoutes';
import { dataIntegrityMonitorRoutes } from './data-error-recovery/dataIntegrityMonitorRoutes';
import { backupRecoveryManagerRoutes } from './data-error-recovery/backupRecoveryManagerRoutes';
import { dataSyncErrorHandlerRoutes } from './data-error-recovery/dataSyncErrorHandlerRoutes';
import { schemaValidationErrorManagerRoutes } from './data-error-recovery/schemaValidationErrorManagerRoutes';
import { dataMigrationErrorHandlerRoutes } from './data-error-recovery/dataMigrationErrorHandlerRoutes';

// Network Error Handling Routes
import { connectionTimeoutManagerRoutes } from './network-error-handling/connectionTimeoutManagerRoutes';
import { dnsResolutionErrorHandlerRoutes } from './network-error-handling/dnsResolutionErrorHandlerRoutes';
import { bandwidthThrottlingManagerRoutes } from './network-error-handling/bandwidthThrottlingManagerRoutes';
import { sslCertificateErrorHandlerRoutes } from './network-error-handling/sslCertificateErrorHandlerRoutes';
import { proxyErrorManagerRoutes } from './network-error-handling/proxyErrorManagerRoutes';
import { loadBalancerErrorHandlerRoutes } from './network-error-handling/loadBalancerErrorHandlerRoutes';
import { cdnErrorRecoveryManagerRoutes } from './network-error-handling/cdnErrorRecoveryManagerRoutes';
import { apiGatewayErrorHandlerRoutes } from './network-error-handling/apiGatewayErrorHandlerRoutes';

// Security Error Response Routes
import { authenticationErrorHandlerRoutes } from './security-error-response/authenticationErrorHandlerRoutes';
import { authorizationErrorManagerRoutes } from './security-error-response/authorizationErrorManagerRoutes';
import { encryptionErrorHandlerRoutes } from './security-error-response/encryptionErrorHandlerRoutes';
import { securityPolicyViolationHandlerRoutes } from './security-error-response/securityPolicyViolationHandlerRoutes';
import { intrusionDetectionErrorManagerRoutes } from './security-error-response/intrusionDetectionErrorManagerRoutes';
import { certificateErrorHandlerRoutes } from './security-error-response/certificateErrorHandlerRoutes';
import { tokenExpirationManagerRoutes } from './security-error-response/tokenExpirationManagerRoutes';
import { privilegeEscalationErrorHandlerRoutes } from './security-error-response/privilegeEscalationErrorHandlerRoutes';

// Integration Error Management Routes
import { thirdPartyApiErrorHandlerRoutes } from './integration-error-management/thirdPartyApiErrorHandlerRoutes';
import { webhookErrorManagerRoutes } from './integration-error-management/webhookErrorManagerRoutes';
import { messageQueueErrorHandlerRoutes } from './integration-error-management/messageQueueErrorHandlerRoutes';
import { eventStreamErrorHandlerRoutes } from './integration-error-management/eventStreamErrorHandlerRoutes';
import { syncServiceErrorManagerRoutes } from './integration-error-management/syncServiceErrorManagerRoutes';
import { pluginErrorHandlerRoutes } from './integration-error-management/pluginErrorHandlerRoutes';

// User Error Guidance Routes
import { userInputValidationErrorRoutes } from './user-error-guidance/userInputValidationErrorRoutes';
import { sessionTimeoutErrorHandlerRoutes } from './user-error-guidance/sessionTimeoutErrorHandlerRoutes';
import { permissionDeniedErrorManagerRoutes } from './user-error-guidance/permissionDeniedErrorManagerRoutes';
import { featureUnavailableHandlerRoutes } from './user-error-guidance/featureUnavailableHandlerRoutes';
import { browserCompatibilityErrorHandlerRoutes } from './user-error-guidance/browserCompatibilityErrorHandlerRoutes';
import { userWorkflowErrorGuidanceRoutes } from './user-error-guidance/userWorkflowErrorGuidanceRoutes';

const router = express.Router();
const businessLogicManager = BusinessLogicManager.getInstance();

// Middleware for validation errors
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// Middleware for error handling
const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// =========================
// Error Boundary Platform Overview Endpoints
// =========================

/**
 * GET /api/error-boundary-platform/overview
 * Complete platform overview with analytics
 */
router.get(
  '/overview',
  asyncHandler(async (req: Request, res: Response) => {
    const overview = {
      platform: 'Error Boundary Management System',
      version: '1.0.0',
      totalModules: 44,
      categories: {
        'system-error-management': { modules: 8, status: 'active' },
        'data-error-recovery': { modules: 8, status: 'active' },
        'network-error-handling': { modules: 8, status: 'active' },
        'security-error-response': { modules: 8, status: 'active' },
        'integration-error-management': { modules: 6, status: 'active' },
        'user-error-guidance': { modules: 6, status: 'active' },
      },
      businessLogic: {
        totalServices: Object.keys(allErrorBoundaryBusinessLogicModules).length,
        activeServices: Object.keys(allErrorBoundaryBusinessLogicModules)
          .length,
        healthStatus: 'healthy',
      },
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: overview,
    });
  })
);

/**
 * GET /api/error-boundary-platform/health
 * Comprehensive health check for all error boundary modules
 */
router.get(
  '/health',
  asyncHandler(async (req: Request, res: Response) => {
    const healthChecks = {};

    for (const [moduleId, moduleClass] of Object.entries(
      allErrorBoundaryBusinessLogicModules
    )) {
      try {
        const instance = new moduleClass();
        const isHealthy = await instance.healthCheck();
        healthChecks[moduleId] = {
          status: isHealthy ? 'healthy' : 'unhealthy',
          lastCheck: new Date().toISOString(),
        };
      } catch (error) {
        healthChecks[moduleId] = {
          status: 'error',
          error: error.message,
          lastCheck: new Date().toISOString(),
        };
      }
    }

    const totalModules = Object.keys(healthChecks).length;
    const healthyModules = Object.values(healthChecks).filter(
      h => h.status === 'healthy'
    ).length;
    const overallHealth =
      healthyModules === totalModules ? 'healthy' : 'degraded';

    res.status(overallHealth === 'healthy' ? 200 : 503).json({
      success: overallHealth === 'healthy',
      overallHealth,
      totalModules,
      healthyModules,
      healthChecks,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/error-boundary-platform/process-error
 * Universal error processing endpoint
 */
router.post(
  '/process-error',
  [
    body('moduleId').isString().withMessage('Module ID is required'),
    body('errorData').isObject().withMessage('Error data must be an object'),
    body('category').isString().withMessage('Category is required'),
  ],
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const { moduleId, errorData, category } = req.body;

    const result = await businessLogicManager.processRequest({
      serviceId: moduleId,
      operation: 'process-error',
      payload: errorData,
      context: {
        category,
        userId: req.user?.id,
        timestamp: new Date(),
        requestId: `error-${Date.now()}`,
      },
    });

    res.json({
      success: true,
      data: result,
      timestamp: new Date(),
    });
  })
);

// =========================
// Route Registrations by Category
// =========================

// System Error Management Routes
router.use(
  '/system-error-management/critical-system-error-handler',
  criticalSystemErrorHandlerRoutes
);
router.use(
  '/system-error-management/database-connection-error-manager',
  databaseConnectionErrorManagerRoutes
);
router.use(
  '/system-error-management/service-unavailable-error-handler',
  serviceUnavailableErrorHandlerRoutes
);
router.use(
  '/system-error-management/memory-overflow-error-manager',
  memoryOverflowErrorManagerRoutes
);
router.use(
  '/system-error-management/performance-degradation-handler',
  performanceDegradationHandlerRoutes
);
router.use(
  '/system-error-management/configuration-error-resolver',
  configurationErrorResolverRoutes
);
router.use(
  '/system-error-management/dependency-error-tracker',
  dependencyErrorTrackerRoutes
);
router.use(
  '/system-error-management/system-recovery-coordinator',
  systemRecoveryCoordinatorRoutes
);

// Data Error Recovery Routes
router.use(
  '/data-error-recovery/data-corruption-recovery-engine',
  dataCorruptionRecoveryEngineRoutes
);
router.use(
  '/data-error-recovery/malformed-data-handler',
  malformedDataHandlerRoutes
);
router.use(
  '/data-error-recovery/missing-data-validator',
  missingDataValidatorRoutes
);
router.use(
  '/data-error-recovery/data-integrity-monitor',
  dataIntegrityMonitorRoutes
);
router.use(
  '/data-error-recovery/backup-recovery-manager',
  backupRecoveryManagerRoutes
);
router.use(
  '/data-error-recovery/data-sync-error-handler',
  dataSyncErrorHandlerRoutes
);
router.use(
  '/data-error-recovery/schema-validation-error-manager',
  schemaValidationErrorManagerRoutes
);
router.use(
  '/data-error-recovery/data-migration-error-handler',
  dataMigrationErrorHandlerRoutes
);

// Network Error Handling Routes
router.use(
  '/network-error-handling/connection-timeout-manager',
  connectionTimeoutManagerRoutes
);
router.use(
  '/network-error-handling/dns-resolution-error-handler',
  dnsResolutionErrorHandlerRoutes
);
router.use(
  '/network-error-handling/bandwidth-throttling-manager',
  bandwidthThrottlingManagerRoutes
);
router.use(
  '/network-error-handling/ssl-certificate-error-handler',
  sslCertificateErrorHandlerRoutes
);
router.use(
  '/network-error-handling/proxy-error-manager',
  proxyErrorManagerRoutes
);
router.use(
  '/network-error-handling/load-balancer-error-handler',
  loadBalancerErrorHandlerRoutes
);
router.use(
  '/network-error-handling/cdn-error-recovery-manager',
  cdnErrorRecoveryManagerRoutes
);
router.use(
  '/network-error-handling/api-gateway-error-handler',
  apiGatewayErrorHandlerRoutes
);

// Security Error Response Routes
router.use(
  '/security-error-response/authentication-error-handler',
  authenticationErrorHandlerRoutes
);
router.use(
  '/security-error-response/authorization-error-manager',
  authorizationErrorManagerRoutes
);
router.use(
  '/security-error-response/encryption-error-handler',
  encryptionErrorHandlerRoutes
);
router.use(
  '/security-error-response/security-policy-violation-handler',
  securityPolicyViolationHandlerRoutes
);
router.use(
  '/security-error-response/intrusion-detection-error-manager',
  intrusionDetectionErrorManagerRoutes
);
router.use(
  '/security-error-response/certificate-error-handler',
  certificateErrorHandlerRoutes
);
router.use(
  '/security-error-response/token-expiration-manager',
  tokenExpirationManagerRoutes
);
router.use(
  '/security-error-response/privilege-escalation-error-handler',
  privilegeEscalationErrorHandlerRoutes
);

// Integration Error Management Routes
router.use(
  '/integration-error-management/third-party-api-error-handler',
  thirdPartyApiErrorHandlerRoutes
);
router.use(
  '/integration-error-management/webhook-error-manager',
  webhookErrorManagerRoutes
);
router.use(
  '/integration-error-management/message-queue-error-handler',
  messageQueueErrorHandlerRoutes
);
router.use(
  '/integration-error-management/event-stream-error-handler',
  eventStreamErrorHandlerRoutes
);
router.use(
  '/integration-error-management/sync-service-error-manager',
  syncServiceErrorManagerRoutes
);
router.use(
  '/integration-error-management/plugin-error-handler',
  pluginErrorHandlerRoutes
);

// User Error Guidance Routes
router.use(
  '/user-error-guidance/user-input-validation-error',
  userInputValidationErrorRoutes
);
router.use(
  '/user-error-guidance/session-timeout-error-handler',
  sessionTimeoutErrorHandlerRoutes
);
router.use(
  '/user-error-guidance/permission-denied-error-manager',
  permissionDeniedErrorManagerRoutes
);
router.use(
  '/user-error-guidance/feature-unavailable-handler',
  featureUnavailableHandlerRoutes
);
router.use(
  '/user-error-guidance/browser-compatibility-error-handler',
  browserCompatibilityErrorHandlerRoutes
);
router.use(
  '/user-error-guidance/user-workflow-error-guidance',
  userWorkflowErrorGuidanceRoutes
);

export { router as errorBoundaryPlatformRoutes };
export default router;
