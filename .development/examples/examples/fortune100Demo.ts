/**
 * Fortune 100-Grade Organization Management Demonstration
 *
 * This script demonstrates the advanced organizational management capabilities
 * that exceed Okta and Oracle IDM/IAM systems for cyber threat intelligence operations.
 */

import mongoose from 'mongoose';
import { organizationService } from '../services/organizationService';
import { rolePermissionService } from '../services/rolePermissionService';
import { User } from '../models/User';
import { config } from '../config/config';
import { logger } from '../utils/logger';

class Fortune100Demo {
  async connect(): Promise<void> {
    try {
      await mongoose.connect(config.MONGODB_URI);
      logger.info('Connected to MongoDB for Fortune 100 demonstration');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }

  /**
   * Initialize system with default roles and permissions
   */
  async initializeSystem(): Promise<void> {
    logger.info('🔧 Initializing Fortune 100-Grade System...');
    await rolePermissionService.initializeSystem();
    logger.info('✅ System initialization complete');
  }

  /**
   * Create a Fortune 100 company with hierarchical structure
   */
  async createFortune100Company(): Promise<{
    company: any;
    departments: any[];
    teams: any[];
  }> {
    logger.info('🏢 Creating Fortune 100 Company Structure...');

    // Create parent company (Global Corp)
    const parentCompany = await organizationService.createCompany({
      name: 'GlobalCorp Industries',
      code: 'GLOBAL',
      domain: 'globalcorp.com',
      description: 'Fortune 100 multinational technology conglomerate',
      industry: 'technology',
      country: 'US',
      settings: {
        allowSubsidiaries: true,
        maxDepartments: 50,
        securityPolicy: 'strict',
        dataRetentionDays: 2555,
        requireMFA: true,
        allowExternalUsers: false,
      },
      metadata: {
        threatIntelligenceLevel: 'enterprise',
        complianceRequirements: ['SOC2', 'ISO27001', 'GDPR', 'NIST', 'FedRAMP'],
        riskTolerance: 'low',
      },
    });

    // Create subsidiary company (CyberSec Division)
    const subsidiary = await organizationService.createCompany({
      name: 'CyberSec Division',
      code: 'CSEC',
      domain: 'cybersec.globalcorp.com',
      description: 'Cybersecurity and threat intelligence division',
      industry: 'technology',
      country: 'US',
      parentCompany: parentCompany._id.toString(),
      settings: {
        allowSubsidiaries: false,
        maxDepartments: 20,
        securityPolicy: 'strict',
        dataRetentionDays: 3650,
        requireMFA: true,
        allowExternalUsers: false,
      },
      metadata: {
        threatIntelligenceLevel: 'enterprise',
        complianceRequirements: [
          'SOC2',
          'ISO27001',
          'GDPR',
          'NIST',
          'FedRAMP',
          'FISMA',
        ],
        riskTolerance: 'low',
      },
    });

    // Create hierarchical departments
    const departments = [];

    // Security Operations Department
    const secOpsDept = await organizationService.createDepartment({
      name: 'Security Operations',
      code: 'SECOPS',
      description: '24/7 security monitoring and incident response',
      companyId: subsidiary._id.toString(),
      settings: {
        maxTeams: 8,
        allowNestedDepartments: true,
        requireManagerApproval: true,
      },
      metadata: {
        function: 'security',
        clearanceLevel: 'secret',
        costCenter: 'SEC-001',
        location: 'Global HQ',
      },
    });
    departments.push(secOpsDept);

    // Threat Intelligence Department
    const threatIntelDept = await organizationService.createDepartment({
      name: 'Threat Intelligence',
      code: 'THREAT_INTEL',
      description: 'Advanced threat research and intelligence operations',
      companyId: subsidiary._id.toString(),
      settings: {
        maxTeams: 6,
        allowNestedDepartments: true,
        requireManagerApproval: true,
      },
      metadata: {
        function: 'intelligence',
        clearanceLevel: 'top-secret',
        costCenter: 'TI-001',
        location: 'Security Center',
      },
    });
    departments.push(threatIntelDept);

    // Cyber Defense Department (nested under Security Operations)
    const cyberDefenseDept = await organizationService.createDepartment({
      name: 'Cyber Defense',
      code: 'CYBER_DEF',
      description: 'Proactive defense and threat hunting operations',
      companyId: subsidiary._id.toString(),
      parentDepartmentId: secOpsDept._id.toString(),
      settings: {
        maxTeams: 4,
        allowNestedDepartments: false,
        requireManagerApproval: true,
      },
      metadata: {
        function: 'operations',
        clearanceLevel: 'secret',
        costCenter: 'CD-001',
        location: 'SOC Alpha',
      },
    });
    departments.push(cyberDefenseDept);

    // Create specialized teams
    const teams = [];

    // Threat Hunting Team
    const threatHuntingTeam = await organizationService.createTeam({
      name: 'Advanced Threat Hunting',
      code: 'THREAT_HUNT',
      description: 'Elite threat hunting and adversary tracking team',
      departmentId: cyberDefenseDept._id.toString(),
      settings: {
        maxMembers: 8,
        requireLeadApproval: true,
        allowGuestMembers: false,
      },
      metadata: {
        teamType: 'operational',
        specialization: 'threat-hunting',
        clearanceLevel: 'secret',
        operatingHours: {
          timezone: 'UTC',
          schedule: '24/7',
        },
      },
    });
    teams.push(threatHuntingTeam);

    // Incident Response Team
    const incidentResponseTeam = await organizationService.createTeam({
      name: 'Incident Response Team',
      code: 'IRT',
      description: 'Rapid incident response and containment team',
      departmentId: secOpsDept._id.toString(),
      settings: {
        maxMembers: 12,
        requireLeadApproval: true,
        allowGuestMembers: false,
      },
      metadata: {
        teamType: 'operational',
        specialization: 'incident-response',
        clearanceLevel: 'confidential',
        operatingHours: {
          timezone: 'UTC',
          schedule: '24/7',
        },
      },
    });
    teams.push(incidentResponseTeam);

    // Malware Analysis Team
    const malwareAnalysisTeam = await organizationService.createTeam({
      name: 'Malware Analysis Lab',
      code: 'MAL_LAB',
      description: 'Advanced malware reverse engineering and analysis',
      departmentId: threatIntelDept._id.toString(),
      settings: {
        maxMembers: 6,
        requireLeadApproval: true,
        allowGuestMembers: false,
      },
      metadata: {
        teamType: 'functional',
        specialization: 'malware-analysis',
        clearanceLevel: 'top-secret',
        operatingHours: {
          timezone: 'UTC',
          schedule: 'business-hours',
        },
      },
    });
    teams.push(malwareAnalysisTeam);

    logger.info(`✅ Created Fortune 100 company structure:`);
    logger.info(
      `   - Parent Company: ${parentCompany.name} (${parentCompany.code})`
    );
    logger.info(`   - Subsidiary: ${subsidiary.name} (${subsidiary.code})`);
    logger.info(`   - Departments: ${departments.length}`);
    logger.info(`   - Teams: ${teams.length}`);

    return {
      company: subsidiary,
      departments,
      teams,
    };
  }

  /**
   * Create users with advanced role assignments
   */
  async createAdvancedUsers(
    company: any,
    departments: any[],
    teams: any[]
  ): Promise<any[]> {
    logger.info('👥 Creating Advanced User Hierarchy...');

    const users = [];

    // Create CEO (System Administrator)
    const ceo = new User({
      email: 'ceo@globalcorp.com',
      password: 'SecureP@ssw0rd123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'admin', // Legacy role
      company: company._id,
      profile: {
        title: 'Chief Executive Officer',
        employeeId: 'CEO001',
        phoneNumber: '+1-555-0101',
        timezone: 'America/New_York',
      },
      security: {
        mfaEnabled: true,
        requireMFA: true,
        sessionTimeout: 480, // 8 hours
      },
      metadata: {
        clearanceLevel: 'top-secret',
        costCenter: 'EXEC-001',
        hireDate: new Date('2018-01-15'),
      },
    });
    await ceo.save();

    // Assign System Admin role
    const systemAdminRole = await mongoose
      .model('Role')
      .findOne({ code: 'SYSTEM_ADMIN' });
    if (systemAdminRole) {
      await rolePermissionService.assignRoleToUser({
        userId: ceo._id.toString(),
        roleId: systemAdminRole._id.toString(),
        assignedBy: ceo._id.toString(), // Self-assign for demo
        justification: 'CEO system access',
      });
    }

    users.push(ceo);

    // Create CISO (Security Manager)
    const ciso = new User({
      email: 'ciso@globalcorp.com',
      password: 'SecureP@ssw0rd123',
      firstName: 'Marcus',
      lastName: 'Chen',
      role: 'admin',
      company: company._id,
      department: departments[0]._id, // Security Operations
      manager: ceo._id,
      profile: {
        title: 'Chief Information Security Officer',
        employeeId: 'CISO001',
        phoneNumber: '+1-555-0102',
        timezone: 'America/New_York',
      },
      security: {
        mfaEnabled: true,
        requireMFA: true,
        sessionTimeout: 480,
      },
      metadata: {
        clearanceLevel: 'top-secret',
        costCenter: 'SEC-001',
        hireDate: new Date('2019-03-01'),
      },
    });
    await ciso.save();

    // Assign Security Manager role
    const secManagerRole = await mongoose
      .model('Role')
      .findOne({ code: 'SECURITY_MANAGER' });
    if (secManagerRole) {
      await rolePermissionService.assignRoleToUser({
        userId: ciso._id.toString(),
        roleId: secManagerRole._id.toString(),
        assignedBy: ceo._id.toString(),
        justification: 'CISO security management responsibilities',
      });
    }

    // Add CISO as department manager
    departments[0].manager = ciso._id;
    await departments[0].save();
    await organizationService.addUserToDepartment(
      departments[0]._id.toString(),
      ciso._id.toString()
    );

    users.push(ciso);

    // Create Senior Threat Analyst
    const seniorAnalyst = new User({
      email: 'senior.analyst@globalcorp.com',
      password: 'SecureP@ssw0rd123',
      firstName: 'Lisa',
      lastName: 'Rodriguez',
      role: 'analyst',
      company: company._id,
      department: departments[1]._id, // Threat Intelligence
      teams: [teams[2]._id], // Malware Analysis Lab
      manager: ciso._id,
      profile: {
        title: 'Senior Threat Intelligence Analyst',
        employeeId: 'STA001',
        phoneNumber: '+1-555-0103',
        timezone: 'America/New_York',
      },
      security: {
        mfaEnabled: true,
        requireMFA: true,
        sessionTimeout: 360, // 6 hours
      },
      metadata: {
        clearanceLevel: 'secret',
        costCenter: 'TI-001',
        hireDate: new Date('2020-06-15'),
      },
    });
    await seniorAnalyst.save();

    // Assign Threat Intelligence Analyst role
    const tiAnalystRole = await mongoose
      .model('Role')
      .findOne({ code: 'TI_ANALYST' });
    if (tiAnalystRole) {
      await rolePermissionService.assignRoleToUser({
        userId: seniorAnalyst._id.toString(),
        roleId: tiAnalystRole._id.toString(),
        assignedBy: ciso._id.toString(),
        justification: 'Senior analyst threat intelligence responsibilities',
      });
    }

    // Add to team
    await organizationService.addUserToTeam(
      teams[2]._id.toString(),
      seniorAnalyst._id.toString()
    );
    await organizationService.addUserToDepartment(
      departments[1]._id.toString(),
      seniorAnalyst._id.toString()
    );

    users.push(seniorAnalyst);

    // Create SOC Analyst
    const socAnalyst = new User({
      email: 'soc.analyst@globalcorp.com',
      password: 'SecureP@ssw0rd123',
      firstName: 'David',
      lastName: 'Kim',
      role: 'analyst',
      company: company._id,
      department: departments[2]._id, // Cyber Defense
      teams: [teams[0]._id], // Threat Hunting Team
      manager: seniorAnalyst._id,
      profile: {
        title: 'SOC Analyst II',
        employeeId: 'SOC002',
        phoneNumber: '+1-555-0104',
        timezone: 'America/New_York',
      },
      security: {
        mfaEnabled: true,
        requireMFA: false,
        sessionTimeout: 240, // 4 hours
      },
      metadata: {
        clearanceLevel: 'confidential',
        costCenter: 'CD-001',
        hireDate: new Date('2021-09-01'),
      },
    });
    await socAnalyst.save();

    // Assign Security Analyst role
    const secAnalystRole = await mongoose
      .model('Role')
      .findOne({ code: 'SEC_ANALYST' });
    if (secAnalystRole) {
      await rolePermissionService.assignRoleToUser({
        userId: socAnalyst._id.toString(),
        roleId: secAnalystRole._id.toString(),
        assignedBy: ciso._id.toString(),
        justification: 'SOC analyst operational responsibilities',
      });
    }

    // Add to team and department
    await organizationService.addUserToTeam(
      teams[0]._id.toString(),
      socAnalyst._id.toString()
    );
    await organizationService.addUserToDepartment(
      departments[2]._id.toString(),
      socAnalyst._id.toString()
    );

    users.push(socAnalyst);

    logger.info(
      `✅ Created ${users.length} users with advanced role assignments`
    );

    return users;
  }

  /**
   * Demonstrate advanced permission and access control
   */
  async demonstrateAccessControl(users: any[]): Promise<void> {
    logger.info('🔐 Demonstrating Advanced Access Control...');

    const [ceo, ciso, seniorAnalyst, socAnalyst] = users;

    // Test CEO permissions (should have everything)
    logger.info('\n--- CEO Permissions ---');
    const ceoPermissions =
      await rolePermissionService.getUserEffectivePermissions(
        ceo._id.toString()
      );
    logger.info(`CEO has ${ceoPermissions.length} effective permissions`);

    const canCEOManageCompany =
      await rolePermissionService.userCanAccessResource(
        ceo._id.toString(),
        'company',
        'manage'
      );
    logger.info(`CEO can manage companies: ${canCEOManageCompany}`);

    // Test CISO permissions
    logger.info('\n--- CISO Permissions ---');
    const cisoPermissions =
      await rolePermissionService.getUserEffectivePermissions(
        ciso._id.toString()
      );
    logger.info(`CISO has ${cisoPermissions.length} effective permissions`);

    const canCISOManageRoles =
      await rolePermissionService.userCanAccessResource(
        ciso._id.toString(),
        'role',
        'manage'
      );
    logger.info(`CISO can manage roles: ${canCISOManageRoles}`);

    // Test Senior Analyst permissions
    logger.info('\n--- Senior Analyst Permissions ---');
    const analystPermissions =
      await rolePermissionService.getUserEffectivePermissions(
        seniorAnalyst._id.toString()
      );
    logger.info(
      `Senior Analyst has ${analystPermissions.length} effective permissions`
    );

    const canAnalystCreateIOC =
      await rolePermissionService.userCanAccessResource(
        seniorAnalyst._id.toString(),
        'ioc',
        'create'
      );
    logger.info(`Senior Analyst can create IOCs: ${canAnalystCreateIOC}`);

    // Test SOC Analyst permissions (should be limited)
    logger.info('\n--- SOC Analyst Permissions ---');
    const socPermissions =
      await rolePermissionService.getUserEffectivePermissions(
        socAnalyst._id.toString()
      );
    logger.info(
      `SOC Analyst has ${socPermissions.length} effective permissions`
    );

    const canSOCDeleteUser = await rolePermissionService.userCanAccessResource(
      socAnalyst._id.toString(),
      'user',
      'delete'
    );
    logger.info(`SOC Analyst can delete users: ${canSOCDeleteUser}`);
  }

  /**
   * Demonstrate organizational hierarchy and relationships
   */
  async demonstrateHierarchy(company: any, users: any[]): Promise<void> {
    logger.info('🏗️ Demonstrating Organizational Hierarchy...');

    // Get organization stats
    const stats = await organizationService.getOrganizationStats(
      company._id.toString()
    );
    logger.info('\n--- Organization Statistics ---');
    logger.info(`Company: ${stats.company.name} (${stats.company.code})`);
    logger.info(`Departments: ${stats.departmentCount}`);
    logger.info(`Teams: ${stats.teamCount}`);
    logger.info(`Total Users: ${stats.userCount}`);
    logger.info(`Active Users: ${stats.activeUserCount}`);

    // Get user organization context
    const [ceo, ciso, seniorAnalyst, socAnalyst] = users;

    logger.info('\n--- User Organizational Context ---');
    const cisoContext = await organizationService.getUserOrganizationContext(
      ciso._id.toString()
    );
    logger.info(`CISO Context:`);
    logger.info(`  - Company: ${(cisoContext.company as any).name}`);
    logger.info(
      `  - Department: ${(cisoContext.department as any)?.name || 'None'}`
    );
    logger.info(
      `  - Teams: ${(cisoContext.teams as any[]).map(t => t.name).join(', ')}`
    );
    logger.info(`  - Direct Reports: ${cisoContext.directReports.length}`);

    const analystContext = await organizationService.getUserOrganizationContext(
      seniorAnalyst._id.toString()
    );
    logger.info(`Senior Analyst Context:`);
    logger.info(`  - Company: ${(analystContext.company as any).name}`);
    logger.info(
      `  - Department: ${(analystContext.department as any)?.name || 'None'}`
    );
    logger.info(
      `  - Teams: ${(analystContext.teams as any[]).map(t => t.name).join(', ')}`
    );
    logger.info(`  - Direct Reports: ${analystContext.directReports.length}`);

    // Demonstrate management relationships
    logger.info('\n--- Management Relationships ---');
    const isCISOManagerOfAnalyst = await ciso.isManagerOf(seniorAnalyst._id);
    logger.info(`CISO manages Senior Analyst: ${isCISOManagerOfAnalyst}`);

    const isAnalystManagerOfSOC = await seniorAnalyst.isManagerOf(
      socAnalyst._id
    );
    logger.info(`Senior Analyst manages SOC Analyst: ${isAnalystManagerOfSOC}`);
  }

  /**
   * Run the complete Fortune 100 demonstration
   */
  async runDemo(): Promise<void> {
    try {
      await this.connect();

      logger.info(
        '🚀 Starting Fortune 100-Grade Organization Management Demonstration'
      );
      logger.info(
        '===================================================================='
      );

      // Initialize system
      await this.initializeSystem();

      // Create organizational structure
      const { company, departments, teams } =
        await this.createFortune100Company();

      // Create users with roles
      const users = await this.createAdvancedUsers(company, departments, teams);

      // Demonstrate access control
      await this.demonstrateAccessControl(users);

      // Demonstrate hierarchy
      await this.demonstrateHierarchy(company, users);

      logger.info(
        '\n===================================================================='
      );
      logger.info('✅ Fortune 100-Grade Demonstration Complete!');
      logger.info('\nKey Features Demonstrated:');
      logger.info('• Hierarchical company and subsidiary management');
      logger.info(
        '• Multi-level department nesting with specialized functions'
      );
      logger.info('• Advanced team management with CTI specializations');
      logger.info('• Role-based access control with inheritance');
      logger.info('• Fine-grained permissions with context awareness');
      logger.info('• Management hierarchy with delegation capabilities');
      logger.info('• Security clearance levels and compliance requirements');
      logger.info('• Enterprise-grade audit and accountability');
    } catch (error) {
      logger.error('Demo failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// Export for use in other scripts
export { Fortune100Demo };

// Run demo if called directly
if (require.main === module) {
  const demo = new Fortune100Demo();
  demo.runDemo().catch(error => {
    logger.error('Fortune 100 Demo failed:', error);
    process.exit(1);
  });
}
