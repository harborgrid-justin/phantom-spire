/**
 * PROJECT SEQUELIZE MODEL
 * Represents ML projects in the platform with comprehensive type safety
 */
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
  HasMany,
  ForeignKey,
  DataType,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { User } from './User.model';

// Project Attributes Interface
export interface ProjectAttributes {
  /** Unique identifier for the project */
  id: number;
  /** Name of the project */
  name: string;
  /** Project description */
  description?: string;
  /** Foreign key reference to project owner */
  owner_id: number;
  /** Current project status */
  status: 'active' | 'inactive' | 'completed' | 'archived' | 'on_hold';
  /** Project visibility level */
  visibility: 'private' | 'public' | 'team' | 'organization';
  /** Project tags for categorization */
  tags: string[];
  /** Project configuration settings */
  settings: Record<string, any>;
  /** Project due date */
  due_date?: Date;
  /** Progress percentage (0-100) */
  progress_percentage: number;
  /** Project category */
  category?: string;
  /** Project priority level (1-5, 1=highest) */
  priority: number;
  /** Additional project metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// Project Creation Attributes Interface
export interface ProjectCreationAttributes extends Optional<ProjectAttributes,
  'id' | 'description' | 'status' | 'visibility' | 'tags' | 'settings' | 
  'due_date' | 'progress_percentage' | 'category' | 'priority' | 'metadata' | 
  'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'projects',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['name'] },
    { fields: ['owner_id'] },
    { fields: ['status'] },
    { fields: ['visibility'] },
    { fields: ['category'] },
    { fields: ['priority'] },
    { fields: ['due_date'] },
    { fields: ['created_at'] }
  ]
})
export class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  /** Unique identifier for the project */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Name of the project */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare name: string;

  /** Project description */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** Foreign key reference to project owner */
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare owner_id: number;

  /** Current project status */
  @AllowNull(false)
  @Default('active')
  @Column(DataType.ENUM('active', 'inactive', 'completed', 'archived', 'on_hold'))
  declare status: 'active' | 'inactive' | 'completed' | 'archived' | 'on_hold';

  /** Project visibility level */
  @AllowNull(false)
  @Default('private')
  @Column(DataType.ENUM('private', 'public', 'team', 'organization'))
  declare visibility: 'private' | 'public' | 'team' | 'organization';

  /** Project tags for categorization */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

  /** Project configuration settings */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare settings: Record<string, any>;

  /** Project due date */
  @AllowNull(true)
  @Column(DataType.DATE)
  declare due_date?: Date;

  /** Progress percentage (0-100) */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare progress_percentage: number;

  /** Project category */
  @AllowNull(true)
  @Length({ max: 100 })
  @Column(DataType.STRING(100))
  declare category?: string;

  /** Project priority level (1-5, 1=highest) */
  @AllowNull(false)
  @Default(3)
  @Column(DataType.INTEGER)
  declare priority: number;

  /** Additional project metadata */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare metadata: Record<string, any>;

  /** Record creation timestamp */
  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  /** Record last update timestamp */
  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Associations
  /** Project owner user */
  @BelongsTo(() => User, {
    foreignKey: 'owner_id',
    as: 'owner',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare owner?: User;

  // Instance methods
  /**
   * Update project progress percentage
   * @param percentage Progress percentage (0-100)
   * @returns Promise resolving to updated project
   */
  public async updateProgress(percentage: number): Promise<this> {
    this.progress_percentage = Math.max(0, Math.min(100, percentage));
    return this.save();
  }

  /**
   * Add a tag to the project
   * @param tag Tag to add
   * @returns Promise resolving to updated project
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a tag from the project
   * @param tag Tag to remove
   * @returns Promise resolving to updated project
   */
  public async removeTag(tag: string): Promise<this> {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
  }

  /**
   * Check if project is overdue
   * @returns True if project has due date and is past due
   */
  public isOverdue(): boolean {
    return !!this.due_date && new Date() > this.due_date && this.status !== 'completed';
  }

  /**
   * Check if project is completed
   * @returns True if project status is completed
   */
  public isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * Get project priority level as string
   * @returns Priority level description
   */
  public getPriorityLevel(): string {
    const levels = {
      1: 'Critical',
      2: 'High',
      3: 'Medium',
      4: 'Low',
      5: 'Minimal'
    };
    return levels[this.priority as keyof typeof levels] || 'Unknown';
  }

  /**
   * Calculate days until due date
   * @returns Number of days until due (negative if overdue)
   */
  public getDaysUntilDue(): number | null {
    if (!this.due_date) return null;
    
    const now = new Date();
    const diffTime = this.due_date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if project is high priority
   * @returns True if priority is 1 or 2
   */
  public isHighPriority(): boolean {
    return this.priority <= 2;
  }

  // Static methods
  /**
   * Find projects by owner
   * @param ownerId Owner user ID
   * @returns Promise resolving to projects array
   */
  static async findByOwner(ownerId: number): Promise<Project[]> {
    return this.findAll({
      where: { owner_id: ownerId },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find projects by status
   * @param status Status to filter by
   * @returns Promise resolving to projects array
   */
  static async findByStatus(status: ProjectAttributes['status']): Promise<Project[]> {
    return this.findAll({
      where: { status },
      order: [['updated_at', 'DESC']]
    });
  }

  /**
   * Find projects by category
   * @param category Category to filter by
   * @returns Promise resolving to projects array
   */
  static async findByCategory(category: string): Promise<Project[]> {
    return this.findAll({
      where: { category },
      order: [['name', 'ASC']]
    });
  }

  /**
   * Find projects by visibility
   * @param visibility Visibility level to filter by
   * @returns Promise resolving to projects array
   */
  static async findByVisibility(visibility: ProjectAttributes['visibility']): Promise<Project[]> {
    return this.findAll({
      where: { visibility },
      order: [['name', 'ASC']]
    });
  }

  /**
   * Find overdue projects
   * @returns Promise resolving to overdue projects array
   */
  static async findOverdue(): Promise<Project[]> {
    return this.findAll({
      where: {
        due_date: {
          [Op.lt]: new Date()
        },
        status: {
          [Op.ne]: 'completed'
        }
      },
      order: [['due_date', 'ASC']]
    });
  }

  /**
   * Find high priority projects
   * @returns Promise resolving to high priority projects array
   */
  static async findHighPriority(): Promise<Project[]> {
    return this.findAll({
      where: {
        priority: {
          [Op.lte]: 2
        }
      },
      order: [['priority', 'ASC'], ['due_date', 'ASC']]
    });
  }

  /**
   * Find projects by tag
   * @param tag Tag to search for
   * @returns Promise resolving to projects array
   */
  static async findByTag(tag: string): Promise<Project[]> {
    return this.findAll({
      where: {
        tags: {
          [Op.contains]: [tag]
        }
      },
      order: [['updated_at', 'DESC']]
    });
  }

  /**
   * Get project status statistics
   * @returns Promise resolving to status statistics
   */
  static async getStatusStats(): Promise<Array<{ status: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'status',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['status']
    });
    
    return results.map(r => ({
      status: r.status,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get project category statistics
   * @returns Promise resolving to category statistics
   */
  static async getCategoryStats(): Promise<Array<{ category: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'category',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['category']
    });
    
    return results.map(r => ({
      category: r.category || 'Uncategorized',
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get priority distribution statistics
   * @returns Promise resolving to priority statistics
   */
  static async getPriorityStats(): Promise<Array<{ priority: number; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'priority',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['priority']
    });
    
    return results.map(r => ({
      priority: r.priority,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get average progress by status
   * @returns Promise resolving to progress statistics
   */
  static async getProgressStats(): Promise<Array<{ status: string; avg_progress: number }>> {
    const results = await this.findAll({
      attributes: [
        'status',
        [this.sequelize!.fn('AVG', this.sequelize!.col('progress_percentage')), 'avg_progress']
      ],
      group: ['status']
    });
    
    return results.map(r => ({
      status: r.status,
      avg_progress: parseFloat((r as any).getDataValue('avg_progress')) || 0
    }));
  }

  /**
   * Find recent projects
   * @param limit Maximum number of projects to return
   * @returns Promise resolving to recent projects
   */
  static async findRecent(limit: number = 10): Promise<Project[]> {
    return this.findAll({
      order: [['created_at', 'DESC']],
      limit
    });
  }

  /**
   * Search projects by name or description
   * @param searchTerm Search term
   * @returns Promise resolving to matching projects
   */
  static async searchProjects(searchTerm: string): Promise<Project[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          {
            name: {
              [Op.iLike]: `%${searchTerm}%`
            }
          },
          {
            description: {
              [Op.iLike]: `%${searchTerm}%`
            }
          }
        ]
      },
      order: [['updated_at', 'DESC']]
    });
  }
}

export default Project;
