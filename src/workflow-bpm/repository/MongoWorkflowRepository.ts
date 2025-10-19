/**
 * MongoDB Workflow Repository Implementation
 * Fortune 100-Grade persistence layer for workflow definitions and instances with app-specific logger
 */

import {
  IWorkflowDefinition,
  IWorkflowInstance,
} from '../interfaces/IWorkflowEngine.js';
import { logger } from '../../utils/logger.js';
import { WorkflowDefinition } from '../../models/WorkflowDefinition.js';
import { WorkflowInstance } from '../../models/WorkflowInstance.js';

export class MongoWorkflowRepository {
  private logger: typeof logger;

  constructor(loggerInstance: typeof logger) {
    this.logger = loggerInstance;
  }

  async saveWorkflowDefinition(definition: IWorkflowDefinition): Promise<void> {
    this.logger.info(`Saving workflow definition: ${definition.id}`);
    try {
      await WorkflowDefinition.findOneAndUpdate(
        { id: definition.id },
        definition,
        { upsert: true, new: true }
      );
      this.logger.info(`Workflow definition saved: ${definition.id}`);
    } catch (error) {
      this.logger.error(`Error saving workflow definition ${definition.id}:`, error);
      throw error;
    }
  }

  async getWorkflowDefinition(id: string): Promise<IWorkflowDefinition | null> {
    this.logger.info(`Retrieving workflow definition: ${id}`);
    try {
      const doc = await WorkflowDefinition.findOne({ id }).lean();
      return doc as IWorkflowDefinition | null;
    } catch (error) {
      this.logger.error(`Error retrieving workflow definition ${id}:`, error);
      throw error;
    }
  }

  async getAllWorkflowDefinitions(): Promise<IWorkflowDefinition[]> {
    this.logger.info('Retrieving all workflow definitions');
    try {
      const docs = await WorkflowDefinition.find().lean();
      return docs as IWorkflowDefinition[];
    } catch (error) {
      this.logger.error('Error retrieving all workflow definitions:', error);
      throw error;
    }
  }

  async saveWorkflowInstance(instance: IWorkflowInstance): Promise<void> {
    this.logger.info(`Saving workflow instance: ${instance.id}`);
    try {
      await WorkflowInstance.findOneAndUpdate(
        { id: instance.id },
        instance,
        { upsert: true, new: true }
      );
      this.logger.info(`Workflow instance saved: ${instance.id}`);
    } catch (error) {
      this.logger.error(`Error saving workflow instance ${instance.id}:`, error);
      throw error;
    }
  }

  async getWorkflowInstance(id: string): Promise<IWorkflowInstance | null> {
    this.logger.info(`Retrieving workflow instance: ${id}`);
    try {
      const doc = await WorkflowInstance.findOne({ id }).lean();
      return doc as IWorkflowInstance | null;
    } catch (error) {
      this.logger.error(`Error retrieving workflow instance ${id}:`, error);
      throw error;
    }
  }

  async getWorkflowInstancesByWorkflowId(
    workflowId: string
  ): Promise<IWorkflowInstance[]> {
    this.logger.info(
      `Retrieving workflow instances for workflow: ${workflowId}`
    );
    try {
      const docs = await WorkflowInstance.find({ workflowId }).lean();
      return docs as IWorkflowInstance[];
    } catch (error) {
      this.logger.error(`Error retrieving workflow instances for ${workflowId}:`, error);
      throw error;
    }
  }

  async updateWorkflowInstanceStatus(
    id: string,
    status: string
  ): Promise<void> {
    this.logger.info(`Updating workflow instance ${id} status to: ${status}`);
    try {
      await WorkflowInstance.findOneAndUpdate(
        { id },
        { status, updatedAt: new Date() },
        { new: true }
      );
      this.logger.info(`Workflow instance ${id} status updated to: ${status}`);
    } catch (error) {
      this.logger.error(`Error updating workflow instance ${id} status:`, error);
      throw error;
    }
  }

  async deleteWorkflowDefinition(id: string): Promise<void> {
    this.logger.info(`Deleting workflow definition: ${id}`);
    try {
      await WorkflowDefinition.deleteOne({ id });
      this.logger.info(`Workflow definition deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting workflow definition ${id}:`, error);
      throw error;
    }
  }

  async deleteWorkflowInstance(id: string): Promise<void> {
    this.logger.info(`Deleting workflow instance: ${id}`);
    try {
      await WorkflowInstance.deleteOne({ id });
      this.logger.info(`Workflow instance deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting workflow instance ${id}:`, error);
      throw error;
    }
  }
}
