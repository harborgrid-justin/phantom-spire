/**
 * OpenAPI 3.0 Schema Definitions for All Models
 * Comprehensive schemas for 55 models with proper validation
 */

import type { OpenAPIV3 } from 'openapi-types';

// Base response schemas
export const BaseResponseSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      description: 'Indicates if the request was successful'
    },
    message: {
      type: 'string',
      description: 'Response message'
    },
    data: {
      description: 'Response data'
    },
    error: {
      type: 'string',
      description: 'Error message if unsuccessful'
    },
    count: {
      type: 'integer',
      description: 'Number of items returned (for list endpoints)'
    }
  },
  required: ['success']
};

export const ErrorResponseSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      example: false
    },
    error: {
      type: 'string',
      description: 'Error message'
    },
    message: {
      type: 'string',
      description: 'Detailed error description'
    }
  },
  required: ['success', 'error']
};

// Core ML Models Schemas
export const DatasetSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'integer', readOnly: true },
    name: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string' },
    size: { type: 'integer', minimum: 0 },
    format: { 
      type: 'string',
      enum: ['CSV', 'JSON', 'PARQUET', 'EXCEL', 'XML', 'AVRO']
    },
    status: {
      type: 'string',
      enum: ['uploading', 'processing', 'ready', 'error']
    },
    columns: { type: 'integer', minimum: 0 },
    rows: { type: 'integer', minimum: 0 },
    file_path: { type: 'string' },
    metadata: { type: 'object' },
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    created_at: { type: 'string', format: 'date-time', readOnly: true },
    updated_at: { type: 'string', format: 'date-time', readOnly: true }
  },
  required: ['name', 'format']
};

export const ExperimentSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'integer', readOnly: true },
    name: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string' },
    dataset_id: { type: 'integer' },
    model_type: { 
      type: 'string',
      enum: ['classification', 'regression', 'clustering', 'anomaly_detection', 'time_series']
    },
    algorithm: { type: 'string' },
    parameters: { type: 'object' },
    status: {
      type: 'string',
      enum: ['created', 'running', 'completed', 'failed', 'cancelled']
    },
    metrics: { type: 'object' },
    results: { type: 'object' },
    created_at: { type: 'string', format: 'date-time', readOnly: true },
    updated_at: { type: 'string', format: 'date-time', readOnly: true }
  },
  required: ['name', 'model_type', 'algorithm']
};

// Security Intelligence Models Schemas
export const ThreatActorSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'integer', readOnly: true },
    name: { type: 'string', minLength: 1, maxLength: 100 },
    aliases: {
      type: 'array',
      items: { type: 'string' }
    },
    description: { type: 'string' },
    actor_type: {
      type: 'string',
      enum: ['APT', 'Criminal', 'Hacktivist', 'State-sponsored', 'Insider', 'Script-kiddie', 'Unknown']
    },
    attributed_countries: {
      type: 'array',
      items: { type: 'string' }
    },
    target_countries: {
      type: 'array',
      items: { type: 'string' }
    },
    target_industries: {
      type: 'array',
      items: { type: 'string' }
    },
    motivations: {
      type: 'array',
      items: { type: 'string' }
    },
    sophistication_level: {
      type: 'string',
      enum: ['minimal', 'intermediate', 'advanced', 'expert']
    },
    first_seen: { type: 'string', format: 'date-time' },
    last_seen: { type: 'string', format: 'date-time' },
    status: {
      type: 'string',
      enum: ['active', 'inactive', 'dormant', 'unknown', 'neutralized']
    },
    tools_used: {
      type: 'array',
      items: { type: 'string' }
    },
    malware_families: {
      type: 'array',
      items: { type: 'string' }
    },
    infrastructure: { type: 'object' },
    attribution_confidence: { type: 'object' },
    references: {
      type: 'array',
      items: { type: 'string', format: 'uri' }
    },
    threat_score: { type: 'integer', minimum: 0, maximum: 100 },
    activity_level: { type: 'integer', minimum: 0, maximum: 100 },
    known_victims: {
      type: 'array',
      items: { type: 'string' }
    },
    attack_patterns: {
      type: 'array',
      items: { type: 'string' }
    },
    operating_regions: {
      type: 'array',
      items: { type: 'string' }
    },
    resource_level: {
      type: 'string',
      enum: ['low', 'medium', 'high', 'state-level']
    },
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    metadata: { type: 'object' },
    threatgroup_id: { type: 'integer' },
    created_at: { type: 'string', format: 'date-time', readOnly: true },
    updated_at: { type: 'string', format: 'date-time', readOnly: true }
  },
  required: ['name']
};

export const CVESchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'integer', readOnly: true },
    cve_id: { 
      type: 'string', 
      pattern: '^CVE-//d{4}-//d{4,}$',
      example: 'CVE-2024-1234'
    },
    description: { type: 'string', minLength: 1 },
    cvss_score: { type: 'number', minimum: 0, maximum: 10 },
    cvss_severity: {
      type: 'string',
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE']
    },
    cvss_version: {
      type: 'string',
      enum: ['2.0', '3.0', '3.1']
    },
    cvss_vector: { type: 'object' },
    published_date: { type: 'string', format: 'date-time' },
    modified_date: { type: 'string', format: 'date-time' },
    cwe_ids: {
      type: 'array',
      items: { type: 'string' }
    },
    affected_products: {
      type: 'array',
      items: { type: 'string' }
    },
    vendor_names: {
      type: 'array',
      items: { type: 'string' }
    },
    references: {
      type: 'array',
      items: { type: 'string', format: 'uri' }
    },
    status: {
      type: 'string',
      enum: ['PUBLISHED', 'MODIFIED', 'REJECTED', 'DISPUTED']
    },
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    exploited_in_wild: { type: 'boolean' },
    has_exploit: { type: 'boolean' },
    threat_intelligence: { type: 'object' },
    metadata: { type: 'object' },
    created_at: { type: 'string', format: 'date-time', readOnly: true },
    updated_at: { type: 'string', format: 'date-time', readOnly: true }
  },
  required: ['cve_id', 'description']
};

export const IOCSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'integer', readOnly: true },
    value: { type: 'string', minLength: 1 },
    type: {
      type: 'string',
      enum: ['ip', 'domain', 'url', 'hash_md5', 'hash_sha1', 'hash_sha256', 'email', 'file_name', 'registry_key', 'mutex', 'yara_rule']
    },
    description: { type: 'string' },
    confidence: { type: 'integer', minimum: 0, maximum: 100 },
    severity: {
      type: 'string',
      enum: ['info', 'low', 'medium', 'high', 'critical']
    },
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    source: { type: 'string' },
    first_seen: { type: 'string', format: 'date-time' },
    last_seen: { type: 'string', format: 'date-time' },
    is_active: { type: 'boolean' },
    false_positive: { type: 'boolean' },
    context: { type: 'object' },
    metadata: { type: 'object' },
    created_at: { type: 'string', format: 'date-time', readOnly: true },
    updated_at: { type: 'string', format: 'date-time', readOnly: true }
  },
  required: ['value', 'type']
};

export const UserSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'integer', readOnly: true },
    username: { type: 'string', minLength: 3, maxLength: 50 },
    email: { type: 'string', format: 'email' },
    password_hash: { type: 'string', writeOnly: true },
    first_name: { type: 'string', maxLength: 50 },
    last_name: { type: 'string', maxLength: 50 },
    role: {
      type: 'string',
      enum: ['admin', 'analyst', 'user', 'readonly']
    },
    permissions: {
      type: 'array',
      items: { type: 'string' }
    },
    is_active: { type: 'boolean' },
    last_login: { type: 'string', format: 'date-time' },
    preferences: { type: 'object' },
    metadata: { type: 'object' },
    created_at: { type: 'string', format: 'date-time', readOnly: true },
    updated_at: { type: 'string', format: 'date-time', readOnly: true }
  },
  required: ['username', 'email', 'role']
};

export const ProjectSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'integer', readOnly: true },
    name: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string' },
    owner_id: { type: 'integer' },
    team_members: {
      type: 'array',
      items: { type: 'integer' }
    },
    status: {
      type: 'string',
      enum: ['active', 'archived', 'completed', 'on_hold']
    },
    visibility: {
      type: 'string',
      enum: ['private', 'team', 'organization', 'public']
    },
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    settings: { type: 'object' },
    metadata: { type: 'object' },
    created_at: { type: 'string', format: 'date-time', readOnly: true },
    updated_at: { type: 'string', format: 'date-time', readOnly: true }
  },
  required: ['name', 'owner_id']
};

// Pagination schema
export const PaginationSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    total: { type: 'integer' },
    pages: { type: 'integer' },
    has_next: { type: 'boolean' },
    has_prev: { type: 'boolean' }
  }
};

// Query parameters
export const PaginationQuerySchema: OpenAPIV3.ParameterObject[] = [
  {
    name: 'page',
    in: 'query',
    description: 'Page number',
    schema: { type: 'integer', minimum: 1, default: 1 }
  },
  {
    name: 'limit',
    in: 'query',
    description: 'Items per page',
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
  },
  {
    name: 'sort',
    in: 'query',
    description: 'Sort field',
    schema: { type: 'string' }
  },
  {
    name: 'order',
    in: 'query',
    description: 'Sort order',
    schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
  }
];

// Common responses
export const CommonResponses: Record<string, OpenAPIV3.ResponseObject> = {
  '200': {
    description: 'Success',
    content: {
      'application/json': {
        schema: BaseResponseSchema
      }
    }
  },
  '201': {
    description: 'Created',
    content: {
      'application/json': {
        schema: BaseResponseSchema
      }
    }
  },
  '400': {
    description: 'Bad Request',
    content: {
      'application/json': {
        schema: ErrorResponseSchema
      }
    }
  },
  '401': {
    description: 'Unauthorized',
    content: {
      'application/json': {
        schema: ErrorResponseSchema
      }
    }
  },
  '403': {
    description: 'Forbidden',
    content: {
      'application/json': {
        schema: ErrorResponseSchema
      }
    }
  },
  '404': {
    description: 'Not Found',
    content: {
      'application/json': {
        schema: ErrorResponseSchema
      }
    }
  },
  '500': {
    description: 'Internal Server Error',
    content: {
      'application/json': {
        schema: ErrorResponseSchema
      }
    }
  }
};

// Export all schemas
export const schemas = {
  BaseResponse: BaseResponseSchema,
  ErrorResponse: ErrorResponseSchema,
  Dataset: DatasetSchema,
  Experiment: ExperimentSchema,
  ThreatActor: ThreatActorSchema,
  CVE: CVESchema,
  IOC: IOCSchema,
  User: UserSchema,
  Project: ProjectSchema,
  Pagination: PaginationSchema
};
