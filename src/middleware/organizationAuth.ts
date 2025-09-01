import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { User } from '../models/User';
import { rolePermissionService } from '../services/rolePermissionService';
import { logger } from '../utils/logger';

export interface OrganizationAuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string; // Legacy role for backward compatibility
    roles: string[]; // New hierarchical roles
    company: string;
    department?: string;
    teams: string[];
    permissions: string[];
  };
  organizationContext?: {
    companyId: string;
    departmentId?: string;
    teamIds: string[];
    clearanceLevel: string;
    effectivePermissions: string[];
  };
}

/**
 * Enhanced authentication middleware that includes organizational context
 */
export const organizationAuthMiddleware = async (
  req: OrganizationAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token is required',
      });
      return;
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    // Get full user details with organizational context
    const user = await User.findById(decoded.id)
      .populate('roles', 'code name level')
      .populate('company', 'code name domain')
      .populate('department', 'code name')
      .populate('teams', 'code name specialization')
      .select('+security.accountLockedUntil +security.failedLoginAttempts');

    if (!user || !user.isActive) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid user account',
      });
      return;
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      res.status(423).json({
        error: 'Account Locked',
        message: 'Account is temporarily locked due to failed login attempts',
      });
      return;
    }

    // Get user's effective permissions
    const effectivePermissions =
      await rolePermissionService.getUserEffectivePermissions(
        user._id.toString()
      );

    // Set user context
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role, // Legacy role
      roles: (user.roles as any[]).map(r => r.code),
      company: (user.company as any)._id.toString(),
      department: user.department
        ? (user.department as any)._id.toString()
        : undefined,
      teams: (user.teams as any[]).map(t => t._id.toString()),
      permissions: effectivePermissions.map(p => p.code),
    };

    // Set organization context
    req.organizationContext = {
      companyId: (user.company as any)._id.toString(),
      departmentId: user.department
        ? (user.department as any)._id.toString()
        : undefined,
      teamIds: (user.teams as any[]).map(t => t._id.toString()),
      clearanceLevel: user.metadata.clearanceLevel || 'internal',
      effectivePermissions: effectivePermissions.map(p => p.code),
    };

    next();
  } catch (error) {
    logger.warn('Organization authentication failed:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Middleware to require specific permission
 */
const requirePermission = (permissionCode: string) => {
  return async (
    req: OrganizationAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const hasPermission = await rolePermissionService.userHasPermission(
      req.user.id,
      permissionCode
    );

    if (!hasPermission) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient permissions. Required: ${permissionCode}`,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to require resource access with specific action
 */
const requireResourceAccess = (resource: string, action: string) => {
  return async (
    req: OrganizationAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const canAccess = await rolePermissionService.userCanAccessResource(
      req.user.id,
      resource,
      action
    );

    if (!canAccess) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient permissions for ${action} on ${resource}`,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to require specific clearance level
 */
const requireClearanceLevel = (requiredLevel: string) => {
  const clearanceLevels = [
    'public',
    'internal',
    'confidential',
    'secret',
    'top-secret',
  ];

  return (
    req: OrganizationAuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.organizationContext) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const userLevel = req.organizationContext.clearanceLevel;
    const userLevelIndex = clearanceLevels.indexOf(userLevel);
    const requiredLevelIndex = clearanceLevels.indexOf(requiredLevel);

    if (userLevelIndex === -1 || requiredLevelIndex === -1) {
      res.status(400).json({
        error: 'Invalid Clearance Level',
        message: 'Invalid clearance level specified',
      });
      return;
    }

    if (userLevelIndex < requiredLevelIndex) {
      res.status(403).json({
        error: 'Insufficient Clearance',
        message: `Required clearance level: ${requiredLevel}. User level: ${userLevel}`,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to require company membership
 */
const requireCompanyMembership = (companyId?: string) => {
  return (
    req: OrganizationAuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // If no specific company ID provided, use the one from the request params or body
    const targetCompanyId =
      companyId || req.params.companyId || req.body.companyId;

    if (!targetCompanyId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Company ID required',
      });
      return;
    }

    if (req.user.company !== targetCompanyId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. User not a member of the specified company',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to require department membership
 */
const requireDepartmentMembership = (departmentId?: string) => {
  return (
    req: OrganizationAuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // If no specific department ID provided, use the one from the request params or body
    const targetDepartmentId =
      departmentId || req.params.departmentId || req.body.departmentId;

    if (!targetDepartmentId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Department ID required',
      });
      return;
    }

    if (req.user.department !== targetDepartmentId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. User not a member of the specified department',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to require team membership
 */
const requireTeamMembership = (teamId?: string) => {
  return (
    req: OrganizationAuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // If no specific team ID provided, use the one from the request params or body
    const targetTeamId = teamId || req.params.teamId || req.body.teamId;

    if (!targetTeamId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Team ID required',
      });
      return;
    }

    if (!req.user.teams.includes(targetTeamId)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. User not a member of the specified team',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware for role-level authorization
 */
const requireMinimumRoleLevel = (minimumLevel: number) => {
  return async (
    req: OrganizationAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    // Get user's highest role level
    const user = await User.findById(req.user.id).populate('roles', 'level');
    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid user',
      });
      return;
    }

    const highestLevel = Math.max(
      ...(user.roles as any[]).map(r => r.level),
      0
    );

    if (highestLevel < minimumLevel) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient role level. Required: ${minimumLevel}, Current: ${highestLevel}`,
      });
      return;
    }

    next();
  };
};

// Export all middleware functions
export {
  organizationAuthMiddleware as authenticate,
  requirePermission,
  requireResourceAccess,
  requireClearanceLevel,
  requireCompanyMembership,
  requireDepartmentMembership,
  requireTeamMembership,
  requireMinimumRoleLevel,
};
