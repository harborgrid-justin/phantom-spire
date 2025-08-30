/**
 * Simple In-Memory Workflow Repository Implementation
 * For demonstration and testing purposes
 */

import { 
  IWorkflowRepository, 
  IWorkflowDefinition, 
  IWorkflowInstance,
  IWorkflowInstanceFilter
} from '../interfaces/IWorkflowEngine';
import { logger } from '../../utils/logger';

export class InMemoryWorkflowRepository implements IWorkflowRepository {
  private definitions: Map<string, IWorkflowDefinition[]> = new Map();
  private instances: Map<string, IWorkflowInstance> = new Map();
  
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
      
      logger.info('Workflow definition saved', { 
        id: definition.id, 
        version: definition.version 
      });
    } catch (error) {
      logger.error('Failed to save workflow definition', { 
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
      logger.error('Failed to get workflow definition', { 
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
      logger.error('Failed to get workflow definitions', { 
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

      logger.info('Workflow definition deleted', { id, version });
    } catch (error) {
      logger.error('Failed to delete workflow definition', { 
        id, 
        version,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  public async saveInstance(instance: IWorkflowInstance): Promise<void> {
    try {
      this.instances.set(instance.id, { ...instance });
      logger.debug('Workflow instance saved', { instanceId: instance.id });
    } catch (error) {
      logger.error('Failed to save workflow instance', { 
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
      logger.error('Failed to get workflow instance', { 
        instanceId: id,
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
        instances = instances.filter(inst => inst.workflowId === filters.workflowId);
      }
      
      if (filters?.status && filters.status.length > 0) {
        instances = instances.filter(inst => filters.status!.includes(inst.status));
      }
      
      if (filters?.priority && filters.priority.length > 0) {
        instances = instances.filter(inst => filters.priority!.includes(inst.priority));
      }
      
      if (filters?.initiatedBy) {
        instances = instances.filter(inst => inst.initiatedBy === filters.initiatedBy);
      }
      
      if (filters?.startedAfter) {
        instances = instances.filter(inst => inst.startedAt >= filters.startedAfter!);
      }
      
      if (filters?.startedBefore) {
        instances = instances.filter(inst => inst.startedAt <= filters.startedBefore!);
      }
      
      // Sort by startedAt desc
      instances.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
      
      // Apply pagination
      const offset = filters?.offset || 0;
      const limit = filters?.limit || 100;
      
      instances = instances.slice(offset, offset + limit);
      
      // Return copies
      return instances.map(inst => ({ ...inst }));
    } catch (error) {
      logger.error('Failed to get workflow instances', { 
        filters,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  public async updateInstance(id: string, updates: Partial<IWorkflowInstance>): Promise<void> {
    try {
      const instance = this.instances.get(id);
      
      if (!instance) {
        throw new Error(`Workflow instance not found: ${id}`);
      }

      // Merge updates
      const updatedInstance = { ...instance, ...updates };
      this.instances.set(id, updatedInstance);

      logger.debug('Workflow instance updated', { instanceId: id });
    } catch (error) {
      logger.error('Failed to update workflow instance', { 
        instanceId: id, 
        error: (error as Error).message 
      });
      throw error;
    }
  }
}