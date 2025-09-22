/**
 * Enterprise Input Validation and Sanitization
 * Comprehensive security-first validation system
 * OWASP compliant with threat protection
 */

import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';
import { z } from 'zod';

export class InputValidator {
  private static instance: InputValidator;
  private validationRules: Map<string, z.ZodSchema> = new Map();

  private constructor() {
    this.initializeStandardRules();
  }

  public static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator();
    }
    return InputValidator.instance;
  }

  private initializeStandardRules(): void {
    // ML Model related validations
    this.validationRules.set('modelName', z.string()
      .min(3, 'Model name must be at least 3 characters')
      .max(100, 'Model name must be less than 100 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Model name must contain only alphanumeric characters, hyphens, and underscores')
    );

    this.validationRules.set('modelType', z.enum([
      'classification', 'regression', 'clustering', 'dimensionality_reduction',
      'anomaly_detection', 'time_series', 'deep_learning', 'reinforcement_learning'
    ]));

    this.validationRules.set('datasetPath', z.string()
      .refine(path => !path.includes('..'), 'Path traversal not allowed')
      .refine(path => validator.matches(path, /^[a-zA-Z0-9//._-]+$/), 'Invalid characters in path')
    );

    // User input validations
    this.validationRules.set('email', z.string().email('Invalid email format'));
    
    this.validationRules.set('userId', z.string()
      .uuid('Invalid user ID format')
    );

    // Configuration validations
    this.validationRules.set('jsonConfig', z.object({}).passthrough()
      .refine(config => JSON.stringify(config).length < 10000, 'Configuration too large')
    );

    // File upload validations
    this.validationRules.set('fileName', z.string()
      .min(1, 'Filename cannot be empty')
      .max(255, 'Filename too long')
      .refine(name => !name.includes('..'), 'Path traversal not allowed')
      .refine(name => !/[<>:"|?*]/.test(name), 'Invalid characters in filename')
    );
  }

  /**
   * Sanitize HTML input to prevent XSS attacks
   */
  public sanitizeHtml(input: string): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }

  /**
   * Sanitize SQL input to prevent SQL injection
   */
  public sanitizeSql(input: string): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }
    
    // Remove dangerous SQL keywords and characters
    const dangerousPatterns = [
      /('|(//'))/gi,
      /(;|--|/s*(union|select|insert|update|delete|drop|create|alter|exec|execute)/s+)/gi,
      /(/s*(or|and)/s+/d+/s*=/s*/d+)/gi
    ];

    let sanitized = input;
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return validator.escape(sanitized);
  }

  /**
   * Validate input against predefined schema
   */
  public validate<T>(ruleKey: string, input: unknown): T {
    const rule = this.validationRules.get(ruleKey);
    if (!rule) {
      throw new Error(`Validation rule '${ruleKey}' not found`);
    }

    const result = rule.safeParse(input);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.errors.map(e => e.message).join(', ')}`);
    }

    return result.data as T;
  }

  /**
   * Add custom validation rule
   */
  public addRule(key: string, schema: z.ZodSchema): void {
    this.validationRules.set(key, schema);
  }

  /**
   * Comprehensive input sanitization
   */
  public sanitizeInput(input: unknown): unknown {
    if (typeof input === 'string') {
      // Basic string sanitization
      let sanitized = input.trim();
      sanitized = this.sanitizeHtml(sanitized);
      sanitized = validator.escape(sanitized);
      return sanitized;
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    
    if (input && typeof input === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(input)) {
        const sanitizedKey = this.sanitizeInput(key) as string;
        sanitized[sanitizedKey] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  }

  /**
   * Validate file upload security
   */
  public validateFileUpload(file: {
    name: string;
    size: number;
    mimetype: string;
  }): boolean {
    // Check file name
    this.validate('fileName', file.name);
    
    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      throw new Error('File size exceeds 100MB limit');
    }
    
    // Check allowed MIME types for ML data
    const allowedTypes = [
      'text/csv',
      'application/json',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/x-parquet'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} not allowed`);
    }
    
    return true;
  }

  /**
   * Validate API parameters
   */
  public validateApiParams(params: Record<string, unknown>, requiredFields: string[]): Record<string, unknown> {
    const sanitized = this.sanitizeInput(params) as Record<string, unknown>;
    
    // Check required fields
    for (const field of requiredFields) {
      if (!(field in sanitized) || sanitized[field] === undefined || sanitized[field] === null) {
        throw new Error(`Required field '${field}' is missing`);
      }
    }
    
    return sanitized;
  }

  /**
   * Rate limiting key validation
   */
  public validateRateLimitKey(key: string): string {
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid rate limit key');
    }
    
    // Remove any non-alphanumeric characters except dash and underscore
    return key.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 100);
  }
}

// Export singleton instance
export const inputValidator = InputValidator.getInstance();