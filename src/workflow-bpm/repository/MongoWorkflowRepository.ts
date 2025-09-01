/**
 * MongoDB Workflow Repository Implementation
 * Fortune 100-Grade persistence layer for workflow definitions and instances with app-specific logger
 */

import { MongoWorkflowRepository as GenericMongoWorkflowRepository } from '../../generic/workflow-bpm/repository/MongoWorkflowRepository';
import { logger } from '../../utils/logger';

// Export a configured instance with app-specific logger
export const MongoWorkflowRepository = class extends GenericMongoWorkflowRepository {
  constructor() {
    super(logger);
  }
};