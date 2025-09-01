/**
 * Centralized System Service Center Module Exports
 * Fortune 100-Grade Platform Service Hub
 */

// Core service center
export {
  CentralizedSystemServiceCenter,
  centralizedServiceCenter,
} from './core/CentralizedSystemServiceCenter.js';

// Interfaces
export * from './interfaces/ICentralizedServiceCenter.js';

// Re-export for convenience
export { CentralizedSystemServiceCenter as ServiceCenter } from './core/CentralizedSystemServiceCenter.js';
export { centralizedServiceCenter as serviceCenter } from './core/CentralizedSystemServiceCenter.js';
