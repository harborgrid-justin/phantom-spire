/**
 * Simple In-Memory Workflow Repository Implementation
 * For demonstration and testing purposes
 */

import { 
  IWorkflowRepository, 
  IWorkflowDefinition, 
  IWorkflowInstance,
  IWorkflowInstanceFilter,
  ILogger
} from '../interfaces/IWorkflowEngine';

// Default console logger
const defaultLogger: ILogger = {
  error: (message: string, meta?: any) => console.error(message, meta),
  warn: (message: string, meta?: any) => console.warn(message, meta),
  info: (message: string, meta?: any) => console.info(message, meta),
  debug: (message: string, meta?: any) => console.debug(message, meta)
};

export class InMemoryWorkflowRepository implements IWorkflowRepository {
  private definitions: Map<string, IWorkflowDefinition[]> = new Map();
  private instances: Map<string, IWorkflowInstance> = new Map();
  private logger: ILogger;
  
  constructor(logger?: ILogger) {
    this.logger = logger || defaultLogger;
  }
  
  public async saveDefinition(definition: IWorkflowDefinition): Promise<void> {
    try {
      const key = definition.id;
      const versions = this.definitions.get(key) || [];
      
      // Remove existing version if it exists
      const existingIndex = versions.findIndex(d => d.version === definition.version);
      if (existingIndex >= 0) {
        versions[existingIndex] = definition;
      } else {
        versions.push(definition);
      }
      
      this.definitions.set(key, versions);
      
      this.logger.info('Workflow definition saved', { 
        id: definition.id, 
        version: definition.version 
      });
    } catch (error) {
      this.logger.error('Failed to save workflow definition', { 
        id: definition.id, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  public async getDefinition(id: string, version?: string): Promise<IWorkflowDefinition> {
    try {
      const versions = this.definitions.get(id);
      
      if (!versions || versions.length === 0) {
        throw new Error(`Workflow definition not found: ${id}`);
      }

      let definition: IWorkflowDefinition;
      
      if (version) {
        const versionMatch = versions.find(d => d.version === version);
        if (!versionMatch) {
          throw new Error(`Workflow definition version not found: ${id} (version: ${version})`);
        }
        definition = versionMatch;
      } else {
        // Get latest version (assuming sorted by creation date)
        const sortedVersions = versions.sort((a, b) => 
          b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime()
        );
        
        if (sortedVersions.length === 0) {
          throw new Error(`No valid workflow definition found: ${id}`);
        }
        
        definition = sortedVersions[0]!; // Non-null assertion since we checked length above
      }

      return { ...definition }; // Return a copy
    } catch (error) {
      this.logger.error('Failed to get workflow definition', { 
        id, 
        version,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  public async getDefinitions(filters?: any): Promise<IWorkflowDefinition[]> {
    try {
      const allDefinitions: IWorkflowDefinition[] = [];
      
      for (const versions of Array.from(this.definitions.values())) {
        // Get latest version of each definition
        const latest = versions.sort((a, b) => 
          b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime()
        )[0];
        
        if (latest) {
          allDefinitions.push({ ...latest });
        }
      }
      
      // Apply filters if provided
      let filteredDefinitions = allDefinitions;
      
      if (filters?.category) {
        filteredDefinitions = filteredDefinitions.filter(def => 
          def.category === filters.category
        );
      }
      
      if (filters?.tags && Array.isArray(filters.tags)) {
        filteredDefinitions = filteredDefinitions.filter(def => 
          filters.tags.some((tag: string) => def.tags.includes(tag))
        );
      }
      
      if (filters?.author) {
        filteredDefinitions = filteredDefinitions.filter(def => 
          def.metadata.author === filters.author
        );
      }
      
      return filteredDefinitions;
    } catch (error) {
      this.logger.error('Failed to get workflow definitions', { 
        filters,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  public async deleteDefinition(id: string, version?: string): Promise<void> {
    try {
      if (version) {
        // Delete specific version
        const versions = this.definitions.get(id);
        if (versions) {
          const filteredVersions = versions.filter(d => d.version !== version);
          if (filteredVersions.length === 0) {
            this.definitions.delete(id);
          } else {
            this.definitions.set(id, filteredVersions);
          }
        }
      } else {
        // Delete all versions
        this.definitions.delete(id);
      }

      this.logger.info('Workflow definition deleted', { id, version });
    } catch (error) {
      this.logger.error('Failed to delete workflow definition', { 
        id, 
        version,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  // Instance management methods
  public async saveInstance(instance: IWorkflowInstance): Promise<void> {
    try {
      this.instances.set(instance.id, { ...instance });
      
      this.logger.info('Workflow instance saved', { 
        instanceId: instance.id,
        workflowId: instance.workflowId,
        status: instance.status
      });
    } catch (error) {
      this.logger.error('Failed to save workflow instance', { 
        instanceId: instance.id, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  public async getInstance(id: string): Promise<IWorkflowInstance> {
    try {
      const instance = this.instances.get(id);
      
      if (!instance) {
        throw new Error(`Workflow instance not found: ${id}`);
      }

      return { ...instance }; // Return a copy
    } catch (error) {
      this.logger.error('Failed to get workflow instance', { 
        id,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  public async getInstances(filters?: IWorkflowInstanceFilter): Promise<IWorkflowInstance[]> {
    try {
      let instances = Array.from(this.instances.values());
      
      // Apply filters
      if (filters?.workflowId) {
        instances = instances.filter(instance => 
          instance.workflowId === filters.workflowId
        );
      }
      
      if (filters?.status && filters.status.length > 0) {
        instances = instances.filter(instance => 
          filters.status!.includes(instance.status)
        );
      }
      
      if (filters?.priority && filters.priority.length > 0) {
        instances = instances.filter(instance => 
          filters.priority!.includes(instance.priority)
        );
      }
      
      if (filters?.initiatedBy) {
        instances = instances.filter(instance => 
          instance.initiatedBy === filters.initiatedBy
        );
      }
      
      if (filters?.startedAfter) {
        instances = instances.filter(instance => 
          instance.startedAt >= filters.startedAfter!
        );
      }
      
      if (filters?.startedBefore) {
        instances = instances.filter(instance => 
          instance.startedAt <= filters.startedBefore!
        );
      }
      
      // Sort by start date (latest first)
      instances.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
      
      // Apply pagination
      if (filters?.offset) {
        instances = instances.slice(filters.offset);
      }
      
      if (filters?.limit) {
        instances = instances.slice(0, filters.limit);
      }
      
      return instances.map(instance => ({ ...instance })); // Return copies
    } catch (error) {
      this.logger.error('Failed to get workflow instances', { 
        filters,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  public async updateInstance(id: string, updates: Partial<IWorkflowInstance>): Promise<void> {
    try {
      const existing = this.instances.get(id);
      
      if (!existing) {
        throw new Error(`Workflow instance not found: ${id}`);
      }

      const updated = { ...existing, ...updates };
      this.instances.set(id, updated);
      
      this.logger.debug('Workflow instance updated', { 
        instanceId: id,
        updates: Object.keys(updates)
      });
    } catch (error) {
      this.logger.error('Failed to update workflow instance', { 
        id, 
        updates,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  // Utility methods for testing and management
  public async clear(): Promise<void> {
    this.definitions.clear();
    this.instances.clear();
    this.logger.info('Repository cleared');
  }

  public async getStats(): Promise<{
    definitionsCount: number;
    instancesCount: number;
    definitions: Array<{ id: string; versionsCount: number }>;
  }> {
    const definitionStats = Array.from(this.definitions.entries()).map(([id, versions]) => ({
      id,
      versionsCount: versions.length
    }));

    return {
      definitionsCount: this.definitions.size,
      instancesCount: this.instances.size,
      definitions: definitionStats
    };
  }
}