/**
 * Enterprise Input Validation System
 * Comprehensive validation using Zod with custom validators for ML domain
 */

import { z } from 'zod';

// Custom error class for validation errors
export class ValidationError extends Error {
  public readonly code = 'VALIDATION_ERROR';
  public readonly field?: string;
  public readonly value?: unknown;
  public readonly issues: ValidationIssue[];

  constructor(message: string, issues: ValidationIssue[] = [], field?: string, value?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.issues = issues;
    this.field = field;
    this.value = value;
  }
}

// Validation issue interface
export interface ValidationIssue {
  code: string;
  message: string;
  path: (string | number)[];
  field?: string;
  value?: unknown;
  expected?: unknown;
}

// Base validation schemas
export const BaseValidationSchemas = {
  // Common data types
  id: z.string().uuid('Invalid UUID format'),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  email: z.string().email('Invalid email format'),
  url: z.string().url('Invalid URL format'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Invalid version format (expected x.y.z)'),
  
  // Date and time
  isoDate: z.string().datetime('Invalid ISO date format'),
  timestamp: z.number().int().positive('Invalid timestamp'),
  
  // Numeric constraints
  percentage: z.number().min(0).max(100),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonNegativeNumber: z.number().min(0, 'Must be non-negative'),
  
  // String constraints
  nonEmptyString: z.string().min(1, 'Cannot be empty'),
  trimmedString: z.string().trim(),
  alphanumeric: z.string().regex(/^[a-zA-Z0-9]+$/, 'Must contain only letters and numbers'),
  
  // Arrays
  nonEmptyArray: <T>(schema: z.ZodSchema<T>) => z.array(schema).min(1, 'Array cannot be empty'),
  uniqueArray: <T>(schema: z.ZodSchema<T>) => z.array(schema).superRefine((val, ctx) => {
    const unique = Array.from(new Set(val));
    if (unique.length !== val.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Array must contain unique values',
      });
    }
  }),
};

// ML-specific validation schemas
export const MLValidationSchemas = {
  // Model types
  modelType: z.enum([
    'classification',
    'regression',
    'clustering',
    'anomaly-detection',
    'time-series',
    'nlp',
    'computer-vision',
    'recommendation',
    'reinforcement-learning',
  ]),
  
  // Algorithm names
  algorithm: z.enum([
    'linear-regression',
    'logistic-regression',
    'random-forest',
    'gradient-boosting',
    'xgboost',
    'lightgbm',
    'svm',
    'neural-network',
    'cnn',
    'rnn',
    'lstm',
    'transformer',
    'k-means',
    'dbscan',
    'isolation-forest',
    'one-class-svm',
  ]),
  
  // Data types
  dataType: z.enum(['numerical', 'categorical', 'text', 'image', 'audio', 'video', 'time-series']),
  
  // Model metrics
  accuracy: z.number().min(0).max(1),
  precision: z.number().min(0).max(1),
  recall: z.number().min(0).max(1),
  f1Score: z.number().min(0).max(1),
  auc: z.number().min(0).max(1),
  rmse: z.number().min(0),
  mae: z.number().min(0),
  r2Score: z.number().min(-1).max(1),
  
  // Hyperparameters
  learningRate: z.number().min(0.0001).max(1),
  batchSize: z.number().int().min(1).max(10000),
  epochs: z.number().int().min(1).max(10000),
  maxDepth: z.number().int().min(1).max(50),
  nEstimators: z.number().int().min(1).max(10000),
  regularization: z.number().min(0).max(10),
  
  // Feature engineering
  featureName: z.string().min(1).max(100).regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Invalid feature name'),
  transformationType: z.enum([
    'standardize',
    'normalize',
    'min-max-scale',
    'robust-scale',
    'quantile-transform',
    'power-transform',
    'one-hot-encode',
    'label-encode',
    'target-encode',
    'ordinal-encode',
  ]),
  
  // Dataset validation
  datasetSplit: z.object({
    train: BaseValidationSchemas.percentage,
    validation: BaseValidationSchemas.percentage,
    test: BaseValidationSchemas.percentage,
  }).refine(
    (data) => Math.abs(data.train + data.validation + data.test - 100) < 0.01,
    {
      message: 'Split percentages must sum to 100',
      path: ['split'],
    }
  ),
  
  // Model configuration
  modelConfig: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    algorithm: MLValidationSchemas.algorithm,
    hyperparameters: z.record(z.unknown()),
    features: z.array(MLValidationSchemas.featureName).min(1),
    target: MLValidationSchemas.featureName.optional(),
    metrics: z.array(z.string()).optional(),
  }),
};

// API validation schemas
export const APIValidationSchemas = {
  // Pagination
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(1000).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
  
  // Filtering
  dateRange: z.object({
    start: BaseValidationSchemas.isoDate.optional(),
    end: BaseValidationSchemas.isoDate.optional(),
  }).refine(
    (data) => !data.start || !data.end || new Date(data.start) <= new Date(data.end),
    {
      message: 'Start date must be before or equal to end date',
      path: ['dateRange'],
    }
  ),
  
  // Search
  search: z.object({
    query: z.string().min(1).max(500),
    fields: z.array(z.string()).optional(),
    fuzzy: z.boolean().default(false),
    exact: z.boolean().default(false),
  }),
  
  // Batch operations
  batchOperation: z.object({
    operation: z.enum(['create', 'update', 'delete']),
    items: z.array(z.unknown()).min(1).max(1000),
    options: z.record(z.unknown()).optional(),
  }),
  
  // File upload
  fileUpload: z.object({
    filename: z.string().min(1).max(255),
    size: z.number().int().min(1).max(100 * 1024 * 1024), // 100MB max
    mimetype: z.string().regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/, 'Invalid MIME type'),
    encoding: z.string().optional(),
  }),
  
  // API response validation
  apiResponse: z.object({
    success: z.boolean(),
    data: z.unknown().optional(),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.unknown().optional(),
    }).optional(),
    metadata: z.object({
      timestamp: BaseValidationSchemas.isoDate,
      requestId: BaseValidationSchemas.id,
      version: BaseValidationSchemas.version,
    }),
  }),
};

// Model-specific validation schemas
export const ModelValidationSchemas = {
  // Model creation
  createModel: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    type: MLValidationSchemas.modelType,
    algorithm: MLValidationSchemas.algorithm,
    tags: z.array(z.string()).max(20).optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  
  // Model training
  trainModel: z.object({
    modelId: BaseValidationSchemas.id,
    datasetId: BaseValidationSchemas.id,
    config: z.object({
      hyperparameters: z.record(z.unknown()),
      crossValidation: z.object({
        folds: z.number().int().min(2).max(20).default(5),
        stratify: z.boolean().default(true),
      }).optional(),
      earlystopping: z.object({
        patience: z.number().int().min(1).max(100).default(10),
        minDelta: z.number().min(0).default(0.001),
      }).optional(),
      callbacks: z.array(z.string()).optional(),
    }),
    split: MLValidationSchemas.datasetSplit.optional(),
  }),
  
  // Model prediction
  predict: z.object({
    modelId: BaseValidationSchemas.id,
    data: z.union([
      z.array(z.record(z.unknown())),
      z.record(z.unknown()),
    ]),
    options: z.object({
      returnProbabilities: z.boolean().default(false),
      explainPredictions: z.boolean().default(false),
      batchSize: MLValidationSchemas.batchSize.optional(),
    }).optional(),
  }),
  
  // Model evaluation
  evaluate: z.object({
    modelId: BaseValidationSchemas.id,
    datasetId: BaseValidationSchemas.id,
    metrics: z.array(z.string()).optional(),
    options: z.object({
      detailed: z.boolean().default(false),
      saveResults: z.boolean().default(true),
    }).optional(),
  }),
  
  // Model deployment
  deploy: z.object({
    modelId: BaseValidationSchemas.id,
    environment: z.enum(['staging', 'production']),
    config: z.object({
      replicas: z.number().int().min(1).max(100).default(1),
      resources: z.object({
        cpu: z.string().regex(/^\d+m?$/, 'Invalid CPU format'),
        memory: z.string().regex(/^\d+[KMGT]i?$/, 'Invalid memory format'),
        gpu: z.number().int().min(0).optional(),
      }).optional(),
      scaling: z.object({
        minReplicas: z.number().int().min(1).default(1),
        maxReplicas: z.number().int().min(1).max(100).default(10),
        targetCPU: BaseValidationSchemas.percentage.default(70),
        targetMemory: BaseValidationSchemas.percentage.default(80),
      }).optional(),
      monitoring: z.object({
        enabled: z.boolean().default(true),
        alertThreshold: BaseValidationSchemas.percentage.default(95),
        healthCheckInterval: z.number().int().min(10).max(3600).default(30),
      }).optional(),
    }).optional(),
  }),
};

// Dataset validation schemas
export const DatasetValidationSchemas = {
  // Dataset creation
  createDataset: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    type: MLValidationSchemas.dataType,
    source: z.object({
      type: z.enum(['upload', 'url', 'database', 's3', 'bigquery']),
      location: z.string(),
      credentials: z.record(z.string()).optional(),
      query: z.string().optional(),
    }),
    schema: z.object({
      columns: z.array(z.object({
        name: MLValidationSchemas.featureName,
        type: MLValidationSchemas.dataType,
        nullable: z.boolean().default(true),
        unique: z.boolean().default(false),
        description: z.string().optional(),
      })).min(1),
      primaryKey: MLValidationSchemas.featureName.optional(),
      target: MLValidationSchemas.featureName.optional(),
    }),
    tags: z.array(z.string()).max(20).optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  
  // Data preprocessing
  preprocess: z.object({
    datasetId: BaseValidationSchemas.id,
    transformations: z.array(z.object({
      type: MLValidationSchemas.transformationType,
      columns: z.array(MLValidationSchemas.featureName),
      parameters: z.record(z.unknown()).optional(),
    })).min(1),
    validation: z.object({
      checkMissing: z.boolean().default(true),
      checkDuplicates: z.boolean().default(true),
      checkOutliers: z.boolean().default(true),
      checkTypes: z.boolean().default(true),
    }).optional(),
  }),
  
  // Data validation
  validateData: z.object({
    data: z.array(z.record(z.unknown())).min(1),
    schema: z.object({
      columns: z.array(z.object({
        name: z.string(),
        type: z.string(),
        nullable: z.boolean(),
        unique: z.boolean(),
        constraints: z.record(z.unknown()).optional(),
      })),
    }),
    options: z.object({
      strict: z.boolean().default(false),
      skipInvalid: z.boolean().default(false),
      maxErrors: z.number().int().min(1).max(1000).default(100),
    }).optional(),
  }),
};

// Experiment validation schemas
export const ExperimentValidationSchemas = {
  // Create experiment
  createExperiment: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    objective: z.enum(['maximize', 'minimize']),
    metric: z.string().min(1).max(50),
    budget: z.object({
      maxTrials: z.number().int().min(1).max(10000).default(100),
      maxTime: z.number().int().min(60).optional(), // seconds
      maxCost: z.number().min(0).optional(),
    }).optional(),
    searchSpace: z.record(z.object({
      type: z.enum(['choice', 'uniform', 'loguniform', 'normal', 'lognormal', 'int']),
      low: z.number().optional(),
      high: z.number().optional(),
      choices: z.array(z.unknown()).optional(),
      mean: z.number().optional(),
      sigma: z.number().optional(),
    })),
    tags: z.array(z.string()).max(20).optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  
  // Create trial
  createTrial: z.object({
    experimentId: BaseValidationSchemas.id,
    parameters: z.record(z.unknown()),
    metadata: z.record(z.unknown()).optional(),
  }),
  
  // Report trial result
  reportResult: z.object({
    trialId: BaseValidationSchemas.id,
    metrics: z.record(z.number()),
    artifacts: z.record(z.string()).optional(),
    logs: z.string().optional(),
    status: z.enum(['completed', 'failed', 'cancelled']),
  }),
};

// User and authentication validation schemas
export const AuthValidationSchemas = {
  // User registration
  register: z.object({
    email: BaseValidationSchemas.email,
    password: z.string().min(8).max(128)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
    confirmPassword: z.string(),
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    organization: z.string().max(100).optional(),
    role: z.enum(['user', 'admin', 'analyst', 'data-scientist']).default('user'),
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  ),
  
  // User login
  login: z.object({
    email: BaseValidationSchemas.email,
    password: z.string().min(1),
    rememberMe: z.boolean().default(false),
  }),
  
  // Password reset
  resetPassword: z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(128),
    confirmPassword: z.string(),
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  ),
  
  // Update profile
  updateProfile: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    organization: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    avatar: z.string().url().optional(),
    preferences: z.record(z.unknown()).optional(),
  }),
};

// Validation utility functions
export class ValidationUtils {
  // Convert Zod error to ValidationError
  static fromZodError(error: z.ZodError): ValidationError {
    const issues: ValidationIssue[] = error.issues.map(issue => ({
      code: issue.code,
      message: issue.message,
      path: issue.path,
      field: issue.path.join('.'),
      value: issue.received || issue.input,
      expected: issue.expected,
    }));

    const mainIssue = issues[0];
    const message = mainIssue 
      ? `Validation failed for field '${mainIssue.field}': ${mainIssue.message}`
      : 'Validation failed';

    return new ValidationError(message, issues, mainIssue?.field, mainIssue?.value);
  }

  // Validate data with enhanced error reporting
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw ValidationUtils.fromZodError(error);
      }
      throw error;
    }
  }

  // Safe validation that returns result and errors
  static safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    error?: ValidationError;
  } {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: ValidationUtils.fromZodError(error) };
      }
      return { success: false, error: new ValidationError('Unknown validation error') };
    }
  }

  // Validate partial data (useful for updates)
  static validatePartial<T>(schema: z.ZodSchema<T>, data: unknown): Partial<T> {
    const partialSchema = schema.partial();
    return ValidationUtils.validate(partialSchema, data);
  }

  // Validate array with detailed error reporting
  static validateArray<T>(schema: z.ZodSchema<T>, data: unknown[]): {
    valid: T[];
    invalid: Array<{ index: number; data: unknown; error: ValidationError }>;
  } {
    const valid: T[] = [];
    const invalid: Array<{ index: number; data: unknown; error: ValidationError }> = [];

    data.forEach((item, index) => {
      const result = ValidationUtils.safeValidate(schema, item);
      if (result.success && result.data !== undefined) {
        valid.push(result.data);
      } else if (result.error) {
        invalid.push({ index, data: item, error: result.error });
      }
    });

    return { valid, invalid };
  }

  // Create custom validation schema with error messages
  static createCustomValidator<T>(
    name: string,
    validator: (data: unknown) => T,
    errorMessage: string = `Invalid ${name}`
  ): z.ZodSchema<T> {
    return z.unknown().transform((data, ctx) => {
      try {
        return validator(data);
      } catch (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error instanceof Error ? error.message : errorMessage,
        });
        return z.NEVER;
      }
    });
  }

  // Validate file uploads
  static validateFile(
    file: { name: string; size: number; type: string },
    options: {
      maxSize?: number;
      allowedTypes?: string[];
      allowedExtensions?: string[];
    } = {}
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const { maxSize = 10 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options;

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size ${file.size} exceeds maximum allowed size ${maxSize}`);
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type '${file.type}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file extension
    if (allowedExtensions.length > 0) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !allowedExtensions.includes(extension)) {
        errors.push(`File extension '${extension}' is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // Sanitize input data
  static sanitize(data: unknown): unknown {
    if (typeof data === 'string') {
      return data.trim().replace(/[<>]/g, ''); // Basic XSS prevention
    }
    
    if (Array.isArray(data)) {
      return data.map(item => ValidationUtils.sanitize(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = ValidationUtils.sanitize(value);
      }
      return sanitized;
    }
    
    return data;
  }

  // Validate and sanitize input
  static validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const sanitized = ValidationUtils.sanitize(data);
    return ValidationUtils.validate(schema, sanitized);
  }
}

// Export all schemas as a convenience object
export const ValidationSchemas = {
  Base: BaseValidationSchemas,
  ML: MLValidationSchemas,
  API: APIValidationSchemas,
  Model: ModelValidationSchemas,
  Dataset: DatasetValidationSchemas,
  Experiment: ExperimentValidationSchemas,
  Auth: AuthValidationSchemas,
};

// Middleware factory for Next.js API routes
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (handler: (req: { body: T; query: any }, res: any) => Promise<void>) => {
    return async (req: any, res: any) => {
      try {
        // Validate request body
        req.body = ValidationUtils.validateAndSanitize(schema, req.body);
        return await handler(req, res);
      } catch (error) {
        if (error instanceof ValidationError) {
          return res.status(400).json({
            success: false,
            error: {
              code: error.code,
              message: error.message,
              field: error.field,
              issues: error.issues,
            },
          });
        }
        
        // Handle other errors
        return res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
          },
        });
      }
    };
  };
}

// Export main validation utility
export const validator = ValidationUtils;