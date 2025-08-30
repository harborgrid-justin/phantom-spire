import mongoose from 'mongoose';
import { Role, IRole } from '../models/Role';
import { Permission, IPermission } from '../models/Permission';
import { User, IUser } from '../models/User';
import { logger } from '../utils/logger';

export interface ICreateRoleRequest {
  name: string;
  code: string;
  description?: string;
  level: number;
  parentRoleId?: string;
  companyId?: string;
  permissionIds?: string[];
  metadata?: Partial<IRole['metadata']>;
  constraints?: Partial<IRole['constraints']>;
}

export interface ICreatePermissionRequest {
  name: string;
  code: string;
  description?: string;
  resource: string;
  action: string;
  scope?: IPermission['scope'];
  metadata?: Partial<IPermission['metadata']>;
  constraints?: Partial<IPermission['constraints']>;
}

export interface IRoleAssignmentRequest {
  userId: string;
  roleId: string;
  assignedBy: string;
  justification?: string;
  expiresAt?: Date;
}

export class RolePermissionService {
  // ========== PERMISSION MANAGEMENT ==========

  /**
   * Create a new permission
   */
  async createPermission(
    request: ICreatePermissionRequest
  ): Promise<IPermission> {
    try {
      const permission = new Permission({
        name: request.name,
        code: request.code,
        description: request.description,
        resource: request.resource,
        action: request.action,
        scope: request.scope || 'company',
        metadata: {
          category: 'user', // default
          riskLevel: 'medium', // default
          requiresJustification: false, // default
          auditRequired: true, // default
          ...request.metadata,
        },
        constraints: request.constraints,
      });

      await permission.save();

      logger.info(
        `Permission created: ${permission.name} (${permission.code})`
      );
      return permission;
    } catch (error) {
      logger.error('Error creating permission:', error);
      throw error;
    }
  }

  /**
   * Create system permissions (default permissions for the platform)
   */
  async createSystemPermissions(): Promise<IPermission[]> {
    const systemPermissions = [
      // User permissions
      {
        name: 'Read Own Profile',
        code: 'USER:READ:SELF',
        resource: 'user',
        action: 'read',
        scope: 'self',
        metadata: { category: 'user', riskLevel: 'low' },
      },
      {
        name: 'Update Own Profile',
        code: 'USER:UPDATE:SELF',
        resource: 'user',
        action: 'update',
        scope: 'self',
        metadata: { category: 'user', riskLevel: 'low' },
      },
      {
        name: 'List Users',
        code: 'USER:LIST',
        resource: 'user',
        action: 'list',
        scope: 'company',
        metadata: { category: 'user', riskLevel: 'medium' },
      },
      {
        name: 'Create User',
        code: 'USER:CREATE',
        resource: 'user',
        action: 'create',
        scope: 'company',
        metadata: { category: 'admin', riskLevel: 'high' },
      },
      {
        name: 'Delete User',
        code: 'USER:DELETE',
        resource: 'user',
        action: 'delete',
        scope: 'company',
        metadata: { category: 'admin', riskLevel: 'critical' },
      },

      // IOC permissions
      {
        name: 'Read IOCs',
        code: 'IOC:READ',
        resource: 'ioc',
        action: 'read',
        scope: 'company',
        metadata: { category: 'threat-intel', riskLevel: 'medium' },
      },
      {
        name: 'Create IOCs',
        code: 'IOC:CREATE',
        resource: 'ioc',
        action: 'create',
        scope: 'company',
        metadata: { category: 'threat-intel', riskLevel: 'medium' },
      },
      {
        name: 'Update IOCs',
        code: 'IOC:UPDATE',
        resource: 'ioc',
        action: 'update',
        scope: 'company',
        metadata: { category: 'threat-intel', riskLevel: 'medium' },
      },
      {
        name: 'Delete IOCs',
        code: 'IOC:DELETE',
        resource: 'ioc',
        action: 'delete',
        scope: 'company',
        metadata: { category: 'threat-intel', riskLevel: 'high' },
      },

      // Alert permissions
      {
        name: 'Read Alerts',
        code: 'ALERT:READ',
        resource: 'alert',
        action: 'read',
        scope: 'company',
        metadata: { category: 'threat-intel', riskLevel: 'medium' },
      },
      {
        name: 'Create Alerts',
        code: 'ALERT:CREATE',
        resource: 'alert',
        action: 'create',
        scope: 'company',
        metadata: { category: 'threat-intel', riskLevel: 'medium' },
      },
      {
        name: 'Assign Alerts',
        code: 'ALERT:ASSIGN',
        resource: 'alert',
        action: 'assign',
        scope: 'company',
        metadata: { category: 'threat-intel', riskLevel: 'medium' },
      },
      {
        name: 'Resolve Alerts',
        code: 'ALERT:RESOLVE',
        resource: 'alert',
        action: 'update',
        scope: 'company',
        metadata: { category: 'threat-intel', riskLevel: 'high' },
      },

      // Company management permissions
      {
        name: 'Manage Company',
        code: 'COMPANY:MANAGE',
        resource: 'company',
        action: 'manage',
        scope: 'company',
        metadata: { category: 'admin', riskLevel: 'critical' },
      },
      {
        name: 'Manage Departments',
        code: 'DEPARTMENT:MANAGE',
        resource: 'department',
        action: 'manage',
        scope: 'company',
        metadata: { category: 'admin', riskLevel: 'high' },
      },
      {
        name: 'Manage Teams',
        code: 'TEAM:MANAGE',
        resource: 'team',
        action: 'manage',
        scope: 'company',
        metadata: { category: 'admin', riskLevel: 'high' },
      },

      // Role and permission management
      {
        name: 'Manage Roles',
        code: 'ROLE:MANAGE',
        resource: 'role',
        action: 'manage',
        scope: 'company',
        metadata: { category: 'admin', riskLevel: 'critical' },
      },
      {
        name: 'Assign Roles',
        code: 'ROLE:ASSIGN',
        resource: 'role',
        action: 'assign',
        scope: 'company',
        metadata: { category: 'admin', riskLevel: 'high' },
      },
      {
        name: 'View Permissions',
        code: 'PERMISSION:READ',
        resource: 'permission',
        action: 'read',
        scope: 'global',
        metadata: { category: 'admin', riskLevel: 'medium' },
      },

      // System administration
      {
        name: 'System Admin',
        code: 'SYSTEM:ADMIN',
        resource: 'system',
        action: 'admin',
        scope: 'global',
        metadata: { category: 'system', riskLevel: 'critical' },
      },
      {
        name: 'View Audit Logs',
        code: 'AUDIT:READ',
        resource: 'audit-log',
        action: 'read',
        scope: 'company',
        metadata: { category: 'admin', riskLevel: 'high' },
      },
      {
        name: 'Export Data',
        code: 'DATA:EXPORT',
        resource: '*',
        action: 'export',
        scope: 'company',
        metadata: { category: 'data', riskLevel: 'high' },
      },
    ];

    const createdPermissions: IPermission[] = [];

    for (const permData of systemPermissions) {
      try {
        // Check if permission already exists
        const existing = await Permission.findOne({ code: permData.code });
        if (!existing) {
          const permission = new Permission({
            ...permData,
            isSystemPermission: true,
          });
          await permission.save();
          createdPermissions.push(permission);
          logger.info(`System permission created: ${permission.code}`);
        }
      } catch (error) {
        logger.error(
          `Error creating system permission ${permData.code}:`,
          error
        );
      }
    }

    return createdPermissions;
  }

  // ========== ROLE MANAGEMENT ==========

  /**
   * Create a new role
   */
  async createRole(request: ICreateRoleRequest): Promise<IRole> {
    try {
      // Validate parent role if provided
      if (request.parentRoleId) {
        const parentRole = await Role.findById(request.parentRoleId);
        if (!parentRole) {
          throw new Error('Parent role not found');
        }
        if (
          request.companyId &&
          parentRole.company &&
          !parentRole.company.equals(request.companyId)
        ) {
          throw new Error('Parent role must be in the same company');
        }
      }

      // Validate permissions if provided
      if (request.permissionIds?.length) {
        const permissions = await Permission.find({
          _id: { $in: request.permissionIds },
        });
        if (permissions.length !== request.permissionIds.length) {
          throw new Error('Some permissions not found');
        }
      }

      const role = new Role({
        name: request.name,
        code: request.code,
        description: request.description,
        level: request.level,
        parentRole: request.parentRoleId
          ? new mongoose.Types.ObjectId(request.parentRoleId)
          : undefined,
        company: request.companyId
          ? new mongoose.Types.ObjectId(request.companyId)
          : undefined,
        permissions:
          request.permissionIds?.map(id => new mongoose.Types.ObjectId(id)) ||
          [],
        metadata: {
          category: 'functional', // default
          scope: 'company', // default
          riskLevel: 'medium', // default
          requiresApproval: false, // default
          ...request.metadata,
        },
        constraints: request.constraints,
      });

      await role.save();

      logger.info(`Role created: ${role.name} (${role.code})`);
      return role;
    } catch (error) {
      logger.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Create system roles (default roles for the platform)
   */
  async createSystemRoles(): Promise<IRole[]> {
    const systemRoles = [
      {
        name: 'System Administrator',
        code: 'SYSTEM_ADMIN',
        description: 'Full system access and administration',
        level: 100,
        metadata: {
          category: 'system',
          scope: 'global',
          riskLevel: 'critical',
          requiresApproval: true,
        },
      },
      {
        name: 'Company Administrator',
        code: 'COMPANY_ADMIN',
        description: 'Full access within company',
        level: 90,
        metadata: {
          category: 'administrative',
          scope: 'company',
          riskLevel: 'critical',
          requiresApproval: true,
        },
      },
      {
        name: 'Security Manager',
        code: 'SECURITY_MANAGER',
        description: 'Manage security operations and teams',
        level: 80,
        metadata: {
          category: 'operational',
          scope: 'company',
          riskLevel: 'high',
          requiresApproval: true,
        },
      },
      {
        name: 'Threat Intelligence Analyst',
        code: 'TI_ANALYST',
        description: 'Analyze and manage threat intelligence data',
        level: 60,
        metadata: {
          category: 'functional',
          scope: 'company',
          riskLevel: 'medium',
          requiresApproval: false,
        },
      },
      {
        name: 'Security Analyst',
        code: 'SEC_ANALYST',
        description: 'Monitor and respond to security incidents',
        level: 50,
        metadata: {
          category: 'operational',
          scope: 'company',
          riskLevel: 'medium',
          requiresApproval: false,
        },
      },
      {
        name: 'Security Viewer',
        code: 'SEC_VIEWER',
        description: 'Read-only access to security information',
        level: 30,
        metadata: {
          category: 'functional',
          scope: 'company',
          riskLevel: 'low',
          requiresApproval: false,
        },
      },
      {
        name: 'Basic User',
        code: 'BASIC_USER',
        description: 'Basic platform access',
        level: 10,
        metadata: {
          category: 'functional',
          scope: 'company',
          riskLevel: 'low',
          requiresApproval: false,
        },
      },
    ];

    const createdRoles: IRole[] = [];

    for (const roleData of systemRoles) {
      try {
        // Check if role already exists
        const existing = await Role.findOne({ code: roleData.code });
        if (!existing) {
          const role = new Role({
            ...roleData,
            isSystemRole: true,
          });
          await role.save();
          createdRoles.push(role);
          logger.info(`System role created: ${role.code}`);
        }
      } catch (error) {
        logger.error(`Error creating system role ${roleData.code}:`, error);
      }
    }

    return createdRoles;
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(request: IRoleAssignmentRequest): Promise<IUser> {
    try {
      const user = await User.findById(request.userId);
      const role = await Role.findById(request.roleId);
      const assignedBy = await User.findById(request.assignedBy);

      if (!user) throw new Error('User not found');
      if (!role) throw new Error('Role not found');
      if (!assignedBy) throw new Error('Assigning user not found');

      // Check if role requires approval
      if (role.metadata.requiresApproval) {
        // In a full implementation, this would create an approval workflow
        logger.info(
          `Role ${role.name} requires approval for user ${user.email}`
        );
      }

      // Check if user already has this role
      if (user.hasRole(role._id as mongoose.Types.ObjectId)) {
        throw new Error('User already has this role');
      }

      // Add role to user
      user.roles.push(role._id as mongoose.Types.ObjectId);
      await user.save();

      logger.info(
        `Role ${role.name} assigned to user ${user.email} by ${assignedBy.email}`
      );
      return user;
    } catch (error) {
      logger.error('Error assigning role to user:', error);
      throw error;
    }
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(
    userId: string,
    roleId: string,
    removedBy: string
  ): Promise<IUser> {
    try {
      const user = await User.findById(userId);
      const role = await Role.findById(roleId);
      const removedByUser = await User.findById(removedBy);

      if (!user) throw new Error('User not found');
      if (!role) throw new Error('Role not found');
      if (!removedByUser) throw new Error('Removing user not found');

      // Remove role from user
      const roleIndex = user.roles.findIndex(r => r.equals(roleId));
      if (roleIndex === -1) {
        throw new Error('User does not have this role');
      }

      user.roles.splice(roleIndex, 1);
      await user.save();

      logger.info(
        `Role ${role.name} removed from user ${user.email} by ${removedByUser.email}`
      );
      return user;
    } catch (error) {
      logger.error('Error removing role from user:', error);
      throw error;
    }
  }

  // ========== AUTHORIZATION METHODS ==========

  /**
   * Check if user has specific permission
   */
  async userHasPermission(
    userId: string,
    permissionCode: string,
    _context?: any
  ): Promise<boolean> {
    try {
      const user = await User.findById(userId).populate('roles');
      if (!user || !user.isActive) return false;

      return await user.hasPermission(permissionCode);
    } catch (error) {
      logger.error('Error checking user permission:', error);
      return false;
    }
  }

  /**
   * Check if user can access resource with specific action
   */
  async userCanAccessResource(
    userId: string,
    resource: string,
    action: string,
    _context?: any
  ): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.isActive) return false;

      return await user.canAccessResource(resource, action);
    } catch (error) {
      logger.error('Error checking user resource access:', error);
      return false;
    }
  }

  /**
   * Get user's effective permissions (all permissions from all roles including inherited)
   */
  async getUserEffectivePermissions(userId: string): Promise<IPermission[]> {
    try {
      const user = await User.findById(userId).populate({
        path: 'roles',
        populate: { path: 'permissions' },
      });

      if (!user) throw new Error('User not found');

      const allPermissionIds = new Set<string>();
      const Role = mongoose.model('Role');

      // Get permissions from all user roles including inherited
      for (const role of user.roles as any[]) {
        const inheritedPermissions = await (
          role as IRole
        ).getInheritedPermissions();
        inheritedPermissions.forEach(p => allPermissionIds.add(p.toString()));
      }

      // Get permission details
      const permissions = await Permission.find({
        _id: {
          $in: Array.from(allPermissionIds).map(
            id => new mongoose.Types.ObjectId(id)
          ),
        },
      });

      return permissions;
    } catch (error) {
      logger.error('Error getting user effective permissions:', error);
      throw error;
    }
  }

  /**
   * Get role hierarchy for a role
   */
  async getRoleHierarchy(roleId: string): Promise<{
    role: IRole;
    ancestors: IRole[];
    descendants: IRole[];
  }> {
    try {
      const role = await Role.findById(roleId).populate('permissions');
      if (!role) {
        throw new Error('Role not found');
      }

      const ancestors = await role.getAncestors();
      const descendants = await role.getDescendants();

      return {
        role,
        ancestors,
        descendants,
      };
    } catch (error) {
      logger.error('Error getting role hierarchy:', error);
      throw error;
    }
  }

  /**
   * Get permissions by category
   */
  async getPermissionsByCategory(category: string): Promise<IPermission[]> {
    try {
      return await Permission.findByCategory(category);
    } catch (error) {
      logger.error('Error getting permissions by category:', error);
      throw error;
    }
  }

  /**
   * Get high-risk permissions
   */
  async getHighRiskPermissions(): Promise<IPermission[]> {
    try {
      return await Permission.findHighRisk();
    } catch (error) {
      logger.error('Error getting high-risk permissions:', error);
      throw error;
    }
  }

  // ========== INITIALIZATION ==========

  /**
   * Initialize system roles and permissions
   */
  async initializeSystem(): Promise<void> {
    try {
      logger.info('Initializing system roles and permissions...');

      const [permissions, roles] = await Promise.all([
        this.createSystemPermissions(),
        this.createSystemRoles(),
      ]);

      // Assign permissions to system roles
      await this.assignPermissionsToSystemRoles();

      logger.info(
        `System initialization complete. Created ${permissions.length} permissions and ${roles.length} roles`
      );
    } catch (error) {
      logger.error('Error initializing system:', error);
      throw error;
    }
  }

  /**
   * Assign permissions to system roles
   */
  private async assignPermissionsToSystemRoles(): Promise<void> {
    try {
      // System Admin gets all permissions
      const systemAdmin = await Role.findOne({ code: 'SYSTEM_ADMIN' });
      if (systemAdmin) {
        const allPermissions = await Permission.find({ isActive: true });
        systemAdmin.permissions = allPermissions.map(
          p => p._id as mongoose.Types.ObjectId
        );
        await systemAdmin.save();
      }

      // Company Admin gets company-scoped permissions
      const companyAdmin = await Role.findOne({ code: 'COMPANY_ADMIN' });
      if (companyAdmin) {
        const companyPermissions = await Permission.find({
          scope: { $in: ['company', 'department', 'team'] },
          isActive: true,
        });
        companyAdmin.permissions = companyPermissions.map(
          p => p._id as mongoose.Types.ObjectId
        );
        await companyAdmin.save();
      }

      // Add specific permission sets for other roles...
      // This would be expanded based on specific requirements
    } catch (error) {
      logger.error('Error assigning permissions to system roles:', error);
      throw error;
    }
  }
}

export const rolePermissionService = new RolePermissionService();
