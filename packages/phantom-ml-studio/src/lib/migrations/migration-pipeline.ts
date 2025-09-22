/**
 * MIGRATION PIPELINE SYSTEM
 * Establishes automated database migration pipeline (SQ.45)
 */
import { Sequelize, QueryInterface, DataTypes, Transaction } from 'sequelize';
import { promises as fs } from 'fs';
import * as path from 'path';
import { getSequelize } from '../sequelize';

export interface MigrationInfo {
  name: string;
  filename: string;
  timestamp: string;
  executed: boolean;
  executedAt?: Date;
  rollbackSupport: boolean;
}

export interface MigrationFile {
  up: (queryInterface: QueryInterface, sequelize: Sequelize) => Promise<void>;
  down: (queryInterface: QueryInterface, sequelize: Sequelize) => Promise<void>;
}

/**
 * Migration Pipeline Manager
 * Handles database schema migrations with rollback support
 */
export class MigrationPipeline {
  private sequelize: Sequelize;
  private migrationsPath: string;
  private migrationTable: string = 'SequelizeMeta';

  constructor(sequelize: Sequelize, migrationsPath: string = path.join(__dirname, 'files')) {
    this.sequelize = sequelize;
    this.migrationsPath = migrationsPath;
  }

  /**
   * Initialize migration tracking table
   */
  async initialize(): Promise<void> {
    const queryInterface = this.sequelize.getQueryInterface();
    
    // Create migrations table if it doesn't exist
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes(this.migrationTable));
    
    if (!tableExists) {
      await queryInterface.createTable(this.migrationTable, {
        name: {
          type: DataTypes.STRING(255),
          primaryKey: true,
          allowNull: false
        },
        executed_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      });
      
      console.log(`✅ Migration table '${this.migrationTable}' created`);
    }
  }

  /**
   * Get all available migration files
   */
  async getAvailableMigrations(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
        .filter(file => /^\d{14}-.*\.(ts|js)$/.test(file)) // Format: YYYYMMDDHHMMSS-description.ts
        .sort();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // Create migrations directory if it doesn't exist
        await fs.mkdir(this.migrationsPath, { recursive: true });
        return [];
      }
      throw error;
    }
  }

  /**
   * Get executed migrations from database
   */
  async getExecutedMigrations(): Promise<string[]> {
    const queryInterface = this.sequelize.getQueryInterface();
    
    try {
      const results = await queryInterface.select(null, this.migrationTable, {
        order: [['name', 'ASC']]
      });
      
      return results.map((result: any) => result.name);
    } catch (error) {
      // Table might not exist yet
      return [];
    }
  }

  /**
   * Get pending migrations
   */
  async getPendingMigrations(): Promise<string[]> {
    const available = await this.getAvailableMigrations();
    const executed = await this.getExecutedMigrations();
    
    return available.filter(migration => !executed.includes(migration));
  }

  /**
   * Load migration file
   */
  async loadMigration(filename: string): Promise<MigrationFile> {
    const filePath = path.join(this.migrationsPath, filename);
    
    try {
      // Clear module cache to ensure fresh load
      delete require.cache[require.resolve(filePath)];
      const migration = require(filePath);
      
      if (!migration.up || !migration.down) {
        throw new Error(`Migration ${filename} must export 'up' and 'down' functions`);
      }
      
      return migration;
    } catch (error) {
      throw new Error(`Failed to load migration ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute a single migration
   */
  async executeMigration(filename: string, transaction?: Transaction): Promise<void> {
    const migration = await this.loadMigration(filename);
    const queryInterface = this.sequelize.getQueryInterface();
    
    console.log(`🔄 Executing migration: ${filename}`);
    
    try {
      // Execute migration within transaction
      await migration.up(queryInterface, this.sequelize);
      
      // Record migration as executed
      await queryInterface.bulkInsert(this.migrationTable, [
        { name: filename, executed_at: new Date() }
      ], { transaction });
      
      console.log(`✅ Migration completed: ${filename}`);
    } catch (error) {
      console.error(`❌ Migration failed: ${filename}`, error);
      throw error;
    }
  }

  /**
   * Rollback a single migration
   */
  async rollbackMigration(filename: string, transaction?: Transaction): Promise<void> {
    const migration = await this.loadMigration(filename);
    const queryInterface = this.sequelize.getQueryInterface();
    
    console.log(`🔄 Rolling back migration: ${filename}`);
    
    try {
      // Execute rollback
      await migration.down(queryInterface, this.sequelize);
      
      // Remove migration record
      await queryInterface.bulkDelete(this.migrationTable, 
        { name: filename }, 
        { transaction }
      );
      
      console.log(`✅ Migration rolled back: ${filename}`);
    } catch (error) {
      console.error(`❌ Migration rollback failed: ${filename}`, error);
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  async migrate(): Promise<void> {
    await this.initialize();
    const pending = await this.getPendingMigrations();
    
    if (pending.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }
    
    console.log(`🔄 Running ${pending.length} pending migrations...`);
    
    // Execute all migrations in a single transaction
    await this.sequelize.transaction(async (transaction) => {
      for (const filename of pending) {
        await this.executeMigration(filename, transaction);
      }
    });
    
    console.log(`✅ All ${pending.length} migrations completed successfully`);
  }

  /**
   * Rollback the last N migrations
   */
  async rollback(steps: number = 1): Promise<void> {
    await this.initialize();
    const executed = await this.getExecutedMigrations();
    
    if (executed.length === 0) {
      console.log('✅ No migrations to rollback');
      return;
    }
    
    const toRollback = executed.slice(-steps).reverse();
    console.log(`🔄 Rolling back ${toRollback.length} migrations...`);
    
    // Execute rollbacks in reverse order within a transaction
    await this.sequelize.transaction(async (transaction) => {
      for (const filename of toRollback) {
        await this.rollbackMigration(filename, transaction);
      }
    });
    
    console.log(`✅ Rolled back ${toRollback.length} migrations successfully`);
  }

  /**
   * Get migration status
   */
  async getStatus(): Promise<MigrationInfo[]> {
    await this.initialize();
    const available = await this.getAvailableMigrations();
    const executed = await this.getExecutedMigrations();
    
    const status: MigrationInfo[] = [];
    
    for (const filename of available) {
      const isExecuted = executed.includes(filename);
      const timestamp = filename.substring(0, 14);
      
      // Check if migration has rollback support
      let rollbackSupport = false;
      try {
        const migration = await this.loadMigration(filename);
        rollbackSupport = typeof migration.down === 'function';
      } catch (error) {
        // Migration file has issues
      }
      
      status.push({
        name: filename.replace(/^\d{14}-/, '').replace(/\.(ts|js)$/, ''),
        filename,
        timestamp,
        executed: isExecuted,
        rollbackSupport
      });
    }
    
    return status.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  /**
   * Generate new migration file
   */
  async generateMigration(name: string, template: 'create_table' | 'alter_table' | 'custom' = 'custom'): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
    const filename = `${timestamp}-${name.replace(/[^a-zA-Z0-9]/g, '_')}.ts`;
    const filepath = path.join(this.migrationsPath, filename);
    
    // Ensure migrations directory exists
    await fs.mkdir(this.migrationsPath, { recursive: true });
    
    let content = '';
    
    switch (template) {
      case 'create_table':
        content = this.getCreateTableTemplate(name);
        break;
      case 'alter_table':
        content = this.getAlterTableTemplate(name);
        break;
      default:
        content = this.getCustomTemplate(name);
    }
    
    await fs.writeFile(filepath, content);
    console.log(`✅ Generated migration: ${filename}`);
    
    return filepath;
  }

  private getCreateTableTemplate(name: string): string {
    return `/**
 * Migration: ${name}
 * Generated: ${new Date().toISOString()}
 */
import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
  await queryInterface.createTable('table_name', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    // Add your columns here
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });
  
  // Add indexes
  await queryInterface.addIndex('table_name', ['created_at']);
}

export async function down(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
  await queryInterface.dropTable('table_name');
}
`;
  }

  private getAlterTableTemplate(name: string): string {
    return `/**
 * Migration: ${name}
 * Generated: ${new Date().toISOString()}
 */
import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
  // Add column
  await queryInterface.addColumn('table_name', 'new_column', {
    type: DataTypes.STRING(255),
    allowNull: true
  });
  
  // Add index
  await queryInterface.addIndex('table_name', ['new_column']);
}

export async function down(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
  // Remove index
  await queryInterface.removeIndex('table_name', ['new_column']);
  
  // Remove column
  await queryInterface.removeColumn('table_name', 'new_column');
}
`;
  }

  private getCustomTemplate(name: string): string {
    return `/**
 * Migration: ${name}
 * Generated: ${new Date().toISOString()}
 */
import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
  // Implement your migration logic here
  // Examples:
  // await queryInterface.createTable('table_name', { ... });
  // await queryInterface.addColumn('table_name', 'column_name', { ... });
  // await queryInterface.addIndex('table_name', ['column_name']);
  // await queryInterface.bulkInsert('table_name', [...]);
}

export async function down(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
  // Implement rollback logic here (reverse of up function)
  // Examples:
  // await queryInterface.dropTable('table_name');
  // await queryInterface.removeColumn('table_name', 'column_name');
  // await queryInterface.removeIndex('table_name', ['column_name']);
  // await queryInterface.bulkDelete('table_name', { ... });
}
`;
  }
}

/**
 * CLI-style migration commands
 */
export class MigrationCLI {
  private pipeline: MigrationPipeline;

  constructor(sequelize?: Sequelize) {
    this.pipeline = new MigrationPipeline(sequelize || require('../sequelize').getSequelize());
  }

  async status(): Promise<void> {
    console.log('📋 Migration Status:');
    console.log('==================');
    
    const status = await this.pipeline.getStatus();
    
    if (status.length === 0) {
      console.log('No migrations found');
      return;
    }
    
    status.forEach(migration => {
      const statusIcon = migration.executed ? '✅' : '⏳';
      const rollbackIcon = migration.rollbackSupport ? '🔄' : '❌';
      console.log(`${statusIcon} ${migration.name} (${migration.timestamp}) ${rollbackIcon}`);
    });
    
    console.log('\nLegend: ✅ Executed | ⏳ Pending | 🔄 Rollback Support | ❌ No Rollback');
  }

  async migrate(): Promise<void> {
    await this.pipeline.migrate();
  }

  async rollback(steps: number = 1): Promise<void> {
    await this.pipeline.rollback(steps);
  }

  async generate(name: string, template: 'create_table' | 'alter_table' | 'custom' = 'custom'): Promise<void> {
    const filepath = await this.pipeline.generateMigration(name, template);
    console.log(`Migration file created: ${filepath}`);
  }
}

/**
 * Auto-migration for development
 * SQ.45: Automatic migration generation from model changes
 */
export class AutoMigration {
  private sequelize: Sequelize;
  private pipeline: MigrationPipeline;

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
    this.pipeline = new MigrationPipeline(sequelize);
  }

  /**
   * Generate migrations based on model changes
   * Compares current model definitions with database schema
   */
  async generateFromModelChanges(): Promise<string[]> {
    const queryInterface = this.sequelize.getQueryInterface();
    const generatedMigrations: string[] = [];
    
    // Get all model definitions
    const models = Object.values(this.sequelize.models);
    
    for (const model of models) {
      const tableName = model.tableName;
      const modelAttributes = model.getAttributes();
      
      try {
        // Check if table exists
        const tableExists = await queryInterface.showAllTables()
          .then(tables => tables.includes(tableName));
        
        if (!tableExists) {
          // Generate create table migration
          const migrationPath = await this.generateCreateTableMigration(model);
          generatedMigrations.push(migrationPath);
          continue;
        }
        
        // Check for column differences
        const tableInfo = await queryInterface.describeTable(tableName);
        const differences = this.compareModelWithTable(modelAttributes, tableInfo);
        
        if (differences.length > 0) {
          const migrationPath = await this.generateAlterTableMigration(model, differences);
          generatedMigrations.push(migrationPath);
        }
        
      } catch (error) {
        console.warn(`⚠️  Could not analyze table ${tableName}:`, error);
      }
    }
    
    return generatedMigrations;
  }

  private async generateCreateTableMigration(model: any): Promise<string> {
    const tableName = model.tableName;
    const attributes = model.getAttributes();
    
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
    const filename = `${timestamp}-create_${tableName}_table.ts`;
    
    // Generate migration content based on model attributes
    const content = this.generateCreateTableMigrationContent(tableName, attributes);
    
    const filepath = path.join(this.pipeline['migrationsPath'], filename);
    await fs.writeFile(filepath, content);
    
    console.log(`✅ Generated create table migration: ${filename}`);
    return filepath;
  }

  private async generateAlterTableMigration(model: any, differences: any[]): Promise<string> {
    const tableName = model.tableName;
    
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
    const filename = `${timestamp}-alter_${tableName}_table.ts`;
    
    // Generate migration content based on differences
    const content = this.generateAlterTableMigrationContent(tableName, differences);
    
    const filepath = path.join(this.pipeline['migrationsPath'], filename);
    await fs.writeFile(filepath, content);
    
    console.log(`✅ Generated alter table migration: ${filename}`);
    return filepath;
  }

  private compareModelWithTable(modelAttributes: any, tableInfo: any): any[] {
    const differences = [];
    
    // Check for new columns
    Object.keys(modelAttributes).forEach(attributeName => {
      if (!tableInfo[attributeName]) {
        differences.push({
          type: 'add_column',
          column: attributeName,
          definition: modelAttributes[attributeName]
        });
      }
    });
    
    // Check for removed columns
    Object.keys(tableInfo).forEach(columnName => {
      if (!modelAttributes[columnName]) {
        differences.push({
          type: 'remove_column',
          column: columnName
        });
      }
    });
    
    return differences;
  }

  private generateCreateTableMigrationContent(tableName: string, attributes: any): string {
    return `/**
 * Auto-generated migration: Create ${tableName} table
 * Generated: ${new Date().toISOString()}
 */
import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
  await queryInterface.createTable('${tableName}', {
    // Auto-generated from model definition
    ${Object.entries(attributes).map(([name, attr]: [string, any]) => {
      return `${name}: ${this.attributeToMigrationDefinition(attr)}`;
    }).join(',\n    ')}
  });
}

export async function down(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
  await queryInterface.dropTable('${tableName}');
}
`;
  }

  private generateAlterTableMigrationContent(tableName: string, differences: any[]): string {
    const upOperations = differences.map(diff => {
      switch (diff.type) {
        case 'add_column':
          return `  await queryInterface.addColumn('${tableName}', '${diff.column}', ${this.attributeToMigrationDefinition(diff.definition)});`;
        case 'remove_column':
          return `  await queryInterface.removeColumn('${tableName}', '${diff.column}');`;
        default:
          return `  // TODO: Handle ${diff.type}`;
      }
    }).join('\n');

    const downOperations = differences.map(diff => {
      switch (diff.type) {
        case 'add_column':
          return `  await queryInterface.removeColumn('${tableName}', '${diff.column}');`;
        case 'remove_column':
          return `  await queryInterface.addColumn('${tableName}', '${diff.column}', { /* TODO: Define column */ });`;
        default:
          return `  // TODO: Reverse ${diff.type}`;
      }
    }).reverse().join('\n');

    return `/**
 * Auto-generated migration: Alter ${tableName} table
 * Generated: ${new Date().toISOString()}
 */
import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
${upOperations}
}

export async function down(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
${downOperations}
}
`;
  }

  private attributeToMigrationDefinition(attr: any): string {
    // Convert Sequelize attribute to migration definition
    // This is a simplified version - you might need to expand this
    const type = attr.type || attr;
    return `{
      type: DataTypes.${type.toString()},
      allowNull: ${attr.allowNull !== false},
      ${attr.primaryKey ? 'primaryKey: true,' : ''}
      ${attr.autoIncrement ? 'autoIncrement: true,' : ''}
      ${attr.unique ? 'unique: true,' : ''}
      ${attr.defaultValue !== undefined ? `defaultValue: ${JSON.stringify(attr.defaultValue)},` : ''}
    }`;
  }
}

// Export singleton instance
export const migrationPipeline = new MigrationPipeline(getSequelize());
export const migrationCLI = new MigrationCLI();
