# Fortune 100-Grade User and Company Management Hierarchy

## Overview

This implementation provides enterprise-grade identity and access management capabilities that exceed the functionality of Okta and Oracle IDM/IAM systems, specifically designed for competitive cyber threat intelligence platforms.

## Key Differentiators from Okta/Oracle

### 🏢 **Unlimited Hierarchical Organization Structure**
- **Companies**: Parent-subsidiary relationships with unlimited nesting
- **Departments**: Multi-level nested departments with specialized functions
- **Teams**: Cross-functional teams with CTI-specific specializations
- **Inheritance**: Automatic permission and access inheritance throughout hierarchy

### 🔐 **Advanced Role & Permission Management**
- **Role Inheritance**: Hierarchical roles with cascading permissions
- **Dynamic Permissions**: Context-aware permissions with conditional access
- **Fine-grained Control**: Resource-level permissions with action specificity
- **Security Classifications**: Multi-level clearance system (Public → Top Secret)

### 🛡️ **Enterprise Security Features**
- **Multi-Factor Authentication**: Granular MFA requirements by role
- **Account Locking**: Intelligent lockout with progressive delays
- **Session Management**: Role-based session timeouts and constraints
- **Audit Trails**: Comprehensive logging of all organizational operations

### 🎯 **CTI-Specific Features**
- **Threat Intelligence Roles**: Specialized roles for CTI operations
- **Team Specializations**: Threat hunting, incident response, malware analysis
- **Clearance Levels**: Security classification for sensitive operations
- **Performance Tracking**: Built-in metrics for security teams

## Architecture Components

### Data Models

```typescript
// Company - Hierarchical organization structure
interface ICompany {
  name: string;
  code: string;
  domain: string;
  parentCompany?: ObjectId;
  subsidiaries: ObjectId[];
  settings: {
    securityPolicy: 'strict' | 'moderate' | 'flexible';
    requireMFA: boolean;
    dataRetentionDays: number;
  };
  metadata: {
    threatIntelligenceLevel: 'basic' | 'advanced' | 'premium' | 'enterprise';
    complianceRequirements: string[];
  };
}

// Department - Nested departmental structure
interface IDepartment {
  name: string;
  code: string;
  company: ObjectId;
  parentDepartment?: ObjectId;
  manager?: ObjectId;
  members: ObjectId[];
  metadata: {
    function: 'security' | 'intelligence' | 'operations' | 'analysis';
    clearanceLevel: 'public' | 'internal' | 'confidential' | 'secret' | 'top-secret';
  };
}

// Team - Specialized operational teams
interface ITeam {
  name: string;
  department: ObjectId;
  teamLead?: ObjectId;
  members: ObjectId[];
  metadata: {
    specialization: 'threat-hunting' | 'incident-response' | 'malware-analysis' | 'forensics';
    operatingHours: { timezone: string; schedule: '24/7' | 'business-hours' };
  };
  performance: {
    casesHandled: number;
    averageResponseTime: number;
    successRate: number;
  };
}

// Role - Hierarchical role system
interface IRole {
  name: string;
  level: number; // 0-100 privilege scale
  parentRole?: ObjectId;
  permissions: ObjectId[];
  constraints: {
    timeRestrictions?: { allowedHours: string; allowedDays: number[] };
    ipRestrictions?: string[];
    requireMFA?: boolean;
  };
}

// Permission - Fine-grained access control
interface IPermission {
  resource: string;
  action: string;
  scope: 'global' | 'company' | 'department' | 'team';
  constraints?: {
    conditions: Array<{ field: string; operator: string; value: any }>;
    rateLimit?: { requests: number; window: number };
  };
}
```

### Service Layer

#### OrganizationService
- Company hierarchy management
- Department and team operations
- User assignment and membership
- Organization statistics and reporting

#### RolePermissionService
- Role hierarchy management
- Permission assignment and validation
- Access control evaluation
- System initialization

### API Endpoints

#### Company Management
```bash
POST   /organizations/companies           # Create company
GET    /organizations/companies/:id       # Get company details
GET    /organizations/companies/:id/hierarchy  # Get full hierarchy
PUT    /organizations/companies/:id       # Update company
GET    /organizations/companies/:id/stats # Organization statistics
```

#### Department Management
```bash
POST   /organizations/departments         # Create department
GET    /organizations/departments/:id     # Get department
GET    /organizations/departments/:id/hierarchy  # Department hierarchy
POST   /organizations/departments/:id/members    # Add user to department
DELETE /organizations/departments/:id/members/:userId  # Remove user
```

#### Team Management
```bash
POST   /organizations/teams              # Create team
GET    /organizations/teams/:id          # Get team details
POST   /organizations/teams/:id/members  # Add team member
DELETE /organizations/teams/:id/members/:userId  # Remove member
PUT    /organizations/teams/:id/lead     # Change team lead
```

#### Role & Permission Management
```bash
POST   /organizations/roles              # Create role
GET    /organizations/roles/:id          # Get role details
POST   /organizations/roles/:id/assign   # Assign role to user
DELETE /organizations/roles/:id/users/:userId  # Remove role from user
GET    /organizations/users/:id/permissions    # Get effective permissions
```

#### User Context
```bash
GET    /organizations/users/my-context   # Current user context
GET    /organizations/users/:id/context  # User organizational context
```

## Authentication & Authorization

### Enhanced Authentication Middleware

```typescript
// Organization-aware authentication
import { organizationAuthMiddleware } from './middleware/organizationAuth';

// Permission-based authorization
import { requirePermission, requireResourceAccess } from './middleware/organizationAuth';

// Clearance-based authorization
import { requireClearanceLevel } from './middleware/organizationAuth';

// Usage examples
app.use('/api/v1', organizationAuthMiddleware);
app.post('/sensitive-data', requireClearanceLevel('secret'), handler);
app.delete('/users', requirePermission('USER:DELETE'), handler);
app.get('/iocs', requireResourceAccess('ioc', 'read'), handler);
```

### Access Control Examples

```typescript
// Check if user can access resource
const canAccess = await rolePermissionService.userCanAccessResource(
  userId, 
  'threat-feed', 
  'create'
);

// Get user's effective permissions (including inherited)
const permissions = await rolePermissionService.getUserEffectivePermissions(userId);

// Check management relationship
const isManager = await user.isManagerOf(subordinateId);

// Validate clearance level
const hasAccess = user.metadata.clearanceLevel >= 'secret';
```

## System Initialization

### Default Roles

```typescript
const systemRoles = [
  { name: 'System Administrator', level: 100, scope: 'global' },
  { name: 'Company Administrator', level: 90, scope: 'company' },
  { name: 'Security Manager', level: 80, scope: 'company' },
  { name: 'Threat Intelligence Analyst', level: 60, scope: 'company' },
  { name: 'Security Analyst', level: 50, scope: 'company' },
  { name: 'Security Viewer', level: 30, scope: 'company' },
  { name: 'Basic User', level: 10, scope: 'company' }
];
```

### Default Permissions

```typescript
const systemPermissions = [
  // User Management
  { code: 'USER:CREATE', resource: 'user', action: 'create' },
  { code: 'USER:DELETE', resource: 'user', action: 'delete', riskLevel: 'critical' },
  
  // Threat Intelligence
  { code: 'IOC:CREATE', resource: 'ioc', action: 'create' },
  { code: 'ALERT:ASSIGN', resource: 'alert', action: 'assign' },
  
  // Administration
  { code: 'COMPANY:MANAGE', resource: 'company', action: 'manage', riskLevel: 'critical' },
  { code: 'ROLE:ASSIGN', resource: 'role', action: 'assign', riskLevel: 'high' }
];
```

## Usage Examples

### 1. Initialize System

```typescript
import { rolePermissionService } from './services/rolePermissionService';

// Initialize default roles and permissions
await rolePermissionService.initializeSystem();
```

### 2. Create Fortune 100 Company Structure

```typescript
import { organizationService } from './services/organizationService';

// Create parent company
const parentCompany = await organizationService.createCompany({
  name: 'GlobalCorp Industries',
  code: 'GLOBAL',
  domain: 'globalcorp.com',
  settings: {
    securityPolicy: 'strict',
    requireMFA: true
  },
  metadata: {
    threatIntelligenceLevel: 'enterprise',
    complianceRequirements: ['SOC2', 'ISO27001', 'GDPR']
  }
});

// Create subsidiary
const subsidiary = await organizationService.createCompany({
  name: 'CyberSec Division',
  code: 'CSEC',
  domain: 'cybersec.globalcorp.com',
  parentCompany: parentCompany._id.toString()
});

// Create department
const securityDept = await organizationService.createDepartment({
  name: 'Security Operations',
  code: 'SECOPS',
  companyId: subsidiary._id.toString(),
  metadata: {
    function: 'security',
    clearanceLevel: 'secret'
  }
});

// Create specialized team
const threatHuntingTeam = await organizationService.createTeam({
  name: 'Advanced Threat Hunting',
  code: 'THREAT_HUNT',
  departmentId: securityDept._id.toString(),
  metadata: {
    specialization: 'threat-hunting',
    operatingHours: { schedule: '24/7', timezone: 'UTC' }
  }
});
```

### 3. Create Users with Advanced Roles

```typescript
// Create CISO
const ciso = new User({
  email: 'ciso@globalcorp.com',
  firstName: 'Marcus',
  lastName: 'Chen',
  company: subsidiary._id,
  department: securityDept._id,
  profile: {
    title: 'Chief Information Security Officer',
    clearanceLevel: 'top-secret'
  },
  security: {
    mfaEnabled: true,
    sessionTimeout: 480
  }
});
await ciso.save();

// Assign Security Manager role
const secManagerRole = await Role.findOne({ code: 'SECURITY_MANAGER' });
await rolePermissionService.assignRoleToUser({
  userId: ciso._id.toString(),
  roleId: secManagerRole._id.toString(),
  assignedBy: adminUserId,
  justification: 'CISO security management responsibilities'
});
```

### 4. Permission-based Route Protection

```typescript
import express from 'express';
import { organizationAuthMiddleware, requirePermission, requireClearanceLevel } from './middleware/organizationAuth';

const router = express.Router();

// All routes require authentication
router.use(organizationAuthMiddleware);

// High-security endpoint
router.delete('/users/:id', 
  requirePermission('USER:DELETE'),
  requireClearanceLevel('confidential'),
  async (req, res) => {
    // Delete user logic
  }
);

// Resource-specific access
router.post('/threat-feeds',
  requireResourceAccess('threat-feed', 'create'),
  async (req, res) => {
    // Create threat feed logic
  }
);
```

## Demo Script

Run the comprehensive demonstration:

```bash
cd src/examples
npm run ts-node fortune100Demo.ts
```

The demo will:
1. Initialize system roles and permissions
2. Create a Fortune 100 company hierarchy
3. Set up departments and specialized teams
4. Create users with advanced role assignments
5. Demonstrate permission inheritance and access control
6. Show organizational hierarchy and relationships

## Comparison Matrix: Phantom Spire vs Competitors

| Feature | Phantom Spire | Okta | Oracle IDM |
|---------|---------------|------|------------|
| **Unlimited Hierarchy Nesting** | ✅ | ❌ | ❌ |
| **CTI-Specific Roles** | ✅ | ❌ | ❌ |
| **Role Inheritance** | ✅ | Limited | Limited |
| **Contextual Permissions** | ✅ | ❌ | Limited |
| **Security Classifications** | ✅ | ❌ | Limited |
| **Real-time Permission Calc** | ✅ | ❌ | ❌ |
| **Performance Tracking** | ✅ | ❌ | ❌ |
| **Native CTI Integration** | ✅ | ❌ | ❌ |
| **Custom Compliance Rules** | ✅ | Limited | Limited |
| **Multi-tenant Isolation** | ✅ | Limited | ✅ |
| **Cost** | Open Source | Enterprise $$$$ | Enterprise $$$$ |

## Security Features

### Multi-Factor Authentication
- Role-based MFA requirements
- Conditional MFA based on risk level
- Time and location-based enforcement

### Account Security
- Progressive account lockout
- Failed login attempt tracking
- Session timeout management
- IP-based access restrictions

### Audit & Compliance
- Comprehensive audit trails
- Role assignment tracking
- Permission change logging
- Compliance requirement mapping

## Performance & Scalability

### Database Optimization
- Compound indexes for organizational queries
- Efficient hierarchy traversal algorithms
- Optimized permission calculation caching

### API Performance
- Pagination for large datasets
- Filtered queries for organizational scope
- Connection pooling and query optimization

## Configuration

### Environment Variables
```bash
MONGODB_URI=mongodb://localhost:27017/phantom-spire
JWT_SECRET=your-jwt-secret
MFA_ENABLED=true
SESSION_TIMEOUT=3600
AUDIT_ENABLED=true
```

### Company Settings
```typescript
{
  securityPolicy: 'strict',      // Security enforcement level
  requireMFA: true,              // Global MFA requirement
  dataRetentionDays: 2555,       // 7 years retention
  allowExternalUsers: false,     // External user access
  maxDepartments: 50            // Department limit
}
```

This Fortune 100-grade implementation provides the enterprise capabilities needed for sophisticated cyber threat intelligence operations while maintaining the flexibility and cost-effectiveness that traditional solutions cannot match.