import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

export interface AdminUserConfig {
  username: string;
  email: string;
  password: string;
  organization: string;
}

export interface AdminUserResult {
  userId: string;
  organizationId: string;
  username: string;
  email: string;
  organization: string;
  created: boolean;
}

export class AdminUserService {
  private async connectToMongoDB(): Promise<mongoose.Connection> {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not configured');
    }

    const connection = mongoose.createConnection(uri);
    return connection;
  }

  private async validateUserData(config: AdminUserConfig): Promise<void> {
    const { username, email, password, organization } = config;

    // Validate required fields
    if (!username || !email || !password || !organization) {
      throw new Error('All fields are required: username, email, password, organization');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate username (alphanumeric and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      throw new Error('Username must be 3-20 characters long and contain only letters, numbers, and underscores');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    // Validate organization name
    if (organization.length < 2 || organization.length > 100) {
      throw new Error('Organization name must be between 2 and 100 characters');
    }
  }

  private async checkExistingUser(connection: mongoose.Connection, username: string, email: string): Promise<void> {
    const db = connection.db;
    
    // Check if username already exists
    const existingUsername = await db.collection('users').findOne({ username });
    if (existingUsername) {
      throw new Error('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await db.collection('users').findOne({ email });
    if (existingEmail) {
      throw new Error('Email already exists');
    }
  }

  private async createOrganization(connection: mongoose.Connection, organizationName: string): Promise<string> {
    const db = connection.db;
    
    // Check if organization already exists
    const existingOrg = await db.collection('organizations').findOne({ name: organizationName });
    if (existingOrg) {
      console.log(`Using existing organization: ${organizationName}`);
      return existingOrg._id.toString();
    }

    // Create new organization
    const organizationId = uuidv4();
    const organization = {
      _id: new mongoose.Types.ObjectId(),
      id: organizationId,
      name: organizationName,
      domain: 'localhost', // Default domain for initial setup
      settings: {
        threatRetentionDays: 365,
        evidenceRetentionDays: 2555, // 7 years
        workflowMaxConcurrency: 10,
        dataSourcesEnabled: ['misp', 'stix', 'opencti', 'feeds'],
        integrations: {
          slack: { enabled: false },
          email: { enabled: true },
          webhook: { enabled: true }
        }
      },
      isDefault: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.collection('organizations').insertOne(organization);
    console.log(`Created new organization: ${organizationName} with ID: ${organizationId}`);
    
    return organizationId;
  }

  private async createAdminRole(connection: mongoose.Connection): Promise<string> {
    const db = connection.db;
    
    // Check if admin role already exists
    const existingRole = await db.collection('roles').findOne({ name: 'Administrator' });
    if (existingRole) {
      console.log('Using existing Administrator role');
      return existingRole.id || existingRole._id.toString();
    }

    // Create admin role with all permissions
    const roleId = uuidv4();
    const adminRole = {
      _id: new mongoose.Types.ObjectId(),
      id: roleId,
      name: 'Administrator',
      description: 'Full system administrator with all permissions',
      permissions: [
        // Threat Intelligence permissions
        'threats:read', 'threats:write', 'threats:delete', 'threats:admin',
        // Evidence Management permissions
        'evidence:read', 'evidence:write', 'evidence:delete', 'evidence:admin',
        // Workflow Engine permissions
        'workflows:read', 'workflows:write', 'workflows:delete', 'workflows:admin',
        // User Management permissions
        'users:read', 'users:write', 'users:delete', 'users:admin',
        // Organization Management permissions
        'organizations:read', 'organizations:write', 'organizations:admin',
        // System Administration permissions
        'system:read', 'system:write', 'system:admin', 'system:setup',
        // Analytics permissions
        'analytics:read', 'analytics:write', 'analytics:admin',
        // Integration permissions
        'integrations:read', 'integrations:write', 'integrations:admin',
        // Audit permissions
        'audit:read', 'audit:admin'
      ],
      isSystemRole: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    await db.collection('roles').insertOne(adminRole);
    console.log(`Created Administrator role with ID: ${roleId}`);
    
    return roleId;
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    return await bcrypt.hash(password, saltRounds);
  }

  public async createAdminUser(config: AdminUserConfig): Promise<AdminUserResult> {
    console.log(`Creating admin user: ${config.username} for organization: ${config.organization}`);
    
    // Validate input
    await this.validateUserData(config);
    
    const connection = await this.connectToMongoDB();
    
    try {
      // Check for existing users
      await this.checkExistingUser(connection, config.username, config.email);
      
      // Create organization
      const organizationId = await this.createOrganization(connection, config.organization);
      
      // Create admin role
      const roleId = await this.createAdminRole(connection);
      
      // Hash password
      const passwordHash = await this.hashPassword(config.password);
      
      // Create admin user
      const userId = uuidv4();
      const adminUser = {
        _id: new mongoose.Types.ObjectId(),
        id: userId,
        username: config.username,
        email: config.email.toLowerCase(),
        passwordHash,
        organizationId,
        roleId,
        isActive: true,
        isVerified: true,
        profile: {
          firstName: 'System',
          lastName: 'Administrator',
          title: 'System Administrator',
          department: 'IT Security'
        },
        permissions: [], // Will inherit from role
        settings: {
          theme: 'dark',
          notifications: {
            email: true,
            browser: true,
            mobile: false
          },
          dashboard: {
            layout: 'default',
            refreshInterval: 30
          }
        },
        metadata: {
          createdBy: 'system_setup',
          createdDuring: 'initial_setup',
          setupVersion: '1.0.0'
        },
        lastLogin: null,
        loginCount: 0,
        created_at: new Date(),
        updated_at: new Date()
      };

      const result = await connection.db.collection('users').insertOne(adminUser);
      
      // Create audit log entry
      await connection.db.collection('audit_logs').insertOne({
        _id: new mongoose.Types.ObjectId(),
        timestamp: new Date(),
        userId: userId,
        action: 'user:created',
        resource: 'user',
        resourceId: userId,
        details: {
          username: config.username,
          email: config.email,
          organizationId: organizationId,
          createdBy: 'system_setup',
          roleAssigned: 'Administrator'
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Phantom Spire Setup System'
      });
      
      // Update system health record
      await connection.db.collection('system_health').insertOne({
        _id: new mongoose.Types.ObjectId(),
        timestamp: new Date(),
        component: 'user_management',
        status: 'healthy',
        metrics: {
          adminUserCreated: true,
          setupComplete: false
        },
        message: 'Administrator user created successfully'
      });

      console.log(`Admin user created successfully: ${config.username} (ID: ${userId})`);
      console.log(`Organization: ${config.organization} (ID: ${organizationId})`);
      
      return {
        userId,
        organizationId,
        username: config.username,
        email: config.email,
        organization: config.organization,
        created: true
      };
    } finally {
      await connection.close();
    }
  }

  public async validateAdminCredentials(username: string, password: string): Promise<boolean> {
    const connection = await this.connectToMongoDB();
    
    try {
      const user = await connection.db.collection('users').findOne({ 
        username,
        isActive: true 
      });
      
      if (!user || !user.passwordHash) {
        return false;
      }
      
      const isValid = await bcrypt.compare(password, user.passwordHash);
      
      if (isValid) {
        // Update last login
        await connection.db.collection('users').updateOne(
          { _id: user._id },
          { 
            $set: { lastLogin: new Date(), updated_at: new Date() },
            $inc: { loginCount: 1 }
          }
        );
      }
      
      return isValid;
    } finally {
      await connection.close();
    }
  }

  public async getAdminUserInfo(username: string): Promise<any> {
    const connection = await this.connectToMongoDB();
    
    try {
      const user = await connection.db.collection('users').findOne({ 
        username,
        isActive: true 
      }, {
        projection: { 
          passwordHash: 0 // Exclude password hash
        }
      });
      
      if (user) {
        // Get organization info
        const organization = await connection.db.collection('organizations').findOne({
          id: user.organizationId
        });
        
        // Get role info
        const role = await connection.db.collection('roles').findOne({
          id: user.roleId
        });
        
        return {
          ...user,
          organization: organization ? organization.name : 'Unknown',
          role: role ? role.name : 'Unknown'
        };
      }
      
      return null;
    } finally {
      await connection.close();
    }
  }
}