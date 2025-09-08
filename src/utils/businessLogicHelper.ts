import { v4 as uuidv4 } from 'uuid';
import { BusinessLogicRequest } from '../services/business-logic/core/BusinessLogicManager.js';

export const createBusinessLogicRequest = (
  serviceId: string,
  operation: string,
  payload: any,
  userId?: string,
  priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  context?: Record<string, any>
): BusinessLogicRequest => {
  return {
    id: uuidv4(),
    serviceId,
    operation,
    payload,
    userId,
    timestamp: new Date(),
    priority,
    context: {
      ...context,
      userId,
      timestamp: new Date()
    }
  };
};