import { Router } from 'express';
import { organizationController } from '../controllers/organizationController';
import { authMiddleware } from '../middleware/auth';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();

// All organization routes require authentication
router.use(authMiddleware);

// ========== COMPANY ROUTES ==========

router.post(
  '/companies',
  [
    body('name').isString().trim().isLength({ min: 1, max: 100 }),
    body('code')
      .isString()
      .trim()
      .isLength({ min: 2, max: 10 })
      .matches(/^[A-Z0-9]{2,10}$/),
    body('domain')
      .isString()
      .trim()
      .matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/),
    body('description').optional().isString().trim().isLength({ max: 500 }),
    body('industry')
      .optional()
      .isString()
      .isIn([
        'technology',
        'finance',
        'healthcare',
        'government',
        'defense',
        'energy',
        'manufacturing',
        'retail',
        'education',
        'other',
      ]),
    body('country').optional().isString().isLength({ min: 2, max: 2 }),
    body('parentCompany').optional().isMongoId(),
    validate,
  ],
  organizationController.createCompany
);

router.get(
  '/companies/:companyId',
  [param('companyId').isMongoId(), validate],
  organizationController.getCompany
);

router.get(
  '/companies/:companyId/hierarchy',
  [param('companyId').isMongoId(), validate],
  organizationController.getCompanyHierarchy
);

router.get(
  '/companies/:companyId/stats',
  [param('companyId').isMongoId(), validate],
  organizationController.getOrganizationStats
);

// ========== DEPARTMENT ROUTES ==========

router.post(
  '/departments',
  [
    body('name').isString().trim().isLength({ min: 1, max: 100 }),
    body('code')
      .isString()
      .trim()
      .isLength({ min: 2, max: 20 })
      .matches(/^[A-Z0-9_]{2,20}$/),
    body('description').optional().isString().trim().isLength({ max: 500 }),
    body('companyId').isMongoId(),
    body('parentDepartmentId').optional().isMongoId(),
    body('managerId').optional().isMongoId(),
    body('metadata.function')
      .optional()
      .isString()
      .isIn([
        'operations',
        'security',
        'intelligence',
        'analysis',
        'research',
        'support',
        'management',
        'other',
      ]),
    body('metadata.clearanceLevel')
      .optional()
      .isString()
      .isIn(['public', 'internal', 'confidential', 'secret', 'top-secret']),
    validate,
  ],
  organizationController.createDepartment
);

router.get(
  '/departments/:departmentId/hierarchy',
  [param('departmentId').isMongoId(), validate],
  organizationController.getDepartmentHierarchy
);

router.post(
  '/departments/:departmentId/members',
  [param('departmentId').isMongoId(), body('userId').isMongoId(), validate],
  organizationController.addUserToDepartment
);

// ========== TEAM ROUTES ==========

router.post(
  '/teams',
  [
    body('name').isString().trim().isLength({ min: 1, max: 100 }),
    body('code')
      .isString()
      .trim()
      .isLength({ min: 2, max: 15 })
      .matches(/^[A-Z0-9_]{2,15}$/),
    body('description').optional().isString().trim().isLength({ max: 500 }),
    body('departmentId').isMongoId(),
    body('teamLeadId').optional().isMongoId(),
    body('metadata.teamType')
      .optional()
      .isString()
      .isIn([
        'operational',
        'project',
        'functional',
        'cross-functional',
        'temporary',
        'permanent',
      ]),
    body('metadata.specialization')
      .optional()
      .isString()
      .isIn([
        'threat-hunting',
        'incident-response',
        'malware-analysis',
        'forensics',
        'intelligence',
        'operations',
        'research',
        'other',
      ]),
    body('metadata.clearanceLevel')
      .optional()
      .isString()
      .isIn(['public', 'internal', 'confidential', 'secret', 'top-secret']),
    validate,
  ],
  organizationController.createTeam
);

router.post(
  '/teams/:teamId/members',
  [param('teamId').isMongoId(), body('userId').isMongoId(), validate],
  organizationController.addUserToTeam
);

router.delete(
  '/teams/:teamId/members/:userId',
  [param('teamId').isMongoId(), param('userId').isMongoId(), validate],
  organizationController.removeUserFromTeam
);

// ========== USER CONTEXT ROUTES ==========

router.get(
  '/users/:userId/context',
  [param('userId').isMongoId(), validate],
  organizationController.getUserOrganizationContext
);

router.get(
  '/users/my-context',
  organizationController.getMyOrganizationContext
);

// ========== ROLE MANAGEMENT ROUTES ==========

router.post(
  '/roles',
  [
    body('name').isString().trim().isLength({ min: 1, max: 100 }),
    body('code')
      .isString()
      .trim()
      .isLength({ min: 3, max: 30 })
      .matches(/^[A-Z0-9_]{3,30}$/),
    body('description').optional().isString().trim().isLength({ max: 500 }),
    body('level').isInt({ min: 0, max: 100 }),
    body('parentRoleId').optional().isMongoId(),
    body('companyId').optional().isMongoId(),
    body('permissionIds').optional().isArray(),
    body('permissionIds.*').isMongoId(),
    body('metadata.category')
      .optional()
      .isString()
      .isIn([
        'system',
        'functional',
        'operational',
        'administrative',
        'executive',
      ]),
    body('metadata.scope')
      .optional()
      .isString()
      .isIn(['global', 'company', 'department', 'team', 'resource']),
    body('metadata.riskLevel')
      .optional()
      .isString()
      .isIn(['low', 'medium', 'high', 'critical']),
    validate,
  ],
  organizationController.createRole
);

router.post(
  '/roles/:roleId/assign',
  [
    param('roleId').isMongoId(),
    body('userId').isMongoId(),
    body('justification').optional().isString().trim().isLength({ max: 500 }),
    body('expiresAt').optional().isISO8601().toDate(),
    validate,
  ],
  organizationController.assignRole
);

router.get(
  '/users/:userId/permissions',
  [param('userId').isMongoId(), validate],
  organizationController.getUserEffectivePermissions
);

// ========== SYSTEM ADMINISTRATION ROUTES ==========

router.post('/initialize', organizationController.initializeSystem);

export { router as organizationRoutes };
