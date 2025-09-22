/**
 * Role-Based Access Control (RBAC) System
 * Enterprise-grade authorization with hierarchical roles and resource-level permissions
 * Supports complex permission inheritance and dynamic role assignment
 */

import { AuditLogger } from './audit-logger';
import { EnterpriseErrorManager } from '..\services\error-handling\enterprise-error-manager';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  constraints?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  inherits?: string[]; // Parent roles to inherit from
  isSystemRole: boolean;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface ResourcePermission {
  resource: string;
  actions: string[];
  constraints?: Record<string, any>;
}

export interface RoleAssignment {
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  constraints?: Record<string, any>;
}

export interface PolicyEvaluation {
  allowed: boolean;
  reason: string;
  appliedPolicies: string[];
  constraints?: Record<string, any>;
}

/**
 * Enterprise RBAC System
 * Provides comprehensive role-based access control with inheritance and constraints
 */
export class RBACSystem {
  private auditLogger: AuditLogger;
  private errorManager: EnterpriseErrorManager;
  
  // In-memory storage - replace with database in production
  private permissions = new Map<string, Permission>();
  private roles = new Map<string, Role>();
  private roleAssignments = new Map<string, RoleAssignment[]>();
  private roleHierarchy = new Map<string, Set<string>>(); // roleId -> inherited roles

  constructor() {
    this.auditLogger = new AuditLogger();
    this.errorManager = new EnterpriseErrorManager();
    
    this.initializeSystemRoles();
    this.initializeSystemPermissions();
  }

  // ================== PERMISSION MANAGEMENT ==================

  /**
   * Define a new permission
   */
  async definePermission(permission: Permission): Promise<void> {
    try {
      if (this.permissions.has(permission.id)) {
        throw new Error(`Permission ${permission.id} already exists`);
      }

      this.permissions.set(permission.id, permission);

      await this.auditLogger.logSecurityEvent('permission_created', {
        permissionId: permission.id,
        permissionName: permission.name,
        resource: permission.resource,
        action: permission.action
      });
    } catch (error) {
      throw this.errorManager.createError('RBACError', 'Failed to define permission', { permissionId: permission.id });
    }
  }

  /**
   * Get permission by ID
   */
  async getPermission(permissionId: string): Promise<Permission | null> {
    return this.permissions.get(permissionId) || null;
  }

  /**
   * List all permissions
   */
  async listPermissions(filters?: { resource?: string; action?: string }): Promise<Permission[]> {
    const allPermissions = Array.from(this.permissions.values());
    
    if (!filters) return allPermissions;

    return allPermissions.filter(permission => {
      if (filters.resource && permission.resource !== filters.resource) return false;
      if (filters.action && permission.action !== filters.action) return false;
      return true;
    });
  }

  // ================== ROLE MANAGEMENT ==================

  /**
   * Define a new role
   */
  async defineRole(role: Role): Promise<void> {
    try {
      if (this.roles.has(role.id)) {
        throw new Error(`Role ${role.id} already exists`);
      }

      // Validate permissions exist
      for (const permissionId of role.permissions) {
        if (!this.permissions.has(permissionId)) {
          throw new Error(`Permission ${permissionId} does not exist`);
        }
      }

      // Validate parent roles exist
      if (role.inherits) {
        for (const parentRoleId of role.inherits) {
          if (!this.roles.has(parentRoleId)) {
            throw new Error(`Parent role ${parentRoleId} does not exist`);
          }
        }
      }

      this.roles.set(role.id, role);
      
      // Build role hierarchy
      await this.buildRoleHierarchy(role.id);

      await this.auditLogger.logSecurityEvent('role_created', {
        roleId: role.id,
        roleName: role.name,
        permissions: role.permissions,
        inherits: role.inherits
      });
    } catch (error) {
      throw this.errorManager.createError('RBACError', 'Failed to define role', { roleId: role.id });
    }
  }

  /**
   * Update existing role
   */
  async updateRole(roleId: string, updates: Partial<Role>): Promise<void> {
    try {
      const existingRole = this.roles.get(roleId);
      if (!existingRole) {
        throw new Error(`Role ${roleId} does not exist`);
      }

      if (existingRole.isSystemRole) {
        throw new Error(`Cannot modify system role ${roleId}`);
      }

      // Validate permissions if being updated
      if (updates.permissions) {
        for (const permissionId of updates.permissions) {
          if (!this.permissions.has(permissionId)) {
            throw new Error(`Permission ${permissionId} does not exist`);
          }
        }
      }

      // Validate parent roles if being updated
      if (updates.inherits) {
        for (const parentRoleId of updates.inherits) {
          if (!this.roles.has(parentRoleId)) {
            throw new Error(`Parent role ${parentRoleId} does not exist`);
          }
        }
      }

      const updatedRole = { ...existingRole, ...updates };
      this.roles.set(roleId, updatedRole);

      // Rebuild hierarchy if inheritance changed
      if (updates.inherits) {
        await this.buildRoleHierarchy(roleId);
      }

      await this.auditLogger.logSecurityEvent('role_updated', {
        roleId,
        updates,
        updatedBy: 'system' // In production, get from current user context
      });
    } catch (error) {
      throw this.errorManager.createError('RBACError', 'Failed to update role', { roleId });
    }
  }

  /**
   * Get role by ID with resolved permissions (including inherited)
   */
  async getRole(roleId: string, includeInherited = true): Promise<Role | null> {
    const role = this.roles.get(roleId);
    if (!role) return null;

    if (!includeInherited) return role;

    // Resolve inherited permissions
    const allPermissions = await this.getEffectivePermissions(roleId);
    
    return {
      ...role,
      permissions: Array.from(allPermissions)
    };
  }

  /**
   * List all roles
   */
  async listRoles(includeSystem = false): Promise<Role[]> {
    const allRoles = Array.from(this.roles.values());
    
    if (includeSystem) return allRoles;
    
    return allRoles.filter(role => !role.isSystemRole);
  }

  // ================== ROLE ASSIGNMENT ==================

  /**
   * Assign role to user
   */
  async assignRole(
    userId: string,
    roleId: string,
    assignedBy: string,
    options?: {
      expiresAt?: Date;
      constraints?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      const role = this.roles.get(roleId);
      if (!role) {
        throw new Error(`Role ${roleId} does not exist`);
      }

      if (!role.isActive) {
        throw new Error(`Role ${roleId} is not active`);
      }

      const assignment: RoleAssignment = {
        userId,
        roleId,
        assignedBy,
        assignedAt: new Date(),
        expiresAt: options?.expiresAt,
        isActive: true,
        constraints: options?.constraints
      };

      if (!this.roleAssignments.has(userId)) {
        this.roleAssignments.set(userId, []);
      }

      // Check if role is already assigned
      const existingAssignments = this.roleAssignments.get(userId)!;
      const existingAssignment = existingAssignments.find(a => a.roleId === roleId && a.isActive);
      
      if (existingAssignment) {
        throw new Error(`Role ${roleId} is already assigned to user ${userId}`);
      }

      existingAssignments.push(assignment);

      await this.auditLogger.logSecurityEvent('role_assigned', {
        userId,
        roleId,
        assignedBy,
        expiresAt: options?.expiresAt
      });
    } catch (error) {
      throw this.errorManager.createError('RBACError', 'Failed to assign role', { userId, roleId });
    }
  }

  /**
   * Revoke role from user
   */
  async revokeRole(userId: string, roleId: string, revokedBy: string): Promise<void> {
    try {
      const assignments = this.roleAssignments.get(userId);
      if (!assignments) {
        throw new Error(`No role assignments found for user ${userId}`);
      }

      const assignment = assignments.find(a => a.roleId === roleId && a.isActive);
      if (!assignment) {
        throw new Error(`Role ${roleId} is not assigned to user ${userId}`);
      }

      assignment.isActive = false;

      await this.auditLogger.logSecurityEvent('role_revoked', {
        userId,
        roleId,
        revokedBy
      });
    } catch (error) {
      throw this.errorManager.createError('RBACError', 'Failed to revoke role', { userId, roleId });
    }
  }

  /**
   * Get user's role assignments
   */
  async getUserRoles(userId: string): Promise<RoleAssignment[]> {
    const assignments = this.roleAssignments.get(userId) || [];
    const now = new Date();
    
    return assignments.filter(assignment => {
      if (!assignment.isActive) return false;
      if (assignment.expiresAt && assignment.expiresAt < now) {
        assignment.isActive = false; // Auto-expire
        return false;
      }
      return true;
    });
  }

  /**
   * Get user's effective permissions
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const assignments = await this.getUserRoles(userId);
    const allPermissions = new Set<string>();

    for (const assignment of assignments) {
      const rolePermissions = await this.getEffectivePermissions(assignment.roleId);
      rolePermissions.forEach(permission => allPermissions.add(permission));
    }

    return Array.from(allPermissions);
  }

  // ================== AUTHORIZATION ==================

  /**
   * Check if user has specific permission
   */
  async hasPermission(
    userId: string,
    permissionId: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      return userPermissions.includes(permissionId);
    } catch (error) {
      await this.auditLogger.logSecurityEvent('permission_check_error', {
        userId,
        permissionId,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Check if user can perform action on resource
   */
  async canPerformAction(
    userId: string,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): Promise<PolicyEvaluation> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      
      // Find permissions that match the resource and action
      const matchingPermissions = userPermissions.filter(permissionId => {
        const permission = this.permissions.get(permissionId);
        return permission && 
               permission.resource === resource && 
               permission.action === action;
      });

      if (matchingPermissions.length === 0) {
        await this.auditLogger.logSecurityEvent('authorization_denied', {
          userId,
          resource,
          action,
          reason: 'no_matching_permissions'
        });

        return {
          allowed: false,
          reason: 'No permissions found for this action on the resource',
          appliedPolicies: []
        };
      }

      // Evaluate constraints if present
      for (const permissionId of matchingPermissions) {
        const permission = this.permissions.get(permissionId)!;
        
        if (permission.constraints && context) {
          const constraintMet = await this.evaluateConstraints(permission.constraints, context);
          if (!constraintMet) {
            continue; // Try next permission
          }
        }

        await this.auditLogger.logSecurityEvent('authorization_granted', {
          userId,
          resource,
          action,
          permissionId
        });

        return {
          allowed: true,
          reason: `Permission ${permissionId} allows this action`,
          appliedPolicies: [permissionId],
          constraints: permission.constraints
        };
      }

      await this.auditLogger.logSecurityEvent('authorization_denied', {
        userId,
        resource,
        action,
        reason: 'constraints_not_met'
      });

      return {
        allowed: false,
        reason: 'Constraints not met for available permissions',
        appliedPolicies: matchingPermissions
      };
    } catch (error) {
      await this.auditLogger.logSecurityEvent('authorization_error', {
        userId,
        resource,
        action,
        error: error.message
      });

      return {
        allowed: false,
        reason: 'Authorization check failed',
        appliedPolicies: []
      };
    }
  }

  // ================== PRIVATE HELPERS ==================

  private async buildRoleHierarchy(roleId: string): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) return;

    const inheritedRoles = new Set<string>();
    const visited = new Set<string>();

    const traverse = (currentRoleId: string) => {
      if (visited.has(currentRoleId)) return; // Prevent cycles
      visited.add(currentRoleId);

      const currentRole = this.roles.get(currentRoleId);
      if (!currentRole?.inherits) return;

      for (const parentRoleId of currentRole.inherits) {
        inheritedRoles.add(parentRoleId);
        traverse(parentRoleId);
      }
    };

    traverse(roleId);
    this.roleHierarchy.set(roleId, inheritedRoles);
  }

  private async getEffectivePermissions(roleId: string): Promise<Set<string>> {
    const allPermissions = new Set<string>();
    const role = this.roles.get(roleId);
    
    if (!role) return allPermissions;

    // Add direct permissions
    role.permissions.forEach(permission => allPermissions.add(permission));

    // Add inherited permissions
    const inheritedRoles = this.roleHierarchy.get(roleId) || new Set();
    for (const inheritedRoleId of inheritedRoles) {
      const inheritedRole = this.roles.get(inheritedRoleId);
      if (inheritedRole) {
        inheritedRole.permissions.forEach(permission => allPermissions.add(permission));
      }
    }

    return allPermissions;
  }

  private async evaluateConstraints(
    constraints: Record<string, any>,
    context: Record<string, any>
  ): Promise<boolean> {
    // Simple constraint evaluation - extend for complex logic
    for (const [key, value] of Object.entries(constraints)) {
      if (context[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private initializeSystemRoles(): void {
    // System Administrator - Full access
    this.roles.set('system-admin', {
      id: 'system-admin',
      name: 'System Administrator',
      description: 'Full system access with all permissions',
      permissions: [], // Will be populated with all permissions
      isSystemRole: true,
      isActive: true
    });

    // ML Engineer - ML operations focused
    this.roles.set('ml-engineer', {
      id: 'ml-engineer',
      name: 'ML Engineer',
      description: 'Machine learning development and deployment',
      permissions: [
        'models:create', 'models:read', 'models:update', 'models:deploy',
        'experiments:create', 'experiments:read', 'experiments:update', 'experiments:delete',
        'datasets:read', 'datasets:upload', 'datasets:process'
      ],
      isSystemRole: true,
      isActive: true
    });

    // Data Scientist - Research focused
    this.roles.set('data-scientist', {
      id: 'data-scientist',
      name: 'Data Scientist',
      description: 'Research and experimentation capabilities',
      permissions: [
        'experiments:create', 'experiments:read', 'experiments:update',
        'models:create', 'models:read',
        'datasets:read', 'datasets:upload', 'datasets:analyze'
      ],
      isSystemRole: true,
      isActive: true
    });

    // Viewer - Read-only access
    this.roles.set('viewer', {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to ML resources',
      permissions: [
        'models:read', 'experiments:read', 'datasets:read'
      ],
      isSystemRole: true,
      isActive: true
    });
  }

  private initializeSystemPermissions(): void {
    const mlPermissions: Permission[] = [
      // Model permissions
      { id: 'models:create', name: 'Create Models', description: 'Create new ML models', resource: 'models', action: 'create' },
      { id: 'models:read', name: 'Read Models', description: 'View ML models', resource: 'models', action: 'read' },
      { id: 'models:update', name: 'Update Models', description: 'Modify ML models', resource: 'models', action: 'update' },
      { id: 'models:delete', name: 'Delete Models', description: 'Remove ML models', resource: 'models', action: 'delete' },
      { id: 'models:deploy', name: 'Deploy Models', description: 'Deploy models to production', resource: 'models', action: 'deploy' },

      // Experiment permissions
      { id: 'experiments:create', name: 'Create Experiments', description: 'Create new experiments', resource: 'experiments', action: 'create' },
      { id: 'experiments:read', name: 'Read Experiments', description: 'View experiments', resource: 'experiments', action: 'read' },
      { id: 'experiments:update', name: 'Update Experiments', description: 'Modify experiments', resource: 'experiments', action: 'update' },
      { id: 'experiments:delete', name: 'Delete Experiments', description: 'Remove experiments', resource: 'experiments', action: 'delete' },

      // Dataset permissions
      { id: 'datasets:read', name: 'Read Datasets', description: 'View datasets', resource: 'datasets', action: 'read' },
      { id: 'datasets:upload', name: 'Upload Datasets', description: 'Upload new datasets', resource: 'datasets', action: 'upload' },
      { id: 'datasets:process', name: 'Process Datasets', description: 'Process and transform datasets', resource: 'datasets', action: 'process' },
      { id: 'datasets:analyze', name: 'Analyze Datasets', description: 'Perform analysis on datasets', resource: 'datasets', action: 'analyze' },

      // User management permissions
      { id: 'users:create', name: 'Create Users', description: 'Create new users', resource: 'users', action: 'create' },
      { id: 'users:read', name: 'Read Users', description: 'View user information', resource: 'users', action: 'read' },
      { id: 'users:update', name: 'Update Users', description: 'Modify user information', resource: 'users', action: 'update' },
      { id: 'users:delete', name: 'Delete Users', description: 'Remove users', resource: 'users', action: 'delete' },

      // System permissions
      { id: 'system:admin', name: 'System Administration', description: 'Full system administration', resource: 'system', action: 'admin' },
      { id: 'system:monitor', name: 'System Monitoring', description: 'Monitor system health', resource: 'system', action: 'monitor' },
      { id: 'system:configure', name: 'System Configuration', description: 'Configure system settings', resource: 'system', action: 'configure' }
    ];

    mlPermissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });

    // Update system admin role to have all permissions
    const systemAdminRole = this.roles.get('system-admin')!;
    systemAdminRole.permissions = mlPermissions.map(p => p.id);
  }
}

export default RBACSystem;