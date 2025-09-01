import mongoose from 'mongoose';
import { Company, ICompany } from '../models/Company';
import { Department, IDepartment } from '../models/Department';
import { Team, ITeam } from '../models/Team';
import { User, IUser } from '../models/User';
import { logger } from '../utils/logger';

export interface ICreateCompanyRequest {
  name: string;
  code: string;
  domain: string;
  description?: string;
  industry?: string;
  country?: string;
  parentCompany?: string;
  settings?: Partial<ICompany['settings']>;
  metadata?: Partial<ICompany['metadata']>;
}

export interface ICreateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  companyId: string;
  parentDepartmentId?: string;
  managerId?: string;
  settings?: Partial<IDepartment['settings']>;
  metadata?: Partial<IDepartment['metadata']>;
}

export interface ICreateTeamRequest {
  name: string;
  code: string;
  description?: string;
  departmentId: string;
  teamLeadId?: string;
  settings?: Partial<ITeam['settings']>;
  metadata?: Partial<ITeam['metadata']>;
}

export class OrganizationService {
  // ========== COMPANY MANAGEMENT ==========

  /**
   * Create a new company
   */
  async createCompany(request: ICreateCompanyRequest): Promise<ICompany> {
    try {
      // Validate parent company if provided
      if (request.parentCompany) {
        const parent = await Company.findById(request.parentCompany);
        if (!parent) {
          throw new Error('Parent company not found');
        }
        if (!parent.canHaveSubsidiaries()) {
          throw new Error('Parent company does not allow subsidiaries');
        }
      }

      const company = new Company({
        name: request.name,
        code: request.code,
        domain: request.domain,
        description: request.description,
        industry: request.industry,
        country: request.country,
        parentCompany: request.parentCompany
          ? new mongoose.Types.ObjectId(request.parentCompany)
          : undefined,
        settings: {
          allowSubsidiaries: false,
          securityPolicy: 'moderate' as const,
          dataRetentionDays: 2555,
          requireMFA: true,
          allowExternalUsers: false,
          ...request.settings,
        },
        metadata: {
          threatIntelligenceLevel: 'basic' as const,
          complianceRequirements: [],
          riskTolerance: 'medium' as const,
          ...request.metadata,
        },
      });

      await company.save();

      logger.info(`Company created: ${company.name} (${company.code})`);
      return company;
    } catch (error) {
      logger.error('Error creating company:', error);
      throw error;
    }
  }

  /**
   * Get company by ID with optional population
   */
  async getCompany(
    companyId: string,
    populate = false
  ): Promise<ICompany | null> {
    try {
      let query = Company.findById(companyId);

      if (populate) {
        query = query
          .populate('parentCompany', 'name code')
          .populate('subsidiaries', 'name code');
      }

      return await query.exec();
    } catch (error) {
      logger.error('Error getting company:', error);
      throw error;
    }
  }

  /**
   * Get company hierarchy (ancestors and descendants)
   */
  async getCompanyHierarchy(companyId: string): Promise<{
    company: ICompany;
    ancestors: ICompany[];
    descendants: ICompany[];
  }> {
    try {
      const company = await this.getCompany(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      // Get ancestors
      const ancestors: ICompany[] = [];
      let currentCompany = company;
      const visitedIds = new Set();

      while (
        currentCompany.parentCompany &&
        !visitedIds.has(currentCompany._id.toString())
      ) {
        visitedIds.add(currentCompany._id.toString());
        const parent = await Company.findById(currentCompany.parentCompany);
        if (!parent) break;
        ancestors.unshift(parent);
        currentCompany = parent;
        if (ancestors.length > 10) break; // Safety limit
      }

      // Get descendants
      const descendants = await this.getCompanyDescendants(companyId);

      return {
        company,
        ancestors,
        descendants,
      };
    } catch (error) {
      logger.error('Error getting company hierarchy:', error);
      throw error;
    }
  }

  /**
   * Get all descendant companies
   */
  private async getCompanyDescendants(companyId: string): Promise<ICompany[]> {
    const descendants: ICompany[] = [];
    const toProcess = [new mongoose.Types.ObjectId(companyId)];
    const processedIds = new Set();

    while (toProcess.length > 0 && descendants.length < 1000) {
      // Safety limit
      const currentId = toProcess.shift()!;
      if (processedIds.has(currentId.toString())) continue;

      processedIds.add(currentId.toString());
      const subsidiaries = await Company.find({ parentCompany: currentId });

      for (const subsidiary of subsidiaries) {
        descendants.push(subsidiary);
        toProcess.push(subsidiary._id as mongoose.Types.ObjectId);
      }
    }

    return descendants;
  }

  /**
   * Update company
   */
  async updateCompany(
    companyId: string,
    updates: Partial<ICompany>
  ): Promise<ICompany | null> {
    try {
      const company = await Company.findByIdAndUpdate(
        companyId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (company) {
        logger.info(`Company updated: ${company.name} (${company.code})`);
      }

      return company;
    } catch (error) {
      logger.error('Error updating company:', error);
      throw error;
    }
  }

  // ========== DEPARTMENT MANAGEMENT ==========

  /**
   * Create a new department
   */
  async createDepartment(
    request: ICreateDepartmentRequest
  ): Promise<IDepartment> {
    try {
      // Validate company exists
      const company = await Company.findById(request.companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      // Validate parent department if provided
      if (request.parentDepartmentId) {
        const parent = await Department.findById(request.parentDepartmentId);
        if (!parent) {
          throw new Error('Parent department not found');
        }
        if (!parent.company.equals(request.companyId)) {
          throw new Error('Parent department must be in the same company');
        }
        if (!parent.settings.allowNestedDepartments) {
          throw new Error(
            'Parent department does not allow nested departments'
          );
        }
      }

      // Validate manager if provided
      if (request.managerId) {
        const manager = await User.findById(request.managerId);
        if (!manager || !manager.company.equals(request.companyId)) {
          throw new Error('Manager not found or not in the same company');
        }
      }

      const department = new Department({
        name: request.name,
        code: request.code,
        description: request.description,
        company: new mongoose.Types.ObjectId(request.companyId),
        parentDepartment: request.parentDepartmentId
          ? new mongoose.Types.ObjectId(request.parentDepartmentId)
          : undefined,
        manager: request.managerId
          ? new mongoose.Types.ObjectId(request.managerId)
          : undefined,
        settings: {
          maxTeams: 10,
          allowNestedDepartments: true,
          requireManagerApproval: false,
          ...request.settings,
        },
        metadata: {
          function: request.metadata?.function || 'other',
          clearanceLevel: 'internal' as const,
          ...request.metadata,
        },
      });

      await department.save();

      logger.info(
        `Department created: ${department.name} (${department.code}) in company ${company.name}`
      );
      return department;
    } catch (error) {
      logger.error('Error creating department:', error);
      throw error;
    }
  }

  /**
   * Get department with hierarchy information
   */
  async getDepartmentHierarchy(departmentId: string): Promise<{
    department: IDepartment;
    ancestors: IDepartment[];
    descendants: IDepartment[];
  }> {
    try {
      const department = await Department.findById(departmentId)
        .populate('company', 'name code')
        .populate('manager', 'firstName lastName email');

      if (!department) {
        throw new Error('Department not found');
      }

      const ancestors = await department.getAncestors();
      const descendants = await department.getDescendants();

      return {
        department,
        ancestors,
        descendants,
      };
    } catch (error) {
      logger.error('Error getting department hierarchy:', error);
      throw error;
    }
  }

  /**
   * Add user to department
   */
  async addUserToDepartment(
    departmentId: string,
    userId: string
  ): Promise<IDepartment> {
    try {
      const department = await Department.findById(departmentId);
      const user = await User.findById(userId);

      if (!department) throw new Error('Department not found');
      if (!user) throw new Error('User not found');
      if (!user.company.equals(department.company)) {
        throw new Error('User and department must be in the same company');
      }

      // Remove user from old department
      if (user.department) {
        await Department.updateOne(
          { _id: user.department },
          { $pull: { members: userId } }
        );
      }

      // Add to new department
      if (!department.members.includes(new mongoose.Types.ObjectId(userId))) {
        department.members.push(new mongoose.Types.ObjectId(userId));
        await department.save();
      }

      // Update user's department
      user.department = new mongoose.Types.ObjectId(departmentId);
      await user.save();

      logger.info(`User ${user.email} added to department ${department.name}`);
      return department;
    } catch (error) {
      logger.error('Error adding user to department:', error);
      throw error;
    }
  }

  // ========== TEAM MANAGEMENT ==========

  /**
   * Create a new team
   */
  async createTeam(request: ICreateTeamRequest): Promise<ITeam> {
    try {
      // Validate department exists
      const department = await Department.findById(
        request.departmentId
      ).populate('company');
      if (!department) {
        throw new Error('Department not found');
      }

      // Validate team lead if provided
      if (request.teamLeadId) {
        const teamLead = await User.findById(request.teamLeadId);
        if (!teamLead || !teamLead.company.equals(department.company._id)) {
          throw new Error('Team lead not found or not in the same company');
        }
      }

      const team = new Team({
        name: request.name,
        code: request.code,
        description: request.description,
        department: new mongoose.Types.ObjectId(request.departmentId),
        company: department.company._id,
        teamLead: request.teamLeadId
          ? new mongoose.Types.ObjectId(request.teamLeadId)
          : undefined,
        settings: {
          maxMembers: 20,
          requireLeadApproval: true,
          allowGuestMembers: false,
          ...request.settings,
        },
        metadata: {
          teamType: request.metadata?.teamType || 'functional',
          clearanceLevel: 'internal' as const,
          operatingHours: {
            timezone: 'UTC',
            schedule: 'business-hours' as const,
          },
          ...request.metadata,
        },
      });

      await team.save();

      logger.info(
        `Team created: ${team.name} (${team.code}) in department ${department.name}`
      );
      return team;
    } catch (error) {
      logger.error('Error creating team:', error);
      throw error;
    }
  }

  /**
   * Add user to team
   */
  async addUserToTeam(teamId: string, userId: string): Promise<ITeam> {
    try {
      const team = await Team.findById(teamId);
      const user = await User.findById(userId);

      if (!team) throw new Error('Team not found');
      if (!user) throw new Error('User not found');
      if (!user.company.equals(team.company)) {
        throw new Error('User and team must be in the same company');
      }

      // Use team method to add member (includes validation)
      await team.addMember(new mongoose.Types.ObjectId(userId));

      // Update user's teams
      if (!user.teams.includes(new mongoose.Types.ObjectId(teamId))) {
        user.teams.push(new mongoose.Types.ObjectId(teamId));
        await user.save();
      }

      logger.info(`User ${user.email} added to team ${team.name}`);
      return team;
    } catch (error) {
      logger.error('Error adding user to team:', error);
      throw error;
    }
  }

  /**
   * Remove user from team
   */
  async removeUserFromTeam(teamId: string, userId: string): Promise<ITeam> {
    try {
      const team = await Team.findById(teamId);
      const user = await User.findById(userId);

      if (!team) throw new Error('Team not found');
      if (!user) throw new Error('User not found');

      // Use team method to remove member (includes validation)
      await team.removeMember(new mongoose.Types.ObjectId(userId));

      // Update user's teams
      const teamIndex = user.teams.indexOf(new mongoose.Types.ObjectId(teamId));
      if (teamIndex > -1) {
        user.teams.splice(teamIndex, 1);
        await user.save();
      }

      logger.info(`User ${user.email} removed from team ${team.name}`);
      return team;
    } catch (error) {
      logger.error('Error removing user from team:', error);
      throw error;
    }
  }

  // ========== UTILITY METHODS ==========

  /**
   * Get organization statistics
   */
  async getOrganizationStats(companyId: string): Promise<{
    company: { name: string; code: string };
    departmentCount: number;
    teamCount: number;
    userCount: number;
    activeUserCount: number;
  }> {
    try {
      const company = await Company.findById(companyId, 'name code');
      if (!company) {
        throw new Error('Company not found');
      }

      const [departmentCount, teamCount, userCount, activeUserCount] =
        await Promise.all([
          Department.countDocuments({ company: companyId, isActive: true }),
          Team.countDocuments({ company: companyId, isActive: true }),
          User.countDocuments({ company: companyId }),
          User.countDocuments({ company: companyId, isActive: true }),
        ]);

      return {
        company: { name: company.name, code: company.code },
        departmentCount,
        teamCount,
        userCount,
        activeUserCount,
      };
    } catch (error) {
      logger.error('Error getting organization stats:', error);
      throw error;
    }
  }

  /**
   * Get user's organizational context
   */
  async getUserOrganizationContext(userId: string): Promise<{
    user: IUser;
    company: ICompany;
    department?: IDepartment;
    teams: ITeam[];
    directReports: IUser[];
  }> {
    try {
      const user = await User.findById(userId)
        .populate('company')
        .populate('department')
        .populate('teams')
        .populate('directReports', 'firstName lastName email profile.title');

      if (!user) {
        throw new Error('User not found');
      }

      return {
        user,
        company: user.company as unknown as ICompany,
        department: user.department as unknown as IDepartment | undefined,
        teams: user.teams as unknown as ITeam[],
        directReports: user.directReports as unknown as IUser[],
      };
    } catch (error) {
      logger.error('Error getting user organization context:', error);
      throw error;
    }
  }
}

export const organizationService = new OrganizationService();
