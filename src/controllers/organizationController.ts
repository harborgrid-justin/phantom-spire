import { Response } from 'express';
import { organizationService } from '../services/organizationService.js';
import { rolePermissionService } from '../services/rolePermissionService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         domain:
 *           type: string
 *         description:
 *           type: string
 *         industry:
 *           type: string
 *         country:
 *           type: string
 *         parentCompany:
 *           type: string
 *         subsidiaries:
 *           type: array
 *           items:
 *             type: string
 *         isActive:
 *           type: boolean
 *         settings:
 *           type: object
 *         metadata:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// ========== COMPANY ENDPOINTS ==========

/**
 * @swagger
 * /organizations/companies:
 *   post:
 *     summary: Create a new company
 *     tags: [Organization Management]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - domain
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               domain:
 *                 type: string
 *               description:
 *                 type: string
 *               industry:
 *                 type: string
 *               country:
 *                 type: string
 *               parentCompany:
 *                 type: string
 *               settings:
 *                 type: object
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Company created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Insufficient permissions
 */
export const createCompany = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const canManage = await rolePermissionService.userCanAccessResource(
      req.user!.id,
      'company',
      'create'
    );

    if (!canManage) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create company',
      });
      return;
    }

    const company = await organizationService.createCompany(req.body);

    res.status(201).json({
      success: true,
      data: company,
      message: 'Company created successfully',
    });
  }
);

/**
 * @swagger
 * /organizations/companies/{companyId}:
 *   get:
 *     summary: Get company details
 *     tags: [Organization Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: populate
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Company details retrieved
 *       404:
 *         description: Company not found
 */
export const getCompany = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const companyId = req.params.companyId;
    if (!companyId) {
      res.status(400).json({
        success: false,
        error: 'Company ID is required',
      });
      return;
    }

    const populate = req.query.populate === 'true';

    const company = await organizationService.getCompany(companyId, populate);

    if (!company) {
      res.status(404).json({
        success: false,
        error: 'Company not found',
      });
      return;
    }

    res.json({
      success: true,
      data: company,
    });
  }
);

/**
 * @swagger
 * /organizations/companies/{companyId}/hierarchy:
 *   get:
 *     summary: Get company hierarchy
 *     tags: [Organization Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company hierarchy retrieved
 */
export const getCompanyHierarchy = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const companyId = req.params.companyId;
    if (!companyId) {
      res.status(400).json({
        success: false,
        error: 'Company ID is required',
      });
      return;
    }

    const hierarchy = await organizationService.getCompanyHierarchy(companyId);

    res.json({
      success: true,
      data: hierarchy,
    });
  }
);

/**
 * @swagger
 * /organizations/companies/{companyId}/stats:
 *   get:
 *     summary: Get organization statistics
 *     tags: [Organization Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization statistics retrieved
 */
export const getOrganizationStats = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const companyId = req.params.companyId;
    if (!companyId) {
      res.status(400).json({
        success: false,
        error: 'Company ID is required',
      });
      return;
    }

    const stats = await organizationService.getOrganizationStats(companyId);

    res.json({
      success: true,
      data: stats,
    });
  }
);

// ========== DEPARTMENT ENDPOINTS ==========

/**
 * @swagger
 * /organizations/departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Organization Management]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - companyId
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               companyId:
 *                 type: string
 *               parentDepartmentId:
 *                 type: string
 *               managerId:
 *                 type: string
 *               settings:
 *                 type: object
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Department created successfully
 */
export const createDepartment = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const canManage = await rolePermissionService.userCanAccessResource(
      req.user!.id,
      'department',
      'create'
    );

    if (!canManage) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create department',
      });
      return;
    }

    const department = await organizationService.createDepartment(req.body);

    res.status(201).json({
      success: true,
      data: department,
      message: 'Department created successfully',
    });
  }
);

/**
 * @swagger
 * /organizations/departments/{departmentId}/hierarchy:
 *   get:
 *     summary: Get department hierarchy
 *     tags: [Organization Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department hierarchy retrieved
 */
export const getDepartmentHierarchy = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const departmentId = req.params.departmentId;
    if (!departmentId) {
      res.status(400).json({
        success: false,
        error: 'Department ID is required',
      });
      return;
    }

    const hierarchy =
      await organizationService.getDepartmentHierarchy(departmentId);

    res.json({
      success: true,
      data: hierarchy,
    });
  }
);

/**
 * @swagger
 * /organizations/departments/{departmentId}/members:
 *   post:
 *     summary: Add user to department
 *     tags: [Organization Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User added to department
 */
export const addUserToDepartment = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const departmentId = req.params.departmentId;
    if (!departmentId) {
      res.status(400).json({
        success: false,
        error: 'Department ID is required',
      });
      return;
    }

    const { userId } = req.body;

    const canManage = await rolePermissionService.userCanAccessResource(
      req.user!.id,
      'department',
      'manage'
    );

    if (!canManage) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to manage department',
      });
      return;
    }

    const department = await organizationService.addUserToDepartment(
      departmentId,
      userId
    );

    res.json({
      success: true,
      data: department,
      message: 'User added to department successfully',
    });
  }
);

// ========== TEAM ENDPOINTS ==========

/**
 * @swagger
 * /organizations/teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Organization Management]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - departmentId
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               teamLeadId:
 *                 type: string
 *               settings:
 *                 type: object
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Team created successfully
 */
export const createTeam = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const canManage = await rolePermissionService.userCanAccessResource(
      req.user!.id,
      'team',
      'create'
    );

    if (!canManage) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create team',
      });
      return;
    }

    const team = await organizationService.createTeam(req.body);

    res.status(201).json({
      success: true,
      data: team,
      message: 'Team created successfully',
    });
  }
);

/**
 * @swagger
 * /organizations/teams/{teamId}/members:
 *   post:
 *     summary: Add user to team
 *     tags: [Organization Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User added to team
 */
export const addUserToTeam = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const teamId = req.params.teamId;
    if (!teamId) {
      res.status(400).json({
        success: false,
        error: 'Team ID is required',
      });
      return;
    }

    const { userId } = req.body;

    const canManage = await rolePermissionService.userCanAccessResource(
      req.user!.id,
      'team',
      'manage'
    );

    if (!canManage) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to manage team',
      });
      return;
    }

    const team = await organizationService.addUserToTeam(teamId, userId);

    res.json({
      success: true,
      data: team,
      message: 'User added to team successfully',
    });
  }
);

/**
 * @swagger
 * /organizations/teams/{teamId}/members/{userId}:
 *   delete:
 *     summary: Remove user from team
 *     tags: [Organization Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User removed from team
 */
export const removeUserFromTeam = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const teamId = req.params.teamId;
    const userId = req.params.userId;
    if (!teamId || !userId) {
      res.status(400).json({
        success: false,
        error: 'Team ID and User ID are required',
      });
      return;
    }

    const canManage = await rolePermissionService.userCanAccessResource(
      req.user!.id,
      'team',
      'manage'
    );

    if (!canManage) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to manage team',
      });
      return;
    }

    const team = await organizationService.removeUserFromTeam(teamId, userId);

    res.json({
      success: true,
      data: team,
      message: 'User removed from team successfully',
    });
  }
);

// ========== USER CONTEXT ENDPOINTS ==========

/**
 * @swagger
 * /organizations/users/{userId}/context:
 *   get:
 *     summary: Get user's organizational context
 *     tags: [Organization Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User organizational context retrieved
 */
export const getUserOrganizationContext = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.params.userId;
    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
      return;
    }

    // Users can view their own context, or need permission to view others
    const canView =
      userId === req.user!.id ||
      (await rolePermissionService.userCanAccessResource(
        req.user!.id,
        'user',
        'read'
      ));

    if (!canView) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to view user context',
      });
      return;
    }

    const context =
      await organizationService.getUserOrganizationContext(userId);

    res.json({
      success: true,
      data: context,
    });
  }
);

/**
 * @swagger
 * /organizations/users/my-context:
 *   get:
 *     summary: Get current user's organizational context
 *     tags: [Organization Management]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user organizational context retrieved
 */
export const getMyOrganizationContext = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const context = await organizationService.getUserOrganizationContext(
      req.user!.id
    );

    res.json({
      success: true,
      data: context,
    });
  }
);

// ========== ROLE MANAGEMENT ENDPOINTS ==========

/**
 * @swagger
 * /organizations/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Role Management]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - level
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               level:
 *                 type: number
 *               parentRoleId:
 *                 type: string
 *               companyId:
 *                 type: string
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               metadata:
 *                 type: object
 *               constraints:
 *                 type: object
 *     responses:
 *       201:
 *         description: Role created successfully
 */
export const createRole = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const canManage = await rolePermissionService.userCanAccessResource(
      req.user!.id,
      'role',
      'create'
    );

    if (!canManage) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create role',
      });
      return;
    }

    const role = await rolePermissionService.createRole(req.body);

    res.status(201).json({
      success: true,
      data: role,
      message: 'Role created successfully',
    });
  }
);

/**
 * @swagger
 * /organizations/roles/{roleId}/assign:
 *   post:
 *     summary: Assign role to user
 *     tags: [Role Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *               justification:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Role assigned successfully
 */
export const assignRole = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const roleId = req.params.roleId;
    if (!roleId) {
      res.status(400).json({
        success: false,
        error: 'Role ID is required',
      });
      return;
    }

    const { userId, justification, expiresAt } = req.body;

    const canAssign = await rolePermissionService.userCanAccessResource(
      req.user!.id,
      'role',
      'assign'
    );

    if (!canAssign) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to assign role',
      });
      return;
    }

    const user = await rolePermissionService.assignRoleToUser({
      userId,
      roleId,
      assignedBy: req.user!.id,
      justification,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    res.json({
      success: true,
      data: user,
      message: 'Role assigned successfully',
    });
  }
);

/**
 * @swagger
 * /organizations/users/{userId}/permissions:
 *   get:
 *     summary: Get user's effective permissions
 *     tags: [Role Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User effective permissions retrieved
 */
export const getUserEffectivePermissions = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.params.userId;
    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
      return;
    }

    // Users can view their own permissions, or need permission to view others
    const canView =
      userId === req.user!.id ||
      (await rolePermissionService.userCanAccessResource(
        req.user!.id,
        'user',
        'read'
      ));

    if (!canView) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions to view user permissions',
      });
      return;
    }

    const permissions =
      await rolePermissionService.getUserEffectivePermissions(userId);

    res.json({
      success: true,
      data: permissions,
    });
  }
);

// ========== SYSTEM INITIALIZATION ==========

/**
 * @swagger
 * /organizations/initialize:
 *   post:
 *     summary: Initialize system roles and permissions
 *     tags: [System Administration]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: System initialized successfully
 */
export const initializeSystem = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const canAdmin = await rolePermissionService.userCanAccessResource(
      req.user!.id,
      'system',
      'admin'
    );

    if (!canAdmin) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions for system administration',
      });
      return;
    }

    await rolePermissionService.initializeSystem();

    res.json({
      success: true,
      message: 'System initialized successfully',
    });
  }
);

export const organizationController = {
  // Company management
  createCompany,
  getCompany,
  getCompanyHierarchy,
  getOrganizationStats,

  // Department management
  createDepartment,
  getDepartmentHierarchy,
  addUserToDepartment,

  // Team management
  createTeam,
  addUserToTeam,
  removeUserFromTeam,

  // User context
  getUserOrganizationContext,
  getMyOrganizationContext,

  // Role management
  createRole,
  assignRole,
  getUserEffectivePermissions,

  // System administration
  initializeSystem,
};
