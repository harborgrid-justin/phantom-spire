/**
 * OpenAPI 3.0 Specification Generator
 * Generates complete API documentation for all endpoints
 */

import type { OpenAPIV3 } from 'openapi-types';
import { schemas, CommonResponses, PaginationQuerySchema } from './schemas';

export function generateOpenAPISpec(): OpenAPIV3.Document {
  const openApiSpec: OpenAPIV3.Document = {
    openapi: '3.0.3',
    info: {
      title: 'Phantom ML Studio API',
      version: '2.0.0',
      description: `
# Phantom ML Studio API Documentation

Enterprise-grade machine learning studio with comprehensive cybersecurity intelligence APIs.

## Features

- **Complete ML Pipeline**: Dataset management, model training, deployment, and monitoring
- **Threat Intelligence**: Comprehensive threat actor, CVE, IOC, and malware analysis
- **MITRE ATT&CK Integration**: Full framework integration with tactics, techniques, and subtechniques
- **Advanced Analytics**: Real-time monitoring, risk assessment, and security metrics
- **Phantom-Core Integration**: Modular cybersecurity components for forensics, hunting, and incident response

## Authentication

Most endpoints require authentication via API key or JWT token.

## Rate Limiting

API requests are rate-limited to ensure fair usage and system stability.

## Pagination

List endpoints support pagination with \`page\` and \`limit\` query parameters.
      `,
      contact: {
        name: 'Phantom Spire Team',
        url: 'https://github.com/harborgrid-justin/phantom-spire',
        email: 'support@phantomspire.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.phantomspire.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Core ML',
        description: 'Core machine learning operations'
      },
      {
        name: 'Datasets',
        description: 'Dataset management and analysis'
      },
      {
        name: 'Experiments',
        description: 'ML experiment tracking and management'
      },
      {
        name: 'Models',
        description: 'Model lifecycle management'
      },
      {
        name: 'Deployments',
        description: 'Model deployment and serving'
      },
      {
        name: 'Threat Intelligence',
        description: 'Cybersecurity threat intelligence operations'
      },
      {
        name: 'Threat Actors',
        description: 'APT groups and threat actor management'
      },
      {
        name: 'CVE Management',
        description: 'Common Vulnerabilities and Exposures tracking'
      },
      {
        name: 'IOC Management',
        description: 'Indicators of Compromise management'
      },
      {
        name: 'MITRE ATT&CK',
        description: 'MITRE framework integration'
      },
      {
        name: 'Incidents',
        description: 'Security incident management'
      },
      {
        name: 'Phantom-Cores',
        description: 'Modular cybersecurity components'
      },
      {
        name: 'User Management',
        description: 'User accounts and authentication'
      },
      {
        name: 'Project Management',
        description: 'Project organization and collaboration'
      },
      {
        name: 'Analytics',
        description: 'Advanced analytics and reporting'
      },
      {
        name: 'Documentation',
        description: 'API documentation and specifications'
      }
    ],
    paths: {
      // Core ML Endpoints
      '/api/datasets': {
        get: {
          tags: ['Datasets'],
          summary: 'List all datasets',
          description: 'Retrieve a paginated list of all datasets with optional filtering',
          parameters: [
            ...PaginationQuerySchema,
            {
              name: 'status',
              in: 'query',
              description: 'Filter by dataset status',
              schema: {
                type: 'string',
                enum: ['uploading', 'processing', 'ready', 'error']
              }
            },
            {
              name: 'format',
              in: 'query',
              description: 'Filter by dataset format',
              schema: {
                type: 'string',
                enum: ['CSV', 'JSON', 'PARQUET', 'EXCEL', 'XML', 'AVRO']
              }
            }
          ],
          responses: {
            '200': {
              description: 'List of datasets',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      schemas.BaseResponse,
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: schemas.Dataset
                          },
                          pagination: schemas.Pagination
                        }
                      }
                    ]
                  }
                }
              }
            },
            ...CommonResponses
          }
        },
        post: {
          tags: ['Datasets'],
          summary: 'Create a new dataset',
          description: 'Upload and register a new dataset for ML operations',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: schemas.Dataset
              },
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary'
                    },
                    name: {
                      type: 'string'
                    },
                    description: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Dataset created successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      schemas.BaseResponse,
                      {
                        type: 'object',
                        properties: {
                          data: schemas.Dataset
                        }
                      }
                    ]
                  }
                }
              }
            },
            ...CommonResponses
          }
        }
      },

      '/api/experiments': {
        get: {
          tags: ['Experiments'],
          summary: 'List all experiments',
          description: 'Retrieve a paginated list of ML experiments',
          parameters: [
            ...PaginationQuerySchema,
            {
              name: 'status',
              in: 'query',
              description: 'Filter by experiment status',
              schema: {
                type: 'string',
                enum: ['created', 'running', 'completed', 'failed', 'cancelled']
              }
            },
            {
              name: 'model_type',
              in: 'query',
              description: 'Filter by model type',
              schema: {
                type: 'string',
                enum: ['classification', 'regression', 'clustering', 'anomaly_detection', 'time_series']
              }
            }
          ],
          responses: {
            '200': {
              description: 'List of experiments',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      schemas.BaseResponse,
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: schemas.Experiment
                          },
                          pagination: schemas.Pagination
                        }
                      }
                    ]
                  }
                }
              }
            },
            ...CommonResponses
          }
        },
        post: {
          tags: ['Experiments'],
          summary: 'Create a new experiment',
          description: 'Start a new ML experiment with specified parameters',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: schemas.Experiment
              }
            }
          },
          responses: {
            '201': {
              description: 'Experiment created successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      schemas.BaseResponse,
                      {
                        type: 'object',
                        properties: {
                          data: schemas.Experiment
                        }
                      }
                    ]
                  }
                }
              }
            },
            ...CommonResponses
          }
        }
      },

      // Threat Intelligence Endpoints
      '/api/threat-actors': {
        get: {
          tags: ['Threat Actors'],
          summary: 'List all threat actors',
          description: 'Retrieve a paginated list of threat actors and APT groups',
          parameters: [
            ...PaginationQuerySchema,
            {
              name: 'actor_type',
              in: 'query',
              description: 'Filter by actor type',
              schema: {
                type: 'string',
                enum: ['APT', 'Criminal', 'Hacktivist', 'State-sponsored', 'Insider', 'Script-kiddie', 'Unknown']
              }
            },
            {
              name: 'status',
              in: 'query',
              description: 'Filter by actor status',
              schema: {
                type: 'string',
                enum: ['active', 'inactive', 'dormant', 'unknown', 'neutralized']
              }
            },
            {
              name: 'sophistication_level',
              in: 'query',
              description: 'Filter by sophistication level',
              schema: {
                type: 'string',
                enum: ['minimal', 'intermediate', 'advanced', 'expert']
              }
            }
          ],
          responses: {
            '200': {
              description: 'List of threat actors',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      schemas.BaseResponse,
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: schemas.ThreatActor
                          },
                          pagination: schemas.Pagination
                        }
                      }
                    ]
                  }
                }
              }
            },
            ...CommonResponses
          }
        },
        post: {
          tags: ['Threat Actors'],
          summary: 'Create a new threat actor',
          description: 'Register a new threat actor or APT group',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: schemas.ThreatActor
              }
            }
          },
          responses: {
            '201': {
              description: 'Threat actor created successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      schemas.BaseResponse,
                      {
                        type: 'object',
                        properties: {
                          data: schemas.ThreatActor
                        }
                      }
                    ]
                  }
                }
              }
            },
            ...CommonResponses
          }
        }
      },

      '/api/cves': {
        get: {
          tags: ['CVE Management'],
          summary: 'List all CVEs',
          description: 'Retrieve a paginated list of Common Vulnerabilities and Exposures',
          parameters: [
            ...PaginationQuerySchema,
            {
              name: 'cvss_severity',
              in: 'query',
              description: 'Filter by CVSS severity',
              schema: {
                type: 'string',
                enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE']
              }
            },
            {
              name: 'exploited_in_wild',
              in: 'query',
              description: 'Filter by exploitation status',
              schema: {
                type: 'boolean'
              }
            },
            {
              name: 'has_exploit',
              in: 'query',
              description: 'Filter by exploit availability',
              schema: {
                type: 'boolean'
              }
            }
          ],
          responses: {
            '200': {
              description: 'List of CVEs',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      schemas.BaseResponse,
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: schemas.CVE
                          },
                          pagination: schemas.Pagination
                        }
                      }
                    ]
                  }
                }
              }
            },
            ...CommonResponses
          }
        },
        post: {
          tags: ['CVE Management'],
          summary: 'Create a new CVE record',
          description: 'Register a new Common Vulnerability and Exposure',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: schemas.CVE
              }
            }
          },
          responses: {
            '201': {
              description: 'CVE created successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      schemas.BaseResponse,
                      {
                        type: 'object',
                        properties: {
                          data: schemas.CVE
                        }
                      }
                    ]
                  }
                }
              }
            },
            ...CommonResponses
          }
        }
      },

      '/api/iocs': {
        get: {
          tags: ['IOC Management'],
          summary: 'List all IOCs',
          description: 'Retrieve a paginated list of Indicators of Compromise',
          parameters: [
            ...PaginationQuerySchema,
            {
              name: 'type',
              in: 'query',
              description: 'Filter by IOC type',
              schema: {
                type: 'string',
                enum: ['ip', 'domain', 'url', 'hash_md5', 'hash_sha1', 'hash_sha256', 'email', 'file_name', 'registry_key', 'mutex', 'yara_rule']
              }
            },
            {
              name: 'severity',
              in: 'query',
              description: 'Filter by severity level',
              schema: {
                type: 'string',
                enum: ['info', 'low', 'medium', 'high', 'critical']
              }
            },
            {
              name: 'is_active',
              in: 'query',
              description: 'Filter by active status',
              schema: {
                type: 'boolean'
              }
            }
          ],
          responses: {
            '200': {
              description: 'List of IOCs',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      schemas.BaseResponse,
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: schemas.IOC
                          },
                          pagination: schemas.Pagination
                        }
                      }
                    ]
                  }
                }
              }
            },
            ...CommonResponses
          }
        },
        post: {
          tags: ['IOC Management'],
          summary: 'Create a new IOC',
          description: 'Register a new Indicator of Compromise',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: schemas.IOC
              }
            }
          },
          responses: {
            '201': {
              description: 'IOC created successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      schemas.BaseResponse,
                      {
                        type: 'object',
                        properties: {
                          data: schemas.IOC
                        }
                      }
                    ]
                  }
                }
              }
            },
            ...CommonResponses
          }
        }
      },

      '/api/users': {
        get: {
          tags: ['User Management'],
          summary: 'List all users',
          description: 'Retrieve a paginated list of system users',
          parameters: [
            ...PaginationQuerySchema,
            {
              name: 'role',
              in: 'query',
              description: 'Filter by user role',
              schema: {
                type: 'string',
                enum: ['admin', 'analyst', 'user', 'readonly']
              }
            },
            {
              name: 'is_active',
              in: 'query',
              description: 'Filter by active status',
              schema: {
                type: 'boolean'
              }
            }
          ],
          responses: {
            '200': {
              description: 'List of users',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      schemas.BaseResponse,
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: schemas.User
                          },
                          pagination: schemas.Pagination
                        }
                      }
                    ]
                  }
                }
              }
            },
            ...CommonResponses
          }
        },
        post: {
          tags: ['User Management'],
          summary: 'Create a new user',
          description: 'Register a new system user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: schemas.User
              }
            }
          },
          responses: {
            '201': {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      schemas.BaseResponse,
                      {
                        type: 'object',
                        properties: {
                          data: schemas.User
                        }
                      }
                    ]
                  }
                }
              }
            },
            ...CommonResponses
          }
        }
      },

      '/api/projects': {
        get: {
          tags: ['Project Management'],
          summary: 'List all projects',
          description: 'Retrieve a paginated list of projects',
          parameters: [
            ...PaginationQuerySchema,
            {
              name: 'status',
              in: 'query',
              description: 'Filter by project status',
              schema: {
                type: 'string',
                enum: ['active', 'archived', 'completed', 'on_hold']
              }
            },
            {
              name: 'visibility',
              in: 'query',
              description: 'Filter by visibility level',
              schema: {
                type: 'string',
                enum: ['private', 'team', 'organization', 'public']
              }
            }
          ],
          responses: {
            '200': {
              description: 'List of projects',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      schemas.BaseResponse,
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: schemas.Project
                          },
                          pagination: schemas.Pagination
                        }
                      }
                    ]
                  }
                }
              }
            },
            ...CommonResponses
          }
        },
        post: {
          tags: ['Project Management'],
          summary: 'Create a new project',
          description: 'Create a new collaboration project',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: schemas.Project
              }
            }
          },
          responses: {
            '201': {
              description: 'Project created successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      schemas.BaseResponse,
                      {
                        type: 'object',
                        properties: {
                          data: schemas.Project
                        }
                      }
                    ]
                  }
                }
              }
            },
            ...CommonResponses
          }
        }
      }
    },
    components: {
      schemas: {
        ...schemas,
        // Add common parameter schemas
        PaginationParams: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              default: 1,
              description: 'Page number'
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 20,
              description: 'Items per page'
            },
            sort: {
              type: 'string',
              description: 'Sort field'
            },
            order: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'desc',
              description: 'Sort order'
            }
          }
        }
      },
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
          }
        }
      }
    },
    security: [
      { ApiKeyAuth: [] },
      { BearerAuth: [] }
    ]
  };

  return openApiSpec;
}

export default generateOpenAPISpec;
