/**
 * DTO SYNCHRONIZATION PIPELINE
 * Automatic synchronization between Sequelize models and DTOs (SQ.46)
 */
import { promises as fs } from 'fs';
import * as path from 'path';
import { getSequelize } from '../sequelize';
import { models } from '../models';

export interface DTOField {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
  validation?: string[];
  example?: any;
}

export interface DTODefinition {
  name: string;
  description: string;
  fields: DTOField[];
  extends?: string;
  implements?: string[];
}

/**
 * DTO Generator and Synchronizer
 * SQ.46: Ensures DTOs stay synchronized with model definitions
 */
export class DTOSyncPipeline {
  private modelsPath: string;
  private dtoPath: string;
  private apiPath: string;

  constructor(
    modelsPath: string = path.join(__dirname, '../models'),
    dtoPath: string = path.join(__dirname, '../../types/dto'),
    apiPath: string = path.join(__dirname, '../../app/api')
  ) {
    this.modelsPath = modelsPath;
    this.dtoPath = dtoPath;
    this.apiPath = apiPath;
  }

  /**
   * Generate DTOs from all Sequelize models
   */
  async generateAllDTOs(): Promise<void> {
    console.log('🔄 Generating DTOs from Sequelize models...');
    
    // Ensure DTO directory exists
    await fs.mkdir(this.dtoPath, { recursive: true });
    
    const sequelize = await getSequelize();
    const modelList = Object.values(sequelize.models);
    
    for (const model of modelList) {
      await this.generateModelDTO(model);
    }
    
    // Generate index file
    await this.generateDTOIndex(modelList);
    
    // Generate API request/response DTOs
    await this.generateAPIRequestDTOs(modelList);
    
    console.log(`✅ Generated DTOs for ${modelList.length} models`);
  }

  /**
   * Generate DTO for a specific model
   */
  private async generateModelDTO(model: any): Promise<void> {
    const modelName = model.name;
    const tableName = model.tableName;
    const attributes = model.getAttributes();
    
    // Generate base interfaces
    const baseInterface = this.generateBaseInterface(modelName, attributes);
    const creationInterface = this.generateCreationInterface(modelName, attributes);
    const updateInterface = this.generateUpdateInterface(modelName, attributes);
    const filterInterface = this.generateFilterInterface(modelName, attributes);
    
    // Generate API DTOs
    const apiDTOs = this.generateAPIDTOs(modelName, attributes);
    
    const content = `/**
 * ${modelName.toUpperCase()} DTOs
 * Auto-generated from Sequelize model: ${modelName}
 * Table: ${tableName}
 * Generated: ${new Date().toISOString()}
 * 
 * SQ.46: DTOs synchronized with model definitions
 */

${baseInterface}

${creationInterface}

${updateInterface}

${filterInterface}

${apiDTOs}

/**
 * DTO Validation Schemas
 */
export const ${modelName}ValidationSchemas = {
  create: {
    ${this.generateValidationSchema(attributes, 'create')}
  },
  update: {
    ${this.generateValidationSchema(attributes, 'update')}
  },
  filter: {
    ${this.generateValidationSchema(attributes, 'filter')}
  }
};

/**
 * DTO Transformation Utilities
 */
export class ${modelName}DTOTransformer {
  /**
   * Transform Sequelize model instance to DTO
   */
  static toDTO(model: any): ${modelName}DTO {
    return {
      ${Object.keys(attributes).map(attr => `${attr}: model.${attr}`).join(',\n      ')}
    };
  }

  /**
   * Transform DTO to model creation attributes
   */
  static toCreationAttributes(dto: Create${modelName}DTO): ${modelName}CreationAttributes {
    return {
      ${this.getCreationAttributesMapping(attributes)}
    };
  }

  /**
   * Transform DTO to model update attributes
   */
  static toUpdateAttributes(dto: Update${modelName}DTO): Partial<${modelName}Attributes> {
    const updateData: Partial<${modelName}Attributes> = {};
    
    ${this.getUpdateAttributesMapping(attributes)}
    
    return updateData;
  }

  /**
   * Transform filter DTO to Sequelize where clause
   */
  static toWhereClause(filter: ${modelName}FilterDTO): any {
    const where: any = {};
    
    ${this.getWhereClauseMapping(attributes)}
    
    return where;
  }

  /**
   * Validate DTO against schema
   */
  static validate(dto: any, schema: 'create' | 'update' | 'filter'): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const schemaRules = ${modelName}ValidationSchemas[schema];
    
    // Basic validation implementation
    Object.keys(schemaRules).forEach(field => {
      const rules = schemaRules[field];
      const value = dto[field];
      
      if (rules.required && (value === undefined || value === null)) {
        errors.push(\`Field '\${field}' is required\`);
      }
      
      if (rules.type && value !== undefined && typeof value !== rules.type) {
        errors.push(\`Field '\${field}' must be of type \${rules.type}\`);
      }
      
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(\`Field '\${field}' must be at least \${rules.minLength} characters long\`);
      }
      
      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(\`Field '\${field}' must be at most \${rules.maxLength} characters long\`);
      }
    });
    
    return { valid: errors.length === 0, errors };
  }
}

/**
 * ${modelName} DTO Factory for Testing
 */
export class ${modelName}DTOFactory {
  static createValid(): Create${modelName}DTO {
    return {
      ${this.generateFactoryData(attributes, 'create')}
    };
  }

  static createPartialUpdate(): Update${modelName}DTO {
    return {
      ${this.generateFactoryData(attributes, 'update')}
    };
  }

  static createFilter(): ${modelName}FilterDTO {
    return {
      ${this.generateFactoryData(attributes, 'filter')}
    };
  }
}
`;

    const filename = `${modelName}.dto.ts`;
    const filepath = path.join(this.dtoPath, filename);
    await fs.writeFile(filepath, content);
    
    console.log(`✅ Generated DTO: ${filename}`);
  }

  /**
   * Generate base interface for model
   */
  private generateBaseInterface(modelName: string, attributes: any): string {
    const fields = Object.entries(attributes).map(([name, attr]: [string, any]) => {
      const type = this.sequelizeTypeToTSType(attr.type || attr);
      const optional = attr.allowNull !== false ? '?' : '';
      const comment = attr.comment || `${name} field`;
      
      return `  /** ${comment} */\n  ${name}${optional}: ${type};`;
    }).join('\n\n');

    return `/**
 * Base ${modelName} DTO Interface
 * Represents the complete ${modelName} entity
 */
export interface ${modelName}DTO {
${fields}
}

/**
 * ${modelName} Attributes (same as DTO but for internal use)
 */
export interface ${modelName}Attributes extends ${modelName}DTO {}`;
  }

  /**
   * Generate creation interface
   */
  private generateCreationInterface(modelName: string, attributes: any): string {
    const requiredFields: string[] = [];
    const optionalFields: string[] = [];
    
    Object.entries(attributes).forEach(([name, attr]: [string, any]) => {
      const type = this.sequelizeTypeToTSType(attr.type || attr);
      const comment = attr.comment || `${name} field`;
      
      if (name === 'id' || name === 'created_at' || name === 'updated_at') {
        return; // Skip auto-generated fields
      }
      
      const fieldDef = `  /** ${comment} */\n  ${name}: ${type};`;
      
      if (attr.allowNull === false && !attr.defaultValue) {
        requiredFields.push(fieldDef);
      } else {
        optionalFields.push(`  /** ${comment} */\n  ${name}?: ${type};`);
      }
    });

    return `/**
 * ${modelName} Creation DTO
 * Used for creating new ${modelName} entities
 */
export interface Create${modelName}DTO {
${requiredFields.join('\n\n')}

${optionalFields.length > 0 ? optionalFields.join('\n\n') : ''}
}

/**
 * ${modelName} Creation Attributes (internal)
 */
export interface ${modelName}CreationAttributes extends Create${modelName}DTO {}`;
  }

  /**
   * Generate update interface
   */
  private generateUpdateInterface(modelName: string, attributes: any): string {
    const fields = Object.entries(attributes).map(([name, attr]: [string, any]) => {
      if (name === 'id' || name === 'created_at') {
        return null; // Skip immutable fields
      }
      
      const type = this.sequelizeTypeToTSType(attr.type || attr);
      const comment = attr.comment || `${name} field`;
      
      return `  /** ${comment} */\n  ${name}?: ${type};`;
    }).filter(Boolean).join('\n\n');

    return `/**
 * ${modelName} Update DTO
 * Used for updating existing ${modelName} entities
 */
export interface Update${modelName}DTO {
${fields}
}`;
  }

  /**
   * Generate filter interface
   */
  private generateFilterInterface(modelName: string, attributes: any): string {
    const fields = Object.entries(attributes).map(([name, attr]: [string, any]) => {
      const type = this.sequelizeTypeToTSType(attr.type || attr);
      const comment = `Filter by ${name}`;
      
      // Generate filter types based on attribute type
      let filterType = type;
      if (type === 'string') {
        filterType = `string | { contains?: string; startsWith?: string; endsWith?: string; }`;
      } else if (type === 'number') {
        filterType = `number | { gt?: number; gte?: number; lt?: number; lte?: number; }`;
      } else if (type === 'Date') {
        filterType = `Date | { gt?: Date; gte?: Date; lt?: Date; lte?: Date; }`;
      }
      
      return `  /** ${comment} */\n  ${name}?: ${filterType};`;
    }).join('\n\n');

    return `/**
 * ${modelName} Filter DTO
 * Used for filtering ${modelName} queries
 */
export interface ${modelName}FilterDTO {
${fields}
  
  /** Pagination: limit results */
  limit?: number;
  
  /** Pagination: offset results */
  offset?: number;
  
  /** Sort by field */
  sortBy?: keyof ${modelName}DTO;
  
  /** Sort direction */
  sortOrder?: 'ASC' | 'DESC';
}`;
  }

  /**
   * Generate API-specific DTOs
   */
  private generateAPIDTOs(modelName: string, attributes: any): string {
    return `/**
 * API Request/Response DTOs
 */

/**
 * API Request: Get ${modelName}
 */
export interface Get${modelName}RequestDTO {
  id: number;
}

/**
 * API Response: Get ${modelName}
 */
export interface Get${modelName}ResponseDTO {
  success: boolean;
  data?: ${modelName}DTO;
  error?: string;
}

/**
 * API Request: List ${modelName}s
 */
export interface List${modelName}sRequestDTO extends ${modelName}FilterDTO {
  page?: number;
  pageSize?: number;
}

/**
 * API Response: List ${modelName}s
 */
export interface List${modelName}sResponseDTO {
  success: boolean;
  data?: {
    items: ${modelName}DTO[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  error?: string;
}

/**
 * API Request: Create ${modelName}
 */
export interface Create${modelName}RequestDTO extends Create${modelName}DTO {}

/**
 * API Response: Create ${modelName}
 */
export interface Create${modelName}ResponseDTO {
  success: boolean;
  data?: ${modelName}DTO;
  error?: string;
}

/**
 * API Request: Update ${modelName}
 */
export interface Update${modelName}RequestDTO extends Update${modelName}DTO {
  id: number;
}

/**
 * API Response: Update ${modelName}
 */
export interface Update${modelName}ResponseDTO {
  success: boolean;
  data?: ${modelName}DTO;
  error?: string;
}

/**
 * API Request: Delete ${modelName}
 */
export interface Delete${modelName}RequestDTO {
  id: number;
}

/**
 * API Response: Delete ${modelName}
 */
export interface Delete${modelName}ResponseDTO {
  success: boolean;
  error?: string;
}`;
  }

  /**
   * Convert Sequelize type to TypeScript type
   */
  private sequelizeTypeToTSType(sequelizeType: any): string {
    const typeString = sequelizeType.toString().toLowerCase();
    
    if (typeString.includes('varchar') || typeString.includes('text') || typeString.includes('string')) {
      return 'string';
    }
    if (typeString.includes('integer') || typeString.includes('bigint') || typeString.includes('decimal') || typeString.includes('float')) {
      return 'number';
    }
    if (typeString.includes('boolean')) {
      return 'boolean';
    }
    if (typeString.includes('date') || typeString.includes('time')) {
      return 'Date';
    }
    if (typeString.includes('jsonb') || typeString.includes('json')) {
      return 'Record<string, any>';
    }
    if (typeString.includes('array')) {
      return 'any[]';
    }
    if (typeString.includes('enum')) {
      // Extract enum values if available
      return 'string';
    }
    
    return 'any';
  }

  /**
   * Generate validation schema
   */
  private generateValidationSchema(attributes: any, type: 'create' | 'update' | 'filter'): string {
    const rules = Object.entries(attributes).map(([name, attr]: [string, any]) => {
      if (type === 'create' && (name === 'id' || name === 'created_at' || name === 'updated_at')) {
        return null;
      }
      if (type === 'update' && (name === 'id' || name === 'created_at')) {
        return null;
      }
      
      const tsType = this.sequelizeTypeToTSType(attr.type || attr);
      const required = type === 'create' && attr.allowNull === false && !attr.defaultValue;
      
      let validation = `required: ${required}`;
      validation += `, type: '${tsType}'`;
      
      if (attr.validate) {
        if (attr.validate.len) {
          validation += `, minLength: ${attr.validate.len[0]}, maxLength: ${attr.validate.len[1]}`;
        }
        if (attr.validate.min) {
          validation += `, min: ${attr.validate.min}`;
        }
        if (attr.validate.max) {
          validation += `, max: ${attr.validate.max}`;
        }
      }
      
      return `${name}: { ${validation} }`;
    }).filter(Boolean).join(',\n    ');

    return rules;
  }

  /**
   * Generate creation attributes mapping
   */
  private getCreationAttributesMapping(attributes: any): string {
    return Object.keys(attributes)
      .filter(name => name !== 'id' && name !== 'created_at' && name !== 'updated_at')
      .map(name => `${name}: dto.${name}`)
      .join(',\n      ');
  }

  /**
   * Generate update attributes mapping
   */
  private getUpdateAttributesMapping(attributes: any): string {
    return Object.keys(attributes)
      .filter(name => name !== 'id' && name !== 'created_at')
      .map(name => `if (dto.${name} !== undefined) updateData.${name} = dto.${name};`)
      .join('\n    ');
  }

  /**
   * Generate where clause mapping
   */
  private getWhereClauseMapping(attributes: any): string {
    return Object.keys(attributes)
      .map(name => {
        const attr = attributes[name];
        const tsType = this.sequelizeTypeToTSType(attr.type || attr);
        
        if (tsType === 'string') {
          return `if (filter.${name}) {
      if (typeof filter.${name} === 'string') {
        where.${name} = filter.${name};
      } else {
        const stringFilter = filter.${name} as any;
        if (stringFilter.contains) where.${name} = { [Op.like]: \`%\${stringFilter.contains}%\` };
        if (stringFilter.startsWith) where.${name} = { [Op.like]: \`\${stringFilter.startsWith}%\` };
        if (stringFilter.endsWith) where.${name} = { [Op.like]: \`%\${stringFilter.endsWith}\` };
      }
    }`;
        } else if (tsType === 'number' || tsType === 'Date') {
          return `if (filter.${name}) {
      if (typeof filter.${name} === '${tsType === 'number' ? 'number' : 'object'}') {
        where.${name} = filter.${name};
      } else {
        const rangeFilter = filter.${name} as any;
        if (rangeFilter.gt !== undefined) where.${name} = { ...where.${name}, [Op.gt]: rangeFilter.gt };
        if (rangeFilter.gte !== undefined) where.${name} = { ...where.${name}, [Op.gte]: rangeFilter.gte };
        if (rangeFilter.lt !== undefined) where.${name} = { ...where.${name}, [Op.lt]: rangeFilter.lt };
        if (rangeFilter.lte !== undefined) where.${name} = { ...where.${name}, [Op.lte]: rangeFilter.lte };
      }
    }`;
        } else {
          return `if (filter.${name} !== undefined) where.${name} = filter.${name};`;
        }
      })
      .join('\n    ');
  }

  /**
   * Generate factory test data
   */
  private generateFactoryData(attributes: any, type: 'create' | 'update' | 'filter'): string {
    return Object.entries(attributes)
      .filter(([name]) => {
        if (type === 'create') return name !== 'id' && name !== 'created_at' && name !== 'updated_at';
        if (type === 'update') return name !== 'id' && name !== 'created_at';
        return true;
      })
      .map(([name, attr]: [string, any]) => {
        const tsType = this.sequelizeTypeToTSType(attr.type || attr);
        let value = 'undefined';
        
        if (type === 'create' && attr.allowNull === false && !attr.defaultValue) {
          // Required field, generate sample data
          if (tsType === 'string') {
            value = `'sample_${name}'`;
          } else if (tsType === 'number') {
            value = '1';
          } else if (tsType === 'boolean') {
            value = 'true';
          } else if (tsType === 'Date') {
            value = 'new Date()';
          } else if (tsType === 'Record<string, any>') {
            value = '{}';
          } else if (tsType === 'any[]') {
            value = '[]';
          }
        } else if (type === 'filter') {
          // Generate sample filter values
          if (tsType === 'string') {
            value = `'sample'`;
          } else if (tsType === 'number') {
            value = '1';
          }
        }
        
        return type === 'filter' && value === 'undefined' ? null : `${name}: ${value}`;
      })
      .filter(Boolean)
      .join(',\n      ');
  }

  /**
   * Generate DTO index file
   */
  private async generateDTOIndex(models: any[]): Promise<void> {
    const exports = models.map(model => {
      const modelName = model.name;
      return `export * from './${modelName}.dto';`;
    }).join('\n');

    const content = `/**
 * DTO INDEX FILE
 * Auto-generated exports for all DTOs
 * Generated: ${new Date().toISOString()}
 */

${exports}

/**
 * Common DTO Types
 */
export interface PaginationDTO {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponseDTO<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface FilterOptionsDTO {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
`;

    await fs.writeFile(path.join(this.dtoPath, 'index.ts'), content);
    console.log('✅ Generated DTO index file');
  }

  /**
   * Generate API request DTOs for all endpoints
   */
  private async generateAPIRequestDTOs(models: any[]): Promise<void> {
    const apiDtoPath = path.join(this.dtoPath, 'api');
    await fs.mkdir(apiDtoPath, { recursive: true });

    for (const model of models) {
      const modelName = model.name;
      
      const content = `/**
 * ${modelName.toUpperCase()} API DTOs
 * Request/Response DTOs for ${modelName} API endpoints
 * Generated: ${new Date().toISOString()}
 */

import { 
  ${modelName}DTO, 
  Create${modelName}DTO, 
  Update${modelName}DTO, 
  ${modelName}FilterDTO 
} from '../${modelName}.dto';
import { ApiResponseDTO, PaginationDTO } from '../index';

/**
 * ${modelName} API Request DTOs
 */
export namespace ${modelName}API {
  export interface GetRequest {
    id: number;
  }

  export interface GetResponse extends ApiResponseDTO<${modelName}DTO> {}

  export interface ListRequest extends ${modelName}FilterDTO {
    page?: number;
    pageSize?: number;
  }

  export interface ListResponse extends ApiResponseDTO<{
    items: ${modelName}DTO[];
    pagination: PaginationDTO;
  }> {}

  export interface CreateRequest extends Create${modelName}DTO {}

  export interface CreateResponse extends ApiResponseDTO<${modelName}DTO> {}

  export interface UpdateRequest extends Update${modelName}DTO {
    id: number;
  }

  export interface UpdateResponse extends ApiResponseDTO<${modelName}DTO> {}

  export interface DeleteRequest {
    id: number;
  }

  export interface DeleteResponse extends ApiResponseDTO<null> {}
}
`;

      await fs.writeFile(path.join(apiDtoPath, `${modelName}.api.dto.ts`), content);
    }

    // Generate API index
    const apiExports = models.map(model => 
      `export * from './${model.name}.api.dto';`
    ).join('\n');
    
    await fs.writeFile(path.join(apiDtoPath, 'index.ts'), `/**
 * API DTO INDEX
 * Generated: ${new Date().toISOString()}
 */

${apiExports}
`);

    console.log('✅ Generated API DTOs');
  }

  /**
   * Verify DTO synchronization
   * Checks if DTOs are up to date with models
   */
  async verifySynchronization(): Promise<{ synchronized: boolean; issues: string[] }> {
    const issues: string[] = [];
    const sequelize = await getSequelize();
    const modelList = Object.values(sequelize.models);

    for (const model of modelList) {
      const modelName = model.name;
      const dtoPath = path.join(this.dtoPath, `${modelName}.dto.ts`);
      
      try {
        const dtoContent = await fs.readFile(dtoPath, 'utf-8');
        const attributes = model.getAttributes();
        
        // Basic check - ensure all model attributes are present in DTO
        for (const attributeName of Object.keys(attributes)) {
          if (!dtoContent.includes(attributeName)) {
            issues.push(`${modelName}: Missing attribute '${attributeName}' in DTO`);
          }
        }
      } catch (error) {
        issues.push(`${modelName}: DTO file not found or inaccessible`);
      }
    }

    return {
      synchronized: issues.length === 0,
      issues
    };
  }
}

/**
 * DTO Sync CLI
 */
export class DTOSyncCLI {
  private pipeline: DTOSyncPipeline;

  constructor() {
    this.pipeline = new DTOSyncPipeline();
  }

  async generate(): Promise<void> {
    console.log('🔄 Generating all DTOs from models...');
    await this.pipeline.generateAllDTOs();
    console.log('✅ DTO generation complete');
  }

  async verify(): Promise<void> {
    console.log('🔄 Verifying DTO synchronization...');
    const result = await this.pipeline.verifySynchronization();
    
    if (result.synchronized) {
      console.log('✅ All DTOs are synchronized with models');
    } else {
      console.log('❌ DTO synchronization issues found:');
      result.issues.forEach(issue => console.log(`  - ${issue}`));
    }
  }
}

// Export singleton
export const dtoSyncPipeline = new DTOSyncPipeline();
export const dtoSyncCLI = new DTOSyncCLI();
