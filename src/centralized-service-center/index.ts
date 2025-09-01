/**
 * Centralized System Service Center Module Exports
 * Fortune 100-Grade Platform Service Hub
 */

// Core service center
export { CentralizedSystemServiceCenter, centralizedServiceCenter } from './core/CentralizedSystemServiceCenter';

// Interfaces
export * from './interfaces/ICentralizedServiceCenter';

// Re-export for convenience
export { CentralizedSystemServiceCenter as ServiceCenter } from './core/CentralizedSystemServiceCenter';
export { centralizedServiceCenter as serviceCenter } from './core/CentralizedSystemServiceCenter';