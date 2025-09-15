/**
 * Core Service Module Exports
 * Central module for all core business logic services following Google/Facebook engineering practices
 * 
 * Design Patterns:
 * - Single Responsibility Principle: Each service has one clear responsibility
 * - Dependency Injection: Services can be easily mocked and tested
 * - Interface Segregation: Small, focused interfaces
 * - Command/Query Separation: Clear separation of read and write operations
 */

// Core Interfaces and Types
export * from './types/business-logic.types';
export * from './types/service.types';

// Abstract Base Classes
export * from './base/BaseService';
export * from './base/BusinessLogicBase';

// Core Services
// export * from './services/ServiceRegistry';
// export * from './services/EventBus';
// export * from './services/ConfigurationManager';
// export * from './services/CacheManager';
// export * from './services/ErrorHandler';

// Utilities
// export * from './utils/validation.utils';
// export * from './utils/performance.utils';
// export * from './utils/retry.utils';
// export * from './utils/logger.utils';

// Middleware and Decorators
// export * from './middleware/performance.middleware';
// export * from './middleware/validation.middleware';
// export * from './middleware/error.middleware';
// export * from './decorators/cache.decorator';
// export * from './decorators/retry.decorator';
// export * from './decorators/log.decorator';