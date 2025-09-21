/**
 * Enterprise Validation Schemas
 * Comprehensive validation using Yup with enterprise-grade patterns
 */

import * as yup from 'yup';

// Common validation patterns
const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s()-]{10,}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  URL: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/,
  SEMANTIC_VERSION: /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?:[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
  HASH_SHA256: /^[a-fA-F0-9]{64}$/,
  HASH_MD5: /^[a-fA-F0-9]{32}$/
};

// Custom validators
const createCustomValidators = () => {
  // Strong password validation
  (yup.string as any).strongPassword = function() {
    return this.test('strong-password', 'Password must be at least 8 characters with uppercase, lowercase, number, and special character', function(value: string) {
      if (!value) return false;
      
      const hasMinLength = value.length >= 8;
      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      
      return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
    });
  };

  // CVE ID validation
  (yup.string as any).cveId = function() {
    return this.matches(/^CVE-\d{4}-\d{4,}$/, 'Must be a valid CVE ID (e.g., CVE-2023-1234)');
  };

  // MITRE technique ID validation
  (yup.string as any).mitreId = function() {
    return this.matches(/^T\d{4}(?:\.\d{3})?$/, 'Must be a valid MITRE ATT&CK technique ID (e.g., T1055.001)');
  };

  // IOC type validation
  (yup.string as any).iocType = function() {
    const validTypes = ['ip', 'domain', 'url', 'hash', 'email', 'file', 'registry', 'mutex'];
    return this.oneOf(validTypes, 'Must be a valid IOC type');
  };

  // Threat level validation
  (yup.string as any).threatLevel = function() {
    return this.oneOf(['low', 'medium', 'high', 'critical'], 'Must be a valid threat level');
  };

  // Model status validation
  (yup.string as any).modelStatus = function() {
    return this.oneOf(['draft', 'training', 'trained', 'deployed', 'archived', 'failed'], 'Must be a valid model status');
  };
};

// Initialize custom validators
createCustomValidators();

// Base schemas
export const BaseEntitySchema = yup.object({
  id: yup.string().matches(PATTERNS.UUID, 'Invalid UUID format').optional(),
  createdAt: yup.date().optional(),
  updatedAt: yup.date().optional(),
  createdBy: yup.string().optional(),
  updatedBy: yup.string().optional()
});

// User schemas
export const UserRegistrationSchema = yup.object({
  email: yup.string()
    .matches(PATTERNS.EMAIL, 'Invalid email format')
    .required('Email is required')
    .max(255, 'Email must be less than 255 characters'),
  password: yup.string()
    .test('strong-password', 'Password must be at least 8 characters with uppercase, lowercase, number, and special character', (value) => {
      if (!value) return false;
      const hasMinLength = value.length >= 8;
      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
    })
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Password confirmation is required'),
  firstName: yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  lastName: yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  phone: yup.string()
    .matches(PATTERNS.PHONE, 'Invalid phone number format')
    .optional(),
  role: yup.string()
    .oneOf(['admin', 'analyst', 'operator', 'viewer'], 'Invalid role')
    .default('viewer'),
  permissions: yup.array(yup.string()).optional()
});

export const LoginSchema = yup.object({
  email: yup.string()
    .matches(PATTERNS.EMAIL, 'Invalid email format')
    .required('Email is required'),
  password: yup.string()
    .required('Password is required'),
  rememberMe: yup.boolean().optional()
});

// ML Model schemas
export const MLModelSchema = BaseEntitySchema.shape({
  name: yup.string()
    .min(3, 'Model name must be at least 3 characters')
    .max(100, 'Model name must be less than 100 characters')
    .required('Model name is required'),
  description: yup.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  type: yup.string()
    .oneOf(['classification', 'regression', 'clustering', 'anomaly_detection', 'time_series'], 'Invalid model type')
    .required('Model type is required'),
  algorithm: yup.string()
    .oneOf(['random_forest', 'svm', 'neural_network', 'gradient_boosting', 'linear_regression', 'logistic_regression'], 'Invalid algorithm')
    .required('Algorithm is required'),
  status: yup.string()
    .oneOf(['draft', 'training', 'trained', 'deployed', 'archived', 'failed'], 'Must be a valid model status')
    .required('Status is required'),
  accuracy: yup.number()
    .min(0, 'Accuracy must be between 0 and 1')
    .max(1, 'Accuracy must be between 0 and 1')
    .optional(),
  parameters: yup.object().optional(),
  version: yup.string()
    .matches(PATTERNS.SEMANTIC_VERSION, 'Invalid semantic version format')
    .default('1.0.0'),
  tags: yup.array(yup.string().max(50, 'Tag must be less than 50 characters')).optional()
});

// API request schemas
export const PaginationSchema = yup.object({
  page: yup.number()
    .integer('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),
  pageSize: yup.number()
    .integer('Page size must be an integer')
    .min(1, 'Page size must be at least 1')
    .max(100, 'Page size must be at most 100')
    .default(20),
  sortBy: yup.string().optional(),
  sortOrder: yup.string()
    .oneOf(['asc', 'desc'], 'Sort order must be asc or desc')
    .default('asc')
});

export const SearchSchema = yup.object({
  query: yup.string()
    .max(500, 'Search query must be less than 500 characters')
    .optional(),
  filters: yup.object().optional(),
  facets: yup.array(yup.string()).optional()
}).concat(PaginationSchema);

// Validation utilities
export class ValidationUtils {
  static async validateAndTransform<T>(schema: yup.Schema<T>, data: unknown): Promise<T> {
    try {
      return await schema.validate(data, { abortEarly: false, stripUnknown: true });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        throw new ValidationError(error.errors, error.inner);
      }
      throw error;
    }
  }

  static createValidationMiddleware<T>(schema: yup.Schema<T>) {
    return async (data: unknown): Promise<T> => {
      return this.validateAndTransform(schema, data);
    };
  }
}

export class ValidationError extends Error {
  constructor(
    public errors: string[],
    public details: yup.ValidationError[]
  ) {
    super(`Validation failed: ${errors.join(', ')}`);
    this.name = 'ValidationError';
  }

  getFieldErrors(): Record<string, string[]> {
    const fieldErrors: Record<string, string[]> = {};
    
    this.details.forEach(error => {
      if (error.path) {
        if (!fieldErrors[error.path]) {
          fieldErrors[error.path] = [];
        }
        fieldErrors[error.path].push(error.message);
      }
    });
    
    return fieldErrors;
  }
}

// Schema registry for dynamic validation
export class SchemaRegistry {
  private static schemas: Map<string, yup.Schema> = new Map();

  static register(name: string, schema: yup.Schema): void {
    this.schemas.set(name, schema);
  }

  static get(name: string): yup.Schema | undefined {
    return this.schemas.get(name);
  }

  static validate(schemaName: string, data: unknown): Promise<any> {
    const schema = this.get(schemaName);
    if (!schema) {
      throw new Error(`Schema '${schemaName}' not found`);
    }
    return ValidationUtils.validateAndTransform(schema, data);
  }
}

// Register schemas
SchemaRegistry.register('user-registration', UserRegistrationSchema);
SchemaRegistry.register('login', LoginSchema);
SchemaRegistry.register('ml-model', MLModelSchema);
SchemaRegistry.register('pagination', PaginationSchema);
SchemaRegistry.register('search', SearchSchema);